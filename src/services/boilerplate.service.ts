import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { User } from '@prisma/client';
import { UserDTO } from '../dtos/userDTO.dto';

@Injectable()
export class BoilerplateService {
  constructor(private readonly prisma: PrismaService) {}
  getHello(): string {
    return 'Hello World!';
  }

  async getMethod(): Promise<User[]> {
    const users = await this.prisma.user.findMany();

    if (users.length === 0) {
      throw new HttpException('No users found', HttpStatus.NOT_FOUND);
    }

    return users;
  }

  async postMethod({
    name,
    email,
    password,
    description,
    profile_picture_url,
  }: UserDTO): Promise<HttpStatus> {
    let user: User | null = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    const desc = description ? description : 'no description';
    const picture = profile_picture_url ? profile_picture_url : 'no image';

    user = await this.prisma.user.create({
      data: {
        name,
        description: desc,
        email,
        password,
        profile_picture_url: picture,
        streak: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    });

    return HttpStatus.CREATED;
  }

  async deleteMethod(id: string): Promise<HttpStatus> {
    const user = await this.prisma.user.findUnique({
      where: { user_id: id },
    });
    if (!user) {
      throw new HttpException('User does not exist', HttpStatus.NOT_FOUND);
    }
    await this.prisma.user.delete({
      where: { user_id: id },
    });
    return HttpStatus.NO_CONTENT;
  }
}
