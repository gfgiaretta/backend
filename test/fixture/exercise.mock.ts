import { Exercise } from '@prisma/client';

export function mockExercise({
  exercise_id,
  type,
  title,
  description,
  content,
  createdAt,
  updatedAt,
  deletedAt,
  interest_id,
}: Partial<Exercise>): Exercise {
  return {
    exercise_id: exercise_id || 'd7e3b6e3-1f11-4fd2-86e3-23456789abcd',
    type: type || 'Tipo do exercício',
    title: title || 'Titulo do exercício',
    description: description || 'Descrição do exercício de exemplo',
    content: content || {},
    createdAt: createdAt || new Date('2025-04-01T12:00:00Z'),
    updatedAt: updatedAt || new Date('2025-04-01T12:00:00Z'),
    deletedAt: deletedAt || null,
    interest_id: interest_id || 'int001',
  };
}
export const mockTestExercise: Exercise = mockExercise({});

export const mockTestExerciseOtherDay: Exercise = mockExercise({
  exercise_id: 'abcd1234-5678-90ef-ghij-klmnopqrstuv',
  createdAt: new Date('2025-04-01T12:00:00Z'),
  updatedAt: new Date('2025-04-01T12:00:00Z'),
});
