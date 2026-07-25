/* eslint-disable */
'use client';

import Image from 'next/image';
import { use, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  useWorkspace,
  useWorkspaceActivity,
  useWorkspaceStats,
  useWorkspaceMembers,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { useMe } from '@/features/profile/hooks/use-profile';
import { StorageUploadCard } from '@/features/workspaces/components/storage-upload-card';
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
  LogOut,
  Shield,
  Menu,
  X,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useLogout } from '@/features/auth/hooks/use-logout';
import { useSearch } from '@/features/search/hooks/use-search';
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

export default function WorkspaceDashboardPage({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const logoutMutation = useLogout();
  const { data: meUser } = useMe();
  const isAdmin = meUser?.role === 'ADMIN' || meUser?.role === 'SUPER_ADMIN';
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [activityRange, setActivityRange] = useState<'7d' | '30d' | '1y'>('7d');
  const [activeDetailModal, setActiveDetailModal] = useState<'tasksDone' | 'team' | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Search local state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { data: searchResults, isLoading: isSearchLoading } = useSearch(searchQuery, 5);

  // Fetch Workspace details
  const {
    data: workspace,
    isLoading: isWorkspaceLoading,
    isError: isWorkspaceError,
    error: workspaceError,
  } = useWorkspace(slug);

  // Fetch Workspace Real Members
  const { data: teamMembers } = useWorkspaceMembers(workspace?.id || '');

  // Fetch Workspace Activity
  const { data: activityData } = useWorkspaceActivity(workspace?.id || '', activityRange);

  // Fetch Workspace Real Statistics
  const { data: stats } = useWorkspaceStats(workspace?.id || '');

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
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Left Breadcrumbs */}
          <div className="flex items-center gap-x-2 sm:gap-x-3 min-w-0">
            <Link href="/organizations" className="flex items-center gap-x-2 group shrink-0">
              <div>
                <Image src={'/Flowlyx.webp'} alt="Flowlyx" width={70} height={20} priority />
              </div>
            </Link>
            <span className="text-zinc-800 shrink-0">/</span>
            {organization && (
              <>
                <Link
                  href={`/organizations/${organization.slug}`}
                  className="hidden md:flex items-center gap-x-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors shrink-0 max-w-[120px] lg:max-w-none truncate"
                >
                  <Building2 className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                  <span className="truncate">{organization.name}</span>
                </Link>
                <span className="hidden md:inline text-zinc-800 shrink-0">/</span>
              </>
            )}
            <div className="flex items-center gap-x-1.5 text-sm text-zinc-200 font-semibold truncate">
              <Layers className="h-3.5 w-3.5 text-orange-500 shrink-0" />
              <span className="truncate">{workspace.name}</span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-x-2 sm:gap-x-4">
            {/* Search Input and Dropdown */}
            <div className="relative w-36 sm:w-56 md:w-64">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="w-full h-8 pl-3 pr-8 text-xs bg-zinc-900/90 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-orange-500/80 focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
              <div className="absolute right-2.5 top-2 pointer-events-none hidden sm:flex items-center">
                <kbd className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-1 py-0.5 border border-zinc-800 rounded shadow-2xs">⌘K</kbd>
              </div>
              {isSearchFocused && searchQuery.trim() && (
                <div className="absolute right-0 mt-2 w-72 max-h-80 overflow-y-auto bg-zinc-950/95 backdrop-blur-md border border-zinc-800/80 rounded-2xl shadow-2xl z-50 p-2 text-xs divide-y divide-zinc-900/80 scrollbar-none animate-in fade-in-50 zoom-in-95 duration-150">
                  {isSearchLoading ? (
                    <div className="flex items-center justify-center py-4 text-zinc-500">
                      <Loader2 className="h-4 w-4 animate-spin text-orange-500 mr-2" />
                      Searching...
                    </div>
                  ) : (
                    <>
                      {/* Workspaces Section */}
                      {searchResults?.workspaces && searchResults.workspaces.length > 0 && (
                        <div className="py-1.5 first:pt-0">
                          <div className="font-bold text-zinc-500 text-3xs uppercase tracking-wider px-2 mb-1">Workspaces</div>
                          {searchResults.workspaces.map((w) => (
                            <Link
                              key={w.id}
                              href={`/workspaces/${w.slug}`}
                              className="block px-2 py-1.5 hover:bg-zinc-900/90 rounded-xl text-zinc-200 transition-colors"
                            >
                              <div className="font-medium text-xs text-white">{w.name}</div>
                              {w.description && <div className="text-3xs text-zinc-400 truncate">{w.description}</div>}
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Projects Section */}
                      {searchResults?.projects && searchResults.projects.length > 0 && (
                        <div className="py-1.5">
                          <div className="font-bold text-zinc-500 text-3xs uppercase tracking-wider px-2 mb-1">Projects</div>
                          {searchResults.projects.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => {
                                setSelectedProjectId(p.id);
                                setActiveTab('boards');
                              }}
                              className="w-full text-left block px-2 py-1.5 hover:bg-zinc-900/90 rounded-xl text-zinc-200 transition-colors cursor-pointer"
                            >
                              <div className="font-medium text-xs text-white">{p.name}</div>
                              {p.description && <div className="text-3xs text-zinc-400 truncate">{p.description}</div>}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Tasks Section */}
                      {searchResults?.tasks && searchResults.tasks.length > 0 && (
                        <div className="py-1.5 last:pb-0">
                          <div className="font-bold text-zinc-500 text-3xs uppercase tracking-wider px-2 mb-1">Tasks</div>
                          {searchResults.tasks.map((t) => (
                            <div
                              key={t.id}
                              className="px-2 py-1.5 text-zinc-200"
                            >
                              <div className="font-medium text-xs text-white">{t.title}</div>
                              {t.description && <div className="text-3xs text-zinc-400 truncate">{t.description}</div>}
                            </div>
                          ))}
                        </div>
                      )}

                      {(!searchResults?.workspaces?.length &&
                        !searchResults?.projects?.length &&
                        !searchResults?.tasks?.length) && (
                        <div className="py-4 text-center text-zinc-500">No results found</div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <NotificationBell />

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-x-4">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="inline-flex items-center text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-orange-500/10"
                >
                  <Shield className="mr-1.5 h-3.5 w-3.5" />
                  Admin Dashboard
                </Link>
              )}
              <Link
                href="/profile"
                className="inline-flex items-center text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-zinc-900"
              >
                Profile
              </Link>
              {organization && (
                <Link
                  href={`/organizations/${organization.slug}`}
                  className="inline-flex items-center text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-zinc-900"
                >
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                  Back to Organization
                </Link>
              )}
              <button
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="inline-flex items-center text-xs font-semibold text-zinc-400 hover:text-red-400 transition-colors cursor-pointer px-2.5 py-1.5 rounded-lg hover:bg-red-500/10"
              >
                <LogOut className="mr-1.5 h-3.5 w-3.5" />
                Logout
              </button>
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 text-zinc-400 hover:text-white rounded-xl bg-zinc-900/80 border border-zinc-800 cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-zinc-900 bg-zinc-950/95 backdrop-blur-md p-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center px-3 py-2.5 text-xs font-semibold text-orange-400 hover:bg-orange-500/10 rounded-xl transition-colors"
              >
                <Shield className="mr-2.5 h-4 w-4" />
                Admin Dashboard
              </Link>
            )}
            <Link
              href="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center px-3 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 rounded-xl transition-colors"
            >
              <User className="mr-2.5 h-4 w-4 text-zinc-400" />
              Profile
            </Link>
            {organization && (
              <Link
                href={`/organizations/${organization.slug}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center px-3 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 rounded-xl transition-colors"
              >
                <Building2 className="mr-2.5 h-4 w-4 text-zinc-400" />
                Back to {organization.name}
              </Link>
            )}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                logoutMutation.mutate();
              }}
              disabled={logoutMutation.isPending}
              className="w-full flex items-center px-3 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-left cursor-pointer"
            >
              <LogOut className="mr-2.5 h-4 w-4" />
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Workspace Hero Title Card */}
        <div className="relative overflow-hidden rounded-3xl border border-zinc-900/90 bg-gradient-to-r from-orange-500/5 via-zinc-900/30 to-zinc-950 p-6 sm:p-8 backdrop-blur-sm shadow-[0_0_30px_rgba(0,0,0,0.3)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 relative z-10">
            <div className="flex items-center gap-x-4">
              <div className="rounded-2xl bg-orange-500/10 p-3.5 border border-orange-500/20 text-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.1)] shrink-0">
                <Layers className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>
              <div>
                <div className="flex items-center gap-x-3 flex-wrap">
                  <h1 className="text-xl font-bold tracking-tight text-white sm:text-3xl">
                    {workspace.name}
                  </h1>
                  <span className="inline-flex items-center rounded-full bg-orange-500/10 px-2.5 py-0.5 text-2xs font-semibold text-orange-400 ring-1 ring-orange-500/20">
                    <span className="relative flex h-1.5 w-1.5 mr-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
                    </span>
                    {workspace.status}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl leading-relaxed">
                  {workspace.description || 'No description provided for this workspace.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList
            variant="line"
            className="border-b border-zinc-900 w-full justify-start gap-x-4 sm:gap-x-6 pb-px overflow-x-auto scrollbar-none flex-nowrap shrink-0"
          >
            <TabsTrigger
              value="overview"
              className="pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-white data-[state=active]:bg-transparent transition-all cursor-pointer shrink-0 whitespace-nowrap"
            >
              <LayoutGrid className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-white data-[state=active]:bg-transparent transition-all cursor-pointer shrink-0 whitespace-nowrap"
            >
              <FolderKanban className="mr-2 h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger
              value="boards"
              className="pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-white data-[state=active]:bg-transparent transition-all cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Kanban className="mr-2 h-4 w-4" />
              Boards
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-white data-[state=active]:bg-transparent transition-all cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-white data-[state=active]:bg-transparent transition-all cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab Content */}
          <TabsContent value="overview" className="space-y-6 outline-none">
            {/* Quick Metrics Grid */}
            <div className="grid gap-3 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <div
                onClick={() => setActiveTab('projects')}
                className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/50 to-zinc-950 p-5 space-y-2 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-500/40 hover:shadow-[0_0_25px_rgba(249,115,22,0.08)] active:scale-[0.98]"
                title="Click to view all projects"
              >
                <div className="flex items-center justify-between text-zinc-500 group-hover:text-orange-400 transition-colors">
                  <span className="text-2xs font-bold uppercase tracking-wider">Projects</span>
                  <FolderKanban className="h-4 w-4" />
                </div>
                <div className="flex items-baseline gap-x-2">
                  <span className="text-2xl font-extrabold text-white group-hover:text-orange-500 transition-colors">
                    {stats?.totalProjects ?? projects?.length ?? 0}
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">Active</span>
                </div>
              </div>

              <div
                onClick={() => setActiveDetailModal('tasksDone')}
                className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/50 to-zinc-950 p-5 space-y-2 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-500/40 hover:shadow-[0_0_25px_rgba(249,115,22,0.08)] active:scale-[0.98]"
                title="Click to view completed tasks breakdown"
              >
                <div className="flex items-center justify-between text-zinc-500 group-hover:text-orange-400 transition-colors">
                  <span className="text-2xs font-bold uppercase tracking-wider">Tasks Done</span>
                  <CheckCircle2 className="h-4 w-4 text-orange-500" />
                </div>
                <div className="flex items-baseline gap-x-2">
                  <span className="text-2xl font-extrabold text-white group-hover:text-orange-500 transition-colors">
                    {stats?.tasksDone ?? 0}
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">Tasks</span>
                </div>
              </div>

              <div
                onClick={() => {
                  document
                    .getElementById('activity-chart-section')
                    ?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/50 to-zinc-950 p-5 space-y-2 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-green-500/40 hover:shadow-[0_0_25px_rgba(34,197,94,0.08)] active:scale-[0.98]"
                title="Click to view activity chart"
              >
                <div className="flex items-center justify-between text-zinc-500 group-hover:text-green-400 transition-colors">
                  <span className="text-2xs font-bold uppercase tracking-wider">Activity</span>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-baseline gap-x-2">
                  <span className="text-2xl font-extrabold text-white group-hover:text-green-400 transition-colors">
                    {stats?.activitySpeed ?? 'Stable'}
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">Task speed</span>
                </div>
              </div>

              <div
                onClick={() => setActiveDetailModal('team')}
                className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/50 to-zinc-950 p-5 space-y-2 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-500/40 hover:shadow-[0_0_25px_rgba(249,115,22,0.08)] active:scale-[0.98]"
                title="Click to view team members"
              >
                <div className="flex items-center justify-between text-zinc-500 group-hover:text-orange-400 transition-colors">
                  <span className="text-2xs font-bold uppercase tracking-wider">Team</span>
                  <Users className="h-4 w-4" />
                </div>
                <div className="flex items-baseline gap-x-2">
                  <span className="text-2xl font-extrabold text-white group-hover:text-orange-500 transition-colors">
                    {stats?.teamMembers ?? teamMembers?.length ?? 2}
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">Members</span>
                </div>
              </div>
            </div>

            {/* Performance and Activity Chart */}
            <div id="activity-chart-section" className="grid gap-6 md:grid-cols-3 scroll-mt-24">
              <div className="md:col-span-2 rounded-2xl border border-zinc-900 bg-zinc-900/10 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">Task Completion Activity</h3>
                    <p className="text-xs text-zinc-400">
                      Overview of task activity across the selected timeframe.
                    </p>
                  </div>
                  <Select
                    value={activityRange}
                    onValueChange={(val) => setActivityRange(val as '7d' | '30d' | '1y')}
                  >
                    <SelectTrigger className="w-[110px] h-8 text-xs border-zinc-800 bg-zinc-900/60 text-zinc-200">
                      <SelectValue placeholder="Range" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
                      <SelectItem value="7d">1 Week</SelectItem>
                      <SelectItem value="30d">1 Month</SelectItem>
                      <SelectItem value="1y">1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={activityData || []}
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
            <ProjectList
              workspaceId={workspace.id}
              onSelectProject={(projectId) => {
                setSelectedProjectId(projectId);
                setActiveTab('boards');
              }}
            />
          </TabsContent>

          {/* Boards Tab */}
          <TabsContent value="boards" className="outline-none">
            <BoardList
              projects={projects || []}
              workspaceSlug={slug}
              selectedProjectId={selectedProjectId}
              onSelectProject={setSelectedProjectId}
            />
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="outline-none">
            <WorkspaceCalendar workspaceId={workspace.id} />
          </TabsContent>

          {/* Settings Tab Content */}
          <TabsContent value="settings" className="space-y-8 outline-none">
            <div className="space-y-6">
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

              <StorageUploadCard workspaceId={workspace.id} />
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

        {/* Tasks Done Detail Modal */}
        <Dialog
          open={activeDetailModal === 'tasksDone'}
          onOpenChange={(open) => !open && setActiveDetailModal(null)}
        >
          <DialogContent className="max-w-md bg-zinc-950 border-zinc-900 text-zinc-50 rounded-2xl">
            <DialogHeader className="text-left space-y-1">
              <DialogTitle className="text-xl font-bold text-white tracking-tight flex items-center gap-x-2">
                <CheckCircle2 className="h-5 w-5 text-orange-500" />
                Completed Tasks Overview
              </DialogTitle>
              <DialogDescription className="text-sm text-zinc-400">
                Summary of task completions across all boards in this workspace.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="rounded-xl bg-zinc-900/50 border border-zinc-900 p-4 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-300">Total Completed Tasks</span>
                <span className="text-xl font-bold text-orange-500">{stats?.tasksDone ?? 0}</span>
              </div>

              <div className="rounded-xl bg-zinc-900/50 border border-zinc-900 p-4 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-300">Active Workspace Projects</span>
                <span className="text-xl font-bold text-white">{stats?.totalProjects ?? projects?.length ?? 0}</span>
              </div>

              <div className="rounded-xl bg-zinc-900/50 border border-zinc-900 p-4 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-300">Throughput Velocity</span>
                <span className="text-sm font-bold text-green-400">{stats?.activitySpeed ?? 'Stable'}</span>
              </div>

              <p className="text-2xs text-zinc-500 leading-relaxed text-center">
                Navigate to the Boards tab to inspect individual sprint columns and tasks.
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Team Members Detail Modal */}
        <Dialog
          open={activeDetailModal === 'team'}
          onOpenChange={(open) => !open && setActiveDetailModal(null)}
        >
          <DialogContent className="max-w-md bg-zinc-950 border-zinc-900 text-zinc-50 rounded-2xl">
            <DialogHeader className="text-left space-y-1">
              <DialogTitle className="text-xl font-bold text-white tracking-tight flex items-center gap-x-2">
                <Users className="h-5 w-5 text-orange-500" />
                Workspace Team Members
              </DialogTitle>
              <DialogDescription className="text-sm text-zinc-400">
                Registered users and team members with workspace access.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-2 max-h-72 overflow-y-auto pr-1">
              {teamMembers && teamMembers.length > 0 ? (
                teamMembers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-900"
                  >
                    <div className="flex items-center gap-x-3">
                      <div className="h-8 w-8 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center text-xs font-bold uppercase">
                        {user.name?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{user.name}</p>
                        <p className="text-2xs text-zinc-500 font-mono">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-zinc-900 text-orange-400 border border-zinc-800">
                      {user.role || 'MEMBER'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-zinc-500">No team members loaded.</div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
