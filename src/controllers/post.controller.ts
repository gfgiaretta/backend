import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Req,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../dtos/auth.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PostResponseDTO } from '../dtos/post.dto';
import { PostService } from '../services/post.service';

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
}
