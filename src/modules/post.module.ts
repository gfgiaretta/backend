import { Module } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { PostController } from '../controllers/post.controller';
import { PostService } from '../services/post.service';
import { PresignedService } from '../services/presigned.service';

@Module({
  imports: [],
  controllers: [PostController],
  providers: [PostService, PrismaService, PresignedService],
})
export class PostModule {}
