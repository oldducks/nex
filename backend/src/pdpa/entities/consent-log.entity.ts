import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('consent_logs')
export class ConsentLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  visitor_id: string;

  @Column({ default: false })
  accepted_all: boolean;

  @Column({ type: 'jsonb', nullable: true })
  consents: {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
  };

  @Column({ nullable: true })
  user_agent: string;

  @Column({ nullable: true })
  ip_address: string;

  @CreateDateColumn()
  created_at: Date;
}
