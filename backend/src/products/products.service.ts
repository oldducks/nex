import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { CatalogsService } from '../catalogs/catalogs.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private catalogsService: CatalogsService,
  ) { }

  async create(user_id: number, createProductDto: CreateProductDto) {
    // Verify catalog belongs to user
    await this.catalogsService.findOne(createProductDto.catalog_id, user_id);

    const product = this.productsRepository.create(createProductDto);
    return this.productsRepository.save(product);
  }

  async findAll(catalog_id: number, user_id: number) {
    // Verify catalog ownership
    await this.catalogsService.findOne(catalog_id, user_id);

    return this.productsRepository.find({
      where: { catalog_id },
      order: { order: 'ASC', id: 'DESC' },
    });
  }

  async findOne(id: number, user_id: number) {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['catalog'],
    });

    if (!product) throw new NotFoundException('Product not found');
    if (product.catalog.user_id !== user_id) throw new ForbiddenException('Access denied');

    return product;
  }

  async update(id: number, user_id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id, user_id);
    this.productsRepository.merge(product, updateProductDto);
    return this.productsRepository.save(product);
  }

  async remove(id: number, user_id: number) {
    const product = await this.findOne(id, user_id);
    return this.productsRepository.remove(product);
  }
}
