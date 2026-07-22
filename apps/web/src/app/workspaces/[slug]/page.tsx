/* eslint-disable */
'use client';

import { use, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  useWorkspace,
  useUpdateWorkspace,
  useDeleteWorkspace,
} from '@/features/workspaces/hooks/use-workspaces';
import { useProjects } from '@/features/projects/hooks/use-projects';
import { ProjectList } from '@/features/projects/components/project-list';
import { BoardList } from '@/features/boards/components/board-list';
import { WorkspaceCalendar } from '@/features/calendar/components/workspace-calendar';
import { getOrganizationById } from '@/features/organizations/api/organizations.api';
import { NotificationBell } from '@/features/notifications/components/notification-bell';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Loader2,
  ArrowLeft,
  Building2,
  FolderKanban,
  Kanban,
  Settings,
  LayoutGrid,
  Users,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Layers,
  Sparkles,
  Plus,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from 'recharts';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const mockActivityData = [
  { day: 'Mon', tasks: 3 },
  { day: 'Tue', tasks: 7 },
  { day: 'Wed', tasks: 5 },
  { day: 'Thu', tasks: 12 },
  { day: 'Fri', tasks: 9 },
  { day: 'Sat', tasks: 4 },
  { day: 'Sun', tasks: 6 },
];

export default function WorkspaceDashboardPage({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch Workspace details
  const {
    data: workspace,
    isLoading: isWorkspaceLoading,
    isError: isWorkspaceError,
    error: workspaceError,
  } = useWorkspace(slug);

  // Fetch Projects
  const { data: projects } = useProjects(workspace?.id || '');

  // Fetch Organization details once workspace is available
  const { data: organization, isLoading: isOrgLoading } = useQuery({
    queryKey: ['organization', workspace?.organization_id],
    queryFn: () => getOrganizationById(workspace!.organization_id),
    enabled: !!workspace?.organization_id,
  });

  // Settings local state
  const [name, setName] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('ACTIVE');

  useEffect(() => {
    if (workspace) {
      setName(workspace.name);
      setCustomSlug(workspace.slug);
      setDescription(workspace.description || '');
      setStatus(workspace.status || 'ACTIVE');
    }
  }, [workspace]);

  // Mutations
  const updateWorkspaceMutation = useUpdateWorkspace(workspace?.organization_id || '');
  const deleteWorkspaceMutation = useDeleteWorkspace(workspace?.organization_id || '');

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace) return;
    updateWorkspaceMutation.mutate(
      {
        id: workspace.id,
        data: {
          name,
          slug: customSlug,
          description,
          status,
        },
      },
      {
        onSuccess: (updated) => {
          if (updated.slug !== slug) {
            router.push(`/workspaces/${updated.slug}`);
          }
        },
      },
    );
  };

  const handleDelete = () => {
    if (!workspace) return;
    if (
      confirm(
        'Are you absolutely sure you want to delete this workspace? This action cannot be undone.',
      )
    ) {
      deleteWorkspaceMutation.mutate(workspace.id, {
        onSuccess: () => {
          if (organization) {
            router.push(`/organizations/${organization.slug}`);
          } else {
            router.push('/organizations');
          }
        },
      });
    }
  };

  if (isWorkspaceLoading || isOrgLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (isWorkspaceError || !workspace) {
    return (
      <div className="min-h-dvh bg-zinc-950 text-zinc-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md flex flex-col items-center justify-center space-y-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center text-red-400">
          <p className="font-semibold text-white">Failed to load workspace</p>
          <p className="text-sm text-zinc-400">
            {workspaceError instanceof Error ? workspaceError.message : 'Workspace not found'}
          </p>
          <Link
            href="/organizations"
            className="flex items-center text-sm font-semibold text-orange-500 hover:text-orange-400 transition-colors"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Console
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-50 selection:bg-orange-500 selection:text-white">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-x-3">
            <Link href="/organizations" className="flex items-center gap-x-2 group">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-orange-500 text-white font-black text-xs shadow-[0_0_15px_rgba(249,115,22,0.25)]">
                F
              </div>
              <span className="text-sm font-bold tracking-tight text-white">
                Flow<span className="text-orange-500">lyx</span>
              </span>
            </Link>
            <span className="text-zinc-800">/</span>
            {organization && (
              <>
                <Link
                  href={`/organizations/${organization.slug}`}
                  className="flex items-center gap-x-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <Building2 className="h-3.5 w-3.5 text-zinc-500" />
                  <span>{organization.name}</span>
                </Link>
                <span className="text-zinc-800">/</span>
              </>
            )}
            <div className="flex items-center gap-x-1.5 text-sm text-zinc-200 font-semibold">
              <Layers className="h-3.5 w-3.5 text-orange-500" />
              <span>{workspace.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-x-4">
            <NotificationBell />
            <Link
              href="/profile"
              className="inline-flex items-center text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Profile
            </Link>
            {organization && (
              <Link
                href={`/organizations/${organization.slug}`}
                className="inline-flex items-center text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                Back to Organization
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        {/* Workspace Title Card */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-zinc-900 pb-8">
          <div className="flex items-center gap-x-4">
            <div className="rounded-2xl bg-orange-500/10 p-3 border border-orange-500/20 text-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.05)]">
              <Layers className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-x-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {workspace.name}
                </h1>
                <span className="inline-flex items-center rounded-full bg-orange-500/10 px-2 py-0.5 text-2xs font-semibold text-orange-500 ring-1 ring-orange-500/20">
                  {workspace.status}
                </span>
              </div>
              <p className="text-sm text-zinc-400 mt-1 max-w-xl">
                {workspace.description || 'No description provided for this workspace.'}
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList
            variant="line"
            className="border-b border-zinc-900 w-full justify-start gap-x-6 pb-px"
          >
            <TabsTrigger
              value="overview"
              className="pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-white data-[state=active]:bg-transparent transition-all cursor-pointer"
            >
              <LayoutGrid className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-white data-[state=active]:bg-transparent transition-all cursor-pointer"
            >
              <FolderKanban className="mr-2 h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger
              value="boards"
              className="pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-white data-[state=active]:bg-transparent transition-all cursor-pointer"
            >
              <Kanban className="mr-2 h-4 w-4" />
              Boards
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-white data-[state=active]:bg-transparent transition-all cursor-pointer"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-white data-[state=active]:bg-transparent transition-all cursor-pointer"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab Content */}
          <TabsContent value="overview" className="space-y-6 outline-none">
            {/* Quick Metrics Grid */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-zinc-900 bg-zinc-900/30 p-5 space-y-2">
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-xs font-semibold uppercase tracking-wider">Projects</span>
                  <FolderKanban className="h-4 w-4 text-zinc-400" />
                </div>
                <div className="flex items-baseline gap-x-2">
                  <span className="text-2xl font-bold text-white">{projects?.length ?? 0}</span>
                  <span className="text-xs text-zinc-500">Active</span>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-900 bg-zinc-900/30 p-5 space-y-2">
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-xs font-semibold uppercase tracking-wider">Tasks Done</span>
                  <CheckCircle2 className="h-4 w-4 text-orange-500" />
                </div>
                <div className="flex items-baseline gap-x-2">
                  <span className="text-2xl font-bold text-white">0</span>
                  <span className="text-xs text-zinc-500">Tasks</span>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-900 bg-zinc-900/30 p-5 space-y-2">
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-xs font-semibold uppercase tracking-wider">Activity</span>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-baseline gap-x-2">
                  <span className="text-2xl font-bold text-white">Stable</span>
                  <span className="text-xs text-zinc-500">Task speed</span>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-900 bg-zinc-900/30 p-5 space-y-2">
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-xs font-semibold uppercase tracking-wider">Team</span>
                  <Users className="h-4 w-4 text-zinc-400" />
                </div>
                <div className="flex items-baseline gap-x-2">
                  <span className="text-2xl font-bold text-white">1</span>
                  <span className="text-xs text-zinc-500">Member</span>
                </div>
              </div>
            </div>

            {/* Performance and Activity Chart */}
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 rounded-2xl border border-zinc-900 bg-zinc-900/10 p-6 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white">Task Completion Activity</h3>
                  <p className="text-xs text-zinc-400">
                    Overview of completed tasks across the past week.
                  </p>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={mockActivityData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="day"
                        stroke="#52525b"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                      <RechartsTooltip
                        contentStyle={{
                          background: '#09090b',
                          borderColor: '#27272a',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#a1a1aa', fontWeight: 'bold' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="tasks"
                        stroke="#f97316"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorTasks)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sidebar Info Panel */}
              <div className="rounded-2xl border border-zinc-900 bg-zinc-900/30 p-6 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Workspace Details</h3>
                  <p className="text-xs text-zinc-400">Metadata and reference properties.</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex justify-between border-b border-zinc-900 pb-2">
                    <span className="text-zinc-500 font-semibold uppercase">ID</span>
                    <span className="font-mono text-zinc-300">{workspace.id}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-900 pb-2">
                    <span className="text-zinc-500 font-semibold uppercase">Slug</span>
                    <span className="font-mono text-zinc-300">/{workspace.slug}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-900 pb-2">
                    <span className="text-zinc-500 font-semibold uppercase">Created At</span>
                    <span className="text-zinc-300">
                      {new Date(workspace.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-zinc-500 font-semibold uppercase">Status</span>
                    <span className="text-orange-500 font-semibold">{workspace.status}</span>
                  </div>
                </div>

                <div className="rounded-xl bg-orange-500/5 border border-orange-500/10 p-4 space-y-2">
                  <div className="flex items-center gap-x-2 text-orange-500">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-xs font-bold">Protip</span>
                  </div>
                  <p className="text-2xs text-zinc-400 leading-relaxed">
                    Set up boards and invite your squad to start mapping out features, boards, and
                    deadlines.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="outline-none">
            <ProjectList workspaceId={workspace.id} />
          </TabsContent>

          {/* Boards Tab */}
          <TabsContent value="boards" className="outline-none">
            <BoardList projects={projects || []} workspaceSlug={slug} />
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="outline-none">
            <WorkspaceCalendar workspaceId={workspace.id} />
          </TabsContent>

          {/* Settings Tab Content */}
          <TabsContent value="settings" className="space-y-8 outline-none">
            <div className="rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6">
              <form onSubmit={handleUpdate} className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Workspace Properties</h3>
                  <p className="text-xs text-zinc-400">
                    Update workspace metadata, display name, and status.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-y-1.5">
                    <Label
                      htmlFor="name"
                      className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                    >
                      Workspace Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border-zinc-800 bg-zinc-900/40 focus-visible:ring-1 focus-visible:ring-orange-500"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-y-1.5">
                    <Label
                      htmlFor="slug"
                      className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                    >
                      Workspace Slug
                    </Label>
                    <Input
                      id="slug"
                      type="text"
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value)}
                      className="border-zinc-800 bg-zinc-900/40 focus-visible:ring-1 focus-visible:ring-orange-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-y-1.5">
                  <Label
                    htmlFor="description"
                    className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                  >
                    Description
                  </Label>
                  <Input
                    id="description"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="border-zinc-800 bg-zinc-900/40 focus-visible:ring-1 focus-visible:ring-orange-500"
                  />
                </div>

                <div className="flex flex-col gap-y-1.5 w-full sm:w-1/2">
                  <Label
                    htmlFor="status"
                    className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                  >
                    Status
                  </Label>
                  <Select value={status} onValueChange={(val) => setStatus(val || 'ACTIVE')}>
                    <SelectTrigger className="w-full border-zinc-800 bg-zinc-900/40 text-zinc-100">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-900 text-zinc-50">
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={updateWorkspaceMutation.isPending}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    {updateWorkspaceMutation.isPending ? 'Saving changes...' : 'Save Properties'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Danger Zone */}
            <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-6 space-y-4">
              <div className="flex items-center gap-x-2.5 text-red-400">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="text-base font-bold text-white">Danger Zone</h3>
              </div>
              <p className="text-xs text-zinc-400 max-w-xl">
                Deleting this workspace will delete all projects, boards, sprint items, and
                configurations permanently. This action cannot be reversed.
              </p>
              <div className="pt-2">
                <Button
                  onClick={handleDelete}
                  disabled={deleteWorkspaceMutation.isPending}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {deleteWorkspaceMutation.isPending ? 'Deleting workspace...' : 'Delete Workspace'}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
