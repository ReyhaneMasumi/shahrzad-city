import { createSerwistRoute } from '@serwist/turbopack';
import type { NextRequest } from 'next/server';

const serwistRoute = createSerwistRoute({
  swSrc: 'src/app/sw.ts',
});

export const dynamic = 'force-static';
export const dynamicParams = false;
export const revalidate = false;

export async function generateStaticParams() {
  const params = await serwistRoute.generateStaticParams();
  return params.map(({ path }) => ({ path: [path] }));
}

// createSerwistRoute expects a string path, but App Router catch-all params are string[].
export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return serwistRoute.GET(request, { params: Promise.resolve({ path: path.join('/') }) });
}
