import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Comment } from '@prisma/client';
import { UserDTO } from '../dtos/user.dto';
import { PresignedService } from './presigned.service';
import { GetCommentResponseDTO } from 'src/dtos/comment.dto';
import { CommentMapper } from 'src/mappers/comment.mapper';

@Injectable()
export class CommentService {
  constructor(
    private readonly prisma: PrismaService,
    private presignedService: PresignedService,
  ) {}

  async getComments(post_id: string): Promise<GetCommentResponseDTO[]> {
    const comments = await this.prisma.comment.findMany({
      where: { 
        deletedAt: null, 
        post_id: post_id,
      },
    });

    return await Promise.all(
      comments.map(async (item) => {
        const owner = await this.prisma.user.findUnique({
          where: { user_id: item.user_id },
          select: {
            name: true,
            profile_picture_path: true,
          },
        });

        return {
          comment_id: item.comment_id,
          content: item.content,
          owner: {
            name: owner?.name,
            profile_picture_url: await this.presignedService.getDownloadURL(
              owner?.profile_picture_path || '' 
            )
          },
        } as GetCommentResponseDTO;
      }),
    );
  }

  async createComment({
    postId,
    content,
    userId,
  }: {
    postId: string;
    userId: string;
    content: string;
  }): Promise<HttpStatus> {
    const prismaData = CommentMapper.toPrisma({ postId, content }, userId);
    await this.prisma.comment.create({ data: prismaData });
    return HttpStatus.CREATED;
  };


  async deleteComment(commentId: string): Promise<HttpStatus> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const existingComment = await this.prisma.comment.findFirst({
      where: { comment_id: commentId },
    });

    if (!existingComment) {
      throw new HttpException('Comment does not exist', HttpStatus.BAD_REQUEST);
    }

   await this.prisma.comment.update({
      where: { comment_id: commentId },
      data: { deletedAt: new Date() },
    });
    return HttpStatus.OK;
  }
}
