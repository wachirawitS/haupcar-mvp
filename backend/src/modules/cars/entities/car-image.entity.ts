import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CarEntity } from './car.entity';

// Only the MinIO object key is stored, never a URL or the bytes (§10).
// Order and cover come from created_at ASC.
@Entity({ name: 'car_images' })
export class CarImageEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'car_id', type: 'uuid' })
  carId!: string;

  @ManyToOne(() => CarEntity, (car) => car.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'car_id' })
  car?: CarEntity;

  @Column({ name: 'object_key', type: 'varchar', length: 200 })
  objectKey!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
