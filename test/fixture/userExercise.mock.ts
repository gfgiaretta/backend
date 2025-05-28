import { UserExercise } from '@prisma/client';

export function mockUserExercise({
  user_id,
  exercise_id,
  createdAt,
  updatedAt,
  deletedAt,
}: Partial<UserExercise>): UserExercise {
  return {
    user_id: user_id || 'b60b728d450146a1bbb4836ed61c93c7',
    exercise_id: exercise_id || 'abc123exercise',
    createdAt: createdAt || new Date('2025-05-01T10:00:00'),
    updatedAt: updatedAt || new Date('2025-05-01T10:00:00'),
    deletedAt: deletedAt || null,
  };
}

export const mockTestUserExercise: UserExercise = mockUserExercise({});
