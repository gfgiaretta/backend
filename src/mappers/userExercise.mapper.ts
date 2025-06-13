import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { InputJsonValue } from '@prisma/client/runtime/library';

@Injectable()
export class UserExerciseMapper {
  static toPrisma(
    userId: string,
    exerciseId: string,
    content: InputJsonValue,
  ): Prisma.UserExerciseCreateInput {
    return {
      user: { connect: { user_id: userId } },
      exercise: { connect: { exercise_id: exerciseId } },
      deletedAt: null,
      content,
    };
  }
}
