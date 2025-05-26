import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../controllers/auth.controller';
import { AuthService } from '../../services/auth.service';
import { LoginDTO } from '../../dtos/loginDTO.dto';
import { AuthenticatedRequest } from '../../dtos/authDTO.dto';

const mockAuthService = {
  validateUser: jest.fn(),
  validateToken: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return access token on successful login', async () => {
      const loginDto: LoginDTO = {
        email: 'test@example.com',
        password: '123456',
      };

      const mockToken = { accessToken: 'fake-jwt-token' };

      mockAuthService.validateUser.mockResolvedValue(mockToken);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockToken);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('validateToken', () => {
    it('should return user data if token is valid', async () => {
      const mockRequest = {
        payload: {
          userId: 'user-id',
        },
      } as AuthenticatedRequest;

      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
      };

      mockAuthService.validateToken.mockResolvedValue(mockUser);

      const result = await controller.validateToken(mockRequest);

      expect(result).toEqual(mockUser);
      expect(mockAuthService.validateToken).toHaveBeenCalledWith('user-id');
    });
  });
});
