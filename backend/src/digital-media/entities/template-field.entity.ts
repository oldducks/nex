import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DigitalMediaTemplate } from './template.entity';

export type DigitalMediaFieldType = 'text' | 'textarea' | 'image' | 'select' | 'color';

@Entity('template_fields')
export class DigitalMediaTemplateField {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  template_id: number;

  @ManyToOne(() => DigitalMediaTemplate, (template) => template.fields, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'template_id' })
  template: DigitalMediaTemplate;

  @Column({ type: 'varchar', length: 120 })
  field_key: string;

  @Column({ type: 'varchar', length: 180 })
  field_label: string;

  @Column({ type: 'varchar', length: 30 })
  field_type: DigitalMediaFieldType;

  @Column({ type: 'varchar', length: 220, default: '' })
  placeholder: string;

  @Column({ type: 'text', default: '' })
  help_text: string;

  @Column({ type: 'boolean', default: false })
  is_required: boolean;

  @Column({ type: 'text', default: '' })
  default_value: string;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  options_json: Array<{ label: string; value: string }>;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
