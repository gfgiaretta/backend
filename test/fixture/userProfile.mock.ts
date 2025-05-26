import { UserProfileDTO } from 'src/dtos/userDTO.dto';
import {
  mockTestPostResponse,
  mockTestPostResponseSaved,
} from './postResponse.mock';

export function mockUserProfile({
  name,
  description,
  streak,
  profilePictureUrl,
}: Partial<UserProfileDTO>): UserProfileDTO {
  return {
    name: name || 'John Doe',
    description: description || 'This is a description',
    streak: streak || 0,
    profilePictureUrl: profilePictureUrl || 'https://example.com/presigned-url',
    posts: [mockTestPostResponse, mockTestPostResponseSaved],
  };
}

export const mockTestUserProfile: UserProfileDTO = mockUserProfile({
  name: 'John Doe',
});
