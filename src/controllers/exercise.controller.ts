import { Controller, Post, Body, HttpStatus, Get, Req } from '@nestjs/common';
import { ExerciseService } from '../services/exercise.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Exercise } from '@prisma/client';
import { UserExerciseDTO } from '../dtos/userExerciseDTO.dto';
import { AuthenticatedRequest } from '../dtos/authDTO.dto';

@ApiTags('Exercises')
@ApiBearerAuth('Authorization')
@Controller('/exercise')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

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
    return await this.exerciseService.registerExercise(userExercise);
  }
}
