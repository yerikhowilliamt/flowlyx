import { Injectable } from '@nestjs/common';
import { prisma } from '@flowlyx/database';
import { SearchQueryDto } from './dto/search-query.dto';

@Injectable()
export class SearchService {
  async search(queryDto: SearchQueryDto) {
    const { q, limit = 10 } = queryDto;

    if (!q) {
      return {
        tasks: [],
        projects: [],
        workspaces: [],
      };
    }

    // ponytail: naive ILIKE scan. Upgrade to PostgreSQL Full-Text Search (tsvector) when search gets slow
    const [tasks, projects, workspaces] = await Promise.all([
      prisma.task.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: limit,
        select: { id: true, title: true, description: true, status: true, listId: true },
      }),
      prisma.project.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          slug: true,
          status: true,
          workspaceId: true,
        },
      }),
      prisma.workspace.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          slug: true,
          status: true,
          organizationId: true,
        },
      }),
    ]);

    return {
      tasks,
      projects,
      workspaces,
    };
  }
}
