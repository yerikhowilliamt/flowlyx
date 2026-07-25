# ERR-060: Frontend Production Readiness Issues

## Symptoms

1. Authenticated users redirected to wrong API port (`:3001` instead of `:4000`), all API calls fail silently on fresh environments.
2. Unauthenticated users can access `/organizations`, `/workspaces`, `/admin`, `/profile` directly via URL — no server-side redirect.
3. Unhandled React render errors crash entire page to blank screen in production (no error boundary).
4. Missing route-level loading UI causes layout shift / blank flash during navigation.
5. `console.error` in `api-client.ts` violates handbook logging rules.
6. Wrong primary font applied — `Geist` used as `--font-sans` instead of `Plus Jakarta Sans`.
7. `/* eslint-disable */` silenced all rules on `organizations/[slug]/page.tsx`.
8. `admin/page.tsx` had stray `'use me';` string directive and raw `useEffect` for data fetching.
9. No security headers (X-Frame-Options, HSTS, etc.) configured in Next.js.

## Root Cause

- Default API URL fallback in `api-client.ts:1` was hardcoded to wrong port (`3001`).
- No `middleware.ts` existed; Next.js App Router has no built-in auth gate.
- No `error.tsx` / `global-error.tsx` / `not-found.tsx` files created for any route.
- No `loading.tsx` at any route level.
- Root `layout.tsx` loaded `Geist` as primary `--font-sans` variable; Plus Jakarta Sans was loaded but assigned to an unused `--font-plus-jakarta` variable.
- `next.config.ts` had no `headers()` configuration.
- Code quality issues accumulated across multiple phases without a dedicated cleanup phase.

## Investigation

Discovered during Phase 60 production readiness audit via static code analysis of:

- `apps/web/src/lib/api-client.ts` (port mismatch)
- `apps/web/src/app/` (missing error/loading/not-found files, no middleware)
- `apps/web/src/app/layout.tsx` (font mismatch)
- `apps/web/next.config.ts` (no security headers)
- ESLint output (console usage, setState-in-effect, img element)

## Solution

| File                                                          | Fix                                                                                 |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `src/lib/api-client.ts`                                       | Changed fallback URL from `:3001` to `:4000`; removed `console.error`               |
| `src/middleware.ts`                                           | Created: redirects unauthenticated users, redirects auth users away from login      |
| `src/app/not-found.tsx`                                       | Created: branded 404 page                                                           |
| `src/app/error.tsx`                                           | Created: root error boundary with retry                                             |
| `src/app/global-error.tsx`                                    | Created: catastrophic error boundary                                                |
| `src/app/admin/error.tsx`                                     | Created: admin-scoped error boundary                                                |
| `src/app/loading.tsx` + 5 others                              | Created: spinner loading states for all route segments                              |
| `src/app/layout.tsx`                                          | Plus Jakarta Sans as primary font; added viewport + OG metadata                     |
| `next.config.ts`                                              | Added security headers + Cloudinary/Google remotePatterns                           |
| `src/app/admin/page.tsx`                                      | Removed `'use me'` directive; replaced `useEffect` with `useQuery`                  |
| `src/app/organizations/[slug]/page.tsx`                       | Removed `/* eslint-disable */`; replaced `useEffect+setState` with render-time sync |
| `src/features/projects/components/project-members-dialog.tsx` | Replaced `<img>` with `next/image`                                                  |
| `src/providers/query-provider.tsx`                            | Added global `onError` mutation handler                                             |
| `src/lib/env.ts`                                              | Created: runtime validation of required env vars                                    |

## Trade-offs

- Middleware auth check uses presence of `Refresh` cookie (httpOnly). This is a coarse check — a user with an expired refresh token will pass middleware but fail on first API call. Full token validation in middleware requires calling the backend on every request (performance cost). Accept the trade-off; React Query will handle 401 and clear state.
- `organizations/[slug]/page.tsx` form sync uses render-time conditional setState instead of `useEffect`. This is valid React (avoids extra render cycle) but requires careful ordering before any early returns.

## Prevention

- Add `middleware.ts` as standard scaffold in any new Next.js frontend phase.
- Include error/loading/not-found files in the frontend foundation phase checklist.
- Run `npm run lint` as part of every phase — do not suppress with `eslint-disable` on entire files.
- Review `next.config.ts` for security headers during every major frontend milestone.

## References

- [Next.js Middleware Docs](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
