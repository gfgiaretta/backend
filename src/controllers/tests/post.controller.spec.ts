import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../services/prisma.service';
import { PostController } from '../post.controller';
import { CreatePostDTO } from '../../dtos/postDTO.dto';
import { PostService } from '../../services/post.service';
import {
  mockTestPostResponse,
  mockTestPostResponseSaved,
} from '../../../test/fixture/postResponse.mock';
import { AuthenticatedRequest } from '../../dtos/authDTO.dto';
import { PresignedService } from '../../services/presigned.service';
import { HttpStatus } from '@nestjs/common';

jest.mock('@aws-sdk/client-s3');

describe('PostController', () => {
  let postController: PostController;
  let postService: PostService;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [
        PostService,
        PrismaService,
        {
          provide: PresignedService,
          useValue: {
            getUploadURL: jest
              .fn()
              .mockResolvedValue('https://signedUploadUrl.com'),
            getDownloadURL: jest
              .fn()
              .mockResolvedValue('https://signedDownloadUrl.com'),
          },
        },
      ],
    }).compile();

    postController = testModule.get<PostController>(PostController);
    postService = testModule.get<PostService>(PostService);
  });

  describe('getPosts', () => {
    it('should be defined', () => {
      expect(postService).toBeDefined();
      expect(postController).toBeDefined();
    });

    it('should return all posts', async () => {
      jest
        .spyOn(postService, 'getPostsWithSavedStatusPaginated')
        .mockResolvedValue([mockTestPostResponse, mockTestPostResponseSaved]);

      const mockRequest = {
        payload: { userId: 'b60b728d450146a1bbb4836ed61c93c7' },
      } as AuthenticatedRequest;

      const result = await postController.getPosts(mockRequest, 1);

      expect(result).toEqual([mockTestPostResponse, mockTestPostResponseSaved]);
    });

    it('should return an empty array if no posts are found', async () => {
      jest
        .spyOn(postService, 'getPostsWithSavedStatusPaginated')
        .mockResolvedValue([]);

      const mockRequest = {
        payload: { userId: 'b60b728d450146a1bbb4836ed61c93c7' },
      } as AuthenticatedRequest;
      const result = await postController.getPosts(mockRequest, 1);

      expect(result).toEqual([]);
    });
  });

  describe('createPost', () => {
    it('should create a post successfully', async () => {
      const mockRequest = {
        payload: { userId: 'user-id-123' },
      } as AuthenticatedRequest;

      const mockBody: CreatePostDTO = {
        title: 'Test Post',
        description: 'Test Description',
        image: 'https://example.com/image.jpg',
      };

      const mockCreatePost = jest
        .spyOn(postService, 'createPost')
        // eslint-disable-next-line no-magic-numbers
        .mockResolvedValue(201);

      const result = await postController.createPost(mockRequest, mockBody);

      expect(mockCreatePost).toHaveBeenCalledWith({
        ...mockBody,
        userId: 'user-id-123',
      });
      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'Post created successfully.',
      });
    });
  });

  it('should return an array with 1 saved post', async () => {
    jest
      .spyOn(postService, 'getPostsWithSavedStatusPaginated')
      .mockResolvedValue([mockTestPostResponseSaved]);

    const mockRequest = {
      payload: { userId: 'b60b728d450146a1bbb4836ed61c93c7' },
    } as AuthenticatedRequest;

    const result = await postController.getPosts(mockRequest, 1);

    expect(result).toEqual([mockTestPostResponseSaved]);
    expect(result[0].isSaved).toBe(true);
  });

  it('should return an array with 1 unsaved post', async () => {
    jest
      .spyOn(postService, 'getPostsWithSavedStatusPaginated')
      .mockResolvedValue([mockTestPostResponse]);

    const mockRequest = {
      payload: { userId: 'b60b728d450146a1bbb4836ed61c93c7' },
    } as AuthenticatedRequest;

    const result = await postController.getPosts(mockRequest, 1);

    expect(result).toEqual([mockTestPostResponse]);
    expect(result[0].isSaved).toBe(false);
  });
});
