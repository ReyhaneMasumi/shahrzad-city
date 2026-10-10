# PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Progressive Web App (PWA) support to the Shahrzad homepage using `@serwist/turbopack` which is compatible with Next.js 16 and Turbopack.

**Architecture:** Use Serwist's Turbopack integration which provides a Next.js plugin (`@serwist/turbopack`) that generates a service worker at build time using esbuild. The service worker will precache static assets and provide runtime caching for API responses and navigation requests. The `SerwistProvider` will register the service worker on the client.

**Tech Stack:** Next.js 16, React 19, TypeScript, Turbopack, @serwist/turbopack, serwist

**Spec:** Based on the Serwist next-turbo-basic example and Next.js 16 PWA documentation.

## Global Constraints

- Must use `@serwist/turbopack` (not `@serwist/next`) for Turbopack compatibility
- Must work with `next dev --turbopack` and `next build --turbopack`
- Persian (fa) RTL site - manifest must reflect this
- Icons must be placed in `public/icons/`
- Service worker registration via `SerwistProvider` in root layout
- No secrets in Docker image
- Output must be `standalone` for Docker

## Review Focus

1. **Service worker not registering** - Verify `SerwistProvider` wraps the app and `swUrl` matches the generated service worker path
2. **Manifest not loading** - Verify `manifest.ts` returns valid MetadataRoute.Manifest and icons exist at specified paths
3. **Icons missing** - Verify 192x192 and 512x512 PNG icons exist in `public/icons/`
4. **Caching not working** - Verify service worker precaches static assets and runtime caching is configured
5. **Turbopack build failures** - Verify `@serwist/turbopack` plugin integrates correctly with Turbopack

---

### Task 1: Install @serwist/turbopack and serwist dependencies

**Files:**
- Modify: `package.json`

**Interfaces:**
- Produces: `@serwist/turbopack` and `serwist` available in dependencies

- [ ] **Step 1: Add dependencies to package.json**

```bash
pnpm add @serwist/turbopack@latest serwist@preview
```

- [ ] **Step 2: Verify installation**

```bash
pnpm install
```
Expected: Dependencies added without errors

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat(pwa): add @serwist/turbopack and serwist dependencies"
```

---

### Task 2: Update next.config.ts with withSerwist

**Files:**
- Modify: `next.config.ts`

**Interfaces:**
- Consumes: `@serwist/turbopack` from Task 1
- Produces: Next config wrapped with `withSerwist`

- [ ] **Step 1: Write the failing test** (verify config compiles)

```bash
pnpm typecheck
```
Expected: TypeScript compiles without errors after modification

- [ ] **Step 2: Modify next.config.ts**

```typescript
import type { NextConfig } from 'next';
import { withSerwist } from '@serwist/turbopack';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'web.shahrzadcity.ir' },
      { protocol: 'https', hostname: 'static.shahrzadcity.ir' },
    ],
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default withSerwist(nextConfig);
```

- [ ] **Step 3: Verify config compiles**

```bash
pnpm typecheck
```
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add next.config.ts
git commit -m "feat(pwa): wrap next config with withSerwist for Turbopack"
```

---

### Task 3: Create service worker file (app/sw.ts)

**Files:**
- Create: `src/app/sw.ts`

**Interfaces:**
- Consumes: `serwist`, `@serwist/turbopack/worker`
- Produces: Service worker that precaches assets and handles runtime caching

- [ ] **Step 1: Create src/app/sw.ts**

```typescript
import { defaultCache } from '@serwist/turbopack/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: '/~offline',
        matcher({ request }) {
          return request.destination === 'document';
        },
      },
    ],
  },
});

serwist.addEventListeners();
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm typecheck
```
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/app/sw.ts
git commit -m "feat(pwa): add service worker with Serwist for Turbopack"
```

---

### Task 4: Add SerwistProvider to layout.tsx

**Files:**
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `SerwistProvider` from `@serwist/turbopack/react`
- Produces: Service worker registration on client

- [ ] **Step 1: Modify layout.tsx to add SerwistProvider**

```typescript
// Add import
import { SerwistProvider } from '@serwist/turbopack/react';

