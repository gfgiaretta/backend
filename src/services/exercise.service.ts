import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Exercise } from '@prisma/client';
import { UserExerciseMapper } from 'src/mappers/userExercise.mapper';
import { UserExerciseDTO } from 'src/dtos/userExerciseDTO.dto';

@Injectable()
export class ExerciseService {
  constructor(private readonly prisma: PrismaService) {}

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

    const exercisesReturned = await this.prisma.exercise.findMany({
      distinct: ['type'],
      where: { interest_id: { in: interestIds } },
    });

    if (exercisesReturned.length === 0) {
      throw new HttpException(errorMessage, HttpStatus.NOT_FOUND);
    }

    return exercisesReturned;
  }

  async registerExercise({
    userId,
    exerciseId,
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
    );
    await this.prisma.userExercise.create({ data: userExercise });
    return HttpStatus.CREATED;
  }
}
