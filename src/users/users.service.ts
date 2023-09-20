import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Password } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  public getAll(): Promise<User[]> {
    return this.prismaService.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        books: {
          include: {
            book: true,
          },
        },
      },
    });
  }

  public getById(id: User['id']): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });
  }

  public getByEmail(
    email: User['email'],
  ): Promise<(User & { password: Password }) | null> {
    return this.prismaService.user.findUnique({
      where: { email },
      include: { password: true },
    });
  }

  public async create(
    userData: Omit<User, 'id' | 'role'>,
    hashedPassword: string,
  ): Promise<User> {
    try {
      return await this.prismaService.user.create({
        data: {
          ...userData,
          password: {
            create: {
              hashedPassword,
            },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2002')
        throw new ConflictException('User with this email already exists.');
      throw error;
    }
  }

  public async updateById(
    userId: User['id'],
    userData: Omit<User, 'id'>,
    password: string | undefined,
  ): Promise<User> {
    try {
      if (password) {
        return await this.prismaService.user.update({
          where: { id: userId },
          data: {
            ...userData,
            password: {
              update: {
                hashedPassword: password,
              },
            },
          },
        });
      } else {
        return await this.prismaService.user.update({
          where: { id: userId },
          data: userData,
        });
      }
    } catch (error) {
      if (error.code === 'P2025')
        throw new BadRequestException("User doesn't exist");
    }
  }

  public deleteById(id: User['id']): Promise<User> {
    return this.prismaService.user.delete({
      where: { id },
      include: { password: true },
    });
  }
}
