import { ApiProperty } from '@nestjs/swagger';
import { postOwnerResponseDTO } from './postOwnerResponseDTO.dto';

export class PostResponseDTO {
  @ApiProperty({ example: 'f6c3a8b2-4f7d-4a9b-95d4-9c2e3a6e46d9' })
  post_id: string;

  @ApiProperty({
    example: {
      name: 'John Doe',
      profile_picture_url: 'https://thispersondoesnotexist.com/',
    },
  })
  owner: postOwnerResponseDTO;

  @ApiProperty({ example: 'Título do post' })
  title: string;

  @ApiProperty({ example: 'Descrição do post' })
  description?: string;

  @ApiProperty({ example: 'https://img.com/post.png' })
  image_url: string;

  @ApiProperty({ example: '2024-04-01T12:34:56.789Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-04-02T14:22:31.123Z' })
  updatedAt: Date;

  @ApiProperty({ example: true })
  isSaved: boolean;
}
