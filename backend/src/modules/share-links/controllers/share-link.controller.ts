import { Controller, Delete, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../common/dto/error-response.dto';
import { ShareLinkResponseDto } from '../dto/share-link-response.dto';
import { ShareLinksService } from '../services/share-links.service';

@ApiTags('share-link')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  type: ErrorResponseDto,
  description: 'UNAUTHORIZED',
})
@Controller('share-link')
export class ShareLinkController {
  constructor(private readonly shareLinksService: ShareLinksService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get the read-only link, creating it if there is none',
  })
  @ApiOkResponse({ type: ShareLinkResponseDto })
  async getOrCreate(): Promise<ShareLinkResponseDto> {
    return ShareLinkResponseDto.fromEntity(
      await this.shareLinksService.getOrCreateLink(),
    );
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Revoke the read-only link (the old URL stops working)',
  })
  @ApiNoContentResponse()
  async revoke(): Promise<void> {
    await this.shareLinksService.revokeLink();
  }
}
