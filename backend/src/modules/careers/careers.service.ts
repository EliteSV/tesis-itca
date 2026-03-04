import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Career,
  CareerDocument,
} from '@/modules/careers/schemas/career.schema';
import {
  CareerCategory,
  CareerCategoryDocument,
} from '@/modules/career-categories/schemas/career-category.schema';
import { CreateCareerDto } from '@/modules/careers/dto/create-career.dto';
import { UpdateCareerDto } from '@/modules/careers/dto/update-career.dto';

type CareerUpdateData = {
  code?: string;
  name?: string;
  categoryId?: Types.ObjectId;
  description?: string;
  duration?: number;
  isActive?: boolean;
};

@Injectable()
export class CareersService {
  constructor(
    @InjectModel(Career.name) private careerModel: Model<CareerDocument>,
    @InjectModel(CareerCategory.name)
    private careerCategoryModel: Model<CareerCategoryDocument>,
  ) {}

  async create(createCareerDto: CreateCareerDto) {
    const existingCareer = await this.careerModel.findOne({
      code: createCareerDto.code,
    });

    if (existingCareer) {
      throw new ConflictException('Ya existe una carrera con este código');
    }

    const category = await this.careerCategoryModel.findById(
      createCareerDto.categoryId,
    );

    if (!category) {
      throw new NotFoundException('Categoría de carrera no encontrada');
    }

    const career = new this.careerModel({
      ...createCareerDto,
      categoryId: new Types.ObjectId(createCareerDto.categoryId),
    });

    const saved = await career.save();
    return saved.toObject();
  }

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    categoryId?: string,
    isActive?: boolean,
    sortBy?: string,
    sortOrder?: string,
    dateFrom?: string,
    dateTo?: string,
  ) {
    const skip = (page - 1) * limit;
    const query: {
      $or?: Array<{
        name?: { $regex: string; $options: string };
        code?: { $regex: string; $options: string };
      }>;
      categoryId?: Types.ObjectId;
      isActive?: boolean;
      createdAt?: { $gte?: Date; $lte?: Date };
    } = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    if (categoryId) {
      query.categoryId = new Types.ObjectId(categoryId);
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        query.createdAt.$gte = fromDate;
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
      this.careerModel
        .find(query)
        .populate('categoryId', 'name')
        .skip(skip)
        .limit(limit)
        .sort(sortObj)
        .lean()
        .exec(),
      this.careerModel.countDocuments(query).exec(),
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
    const career = await this.careerModel
      .findById(id)
      .populate('categoryId', 'name description')
      .lean()
      .exec();

    if (!career) {
      throw new NotFoundException('Carrera no encontrada');
    }

    return career;
  }

  async update(id: string, updateCareerDto: UpdateCareerDto) {
    if (updateCareerDto.code) {
      const existingCareer = await this.careerModel.findOne({
        code: updateCareerDto.code,
        _id: { $ne: id },
      });

      if (existingCareer) {
        throw new ConflictException('Ya existe una carrera con este código');
      }
    }

    if (updateCareerDto.categoryId) {
      const category = await this.careerCategoryModel.findById(
        updateCareerDto.categoryId,
      );

      if (!category) {
        throw new NotFoundException('Categoría de carrera no encontrada');
      }
    }

    const updateData: CareerUpdateData = {
      code: updateCareerDto.code,
      name: updateCareerDto.name,
      description: updateCareerDto.description,
      duration: updateCareerDto.duration,
      isActive: updateCareerDto.isActive,
    };

    if (updateCareerDto.categoryId) {
      updateData.categoryId = new Types.ObjectId(updateCareerDto.categoryId);
    }

    const career = await this.careerModel
      .findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      })
      .lean()
      .exec();

    if (!career) {
      throw new NotFoundException('Carrera no encontrada');
    }

    return career;
  }

  async remove(id: string) {
    const career = await this.careerModel.findById(id).exec();

    if (!career) {
      throw new NotFoundException('Carrera no encontrada');
    }

    await this.careerModel.findByIdAndDelete(id).exec();
    return { message: 'Carrera eliminada exitosamente' };
  }

  async toggleStatus(id: string) {
    const career = await this.careerModel.findById(id).exec();

    if (!career) {
      throw new NotFoundException('Carrera no encontrada');
    }

    career.isActive = !career.isActive;
    const saved = await career.save();
    return saved.toObject();
  }
}
