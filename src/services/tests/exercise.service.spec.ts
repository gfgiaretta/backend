import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { ExerciseService } from '../exercise.service';
import { mockTestExercise } from '../../../test/fixture/exercise.mock';
import { mockUserInterestList } from '../../../test/fixture/userInterest.mock';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('ExerciseService', () => {
  let service: ExerciseService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExerciseService, PrismaService],
    }).compile();

    service = module.get<ExerciseService>(ExerciseService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('getExercises', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
      expect(prisma).toBeDefined();
    });

    it('should return an array of exercises of the day', async () => {
      jest
        .spyOn(prisma.userInterest, 'findMany')
        .mockResolvedValue(mockUserInterestList);
      jest
        .spyOn(prisma.exercise, 'findMany')
        .mockResolvedValue([mockTestExercise]);

      const result = await service.getExercises(
        'b60b728d450146a1bbb4836ed61c93c7',
      );
      expect(result).toEqual([mockTestExercise]);
    });

    it('should throw a NOT_FOUND exception if no exercises are found (either by interest or date)', async () => {
      jest
        .spyOn(prisma.userInterest, 'findMany')
        .mockResolvedValue(mockUserInterestList);

      jest.spyOn(prisma.exercise, 'findMany').mockResolvedValue([]);

      try {
        await service.getExercises('b60b728d450146a1bbb4836ed61c93c7');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        if (error instanceof HttpException) {
          expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
          expect(error.getResponse()).toEqual('No exercises were found.');
        }
      }
    });
  });
});
