import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { StatisticsResponseDTO } from '../dtos/user.dto';
@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserStatistics(userId: string): Promise<StatisticsResponseDTO> {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const exercises = await this.prisma.userExercise.findMany({
      where: {
        user_id: userId,
        createdAt: {
          gte: startOfMonth, // >= startOfMonth,
          lt: startOfNextMonth, // < startOfNextMonth
        },
      },
      include: {
        exercise: {
          include: {
            interest: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const interestCounts: Record<string, number> = {};
    const calendarData: Record<string, string> = {};

    exercises.forEach((ex) => {
      const interestTitle = ex.exercise.interest.title;
      const execution_day = new Date(ex.createdAt).getUTCDate();

      if (interestTitle) {
        interestCounts[interestTitle] =
          (interestCounts[interestTitle] || 0) + 1;
        calendarData[execution_day.toString()] = interestTitle;
      }
    });

    const savedPostsCount = await this.prisma.userSavedPost.count({
      where: { user_id: userId },
    });

    const savedLibraryItemsCount = await this.prisma.userSavedLibrary.count({
      where: { user_id: userId },
    });

    const savedItems = savedPostsCount + savedLibraryItemsCount;

    return {
      graph: interestCounts,
      calendar: calendarData,
      savedItems: savedItems,
    };
  }
}
