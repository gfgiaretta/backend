import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { CreateCommentDTO } from 'src/dtos/comment.dto';

@Injectable()
export class CommentMapper {
  static toPrisma(
    data: CreateCommentDTO,
    userId: string,
  ): Prisma.CommentCreateInput {
    return {
      content: data.content,
      user: {
        connect: { user_id: userId },
      },
      post: {
        connect: { post_id: data.postId },
      },
    };
  }
}
