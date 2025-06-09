import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PresignedService } from './presigned.service';
import { GetCommentResponseDTO } from 'src/dtos/comment.dto';
import { CommentMapper } from 'src/mappers/comment.mapper';

@Injectable()
export class CommentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly presignedService: PresignedService,
  ) {}

  async getComments(postId: string): Promise<GetCommentResponseDTO[]> {
    const comments = await this.prisma.comment.findMany({
      where: {
        deletedAt: null,
        post_id: postId,
      },
    });

    return await Promise.all(
      comments.map(async (item) => {
        const owner = await this.prisma.user.findUnique({
          where: { user_id: item.user_id },
          select: {
            user_id: true,
            name: true,
            profile_picture_path: true,
          },
        });

        return {
          comment_id: item.comment_id,
          content: item.content,
          owner: {
            id: owner?.user_id,
            name: owner?.name,
            profile_picture_url: await this.presignedService.getDownloadURL(
              owner?.profile_picture_path || '',
            ),
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
  }

  async deleteComment(userId: string, commentId: string): Promise<HttpStatus> {
    const existingComment = await this.prisma.comment.findFirst({
      where: {
        deletedAt: null,
        comment_id: commentId,
      },
    });

    if (!existingComment) {
      throw new HttpException('Comment does not exist', HttpStatus.BAD_REQUEST);
    }

    if (existingComment.user_id !== userId) {
      throw new HttpException('Not enough rights', HttpStatus.FORBIDDEN);
    }

    await this.prisma.comment.update({
      where: { comment_id: commentId },
      data: { deletedAt: new Date() },
    });
    return HttpStatus.OK;
  }
}
