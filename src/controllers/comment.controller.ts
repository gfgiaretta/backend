import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CommentService } from '../services/comment.service';
import { CreateCommentDTO, GetCommentResponseDTO } from 'src/dtos/comment.dto';
import { AuthenticatedRequest } from 'src/dtos/auth.dto';

@ApiTags('Comment')
@ApiBearerAuth('Authorization')
@Controller('/comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get('/')
  async getComments(
    @Query('postId') postId: string,
  ): Promise<GetCommentResponseDTO[]> {
    return await this.commentService.getComments(postId);
  }

  @Delete('/:id')
  async deleteComment(
    @Req() req: AuthenticatedRequest,
    @Param('id') commentId: string,
  ): Promise<HttpStatus> {
    const userId = req.payload.userId;
    return await this.commentService.deleteComment(userId, commentId);
  }

  @Post('/')
  async createComment(
    @Req() req: AuthenticatedRequest,
    @Body() body: CreateCommentDTO,
  ): Promise<HttpStatus> {
    const userId = req.payload.userId;
    return await this.commentService.createComment({
      ...body,
      userId,
    });
  }
}
