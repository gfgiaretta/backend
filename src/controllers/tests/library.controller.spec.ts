import { Test, TestingModule } from '@nestjs/testing';
import { LibraryController } from '../library.controller';
import { LibraryService } from '../../services/library.service';
import { AuthenticatedRequest } from '../../dtos/auth.dto';
import {
  mockTestLibraryResponseSaved,
  mockTestLibraryResponse,
} from '../../../test/fixture/library.mock';

describe('LibraryController', () => {
  let controller: LibraryController;

  const mockLibraryService = {
    getLibraryWithSavedInfo: jest.fn(),
    saveLibrary: jest.fn(),
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

  describe('saveLibrary', () => {
    it('should save library successfully', async () => {
      const mockUserId = 'b60b728d450146a1bbb4836ed61c93c7';
      const mockRequest = {
        payload: { userId: mockUserId },
      } as AuthenticatedRequest;
      const mockBody = {
        library_id: 'b9678d98-da01-41a1-a61c-7a05f64066a6',
        save: true,
      };

      mockLibraryService.saveLibrary.mockResolvedValue({
        statusCode: 200,
        message: 'Library saved.',
      });

      const result = await controller.saveLibrary(mockRequest, mockBody);
      expect(result).toEqual({ statusCode: 200, message: 'Library saved.' });
    });

    it('sould unsave library successfully', async () => {
      const mockUserId = 'b60b728d450146a1bbb4836ed61c93c7';
      const mockRequest = {
        payload: { userId: mockUserId },
      } as AuthenticatedRequest;
      const mockBody = {
        library_id: 'b9678d98-da01-41a1-a61c-7a05f64066a6',
        save: false,
      };

      mockLibraryService.saveLibrary.mockResolvedValue({
        statusCode: 200,
        message: 'Library unsaved.',
      });

      const result = await controller.saveLibrary(mockRequest, mockBody);
      expect(result).toEqual({ statusCode: 200, message: 'Library unsaved.' });
    });

    it('should return not found if library does not exist', async () => {
      const mockUserId = 'b60b728d450146a1bbb4836ed61c93c7';
      const mockRequest = {
        payload: { userId: mockUserId },
      } as AuthenticatedRequest;
      const mockBody = {
        library_id: 'kgj123xyz-1234-5678-90ab-cdefghijklmn',
        save: true,
      };

      mockLibraryService.saveLibrary.mockResolvedValue({
        statusCode: 200,
        message: 'Library unsaved.',
      });

      const result = await controller.saveLibrary(mockRequest, mockBody);
      expect(result).toEqual({ statusCode: 200, message: 'Library unsaved.' });
    });
  });
});
