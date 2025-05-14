import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { PrismaService } from '../prisma.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import {
  mockTestUser,
  mockCreateUserDto,
  mockUserInterestDto,
} from '../../../test/fixture/user.mock';
import {
  mockInterest,
  mockInterestList,
} from '../../../test/fixture/interest.mock';
import { HashService } from '../hash.service';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        PrismaService,
        {
          provide: HashService,
          useValue: {
            hash: jest.fn().mockResolvedValue('hashedPassword'),
            compare: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValue({
        ...mockTestUser,
        email: mockCreateUserDto.email,
        name: mockCreateUserDto.name,
        password: 'hashedPassword',
      });

      const result = await service.create(mockCreateUserDto);

      expect(result).toEqual({
        userId: mockTestUser.user_id,
      });
    });

    it('should throw if user already exists', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(mockTestUser);

      await expect(service.create(mockCreateUserDto)).rejects.toThrow(
        new HttpException('User already exists', HttpStatus.CONFLICT),
      );
    });
  });

  describe('updateUserInterests', () => {
    const mockUserId = mockTestUser.user_id;
    const validInterestIds = mockUserInterestDto.interest;

    it('should update interests successfully', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockTestUser);
      jest
        .spyOn(prisma.interest, 'findMany')
        .mockResolvedValue(mockInterestList);
      jest
        .spyOn(prisma.userInterest, 'deleteMany')
        .mockResolvedValue({ count: 3 });
      jest
        .spyOn(prisma.userInterest, 'createMany')
        .mockResolvedValue({ count: 3 });

      const result = await service.updateUserInterests(
        mockUserId,
        mockUserInterestDto,
      );

      expect(result).toEqual({
        userId: mockUserId,
        interests: validInterestIds,
      });
    });

    it('should throw if not exactly 3 interests are provided', async () => {
      const dto = { interest: ['int001', 'int002'] };
      await expect(
        service.updateUserInterests(mockUserId, dto),
      ).rejects.toThrow(
        new HttpException(
          'Exactly 3 interests are required.',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw if duplicate interest IDs are provided', async () => {
      const dto = { interest: ['int001', 'int001', 'int002'] };
      await expect(
        service.updateUserInterests(mockUserId, dto),
      ).rejects.toThrow(
        new HttpException(
          'Duplicate interest IDs are not allowed.',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw if user is not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(
        service.updateUserInterests(mockUserId, mockUserInterestDto),
      ).rejects.toThrow(
        new HttpException('User not found.', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw if some interest IDs do not exist', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockTestUser);
      jest
        .spyOn(prisma.interest, 'findMany')
        .mockResolvedValue([mockInterest('int001'), mockInterest('int002')]);

      await expect(
        service.updateUserInterests(mockUserId, mockUserInterestDto),
      ).rejects.toThrow(
        new HttpException(
          'One or more provided interest IDs do not found.',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });
});
