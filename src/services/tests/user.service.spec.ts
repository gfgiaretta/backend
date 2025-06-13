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
import { PresignedService } from '../presigned.service';
import {
  mockTestPost,
  mockTestPostSaved,
} from '../../../test/fixture/post.mock';
import { mockTestUserProfile } from '../../../test/fixture/userProfile.mock';
import { mockTestLibrarySaved } from '../../../test/fixture/library.mock';

jest.mock('@aws-sdk/client-s3');

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;
  let presignedService: PresignedService;

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
        {
          provide: PresignedService,
          useValue: {
            getUploadURL: jest
              .fn()
              .mockResolvedValue('https://signedUploadUrl.com'),
            getDownloadURL: jest
              .fn()
              .mockResolvedValue('https://signedDownloadUrl.com'),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
    presignedService = module.get<PresignedService>(PresignedService);
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

  describe('getUserProfile', () => {
    it('should return user profile', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockTestUser);
      jest
        .spyOn(prisma.post, 'findMany')
        .mockResolvedValue([mockTestPost, mockTestPostSaved]);
      jest
        .spyOn(presignedService, 'getDownloadURL')
        .mockResolvedValue('https://example.com/presigned-url');

      const result = await service.getUserProfile(mockTestUser.user_id);

      expect(result).toEqual(mockTestUserProfile);
    });

    it('should throw exception if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(
        service.getUserProfile(mockTestUser.user_id),
      ).rejects.toThrow(
        new HttpException('User not found.', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('updateUserStreak', () => {
    it('should increase the user streak if they have done a streak in the last day', async () => {
      // TODO
      expect(false).toBe(true);
    });

    it('should reset the user streak if they have not done a streak in the last day', async () => {
      // TODO
      expect(false).toBe(true);
    });

    it('should throw if user is not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(
        service.updateUserStreak('nonExistentUserId'),
      ).rejects.toThrow(
        new HttpException('User not found.', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('getUserSavedItems', () => {
    it('should return a list with saved post and library ordered by updatedAt', async () => {
      const mockUserId = mockTestUser.user_id;

      const user = {
        ...mockTestUser,
        user_savedLibrary: [
          {
            library: mockTestLibrarySaved,
            deletedAt: null,
          },
        ],
        user_savedPost: [
          {
            post: mockTestPostSaved,
            deletedAt: null,
          },
        ],
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user);

      const result = await service.getUserSavedItems(mockUserId);

      expect(Array.isArray(result)).toBe(true);
      // eslint-disable-next-line no-magic-numbers
      expect(result.length).toBe(2);

      const hasPost = result.some((item) => 'post_id' in item);
      const hasLibrary = result.some((item) => 'library_id' in item);

      expect(hasPost).toBe(true);
      expect(hasLibrary).toBe(true);

      expect(result[0].updatedAt.getTime()).toBeGreaterThanOrEqual(
        result[1].updatedAt.getTime(),
      );
    });

    it('should return an empty array', async () => {
      const mockUserId = mockTestUser.user_id;

      const user = {
        ...mockTestUser,
        user_savedLibrary: [],
        user_savedPost: [],
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user);

      const result = await service.getUserSavedItems(mockUserId);

      expect(result).toEqual([]);
    });
    it('should throw an exception if user is not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.getUserStreak('nonExistentUserId')).rejects.toThrow(
        new HttpException('User not found.', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('getUserStreak', () => {
    it('should retrieve the user streak', async () => {
      // TODO
      expect(false).toBe(true);
    });

    it('should throw if user is not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.getUserStreak('nonExistentUserId')).rejects.toThrow(
        new HttpException('User not found.', HttpStatus.NOT_FOUND),
      );
    });
  });
});
