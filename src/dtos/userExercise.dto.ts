import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UserExerciseDTO {
  @ApiProperty({ example: 'ecc4901b-f248-4053-8832-24a9b4a6559e' })
  @IsString()
  userId: string;

  @ApiProperty({ example: '0b171ebe-9f75-40e8-9dad-1f667fc12ac5' })
  @IsString()
  exerciseId: string;

  @ApiProperty({ example: 'content json' })
  @IsString()
  content: string;
}

export class UserExerciseHistoryDTO {
  @ApiProperty({ example: 'Jornada da Gratidão' })
  title: string;

  @ApiProperty({ example: 'Aqui a ideia é exercitar...' })
  description: string;

  @ApiProperty({ example: 'Escrita' })
  interest: string;

  @ApiProperty({ example: '2025-04-01T12:00:00Z' })
  performedAt: Date;

  @ApiProperty({ example: 'content json' })
  content: string;
}
