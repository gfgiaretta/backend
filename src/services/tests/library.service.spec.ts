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
});
