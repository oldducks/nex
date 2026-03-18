import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('leads')
export class Lead {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    owner_id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'owner_id' })
    owner: User;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    occupation: string;

    @Column({ type: 'text', nullable: true })
    message: string;

    @Column({ default: true })
    pdpa_consent: boolean;

    @Column({ type: 'timestamp', nullable: true })
    consent_timestamp: Date;

    @Column({ default: 'profile' })
    source_type: string;

    @Column({ nullable: true })
    source_id: number;

    @Column({ nullable: true })
    source_url: string;

    @Column({ default: false })
    is_read: boolean;

    @CreateDateColumn()
    created_at: Date;
}
