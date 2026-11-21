import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../common/dto/error-response.dto';
import { CarPageResponseDto } from '../dto/car-page-response.dto';
import { CarResponseDto } from '../dto/car-response.dto';
import { CreateCarDto } from '../dto/create-car.dto';
import { ListCarsQueryDto } from '../dto/list-cars-query.dto';
import { UpdateCarDto } from '../dto/update-car.dto';
import { CarsService } from '../services/cars.service';

@ApiTags('cars')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  type: ErrorResponseDto,
  description: 'UNAUTHORIZED',
})
@Controller('cars')
export class CarController {
  constructor(private readonly carsService: CarsService) {}

  @Get()
  @ApiOperation({ summary: 'List cars (search, brand filter, sort, paging)' })
  @ApiOkResponse({ type: CarPageResponseDto })
  @ApiUnprocessableEntityResponse({
    type: ErrorResponseDto,
    description: 'VALIDATION_FAILED',
  })
  async list(@Query() query: ListCarsQueryDto): Promise<CarPageResponseDto> {
    return CarPageResponseDto.fromPage(await this.carsService.listCars(query));
  }

  // Declared before ":id" so "brands" is not parsed as an id.
  @Get('brands')
  @ApiOperation({ summary: 'Distinct brands for the filter dropdown' })
  @ApiOkResponse({ type: [String], schema: { example: ['Honda', 'Toyota'] } })
  listBrands(): Promise<string[]> {
    return this.carsService.listBrands();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one car with its images' })
  @ApiOkResponse({ type: CarResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto, description: 'CAR_NOT_FOUND' })
  async get(@Param('id', ParseUUIDPipe) id: string): Promise<CarResponseDto> {
    return CarResponseDto.fromDetails(await this.carsService.getCar(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create a car' })
  @ApiCreatedResponse({ type: CarResponseDto })
  @ApiConflictResponse({
    type: ErrorResponseDto,
    description: 'CAR_PLATE_EXISTS',
  })
  @ApiUnprocessableEntityResponse({
    type: ErrorResponseDto,
    description: 'VALIDATION_FAILED',
  })
  async create(@Body() dto: CreateCarDto): Promise<CarResponseDto> {
    return CarResponseDto.fromDetails(await this.carsService.createCar(dto));
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a car (omitted = unchanged, null clears year/color/notes)',
  })
  @ApiOkResponse({ type: CarResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto, description: 'CAR_NOT_FOUND' })
  @ApiConflictResponse({
    type: ErrorResponseDto,
    description: 'CAR_PLATE_EXISTS',
  })
  @ApiUnprocessableEntityResponse({
    type: ErrorResponseDto,
    description: 'VALIDATION_FAILED',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCarDto,
  ): Promise<CarResponseDto> {
    return CarResponseDto.fromDetails(
      await this.carsService.updateCar(id, dto),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a car and its images' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ type: ErrorResponseDto, description: 'CAR_NOT_FOUND' })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.carsService.deleteCar(id);
  }
}
