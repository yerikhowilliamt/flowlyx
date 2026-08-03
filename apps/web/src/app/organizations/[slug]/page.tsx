'use client';

import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getOrganizationBySlug } from '@/features/organizations/api/organizations.api';
import {
  useUpdateOrganization,
  useDeleteOrganization,
} from '@/features/organizations/hooks/use-organizations';
import { useBillingInfo, useUpdateBillingPlan } from '@/features/organizations/hooks/use-billing';
import { WorkspaceList } from '@/features/workspaces/components/workspace-list';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Loader2,
  ArrowLeft,
  Building2,
  AlertTriangle,
  Settings,
  Layers,
  LogOut,
  CreditCard,
  Check,
  Menu,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { NotificationBell } from '@/features/notifications/components/notification-bell';
import Image from 'next/image';
import { useLogout } from '@/features/auth/hooks/use-logout';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function OrganizationDashboardPage({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('workspaces');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDeleteOrgAlertOpen, setIsDeleteOrgAlertOpen] = useState(false);
  const logoutMutation = useLogout();

  // Organization settings states
  const [name, setName] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [description, setDescription] = useState('');
  const [billingPlan, setBillingPlan] = useState<'FREE' | 'PRO' | 'ENTERPRISE'>('FREE');
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  const {
    data: organization,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['organization', slug],
    queryFn: () => getOrganizationBySlug(slug),
    enabled: !!slug,
  });

  // Sync state with loaded organization data
  if (organization && name === '' && !customSlug && !description) {
    setName(organization.name);
    setCustomSlug(organization.slug);
    setDescription(organization.description || '');
  }

  const updateOrgMutation = useUpdateOrganization();
  const deleteOrgMutation = useDeleteOrganization();

  const { data: billing, isLoading: billingLoading } = useBillingInfo(organization?.id ?? '');
  const updateBillingMutation = useUpdateBillingPlan(organization?.id ?? '');

  const [syncedBillingId, setSyncedBillingId] = useState<string | null>(null);
  if (billing && billing.id !== syncedBillingId) {
    setSyncedBillingId(billing.id);
    setBillingPlan(billing.currentPlan);
    setBillingCycle(billing.billingCycle);
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;
    updateOrgMutation.mutate(
      {
        id: organization.id,
        data: {
          name,
          slug: customSlug,
          description,
        },
      },
      {
        onSuccess: (updated) => {
          if (updated.slug !== slug) {
            router.push(`/organizations/${updated.slug}`);
          }
        },
      },
    );
  };

  const handleDelete = () => {
    if (!organization) return;
    deleteOrgMutation.mutate(organization.id, {
      onSuccess: () => {
        router.push('/organizations');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (isError || !organization) {
    return (
      <div className="min-h-dvh bg-zinc-950 text-zinc-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md flex flex-col items-center justify-center space-y-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center text-red-400">
          <p className="font-semibold text-white">Failed to load organization</p>
          <p className="text-sm text-zinc-400">
            {error instanceof Error ? error.message : 'Organization not found'}
          </p>
          <Link
            href="/organizations"
            className="flex items-center text-sm font-semibold text-orange-500 hover:text-orange-400 transition-colors"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Organizations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-50">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-x-2 sm:gap-x-4 min-w-0">
            <Link href="/organizations" className="flex items-center gap-x-2 group shrink-0">
              <div>
                <Image src={'/Flowlyx.webp'} alt="Flowlyx" width={70} height={20} priority />
              </div>
            </Link>
            <span className="text-zinc-700 shrink-0">/</span>
            <div className="flex items-center gap-x-2 text-sm text-zinc-400 truncate">
              <Building2 className="h-4 w-4 text-zinc-500 shrink-0" />
              <span className="font-medium text-zinc-300 truncate">{organization.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-x-2 sm:gap-x-4">
            <NotificationBell />

            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-x-4">
              <Link
                href="/organizations"
                className="inline-flex items-center text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                All Organizations
              </Link>
              <button
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="inline-flex items-center text-xs font-semibold text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
              >
                <LogOut className="mr-1 h-3.5 w-3.5" />
                Logout
              </button>
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-1.5 text-zinc-400 hover:text-white rounded-lg bg-zinc-900 border border-zinc-850 cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-zinc-900 bg-zinc-950 p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
            <Link
              href="/organizations"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 rounded-lg transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4 text-zinc-400" />
              All Organizations
            </Link>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                logoutMutation.mutate();
              }}
              disabled={logoutMutation.isPending}
              className="w-full flex items-center px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Main Page Layout */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-10">
        {/* Organization Hero Block */}
        <div className="relative overflow-hidden rounded-3xl border border-zinc-900/90 bg-gradient-to-r from-orange-500/5 via-zinc-900/30 to-zinc-950 p-6 sm:p-8 backdrop-blur-sm shadow-[0_0_30px_rgba(0,0,0,0.3)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-4 relative z-10">
            <div className="flex items-center gap-x-4">
              <div className="rounded-2xl bg-orange-500/10 p-3.5 border border-orange-500/20 text-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.1)] shrink-0">
                <Building2 className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {organization.name}
                </h1>
                <p className="text-xs text-zinc-400 font-mono mt-1">slug: /{organization.slug}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Layout */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList
            variant="line"
            className="border-b border-zinc-900 w-full justify-start gap-x-4 sm:gap-x-6 pb-px overflow-x-auto scrollbar-none flex-nowrap shrink-0"
          >
            <TabsTrigger
              value="workspaces"
              className="pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-white data-[state=active]:bg-transparent transition-all cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Layers className="mr-2 h-4 w-4" />
              Workspaces
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-white data-[state=active]:bg-transparent transition-all cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Workspaces Content */}
          <TabsContent value="workspaces" className="outline-none space-y-6">
            <WorkspaceList organizationId={organization.id} />
          </TabsContent>

          {/* Settings Content */}
          <TabsContent value="settings" className="space-y-8 outline-none">
            <div className="rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6">
              <form onSubmit={handleUpdate} className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Organization Properties</h3>
                  <p className="text-xs text-zinc-400">
                    Update organization metadata, display name, and unique URL slug.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-y-1.5">
                    <Label
                      htmlFor="name"
                      className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                    >
                      Organization Name
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
                      Organization Slug
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

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={updateOrgMutation.isPending}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    {updateOrgMutation.isPending ? 'Saving changes...' : 'Save Properties'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Billing */}
            <div className="rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-2.5 text-zinc-300">
                  <CreditCard className="h-5 w-5 text-orange-500" />
                  <div>
                    <h3 className="text-base font-bold text-white">Billing & Plan</h3>
                    <p className="text-xs text-zinc-400">
                      Manage your organization subscription and billing cycle
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    (billing?.currentPlan ?? 'FREE') === 'PRO'
                      ? 'default'
                      : (billing?.currentPlan ?? 'FREE') === 'ENTERPRISE'
                        ? 'destructive'
                        : 'secondary'
                  }
                  className="w-fit text-xs px-3 py-1 rounded-full font-bold uppercase"
                >
                  Current: {billing?.currentPlan ?? 'FREE'}
                </Badge>
              </div>

              {billingLoading ? (
                <div className="flex items-center gap-2 py-4 text-zinc-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Loading billing information...</span>
                </div>
              ) : billing ? (
                <div className="grid gap-4 sm:grid-cols-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
                  <div className="flex flex-col gap-y-1">
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Status
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        billing.status === 'ACTIVE'
                          ? 'text-green-400'
                          : billing.status === 'PAST_DUE'
                            ? 'text-red-400'
                            : 'text-zinc-400'
                      }`}
                    >
                      {billing.status === 'ACTIVE'
                        ? 'Active'
                        : billing.status === 'PAST_DUE'
                          ? 'Past Due'
                          : 'Canceled'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-y-1">
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Billing Cycle
                    </span>
                    <span className="text-sm font-bold text-zinc-200">
                      {billing.billingCycle === 'MONTHLY' ? 'Monthly' : 'Yearly'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-y-1">
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Next Renewal
                    </span>
                    <span className="text-sm font-bold text-zinc-200">
                      {new Date(billing.nextBillingDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-500">No billing information available.</p>
              )}

              <div className="border-t border-zinc-800 pt-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <Label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Available Plans
                    </Label>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Select a tier that scales with your team size and operational needs
                    </p>
                  </div>
                  <div className="flex rounded-xl border border-zinc-800 bg-zinc-900/60 p-1 w-fit">
                    {(['MONTHLY', 'YEARLY'] as const).map((cycle) => (
                      <button
                        key={cycle}
                        type="button"
                        onClick={() => setBillingCycle(cycle)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                          billingCycle === cycle
                            ? 'bg-orange-500 text-white font-bold'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {cycle === 'MONTHLY' ? 'Monthly' : 'Yearly (Save 20%)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    {
                      name: 'FREE' as const,
                      price: '$0',
                      desc: 'Essential features for individuals & small starter projects.',
                      features: ['Up to 5 members', '3 Workspaces', 'Basic Sprint Boards'],
                    },
                    {
                      name: 'PRO' as const,
                      price: billingCycle === 'MONTHLY' ? '$29' : '$24',
                      desc: 'Advanced tools and higher limits for growing teams.',
                      features: ['Up to 25 members', 'Unlimited Workspaces', 'Priority Support', 'Advanced Analytics'],
                    },
                    {
                      name: 'ENTERPRISE' as const,
                      price: billingCycle === 'MONTHLY' ? '$99' : '$79',
                      desc: 'Dedicated controls, security, and unlimited scale.',
                      features: ['Unlimited members', 'Custom Security & SAML SSO', '24/7 SLA Support', 'Dedicated Success Manager'],
                    },
                  ].map((tier) => {
                    const isSelected = billingPlan === tier.name;
                    const currentPlanName = billing?.currentPlan ?? 'FREE';
                    const isCurrent = currentPlanName === tier.name;

                    return (
                      <Card
                        key={tier.name}
                        onClick={() => setBillingPlan(tier.name)}
                        className={`relative flex flex-col justify-between transition-all cursor-pointer select-none ${
                          isSelected
                            ? 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/5'
                            : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50'
                        }`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-bold text-white">
                              {tier.name}
                            </CardTitle>
                            {isCurrent && (
                              <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 border-orange-500/40 bg-orange-500/20 text-orange-400">
                                Current Plan
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-2xl font-extrabold text-white">
                              {tier.price}
                            </span>
                            <span className="text-xs text-zinc-400">
                              / {tier.price === '$0' ? 'forever' : 'seat / mo'}
                            </span>
                          </div>
                          <CardDescription className="text-xs text-zinc-400 mt-1">
                            {tier.desc}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="pb-4">
                          <ul className="space-y-2">
                            {tier.features.map((feat) => (
                              <li
                                key={feat}
                                className="flex items-center gap-2 text-xs text-zinc-300"
                              >
                                <Check className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>

                        <CardFooter className="pt-2 border-t border-zinc-800/80 pb-4">
                          <div
                            className={`w-full text-center py-2 rounded-lg text-xs font-semibold transition-all ${
                              isCurrent
                                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold'
                                : isSelected
                                  ? 'bg-orange-500 text-white font-bold'
                                  : 'bg-zinc-800/60 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {isCurrent
                              ? 'Current Plan'
                              : isSelected
                                ? 'Selected'
                                : 'Choose ' + tier.name}
                          </div>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>

                <div className="flex items-center justify-end pt-2">
                  <Button
                    onClick={() =>
                      updateBillingMutation.mutate({ plan: billingPlan, billingCycle })
                    }
                    disabled={
                      updateBillingMutation.isPending ||
                      ((billing?.currentPlan ?? 'FREE') === billingPlan &&
                        (billing?.billingCycle ?? 'MONTHLY') === billingCycle)
                    }
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl cursor-pointer disabled:opacity-50 px-6"
                  >
                    {updateBillingMutation.isPending ? 'Updating plan...' : 'Update Subscription'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-6 space-y-4">
              <div className="flex items-center gap-x-2.5 text-red-400">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="text-base font-bold text-white">Danger Zone</h3>
              </div>
              <p className="text-xs text-zinc-400 max-w-xl">
                Deleting this organization will delete all workspaces, projects, boards, sprint
                items, and configurations permanently. This action cannot be reversed.
              </p>
              <div className="pt-2">
                <Button
                  onClick={() => setIsDeleteOrgAlertOpen(true)}
                  disabled={deleteOrgMutation.isPending}
                  variant="destructive"
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl"
                >
                  {deleteOrgMutation.isPending ? 'Deleting...' : 'Delete Organization'}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Delete Organization Alert Dialog */}
        <AlertDialog open={isDeleteOrgAlertOpen} onOpenChange={setIsDeleteOrgAlertOpen}>
          <AlertDialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 rounded-2xl max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-400 font-bold">Delete Organization</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400 text-xs">
                Are you absolutely sure you want to delete <strong className="text-zinc-200">{organization.name}</strong>? This will delete all workspaces, projects, boards, and configurations permanently. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => setIsDeleteOrgAlertOpen(false)}
                className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl text-xs"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  handleDelete();
                  setIsDeleteOrgAlertOpen(false);
                }}
                className="bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs"
              >
                Delete Organization
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
