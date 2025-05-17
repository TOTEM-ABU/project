import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class BookService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(data: CreateBookDto) {
    try {
      const book = await this.prisma.book.create({ data });
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
    const cacheKey = `books:${JSON.stringify(query)}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

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

      const result = {
        data: items,
        total,
        page: Number(page),
        limit: Number(limit),
      };

      await this.cacheManager.set(cacheKey, result, 60); // cache 60 sekund
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  async findOne(id: number) {
    const cacheKey = `book:${id}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const book = await this.prisma.book.findFirst({ where: { id } });
      if (!book) {
        return `Cannot get book by this ${id} id!`;
      }

      await this.cacheManager.set(cacheKey, book, 60);
      return book;
    } catch (error) {
      return error;
    }
  }

  async update(id: number, data: UpdateBookDto) {
    try {
      const book = await this.prisma.book.update({ where: { id }, data });
      if (!book) {
        return `Cannot update book by this ${id} id!`;
      }

      await this.cacheManager.del(`book:${id}`);

      return book;
    } catch (error) {
      return error;
    }
  }

  async remove(id: number) {
    try {
      const book = await this.prisma.book.delete({ where: { id } });
      if (!book) {
        return `Cannot delete book with this ${id} id!`;
      }
      await this.cacheManager.del(`book:${id}`);
      return book;
    } catch (error) {
      return error;
    }
  }
}
