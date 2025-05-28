import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Get,
  Req,
  Param,
} from '@nestjs/common';
import { ExerciseService } from '../services/exercise.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Exercise } from '@prisma/client';
import { UserExerciseDTO } from '../dtos/userExercise.dto';
import { AuthenticatedRequest } from '../dtos/auth.dto';
import { UserService } from '../services/user.service';

@ApiTags('Exercises')
@ApiBearerAuth('Authorization')
@Controller('/exercise')
export class ExerciseController {
  constructor(
    private readonly exerciseService: ExerciseService,
    private readonly userService: UserService,
  ) {}

  @Get('/history')
  async getExerciseHistory(@Req() req: AuthenticatedRequest) {
    return this.exerciseService.getExerciseHistory(req.payload.userId);
  }

  @Get('/')
  async getExercises(
    @Req() req: AuthenticatedRequest,
  ): Promise<Array<Exercise>> {
    return this.exerciseService.getExercises(req.payload.userId);
  }

  @Get('/:id')
  async getExerciseById(@Param('id') id: string): Promise<Exercise> {
    return this.exerciseService.getExerciseById(id);
  }

  @Post('/register')
  async registerExercise(
    @Body() userExercise: UserExerciseDTO,
  ): Promise<HttpStatus> {
    const response = await this.exerciseService.registerExercise(userExercise);
    await this.userService.updateUserStreak(userExercise.userId);
    return response;
  }
}
