import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateUserDto, UserProfileDTO, UserStreakDTO } from '../dtos/user.dto';
import { UserMapper } from '../mappers/user.mapper';
import { UserInterestDto } from '../dtos/userInterest.dto';
import { UserInterestMapper } from '../mappers/userInterest.mapper';
import { HashService } from './hash.service';
import { UpdateProfileDto } from '../dtos/user.dto';
import { PostResponseDTO } from '../dtos/post.dto';
import { PresignedService } from './presigned.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashService: HashService,
    private readonly presignedService: PresignedService,
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

  async updateUserProfile(userId: string, data: UpdateProfileDto) {
    const { description, profilePictureUrl } = data;

    if (!description && !profilePictureUrl) {
      throw new HttpException(
        'At least one field (description or profile_picture_path) must be provided.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const userExists = await this.prisma.user.findUnique({
      where: { user_id: userId },
    });
    if (!userExists || userExists.deletedAt) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    }
    const updatedData = UserMapper.updateProfileToPrisma(data);
    const updatedUser = await this.prisma.user.update({
      where: { user_id: userId },
      data: updatedData,
    });
    return {
      user: {
        userId: updatedUser.user_id,
        description: updatedUser.description,
        profilePicturePath: updatedUser.profile_picture_path as string,
      },
    };
  }

  async getUserProfile(userId: string): Promise<UserProfileDTO> {
    const user = await this.prisma.user.findUnique({
      where: {
        deletedAt: null,
        user_id: userId,
      },
      select: {
        name: true,
        description: true,
        streak: true,
        profile_picture_path: true,
      },
    });

    if (!user) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    }

    const posts = await this.prisma.post.findMany({
      where: {
        deletedAt: null,
        owner_Id: userId,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user_savedPost: {
          where: { user_id: userId },
          select: { user_id: true },
        },
      },
    });

    const postResponseDTOs: PostResponseDTO[] = await Promise.all(
      posts.map(async (item) => ({
        post_id: item.post_id,
        owner: {
          name: user?.name || '',
          profile_picture_url: await this.presignedService.getDownloadURL(
            user.profile_picture_path ?? '',
          ),
        },
        title: item.title,
        description: item.description ?? undefined,
        image_url: await this.presignedService.getDownloadURL(
          item.image_url ?? '',
        ),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        isSaved: item.user_savedPost.length > 0,
      })),
    );

    const profilePictureUrl = await this.presignedService.getDownloadURL(
      user.profile_picture_path ?? '',
    );

    return {
      name: user.name,
      description: user.description,
      streak: user.streak,
      profilePictureUrl: profilePictureUrl,
      posts: postResponseDTOs,
    } as UserProfileDTO;
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

    const today = new Date();
    let newStreak: number;
    let daysSince: number;

    if (latestExercise && latestExercise.createdAt) {
      daysSince = diffDays(today, latestExercise.createdAt);
    } else {
      const defaultDaysSince = 2;
      daysSince = defaultDaysSince;
    }

    if (latestExercise) {
      if (daysSince > 1) {
        newStreak = 0;
      } else {
        const alreadyUpdatedToday = isSameDay(user.updatedAt, today);

        if (!alreadyUpdatedToday && (daysSince === 0 || daysSince === 1)) {
          newStreak = user.streak + 1;
        } else {
          newStreak = user.streak;
        }
      }
    } else {
      newStreak = 0;
    }

    if (newStreak !== user.streak) {
      const data = UserMapper.toPrismaUpdateStreak(newStreak);
      await this.prisma.user.update({
        where: { user_id: userId },
        data,
      });
    }
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

function diffDays(d1: Date, d2: Date): number {
  const diff = d1.getTime() - d2.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
