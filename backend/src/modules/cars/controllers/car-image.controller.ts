import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiPayloadTooLargeResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../common/dto/error-response.dto';
import { CarImageResponseDto } from '../dto/car-image-response.dto';
import { CarsService } from '../services/cars.service';

@ApiTags('cars')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  type: ErrorResponseDto,
  description: 'UNAUTHORIZED',
})
@Controller('cars/:carId/images')
export class CarImageController {
  constructor(private readonly carsService: CarsService) {}

  // Multipart upload (ADR-0012). Memory storage and size/count limits come from
  // MulterModule in cars.module.ts; the service re-checks them.
  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: 'Upload images (JPEG/PNG/WebP, max 10 per car)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['files'],
      properties: {
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  @ApiCreatedResponse({ type: [CarImageResponseDto] })
  @ApiNotFoundResponse({ type: ErrorResponseDto, description: 'CAR_NOT_FOUND' })
  @ApiUnprocessableEntityResponse({
    type: ErrorResponseDto,
    description:
      'CAR_IMAGE_LIMIT_REACHED / UNSUPPORTED_FILE_TYPE / VALIDATION_FAILED',
  })
  @ApiPayloadTooLargeResponse({
    type: ErrorResponseDto,
    description: 'FILE_TOO_LARGE',
  })
  async upload(
    @Param('carId', ParseUUIDPipe) carId: string,
    @UploadedFiles() files: Express.Multer.File[] | undefined,
  ): Promise<CarImageResponseDto[]> {
    const images = await this.carsService.addImages(carId, files ?? []);
    return images.map((image) => CarImageResponseDto.fromView(image));
  }

  @Delete(':imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete one image' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'CAR_IMAGE_NOT_FOUND',
  })
  async delete(
    @Param('carId', ParseUUIDPipe) carId: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ): Promise<void> {
    await this.carsService.deleteImage(carId, imageId);
  }
}
