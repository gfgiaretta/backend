import { ApiProperty } from '@nestjs/swagger';

export class LibraryResponseDTO {
  @ApiProperty({ example: 'dfd2f648-bf7e-4a6e-9b17-1b26d3aef21a' })
  library_id: string;

  @ApiProperty({ example: 'Curso de NestJS' })
  description: string;

  @ApiProperty({ example: 'https://site.com/nestjs' })
  link: string;

  @ApiProperty({ example: 'https://img.com/nestjs.png' })
  image_url: string;

  @ApiProperty({ example: '2024-04-01T12:34:56.789Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-04-02T14:22:31.123Z' })
  updatedAt: Date;

  @ApiProperty({ example: true })
  isSaved: boolean;
}
