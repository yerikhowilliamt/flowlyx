'use me';
'use client';

import { useState, useEffect, FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdminUser } from '../types/admin.types';
import {
  assignUserToOrganization,
  assignUserToWorkspace,
  assignUserToProject,
} from '../api/admin.api';
import { getOrganizations } from '@/features/organizations/api/organizations.api';
import { getWorkspaces } from '@/features/workspaces/api/workspaces.api';
import { getProjects } from '@/features/projects/api/projects.api';
import { OrganizationSummary } from '@/features/organizations/types/organization.types';
import { WorkspaceSummary } from '@/features/workspaces/types/workspace.types';
import { ProjectSummary } from '@/features/projects/types/project.types';
import { toast } from 'sonner';

interface AssignmentDialogProps {
  user: AdminUser | null;
  onClose: () => void;
}

type TargetType = 'ORGANIZATION' | 'WORKSPACE' | 'PROJECT';

export function AssignmentDialog({ user, onClose }: AssignmentDialogProps) {
  const [targetType, setTargetType] = useState<TargetType>('ORGANIZATION');
  const [orgs, setOrgs] = useState<OrganizationSummary[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);

  const [selectedOrg, setSelectedOrg] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [selectedProject, setSelectedProject] = useState('');

  const [role, setRole] = useState('MEMBER');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    async function loadInitialData() {
      try {
        const loadedOrgs = await getOrganizations().catch(() => []);
        setOrgs(loadedOrgs);
        if (loadedOrgs.length > 0) {
          setSelectedOrg(loadedOrgs[0].id);
        }
      } catch {
        // Ignored
      }
    }
    loadInitialData();
  }, [user]);

  // Load workspaces when selectedOrg changes
  useEffect(() => {
    if (targetType === 'WORKSPACE' && selectedOrg) {
      getWorkspaces(selectedOrg)
        .then((data) => {
          setWorkspaces(data);
          if (data.length > 0) setSelectedWorkspace(data[0].id);
        })
        .catch(() => setWorkspaces([]));
    }
  }, [targetType, selectedOrg]);

  // Load projects when selectedWorkspace changes
  useEffect(() => {
    if (targetType === 'PROJECT' && selectedWorkspace) {
      getProjects(selectedWorkspace)
        .then((data) => {
          setProjects(data);
          if (data.length > 0) setSelectedProject(data[0].id);
        })
        .catch(() => setProjects([]));
    }
  }, [targetType, selectedWorkspace]);

  const handleAssign = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      if (targetType === 'ORGANIZATION') {
        if (!selectedOrg) throw new Error('Please select an organization');
        await assignUserToOrganization(user.id, selectedOrg, role);
        toast.success(`Successfully assigned ${user.email} to Organization`);
      } else if (targetType === 'WORKSPACE') {
        if (!selectedWorkspace) throw new Error('Please select a workspace');
        await assignUserToWorkspace(user.id, selectedWorkspace, role);
        toast.success(`Successfully assigned ${user.email} to Workspace`);
      } else {
        if (!selectedProject) throw new Error('Please select a project');
        await assignUserToProject(user.id, selectedProject, role);
        toast.success(`Successfully assigned ${user.email} to Project`);
      }
      onClose();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to assign team context';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleOptions = () => {
    if (targetType === 'ORGANIZATION') {
      return (
        <>
          <SelectItem value="MEMBER">MEMBER</SelectItem>
          <SelectItem value="ADMIN">ADMIN</SelectItem>
          <SelectItem value="OWNER">OWNER</SelectItem>
        </>
      );
    }
    if (targetType === 'WORKSPACE') {
      return (
        <>
          <SelectItem value="VIEWER">VIEWER</SelectItem>
          <SelectItem value="MEMBER">MEMBER</SelectItem>
          <SelectItem value="ADMIN">ADMIN</SelectItem>
        </>
      );
    }
    return (
      <>
        <SelectItem value="MEMBER">MEMBER</SelectItem>
        <SelectItem value="PROJECT_MANAGER">PROJECT MANAGER</SelectItem>
        <SelectItem value="ADMIN">ADMIN</SelectItem>
      </>
    );
  };

  return (
    <Dialog open={!!user} onOpenChange={() => onClose()}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign User to Context</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Assign <span className="text-orange-400 font-semibold">{user?.email}</span> to an
            organization, workspace, or project.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAssign} className="space-y-4 py-2">
          <div className="space-y-2 flex flex-col">
            <label className="text-xs font-semibold text-zinc-300">Assignment Target</label>
            <Select
              value={targetType}
              onValueChange={(val) => {
                if (val) {
                  setTargetType(val as TargetType);
                  setRole('MEMBER');
                }
              }}
            >
              <SelectTrigger className="w-full bg-zinc-950 border-zinc-800 text-zinc-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
                <SelectItem value="ORGANIZATION">Organization</SelectItem>
                <SelectItem value="WORKSPACE">Workspace</SelectItem>
                <SelectItem value="PROJECT">Project</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 flex flex-col">
            <label className="text-xs font-semibold text-zinc-300">Select Context</label>

            {targetType === 'ORGANIZATION' && (
              <Select
                value={selectedOrg}
                onValueChange={(val) => {
                  if (val) setSelectedOrg(val);
                }}
              >
                <SelectTrigger className="w-full bg-zinc-950 border-zinc-800 text-zinc-200">
                  <SelectValue placeholder="Select Organization">
                    {orgs.find((o) => o.id === selectedOrg)?.name || 'Select Organization'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
                  {orgs.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {targetType === 'WORKSPACE' && (
              <div className="space-y-2 flex flex-col">
                <Select
                  value={selectedOrg}
                  onValueChange={(val) => {
                    if (val) setSelectedOrg(val);
                  }}
                >
                  <SelectTrigger className="w-full bg-zinc-950 border-zinc-800 text-zinc-200">
                    <SelectValue placeholder="-- Choose Organization First --">
                      {orgs.find((o) => o.id === selectedOrg)?.name ||
                        '-- Choose Organization First --'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
                    {orgs.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedOrg && (
                  <Select
                    value={selectedWorkspace}
                    onValueChange={(val) => {
                      if (val) setSelectedWorkspace(val);
                    }}
                  >
                    <SelectTrigger className="w-full bg-zinc-950 border-zinc-800 text-zinc-200">
                      <SelectValue placeholder="Select Workspace">
                        {workspaces.find((w) => w.id === selectedWorkspace)?.name ||
                          'Select Workspace'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
                      {workspaces.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {targetType === 'PROJECT' && (
              <div className="space-y-2 flex flex-col">
                <Select
                  value={selectedOrg}
                  onValueChange={(val) => {
                    if (val) setSelectedOrg(val);
                  }}
                >
                  <SelectTrigger className="w-full bg-zinc-950 border-zinc-800 text-zinc-200">
                    <SelectValue placeholder="-- Choose Organization First --">
                      {orgs.find((o) => o.id === selectedOrg)?.name ||
                        '-- Choose Organization First --'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
                    {orgs.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedOrg && (
                  <Select
                    value={selectedWorkspace}
                    onValueChange={(val) => {
                      if (val) setSelectedWorkspace(val);
                    }}
                  >
                    <SelectTrigger className="w-full bg-zinc-950 border-zinc-800 text-zinc-200">
                      <SelectValue placeholder="-- Choose Workspace --">
                        {workspaces.find((w) => w.id === selectedWorkspace)?.name ||
                          '-- Choose Workspace --'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
                      {workspaces.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {selectedWorkspace && (
                  <Select
                    value={selectedProject}
                    onValueChange={(val) => {
                      if (val) setSelectedProject(val);
                    }}
                  >
                    <SelectTrigger className="w-full bg-zinc-950 border-zinc-800 text-zinc-200">
                      <SelectValue placeholder="Select Project">
                        {projects.find((p) => p.id === selectedProject)?.name || 'Select Project'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2 flex flex-col">
            <label className="text-xs font-semibold text-zinc-300">Role in Context</label>
            <Select
              value={role}
              onValueChange={(val) => {
                if (val) setRole(val);
              }}
            >
              <SelectTrigger className="w-full bg-zinc-950 border-zinc-800 text-zinc-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
                {getRoleOptions()}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-zinc-800 text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {submitting ? 'Assigning...' : 'Assign User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
