import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { HealthRepository } from '../repositories/health.repository';

@Injectable()
export class HealthService {
  constructor(private readonly healthRepository: HealthRepository) {}

  async check(): Promise<void> {
    const isDatabaseUp = await this.healthRepository.ping();
    if (!isDatabaseUp) {
      // No hostnames or error details in the response (§12).
      throw new ServiceUnavailableException({
        code: 'SERVICE_UNAVAILABLE',
        message: 'Service is not ready',
      });
    }
  }
}
