import { Module } from '@nestjs/common';
import { PresignedController } from '../controllers/presigned.controller';
import { PresignedService } from '../services/presigned.service';

@Module({
  imports: [],
  controllers: [PresignedController],
  providers: [PresignedService],
})
export class PresignedModule {}
