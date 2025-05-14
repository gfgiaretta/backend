import { Module } from '@nestjs/common';
import { LibraryController } from '../controllers/library.controller';
import { LibraryService } from '../services/library.service';
import { PrismaService } from '../services/prisma.service';

@Module({
  imports: [],
  controllers: [LibraryController],
  providers: [LibraryService, PrismaService],
})
export class LibraryModule {}
