import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { BoilerplateService } from '../services/boilerplate.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsPublic } from '../auth/decorators/isPublic.decorator';
import { User } from '@prisma/client';
import { UserDTO } from '../dtos/userDTO.dto';

@ApiTags('Boilerplates') // Swagger Tag
@ApiBearerAuth('Authorization') // Swagger Bearer Auth
@Controller('boilerplates') // Base route
export class BoilerplateController {
  constructor(private readonly boilerplateService: BoilerplateService) {}

  @IsPublic() // Does not require authentication
  @Get('/hello') // Route for this get request
  getHello(): string {
    return this.boilerplateService.getHello();
  }

  @Get('/getAllUsers') // Route for this get request
  async getMethod(): Promise<User[]> {
    return await this.boilerplateService.getMethod();
  }

  @IsPublic() // Does not require authentication
  @Post('/createUser') // Route for this post request
  async postMethod(@Body() user: UserDTO): Promise<HttpStatus> {
    return await this.boilerplateService.postMethod(user);
  }

  @Delete('/delete/:id') // Route for this delete request
  async deleteMethod(@Param('id') id: string): Promise<HttpStatus> {
    return await this.boilerplateService.deleteMethod(id);
  }
}
