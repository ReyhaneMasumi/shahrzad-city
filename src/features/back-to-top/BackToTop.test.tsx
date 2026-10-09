import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { fa } from '@/shared/i18n/fa';
import BackToTop from './BackToTop';

describe('BackToTop', () => {
  it('renders the button labelled from fa', () => {
    const onClick = vi.fn();
    render(<BackToTop onClick={onClick} />);
    expect(screen.getByRole('button', { name: fa.backToTop })).toBeInTheDocument();
  });

  it('fires onClick when clicked', () => {
    const onClick = vi.fn();
    render(<BackToTop onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: fa.backToTop }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
