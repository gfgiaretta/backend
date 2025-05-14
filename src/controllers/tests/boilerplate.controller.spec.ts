import { Test, TestingModule } from '@nestjs/testing';
import { BoilerplateController } from '../boilerplate.controller';
import { BoilerplateService } from '../../services/boilerplate.service';
import { mockTestUser } from '../../../test/fixture/user.mock';
import { PrismaService } from '../../services/prisma.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('BoilerplateController', () => {
  let boilerplateController: BoilerplateController;
  let boilerplateService: BoilerplateService;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      controllers: [BoilerplateController],
      providers: [BoilerplateService, PrismaService],
    }).compile();

    boilerplateController = testModule.get<BoilerplateController>(
      BoilerplateController,
    );
    boilerplateService = testModule.get<BoilerplateService>(BoilerplateService);
  });

  describe('getHello', () => {
    it('should say "Hello World!"', () => {
      jest
        .spyOn(boilerplateService, 'getHello')
        .mockReturnValue('Hello World!');

      expect(boilerplateController.getHello()).toMatch('Hello World!');
    });
  });

  describe('getMethod', () => {
    it('should return all users', async () => {
      jest
        .spyOn(boilerplateService, 'getMethod')
        .mockResolvedValue([mockTestUser]);

      const result = await boilerplateController.getMethod();
      expect(result).toEqual([mockTestUser]);
    });
  });

  describe('postMethod', () => {
    it("should return HttpStatus.CREATED if user doesn't exist", async () => {
      jest
        .spyOn(boilerplateService, 'postMethod')
        .mockResolvedValue(HttpStatus.CREATED);

      const result = await boilerplateController.postMethod(mockTestUser);
      expect(result).toBe(HttpStatus.CREATED);
    });

    it('should return HttpStatus.CONFLICT if user already exists', async () => {
      jest
        .spyOn(boilerplateService, 'postMethod')
        .mockRejectedValue(
          new HttpException('User already exists', HttpStatus.CONFLICT),
        );

      try {
        await boilerplateController.postMethod(mockTestUser);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        if (error instanceof HttpException) {
          expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
          expect(error.getResponse()).toEqual('User already exists');
        }
      }
    });
  });

  describe('deleteMethod', () => {
    it('should return HttpStatus.NO_CONTENT if user was deleted', async () => {
      jest
        .spyOn(boilerplateService, 'deleteMethod')
        .mockResolvedValue(HttpStatus.NO_CONTENT);

      const result = await boilerplateController.deleteMethod(
        mockTestUser.user_id,
      );
      expect(result).toBe(HttpStatus.NO_CONTENT);
    });

    it('should return HttpStatus.NOT_FOUND if user does not exist', async () => {
      jest
        .spyOn(boilerplateService, 'deleteMethod')
        .mockRejectedValue(
          new HttpException('User does not exist', HttpStatus.NOT_FOUND),
        );

      try {
        await boilerplateController.deleteMethod(mockTestUser.user_id);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        if (error instanceof HttpException) {
          expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
          expect(error.getResponse()).toEqual('User does not exist');
        }
      }
    });
  });
});
