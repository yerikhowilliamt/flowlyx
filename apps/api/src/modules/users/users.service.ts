import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { prisma, User, Prisma } from '@flowlyx/database';
import { PaginationDto } from '../../core/pagination';
import { createPaginatedResponse } from '../../common/utils/pagination.util';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Role } from '../rbac/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async create(createUserDto: CreateUserDto & { passwordHash: string }): Promise<User> {
    const existing = await this.findByEmail(createUserDto.email);
    if (existing) {
      throw new ConflictException(
        'This email is already registered. Please use a different email address.',
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...data } = createUserDto;
    return prisma.user.create({ data });
  }

  async findAll(query: PaginationDto, actor?: { id: string; role: string }) {
    const { page, limit, sortBy, sortOrder, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (actor && actor.role === Role.ADMIN) {
      // Find all organizations, workspaces, and projects where the actor is a member
      const [actorOrgs, actorWorkspaces, actorProjects] = await Promise.all([
        prisma.organizationMember.findMany({
          where: { userId: actor.id },
          select: { organizationId: true },
        }),
        prisma.workspaceMember.findMany({
          where: { userId: actor.id },
          select: { workspaceId: true },
        }),
        prisma.projectMember.findMany({ where: { userId: actor.id }, select: { projectId: true } }),
      ]);

      const orgIds = actorOrgs.map((o) => o.organizationId);
      const workspaceIds = actorWorkspaces.map((w) => w.workspaceId);
      const projectIds = actorProjects.map((p) => p.projectId);

      const andFilters: Prisma.UserWhereInput[] = [];
      if (where.AND) {
        if (Array.isArray(where.AND)) {
          andFilters.push(...where.AND);
        } else {
          andFilters.push(where.AND);
        }
      }

      where.AND = [
        ...andFilters,
        {
          OR: [
            { id: actor.id },
            {
              organizationMembers: {
                some: { organizationId: { in: orgIds } },
              },
            },
            {
              workspaceMembers: {
                some: { workspaceId: { in: workspaceIds } },
              },
            },
            {
              projectMembers: {
                some: { projectId: { in: projectIds } },
              },
            },
          ],
        },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.user.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  private async verifyManagementPermission(
    actor?: { id: string; role: string },
    targetUser?: User | null,
  ): Promise<void> {
    if (!actor || !targetUser) return;

    if (actor.role === Role.SUPER_ADMIN) {
      return;
    }

    if (actor.role === Role.ADMIN) {
      if (targetUser.role === Role.SUPER_ADMIN) {
        throw new ForbiddenException('Admins cannot update or delete Super Admin accounts');
      }

      if (actor.id === targetUser.id) {
        return;
      }

      const sharedMembership = await prisma.user.findFirst({
        where: {
          id: targetUser.id,
          OR: [
            {
              organizationMembers: {
                some: {
                  organization: {
                    members: {
                      some: { userId: actor.id },
                    },
                  },
                },
              },
            },
            {
              workspaceMembers: {
                some: {
                  workspace: {
                    members: {
                      some: { userId: actor.id },
                    },
                  },
                },
              },
            },
            {
              projectMembers: {
                some: {
                  project: {
                    members: {
                      some: { userId: actor.id },
                    },
                  },
                },
              },
            },
          ],
        },
      });

      if (!sharedMembership) {
        throw new ForbiddenException(
          'Admins can only manage users within their organization or team',
        );
      }

      return;
    }

    if (actor.id !== targetUser.id) {
      throw new ForbiddenException('You do not have permission to manage this user account');
    }
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    actor?: { id: string; role: string },
    file?: Express.Multer.File,
  ): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.verifyManagementPermission(actor, user);

    if (updateUserDto.role && updateUserDto.role !== user.role) {
      if (!actor || actor.role !== Role.SUPER_ADMIN) {
        throw new ForbiddenException('Only Super Admins can modify user roles');
      }
    }

    const dataToUpdate: Prisma.UserUpdateInput = { ...updateUserDto };

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadFile(file, 'flowlyx/avatars');
      if ('url' in uploadResult) {
        dataToUpdate.avatarUrl = uploadResult.url;
      }
    }

    return prisma.user.update({ where: { id }, data: dataToUpdate });
  }

  async delete(id: string, actor?: { id: string; role: string }): Promise<boolean> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.verifyManagementPermission(actor, user);

    await prisma.user.delete({ where: { id } });
    return true;
  }

  async updateRefreshToken(id: string, refreshToken: string | null): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { refreshToken },
    });
  }

  async assignToOrganization(userId: string, organizationId: string, role: string) {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const org = await prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org) throw new NotFoundException('Organization not found');

    return prisma.organizationMember.upsert({
      where: { organizationId_userId: { organizationId, userId } },
      update: { role },
      create: { organizationId, userId, role },
    });
  }

  async assignToWorkspace(userId: string, workspaceId: string, role: string) {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const ws = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!ws) throw new NotFoundException('Workspace not found');

    return prisma.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId, userId } },
      update: { role },
      create: { workspaceId, userId, role },
    });
  }

  async assignToProject(userId: string, projectId: string, role: string) {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const proj = await prisma.project.findUnique({ where: { id: projectId } });
    if (!proj) throw new NotFoundException('Project not found');

    return prisma.projectMember.upsert({
      where: { projectId_userId: { projectId, userId } },
      update: { role },
      create: { projectId, userId, role },
    });
  }
}
