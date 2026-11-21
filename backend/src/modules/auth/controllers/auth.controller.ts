import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { ErrorResponseDto } from '../../../common/dto/error-response.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthService } from '../services/auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in with the fixed username and password' })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiUnauthorizedResponse({
    type: ErrorResponseDto,
    description: 'INVALID_CREDENTIALS',
  })
  @ApiUnprocessableEntityResponse({
    type: ErrorResponseDto,
    description: 'VALIDATION_FAILED',
  })
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return LoginResponseDto.fromResult(await this.authService.login(dto));
  }
}
