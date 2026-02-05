import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('landing_pages')
export class LandingPage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ length: 255 })
    title: string;

    @Column({ unique: true })
    slug: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'jsonb', default: [] })
    content_blocks: any[]; // Array of blocks { type, value, settings }

    @Column({ default: true })
    is_published: boolean;

    @Column({ type: 'jsonb', nullable: true })
    theme_config: any; // Colors, fonts, etc.

    @Column({ type: 'jsonb', nullable: true })
    seo_metadata: any;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
