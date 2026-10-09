'use client';

import { StyleProvider, extractStyle } from '@ant-design/cssinjs';
import CacheEntity from '@ant-design/cssinjs/es/Cache';
import { useServerInsertedHTML } from 'next/navigation';
import { useState } from 'react';
import type { PropsWithChildren } from 'react';

// Deterministic SSR cache id: unlike Ant Design's stock registry (which seeds
// `createCache()` with `Math.random()`), a stable id keeps prerendered style
// attributes reproducible across builds.
const SSR_CACHE_ID = 'shahrzad-ssr';

function createCache() {
  return new CacheEntity(SSR_CACHE_ID);
}

export default function AntdRegistry({ children }: PropsWithChildren) {
  const [cache] = useState(createCache);
  useServerInsertedHTML(() => {
    const styleText = extractStyle(cache, { plain: true, once: true });
    if (styleText.includes('.data-ant-cssinjs-cache-path{content:"";}')) {
      return null;
    }
    return (
      <style
        id="antd-cssinjs"
        data-rc-order="prepend"
        data-rc-priority="-1000"
        dangerouslySetInnerHTML={{ __html: styleText }}
      />
    );
  });
  return <StyleProvider cache={cache}>{children}</StyleProvider>;
}
