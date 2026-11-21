import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  const jwtService = new JwtService({
    secret: 'test-secret',
    signOptions: { algorithm: 'HS256', expiresIn: '1h' },
    verifyOptions: { algorithms: ['HS256'] },
  });
  const reflector = new Reflector();
  const guard = new JwtAuthGuard(reflector, jwtService);

  function contextWith(authorization?: string): ExecutionContext {
    return {
      getHandler: () => function handler() {},
      getClass: () => class Controller {},
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization } }),
      }),
    } as unknown as ExecutionContext;
  }

  afterEach(() => jest.restoreAllMocks());

  it('allows @Public() routes without a token', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    await expect(guard.canActivate(contextWith())).resolves.toBe(true);
  });

  it('allows a valid bearer token', async () => {
    const token = await jwtService.signAsync({ sub: 'somchai' });
    await expect(
      guard.canActivate(contextWith(`Bearer ${token}`)),
    ).resolves.toBe(true);
  });

  it.each([
    ['no header', undefined],
    ['wrong scheme', 'Basic abc'],
    ['garbage token', 'Bearer not-a-jwt'],
  ])('rejects %s with 401 UNAUTHORIZED', async (_label, header) => {
    await expect(guard.canActivate(contextWith(header))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects a token signed with another secret', async () => {
    const other = new JwtService({ secret: 'other-secret' });
    const token = await other.signAsync({ sub: 'somchai' });
    await expect(
      guard.canActivate(contextWith(`Bearer ${token}`)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects an expired token', async () => {
    const token = await jwtService.signAsync(
      { sub: 'somchai' },
      { expiresIn: '-1s' },
    );
    await expect(
      guard.canActivate(contextWith(`Bearer ${token}`)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
