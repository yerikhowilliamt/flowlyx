import { Injectable } from '@nestjs/common';
import { prisma, User } from '@flowlyx/database';
import { BaseRepository } from '../../core/base/base.repository';

@Injectable()
export class UsersRepository implements BaseRepository<User> {
  async findAll(query?: unknown): Promise<User[]> {
    return prisma.user.findMany({ where: query as never });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: unknown): Promise<User> {
    return prisma.user.create({ data: data as never });
  }

  async update(id: string, data: unknown): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: data as never,
    });
  }

  async delete(id: string): Promise<boolean> {
    await prisma.user.delete({ where: { id } });
    return true;
  }
}
