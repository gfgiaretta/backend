import { UserProfileDTO } from '../../src/dtos/user.dto';
import { mockTestPostResponse, mockTestPostResponseSaved } from './post.mock';

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
    profilePictureUrl: profilePictureUrl || 'https://signedDownloadUrl.com',
    posts: [mockTestPostResponse, mockTestPostResponseSaved],
  };
}

export const mockTestUserProfile: UserProfileDTO = mockUserProfile({
  name: 'John Doe',
});
