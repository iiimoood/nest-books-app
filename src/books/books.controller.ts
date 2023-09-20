import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  NotFoundException,
  Post,
  Put,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDTO } from './dtos/create-book-dto';
import { UpdateBookDTO } from './dtos/update-book-dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UsersService } from 'src/users/users.service';

@Controller('books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
    private usersService: UsersService,
  ) {}

  @Get()
  getAll(): any {
    return this.booksService.getAll();
  }

  @Get('/:id')
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    const book = await this.booksService.getById(id);
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  async deleteById(@Param('id', new ParseUUIDPipe()) id: string) {
    if (!(await this.booksService.getById(id)))
      throw new NotFoundException('Book not found');
    await this.booksService.deleteById(id);
    return { success: true };
  }

  @Post('/')
  @UseGuards(JwtAuthGuard)
  create(@Body() bookData: CreateBookDTO) {
    return this.booksService.create(bookData);
  }

  @Put('/:id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() bookData: UpdateBookDTO,
  ) {
    if (!(await this.booksService.getById(id)))
      throw new NotFoundException('Book not found');

    await this.booksService.updateById(id, bookData);
    return { success: true };
  }

  @Post('/like')
  @UseGuards(JwtAuthGuard)
  public async like(
    @Param('bookId', new ParseUUIDPipe()) bookId: string,
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ) {
    if (!(await this.booksService.getById(bookId)))
      throw new NotFoundException('Book not found');
    if (!(await this.usersService.getById(userId)))
      throw new NotFoundException('User not found');
    await this.booksService.like(bookId, userId);
    return { success: true };
  }
}
