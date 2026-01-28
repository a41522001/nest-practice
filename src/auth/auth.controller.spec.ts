import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import { CustomRequest } from '@/common/types';
import { AuthGuard } from './auth.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  // Mock Response 物件
  const mockResponse = () => {
    const res = {} as Response;
    res.cookie = jest.fn().mockReturnThis();
    res.clearCookie = jest.fn().mockReturnThis();
    return res;
  };

  // Mock Request 物件
  const mockRequest = (overrides = {}) => {
    return {
      cookies: {},
      ...overrides,
    } as unknown as Request;
  };

  beforeEach(async () => {
    // 創建 mock service
    const mockAuthService = {
      signup: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        const config: Record<string, unknown> = {
          ACCESS_TOKEN_COOKIE_EXPIRE: 900000,
          REFRESH_TOKEN_COOKIE_EXPIRE: 604800000,
          NODE_ENVIRONMENT: 'development',
        };
        return config[key];
      }),
    };

    // Mock AuthGuard - 直接讓所有請求通過
    const mockAuthGuard = {
      canActivate: jest.fn().mockReturnValue(true),
    };

    // 使用 NestJS Testing Module
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    })
      // 關鍵：用 overrideGuard 把 AuthGuard 替換成 mock
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  // 確保 controller 被正確建立
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ============ signup 測試 ============
  describe('signup', () => {
    const signupDto = {
      name: '測試用戶',
      email: 'test@example.com',
      pwd: 'password123',
    };

    it('應該呼叫 authService.signup 並回傳成功訊息', async () => {
      // Arrange: 設定 mock 回傳值
      authService.signup.mockResolvedValue('註冊成功');

      // Act: 執行 controller 方法
      const result = await controller.signup(signupDto);

      // Assert: 驗證結果
      expect(authService.signup).toHaveBeenCalledWith(signupDto);
      expect(authService.signup).toHaveBeenCalledTimes(1);
      expect(result).toBe('註冊成功');
    });

    it('當 email 已存在時，應該拋出錯誤', async () => {
      // Arrange: 設定 mock 拋出錯誤
      authService.signup.mockRejectedValue(new Error('此Email已被使用'));

      // Act & Assert
      await expect(controller.signup(signupDto)).rejects.toThrow(
        '此Email已被使用',
      );
    });
  });

  // ============ login 測試 ============
  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      pwd: 'password123',
    };

    it('應該設定 cookies 並回傳成功訊息', async () => {
      // Arrange
      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };
      authService.login.mockResolvedValue(mockTokens);

      const req = mockRequest({ cookies: {} });
      const res = mockResponse();

      // Act
      const result = await controller.login(loginDto, req, res);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(loginDto, undefined);
      expect(res.cookie).toHaveBeenCalledTimes(2);
      expect(res.cookie).toHaveBeenCalledWith(
        'accessToken',
        'mock-access-token',
        expect.objectContaining({ maxAge: 900000 }),
      );
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'mock-refresh-token',
        expect.objectContaining({ maxAge: 604800000 }),
      );
      expect(result).toBe('登入成功');
    });

    it('當已有 refreshToken cookie 時，應該傳給 service', async () => {
      // Arrange
      const existingRefreshToken = 'existing-refresh-token';
      authService.login.mockResolvedValue({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      });

      const req = mockRequest({
        cookies: { refreshToken: existingRefreshToken },
      });
      const res = mockResponse();

      // Act
      await controller.login(loginDto, req, res);

      // Assert: 確認舊的 refreshToken 有傳給 service
      expect(authService.login).toHaveBeenCalledWith(
        loginDto,
        existingRefreshToken,
      );
    });
  });

  // ============ logout 測試 ============
  describe('logout', () => {
    it('應該呼叫 authService.logout 並清除 cookies', async () => {
      // Arrange
      authService.logout.mockResolvedValue(undefined);

      const req = {
        cookies: { refreshToken: 'mock-refresh-token' },
        user: { id: 'user-123', sub: 'sub-123', username: 'test' },
      } as unknown as CustomRequest;

      const res = mockResponse();

      // Act
      await controller.logout(req, res);

      // Assert
      expect(authService.logout).toHaveBeenCalledWith(
        'user-123',
        'mock-refresh-token',
      );
    });
  });
});
