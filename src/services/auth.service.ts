import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthPayload } from '../auth/auth.guard';
import { LoginDTO } from '../dtos/login.dto';
import { AccessTokenDTO, AuthenticatedUserDTO } from '../dtos/auth.dto';
import { PrismaService } from './prisma.service';
import * as dotenv from 'dotenv';
import { HashService } from './hash.service';

dotenv.config();

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly hashService: HashService,
  ) {}

  async validateUser({ email, password }: LoginDTO): Promise<AccessTokenDTO> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new HttpException(
        'Incorrect login credentials',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isMatch = await this.hashService.compare(password, user.password);

    if (!isMatch) {
      throw new HttpException(
        'Incorrect login credentials',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const payload: AuthPayload = { userId: user.user_id };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '3h',
    });

    return { accessToken };
  }

  async validateToken(userId: string): Promise<AuthenticatedUserDTO> {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId, deletedAt: null },
      include: {
        user_interest: {
          select: {
            interest: {
              select: {
                interest_id: true,
                title: true,
                createdAt: true,
                deletedAt: true,
              },
            },
          },
          where: {
            deletedAt: null,
          },
        },
      },
    });

    if (!user) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    }

    const interests = user.user_interest
      .filter((userInterest) => userInterest.interest.deletedAt === null)
      .map((userInterest) => ({
        interestId: userInterest.interest.interest_id,
        title: userInterest.interest.title,
        createdAt: userInterest.interest.createdAt,
      }))
      .map(({ interestId, title }) => ({
        interestId,
        title,
      }));

    return {
      userId: user.user_id,
      userName: user.name,
      interests: interests,
    };
  }
}
