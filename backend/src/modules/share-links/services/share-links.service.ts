import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import type { ShareLinkEntity } from '../entities/share-link.entity';
import { ShareLinkRepository } from '../repositories/share-link.repository';

const TOKEN_BYTES = 24; // → 32 URL-safe characters

@Injectable()
export class ShareLinksService {
  constructor(private readonly shareLinkRepository: ShareLinkRepository) {}

  // One active link: "Share" always returns the same one until it is revoked.
  async getOrCreateLink(): Promise<ShareLinkEntity> {
    const current = await this.shareLinkRepository.findCurrent();
    if (current) return current;
    const token = randomBytes(TOKEN_BYTES).toString('base64url');
    return this.shareLinkRepository.insert(token);
  }

  // The UI "reset link" is revoke + getOrCreateLink.
  async revokeLink(): Promise<void> {
    await this.shareLinkRepository.deleteAll();
  }

  // Unknown and revoked tokens look the same to the caller.
  async assertValidToken(token: string): Promise<void> {
    const isValid = await this.shareLinkRepository.existsByToken(token);
    if (!isValid) {
      throw new NotFoundException({
        code: 'SHARE_LINK_NOT_FOUND',
        message: 'This link is invalid or has been revoked',
      });
    }
  }
}
