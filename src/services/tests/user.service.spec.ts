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
import { mockTestUserExercise } from '../../../test/fixture/userExercise.mock';

jest.mock('@aws-sdk/client-s3');

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

      const result = await service.getUserProfile(mockTestUser.user_id);

      expect(result).toEqual(mockTestUserProfile);
    });

    it('should throw exception if user not found.', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(
        service.getUserProfile(mockTestUser.user_id),
      ).rejects.toThrow(
        new HttpException('User not found.', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('updateUserStreak', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2025-06-02T10:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should increase the user streak if they have done a streak in the last day', async () => {
      const yesterday = new Date('2025-06-01T08:00:00Z');
      const today = new Date('2025-06-02T10:00:00Z');

      const user = {
        ...mockTestUser,
        updatedAt: yesterday,
        streak: 1,
      };

      const latestExercise = {
        ...mockTestUserExercise,
        createdAt: today,
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user);
      jest
        .spyOn(prisma.userExercise, 'findFirst')
        .mockResolvedValue(latestExercise);
      const updateSpy = jest
        .spyOn(prisma.user, 'update')
        .mockResolvedValue({ ...user, streak: 2 });

      await service.updateUserStreak(user.user_id);

      expect(updateSpy).toHaveBeenCalledTimes(1);

      const calledArgs = updateSpy.mock.calls[0][0];
      expect(calledArgs).toMatchObject({
        where: { user_id: user.user_id },
        data: { streak: 2 },
      });
    });

    it('should reset the user streak if they have not done a streak in the last day', async () => {
      const threeDaysAgo = new Date('2025-05-30T10:00:00Z');

      const user = {
        ...mockTestUser,
        updatedAt: threeDaysAgo,
        streak: 3,
      };

      const latestExercise = {
        ...mockTestUserExercise,
        createdAt: threeDaysAgo,
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user);
      jest
        .spyOn(prisma.userExercise, 'findFirst')
        .mockResolvedValue(latestExercise);
      const updateSpy = jest
        .spyOn(prisma.user, 'update')
        .mockResolvedValue({ ...user, streak: 0 });

      await service.updateUserStreak(user.user_id);

      expect(updateSpy).toHaveBeenCalledTimes(1);

      const calledArgs = updateSpy.mock.calls[0][0];
      expect(calledArgs).toMatchObject({
        where: { user_id: user.user_id },
        data: { streak: 0 },
      });
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

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
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
      } as any);

      jest.spyOn(presignedService, 'getDownloadURL').mockResolvedValue('https://example.com/presigned-url');

      const result = await service.getUserSavedItems(mockUserId);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);

      const hasPost = result.some(item => 'post_id' in item);
      const hasLibrary = result.some(item => 'library_id' in item);

      expect(hasPost).toBe(true);
      expect(hasLibrary).toBe(true);

      expect(result[0].updatedAt.getTime()).toBeGreaterThanOrEqual(result[1].updatedAt.getTime());
    });

    it('should return an empty array', async () => {
      const mockUserId = mockTestUser.user_id;

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        user_savedLibrary: [],
        user_savedPost: [],
      } as any);

      jest.spyOn(presignedService, 'getDownloadURL').mockResolvedValue('https://example.com/presigned-url');

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
      const today = new Date('2025-06-02T10:00:00Z');

      const user = {
        ...mockTestUser,
        streak: 5,
      };

      const latestExercise = {
        ...mockTestUserExercise,
        createdAt: today,
      };

      jest
        .spyOn(prisma.user, 'findUnique')
        .mockResolvedValue({ ...mockTestUser, streak: 5 });
      jest
        .spyOn(prisma.userExercise, 'findFirst')
        .mockResolvedValue(latestExercise);

      const result = await service.getUserStreak(user.user_id);

      expect(result).toEqual({
        streak: 5,
        lastExerciseDate: today,
      });
    });

    it('should throw if user is not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.getUserStreak('nonExistentUserId')).rejects.toThrow(
        new HttpException('User not found.', HttpStatus.NOT_FOUND),
      );
    });
  });
});
