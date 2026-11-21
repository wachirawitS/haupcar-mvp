import { ServiceUnavailableException } from '@nestjs/common';
import { HealthRepository } from '../repositories/health.repository';
import { HealthService } from './health.service';

describe('HealthService', () => {
  const ping = jest.fn<Promise<boolean>, []>();
  const service = new HealthService({ ping } as unknown as HealthRepository);

  beforeEach(() => ping.mockReset());

  it('resolves when the database answers', async () => {
    ping.mockResolvedValue(true);
    await expect(service.check()).resolves.toBeUndefined();
  });

  it('throws 503 SERVICE_UNAVAILABLE when the database is down', async () => {
    ping.mockResolvedValue(false);
    await expect(service.check()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
