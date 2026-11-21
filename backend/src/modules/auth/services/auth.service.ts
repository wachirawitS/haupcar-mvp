import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, timingSafeEqual } from 'node:crypto';
import { authConfig } from '../../../config/auth.config';

export type LoginInput = { username: string; password: string };
export type LoginResult = { accessToken: string; expiresIn: number };

// Hash first so both buffers have the same length, then compare in constant time (§6.1).
function safeEqual(a: string, b: string): boolean {
  const hashA = createHash('sha256').update(a).digest();
  const hashB = createHash('sha256').update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
    private readonly jwtService: JwtService,
  ) {}

  async login(input: LoginInput): Promise<LoginResult> {
    // Check both, so the response time does not hint which one was wrong.
    const isUsernameValid = safeEqual(input.username, this.config.username);
    const isPasswordValid = safeEqual(input.password, this.config.password);
    if (!isUsernameValid || !isPasswordValid) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid username or password',
      });
    }

    const accessToken = await this.jwtService.signAsync({
      sub: this.config.username,
    });
    const { iat, exp } = this.jwtService.decode<{ iat: number; exp: number }>(
      accessToken,
    );
    return { accessToken, expiresIn: exp - iat };
  }
}
