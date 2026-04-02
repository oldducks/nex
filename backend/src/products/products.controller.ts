import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post('import-csv')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  importCsv(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body('catalog_id') catalogId: string,
  ) {
    if (!file) {
      throw new BadRequestException('CSV file is required');
    }

    const parsedCatalogId = Number(catalogId);
    if (!Number.isInteger(parsedCatalogId) || parsedCatalogId <= 0) {
      throw new BadRequestException('catalog_id must be a positive integer');
    }

    return this.productsService.importCsv(req.user.userId, parsedCatalogId, file);
  }

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
