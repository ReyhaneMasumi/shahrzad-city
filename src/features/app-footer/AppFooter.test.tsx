import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { fa } from '@/shared/i18n/fa';
import AppFooter from './AppFooter';

describe('AppFooter', () => {
  it('renders a footer landmark', () => {
    render(<AppFooter revealed={false} />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders the five links with correct hrefs', () => {
    render(<AppFooter revealed={true} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(5);
    expect(links[0]).toHaveAttribute('href', '/about-shahrzad');
    expect(links[1]).toHaveAttribute('href', '/privacy');
    expect(links[2]).toHaveAttribute('href', 'https://shahrzadcity.ir/contact');
    expect(links[3]).toHaveAttribute('href', '/faq');
    expect(links[4]).toHaveAttribute('href', 'https://shahrzadcity.ir/download-app');
  });

  it('external links have target="_blank" and rel="noopener noreferrer"', () => {
    render(<AppFooter revealed={true} />);
    const externalLinks = screen.getAllByRole('link', {
      name: new RegExp(`${fa.footer.links[2].label}|${fa.footer.links[4].label}`),
    });
    externalLinks.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('data-revealed reflects the revealed prop', () => {
    const { rerender } = render(<AppFooter revealed={false} />);
    expect(screen.getByRole('contentinfo')).not.toHaveAttribute('data-revealed');

    rerender(<AppFooter revealed={true} />);
    expect(screen.getByRole('contentinfo')).toHaveAttribute('data-revealed', 'true');
  });
});
