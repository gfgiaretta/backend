import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { CreatePostDTO } from '../dtos/post.dto';

@Injectable()
export class PostMapper {
  static toPrisma(data: CreatePostDTO, userId: string): Prisma.PostCreateInput {
    return {
      title: data.title,
      description: data.description,
      image_url: data.image,
      user: {
        connect: {
          user_id: userId,
        },
      },
    };
  }

  static toPrismaUpdateDate(
    deletedAtNull: boolean,
  ): Prisma.UserSavedPostUpdateInput {
    if (deletedAtNull) {
      return {
        deletedAt: new Date(),
        updatedAt: new Date(),
      };
    } else {
      return {
        deletedAt: null,
        updatedAt: new Date(),
      };
    }
  }
}
