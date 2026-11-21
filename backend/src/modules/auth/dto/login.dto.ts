import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

const CREDENTIAL_MAX_LENGTH = 200;

// Values are compared as sent: no trimming or lowercasing.
export class LoginDto {
  @ApiProperty({ example: 'somchai', maxLength: CREDENTIAL_MAX_LENGTH })
  @IsString()
  @IsNotEmpty()
  @MaxLength(CREDENTIAL_MAX_LENGTH)
  username!: string;

  @ApiProperty({ example: 'haupcar1234', maxLength: CREDENTIAL_MAX_LENGTH })
  @IsString()
  @IsNotEmpty()
  @MaxLength(CREDENTIAL_MAX_LENGTH)
  password!: string;
}
