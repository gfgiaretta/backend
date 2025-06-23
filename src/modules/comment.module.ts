import { Module } from '@nestjs/common';
import { CommentController } from 'src/controllers/comment.controller';
import { CommentService } from 'src/services/comment.service';
import { PresignedService } from 'src/services/presigned.service';
import { PrismaService } from 'src/services/prisma.service';

@Module({
  imports: [],
  controllers: [CommentController],
  providers: [CommentService, PrismaService, PresignedService],
})
export class CommentModule {}
