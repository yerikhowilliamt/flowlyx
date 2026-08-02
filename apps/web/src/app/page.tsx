'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SmoothScrollProvider from '@/components/providers/smooth-scroll-provider';
import {
  ArrowRight,
  Shield,
  Zap,
  LayoutGrid,
  Building2,
  Kanban,
  Clock,
  FileCheck,
  LogOut,
  MoreVertical,
} from 'lucide-react';
import Image from 'next/image';
import { useMe } from '@/features/profile/hooks/use-profile';
import { useLogout } from '@/features/auth/hooks/use-logout';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export default function Home() {
  const { data: user } = useMe();
  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const logoutMutation = useLogout();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.to('.hero-line-inner', {
        y: '0%',
        duration: 1,
        ease: 'expo.out',
        stagger: 0.12,
        delay: 0.2,
      });

      gsap.from('.dashboard-mockup', {
        y: 60,
        opacity: 0,
        duration: 1.1,
        ease: 'power3.out',
        delay: 0.4,
      });

      gsap.fromTo(
        '.feature-card',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.15,
          scrollTrigger: {
            trigger: '.feature-grid',
            start: 'top 85%',
          },
        },
      );

      gsap.fromTo(
        '.workflow-card',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.15,
          scrollTrigger: {
            trigger: '.workflow-grid',
            start: 'top 85%',
          },
        },
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <SmoothScrollProvider>
      <div
        ref={containerRef}
        className="relative min-h-dvh overflow-hidden bg-zinc-950 text-zinc-50 selection:bg-orange-500 selection:text-white"
      >
        {/* Background Glows */}
        <div className="absolute top-0 left-1/2 -z-10 h-[500px] w-full max-w-7xl -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent blur-3xl pointer-events-none" />

        {/* Header */}
        <header className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between border-b border-zinc-900">
            <div className="">
              <Image src={'/Flowlyx.webp'} alt="Flowlyx" width={70} height={20} priority />
            </div>
            <nav className="hidden md:flex items-center gap-x-8 text-sm font-medium text-zinc-400">
              <a href="#features" className="hover:text-zinc-50 transition-colors">
                Features
              </a>
              <a href="#workflow" className="hover:text-zinc-50 transition-colors">
                Workflow
              </a>
              <Link href="/organizations" className="hover:text-zinc-50 transition-colors">
                Organizations
              </Link>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              {isAuthenticated ? (
                <>
                  {/* Desktop view: All buttons */}
                  <div className="hidden sm:flex items-center gap-2 sm:gap-3">
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="inline-flex items-center justify-center rounded-xl border border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 hover:text-orange-300 font-semibold text-xs sm:text-sm h-9 px-3 sm:px-4 transition-all"
                      >
                        <Shield className="mr-1.5 h-3.5 w-3.5" />
                        Admin
                      </Link>
                    )}
                    <Link
                      href="/organizations"
                      className="group inline-flex items-center justify-center rounded-xl bg-zinc-50 text-zinc-950 hover:bg-zinc-200 font-semibold text-xs sm:text-sm h-9 px-3 sm:px-4 transition-all"
                    >
                      Dashboard
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => logoutMutation.mutate()}
                      disabled={logoutMutation.isPending}
                      className="rounded-xl border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800 hover:text-white font-semibold text-xs sm:text-sm h-9 px-3 sm:px-4 cursor-pointer"
                    >
                      <LogOut className="mr-1.5 h-3.5 w-3.5" />
                      Logout
                    </Button>
                  </div>

                  {/* Mobile view: Max 2 buttons (Dashboard + Dropdown when >2 actions) */}
                  <div className="flex sm:hidden items-center gap-2">
                    <Link
                      href="/organizations"
                      className="group inline-flex items-center justify-center rounded-xl bg-zinc-50 text-zinc-950 hover:bg-zinc-200 font-semibold text-xs h-9 px-3 transition-all"
                    >
                      Dashboard
                      <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    {isAdmin ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="outline"
                              className="rounded-xl border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 hover:text-white h-9 px-2.5 cursor-pointer"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-44 bg-zinc-950 border-zinc-800 text-zinc-100">
                          <DropdownMenuItem
                            onClick={() => {
                              window.location.href = '/admin';
                            }}
                            className="text-xs text-orange-400 hover:bg-zinc-900 cursor-pointer"
                          >
                            <Shield className="mr-2 h-3.5 w-3.5" />
                            Admin Panel
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-zinc-800" />
                          <DropdownMenuItem
                            onClick={() => logoutMutation.mutate()}
                            disabled={logoutMutation.isPending}
                            className="text-xs text-zinc-400 hover:bg-zinc-900 hover:text-white cursor-pointer"
                          >
                            <LogOut className="mr-2 h-3.5 w-3.5" />
                            Logout
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => logoutMutation.mutate()}
                        disabled={logoutMutation.isPending}
                        className="rounded-xl border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800 hover:text-white font-semibold text-xs h-9 px-3 cursor-pointer"
                      >
                        <LogOut className="mr-1 h-3.5 w-3.5" />
                        Logout
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-x-4">
                  <Link
                    href="/login"
                    prefetch={false}
                    className="text-sm font-medium text-zinc-400 hover:text-zinc-50 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    prefetch={false}
                    className="group relative inline-flex items-center justify-center rounded-xl bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-all hover:bg-zinc-200"
                  >
                    Get Started
                    <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-28 text-center space-y-16">
          <div className="space-y-6 max-w-3xl mx-auto">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
              <span className="block overflow-hidden">
                <span className="hero-line-inner block translate-y-full mb-2">
                  Supercharge your team&apos;s
                </span>
              </span>
              <span className="block overflow-hidden">
                <span className="hero-line-inner block translate-y-full bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 bg-clip-text text-transparent pb-2">
                  project execution
                </span>
              </span>
            </h1>

            <p className="text-lg leading-8 text-zinc-400 max-w-2xl mx-auto">
              Manage organizations, coordinate workspaces, and track progress on an ultra-minimalist
              platform engineered for high-performance teams.
            </p>

            {/* Desktop Hero Buttons */}
            <div className="hidden sm:flex flex-row items-center justify-center gap-4 pt-4 w-full mx-auto">
              <Link
                href={isAuthenticated ? '/organizations' : '/register'}
                className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-6 h-12 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 hover:shadow-orange-500/30"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'}
              </Link>
              {isAuthenticated && isAdmin && (
                <Link
                  href="/admin"
                  className="inline-flex items-center justify-center rounded-xl border border-orange-500/30 bg-orange-500/10 px-6 h-12 text-sm font-semibold text-orange-400 hover:bg-orange-500/20 hover:text-orange-300 transition-colors"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Dashboard
                </Link>
              )}
              <Link
                href="/organizations"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm px-6 h-12 text-sm font-semibold text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800/80 transition-colors"
              >
                Explore Organizations
              </Link>
            </div>

            {/* Mobile Hero Buttons (Max 2 visible buttons) */}
            <div className="flex sm:hidden flex-col items-center justify-center gap-3 pt-4 w-full max-w-xs mx-auto">
              <Link
                href={isAuthenticated ? '/organizations' : '/register'}
                className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-6 h-11 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 hover:shadow-orange-500/30 w-full"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'}
              </Link>
              {isAuthenticated && isAdmin ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="outline"
                        className="rounded-xl border-zinc-800 bg-zinc-900/50 backdrop-blur-sm px-6 h-11 text-sm font-semibold text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800/80 transition-colors w-full cursor-pointer"
                      >
                        <MoreVertical className="mr-2 h-4 w-4" />
                        More Actions
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="center" className="w-56 bg-zinc-950 border-zinc-800 text-zinc-100">
                    <DropdownMenuItem
                      onClick={() => {
                        window.location.href = '/admin';
                      }}
                      className="text-xs text-orange-400 hover:bg-zinc-900 cursor-pointer"
                    >
                      <Shield className="mr-2 h-3.5 w-3.5" />
                      Admin Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    <DropdownMenuItem
                      onClick={() => {
                        window.location.href = '/organizations';
                      }}
                      className="text-xs text-zinc-300 hover:bg-zinc-900 hover:text-white cursor-pointer"
                    >
                      Explore Organizations
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  href="/organizations"
                  className="inline-flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm px-6 h-11 text-sm font-semibold text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800/80 transition-colors w-full"
                >
                  Explore Organizations
                </Link>
              )}
            </div>
          </div>

          {/* Agency-style Infinite Stats Ticker */}
          <div className="mx-auto max-w-4xl overflow-hidden border-y border-zinc-900 py-3 select-none">
            <div className="flex w-max animate-[marquee_25s_linear_infinite] gap-12 text-xs font-semibold uppercase tracking-widest text-zinc-500 hover:[animation-play-state:paused]">
              <span>10,000+ Tasks Completed</span>
              <span className="text-orange-500">•</span>
              <span>99.9% Uptime SLA</span>
              <span className="text-orange-500">•</span>
              <span>Zero Lag Kanban Engine</span>
              <span className="text-orange-500">•</span>
              <span>RBAC Enterprise Ready</span>
              <span className="text-orange-500">•</span>
              <span>10,000+ Tasks Completed</span>
              <span className="text-orange-500">•</span>
              <span>99.9% Uptime SLA</span>
              <span className="text-orange-500">•</span>
              <span>Zero Lag Kanban Engine</span>
              <span className="text-orange-500">•</span>
              <span>RBAC Enterprise Ready</span>
            </div>
          </div>

          {/* Dashboard Preview Mockup */}
          <div className="dashboard-mockup relative mx-auto max-w-5xl rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 backdrop-blur-sm shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent -bottom-1 z-10 pointer-events-none" />
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-inner">
              {/* Window Controls */}
              <div className="flex items-center justify-between border-b border-zinc-900 px-4 py-3 bg-zinc-900/30">
                <div className="flex gap-x-1.5">
                  <div className="h-3 w-3 rounded-full bg-zinc-800" />
                  <div className="h-3 w-3 rounded-full bg-zinc-800" />
                  <div className="h-3 w-3 rounded-full bg-zinc-800" />
                </div>
                <div className="text-xs text-zinc-500">flowlyx.com/organizations/acme-corp</div>
                <div className="w-9" />
              </div>
              {/* Visual content representation */}
              <div className="grid grid-cols-1 md:grid-cols-5 h-auto md:h-[340px] text-left">
                <aside className="col-span-1 border-r border-zinc-900 p-4 space-y-4 bg-zinc-900/10 hidden md:block">
                  <div className="h-6 w-20 rounded bg-zinc-800" />
                  <div className="space-y-2">
                    <div className="h-4 w-full rounded bg-zinc-900" />
                    <div className="h-4 w-3/4 rounded bg-zinc-900" />
                    <div className="h-4 w-5/6 rounded bg-zinc-900" />
                  </div>
                </aside>
                <main className="col-span-1 md:col-span-4 p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="h-8 w-48 rounded bg-zinc-800" />
                    <div className="h-8 w-24 rounded bg-orange-500/20 border border-orange-500/30" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="h-28 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2">
                      <div className="h-4 w-12 rounded bg-orange-500/20" />
                      <div className="h-4 w-3/4 rounded bg-zinc-800" />
                    </div>
                    <div className="h-28 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2">
                      <div className="h-4 w-12 rounded bg-orange-500/20" />
                      <div className="h-4 w-2/3 rounded bg-zinc-800" />
                    </div>
                    <div className="h-28 rounded-xl border border-dashed border-zinc-800 p-4 flex flex-col justify-center items-center">
                      <div className="h-6 w-6 rounded bg-zinc-800" />
                    </div>
                  </div>
                </main>
              </div>
            </div>
          </div>
        </main>

        {/* Feature Grid */}
        <section
          id="features"
          className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-28 border-t border-zinc-900"
        >
          <div className="mx-auto max-w-2xl text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Built for Enterprise Workflow
            </h2>
            <p className="text-zinc-400">
              A fast, high-security command center to run projects across your organizations.
            </p>
          </div>

          <div className="feature-grid mx-auto mt-16 max-w-5xl sm:mt-20 lg:mt-24">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="feature-card flex flex-col space-y-4 rounded-2xl border border-zinc-900 bg-zinc-900/10 p-6 transition-all hover:border-zinc-800">
                <dt className="flex items-center gap-x-3 text-base font-semibold text-white">
                  <LayoutGrid className="h-5 w-5 text-orange-500" />
                  Multi-Tenant Workspaces
                </dt>
                <dd className="text-sm text-zinc-400 leading-relaxed">
                  Organize projects by departments, client accounts, or squads under one central
                  enterprise organization hierarchy.
                </dd>
              </div>

              <div className="feature-card flex flex-col space-y-4 rounded-2xl border border-zinc-900 bg-zinc-900/10 p-6 transition-all hover:border-zinc-800">
                <dt className="flex items-center gap-x-3 text-base font-semibold text-white">
                  <Zap className="h-5 w-5 text-orange-500" />
                  Lightning Fast Flow
                </dt>
                <dd className="text-sm text-zinc-400 leading-relaxed">
                  Optimized React state management and queries keep operations fluid, allowing
                  instant page responses and minimal load latency.
                </dd>
              </div>

              <div className="feature-card flex flex-col space-y-4 rounded-2xl border border-zinc-900 bg-zinc-900/10 p-6 transition-all hover:border-zinc-800">
                <dt className="flex items-center gap-x-3 text-base font-semibold text-white">
                  <Shield className="h-5 w-5 text-orange-500" />
                  Enterprise Security
                </dt>
                <dd className="text-sm text-zinc-400 leading-relaxed">
                  Strict access control and boundary validations ensure that organization workflows,
                  workspace metrics, and user logs are kept safe.
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Workflow Section */}
        <section
          id="workflow"
          className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-28 border-t border-zinc-900 scroll-mt-10"
        >
          <div className="mx-auto max-w-2xl text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Streamlined 4-Step Workflow
            </h2>
            <p className="text-zinc-400">
              From organizational setup to real-time project audit, manage your complete lifecycle
              in one unified place.
            </p>
          </div>

          <div className="workflow-grid mx-auto mt-16 max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="workflow-card rounded-2xl border border-zinc-900 bg-zinc-900/20 p-8 transition-all hover:border-zinc-800 hover:bg-zinc-900/40">
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  <Building2 className="h-6 w-6" />
                </div>
                <span className="text-2xl font-bold text-zinc-700 hover:text-orange-500/60 transition-colors">
                  01
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Organization & Workspace Setup
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Establish your company structure, assign roles (RBAC), and partition departments or
                squads into distinct workspaces.
              </p>
            </div>

            <div className="workflow-card rounded-2xl border border-zinc-900 bg-zinc-900/20 p-8 transition-all hover:border-zinc-800 hover:bg-zinc-900/40">
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  <Kanban className="h-6 w-6" />
                </div>
                <span className="text-2xl font-bold text-zinc-700 hover:text-orange-500/60 transition-colors">
                  02
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Project & Kanban Planning</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Create projects, configure customized Kanban boards, define priorities, and tag work
                items with custom labels.
              </p>
            </div>

            <div className="workflow-card rounded-2xl border border-zinc-900 bg-zinc-900/20 p-8 transition-all hover:border-zinc-800 hover:bg-zinc-900/40">
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  <Clock className="h-6 w-6" />
                </div>
                <span className="text-2xl font-bold text-zinc-700 hover:text-orange-500/60 transition-colors">
                  03
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Execution & Time Tracking</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Collaborate seamlessly with comments & @mentions, attach deliverables, and record
                exact time entries per task.
              </p>
            </div>

            <div className="workflow-card rounded-2xl border border-zinc-900 bg-zinc-900/20 p-8 transition-all hover:border-zinc-800 hover:bg-zinc-900/40">
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  <FileCheck className="h-6 w-6" />
                </div>
                <span className="text-2xl font-bold text-zinc-700 hover:text-orange-500/60 transition-colors">
                  04
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Governance & Audit Compliance
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Monitor complete audit logs (`AuditLog`) for security compliance and track
                subscription usage across your enterprise.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-900">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 flex flex-col md:flex-row justify-between items-center gap-y-4">
            <div className="flex items-center gap-x-2">
              <div className="">
                <Image src={'/Flowlyx.webp'} alt="Flowlyx" width={70} height={26} priority />
              </div>
              <span className="text-xs text-zinc-500">
                © 2026 Flowlyx Inc. All rights reserved.
              </span>
            </div>
            <div className="flex gap-x-6 text-xs text-zinc-500">
              <a href="#" className="hover:text-zinc-300">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-zinc-300">
                Terms of Service
              </a>
              <a href="mailto:support@flowlyx.com" className="hover:text-zinc-300">
                Contact Support
              </a>
            </div>
          </div>
        </footer>
      </div>
    </SmoothScrollProvider>
  );
}
