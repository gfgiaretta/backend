import { Module } from '@nestjs/common';
import { ExerciseController } from '../controllers/exercise.controller';
import { ExerciseService } from '../services/exercise.service';
import { PrismaService } from '../services/prisma.service';
import { UserModule } from './user.module';

@Module({
  imports: [UserModule],
  controllers: [ExerciseController],
  providers: [ExerciseService, PrismaService],
})
export class ExerciseModule {}
