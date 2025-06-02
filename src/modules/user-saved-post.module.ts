import { Module } from '@nestjs/common';
import { UserSavedPostController } from '../controllers/user-saved-post.controller';
import { UserSavedPostService } from '../services/user-saved-post.service';
import { PrismaService } from '../services/prisma.service';

@Module({
  controllers: [UserSavedPostController],
  providers: [UserSavedPostService, PrismaService],
})
export class UserSavedPostModule {}
