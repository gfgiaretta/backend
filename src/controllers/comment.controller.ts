import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CommentService } from '../services/comment.service';
import { CreateCommentDTO, GetCommentResponseDTO } from 'src/dtos/comment.dto';
import { IsPublic } from 'src/auth/decorators/isPublic.decorator';
import { AuthenticatedRequest } from 'src/dtos/auth.dto';

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

  @Patch(':id')
  async deleteComment(@Param('id') commentId: string) {
    return await this.commentService.deleteComment(commentId);
  }

  @Post('/')
    async createComment(
      @Req() req: AuthenticatedRequest,
      @Body() body: CreateCommentDTO,
    ): Promise<void> {
      const userId = req.payload.userId;
  
      await this.commentService.createComment({
        ...body,
        userId,
      });

    }
}
