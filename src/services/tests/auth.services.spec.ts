import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { HashService } from '../hash.service';
import { mockPrismaClient } from '../../../test/fixture/prisma.mock';
import { authMocks } from '../../../test/fixture/auth.mock';
import { mockTestUser } from '../../../test/fixture/user.mock';
import { LoginDTO } from '../../dtos/loginDTO.dto';
import { HttpException } from '@nestjs/common';

describe('AuthService - validateUser', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaClient },
        { provide: JwtService, useValue: authMocks.jwt },
        { provide: HashService, useValue: authMocks.hash },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return access token on successful login', async () => {
    const dto: LoginDTO = {
      email: mockTestUser.email,
      password: mockTestUser.password,
    };

    mockPrismaClient.user.findUnique.mockResolvedValue(mockTestUser);
    authMocks.hash.compare.mockResolvedValue(true);
    authMocks.jwt.signAsync.mockResolvedValue('fake-jwt-token');

    const result = await authService.validateUser(dto);

    expect(result).toEqual({ accessToken: 'fake-jwt-token' });
    expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
      where: { email: dto.email },
    });
    expect(authMocks.hash.compare).toHaveBeenCalledWith(
      dto.password,
      mockTestUser.password,
    );
    expect(authMocks.jwt.signAsync).toHaveBeenCalled();
  });

  it('should throw HttpException if password is incorrect', async () => {
    const dto: LoginDTO = {
      email: mockTestUser.email,
      password: 'wrong-password',
    };

    mockPrismaClient.user.findUnique.mockResolvedValue(mockTestUser);
    authMocks.hash.compare.mockResolvedValue(false);

    await expect(authService.validateUser(dto)).rejects.toThrow(HttpException);
  });

  it('should throw HttpException if user is not found', async () => {
    const dto: LoginDTO = {
      email: 'nonexistent@test.com',
      password: 'irrelevant',
    };

    mockPrismaClient.user.findUnique.mockResolvedValue(null);

    await expect(authService.validateUser(dto)).rejects.toThrow(HttpException);
  });

  it('should throw Error on unexpected Prisma error', async () => {
    const dto: LoginDTO = {
      email: mockTestUser.email,
      password: mockTestUser.password,
    };

    mockPrismaClient.user.findUnique.mockRejectedValue(
      new Error('Connection failed'),
    );

    await expect(authService.validateUser(dto)).rejects.toThrow(Error);
  });

  it('should throw Error if AuthService throws an internal error', async () => {
    const dto: LoginDTO = {
      email: mockTestUser.email,
      password: mockTestUser.password,
    };

    mockPrismaClient.user.findUnique.mockResolvedValue(mockTestUser);
    authMocks.hash.compare.mockResolvedValue(true);
    authMocks.jwt.signAsync.mockRejectedValue(new Error('Internal Auth Error'));

    await expect(authService.validateUser(dto)).rejects.toThrow(Error);
  });

  it('should throw HttpException if token has expired', async () => {
    const dto: LoginDTO = {
      email: mockTestUser.email,
      password: mockTestUser.password,
    };

    mockPrismaClient.user.findUnique.mockResolvedValue(mockTestUser);
    authMocks.hash.compare.mockResolvedValue(true);
    authMocks.jwt.signAsync.mockRejectedValue(new Error('jwt expired'));

    await expect(authService.validateUser(dto)).rejects.toThrow(Error);
  });
});
