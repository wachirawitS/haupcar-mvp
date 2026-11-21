import { UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { authConfig } from '../../../config/auth.config';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const config: ConfigType<typeof authConfig> = {
    username: 'somchai',
    password: 'secret-pass',
    jwtSecret: 'test-secret',
    jwtExpiresIn: '8h',
  };
  const jwtService = new JwtService({
    secret: config.jwtSecret,
    signOptions: { algorithm: 'HS256', expiresIn: '8h' },
  });
  const service = new AuthService(config, jwtService);

  it('returns a signed token with sub = username and an 8h lifetime', async () => {
    const result = await service.login({
      username: 'somchai',
      password: 'secret-pass',
    });

    const payload = await jwtService.verifyAsync<{ sub: string }>(
      result.accessToken,
    );
    expect(payload.sub).toBe('somchai');
    expect(result.expiresIn).toBe(8 * 60 * 60);
  });

  it.each([
    ['wrong password', { username: 'somchai', password: 'nope' }],
    ['wrong username', { username: 'someone', password: 'secret-pass' }],
    ['different case', { username: 'Somchai', password: 'secret-pass' }],
  ])('rejects %s with 401 INVALID_CREDENTIALS', async (_label, credentials) => {
    const error: unknown = await service
      .login(credentials)
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(UnauthorizedException);
    expect((error as UnauthorizedException).getResponse()).toMatchObject({
      code: 'INVALID_CREDENTIALS',
    });
  });
});
