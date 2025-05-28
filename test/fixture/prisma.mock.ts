export const mockPrismaClient = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $on: jest.fn(),
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  userExercise: {
    findMany: jest.fn(),
  },
  userSavedPost: {
    count: jest.fn(),
  },
  userSavedLibrary: {
    count: jest.fn(),
  },
};
