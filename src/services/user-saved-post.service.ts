import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class UserSavedPostService {
  constructor(private prisma: PrismaService) {}

  async savePost(userId: string, postId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    }

    const post = await this.prisma.post.findUnique({
      where: { post_id: postId },
    });

    if (!post) {
      throw new HttpException('Post not found.', HttpStatus.NOT_FOUND);
    }

    const alreadyExists = await this.prisma.userSavedPost.findUnique({
      where: {
        user_id_post_id: {
          user_id: userId,
          post_id: postId,
        },
      },
    });

    if (alreadyExists) {
      throw new HttpException(
        'Post already saved by this user.',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.userSavedPost.create({
      data: {
        user: { connect: { user_id: userId } },
        post: { connect: { post_id: postId } },
      },
    });
  }
}
