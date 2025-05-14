import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  AccessTokenDTO,
  AuthenticatedRequest,
  AuthenticatedUserDTO,
} from '../dtos/authDTO.dto';
import { LoginDTO } from '../dtos/loginDTO.dto';
import { IsPublic } from '../auth/decorators/isPublic.decorator';
import { AuthService } from '../services/auth.service';

@ApiBearerAuth('Authorization')
@ApiTags('Auth')
@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @Post('/login')
  async login(@Body() loginDTO: LoginDTO): Promise<AccessTokenDTO> {
    return this.authService.validateUser(loginDTO);
  }

  @Get('/token')
  @HttpCode(HttpStatus.OK)
  async validateToken(
    @Req() req: AuthenticatedRequest,
  ): Promise<AuthenticatedUserDTO> {
    return this.authService.validateToken(req.payload.userId);
  }

  @Get('/testAuth')
  testAuth(@Req() req: AuthenticatedRequest) {
    return req.payload.userId;
  }
}
