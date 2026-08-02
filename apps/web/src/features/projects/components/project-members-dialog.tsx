'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useWorkspaceMembers } from '@/features/workspaces/hooks/use-workspaces';
import {
  useProjectMembers,
  useCreateProjectMember,
  useDeleteProjectMember,
  useUpdateProjectMember,
} from '../hooks/use-project-members';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, UserPlus, Trash2, Shield, User } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectMembersDialogProps {
  projectId: string;
  workspaceId: string;
  projectName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectMembersDialog({
  projectId,
  workspaceId,
  projectName,
  open,
  onOpenChange,
}: ProjectMembersDialogProps) {
  const { data: workspaceMembers = [], isLoading: isWorkspaceMembersLoading } =
    useWorkspaceMembers(workspaceId);
  const {
    data: projectMembersResp,
    isLoading: isProjectMembersLoading,
    refetch,
  } = useProjectMembers(projectId);
  const projectMembers = Array.isArray(projectMembersResp)
    ? projectMembersResp
    : (projectMembersResp as unknown as { data?: unknown[] })?.data || [];

  const createMemberMutation = useCreateProjectMember(projectId);
  const updateMemberMutation = useUpdateProjectMember(projectId);
  const deleteMemberMutation = useDeleteProjectMember(projectId);

  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('MEMBER');
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

  // Filter workspace members who are NOT in the project yet
  const nonProjectMembers = Array.isArray(workspaceMembers)
    ? workspaceMembers.filter(
        (wm) =>
          !projectMembers.some(
            (pm) =>
              ((pm as { userId?: string; user_id?: string }).userId ||
                (pm as { userId?: string; user_id?: string }).user_id) === wm.id,
          ),
      )
    : [];

  const handleAddMember = async () => {
    if (!selectedUserId) {
      toast.error('Please select a member to add');
      return;
    }
    try {
      await createMemberMutation.mutateAsync({
        projectId,
        userId: selectedUserId,
        role: selectedRole,
      });
      toast.success('Member added successfully');
      setSelectedUserId('');
      refetch();
    } catch (error: unknown) {
      const errObj = error as { data?: { message?: string }; message?: string };
      const message = errObj?.data?.message || errObj?.message || 'Failed to add project member';
      toast.error(message);
    }
  };

  const handleRoleChange = async (memberId: string, role: string) => {
    try {
      await updateMemberMutation.mutateAsync({
        id: memberId,
        payload: { role },
      });
      toast.success('Member role updated');
      refetch();
    } catch (error: unknown) {
      const errObj = error as { data?: { message?: string }; message?: string };
      const message = errObj?.data?.message || errObj?.message || 'Failed to update member role';
      toast.error(message);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await deleteMemberMutation.mutateAsync(memberId);
      toast.success('Member removed from project');
      refetch();
    } catch (error: unknown) {
      const errObj = error as { data?: { message?: string }; message?: string };
      const message = errObj?.data?.message || errObj?.message || 'Failed to remove project member';
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-zinc-950 border-zinc-900 text-zinc-50 rounded-2xl">
        <DialogHeader className="text-left space-y-1">
          <DialogTitle className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-500" />
            Project Members
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-400">
            Manage who has access to the project zone:{' '}
            <span className="text-white font-medium">{projectName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Add member form */}
          <div className="space-y-2 p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl">
            <h4 className="text-xs font-semibold text-zinc-300">Add Workspace Member</h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Select
                  value={selectedUserId}
                  onValueChange={(val) => {
                    if (val && val !== '_empty') setSelectedUserId(val);
                  }}
                >
                  <SelectTrigger className="w-full bg-zinc-950 border-zinc-800 text-zinc-200">
                    <SelectValue placeholder="Select member...">
                      {workspaceMembers.find((m) => m.id === selectedUserId)?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-900 text-white">
                    {nonProjectMembers.length === 0 ? (
                      <SelectItem value="_empty" disabled>
                        All workspace members already added
                      </SelectItem>
                    ) : (
                      nonProjectMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} ({member.email})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <div className="w-28 flex-1 sm:flex-none">
                  <Select
                    value={selectedRole}
                    onValueChange={(val) => {
                      if (val) setSelectedRole(val);
                    }}
                  >
                    <SelectTrigger className="w-full bg-zinc-950 border-zinc-800 text-zinc-200">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                      <SelectItem value="MEMBER">MEMBER</SelectItem>
                      <SelectItem value="ADMIN">ADMIN</SelectItem>
                      <SelectItem value="VIEWER">VIEWER</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleAddMember}
                  size="icon"
                  className="bg-orange-500 hover:bg-orange-600 active:scale-[0.97] transition-all duration-150 text-white cursor-pointer shrink-0"
                  disabled={!selectedUserId || createMemberMutation.isPending}
                  aria-label="Add member to project"
                >
                  {createMemberMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Members list */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-zinc-400">
              Current Members ({projectMembers.length})
            </h4>
            {isProjectMembersLoading || isWorkspaceMembersLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
              </div>
            ) : projectMembers.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-6 bg-zinc-900/10 border border-dashed border-zinc-900 rounded-xl">
                No custom project members added.
              </p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {projectMembers.map((member, index) => {
                  const mUserId = member.userId || member.user_id;
                  const uInfo = workspaceMembers.find((wm) => wm.id === mUserId);
                  return (
                    <div
                      key={member.id ? `pm-${member.id}` : `pm-usr-${mUserId}-${index}`}
                      className="flex items-center justify-between p-2.5 bg-zinc-900/20 border border-zinc-900 rounded-xl hover:bg-zinc-900/40 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 text-xs font-bold">
                          {uInfo?.avatarUrl ? (
                            <Image
                              src={uInfo.avatarUrl}
                              alt={uInfo.name}
                              width={28}
                              height={28}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">
                            {uInfo?.name || 'Unknown User'}
                          </div>
                          <div className="text-3xs text-zinc-500 leading-none">
                            {uInfo?.email || 'N/A'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Select
                          value={member.role}
                          onValueChange={(val) => {
                            if (val) handleRoleChange(member.id, val);
                          }}
                        >
                          <SelectTrigger className="h-7 bg-zinc-950 border-zinc-800 text-3xs text-zinc-300 w-24">
                            <SelectValue placeholder="Role" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                            <SelectItem value="MEMBER">MEMBER</SelectItem>
                            <SelectItem value="ADMIN">ADMIN</SelectItem>
                            <SelectItem value="VIEWER">VIEWER</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setMemberToRemove(member.id)}
                          className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 active:scale-[0.97] transition-all duration-150 cursor-pointer"
                          aria-label={`Remove ${uInfo?.name || 'user'} from project`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Remove Member Confirmation Alert Dialog */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 rounded-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400 font-bold">Remove Member</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 text-xs">
              Are you sure you want to remove this member from the project? They will lose access to all boards and tasks inside this project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setMemberToRemove(null)}
              className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl text-xs"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (memberToRemove) {
                  handleRemoveMember(memberToRemove);
                  setMemberToRemove(null);
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
