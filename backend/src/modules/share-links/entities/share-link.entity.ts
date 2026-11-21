import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

// The read-only link for the team. Revoking deletes the row.
@Entity({ name: 'share_links' })
@Unique('uq_share_links_token', ['token'])
export class ShareLinkEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'token', type: 'varchar', length: 64 })
  token!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
