import {
  Controller,
  Post as PostMethod,
  Param,
  Req,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiResponse } from '@nestjs/swagger';
import { AuthenticatedRequest } from '../dtos/auth.dto';
import { UserSavedPostService } from '../services/user-saved-post.service';
import { SavePostResponseDTO } from '../dtos/user-saved-post.dto';

@ApiTags('Post')
@ApiBearerAuth('Authorization')
@Controller('/post')
export class UserSavedPostController {
  constructor(private readonly service: UserSavedPostService) {}

  @PostMethod('/save/:postId')
  @ApiResponse({
    status: 201,
    description: 'Post saved successfully.',
    type: SavePostResponseDTO,
  })
  @ApiResponse({
    status: 400,
    description: 'Post ID is required or post already saved.',
  })
  @ApiResponse({ status: 404, description: 'User or Post not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async savePost(
    @Param('postId') postId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<SavePostResponseDTO> {
    const userId = req.payload.userId;

    if (!postId) {
      throw new HttpException('Post ID is required.', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.service.savePost(userId, postId);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Post saved successfully.',
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Internal server error.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
