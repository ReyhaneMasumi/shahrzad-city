import NextImage from 'next/image';
import type { ImageProps } from './Image.types';

const DEFAULT_FILL_SIZES = '100vw';

/** Thin `next/image` wrapper that defaults `sizes` for `fill` images. */
export default function Image({ fill, sizes, ...props }: ImageProps) {
  return (
    <NextImage
      fill={fill}
      sizes={sizes ?? (fill === true ? DEFAULT_FILL_SIZES : undefined)}
      {...props}
    />
  );
}
