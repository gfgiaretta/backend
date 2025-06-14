import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { PostService } from '../post.service';
import {
  mockTestPost,
  mockTestPostSaved,
  mockTestPostResponse,
  mockTestPostResponseSaved,
} from '../../../test/fixture/post.mock';
import { mockTestUser } from '../../../test/fixture/user.mock';
import { HttpStatus } from '@nestjs/common';
import { PresignedService } from '../presigned.service';

jest.mock('@aws-sdk/client-s3');

describe('PostService', () => {
  let service: PostService;
  let prisma: PrismaService;
  const page = 1;
  const postsPerPage = 10;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<PostService>(PostService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
  });

  it('should return an empty array if no posts are found', async () => {
    jest.spyOn(prisma.post, 'findMany').mockResolvedValue([]);

    const result = await service.getPostsWithSavedStatusPaginated(
      '2140b95c-9de6-46b3-a86f-1047fc9278e9',
      page,
      postsPerPage,
    );
    expect(result).toEqual([]);
  });

  it('should return an array of posts', async () => {
    jest
      .spyOn(prisma.post, 'findMany')
      .mockResolvedValue([mockTestPost, mockTestPostSaved]);
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockTestUser);

    const result = await service.getPostsWithSavedStatusPaginated(
      '2140b95c-9de6-46b3-a86f-1047fc9278e9',
      page,
      postsPerPage,
    );
    expect(result).toEqual([mockTestPostResponse, mockTestPostResponseSaved]);
  });

  it('should return an array with 1 saved post', async () => {
    jest.spyOn(prisma.post, 'findMany').mockResolvedValue([mockTestPostSaved]);
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockTestUser);

    const result = await service.getPostsWithSavedStatusPaginated(
      'b60b728d450146a1bbb4836ed61c93c7',
      page,
      postsPerPage,
    );
    expect(result).toEqual([mockTestPostResponseSaved]);
    expect(result[0].isSaved).toBe(true);
  });

  it('should return an array with 1 unsaved post', async () => {
    jest.spyOn(prisma.post, 'findMany').mockResolvedValue([mockTestPost]);
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockTestUser);

    const result = await service.getPostsWithSavedStatusPaginated(
      '2140b95c-9de6-46b3-a86f-1047fc9278e9',
      page,
      postsPerPage,
    );
    expect(result[0].isSaved).toBe(false);
    expect(result).toEqual([mockTestPostResponse]);
  });

  describe('createPost', () => {
    it('should create a post with correct data', async () => {
      const mockInput = {
        title: 'My Title',
        description: 'My Description',
        image: 'https://image.com/img.png',
        userId: 'user-123',
      };

      const mockCreatedPost = {
        post_id: 'mock-post-id',
        title: mockInput.title,
        description: mockInput.description,
        image_url: mockInput.image,
        owner_Id: mockInput.userId,
        createdAt: new Date('2025-05-13T00:00:00Z'),
        updatedAt: new Date('2025-05-13T00:00:00Z'),
        deletedAt: null,
      };

      const mockCreate = jest
        .spyOn(prisma.post, 'create')
        .mockResolvedValue(mockCreatedPost);

      const result = await service.createPost(mockInput);
      expect(result).toBe(HttpStatus.CREATED);

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          title: mockInput.title,
          description: mockInput.description,
          image_url: mockInput.image,
          user: {
            connect: {
              user_id: mockInput.userId,
            },
          },
        },
      });
    });
  });

  describe('savePost', () => {
    it('should return post saved correctly if the relation does not exists', async () => {
      const mockInput = {
        userId: 'user-123',
        save: true,
        postId: 'post-1',
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockTestUser);
      jest.spyOn(prisma.post, 'findUnique').mockResolvedValue(mockTestPost);
      jest.spyOn(prisma.userSavedPost, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.userSavedPost, 'create').mockResolvedValue({
        post_id: 'post-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        user_id: 'user-123',
      });

      const result = await service.savePost(
        mockInput.userId,
        mockInput.postId,
        mockInput.save,
      );

      expect(result).toEqual({
        message: 'Post saved successfully.',
        statusCode: 200,
      });
    });

    it('should return no modification needed if the relation existis and its not deleted', async () => {
      const mockInput = {
        userId: 'user-123',
        save: true,
        postId: 'post-1',
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockTestUser);
      jest.spyOn(prisma.post, 'findUnique').mockResolvedValue(mockTestPost);
      jest.spyOn(prisma.userSavedPost, 'findUnique').mockResolvedValue({
        post_id: 'post-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        user_id: 'user-123',
      });

      const result = await service.savePost(
        mockInput.userId,
        mockInput.postId,
        mockInput.save,
      );

      expect(result).toEqual({
        message: 'No modification were needed.',
        statusCode: 204,
      });
    });

    it('should return success if already existis and deleted is not null', async () => {
      const mockInput = {
        userId: 'user-123',
        save: true,
        postId: 'post-1',
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockTestUser);
      jest.spyOn(prisma.post, 'findUnique').mockResolvedValue(mockTestPost);
      jest.spyOn(prisma.userSavedPost, 'findUnique').mockResolvedValue({
        post_id: 'post-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
        user_id: 'user-123',
      });
      jest.spyOn(prisma.userSavedPost, 'create').mockResolvedValue({
        post_id: 'string',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        user_id: 'user-123',
      });
      jest.spyOn(prisma.userSavedPost, 'update').mockResolvedValue({
        post_id: 'post-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        user_id: 'user-123',
      });

      const result = await service.savePost(
        mockInput.userId,
        mockInput.postId,
        mockInput.save,
      );

      expect(result).toEqual({
        message: 'Post saved successfully.',
        statusCode: 200,
      });
    });

    it('should return no modification needed if the relation exists and its not deleted', async () => {
      const mockInput = {
        userId: 'user-123',
        save: true,
        postId: 'post-1',
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockTestUser);
      jest.spyOn(prisma.post, 'findUnique').mockResolvedValue(mockTestPost);
      jest.spyOn(prisma.userSavedPost, 'findUnique').mockResolvedValue({
        post_id: 'post-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        user_id: 'user-123',
      });

      const result = await service.savePost(
        mockInput.userId,
        mockInput.postId,
        mockInput.save,
      );

      expect(result).toEqual({
        message: 'No modification were needed.',
        statusCode: 204,
      });
    });

    it('should return success and remove post', async () => {
      const mockInput = {
        userId: 'user-123',
        save: false,
        postId: 'post-1',
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockTestUser);
      jest.spyOn(prisma.post, 'findUnique').mockResolvedValue(mockTestPost);
      jest.spyOn(prisma.userSavedPost, 'findUnique').mockResolvedValue({
        post_id: 'post-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        user_id: 'user-123',
      });
      jest.spyOn(prisma.userSavedPost, 'create').mockResolvedValue({
        post_id: 'post-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        user_id: 'user-123',
      });
      jest.spyOn(prisma.userSavedPost, 'update').mockResolvedValue({
        post_id: 'post-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        user_id: 'user-123',
      });

      const result = await service.savePost(
        mockInput.userId,
        mockInput.postId,
        mockInput.save,
      );

      expect(result).toEqual({
        message: 'Post removed successfully.',
        statusCode: 200,
      });
    });

    it('should return no modification needed in case of deleted post to not be saved anymore', async () => {
      const mockInput = {
        userId: 'user-123',
        save: false,
        postId: 'post-1',
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockTestUser);
      jest.spyOn(prisma.post, 'findUnique').mockResolvedValue(mockTestPost);
      jest.spyOn(prisma.userSavedPost, 'findUnique').mockResolvedValue({
        post_id: 'post-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
        user_id: 'user-123',
      });
      jest.spyOn(prisma.userSavedPost, 'create').mockResolvedValue({
        post_id: 'post-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        user_id: 'user-123',
      });
      jest.spyOn(prisma.userSavedPost, 'update').mockResolvedValue({
        post_id: 'post-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
        user_id: 'user-123',
      });

      const result = await service.savePost(
        mockInput.userId,
        mockInput.postId,
        mockInput.save,
      );

      expect(result).toEqual({
        message: 'No modification were needed.',
        statusCode: 204,
      });
    });
  });
});
