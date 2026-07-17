import { Module, Global } from '@nestjs/common';
import { RolesGuard, OrganizationRolesGuard, WorkspaceRolesGuard } from './guards';

@Global()
@Module({
  providers: [RolesGuard, OrganizationRolesGuard, WorkspaceRolesGuard],
  exports: [RolesGuard, OrganizationRolesGuard, WorkspaceRolesGuard],
})
export class RbacModule {}
