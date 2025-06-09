import { User } from '@prisma/client';
import { UserInterestDto } from '../../src/dtos/userInterest.dto';
import { CreateUserDto } from '../../src/dtos/user.dto';

export function mockUser({
  name,
  email,
  description,
  streak,
  createdAt,
  updatedAt,
  deletedAt,
}: Partial<User>): User {
  return {
    user_id: 'b60b728d450146a1bbb4836ed61c93c7',
    name: name || 'John Doe',
    email: email || 'John.doe@domain.com',
    description: description || 'This is a description',
    password: 'Senh@123',
    profile_picture_path: 'https://signedDownloadUrl.com',
    streak: streak || 0,
    createdAt: createdAt || new Date('2025-02-24T17:30:00'),
    updatedAt: updatedAt || new Date('2025-02-24T17:30:00'),
    deletedAt: deletedAt || null,
  };
}

export const mockTestUser: User = mockUser({
  user_id: 'b60b728d450146a1bbb4836ed61c93c7',
  name: 'John Doe',
  email: 'John.doe@domain.com',
});

export const mockCreateUserDto: CreateUserDto = {
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  password: 'Senh@123',
};

export const mockUserInterestDto: UserInterestDto = {
  interest: ['int001', 'int002', 'int003'],
};
