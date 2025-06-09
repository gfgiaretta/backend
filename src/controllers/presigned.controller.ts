import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedRequest } from '../dtos/auth.dto';
import { PresignedService } from '../services/presigned.service';
import { IsPublic } from 'src/auth/decorators/isPublic.decorator';

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

  @IsPublic()
  @Get('/dnl')
  async getDowloadURL(): Promise<string> {
    const key = `default_profile.jpeg`;
    return await this.presignedService.getDownloadURL(key);
  }
}
