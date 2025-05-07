import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BookService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateBookDto) {
    try {
      let book = await this.prisma.book.create({ data });
      if (!book) {
        return 'Cannot create book!';
      }
      return book;
    } catch (error) {
      return error;
    }
  }

  async findAll(query: {
    name?: string;
    price?: string;
    authorId?: string;
    sort?: string;
    page?: string;
    limit?: string;
  }) {
    try {
      const {
        name,
        price,
        authorId,
        sort = 'id:asc',
        page = '1',
        limit = '10',
      } = query;

      const [sortField, sortOrder] = sort.split(':');

      const filters: any = {};
      if (name) filters.name = { contains: name, mode: 'insensitive' };
      if (price) filters.price = Number(price);
      if (authorId) filters.authorId = Number(authorId);

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const items = await this.prisma.book.findMany({
        where: filters,
        orderBy: {
          [sortField]: sortOrder,
        },
        skip,
        take,
        include: {
          Author: true,
        },
      });

      const total = await this.prisma.book.count({ where: filters });

      return {
        data: items,
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
      let book = await this.prisma.book.findFirst({ where: { id } });
      if (!book) {
        return `Cannot get book by this ${id} id!`;
      }
      return book;
    } catch (error) {
      return error;
    }
  }

  async update(id: number, data: UpdateBookDto) {
    try {
      let book = await this.prisma.book.update({ where: { id }, data });
      if (!book) {
        return `Cannot update book by this ${id} id!`;
      }
      return book;
    } catch (error) {
      return error;
    }
  }

  async remove(id: number) {
    try {
      let book = await this.prisma.book.delete({ where: { id } });
      if (!book) {
        return `Cannot delete book with this ${id} id!`;
      }
      return book;
    } catch (error) {
      return error;
    }
  }
}
