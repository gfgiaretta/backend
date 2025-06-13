import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { LibraryResponseDTO } from '../dtos/library.dto';

@Injectable()
export class LibraryService {
  constructor(private prisma: PrismaService) {}

  async getLibraryWithSavedInfo(userId: string) {
    const libraries = await this.prisma.library.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        user_savedLibrary: {
          where: { user_id: userId },
          select: { user_id: true },
        },
      },
    });

    return libraries.map(
      (item) =>
        ({
          library_id: item.library_id,
          description: item.description,
          link: item.link,
          image_url: item.image_url,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          isSaved: item.user_savedLibrary.length > 0,
        }) as LibraryResponseDTO,
    );
  }

  async saveLibrary(userId: string, libraryId: string, shouldSave: boolean) {
    const library = await this.prisma.library.findUnique({
      where: { library_id: libraryId, deletedAt: null },
    });
    if (!library) {
      throw new HttpException('Library not found.', HttpStatus.NOT_FOUND);
    }

    const existing = await this.prisma.userSavedLibrary.findFirst({
      where: {
        user_id: userId,
        library_id: libraryId,
      },
    });

    if (shouldSave) {
      if (!existing) {
        await this.prisma.userSavedLibrary.create({
          data: {
            user_id: userId,
            library_id: libraryId,
          },
        });
        return {
          statusCode: HttpStatus.OK,
          message: 'Library saved.',
        };
      }
      if (existing.deletedAt) {
        await this.prisma.userSavedLibrary.update({
          where: {
            user_id_library_id: {
              user_id: userId,
              library_id: libraryId,
            },
          },
          data: {
            deletedAt: null,
            updatedAt: new Date(),
          },
        });
        return {
          statusCode: HttpStatus.OK,
          message: 'LibrarySaved restored.',
        };
      }
      return {
        statusCode: HttpStatus.NO_CONTENT,
        message: 'Library already saved.',
      };
    }

    if (!existing) {
      throw new HttpException(
        'UserSavedLibrary not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (existing.deletedAt) {
      return {
        statusCode: HttpStatus.NO_CONTENT,
        message: 'Library already unsaved.',
      };
    }

    await this.prisma.userSavedLibrary.update({
      where: {
        user_id_library_id: {
          user_id: userId,
          library_id: libraryId,
        },
      },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Library unsaved.',
    };
  }
}
