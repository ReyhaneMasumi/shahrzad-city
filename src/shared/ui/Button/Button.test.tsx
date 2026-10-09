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

  it('applies antd type and size classes', () => {
    render(
      <Button type="primary" size="small">
        Action
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Action' });
    expect(button).toHaveClass('ant-btn-primary', 'ant-btn-sm');
  });

  it('renders an anchor when href is given', () => {
    render(<Button href="/wallet">Go</Button>);

    expect(screen.getByRole('link', { name: 'Go' })).toHaveAttribute('href', '/wallet');
  });

  it('blocks clicks while loading', () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Action
      </Button>
    );

    const button = screen.getByRole('button', { name: /Action/ });
    expect(button).toHaveClass('ant-btn-loading');

    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
