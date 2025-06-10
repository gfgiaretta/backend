import { Test, TestingModule } from '@nestjs/testing';
import { LibraryService } from '../library.service';
import { PrismaService } from '../prisma.service';
import {
  mockTestLibraryResponseSaved,
  mockTestLibrarySaved,
  mockTestLibraryResponse,
  mockTestLibrary,
} from '../../../test/fixture/library.mock';

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
  });
});
