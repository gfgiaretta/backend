import { Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CommentService } from '../services/comment.service';
import { GetCommentResponseDTO } from 'src/dtos/comment.dto';
import { IsPublic } from 'src/auth/decorators/isPublic.decorator';

@ApiTags('Comment')
@ApiBearerAuth('Authorization')
@Controller('/comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @IsPublic()
  @Get('/')
  async getUploadURL(@Query('post_id') post_id: string): Promise<GetCommentResponseDTO[]> {
    return await this.commentService.getComments(post_id);
  }
}
