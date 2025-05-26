import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../services/prisma.service';
import { ExerciseController } from '../exercise.controller';
import { ExerciseService } from '../../services/exercise.service';
import { AuthenticatedRequest } from '../../dtos/authDTO.dto';
import {
  mockTestExercise,
  mockTestExerciseOtherDay,
} from '../../../test/fixture/exercise.mock';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('ExerciseController', () => {
  let exerciseController: ExerciseController;
  let exerciseService: ExerciseService;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      controllers: [ExerciseController],
      providers: [ExerciseService, PrismaService],
    }).compile();

    exerciseController = testModule.get<ExerciseController>(ExerciseController);
    exerciseService = testModule.get<ExerciseService>(ExerciseService);
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
});
