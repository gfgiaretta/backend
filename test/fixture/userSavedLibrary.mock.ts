import { UserSavedLibrary } from '@prisma/client';

export function mockUserSavedLibrary({
  user_id,
  library_id,
  createdAt,
  updatedAt,
  deletedAt,
}: Partial<UserSavedLibrary> = {}): UserSavedLibrary {
  return {
    user_id: user_id || 'b60b728d450146a1bbb4836ed61c93c7',
    library_id: library_id || 'lib123',
    createdAt: createdAt || new Date('2025-01-01T12:00:00Z'),
    updatedAt: updatedAt || new Date('2025-01-01T12:00:00Z'),
    deletedAt: deletedAt ?? null,
  };
}

export const mockTestUserSavedLibrary: UserSavedLibrary = mockUserSavedLibrary({
  library_id: 'lib123',
  user_id: 'b60b728d450146a1bbb4836ed61c93c7',
});
