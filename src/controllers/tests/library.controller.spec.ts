import { Test, TestingModule } from '@nestjs/testing';
import { LibraryController } from '../library.controller';
import { LibraryService } from '../../services/library.service';
import { AuthenticatedRequest } from '../../dtos/authDTO.dto';
import {
  mockTestLibraryResponseSaved,
  mockTestLibraryResponse,
} from '../../../test/fixture/library.mock';

describe('LibraryController', () => {
  let controller: LibraryController;

  const mockLibraryService = {
    getLibraryWithSavedInfo: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LibraryController],
      providers: [
        {
          provide: LibraryService,
          useValue: mockLibraryService,
        },
      ],
    }).compile();

    controller = module.get<LibraryController>(LibraryController);
  });

  describe('getLibrary', () => {
    it('should return library list with saved info successfully', async () => {
      const mockUserId = 'b60b728d450146a1bbb4836ed61c93c7';
      const mockRequest = {
        payload: { userId: mockUserId },
      } as AuthenticatedRequest;

      mockLibraryService.getLibraryWithSavedInfo.mockResolvedValue([
        mockTestLibraryResponseSaved,
        mockTestLibraryResponse,
      ]);

      const result = await controller.getLibrary(mockRequest);

      expect(result).toEqual([
        mockTestLibraryResponseSaved,
        mockTestLibraryResponse,
      ]);
    });

    it('should handle unexpected error from prisma', async () => {
      const mockUserId = 'b60b728d450146a1bbb4836ed61c93c7';
      const mockRequest = {
        payload: { userId: mockUserId },
      } as AuthenticatedRequest;

      const mockError = new Error('Unexpected prisma error');
      mockLibraryService.getLibraryWithSavedInfo.mockRejectedValue(mockError);

      await expect(controller.getLibrary(mockRequest)).rejects.toThrow(
        mockError,
      );
      expect(mockLibraryService.getLibraryWithSavedInfo).toHaveBeenCalledWith(
        mockUserId,
      );
    });
  });
});
