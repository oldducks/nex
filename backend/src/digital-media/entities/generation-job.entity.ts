import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type GenerationJobStatus = 'pending' | 'success' | 'failed';

@Entity('generation_jobs')
export class DigitalMediaGenerationJob {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  user_id: number | null;

  @Column({ type: 'int' })
  template_id: number;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  user_input_json: Record<string, any>;

  @Column({ type: 'text' })
  final_prompt: string;

  @Column({ type: 'text', default: '' })
  final_negative_prompt: string;

  @Column({ type: 'varchar', length: 10, default: '1:1' })
  aspect_ratio: string;

  @Column({ type: 'varchar', length: 16, default: 'pending' })
  status: GenerationJobStatus;

  @Column({ type: 'text', default: '' })
  output_image_url: string;

  @Column({ type: 'text', default: '' })
  output_video_url: string;

  @Column({ type: 'text', default: '' })
  error_message: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
