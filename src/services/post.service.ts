import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PostResponseDTO } from '../dtos/postResponseDTO.dto';
import { postOwnerResponseDTO } from 'src/dtos/postOwnerResponseDTO.dto';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

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
            profile_picture_url: true,
          },
        });

        return {
          post_id: item.post_id,
          owner: {
            name: owner?.name || '',
            profile_picture_url: owner?.profile_picture_url || '',
          } as postOwnerResponseDTO,
          title: item.title,
          description: item.description,
          image_url: item.image_url,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          isSaved: item.user_savedPost.length > 0,
        } as PostResponseDTO;
      }),
    );
  }
}
