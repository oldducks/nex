import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Form } from './form.entity';
import { User } from '../../users/entities/user.entity';

@Entity('form_submissions')
export class FormSubmission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  form_id: number;

  @ManyToOne(() => Form)
  @JoinColumn({ name: 'form_id' })
  form: Form;

  @Column()
  owner_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ type: 'jsonb' })
  data: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  source?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    referrer?: string;
  };

  @CreateDateColumn()
  created_at: Date;
}

