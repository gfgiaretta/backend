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
import { ApiParam, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Exercise } from '@prisma/client';
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

  @Post('/register/:exerciseId')
  @ApiParam({
    name: 'exerciseId',
    required: true,
    description: 'ID of the exercise to register',
    type: String,
    example: 'd63094d4-cc58-434a-9fd0-7227430793a1',
  })
  async registerExercise(
    @Req() req: AuthenticatedRequest,
    @Param('exerciseId') exerciseId: string,
  ): Promise<HttpStatus> {
    const response = await this.exerciseService.registerExercise(
      req.payload.userId,
      exerciseId,
    );
    await this.userService.updateUserStreak(req.payload.userId);
    return response;
  }
}
