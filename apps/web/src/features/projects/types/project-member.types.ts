export interface ProjectMember {
  id: string;
  projectId?: string;
  project_id?: string;
  userId?: string;
  user_id?: string;
  role: 'MEMBER' | 'ADMIN' | 'VIEWER' | string;
  status: 'ACTIVE' | 'INACTIVE' | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjectMemberPayload {
  projectId: string;
  userId: string;
  role?: string;
  status?: string;
}

export interface UpdateProjectMemberPayload {
  role?: string;
  status?: string;
}

export interface ProjectMemberDetail extends ProjectMember {
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
}
