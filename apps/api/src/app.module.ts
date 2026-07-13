import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from './core/logger/logger.module';
import { validateEnv } from './core/config/env.validation';
import { CorrelationIdMiddleware } from './core/middleware/correlation-id.middleware';
import { RequestContextMiddleware } from './core/middleware/request-context.middleware';

import { HealthModule } from './core/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { ProjectMembersModule } from './modules/project-members/project-members.module';
import { BoardsModule } from './modules/boards/boards.module';
import { ListsModule } from './modules/lists/lists.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { SubtasksModule } from './modules/subtasks/subtasks.module';
import { LabelsModule } from './modules/labels/labels.module';
import { PrioritiesModule } from './modules/priorities/priorities.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    LoggerModule,
    HealthModule,
    UsersModule,
    AuthModule,
    OrganizationsModule,
    WorkspacesModule,
    ProjectsModule,
    RbacModule,
    ProjectMembersModule,
    BoardsModule,
    ListsModule,
    TasksModule,
    SubtasksModule,
    LabelsModule,
    PrioritiesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware, RequestContextMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
