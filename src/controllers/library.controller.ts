import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LibraryResponseDTO } from '../dtos/library.dto';
import { LibraryService } from '../services/library.service';
import { AuthenticatedRequest } from '../dtos/auth.dto';

@ApiTags('Library')
@ApiBearerAuth('Authorization')
@Controller('/library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get('/')
  async getLibrary(
    @Req() req: AuthenticatedRequest,
  ): Promise<LibraryResponseDTO[]> {
    return this.libraryService.getLibraryWithSavedInfo(req.payload.userId);
  }
}
