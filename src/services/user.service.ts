import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateUserDto, UserStreakDTO } from '../dtos/user.dto';
import { UserMapper } from '../mappers/user.mapper';
import { UserInterestDto } from '../dtos/userInterest.dto';
import { UserInterestMapper } from '../mappers/userInterest.mapper';
import { HashService } from './hash.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashService: HashService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email } = createUserDto;

    const existingUser = await this.prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    const hashedPassword = await this.hashService.hash(createUserDto.password);
    const userData = UserMapper.toPrisma(createUserDto, hashedPassword);

    const newUser = await this.prisma.user.create({ data: userData });
    return { userId: newUser.user_id };
  }

  async updateUserInterests(userId: string, data: UserInterestDto) {
    const { interest } = data;
    const numOfInterests = 3;

    if (interest.length !== numOfInterests) {
      throw new HttpException(
        'Exactly 3 interests are required.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const uniqueInterests = new Set(interest);
    if (uniqueInterests.size !== interest.length) {
      throw new HttpException(
        'Duplicate interest IDs are not allowed.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const userExists = await this.prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!userExists) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    }

    const foundInterests = await this.prisma.interest.findMany({
      where: { interest_id: { in: interest } },
    });

    if (foundInterests.length !== interest.length) {
      throw new HttpException(
        'One or more provided interest IDs do not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.prisma.userInterest.deleteMany({
      where: { user_id: userId },
    });

    const userInterests = UserInterestMapper.toPrisma(userId, interest);

    await this.prisma.userInterest.createMany({
      data: userInterests,
    });

    return { userId, interests: interest };
  }

  async updateUserStreak(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId, deletedAt: null },
    });
    if (!user) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    }

    const latestExercise = await this.prisma.userExercise.findFirst({
      where: { user_id: userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    let newStreak: number;
    if (
      latestExercise &&
      new Date().getDate() - latestExercise.createdAt.getDate() <= 1
    ) {
      newStreak = user.streak + 1;
    } else {
      newStreak = 0;
    }

    const data = UserMapper.toPrismaUpdateStreak(newStreak);
    await this.prisma.user.update({
      where: { user_id: userId },
      data,
    });
  }

  async getUserStreak(userId: string): Promise<UserStreakDTO> {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId, deletedAt: null },
      select: { streak: true },
    });

    if (!user) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    }

    const latestExercise = await this.prisma.userExercise.findFirst({
      where: { user_id: userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      streak: user.streak,
      lastExerciseDate: latestExercise?.createdAt || null,
    };
  }
}
