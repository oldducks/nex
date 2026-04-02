import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Catalog } from '../../catalogs/entities/catalog.entity';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    catalog_id: number;

    @ManyToOne(() => Catalog, (catalog) => catalog.products, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'catalog_id' })
    catalog: Catalog;

    @Column({ length: 100 })
    name: string;

    @Column({ length: 100, nullable: true })
    brand?: string;

    @Column({ nullable: true })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    price: number;

    @Column({ type: 'jsonb', default: [] })
    images_json: string[];

    @Column({ type: 'jsonb', nullable: true })
    interactive_links: any;

    @Column({ default: 0 })
    order: number;
}
