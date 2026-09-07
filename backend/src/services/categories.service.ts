import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../models/category.model';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  findAll() {
    return this.categoriesRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const existing = await this.categoriesRepository.findOne({
      where: { name: dto.name },
    });
    if (existing) throw new ConflictException('Category name already exists');
    const category = this.categoriesRepository.create(dto);
    return this.categoriesRepository.save(category);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);
    await this.categoriesRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.categoriesRepository.delete(id);
    return { deleted: true };
  }
}
