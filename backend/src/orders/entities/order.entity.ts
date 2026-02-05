import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum OrderStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    package_name: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'int' })
    duration_days: number;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status: OrderStatus;

    @Column({ nullable: true })
    slip_url: string;

    @Column({ nullable: true })
    reject_reason: string;

    @Column({ nullable: true })
    approved_by: number;

    @Column({ type: 'timestamp', nullable: true })
    approved_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
