import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import {
  PostResponseDTO,
  SavePostResponseDTO,
  postOwnerResponseDTO,
} from '../dtos/post.dto';
import { PresignedService } from './presigned.service';
import { PostMapper } from '../mappers/post.mapper';

@Injectable()
export class PostService {
  constructor(
    private prisma: PrismaService,
    private presignedService: PresignedService,
  ) {}

  async getPostsWithSavedStatusPaginated(
    userId: string,
    page: number,
    limit: number,
  ): Promise<PostResponseDTO[]> {
    const posts = await this.prisma.post.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        user_savedPost: {
          where: { user_id: userId },
          select: { user_id: true },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return await Promise.all(
      posts.map(async (item) => {
        const owner = await this.prisma.user.findUnique({
          where: { user_id: item.owner_Id },
          select: {
            name: true,
            profile_picture_path: true,
          },
        });

        return {
          post_id: item.post_id,
          owner: {
            name: owner?.name || '',
            profile_picture_url: await this.presignedService.getDownloadURL(
              owner?.profile_picture_path || '',
            ),
          } as postOwnerResponseDTO,
          title: item.title,
          description: item.description,
          image_url: await this.presignedService.getDownloadURL(item.image_url),
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          isSaved: item.user_savedPost.length > 0,
        } as PostResponseDTO;
      }),
    );
  }

  async createPost({
    title,
    description,
    image,
    userId,
  }: {
    title: string;
    description: string;
    image: string;
    userId: string;
  }): Promise<HttpStatus> {
    const prismaData = PostMapper.toPrisma(
      { title, description, image },
      userId,
    );
    await this.prisma.post.create({ data: prismaData });
    return HttpStatus.CREATED;
  }

  async savePost(
    userId: string,
    postId: string,
    save: boolean,
  ): Promise<SavePostResponseDTO> {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!postId || typeof save !== 'boolean') {
      throw new HttpException(
        'must have postId and save.',
        HttpStatus.BAD_REQUEST,
      );
    }

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

    if (save) {
      if (alreadyExists) {
        if (alreadyExists.deletedAt === null) {
          return {
            statusCode: HttpStatus.NO_CONTENT,
            message: 'No modification were needed.',
          } as SavePostResponseDTO;
        }
        const data = PostMapper.toPrismaUpdateDate(false);
        await this.prisma.userSavedPost.update({
          where: {
            user_id_post_id: {
              user_id: userId,
              post_id: postId,
            },
          },
          data,
        });
        return {
          statusCode: HttpStatus.OK,
          message: 'Post saved successfully.',
        } as SavePostResponseDTO;
      }
      await this.prisma.userSavedPost.create({
        data: {
          user: { connect: { user_id: userId } },
          post: { connect: { post_id: postId } },
        },
      });
      return {
        statusCode: HttpStatus.OK,
        message: 'Post saved successfully.',
      } as SavePostResponseDTO;
    }
    if (alreadyExists) {
      if (alreadyExists.deletedAt === null) {
        const data = PostMapper.toPrismaUpdateDate(true);
        await this.prisma.userSavedPost.update({
          where: {
            user_id_post_id: {
              user_id: userId,
              post_id: postId,
            },
          },
          data,
        });
        return {
          statusCode: HttpStatus.OK,
          message: 'Post removed successfully.',
        } as SavePostResponseDTO;
      }
      return {
        statusCode: HttpStatus.NO_CONTENT,
        message: 'No modification were needed.',
      } as SavePostResponseDTO;
    }
    return {
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Saved post not found to remove',
    } as SavePostResponseDTO;
  }
}
