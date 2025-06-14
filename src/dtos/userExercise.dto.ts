import { ApiProperty } from '@nestjs/swagger';
import { InputJsonValue } from '@prisma/client/runtime/library';
import { IsObject, IsString } from 'class-validator';

export class UserExerciseDTO {
  @ApiProperty({ example: '0b171ebe-9f75-40e8-9dad-1f667fc12ac5' })
  @IsString()
  exerciseId: string;

  @ApiProperty({ example: '{}' })
  @IsObject()
  content: InputJsonValue;
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

  @ApiProperty({ example: '{}' })
  @IsObject()
  content: InputJsonValue;
}
