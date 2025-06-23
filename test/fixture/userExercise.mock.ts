import { UserExercise } from '@prisma/client';
import { UserExerciseDTO } from 'src/dtos/userExercise.dto';

export function mockUserExercise({
  user_id,
  exercise_id,
  createdAt,
  updatedAt,
  deletedAt,
  content,
}: Partial<UserExercise>): UserExercise {
  return {
    user_id: user_id || 'test-user-id',
    exercise_id: exercise_id || 'test-exercise-id',
    createdAt: createdAt || new Date('2025-06-01T10:00:00Z'),
    updatedAt: updatedAt || new Date('2025-06-01T10:00:00Z'),
    deletedAt: deletedAt || null,
    content: content || { imageURL: 'https://example.com/test-image.png' },
  };
}

export const mockTestUserExercise: UserExercise = mockUserExercise({});

export const mockUserExerciseDTO: UserExerciseDTO = {
  exerciseId: 'exercise-id-exemplo',
  content: { imageURL: 'https://example.com/test-image.png' },
};
