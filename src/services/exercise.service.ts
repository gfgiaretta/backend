import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Exercise } from '@prisma/client';
import { UserExerciseMapper } from '../mappers/userExercise.mapper';
import {
  UserExerciseDTO,
  UserExerciseHistoryDTO,
} from '../dtos/userExercise.dto';

@Injectable()
export class ExerciseService {
  constructor(private readonly prisma: PrismaService) {}

  async getExerciseHistory(userId: string): Promise<UserExerciseHistoryDTO[]> {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
    });
    if (!user || user.deletedAt) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    }

    const history = await this.prisma.userExercise.findMany({
      where: {
        user_id: userId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        exercise: {
          select: {
            title: true,
            description: true,
            interest: { select: { title: true } },
            deletedAt: true,
          },
        },
      },
    });

    const filteredHistory = history.filter(
      (item) => item.exercise && item.exercise.deletedAt === null,
    );

    if (!filteredHistory.length) {
      throw new HttpException(
        'No exercise history found.',
        HttpStatus.NOT_FOUND,
      );
    }

    return filteredHistory.map((item) => ({
      title: item.exercise.title,
      description: item.exercise.description,
      interest: item.exercise.interest.title,
      performedAt: item.createdAt,
    }));
  }

  async getExercises(userId: string): Promise<Array<Exercise>> {
    const errorMessage = 'No exercises were found.';

    const interestByUserId = await this.prisma.userInterest.findMany({
      where: { user_id: userId },
      select: { interest_id: true },
    });
    if (interestByUserId.length === 0) {
      throw new HttpException(errorMessage, HttpStatus.NOT_FOUND);
    }

    const interestIds = interestByUserId.map((id) => id.interest_id);

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(currentDate);
    // eslint-disable-next-line no-magic-numbers
    endOfDay.setHours(23, 59, 59, 999);

    const exercisesReturned = await this.prisma.exercise.findMany({
      distinct: ['type'],
      where: {
        interest_id: { in: interestIds },
        createdAt: {
          gte: currentDate,
          lte: endOfDay,
        },
      },
    });

    if (exercisesReturned.length === 0) {
      throw new HttpException(errorMessage, HttpStatus.NOT_FOUND);
    }

    return exercisesReturned;
  }

  async registerExercise({
    userId,
    exerciseId,
    content,
  }: UserExerciseDTO): Promise<HttpStatus> {
    const exercise = await this.prisma.exercise.findUnique({
      where: { exercise_id: exerciseId },
    });
    if (!exercise) {
      throw new HttpException('Exercise not found.', HttpStatus.NOT_FOUND);
    }

    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
    });
    if (!user) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    }

    const userExercise = UserExerciseMapper.toPrisma(
      user.user_id,
      exercise.exercise_id,
      content,
    );
    await this.prisma.userExercise.create({ data: userExercise });
    return HttpStatus.CREATED;
  }

  async getExerciseById(exerciseId: string): Promise<Exercise> {
    const exercise = await this.prisma.exercise.findUnique({
      where: { exercise_id: exerciseId, deletedAt: null },
    });

    if (!exercise) {
      throw new HttpException('Exercise not found.', HttpStatus.NOT_FOUND);
    }

    return exercise;
  }
}
