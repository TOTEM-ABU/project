import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { ApiQuery } from '@nestjs/swagger';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  create(@Body() createBookDto: CreateBookDto) {
    return this.bookService.create(createBookDto);
  }

  @Get()
  @ApiQuery({ name: 'name', required: false, description: 'Filter by name' })
  @ApiQuery({ name: 'price', required: false, description: 'Filter by price' })
  @ApiQuery({
    name: 'authorId',
    required: false,
    description: 'Filter by author ID',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    example: 'price:desc',
    description: 'Sort by field and order (e.g., price:desc)',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async findAll(
    @Query('name') name?: string,
    @Query('price') price?: string,
    @Query('authorId') authorId?: string,
    @Query('sort') sort: string = 'id:asc',
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.bookService.findAll({
      name,
      price,
      authorId,
      sort,
      page,
      limit,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.bookService.update(+id, updateBookDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookService.remove(+id);
  }
}
