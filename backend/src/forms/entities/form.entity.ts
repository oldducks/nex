import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('forms')
export class Form {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  owner_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // JSON config ของ field แต่ละตัว [{ id, label, type, required, options? }, ...]
  @Column({ type: 'jsonb', default: [] })
  fields: any[];

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

