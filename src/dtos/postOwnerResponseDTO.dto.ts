import { ApiProperty } from '@nestjs/swagger';

export class postOwnerResponseDTO {
  @ApiProperty({ example: '9e2b3a8b-3e9f-44b3-b15e-4b7b3e3e3c9a' })
  name: string;

  @ApiProperty({ example: 'https://thispersondoesnotexist.com/' })
  profile_picture_url: string | null;
}
