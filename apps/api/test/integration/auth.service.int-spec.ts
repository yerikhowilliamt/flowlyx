import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/modules/auth/auth.service';
import { AppModule } from '../../src/app.module';
import { prisma } from '@flowlyx/database';

describe('AuthService (Integration)', () => {
  let authService: AuthService;

  const testUserEmail = 'int-auth@example.com';
  const testPassword = 'Password123!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    authService = moduleFixture.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    // Cleanup test user
    await prisma.user.deleteMany({
      where: { email: testUserEmail },
    });
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should successfully register a user into the database', async () => {
      // Clean up before test just in case
      await prisma.user.deleteMany({
        where: { email: testUserEmail },
      });

      const user = await authService.register({
        name: 'Int Test User',
        email: testUserEmail,
        password: testPassword,
      });

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(testUserEmail);
      expect(user.passwordHash).not.toBe(testPassword); // Should be hashed
    });
  });

  describe('validateUser', () => {
    it('should return user for correct credentials', async () => {
      const user = await authService.validateUser(testUserEmail, testPassword);
      expect(user).not.toBeNull();
      expect(user?.email).toBe(testUserEmail);
    });

    it('should return null for incorrect password', async () => {
      const user = await authService.validateUser(testUserEmail, 'wrongpassword');
      expect(user).toBeNull();
    });
  });

  describe('login', () => {
    it('should update refreshToken in the database', async () => {
      const user = await authService.validateUser(testUserEmail, testPassword);
      expect(user).toBeDefined();

      const tokens = await authService.login(user!);
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();

      // Check DB directly
      const dbUser = await prisma.user.findUnique({
        where: { email: testUserEmail },
      });
      expect(dbUser?.refreshToken).toBe(tokens.refreshToken);
    });
  });
});
