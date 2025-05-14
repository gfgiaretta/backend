import { Module } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { UserService } from '../services/user.service';
import { UserController } from '../controllers/user.controller';
import { StatisticsService } from '../services/statistics.service';
import { HashService } from '../services/hash.service';

@Module({
  controllers: [UserController],
  providers: [UserService, StatisticsService, PrismaService, HashService],
})
export class UserModule {}
