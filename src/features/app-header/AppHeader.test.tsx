import { render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { createMatchMedia } from '../../../tests/mocks/match-media';
import { fa } from '@/shared/i18n/fa';
import AppHeader from './AppHeader';

afterEach(() => {
  window.matchMedia = createMatchMedia(false);
});

describe('AppHeader', () => {
  it('renders the mobile header below the desktop breakpoint', () => {
    window.matchMedia = createMatchMedia(false);
    render(<AppHeader scrolled={false} />);

    expect(screen.getByAltText(fa.header.logoAlt)).toBeInTheDocument();
    expect(screen.getByText(fa.header.wallet.title)).toBeInTheDocument();
    expect(screen.getByText(fa.header.wallet.viewBalance)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: fa.header.profile.label })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: fa.header.navLabel })).not.toBeInTheDocument();
  });

  it('flags itself as scrolled for the mobile shrink animation', () => {
    window.matchMedia = createMatchMedia(false);
    render(<AppHeader scrolled />);

    expect(screen.getByRole('banner')).toHaveAttribute('data-scrolled', 'true');
  });

  it('renders the desktop navigation at or above the desktop breakpoint', () => {
    window.matchMedia = createMatchMedia(true);
    render(<AppHeader scrolled={false} />);

    const nav = screen.getByRole('navigation', { name: fa.header.navLabel });
    expect(within(nav).getByRole('link', { name: fa.header.services.label })).toHaveAttribute(
      'href',
      fa.header.services.href
    );
    expect(within(nav).getByRole('link', { name: fa.header.faq.label })).toHaveAttribute(
      'href',
      fa.header.faq.href
    );
    expect(within(nav).getByRole('link', { name: fa.header.about.label })).toHaveAttribute(
      'href',
      fa.header.about.href
    );
  });
});
