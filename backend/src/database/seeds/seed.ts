import { Logger } from '@nestjs/common';
import { CarEntity } from '../../modules/cars/entities/car.entity';
import { dataSource } from '../data-source';

// A few realistic, fake cars for local demos (§14.3).
// Idempotent: a plate that already exists is skipped. Never runs on startup.
// Local:  npm run seed
// Docker: docker compose exec backend node dist/database/seeds/seed.js
const CARS: Pick<
  CarEntity,
  | 'registrationNumber'
  | 'province'
  | 'brand'
  | 'model'
  | 'year'
  | 'color'
  | 'notes'
>[] = [
  {
    registrationNumber: '1กข 1234',
    province: 'กรุงเทพมหานคร',
    brand: 'Toyota',
    model: 'Corolla Altis',
    year: 2021,
    color: 'white',
    notes: 'รถประจำฝ่ายขาย',
  },
  {
    registrationNumber: '2กค 5678',
    province: 'กรุงเทพมหานคร',
    brand: 'Toyota',
    model: 'Hilux Revo',
    year: 2019,
    color: 'silver',
    notes: 'ใช้ขนของไปคลังสินค้า',
  },
  {
    registrationNumber: 'ขก 9012',
    province: 'นนทบุรี',
    brand: 'Honda',
    model: 'City',
    year: 2022,
    color: 'gray',
    notes: null,
  },
  {
    registrationNumber: '3ขข 3456',
    province: 'กรุงเทพมหานคร',
    brand: 'Honda',
    model: 'CR-V',
    year: 2023,
    color: 'black',
    notes: 'รถผู้บริหาร',
  },
  {
    registrationNumber: 'ฒต 789',
    province: 'ชลบุรี',
    brand: 'Isuzu',
    model: 'D-Max',
    year: 2018,
    color: 'blue',
    notes: 'ประจำสาขาชลบุรี',
  },
  {
    registrationNumber: '4กง 2468',
    province: 'กรุงเทพมหานคร',
    brand: 'Mazda',
    model: 'CX-5',
    year: 2020,
    color: 'red',
    notes: null,
  },
  {
    registrationNumber: 'กท 1357',
    province: 'เชียงใหม่',
    brand: 'Nissan',
    model: 'Almera',
    year: 2017,
    color: 'white',
    notes: 'ประจำสาขาเชียงใหม่',
  },
  {
    registrationNumber: '5กจ 8080',
    province: 'กรุงเทพมหานคร',
    brand: 'Mitsubishi',
    model: 'Xpander',
    year: 2022,
    color: 'brown',
    notes: 'รถรับส่งลูกค้า',
  },
];

async function seed(): Promise<void> {
  const logger = new Logger('Seed');
  await dataSource.initialize();
  try {
    const result = await dataSource
      .createQueryBuilder()
      .insert()
      .into(CarEntity)
      .values(CARS)
      .orIgnore() // ON CONFLICT DO NOTHING
      .execute();
    logger.log(
      `Inserted ${result.identifiers.filter(Boolean).length} of ${CARS.length} cars`,
    );
  } finally {
    await dataSource.destroy();
  }
}

void seed();
