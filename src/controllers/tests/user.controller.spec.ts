import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../../services/user.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { mockUserInterestDto } from '../../../test/fixture/user.mock';
import { AuthenticatedRequest } from '../../dtos/auth.dto';
import {
  mockCreateUserDto,
  mockTestUser,
} from '../../../test/fixture/user.mock';
import { HashService } from '../../services/hash.service';
import { StatisticsService } from '../../services/statistics.service';
import { StatisticsResponseDTO } from 'src/dtos/user.dto';
import { mockTestUserProfile } from '../../../test/fixture/userProfile.mock';
import { PresignedService } from '../../services/presigned.service';

jest.mock('@aws-sdk/client-s3');

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;
  let statisticsService: StatisticsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        PrismaService,
        StatisticsService,
        {
          provide: HashService,
          useValue: {
            hash: jest.fn().mockResolvedValue('hashedPassword'),
            compare: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: PresignedService,
          useValue: {
            getUploadURL: jest
              .fn()
              .mockResolvedValue('https://signedUploadUrl.com'),
            getDownloadURL: jest
              .fn()
              .mockResolvedValue('https://signedDownloadUrl.com'),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    statisticsService = module.get<StatisticsService>(StatisticsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
    expect(userService).toBeDefined();
    expect(statisticsService).toBeDefined();
  });

  describe('create', () => {
    it('should return success response when user is created', async () => {
      jest.spyOn(userService, 'create').mockResolvedValue({
        userId: mockTestUser.user_id,
      });

      const result = await userController.create(mockCreateUserDto);

      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'User created successfully.',
        data: {
          userId: mockTestUser.user_id,
        },
      });
    });

    it('should throw BAD_REQUEST if request body has extra or missing keys', async () => {
      const invalidBody = {
        ...mockCreateUserDto,
        extraKey: 'not allowed',
      };

      await expect(userController.create(invalidBody as never)).rejects.toThrow(
        new HttpException('Invalid request body.', HttpStatus.BAD_REQUEST),
      );
    });

    it('should propagate exception from service', async () => {
      jest
        .spyOn(userService, 'create')
        .mockRejectedValue(
          new HttpException('User already exists', HttpStatus.CONFLICT),
        );

      await expect(userController.create(mockCreateUserDto)).rejects.toThrow(
        new HttpException('User already exists', HttpStatus.CONFLICT),
      );
    });
  });

  describe('getUserStatistics', () => {
    it('should return user statistics', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockTestUser);
      const mockTestUserStatistics = {
        graph: {
          Criatividade: 2,
          Comunicacao: 1,
        },
        calendar: {
          1: 'Criatividade',
          2: 'Comunicacao',
          3: 'Criatividade',
        },
        savedItems: 8,
      } as StatisticsResponseDTO;

      jest
        .spyOn(userService, 'updateUserStreak')
        .mockImplementation(() => Promise.resolve());

      jest
        .spyOn(statisticsService, 'getUserStatistics')
        .mockResolvedValue(mockTestUserStatistics);

      const mockRequest = {
        payload: { userId: '123' },
      } as AuthenticatedRequest;

      const result = await userController.getUserStatistics(mockRequest);
      expect(result).toEqual(mockTestUserStatistics);
    });

    it('should propagate error from service if user not found.', async () => {
      jest
        .spyOn(statisticsService, 'getUserStatistics')
        .mockRejectedValue(
          new HttpException('User not found.', HttpStatus.NOT_FOUND),
        );

      const mockRequest = {
        payload: { userId: 'invalid' },
      } as AuthenticatedRequest;

      jest
        .spyOn(userService, 'updateUserStreak')
        .mockImplementation(() => Promise.resolve());

      try {
        await userController.getUserStatistics(mockRequest);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        if (error instanceof HttpException) {
          expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
          expect(error.getResponse()).toEqual('User not found.');
        }
      }
    });
  });
  describe('updateUserInterests', () => {
    const mockReq = {
      payload: {
        userId: mockTestUser.user_id,
      },
    } as AuthenticatedRequest;

    it('should return success response when interests are updated', async () => {
      jest.spyOn(userService, 'updateUserInterests').mockResolvedValue({
        userId: mockTestUser.user_id,
        interests: mockUserInterestDto.interest,
      });

      const result = await userController.updateUserInterests(
        mockReq,
        mockUserInterestDto,
      );

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Interests updated successfully.',
        data: {
          userId: mockTestUser.user_id,
          interests: mockUserInterestDto.interest,
        },
      });
    });

    it('should throw an error if service throws', async () => {
      jest
        .spyOn(userService, 'updateUserInterests')
        .mockRejectedValue(
          new HttpException(
            'One or more provided interest IDs do not exist.',
            HttpStatus.BAD_REQUEST,
          ),
        );

      await expect(
        userController.updateUserInterests(mockReq, mockUserInterestDto),
      ).rejects.toThrow(
        new HttpException(
          'One or more provided interest IDs do not exist.',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile', async () => {
      jest
        .spyOn(userService, 'getUserProfile')
        .mockResolvedValue(mockTestUserProfile);

      const mockReq = {
        payload: { userId: mockTestUser.user_id },
      } as AuthenticatedRequest;

      const result = await userController.getUserProfile(mockReq);

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'User profile retrieved successfully.',
        data: mockTestUserProfile,
      });
    });

    it('should throw error if user not found.', async () => {
      jest
        .spyOn(userService, 'getUserProfile')
        .mockRejectedValue(
          new HttpException('User not found.', HttpStatus.NOT_FOUND),
        );

      const mockReq = {
        payload: { userId: 'invalid' },
      } as AuthenticatedRequest;

      await expect(userController.getUserProfile(mockReq)).rejects.toThrow(
        new HttpException('User not found.', HttpStatus.NOT_FOUND),
      );
    });
  });
});
