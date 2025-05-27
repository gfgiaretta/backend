import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

const passwordMessage =
  'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.';
const passwordRegex =
  /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!-/:-@[-`{-~]).{8,}$/;

export class UserDTO
  implements
    Pick<
      User,
      'name' | 'email' | 'password' | 'description' | 'profile_picture_url'
    >
{
  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'John.doe@domain.com' })
  email: string;

  @ApiProperty({ example: 'Senh@123' })
  password: string;

  @ApiProperty({ example: 'This is a description' })
  description: string | null;

  @ApiProperty({ example: 'https://thispersondoesnotexist.com/' })
  profile_picture_url: string | null;
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'John Doe',
  })
  name!: string;

  @IsEmail()
  @ApiProperty({
    example: 'your.email@provider.com',
  })
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(passwordRegex, {
    message: passwordMessage,
  })
  @ApiProperty({
    example: 'Senh@123',
    description: passwordMessage,
  })
  password!: string;
}

export class StatisticsResponseDTO {
  @ApiProperty({
    example: {
      Design: 2,
      Criatividade: 1,
      Escrita: 1,
    },
  })
  graph: Record<string, number>;

  @ApiProperty({
    example: {
      1: 'Design',
      2: 'Escrita',
      3: 'Criatividade',
      4: 'Design',
    },
  })
  calendar: Record<string, string>;

  @ApiProperty({ example: 8 })
  savedItems: number;
}

export class UserStreakDTO {
  @ApiProperty({ example: 5 })
  streak: number;

  @ApiProperty({ example: '2023-10-01T00:00:00.000Z' })
  lastExerciseDate: Date | null;
}
