import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UserExerciseDTO {
  @ApiProperty({ example: 'ecc4901b-f248-4053-8832-24a9b4a6559e' })
  @IsString()
  userId: string;

  @ApiProperty({ example: '0b171ebe-9f75-40e8-9dad-1f667fc12ac5' })
  @IsString()
  exerciseId: string;
}
