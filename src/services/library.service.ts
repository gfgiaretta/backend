import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { LibraryResponseDTO } from '../dtos/libraryDTO.dto';

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
}
