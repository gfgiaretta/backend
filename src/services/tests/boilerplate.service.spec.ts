import { Test, TestingModule } from '@nestjs/testing';
import { BoilerplateService } from '../boilerplate.service';
import { PrismaService } from '../prisma.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { mockTestUser } from '../../../test/fixture/user.mock';

describe('BoilerplateService', () => {
  let service: BoilerplateService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoilerplateService, PrismaService],
    }).compile();

    service = module.get<BoilerplateService>(BoilerplateService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return "Hello World!"', () => {
    const result = service.getHello();
    expect(result).toBe('Hello World!');
  });

  it('should return the MockUser', async () => {
    jest.spyOn(prisma.user, 'findMany').mockResolvedValue([mockTestUser]);
    const result = await service.getMethod();
    expect(result).toEqual([mockTestUser]);
  });

  it('sould not find any user', async () => {
    jest.spyOn(prisma.user, 'findMany').mockResolvedValue([]);

    try {
      await service.getMethod();
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(error.getResponse()).toEqual('No users found');
      }
    }
  });

  it("should create a new user if it doesn't exist", async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
    jest.spyOn(prisma.user, 'create').mockResolvedValue(mockTestUser);
    const result = await service.postMethod(mockTestUser);
    expect(result).toBe(HttpStatus.CREATED);
  });

  it('should return CONFLICT if user already exists', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockTestUser);

    try {
      await service.postMethod(mockTestUser);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
        expect(error.getResponse()).toEqual('User already exists');
      }
    }
  });

  it('should delete an user if it exists', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockTestUser);
    jest.spyOn(prisma.user, 'delete').mockResolvedValue(mockTestUser);
    const result = await service.deleteMethod(mockTestUser.user_id);
    expect(result).toBe(HttpStatus.NO_CONTENT);
  });

  it('should throw NOT_FOUND if user does not exist', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
    await expect(service.deleteMethod(mockTestUser.user_id)).rejects.toThrow(
      'User does not exist',
    );
  });
});
