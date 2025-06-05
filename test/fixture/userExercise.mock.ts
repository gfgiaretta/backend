import { UserExercise } from '@prisma/client';

export function mockUserExercise({
  user_id,
  exercise_id,
  createdAt,
  updatedAt,
  deletedAt,
}: Partial<UserExercise>): UserExercise {
  return {
    user_id: user_id || 'test-user-id',
    exercise_id: exercise_id || 'test-exercise-id',
    createdAt: createdAt || new Date('2025-06-01T10:00:00Z'),
    updatedAt: updatedAt || new Date('2025-06-01T10:00:00Z'),
    deletedAt: deletedAt || null,
  };
}

export const mockTestUserExercise: UserExercise = mockUserExercise({});
