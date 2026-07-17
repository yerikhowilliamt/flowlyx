import { Injectable } from '@nestjs/common';
import { prisma, Task } from '@flowlyx/database';
import { GetCalendarDto } from './dto/get-calendar.dto';

@Injectable()
export class CalendarService {
  async getTasks(query: GetCalendarDto): Promise<Task[]> {
    const { workspaceId, projectId, startDate, endDate } = query;

    const tasks = await prisma.task.findMany({
      where: {
        list: {
          board: {
            project: projectId ? { id: projectId } : { workspaceId },
          },
        },
        status: 'ACTIVE',
        OR: [
          {
            dueDate: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
          {
            startDate: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
        ],
      },
    });

    return tasks;
  }
}
