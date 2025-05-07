import { Injectable } from '@nestjs/common';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthorService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAuthorDto) {
    try {
      let author = await this.prisma.author.create({ data });
      if (!author) {
        return 'Cannot create author!';
      }
      return author;
    } catch (error) {
      return error;
    }
  }

  async findAll(query: {
    name?: string;
    age?: string;
    sort?: string;
    page?: string;
    limit?: string;
  }) {
    try {
      const { name, age, sort = 'id:asc', page = '1', limit = '10' } = query;

      const [sortField, sortOrder] = sort.split(':');

      const filters: any = {};
      if (name) filters.name = { contains: name, mode: 'insensitive' };
      if (age) filters.age = Number(age);

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const authors = await this.prisma.author.findMany({
        where: filters,
        orderBy: {
          [sortField]: sortOrder,
        },
        skip,
        take,
      });

      const total = await this.prisma.author.count({ where: filters });

      return {
        data: authors,
        total,
        page: Number(page),
        limit: Number(limit),
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  async findOne(id: number) {
    try {
      let author = await this.prisma.author.findFirst({ where: { id } });
      if (!author) {
        return `Cannot get author by this ${id} id!`;
      }
      return author;
    } catch (error) {
      return error;
    }
  }

  async update(id: number, data: UpdateAuthorDto) {
    try {
      let author = await this.prisma.author.update({ where: { id }, data });
      if (!author) {
        return `Cannot update author by this ${id} id!`;
      }
      return author;
    } catch (error) {
      return error;
    }
  }

  async remove(id: number) {
    try {
      let author = await this.prisma.author.delete({ where: { id } });
      if (!author) {
        return `Cannot delete author with this ${id} id!`;
      }
      return author;
    } catch (error) {
      return error;
    }
  }
}
