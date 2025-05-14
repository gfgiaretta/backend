import { Module } from '@nestjs/common';
import { BoilerplateController } from '../controllers/boilerplate.controller';
import { BoilerplateService } from '../services/boilerplate.service';
import { PrismaService } from 'src/services/prisma.service';

@Module({
  imports: [],
  controllers: [BoilerplateController],
  providers: [BoilerplateService, PrismaService],
})
export class BoilerplateModule {}
