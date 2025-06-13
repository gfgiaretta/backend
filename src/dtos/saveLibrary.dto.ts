import { IsBoolean, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveLibraryDTO {
  @ApiProperty({
    description: 'ID da biblioteca a ser salva ou removida dos salvos',
    example: 'b9678d98-da01-41a1-a61c-7a05f64066a6',
  })
  @IsString()
  library_id: string;

  @ApiProperty({
    description:
      'Define se a biblioteca deve ser salva (true) ou removida dos salvos (false)',
    example: true,
  })
  @IsBoolean()
  save: boolean;
}
