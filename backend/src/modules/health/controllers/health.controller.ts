import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../common/dto/error-response.dto';
import { HealthService } from '../services/health.service';

// GET /health — public, version-neutral, outside the /api prefix (§12).
// TODO(auth): mark @Public() once the global JwtAuthGuard exists.
@ApiTags('health')
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOkResponse({ schema: { example: { status: 'ok' } } })
  @ApiServiceUnavailableResponse({ type: ErrorResponseDto })
  async check(): Promise<{ status: 'ok' }> {
    await this.healthService.check();
    return { status: 'ok' };
  }
}
