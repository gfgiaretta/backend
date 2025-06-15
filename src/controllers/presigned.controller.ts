import { Controller, Get, Param, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedRequest } from '../dtos/auth.dto';
import { PresignedService } from '../services/presigned.service';

@ApiTags('Presigned')
@ApiBearerAuth('Authorization')
@Controller('/presigned')
export class PresignedController {
  constructor(private readonly presignedService: PresignedService) {}

  @Get('/')
  async getUploadURL(@Req() req: AuthenticatedRequest): Promise<string> {
    const key = `${req.payload.userId}/${Date.now()}.jpeg`;
    return await this.presignedService.getUploadURL(key);
  }

  @Get('/:key')
  async getDownloadURL(@Param('key') key: string): Promise<string> {
    return await this.presignedService.getDownloadURL(key);
  }
}
