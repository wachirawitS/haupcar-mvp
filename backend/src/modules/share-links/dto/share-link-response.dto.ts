import { ApiProperty } from '@nestjs/swagger';
import type { ShareLinkEntity } from '../entities/share-link.entity';

export class ShareLinkResponseDto {
  @ApiProperty({
    example: 'q1W2e3R4t5Y6u7I8o9P0a1S2d3F4g5H6',
    description: 'The frontend builds the link as <origin>/shared/<token>',
  })
  token!: string;

  @ApiProperty({ example: '2026-11-21T07:00:00.000Z' })
  createdAt!: string;

  static fromEntity(link: ShareLinkEntity): ShareLinkResponseDto {
    const dto = new ShareLinkResponseDto();
    dto.token = link.token;
    dto.createdAt = link.createdAt.toISOString();
    return dto;
  }
}
