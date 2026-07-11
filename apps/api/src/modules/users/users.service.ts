import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { prisma, User } from '@flowlyx/database';

@Injectable()
export class UsersService {
  async create(createUserDto: CreateUserDto & { passwordHash: string }): Promise<User> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...data } = createUserDto;
    return prisma.user.create({ data });
  }

  async findAll(query?: unknown): Promise<User[]> {
    return prisma.user.findMany({ where: query as Record<string, unknown> });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return prisma.user.update({ where: { id }, data: updateUserDto });
  }

  async delete(id: string): Promise<boolean> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await prisma.user.delete({ where: { id } });
    return true;
  }
}
