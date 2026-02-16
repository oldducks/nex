import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ReferralStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    PAID = 'paid',
}

@Entity('referrals')
export class Referral {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    referrer_id: number; // User who referred

    @Column()
    referred_id: number; // New user who was referred

    @Column({ default: 1 })
    level: number; // 1 = direct, 2 = second level, etc.

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    commission_amount: number; // Commission earned

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 10 })
    commission_rate: number; // Commission rate (10%)

    @Column({
        type: 'enum',
        enum: ReferralStatus,
        default: ReferralStatus.PENDING,
    })
    status: ReferralStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    registration_fee: number; // Fee paid at registration (if any)

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'referrer_id' })
    referrer: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'referred_id' })
    referred: User;
}
