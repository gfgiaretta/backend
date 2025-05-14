import { Module } from '@nestjs/common';
import { ExerciseController } from '../controllers/exercise.controller';
import { ExerciseService } from '../services/exercise.service';
import { PrismaService } from '../services/prisma.service';

@Module({
  controllers: [ExerciseController],
  providers: [ExerciseService, PrismaService],
})
export class ExerciseModule {}
