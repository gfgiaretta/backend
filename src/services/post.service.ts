import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { postOwnerResponseDTO, PostResponseDTO } from '../dtos/postDTO.dto';
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
              owner?.profile_picture_path || ''
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
}
