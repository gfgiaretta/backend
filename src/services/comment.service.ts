import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Comment } from '@prisma/client';
import { UserDTO } from '../dtos/user.dto';
import { PresignedService } from './presigned.service';
import { GetCommentResponseDTO } from 'src/dtos/comment.dto';

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
}
