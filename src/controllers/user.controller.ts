import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Patch,
} from '@nestjs/common';
import { CreateUserDto, StatisticsResponseDTO } from '../dtos/user.dto';
import { UserService } from '../services/user.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsPublic } from '../auth/decorators/isPublic.decorator';
import { AuthenticatedRequest } from '../dtos/auth.dto';
import { StatisticsService } from '../services/statistics.service';
import { UserInterestDto } from '../dtos/userInterest.dto';
import { UpdateProfileDto } from '../dtos/user.dto';

@ApiTags('Users')
@ApiBearerAuth('Authorization')
@Controller('/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly statisticsService: StatisticsService,
  ) { }

  @IsPublic()
  @Post('/register')
  async create(@Body() createUserDto: CreateUserDto) {
    const allowedKeys = ['name', 'email', 'password'];
    const bodyKeys = Object.keys(createUserDto);

    const isValidBody =
      bodyKeys.every((key) => allowedKeys.includes(key)) &&
      allowedKeys.every((key) => bodyKeys.includes(key));

    if (!isValidBody) {
      throw new HttpException('Invalid request body.', HttpStatus.BAD_REQUEST);
    }

    const result = await this.userService.create(createUserDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'User created successfully.',
      data: result,
    };
  }

  @Get('/stats')
  async getUserStatistics(
    @Req() req: AuthenticatedRequest,
  ): Promise<StatisticsResponseDTO> {
    await this.userService.updateUserStreak(req.payload.userId);
    const result = await this.statisticsService.getUserStatistics(
      req.payload.userId,
    );
    return result;
  }

  @Post('/interests')
  async updateUserInterests(
    @Req() req: AuthenticatedRequest,
    @Body() body: UserInterestDto,
  ) {
    const result = await this.userService.updateUserInterests(
      req.payload.userId,
      body,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Interests updated successfully.',
      data: result,
    };
  }

  @Patch('/profile')
  async updateUserProfile(
    @Req() req: AuthenticatedRequest,
    @Body() body: UpdateProfileDto,
  ) {
    await this.userService.updateUserStreak(req.payload.userId);
    await this.userService.updateUserProfile(req.payload.userId, body);

    return {
      statusCode: HttpStatus.OK,
      message: 'Profile updated successfully.',
    };
  }

  @Get('/profile')
  async getUserProfile(@Req() req: AuthenticatedRequest) {
    const result = await this.userService.getUserProfile(req.payload.userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'User profile retrieved successfully.',
      data: result,
    };
  }

  @Get('/streak')
  async getUserStreak(@Req() req: AuthenticatedRequest) {
    return await this.userService.getUserStreak(req.payload.userId);
  }

  @Get('/savedItems')
  async getUserSavedItems(@Req() req: AuthenticatedRequest) {
    try {
      const result = await this.userService.getUserSavedItems(req.payload.userId);

      if (result.length === 0) {
        return {
          statusCode: HttpStatus.NO_CONTENT,
          message: 'No saved items found.',
        };
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'User saved items retrieved successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
