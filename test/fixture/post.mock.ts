import { Post, UserSavedPost } from '@prisma/client';
import { PostResponseDTO } from '../../src/dtos/post.dto';

export function mockPost({
  post_id,
  owner_Id,
  title,
  description,
  image_url,
  createdAt,
  updatedAt,
  deletedAt,
  user_savedPost,
}: Partial<Post> & { user_savedPost?: Partial<UserSavedPost>[] }): Post & {
  user_savedPost?: Partial<UserSavedPost>[];
} {
  return {
    post_id: post_id || 'd7e3b6e3-1f11-4fd2-86e3-23456789abcd',
    owner_Id: owner_Id || 'b60b728d450146a1bbb4836ed61c93c7',
    title: title || 'Título do post',
    description: description || 'Descrição do post de exemplo',
    image_url: image_url || 'https://img.com/post.png',
    createdAt: createdAt || new Date('2025-04-01T12:00:00Z'),
    updatedAt: updatedAt || new Date('2025-04-01T12:00:00Z'),
    deletedAt: deletedAt || null,
    user_savedPost: user_savedPost || [],
  };
}

export const mockTestPost: Post = mockPost({
  title: 'Meu primeiro post',
});

export const mockTestPostSaved: Post = mockPost({
  title: 'Meu primeiro post',
  user_savedPost: [
    {
      user_id: 'b60b728d450146a1bbb4836ed61c93c7',
      post_id: 'd7e3b6e3-1f11-4fd2-86e3-23456789abcd',
      createdAt: new Date('2025-04-05T12:00:00Z'),
      updatedAt: new Date('2025-04-06T12:00:00Z'),
    },
  ],
});

export function mockPostResponse({
  post_id,
  owner,
  title,
  description,
  image_url,
  createdAt,
  updatedAt,
  isSaved,
}: Partial<PostResponseDTO>): PostResponseDTO {
  return {
    post_id: post_id || 'd7e3b6e3-1f11-4fd2-86e3-23456789abcd',
    owner: owner || {
      name: 'John Doe',
      profile_picture_url: 'https://signedDownloadUrl.com',
    },
    title: title || 'Título do post',
    description: description || 'Descrição do post de exemplo',
    image_url: image_url || 'https://signedDownloadUrl.com',
    createdAt: createdAt || new Date('2025-04-01T12:00:00Z'),
    updatedAt: updatedAt || new Date('2025-04-01T12:00:00Z'),
    isSaved: isSaved ?? false,
  };
}

export const mockTestPostResponse: PostResponseDTO = mockPostResponse({
  title: 'Meu primeiro post',
});

export const mockTestPostResponseSaved: PostResponseDTO = mockPostResponse({
  title: 'Meu primeiro post',
  isSaved: true,
});
