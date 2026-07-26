import { Injectable, BadRequestException } from '@nestjs/common';
import { prisma } from '@flowlyx/database';

interface ImportData {
  projects?: Array<Record<string, unknown>>;
}

@Injectable()
export class ImportService {
  async importWorkspaceData(workspaceId: string, data: ImportData) {
    if (!data || !data.projects || !Array.isArray(data.projects)) {
      throw new BadRequestException('Invalid import data format');
    }

    // Verify workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new BadRequestException(`Workspace with ID ${workspaceId} not found`);
    }

    // Process import inside a transaction
    return prisma.$transaction(async (tx) => {
      let importedProjectsCount = 0;
      let importedTasksCount = 0;

      for (const projectData of data.projects!) {
        const project = await tx.project.create({
          data: {
            name: String(projectData.name),
            slug: projectData.slug
              ? String(projectData.slug)
              : String(projectData.name)
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-'),
            description: projectData.description ? String(projectData.description) : null,
            workspaceId: workspaceId,
            status: projectData.status ? String(projectData.status) : 'ACTIVE',
          },
        });
        importedProjectsCount++;

        if (projectData.boards && Array.isArray(projectData.boards)) {
          for (const boardData of projectData.boards) {
            const board = await tx.board.create({
              data: {
                name: String(boardData.name),
                description: boardData.description ? String(boardData.description) : null,
                projectId: project.id,
              },
            });

            if (boardData.lists && Array.isArray(boardData.lists)) {
              for (const listData of boardData.lists) {
                const list = await tx.list.create({
                  data: {
                    name: String(listData.name),
                    order: Number(listData.order),
                    boardId: board.id,
                  },
                });

                if (listData.tasks && Array.isArray(listData.tasks)) {
                  for (const taskData of listData.tasks) {
                    await tx.task.create({
                      data: {
                        title: String(taskData.title),
                        description: taskData.description ? String(taskData.description) : null,
                        listId: list.id,
                        status: taskData.status ? String(taskData.status) : 'TODO',
                        priorityId: taskData.priorityId ? String(taskData.priorityId) : undefined, // Might need mapping if priorities are workspace-specific
                        order: Number(taskData.order),
                        dueDate: taskData.dueDate ? new Date(String(taskData.dueDate)) : null,
                      },
                    });
                    importedTasksCount++;
                  }
                }
              }
            }
          }
        }
      }

      return {
        success: true,
        message: 'Import completed successfully',
        stats: {
          projectsImported: importedProjectsCount,
          tasksImported: importedTasksCount,
        },
      };
    });
  }
}
