import { Controller, Post, Body, HttpStatus, Get, Req } from '@nestjs/common';
import { ExerciseService } from '../services/exercise.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Exercise } from '@prisma/client';
import { UserExerciseDTO } from '../dtos/userExercise.dto';
import { AuthenticatedRequest } from '../dtos/auth.dto';
import { UserService } from 'src/services/user.service';

@ApiTags('Exercises')
@ApiBearerAuth('Authorization')
@Controller('/exercise')
export class ExerciseController {
  constructor(
    private readonly exerciseService: ExerciseService,
    private readonly userService: UserService,
  ) {}

  @Get('/')
  async getExercises(
    @Req() req: AuthenticatedRequest,
  ): Promise<Array<Exercise>> {
    return this.exerciseService.getExercises(req.payload.userId);
  }

  @Post('/register')
  async registerExercise(
    @Body() userExercise: UserExerciseDTO,
  ): Promise<HttpStatus> {
    await this.userService.updateUserStreak(userExercise.userId);
    return await this.exerciseService.registerExercise(userExercise);
  }
}
