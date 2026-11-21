import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarImageEntity } from '../entities/car-image.entity';

@Injectable()
export class CarImageRepository {
  constructor(
    @InjectRepository(CarImageEntity)
    private readonly repository: Repository<CarImageEntity>,
  ) {}

  countByCarId(carId: string): Promise<number> {
    return this.repository.countBy({ carId });
  }

  findOneForCar(carId: string, id: string): Promise<CarImageEntity | null> {
    return this.repository.findOneBy({ id, carId });
  }

  // The oldest image of each car is its cover (§10).
  findCoversByCarIds(carIds: string[]): Promise<CarImageEntity[]> {
    if (carIds.length === 0) return Promise.resolve([]);
    return this.repository
      .createQueryBuilder('image')
      .distinctOn(['image.car_id'])
      .where('image.car_id IN (:...carIds)', { carIds })
      .orderBy('image.car_id')
      .addOrderBy('image.created_at', 'ASC')
      .addOrderBy('image.id', 'ASC')
      .getMany();
  }

  insertMany(
    values: Pick<CarImageEntity, 'carId' | 'objectKey'>[],
  ): Promise<CarImageEntity[]> {
    return this.repository.save(
      values.map((value) => this.repository.create(value)),
    );
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}
