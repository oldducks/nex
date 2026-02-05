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

    @Column()
    name: string;

    @Column()
    email: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    occupation: string;

    @Column('text')
    message: string;

    @Column({ default: true })
    pdpa_consent: boolean;

    @Column({ type: 'timestamp' })
    consent_timestamp: Date;

    @Column({ default: false })
    is_read: boolean;

    @CreateDateColumn()
    created_at: Date;
}
