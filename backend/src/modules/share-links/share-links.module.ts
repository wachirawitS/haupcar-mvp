import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShareLinkController } from './controllers/share-link.controller';
import { ShareLinkEntity } from './entities/share-link.entity';
import { ShareLinkRepository } from './repositories/share-link.repository';
import { ShareLinksService } from './services/share-links.service';

@Module({
  imports: [TypeOrmModule.forFeature([ShareLinkEntity])],
  controllers: [ShareLinkController],
  providers: [ShareLinksService, ShareLinkRepository],
  // The cars module checks share tokens for its public read-only routes.
  exports: [ShareLinksService],
})
export class ShareLinksModule {}
