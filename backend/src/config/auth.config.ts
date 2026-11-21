import { registerAs } from '@nestjs/config';

export const authConfig = registerAs('auth', () => ({
  username: process.env.AUTH_USERNAME ?? '',
  password: process.env.AUTH_PASSWORD ?? '',
  jwtSecret: process.env.JWT_SECRET ?? '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
}));
