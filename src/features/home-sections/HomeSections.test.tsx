import { render, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse, delay } from 'msw';
import { describe, expect, it, afterEach } from 'vitest';
import { server } from '@/mocks/server';
import { SWRConfig } from 'swr';
import { fa } from '@/shared/i18n/fa';
import HomeSections from './HomeSections';

const mockTile = {
  id: 20,
  categoryId: 1,
  tag: null,
  order: 110,
  title: 'tile-title-1',
  type: 'shahrzad_pwa',
  url: 'https://web.shahrzadcity.ir/marketplace/2/grocery',
  icon: 'https://static.shahrzadcity.ir/base/app_icon/zf7YT1txdp.webp',
  storeType: null,
  hasHeader: false,
  hasNotification: false,
  authMethod: 'none',
  words: ['word1'],
  cacheStrategy: 'navigate',
  walletType: ['newborn-gifts', 'shahrzad'],
  child: [],
};

function serveTiles(data: (typeof mockTile)[], responseDelayMs = 0) {
  server.use(
    http.get('*/main-page/apps-nested', async () => {
      if (responseDelayMs > 0) await delay(responseDelayMs);
      return HttpResponse.json({
        statusCode: 200,
        message: 'OK',
        data: {
          navBar: [],
          services: [{ title: 'Test Section', tiles: data }],
          main: data,
          wallet: [],
        },
      });
    })
  );
}

function failTiles() {
  server.use(
    http.get('*/main-page/apps-nested', () =>
      HttpResponse.json({ statusCode: 500, message: 'boom', data: null }, { status: 500 })
    )
  );
}

afterEach(() => {
  server.resetHandlers();
});

describe('HomeSections', () => {
  it('renders SectionHead with title and see-all link', async () => {
    serveTiles([mockTile]);
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <HomeSections />
      </SWRConfig>
    );
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: fa.header.services.label })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: fa.common.seeAll })).toHaveAttribute(
        'href',
        fa.header.services.href
      );
    });
  });

  it('renders grid of tiles with correct hrefs and images', async () => {
    const secondTile = {
      ...mockTile,
      id: 400,
      title: 'tile-title-2',
      url: '/app/fix-price',
      icon: 'https://example.com/icon2.webp',
    };
    serveTiles([mockTile, secondTile]);
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <HomeSections />
      </SWRConfig>
    );
    await waitFor(() => {
      expect(screen.getByRole('link', { name: mockTile.title })).toHaveAttribute(
        'href',
        mockTile.url
      );
      expect(screen.getByAltText(mockTile.title)).toHaveAttribute(
        'src',
        expect.stringContaining('static.shahrzadcity.ir')
      );
      expect(screen.getByRole('link', { name: secondTile.title })).toHaveAttribute(
        'href',
        secondTile.url
      );
    });
  });

  it('shows a 4x4 skeleton grid while loading', async () => {
    serveTiles([mockTile], 50);
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <HomeSections />
      </SWRConfig>
    );
    await waitFor(() => {
      const list = screen.getByRole('list', { name: fa.header.services.label });
      expect(within(list).getAllByRole('generic', { hidden: true }).length).toBeGreaterThanOrEqual(
        16
      );
    });
  });

  it('shows ErrorState with retry on error', async () => {
    failTiles();
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <HomeSections />
      </SWRConfig>
    );
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: fa.error.retry })).toBeInTheDocument();
    });
  });

  it('shows Empty state when no tiles', async () => {
    serveTiles([]);
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <HomeSections />
      </SWRConfig>
    );
    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText(fa.empty.message)).toBeInTheDocument();
    });
  });
});
