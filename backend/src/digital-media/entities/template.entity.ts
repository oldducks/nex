import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DigitalMediaCategory } from './category.entity';
import { DigitalMediaTemplateField } from './template-field.entity';

export type DigitalMediaTemplateStatus = 'draft' | 'active' | 'inactive';
export type DigitalMediaTemplateMediaType = 'image' | 'video';

@Entity('templates')
export class DigitalMediaTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 180 })
  name: string;

  @Column({ type: 'varchar', length: 180, unique: true })
  slug: string;

  @Column({ type: 'int' })
  category_id: number;

  @ManyToOne(() => DigitalMediaCategory, (category) => category.templates, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category: DigitalMediaCategory;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ type: 'text', default: '' })
  cover_image_url: string;

  @Column({ type: 'varchar', length: 16, default: 'image' })
  media_type: DigitalMediaTemplateMediaType;

  @Column({ type: 'text', default: '' })
  preview_video_url: string;

  @Column({ type: 'boolean', default: false })
  enable_product_replace: boolean;

  @Column({ type: 'text', default: '' })
  product_mask_url: string;

  @Column({ type: 'text' })
  prompt_template: string;

  @Column({ type: 'text', default: '' })
  negative_prompt: string;

  @Column({ type: 'varchar', length: 120, default: 'standard' })
  style_preset: string;

  @Column({ type: 'varchar', length: 10, default: '1:1' })
  aspect_ratio: string;

  @Column({ type: 'varchar', length: 16, default: 'draft' })
  status: DigitalMediaTemplateStatus;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToMany(() => DigitalMediaTemplateField, (field) => field.template, {
    cascade: true,
  })
  fields: DigitalMediaTemplateField[];
}
