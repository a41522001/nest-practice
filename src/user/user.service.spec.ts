import { Test } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/redis/redis.service';
import { ConfigService } from '@nestjs/config';
describe('test user service', () => {
  let userService: UserService;
  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisService, useValue: {} },
        { provide: ConfigService, useValue: {} },
      ],
    }).compile();

    userService = module.get(UserService);
  });
  it('service should defined', () => {
    expect(userService).toBeDefined();
  });
  it('should find user by email', async () => {
    const mockUser = { id: '1', email: 'test@test.com', name: 'Test' };
    mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
    const user = await userService.findUser('test@test.com');
    expect(user).toEqual(mockUser);
  });
});
