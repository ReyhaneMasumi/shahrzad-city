import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { fa } from '@/shared/i18n/fa';
import BottomNav from './BottomNav';

describe('BottomNav', () => {
  it('renders a nav landmark with label from fa', () => {
    render(<BottomNav />);
    expect(screen.getByRole('navigation', { name: fa.bottomNav.navLabel })).toBeInTheDocument();
  });

  it('renders wallet, services, and qr links with correct hrefs', () => {
    render(<BottomNav />);
    const walletLink = screen.getByRole('link', { name: fa.bottomNav.wallet });
    const servicesLink = screen.getByRole('link', { name: fa.bottomNav.services });
    const qrLink = screen.getByRole('link', { name: fa.bottomNav.qr });

    expect(walletLink).toHaveAttribute('href', '/wallet');
    expect(servicesLink).toHaveAttribute('href', '/shahrzad-services');
    expect(qrLink).toHaveAttribute('href', '/qr-payment');
  });

  it('qr button has accessible name and correct style class', () => {
    render(<BottomNav />);
    const qrLink = screen.getByRole('link', { name: fa.bottomNav.qr });
    expect(qrLink).toHaveClass('bg-[var(--color-primary-10)]');
  });
});
