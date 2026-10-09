import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { fa } from '@/shared/i18n/fa';
import SectionStates from './SectionStates';
import type { SectionStatesProps } from './SectionStates.types';

type Status = SectionStatesProps['status'];

function findStateRoot(status: Status): HTMLElement {
  const root = screen
    .getAllByRole('generic')
    .find((element) => element.getAttribute('data-state') === status);
  if (root === undefined) throw new Error(`Missing wrapper with data-state="${status}"`);
  return root;
}

describe('SectionStates', () => {
  it('reflects the status on the wrapper', () => {
    const { rerender } = render(
      <SectionStates status="loading">
        <span>content</span>
      </SectionStates>
    );
    expect(findStateRoot('loading')).toBeInTheDocument();

    rerender(
      <SectionStates status="error">
        <span>content</span>
      </SectionStates>
    );
    expect(findStateRoot('error')).toBeInTheDocument();

    rerender(
      <SectionStates status="empty">
        <span>content</span>
      </SectionStates>
    );
    expect(findStateRoot('empty')).toBeInTheDocument();

    rerender(
      <SectionStates status="success">
        <span>content</span>
      </SectionStates>
    );
    expect(findStateRoot('success')).toBeInTheDocument();
  });

  it('renders the provided skeleton while loading', () => {
    render(
      <SectionStates status="loading" skeleton={<div data-testid="custom-skeleton" />}>
        <span>content</span>
      </SectionStates>
    );

    expect(screen.getByTestId('custom-skeleton')).toBeInTheDocument();
    expect(screen.queryByText('content')).not.toBeInTheDocument();
  });

  it('falls back to an antd Skeleton when no skeleton is provided', () => {
    render(
      <SectionStates status="loading">
        <span>content</span>
      </SectionStates>
    );

    const skeletons = within(findStateRoot('loading')).getAllByRole('generic', { hidden: true });
    expect(skeletons.some((element) => element.className.includes('ant-skeleton'))).toBe(true);
  });

  it('renders ErrorState with a retry action only when onRetry is given', () => {
    const { rerender } = render(
      <SectionStates status="error" onRetry={() => {}}>
        <span>content</span>
      </SectionStates>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: fa.error.retry })).toBeInTheDocument();

    rerender(
      <SectionStates status="error">
        <span>content</span>
      </SectionStates>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: fa.error.retry })).not.toBeInTheDocument();
  });

  it('renders Empty with the default message and the given empty message', () => {
    const { rerender } = render(
      <SectionStates status="empty">
        <span>content</span>
      </SectionStates>
    );

    expect(screen.getByRole('status')).toHaveTextContent(fa.empty.message);

    rerender(
      <SectionStates status="empty" emptyMessage="Nothing scheduled">
        <span>content</span>
      </SectionStates>
    );

    expect(screen.getByRole('status')).toHaveTextContent('Nothing scheduled');
    expect(screen.queryByText('content')).not.toBeInTheDocument();
  });

  it('renders children on success', () => {
    render(
      <SectionStates status="success">
        <span>content</span>
      </SectionStates>
    );

    expect(screen.getByText('content')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
