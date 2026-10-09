import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { fa } from '@/shared/i18n/fa';
import SectionHead from './SectionHead';

describe('SectionHead', () => {
  it('renders an h2 heading with the title and no action', () => {
    render(<SectionHead title="City news" />);

    expect(screen.getByRole('heading', { level: 2, name: 'City news' })).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders an h3 when headingLevel is 3', () => {
    render(<SectionHead title="City news" headingLevel={3} />);

    expect(screen.getByRole('heading', { level: 3, name: 'City news' })).toBeInTheDocument();
  });

  it('renders a link with the see-all name and the given href', () => {
    render(<SectionHead title="City news" href="/news" />);

    const link = screen.getByRole('link', { name: fa.common.seeAll });
    expect(link).toHaveAttribute('href', '/news');
  });

  it('renders a button calling onAction when no href is given', () => {
    const onAction = vi.fn();
    render(<SectionHead title="City news" actionLabel="See archive" onAction={onAction} />);

    const button = screen.getByRole('button', { name: 'See archive' });
    fireEvent.click(button);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('prefers the link over the button when both are given', () => {
    render(<SectionHead title="City news" href="/news" onAction={vi.fn()} />);

    expect(screen.getByRole('link', { name: fa.common.seeAll })).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
