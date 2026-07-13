import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreatePriorityDto } from './dto/create-priority.dto';
import { UpdatePriorityDto } from './dto/update-priority.dto';

@Injectable()
export class PrioritiesService {
  constructor(private prisma: PrismaClient) {}

  async create(createPriorityDto: CreatePriorityDto, userId: string) {
    // Check if priority with same name already exists in project
    const existing = await this.prisma.priority.findFirst({
      where: {
        projectId: createPriorityDto.projectId,
        name: createPriorityDto.name,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Priority with name ${createPriorityDto.name} already exists in this project`,
      );
    }

    return this.prisma.priority.create({
      data: {
        ...createPriorityDto,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  }

  async findAllByProjectId(projectId: string) {
    return this.prisma.priority.findMany({
      where: {
        projectId,
        deletedAt: null,
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  async findById(id: string) {
    const priority = await this.prisma.priority.findUnique({
      where: { id },
    });

    if (!priority || priority.deletedAt) {
      throw new NotFoundException(`Priority with ID ${id} not found`);
    }

    return priority;
  }

  async update(id: string, updatePriorityDto: UpdatePriorityDto, userId: string) {
    const priority = await this.findById(id); // Ensure it exists

    if (updatePriorityDto.name) {
      const existing = await this.prisma.priority.findFirst({
        where: {
          projectId: priority.projectId,
          name: updatePriorityDto.name,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (existing) {
        throw new ConflictException(
          `Priority with name ${updatePriorityDto.name} already exists in this project`,
        );
      }
    }

    return this.prisma.priority.update({
      where: { id },
      data: {
        ...updatePriorityDto,
        updatedBy: userId,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findById(id);

    return this.prisma.priority.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: userId,
      },
    });
  }
}
