import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  create(@Request() req, @Body() createProductDto: CreateProductDto) {
    return this.productsService.create(req.user.userId, createProductDto);
  }

  @Get()
  findAll(@Request() req, @Query('catalog_id') catalog_id: string) {
    return this.productsService.findAll(+catalog_id, req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.productsService.findOne(+id, req.user.userId);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, req.user.userId, updateProductDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.productsService.remove(+id, req.user.userId);
  }
}
