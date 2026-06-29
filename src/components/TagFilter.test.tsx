import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagFilter } from './TagFilter';

// issue-20 §2 — TagFilter
describe('TagFilter', () => {
  it('should render a chip for each tag when allTags is non-empty', () => {
    render(<TagFilter allTags={['work', 'idea']} activeTags={[]} onToggle={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'work' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'idea' })).toBeInTheDocument();
  });

  it('should render the provided deduped tags as-is when allTags=["work","idea"]', () => {
    render(<TagFilter allTags={['work', 'idea']} activeTags={[]} onToggle={vi.fn()} />);

    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('should render nothing (null) when allTags is empty', () => {
    const { container } = render(<TagFilter allTags={[]} activeTags={[]} onToggle={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('should mark an active tag with aria-pressed=true', () => {
    render(<TagFilter allTags={['work', 'idea']} activeTags={['work']} onToggle={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'work' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('should mark an inactive tag with aria-pressed=false', () => {
    render(<TagFilter allTags={['work', 'idea']} activeTags={['work']} onToggle={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'idea' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('should call onToggle with the tag when a chip is clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<TagFilter allTags={['work']} activeTags={[]} onToggle={onToggle} />);

    await user.click(screen.getByRole('button', { name: 'work' }));

    expect(onToggle).toHaveBeenCalledWith('work');
  });
});
