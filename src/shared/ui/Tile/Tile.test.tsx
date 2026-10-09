import { render, screen } from '@testing-library/react';
import { User } from 'iconsax-react';
import { describe, expect, it } from 'vitest';
import Tile from './Tile';

describe('Tile', () => {
  it('opens external links in a new tab with noopener', () => {
    render(<Tile title="Taxi" icon={User} href="https://example.com" external />);

    const link = screen.getByRole('link', { name: /Taxi/ });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders an internal href through next/link', () => {
    render(<Tile title="Wallet" icon={User} href="/wallet" />);

    expect(screen.getByRole('link', { name: /Wallet/ })).toHaveAttribute('href', '/wallet');
  });

  it('renders a button when no href is given', () => {
    render(<Tile title="Wallet" icon={User} />);

    expect(screen.getByRole('button', { name: /Wallet/ })).toBeInTheDocument();
  });
});
