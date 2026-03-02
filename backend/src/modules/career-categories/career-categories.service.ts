import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CareerCategory,
  CareerCategoryDocument,
} from '@/modules/career-categories/schemas/career-category.schema';
import { CreateCareerCategoryDto } from '@/modules/career-categories/dto/create-career-category.dto';
import { UpdateCareerCategoryDto } from '@/modules/career-categories/dto/update-career-category.dto';

@Injectable()
export class CareerCategoriesService {
  constructor(
    @InjectModel(CareerCategory.name)
    private careerCategoryModel: Model<CareerCategoryDocument>,
  ) {}

  async create(createCareerCategoryDto: CreateCareerCategoryDto) {
    const existingCategory = await this.careerCategoryModel.findOne({
      name: createCareerCategoryDto.name,
    });

    if (existingCategory) {
      throw new ConflictException('Ya existe una categoría con este nombre');
    }

    const category = new this.careerCategoryModel(createCareerCategoryDto);
    const saved = await category.save();
    return saved.toObject();
  }

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    isActive?: boolean,
    sortBy?: string,
    sortOrder?: string,
    dateFrom?: string,
    dateTo?: string,
  ) {
    const skip = (page - 1) * limit;
    const query: {
      name?: { $regex: string; $options: string };
      isActive?: boolean;
      createdAt?: { $gte?: Date; $lte?: Date };
    } = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = toDate;
      }
    }

    const sortField = sortBy || 'createdAt';
    const sortDirection: 1 | -1 = sortOrder === 'asc' ? 1 : -1;
    const sortObj: Record<string, 1 | -1> = { [sortField]: sortDirection };

    const [data, total] = await Promise.all([
      this.careerCategoryModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort(sortObj)
        .lean()
        .exec(),
      this.careerCategoryModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const category = await this.careerCategoryModel.findById(id).lean().exec();

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return category;
  }

  async update(id: string, updateCareerCategoryDto: UpdateCareerCategoryDto) {
    if (updateCareerCategoryDto.name) {
      const existingCategory = await this.careerCategoryModel.findOne({
        name: updateCareerCategoryDto.name,
        _id: { $ne: id },
      });

      if (existingCategory) {
        throw new ConflictException('Ya existe una categoría con este nombre');
      }
    }

    const category = await this.careerCategoryModel
      .findByIdAndUpdate(id, updateCareerCategoryDto, {
        new: true,
        runValidators: true,
      })
      .lean()
      .exec();

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return category;
  }

  async remove(id: string) {
    const category = await this.careerCategoryModel.findById(id).exec();

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    await this.careerCategoryModel.findByIdAndDelete(id).exec();
    return { message: 'Categoría eliminada exitosamente' };
  }

  async toggleStatus(id: string) {
    const category = await this.careerCategoryModel.findById(id).exec();

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    category.isActive = !category.isActive;
    const saved = await category.save();
    return saved.toObject();
  }
}
