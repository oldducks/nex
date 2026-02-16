import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('catalogs')
export class Catalog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column({ length: 100 })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ nullable: true })
    pdf_url: string;

    @Column({ type: 'jsonb', nullable: true })
    layout_config: any;

    @Column({ type: 'jsonb', nullable: true })
    interactive_links: any;

    @Column({ unique: true, nullable: true })
    custom_slug: string;

    @Column({ default: true })
    is_active: boolean;

    @Column({ nullable: true })
    category: string;

    // Video configuration with autoplay, link, enabled settings
    @Column({ type: 'jsonb', nullable: true })
    video_config: {
        url: string;
        autoplay: boolean;
        link_url?: string;
        link_enabled: boolean;
        enabled: boolean;
    };

    @OneToMany(() => Product, (product) => product.catalog, { cascade: true })
    products: Product[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
