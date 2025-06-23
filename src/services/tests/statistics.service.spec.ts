import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsService } from '../statistics.service';
import { PrismaService } from '../prisma.service';
import { HttpException, HttpStatus } from '@nestjs/common';

const mockPrismaService = {
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

describe('StatisticsService', () => {
  let statisticsService: StatisticsService;

  const fixedDate = new Date('2025-05-15T12:00:00Z');

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(fixedDate);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    statisticsService = module.get<StatisticsService>(StatisticsService);
  });

  it('should throw NOT_FOUND if user is not found', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);

    await expect(
      statisticsService.getUserStatistics('nonexistent-id'),
    ).rejects.toThrowError(
      new HttpException('User not found.', HttpStatus.NOT_FOUND),
    );
  });

  it('should return correct statistics', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue({ user_id: '123' });

    mockPrismaService.userExercise.findMany.mockResolvedValue([
      {
        createdAt: new Date('2025-05-01T12:00:00Z'),
        exercise: { interest: { title: 'Criatividade' } },
      },
      {
        createdAt: new Date('2025-05-02T12:00:00Z'),
        exercise: { interest: { title: 'Comunicacao' } },
      },
      {
        createdAt: new Date('2025-05-03T12:00:00Z'),
        exercise: { interest: { title: 'Criatividade' } },
      },
    ]);

    const savedPostsTotal = 3;
    const savedLibraryTotal = 5;
    mockPrismaService.userSavedPost.count.mockResolvedValue(savedPostsTotal);
    mockPrismaService.userSavedLibrary.count.mockResolvedValue(
      savedLibraryTotal,
    );

    const result = await statisticsService.getUserStatistics('123');

    expect(result).toEqual({
      graph: {
        Criatividade: 2,
        Comunicacao: 1,
      },
      calendar: {
        1: 'Criatividade',
        2: 'Comunicacao',
        3: 'Criatividade',
      },
      savedItems: 8,
    });
  });
});
