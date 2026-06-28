import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChipInput } from './ChipInput';

// 시나리오 2.3 — ChipInput
describe('ChipInput', () => {
  it('should call onAddTag with the input text and clear the input when Enter is pressed', async () => {
    const user = userEvent.setup();
    const onAddTag = vi.fn();
    render(<ChipInput tags={[]} onAddTag={onAddTag} placeholder="태그 추가" />);
    const input = screen.getByPlaceholderText('태그 추가');

    await user.type(input, 'react{Enter}');

    expect(onAddTag).toHaveBeenCalledWith('react');
    expect(input).toHaveValue('');
  });

  it('should call onAddTag and clear the input when comma(,) is pressed', async () => {
    const user = userEvent.setup();
    const onAddTag = vi.fn();
    render(<ChipInput tags={[]} onAddTag={onAddTag} placeholder="태그 추가" />);
    const input = screen.getByPlaceholderText('태그 추가');

    await user.type(input, 'tdd,');

    expect(onAddTag).toHaveBeenCalled();
    expect(input).toHaveValue('');
  });

  it('should not include the comma character in the committed tag when comma is pressed', async () => {
    const user = userEvent.setup();
    const onAddTag = vi.fn();
    render(<ChipInput tags={[]} onAddTag={onAddTag} placeholder="태그 추가" />);
    const input = screen.getByPlaceholderText('태그 추가');

    await user.type(input, 'tdd,');

    expect(onAddTag).toHaveBeenCalledWith('tdd');
    expect(onAddTag).not.toHaveBeenCalledWith('tdd,');
  });

  it('should render the given tags as chips', () => {
    render(<ChipInput tags={['react', 'tdd']} onAddTag={vi.fn()} />);

    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('tdd')).toBeInTheDocument();
  });

  it('should not call onAddTag when the input is empty and Enter is pressed', async () => {
    const user = userEvent.setup();
    const onAddTag = vi.fn();
    render(<ChipInput tags={[]} onAddTag={onAddTag} placeholder="태그 추가" />);
    const input = screen.getByPlaceholderText('태그 추가');

    await user.type(input, '{Enter}');

    expect(onAddTag).not.toHaveBeenCalled();
  });
});
