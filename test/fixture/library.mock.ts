import { Library, UserSavedLibrary } from '@prisma/client';
import { LibraryResponseDTO } from '../../src/dtos/library.dto';

export function mockLibrary({
  library_id,
  description,
  link,
  image_url,
  createdAt,
  updatedAt,
  deletedAt,
  user_savedLibrary,
}: Partial<Library> & {
  user_savedLibrary?: Partial<UserSavedLibrary>[];
}): Library & {
  user_savedLibrary?: Partial<UserSavedLibrary>[];
} {
  return {
    library_id: library_id || 'lib123',
    description: description || 'Library description',
    link: link || 'https://example.com/library',
    image_url: image_url || 'https://example.com/image.png',
    createdAt: createdAt || new Date('2025-01-01T12:00:00Z'),
    updatedAt: updatedAt || new Date('2025-01-01T12:00:00Z'),
    deletedAt: deletedAt || null,
    user_savedLibrary: user_savedLibrary || [],
  };
}

export function mockLibraryResponse({
  library_id,
  description,
  link,
  image_url,
  createdAt,
  updatedAt,
  isSaved,
}: Partial<LibraryResponseDTO>): LibraryResponseDTO {
  return {
    library_id: library_id || 'lib123',
    description: description || 'Library description',
    link: link || 'https://example.com/library',
    image_url: image_url || 'https://example.com/image.png',
    createdAt: createdAt || new Date('2025-01-01T12:00:00Z'),
    updatedAt: updatedAt || new Date('2025-01-01T12:00:00Z'),
    isSaved: isSaved ?? false,
  };
}

export const mockTestLibrary: Library = mockLibrary({
  library_id: 'lib123',
  description: 'Test Library',
});

export const mockTestLibrarySaved: Library = mockLibrary({
  library_id: 'lib123',
  description: 'Test Library',
  user_savedLibrary: [
    {
      user_id: 'user123',
      library_id: 'lib123',
      createdAt: new Date('2025-01-01T12:00:00Z'),
      updatedAt: new Date('2025-01-01T12:00:00Z'),
    },
  ],
});

export const mockTestLibraryResponse: LibraryResponseDTO = mockLibraryResponse({
  library_id: 'lib123',
  description: 'Test Library',
});

export const mockTestLibraryResponseSaved: LibraryResponseDTO =
  mockLibraryResponse({
    library_id: 'lib123',
    description: 'Test Library',
    isSaved: true,
  });
