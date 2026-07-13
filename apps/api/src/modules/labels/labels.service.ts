import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';
import { prisma, Label, TaskLabel } from '@flowlyx/database';

@Injectable()
export class LabelsService {
  async create(createLabelDto: CreateLabelDto): Promise<Label> {
    const project = await prisma.project.findUnique({ where: { id: createLabelDto.projectId } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return prisma.label.create({ data: createLabelDto });
  }

  async findAllByProjectId(projectId: string): Promise<Label[]> {
    return prisma.label.findMany({
      where: { projectId },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<Label> {
    const label = await prisma.label.findUnique({ where: { id } });
    if (!label) {
      throw new NotFoundException('Label not found');
    }
    return label;
  }

  async update(id: string, updateLabelDto: UpdateLabelDto): Promise<Label> {
    await this.findById(id);
    return prisma.label.update({ where: { id }, data: updateLabelDto });
  }

  async remove(id: string): Promise<boolean> {
    await this.findById(id);
    await prisma.label.delete({ where: { id } });
    return true;
  }

  async addToTask(labelId: string, taskId: string): Promise<TaskLabel> {
    const [label, task] = await Promise.all([
      prisma.label.findUnique({ where: { id: labelId } }),
      prisma.task.findUnique({ where: { id: taskId } }),
    ]);
    if (!label) throw new NotFoundException('Label not found');
    if (!task) throw new NotFoundException('Task not found');

    const existing = await prisma.taskLabel.findUnique({
      where: { taskId_labelId: { taskId, labelId } },
    });
    if (existing) throw new ConflictException('Label already assigned to task');

    return prisma.taskLabel.create({ data: { taskId, labelId } });
  }

  async removeFromTask(labelId: string, taskId: string): Promise<boolean> {
    const record = await prisma.taskLabel.findUnique({
      where: { taskId_labelId: { taskId, labelId } },
    });
    if (!record) throw new NotFoundException('Label is not assigned to this task');

    await prisma.taskLabel.delete({ where: { id: record.id } });
    return true;
  }

  async findByTaskId(taskId: string): Promise<Label[]> {
    const taskLabels = await prisma.taskLabel.findMany({
      where: { taskId },
      include: { label: true },
    });
    return taskLabels.map((tl) => tl.label);
  }
}
