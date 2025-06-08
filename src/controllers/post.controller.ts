import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Param,
  Req,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../dtos/auth.dto';
import { ApiBearerAuth, ApiTags, ApiResponse } from '@nestjs/swagger';
import {
  PostResponseDTO,
  SavePostDTO,
  SavePostResponseDTO,
} from '../dtos/post.dto';
import { PostService } from '../services/post.service';
import { CreatePostDTO, CreatePostResponseDTO } from '../dtos/post.dto';

@ApiTags('Post')
@ApiBearerAuth('Authorization')
@Controller('/post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('/:page')
  async getPosts(
    @Req() req: AuthenticatedRequest,
    @Param('page') page: number = 1,
  ): Promise<PostResponseDTO[]> {
    const limit: number = 10;

    if (page < 1) {
      throw new HttpException(
        'Page must be greater than or equal to 1',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return this.postService.getPostsWithSavedStatusPaginated(
      req.payload.userId,
      Number(page),
      limit,
    );
  }

  @Post('/')
  async createPost(
    @Req() req: AuthenticatedRequest,
    @Body() body: CreatePostDTO,
  ): Promise<CreatePostResponseDTO> {
    const userId = req.payload.userId;

    await this.postService.createPost({
      ...body,
      userId,
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Post created successfully.',
    };
  }

  @Put('/save')
  async savePost(
    @Body() body: SavePostDTO,
    @Req() req: AuthenticatedRequest,
  ): Promise<SavePostResponseDTO> {
    const userId = req.payload.userId;

    const statusCode = await this.postService.savePost(
      userId,
      body.postId,
      body.save,
    );

    let message: string;

    switch (statusCode) {
      case HttpStatus.OK:
        message = body.save
          ? 'Post salvo com sucesso.'
          : 'Post removido com sucesso.';
        break;
      case HttpStatus.NO_CONTENT:
        message = 'Nenhuma modificação foi necessária.';
        break;
      case HttpStatus.NOT_FOUND:
        message = body.save
          ? 'Usuário ou post não encontrado.'
          : 'Post salvo não encontrado para remoção.';
        break;
      case HttpStatus.BAD_REQUEST:
        message = 'Requisição inválida.';
        break;
      case HttpStatus.INTERNAL_SERVER_ERROR:
      default:
        message = 'Erro interno no servidor.';
        break;
    }

    return {
      statusCode,
      message,
    };
  }
}