// In the body, wrap Providers with SerwistProvider
<SerwistProvider swUrl="/serwist/sw.js">
  <AntdRegistry>
    <Providers>
      <AppShell>{children}</AppShell>
    </Providers>
  </AntdRegistry>
</SerwistProvider>
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm typecheck
```
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat(pwa): add SerwistProvider to register service worker"
```

---

### Task 5: Verify manifest.ts has proper PWA configuration

**Files:**
- Modify: `src/app/manifest.ts` (if needed)

**Interfaces:**
- Consumes: `fa` from `@/shared/i18n/fa`
- Produces: Valid MetadataRoute.Manifest with Persian locale

- [ ] **Step 1: Review current manifest.ts**

Current manifest has:
- name, short_name from `fa.app.name`
- start_url: `/home` (should be `/` or `/home` based on routing)
- display: `standalone`
- icons pointing to `/icons/icon-192.png` and `/icons/icon-512.png`

- [ ] **Step 2: Verify manifest returns correct values for Persian RTL**

```typescript
// Ensure these are set:
lang: 'fa',
dir: 'rtl',
// Icons exist at specified paths
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
pnpm typecheck
```
Expected: PASS

- [ ] **Step 4: Commit** (if changes needed)

```bash
git add src/app/manifest.ts
git commit -m "feat(pwa): verify/update manifest for Persian RTL PWA"
```

---

### Task 6: Generate/create PWA icons (192x192, 512x512)

**Files:**
- Create: `public/icons/icon-192.png`
- Create: `public/icons/icon-512.png`

**Interfaces:**
- Consumes: Brand logo from `public/brand/logo.svg`
- Produces: Maskable PNG icons at required sizes

- [ ] **Step 1: Generate icons from logo.svg**

```bash
# Using ImageMagick or similar
# If ImageMagick not available, use online tool or create placeholder
magick public/brand/logo.svg -resize 192x192 public/icons/icon-192.png
magick public/brand/logo.svg -resize 512x512 public/icons/icon-512.png
```

- [ ] **Step 2: Verify icons exist**

```bash
ls -la public/icons/
```
Expected: icon-192.png and icon-512.png present

- [ ] **Step 3: Commit**

```bash
git add public/icons/icon-192.png public/icons/icon-512.png
git commit -m "feat(pwa): add PWA icons (192x192, 512x512)"
```

---

### Task 7: Test PWA functionality with build

**Files:**
- No new files

**Interfaces:**
- Consumes: All previous tasks
- Produces: Working PWA build

- [ ] **Step 1: Build with Turbopack**

```bash
pnpm build
```
Expected: Build succeeds, service worker generated at `.next/standalone/serwist/sw.js` or similar

- [ ] **Step 2: Start production server**

```bash
pnpm start
```
Expected: Server starts, PWA features available at http://localhost:3000

- [ ] **Step 3: Verify service worker registration**

Open browser DevTools > Application > Service Workers
Expected: Service worker registered and active

- [ ] **Step 4: Verify manifest**

Open browser DevTools > Application > Manifest
Expected: Manifest loads with correct name, icons, display mode

- [ ] **Step 5: Commit** (if any adjustments needed)

---

### Task 8: Run verification (lint, typecheck, test, build)

**Files:**
- No new files

**Interfaces:**
- Consumes: All previous tasks
- Produces: Verified working PWA

- [ ] **Step 1: Run lint**

```bash
pnpm lint
```
Expected: PASS

- [ ] **Step 2: Run typecheck**

```bash
pnpm typecheck
```
Expected: PASS

- [ ] **Step 3: Run tests**

```bash
pnpm test
```
Expected: PASS

- [ ] **Step 4: Run build**

```bash
pnpm build
```
Expected: PASS

- [ ] **Step 5: Commit final changes**

```bash
git add -A
git commit -m "feat(pwa): complete PWA implementation with @serwist/turbopack"
```