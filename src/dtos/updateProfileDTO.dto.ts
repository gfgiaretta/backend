import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'This is my new biography',
    required: false,
  })
  description?: string;

  @IsOptional()
  @IsUrl()
  @ApiProperty({
    example: 'https://thispersondoesnotexist.com/',
    required: false,
  })
  profilePictureUrl?: string;
}
