import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShareLinkEntity } from '../entities/share-link.entity';

@Injectable()
export class ShareLinkRepository {
  constructor(
    @InjectRepository(ShareLinkEntity)
    private readonly repository: Repository<ShareLinkEntity>,
  ) {}

  // Newest first: if two links were ever created at once, the latest one is "the" link.
  findCurrent(): Promise<ShareLinkEntity | null> {
    return this.repository.findOne({
      where: {},
      order: { createdAt: 'DESC', id: 'DESC' },
    });
  }

  existsByToken(token: string): Promise<boolean> {
    return this.repository.existsBy({ token });
  }

  insert(token: string): Promise<ShareLinkEntity> {
    return this.repository.save(this.repository.create({ token }));
  }

  async deleteAll(): Promise<void> {
    await this.repository.createQueryBuilder().delete().execute();
  }
}
