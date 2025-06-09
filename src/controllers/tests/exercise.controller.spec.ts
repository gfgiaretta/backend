import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../services/prisma.service';
import { ExerciseController } from '../exercise.controller';
import { ExerciseService } from '../../services/exercise.service';
import { AuthenticatedRequest } from '../../dtos/auth.dto';
import {
  mockTestExercise,
  mockTestExerciseOtherDay,
} from '../../../test/fixture/exercise.mock';
import { mockTestUser } from '../../../test/fixture/user.mock';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from '../../services/user.service';
import { HashService } from '../../services/hash.service';
import { PresignedService } from '../../services/presigned.service';

describe('ExerciseController', () => {
  let exerciseController: ExerciseController;
  let exerciseService: ExerciseService;
  let userService: UserService;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [ExerciseController],
      providers: [
        ExerciseService,
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
        {
          provide: UserService,
          useValue: {
            updateUserStreak: jest.fn(),
          },
        },
      ],
    }).compile();

    exerciseController = testModule.get<ExerciseController>(ExerciseController);
    exerciseService = testModule.get<ExerciseService>(ExerciseService);
    userService = testModule.get<UserService>(UserService);
  });

  describe('getExercises', () => {
    it('should be defined', () => {
      expect(exerciseService).toBeDefined();
      expect(exerciseController).toBeDefined();
    });

    it('should return an array of exercises', async () => {
      jest
        .spyOn(exerciseService, 'getExercises')
        .mockResolvedValue([mockTestExercise, mockTestExerciseOtherDay]);
      const mockRequest = {
        payload: { userId: 'b60b728d450146a1bbb4836ed61c93c7' },
      } as AuthenticatedRequest;
      const result = await exerciseController.getExercises(mockRequest);
      expect(result).toEqual([mockTestExercise, mockTestExerciseOtherDay]);
    });

    it('should return HttpException if user dont have exercises for today', async () => {
      jest
        .spyOn(exerciseService, 'getExercises')
        .mockRejectedValue(
          new HttpException('No exercises were found.', HttpStatus.NOT_FOUND),
        );
      const mockRequest = {
        payload: { userId: 'b60b728d450146a1bbb4836ed61c93c7' },
      } as AuthenticatedRequest;

      await expect(
        exerciseController.getExercises(mockRequest),
      ).rejects.toThrow(
        new HttpException('No exercises were found.', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('registerExercise', () => {
    const mockRequest = {
      payload: {
        userId: mockTestUser.user_id,
      },
    } as AuthenticatedRequest;

    const exerciseId = mockTestExercise.exercise_id;

    it('should return HttpStatus.CREATED if registration succeeds', async () => {
      const registerExerciseSpy = jest
        .spyOn(exerciseService, 'registerExercise')
        .mockResolvedValue(HttpStatus.CREATED);

      const updateUserStreakSpy = jest
        .spyOn(userService, 'updateUserStreak')
        .mockImplementation(async () => Promise.resolve());

      const result = await exerciseController.registerExercise(
        mockRequest,
        exerciseId,
      );

      expect(result).toBe(HttpStatus.CREATED);
      expect(registerExerciseSpy).toHaveBeenCalledWith(
        mockTestUser.user_id,
        exerciseId,
      );
      expect(updateUserStreakSpy).toHaveBeenCalledWith(mockTestUser.user_id);
    });

    it('should throw HttpException if service throws an error', async () => {
      const exception = new HttpException(
        'Exercise not found.',
        HttpStatus.NOT_FOUND,
      );

      jest
        .spyOn(exerciseService, 'registerExercise')
        .mockRejectedValue(exception);

      jest.spyOn(userService, 'updateUserStreak').mockResolvedValue();

      await expect(
        exerciseController.registerExercise(mockRequest, exerciseId),
      ).rejects.toThrow(exception);
    });
  });
});
