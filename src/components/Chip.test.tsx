import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Chip } from './Chip';

// 시나리오 2.2(TAG-2) — Chip (× 버튼 · hover 노출)
describe('Chip', () => {
  it('should render a remove(×) button with aria-label "{label} 태그 삭제" when onRemove is provided', () => {
    render(<Chip label="React" onRemove={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'React 태그 삭제' })).toBeInTheDocument();
  });

  it('should not render any remove button when onRemove is omitted', () => {
    render(<Chip label="React" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should call onRemove exactly once when the × button is clicked', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<Chip label="React" onRemove={onRemove} />);

    await user.click(screen.getByRole('button', { name: 'React 태그 삭제' }));

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('should apply hover-reveal classes (hidden by default, shown on hover) to the × button', () => {
    render(<Chip label="React" onRemove={vi.fn()} />);

    const button = screen.getByRole('button', { name: 'React 태그 삭제' });
    expect(button.className).toContain('opacity-0');
    expect(button.className).toContain('group-hover:opacity-100');
  });
});
