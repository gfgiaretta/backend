import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const numOfInterests = 3;

export class UserInterestDto {
  @ApiProperty({
    description: `Array com exatamente ${numOfInterests} IDs de interesse`,
    example: ['int001', 'int002', 'int003'],
    minItems: numOfInterests,
    maxItems: numOfInterests,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  interest: string[];
}
