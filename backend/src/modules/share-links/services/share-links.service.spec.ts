import { NotFoundException } from '@nestjs/common';
import type { ShareLinkRepository } from '../repositories/share-link.repository';
import { ShareLinksService } from './share-links.service';

describe('ShareLinksService', () => {
  const repository = {
    findCurrent: jest.fn(),
    existsByToken: jest.fn(),
    insert: jest.fn(),
    deleteAll: jest.fn(),
  };
  const service = new ShareLinksService(
    repository as unknown as ShareLinkRepository,
  );

  beforeEach(() => jest.resetAllMocks());

  it('returns the current link without creating a new one', async () => {
    const current = { id: '1', token: 'abc', createdAt: new Date() };
    repository.findCurrent.mockResolvedValue(current);

    await expect(service.getOrCreateLink()).resolves.toBe(current);
    expect(repository.insert).not.toHaveBeenCalled();
  });

  it('creates a random URL-safe token when there is no link', async () => {
    repository.findCurrent.mockResolvedValue(null);
    repository.insert.mockImplementation((token: string) =>
      Promise.resolve({ id: '1', token, createdAt: new Date() }),
    );

    const link = await service.getOrCreateLink();

    expect(link.token).toMatch(/^[A-Za-z0-9_-]{32}$/);
  });

  it('revoke removes the link', async () => {
    await service.revokeLink();
    expect(repository.deleteAll).toHaveBeenCalled();
  });

  it('rejects an unknown or revoked token with 404 SHARE_LINK_NOT_FOUND', async () => {
    repository.existsByToken.mockResolvedValue(false);
    const error: unknown = await service
      .assertValidToken('nope')
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(NotFoundException);
    expect((error as NotFoundException).getResponse()).toMatchObject({
      code: 'SHARE_LINK_NOT_FOUND',
    });
  });
});
