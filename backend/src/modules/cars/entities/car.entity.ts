import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import type { CarColor } from './car-color.const';
import { CarImageEntity } from './car-image.entity';
import type { Province } from './province.const';

export const CAR_PLATE_UNIQUE_CONSTRAINT =
  'uq_cars_registration_number_province';

@Entity({ name: 'cars' })
@Unique(CAR_PLATE_UNIQUE_CONSTRAINT, ['registrationNumber', 'province'])
export class CarEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'registration_number', type: 'varchar', length: 20 })
  registrationNumber!: string;

  @Column({ name: 'province', type: 'varchar', length: 50 })
  province!: Province;

  @Column({ name: 'brand', type: 'varchar', length: 50 })
  brand!: string;

  @Column({ name: 'model', type: 'varchar', length: 50 })
  model!: string;

  @Column({ name: 'year', type: 'smallint', nullable: true })
  year!: number | null;

  @Column({ name: 'color', type: 'varchar', length: 20, nullable: true })
  color!: CarColor | null;

  @Column({ name: 'notes', type: 'varchar', length: 1000, nullable: true })
  notes!: string | null;

  @OneToMany(() => CarImageEntity, (image) => image.car)
  images?: CarImageEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
