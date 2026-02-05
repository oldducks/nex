import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToOne } from 'typeorm';
import { Profile } from '../../profiles/entities/profile.entity';

export enum UserRole {
    SUPER_ADMIN = 'super_admin',
    GROUP_ADMIN = 'group_admin',
    USER = 'user',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    group_id: number;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    password_hash: string;

    @Column({ unique: true })
    uid: string; // NanoID

    @Column({ nullable: true })
    url_prefix: string; // Random path prefix for security

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
    })
    role: UserRole;

    @Column({ default: true })
    is_active: boolean;

    @Column({ default: true })
    must_change_password: boolean; // Force password change on first login

    @Column({ type: 'timestamp', nullable: true })
    expiration_date: Date;

    @Column({ default: 'free' })
    subscription_tier: string; // 'free', 'premium'

    @Column({ default: 1 })
    max_cards: number;

    @Column({ type: 'jsonb', default: {} })
    feature_config: Record<string, any>;

    @Column({ nullable: true })
    reset_token: string;

    @Column({ type: 'timestamp', nullable: true })
    reset_token_expires: Date;

    // Social Login IDs
    @Column({ nullable: true })
    google_id: string;

    @Column({ nullable: true })
    facebook_id: string;

    @Column({ nullable: true })
    line_id: string;

    @CreateDateColumn()
    created_at: Date;

    @OneToOne(() => Profile, (profile) => profile.user)
    profile: Profile;
}

