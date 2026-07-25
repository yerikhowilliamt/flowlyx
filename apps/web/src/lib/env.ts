/* ponytail: build-time env validation skipped — NEXT_PUBLIC_* vars are inlined at build, not runtime. Add t3-env when a CI env-check step is needed. */
export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'https://flowlyx.com',
} as const;
