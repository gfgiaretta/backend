import { PostResponseDTO } from '../../src/dtos/postDTO.dto';

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
      profilePictureUrl: 'https://example.com/presigned-url',
    },
    title: title || 'Título do post',
    description: description || 'Descrição do post de exemplo',
    image_url: image_url || 'https://example.com/presigned-url',
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
