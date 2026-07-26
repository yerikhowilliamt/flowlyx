import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@flowlyx/database';

@Injectable()
export class ExportService {
  async exportWorkspaceData(workspaceId: string) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        projects: {
          include: {
            boards: {
              include: {
                lists: {
                  include: {
                    tasks: {
                      include: {
                        subtasks: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException(`Workspace with ID ${workspaceId} not found`);
    }

    return workspace;
  }
}
