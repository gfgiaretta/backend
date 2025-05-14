import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateUserDto } from '../dtos/userDTO.dto';

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
}
