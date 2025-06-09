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
import { UserModule } from '../../modules/user.module';
import { mockTestUserExercise } from '../../../test/fixture/userExercise.mock';

describe('ExerciseController', () => {
  let exerciseController: ExerciseController;
  let exerciseService: ExerciseService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [UserModule],
      controllers: [ExerciseController],
      providers: [ExerciseService, PrismaService],
    }).compile();

    exerciseController = testModule.get<ExerciseController>(ExerciseController);
    exerciseService = testModule.get<ExerciseService>(ExerciseService);
    prisma = testModule.get<PrismaService>(PrismaService);
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
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockTestUser);
      jest
        .spyOn(exerciseService, 'registerExercise')
        .mockResolvedValue(HttpStatus.CREATED);

      const result = await exerciseController.registerExercise(
        mockRequest,
        exerciseId,
      );
      expect(result).toBe(HttpStatus.CREATED);
    });

    it('should throw HttpException if service throws an error', async () => {
      const exception = new HttpException(
        'Exercise not found.',
        HttpStatus.NOT_FOUND,
      );

      jest
        .spyOn(exerciseService, 'registerExercise')
        .mockRejectedValue(exception);

      jest
        .spyOn(prisma.userExercise, 'findFirst')
        .mockResolvedValue(mockTestUserExercise);

      try {
        await exerciseController.registerExercise(mockRequest, exerciseId);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        if (error instanceof HttpException) {
          expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
          expect(error.getResponse()).toBe('Exercise not found.');
        }
      }
    });
  });
});
