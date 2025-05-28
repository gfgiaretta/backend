import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { ExerciseService } from '../exercise.service';
import { mockTestExercise } from '../../../test/fixture/exercise.mock';
import { mockUserInterestList } from '../../../test/fixture/userInterest.mock';
import { mockTestUserExercise } from '../../../test/fixture/userExercise.mock';
import { HttpException, HttpStatus } from '@nestjs/common';
import { mockTestUser } from '../../../test/fixture/user.mock';

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

  describe('registerExercise', () => {
    const userId = mockTestUser.user_id;
    const exerciseId = mockTestExercise.exercise_id;

    it('should throw NOT_FOUND if exercise does not exist', async () => {
      jest.spyOn(prisma.exercise, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockTestUser);

      await expect(
        service.registerExercise(userId, exerciseId),
      ).rejects.toThrow(
        new HttpException('Exercise not found.', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw NOT_FOUND if user does not exist', async () => {
      jest
        .spyOn(prisma.exercise, 'findUnique')
        .mockResolvedValue(mockTestExercise);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(
        service.registerExercise(userId, exerciseId),
      ).rejects.toThrow(
        new HttpException('User not found.', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw CONFLICT if exercise is already registered by the user', async () => {
      jest
        .spyOn(prisma.exercise, 'findUnique')
        .mockResolvedValue(mockTestExercise);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockTestUser);
      jest
        .spyOn(prisma.userExercise, 'findFirst')
        .mockResolvedValue(mockTestUserExercise);

      await expect(
        service.registerExercise(userId, exerciseId),
      ).rejects.toThrow(
        new HttpException(
          'Exercise already registered by user.',
          HttpStatus.CONFLICT,
        ),
      );
    });

    it('should create a userExercise and return CREATED', async () => {
      jest
        .spyOn(prisma.exercise, 'findUnique')
        .mockResolvedValue(mockTestExercise);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockTestUser);
      jest.spyOn(prisma.userExercise, 'findFirst').mockResolvedValue(null);
      jest
        .spyOn(prisma.userExercise, 'create')
        .mockResolvedValue(mockTestUserExercise);

      const result = await service.registerExercise(userId, exerciseId);
      expect(result).toBe(HttpStatus.CREATED);
    });
  });
});
