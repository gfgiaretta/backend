import { ApiProperty } from '@nestjs/swagger';

export class SavePostResponseDTO {
  @ApiProperty({ example: 201 })
  statusCode: number;

  @ApiProperty({ example: 'Post saved successfully.' })
  message: string;
}
