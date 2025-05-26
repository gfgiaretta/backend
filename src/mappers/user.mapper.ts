import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateUserDto } from '../dtos/userDTO.dto';
import { UpdateProfileDto } from '../dtos/updateProfileDTO.dto';

@Injectable()
export class UserMapper {
  static toPrisma(
    data: CreateUserDto,
    hashedPassword: string,
  ): Prisma.UserCreateInput {
    return {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      streak: 0,
    };
  }

  static updateProfileToPrisma(data: UpdateProfileDto): Prisma.UserUpdateInput {
    return {
      ...(data.description !== undefined && { description: data.description }),
      ...(data.profilePictureUrl !== undefined && {
        profile_picture_path: data.profilePictureUrl,
      }),
    };
  }
}
