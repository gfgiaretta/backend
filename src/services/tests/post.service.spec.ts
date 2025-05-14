import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { PostService } from '../post.service';
import {
  mockTestPostResponse,
  mockTestPostResponseSaved,
} from '../../../test/fixture/postResponse.mock';
import {
  mockTestPost,
  mockTestPostSaved,
} from '../../../test/fixture/post.mock';
import { mockTestUser } from '../../../test/fixture/user.mock';

describe('PostService', () => {
  let service: PostService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostService, PrismaService],
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
      1,
      10,
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
      1,
      10,
    );
    expect(result).toEqual([mockTestPostResponse, mockTestPostResponseSaved]);
  });

  it('should return an array with 1 saved post', async () => {
    jest.spyOn(prisma.post, 'findMany').mockResolvedValue([mockTestPostSaved]);
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockTestUser);

    const result = await service.getPostsWithSavedStatusPaginated(
      'b60b728d450146a1bbb4836ed61c93c7',
      1,
      10,
    );
    expect(result).toEqual([mockTestPostResponseSaved]);
    expect(result[0].isSaved).toBe(true);
  });

  it('should return an array with 1 unsaved post', async () => {
    jest.spyOn(prisma.post, 'findMany').mockResolvedValue([mockTestPost]);
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockTestUser);

    const result = await service.getPostsWithSavedStatusPaginated(
      '2140b95c-9de6-46b3-a86f-1047fc9278e9',
      1,
      10,
    );
    expect(result[0].isSaved).toBe(false);
    expect(result).toEqual([mockTestPostResponse]);
  });
});
