import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { ErrorResponseDto } from '../../../common/dto/error-response.dto';
import { ShareLinksService } from '../../share-links/services/share-links.service';
import { CarPageResponseDto } from '../dto/car-page-response.dto';
import { CarResponseDto } from '../dto/car-response.dto';
import { ListCarsQueryDto } from '../dto/list-cars-query.dto';
import { CarsService } from '../services/cars.service';

// Read-only view for the team, opened from the shared link without logging in.
// Every route checks the share token first.
@Public()
@ApiTags('shared')
@ApiNotFoundResponse({
  type: ErrorResponseDto,
  description: 'SHARE_LINK_NOT_FOUND (invalid or revoked token)',
})
@Controller('shared/:token/cars')
export class SharedCarController {
  constructor(
    private readonly carsService: CarsService,
    private readonly shareLinksService: ShareLinksService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List cars through a share link' })
  @ApiOkResponse({ type: CarPageResponseDto })
  @ApiUnprocessableEntityResponse({
    type: ErrorResponseDto,
    description: 'VALIDATION_FAILED',
  })
  async list(
    @Param('token') token: string,
    @Query() query: ListCarsQueryDto,
  ): Promise<CarPageResponseDto> {
    await this.shareLinksService.assertValidToken(token);
    return CarPageResponseDto.fromPage(await this.carsService.listCars(query));
  }

  @Get('brands')
  @ApiOperation({ summary: 'Distinct brands through a share link' })
  @ApiOkResponse({ type: [String] })
  async listBrands(@Param('token') token: string): Promise<string[]> {
    await this.shareLinksService.assertValidToken(token);
    return this.carsService.listBrands();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one car through a share link' })
  @ApiOkResponse({ type: CarResponseDto })
  async get(
    @Param('token') token: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CarResponseDto> {
    await this.shareLinksService.assertValidToken(token);
    return CarResponseDto.fromDetails(await this.carsService.getCar(id));
  }
}
