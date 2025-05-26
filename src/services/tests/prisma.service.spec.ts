import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { mockPrismaClient } from '../../../test/fixture/prisma.mock';

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: class {
      user = mockPrismaClient.user;
      userExercise = mockPrismaClient.userExercise;
      userSavedPost = mockPrismaClient.userSavedPost;
      userSavedLibrary = mockPrismaClient.userSavedLibrary;
      $connect = mockPrismaClient.$connect;
      $disconnect = mockPrismaClient.$disconnect;
      $on = mockPrismaClient.$on;
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(prismaService).toBeDefined();
  });

  it('should connect to the database on module initialization', async () => {
    await prismaService.onModuleInit();
    expect(mockPrismaClient.$connect).toHaveBeenCalled();
  });

  it('should disconnect from the database on module destruction', async () => {
    await prismaService.onModuleDestroy();
    expect(mockPrismaClient.$disconnect).toHaveBeenCalled();
  });
});
