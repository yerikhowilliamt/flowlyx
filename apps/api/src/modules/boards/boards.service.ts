import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { prisma, Board } from '@flowlyx/database';

@Injectable()
export class BoardsService {
  async create(createBoardDto: CreateBoardDto): Promise<Board> {
    const project = await prisma.project.findUnique({ where: { id: createBoardDto.projectId } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return prisma.board.create({ data: createBoardDto });
  }

  async findAllByProjectId(projectId: string): Promise<Board[]> {
    return prisma.board.findMany({ where: { projectId } });
  }

  async findById(id: string): Promise<Board> {
    const board = await prisma.board.findUnique({ where: { id } });
    if (!board) {
      throw new NotFoundException('Board not found');
    }
    return board;
  }

  async update(id: string, updateBoardDto: UpdateBoardDto): Promise<Board> {
    await this.findById(id);
    return prisma.board.update({ where: { id }, data: updateBoardDto });
  }

  async remove(id: string): Promise<boolean> {
    await this.findById(id);
    await prisma.board.delete({ where: { id } });
    return true;
  }
}
