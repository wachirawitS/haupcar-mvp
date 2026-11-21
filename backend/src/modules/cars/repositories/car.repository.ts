import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { CarEntity } from '../entities/car.entity';

export const CAR_SORT_FIELDS = [
  'createdAt',
  'registrationNumber',
  'brand',
  'model',
  'year',
] as const;
export type CarSortField = (typeof CAR_SORT_FIELDS)[number];
export type SortOrder = 'asc' | 'desc';

export type CarPageQuery = {
  page: number;
  limit: number;
  search?: string;
  brand?: string;
  sort: CarSortField;
  order: SortOrder;
};

type CarWrite = Pick<
  CarEntity,
  | 'registrationNumber'
  | 'province'
  | 'brand'
  | 'model'
  | 'year'
  | 'color'
  | 'notes'
>;

// Allowlisted sort field → entity property. Request input never becomes a column name (§4.5).
const SORT_COLUMNS: Record<CarSortField, string> = {
  createdAt: 'car.createdAt',
  registrationNumber: 'car.registrationNumber',
  brand: 'car.brand',
  model: 'car.model',
  year: 'car.year',
};

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}

@Injectable()
export class CarRepository {
  constructor(
    @InjectRepository(CarEntity)
    private readonly repository: Repository<CarEntity>,
  ) {}

  findById(id: string): Promise<CarEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: { images: true },
      order: { images: { createdAt: 'ASC', id: 'ASC' } },
    });
  }

  async findPage(
    query: CarPageQuery,
  ): Promise<{ items: CarEntity[]; total: number }> {
    const builder = this.repository.createQueryBuilder('car');

    if (query.search) {
      const text = `%${escapeLike(query.search)}%`;
      // Plates are stored as "1กข 1234"; ignore spaces/hyphens so "1กข1234" also matches.
      const plate = `%${escapeLike(query.search.replace(/[\s-]/g, ''))}%`;
      builder.andWhere(
        new Brackets((where) => {
          where
            .where("replace(car.registration_number, ' ', '') ILIKE :plate", {
              plate,
            })
            .orWhere('car.brand ILIKE :text', { text })
            .orWhere('car.model ILIKE :text', { text });
        }),
      );
    }
    if (query.brand) {
      builder.andWhere('lower(car.brand) = lower(:brand)', {
        brand: query.brand,
      });
    }

    const direction = query.order === 'asc' ? 'ASC' : 'DESC';
    const [items, total] = await builder
      .orderBy(SORT_COLUMNS[query.sort], direction, 'NULLS LAST')
      .addOrderBy('car.id', direction)
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();
    return { items, total };
  }

  // Distinct brands ignoring case ("toyota" and "Toyota" are one brand).
  async findBrands(): Promise<string[]> {
    const rows = await this.repository
      .createQueryBuilder('car')
      .select('MIN(car.brand)', 'brand')
      .groupBy('lower(car.brand)')
      .orderBy('lower(MIN(car.brand))', 'ASC')
      .getRawMany<{ brand: string }>();
    return rows.map((row) => row.brand);
  }

  insert(values: CarWrite): Promise<CarEntity> {
    return this.repository.save(this.repository.create(values));
  }

  async update(id: string, values: Partial<CarWrite>): Promise<void> {
    await this.repository.update({ id }, values);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}
