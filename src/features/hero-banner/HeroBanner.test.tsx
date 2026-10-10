import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, afterEach } from 'vitest';
import { server } from '@/mocks/server';
import { SWRConfig } from 'swr';
import { fa } from '@/shared/i18n/fa';
import HeroBanner from './HeroBanner';

const mockBanner = {
  id: 49,
  name: 'banner-name',
  order: 3,
  image: 'https://static.shahrzadcity.ir/base/banner/B1LyrIbcRf.jpg',
  url: 'https://web.shahrzadcity.ir/app/vehicle/traffic-plan',
  bannerType: 'main_page',
  pageChoice: 'shahrzad_pwa',
  position: 'top',
  target: 'pwa',
  linkedTile: null,
  authMethod: 'refresh',
};

function serveBanners(data: (typeof mockBanner)[]) {
  server.use(
    http.get('*/banners', () => HttpResponse.json({ statusCode: 200, message: 'OK', data }))
  );
}

function failBanners() {
  server.use(
    http.get('*/banners', () =>
      HttpResponse.json({ statusCode: 500, message: 'boom', data: null }, { status: 500 })
    )
  );
}

afterEach(() => {
  server.resetHandlers();
});

describe('HeroBanner', () => {
  it('shows skeleton while loading', async () => {
    serveBanners([mockBanner]);
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <HeroBanner />
      </SWRConfig>
    );
    await waitFor(() => {
      const skeletons = screen.getAllByRole('generic', { hidden: true });
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  it('renders static image with priority when single banner', async () => {
    serveBanners([mockBanner]);
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <HeroBanner />
      </SWRConfig>
    );
    await waitFor(() => {
      expect(screen.getByAltText(mockBanner.name)).toBeInTheDocument();
    });
  });

  it('renders Carousel when multiple banners', async () => {
    serveBanners([
      mockBanner,
      {
        ...mockBanner,
        id: 50,
        name: 'Banner 2',
        image: 'https://example.com/banner2.jpg',
        url: '/banner2',
      },
    ]);
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <HeroBanner />
      </SWRConfig>
    );
    await waitFor(() => {
      expect(screen.getByRole('group', { name: fa.heroBanner.ariaLabel })).toBeInTheDocument();
    });
  });

  it('shows ErrorState with retry on error', async () => {
    failBanners();
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <HeroBanner />
      </SWRConfig>
    );
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: fa.error.retry })).toBeInTheDocument();
    });
  });

  it('shows Empty state when no banners', async () => {
    serveBanners([]);
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <HeroBanner />
      </SWRConfig>
    );
    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText(fa.empty.heroBanner)).toBeInTheDocument();
    });
  });
});
