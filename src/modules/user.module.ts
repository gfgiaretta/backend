import { Module } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { UserService } from '../services/user.service';
import { UserController } from '../controllers/user.controller';
import { StatisticsService } from '../services/statistics.service';
import { HashService } from '../services/hash.service';
import { PresignedService } from '../services/presigned.service';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    StatisticsService,
    PrismaService,
    HashService,
    PresignedService,
  ],
  exports: [UserService],
})
export class UserModule {}
