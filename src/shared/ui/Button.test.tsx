import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Button from './Button';

describe('Button', () => {
  it('renders a native button that fires onClick', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Action</Button>);

    const button = screen.getByRole('button', { name: 'Action' });
    expect(button).toHaveAttribute('type', 'button');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('exposes variant and size through data attributes', () => {
    render(
      <Button variant="ghost" size="lg">
        Action
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Action' });
    expect(button).toHaveAttribute('data-variant', 'ghost');
    expect(button).toHaveAttribute('data-size', 'lg');
    expect(button).toHaveAttribute('data-state', 'idle');
  });

  it('disables the button and sets aria-busy while loading', () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Action
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Action' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('data-state', 'loading');

    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
