import { render, screen } from '@testing-library/react';
import { EmojiHappy } from 'iconsax-react';
import { describe, expect, it } from 'vitest';
import Icon from './Icon';
import type { IconsaxIconProps } from './Icon.types';

function StubIcon(props: IconsaxIconProps) {
  return <svg data-testid="stub-icon" {...props} />;
}

describe('Icon', () => {
  it('is decorative by default', () => {
    render(<Icon icon={StubIcon} />);

    const svg = screen.getByTestId('stub-icon');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
    expect(svg).not.toHaveAttribute('role');
  });

  it('is labelled with role="img" when a label is provided', () => {
    render(<Icon icon={StubIcon} label="decorative label" />);

    const img = screen.getByRole('img', { name: 'decorative label' });
    expect(img).not.toHaveAttribute('aria-hidden');
    expect(img).toHaveAttribute('focusable', 'false');
  });

  it('forwards size, variant and color to the icon', () => {
    render(<Icon icon={StubIcon} size={32} variant="Bold" color="#123456" />);

    const svg = screen.getByTestId('stub-icon');
    expect(svg).toHaveAttribute('size', '32');
    expect(svg).toHaveAttribute('variant', 'Bold');
    expect(svg).toHaveAttribute('color', '#123456');
  });

  it('works with a real iconsax icon', () => {
    render(<Icon icon={EmojiHappy} label="happy face" />);

    expect(screen.getByRole('img', { name: 'happy face' })).toBeInTheDocument();
  });
});
