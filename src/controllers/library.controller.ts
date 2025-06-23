import { Body, Controller, Get, Put, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { LibraryResponseDTO } from '../dtos/library.dto';
import { LibraryService } from '../services/library.service';
import { AuthenticatedRequest } from '../dtos/auth.dto';
import { SaveLibraryDTO } from '../dtos/saveLibrary.dto';

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

  @Put('/save')
  @ApiBody({ type: SaveLibraryDTO })
  saveLibrary(
    @Req() req: AuthenticatedRequest,
    @Body() body: { library_id: string; save: boolean },
  ) {
    const userId = req.payload.userId;
    return this.libraryService.saveLibrary(userId, body.library_id, body.save);
  }
}
