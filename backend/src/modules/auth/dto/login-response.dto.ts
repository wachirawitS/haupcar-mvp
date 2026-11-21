import { ApiProperty } from '@nestjs/swagger';
import type { LoginResult } from '../services/auth.service';

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT to send as `Authorization: Bearer <token>`',
  })
  accessToken!: string;

  @ApiProperty({ description: 'Token lifetime in seconds', example: 28800 })
  expiresIn!: number;

  static fromResult(result: LoginResult): LoginResponseDto {
    const dto = new LoginResponseDto();
    dto.accessToken = result.accessToken;
    dto.expiresIn = result.expiresIn;
    return dto;
  }
}
