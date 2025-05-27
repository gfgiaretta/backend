import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedRequest } from '../dtos/authDTO.dto';
import { PresignedService } from 'src/services/presigned.service';

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
}
