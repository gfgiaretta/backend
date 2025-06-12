import { Test, TestingModule } from '@nestjs/testing';
import { LibraryService } from '../library.service';
import { PrismaService } from '../prisma.service';
import {
  mockTestLibraryResponseSaved,
  mockTestLibrarySaved,
  mockTestLibraryResponse,
  mockTestLibrary,
} from '../../../test/fixture/library.mock';
import {
  mockTestUserSavedLibrary,
  mockUserSavedLibrary,
} from '../../../test/fixture/userSavedLibrary.mock';

describe('LibraryService', () => {
  let service: LibraryService;
  let prisma: PrismaService;
  const mockUserId = 'b60b728d450146a1bbb4836ed61c93c7';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LibraryService, PrismaService],
    }).compile();

    service = module.get<LibraryService>(LibraryService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('Should be defined', () => {
    expect(prisma).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('getLibraryWithSavedInfo', () => {
    it('should return a list of saved libraries', async () => {
      jest
        .spyOn(prisma.library, 'findMany')
        .mockResolvedValue([mockTestLibrarySaved, mockTestLibrary]);

      const result = await service.getLibraryWithSavedInfo(mockUserId);

      expect(result).toEqual([
        mockTestLibraryResponseSaved,
        mockTestLibraryResponse,
      ]);
    });

    it('Should handle unexpected error from prisma', async () => {
      const mockError = new Error('Unexpected database error');
      jest.spyOn(prisma.library, 'findMany').mockRejectedValue(mockError);

      await expect(service.getLibraryWithSavedInfo(mockUserId)).rejects.toThrow(
        mockError,
      );
    });
  });

  describe('saveLibrary', () => {
    it('should save the library if it exists and was not saved before', async () => {
      jest
        .spyOn(prisma.library, 'findUnique')
        .mockResolvedValue(mockTestLibrary);

      jest.spyOn(prisma.userSavedLibrary, 'findFirst').mockResolvedValue(null);

      const createSpy = jest
        .spyOn(prisma.userSavedLibrary, 'create')
        .mockResolvedValue({
          user_id: mockUserId,
          library_id: mockTestLibrary.library_id,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        });

      const result = await service.saveLibrary(
        mockUserId,
        mockTestLibrary.library_id,
        true,
      );

      expect(createSpy).toHaveBeenCalledWith({
        data: {
          user_id: mockUserId,
          library_id: mockTestLibrary.library_id,
        },
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Library saved.',
      });
    });

    it('should throw an error if the library does not exist', async () => {
      jest.spyOn(prisma.library, 'findUnique').mockResolvedValue(null);

      await expect(
        service.saveLibrary(mockUserId, 'nonexistent-library', true),
      ).rejects.toThrow('Library not found.');
    });

    it('should handle unexpected error from prisma', async () => {
      const mockError = new Error('Unexpected database error');
      jest.spyOn(prisma.library, 'findUnique').mockRejectedValue(mockError);

      await expect(
        service.saveLibrary(mockUserId, mockTestLibrary.library_id, true),
      ).rejects.toThrow(mockError);
    });

    it('should restore a previously deleted saved library', async () => {
      const deletedLibrary = mockUserSavedLibrary({
        deletedAt: new Date('2024-01-01T00:00:00Z'),
      });

      jest
        .spyOn(prisma.library, 'findUnique')
        .mockResolvedValue(mockTestLibrary);

      jest
        .spyOn(prisma.userSavedLibrary, 'findFirst')
        .mockResolvedValue(deletedLibrary);

      const updateSpy = jest
        .spyOn(prisma.userSavedLibrary, 'update')
        .mockResolvedValue({
          ...deletedLibrary,
          deletedAt: null,
          updatedAt: new Date(),
        });

      const result = await service.saveLibrary(
        mockTestUserSavedLibrary.user_id,
        mockTestUserSavedLibrary.library_id,
        true,
      );

      expect(updateSpy).toHaveBeenCalledWith({
        where: {
          user_id_library_id: {
            user_id: mockTestUserSavedLibrary.user_id,
            library_id: mockTestUserSavedLibrary.library_id,
          },
        },
        data: {
          deletedAt: null,
          updatedAt: expect.any(Date) as unknown,
        },
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'LibrarySaved restored.',
      });
    });

    it('should return no content if library is already saved and active', async () => {
      jest
        .spyOn(prisma.library, 'findUnique')
        .mockResolvedValue(mockTestLibrary);

      jest
        .spyOn(prisma.userSavedLibrary, 'findFirst')
        .mockResolvedValue(mockTestUserSavedLibrary);

      const result = await service.saveLibrary(
        mockTestUserSavedLibrary.user_id,
        mockTestUserSavedLibrary.library_id,
        true,
      );

      expect(result).toEqual({
        statusCode: 204,
        message: 'Library already saved.',
      });
    });

    it('should return no content if trying to unsave an already unsaved library', async () => {
      const alreadyUnsaved = mockUserSavedLibrary({
        deletedAt: new Date(),
      });

      jest
        .spyOn(prisma.library, 'findUnique')
        .mockResolvedValue(mockTestLibrary);

      jest
        .spyOn(prisma.userSavedLibrary, 'findFirst')
        .mockResolvedValue(alreadyUnsaved);

      const result = await service.saveLibrary(
        alreadyUnsaved.user_id,
        alreadyUnsaved.library_id,
        false,
      );

      expect(result).toEqual({
        statusCode: 204,
        message: 'Library already unsaved.',
      });
    });

    it('should unsave a library if it is saved and active', async () => {
      const activeSaved = mockUserSavedLibrary({
        deletedAt: null,
      });

      jest
        .spyOn(prisma.library, 'findUnique')
        .mockResolvedValue(mockTestLibrary);

      jest
        .spyOn(prisma.userSavedLibrary, 'findFirst')
        .mockResolvedValue(activeSaved);

      const updateSpy = jest
        .spyOn(prisma.userSavedLibrary, 'update')
        .mockResolvedValue({
          ...activeSaved,
          deletedAt: new Date(),
          updatedAt: new Date(),
        });

      const result = await service.saveLibrary(
        activeSaved.user_id,
        activeSaved.library_id,
        false,
      );

      expect(updateSpy).toHaveBeenCalledWith({
        where: {
          user_id_library_id: {
            user_id: activeSaved.user_id,
            library_id: activeSaved.library_id,
          },
        },
        data: {
          deletedAt: expect.any(Date) as unknown,
          updatedAt: expect.any(Date) as unknown,
        },
      });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Library unsaved.',
      });
    });

    it('should throw if trying to unsave a library that was never saved', async () => {
      jest
        .spyOn(prisma.library, 'findUnique')
        .mockResolvedValue(mockTestLibrary);

      jest.spyOn(prisma.userSavedLibrary, 'findFirst').mockResolvedValue(null);

      await expect(
        service.saveLibrary(
          mockTestUserSavedLibrary.user_id,
          mockTestUserSavedLibrary.library_id,
          false,
        ),
      ).rejects.toThrow('UserSavedLibrary not found.');
    });
  });
});
