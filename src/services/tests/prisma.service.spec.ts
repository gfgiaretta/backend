import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';

const mockPrismaClient = {
  $connect: jest.fn(),
  user: {
    findUnique: jest.fn(),
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

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: class {
      user = mockPrismaClient.user;
      userExercise = mockPrismaClient.userExercise;
      userSavedPost = mockPrismaClient.userSavedPost;
      userSavedLibrary = mockPrismaClient.userSavedLibrary;
      $connect = mockPrismaClient.$connect;
      $disconnect = jest.fn();
    },
  };
});

describe('PrismaService', () => {
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(prismaService).toBeDefined();
  });

  it('should connect to the database on module initialization', async () => {
    await prismaService.onModuleInit();
    expect(mockPrismaClient.$connect).toHaveBeenCalled();
  });
});
