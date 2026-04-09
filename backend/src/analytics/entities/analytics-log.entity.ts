import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum AnalyticsAction {
    VIEW_PROFILE = 'VIEW_PROFILE',
    DOWNLOAD_VCF = 'DOWNLOAD_VCF',
    VIEW_CATALOG = 'VIEW_CATALOG',
    DOWNLOAD_PDF = 'DOWNLOAD_PDF',
    VIEW_LANDING_PAGE = 'VIEW_LANDING_PAGE',
    SUBMIT_LANDING_FORM = 'SUBMIT_LANDING_FORM',
    SCAN_QR = 'SCAN_QR',
    LOGIN_SUCCESS = 'LOGIN_SUCCESS',
}

@Entity('analytics_logs')
export class AnalyticsLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ nullable: true })
    visitor_id: string; // Cookie ID or IP hash

    @Column({
        type: 'enum',
        enum: AnalyticsAction
    })
    action: AnalyticsAction;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @CreateDateColumn()
    created_at: Date;
}
