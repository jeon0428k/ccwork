import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChipInput } from './ChipInput';

// 시나리오 2.3 — ChipInput
describe('ChipInput', () => {
  it('should call onAddTag with the input text and clear the input when Enter is pressed', async () => {
    const user = userEvent.setup();
    const onAddTag = vi.fn();
    render(
      <ChipInput tags={[]} onAddTag={onAddTag} onRemoveTag={vi.fn()} placeholder="태그 추가" />,
    );
    const input = screen.getByPlaceholderText('태그 추가');

    await user.type(input, 'react{Enter}');

    expect(onAddTag).toHaveBeenCalledWith('react');
    expect(input).toHaveValue('');
  });

  it('should call onAddTag and clear the input when comma(,) is pressed', async () => {
    const user = userEvent.setup();
    const onAddTag = vi.fn();
    render(
      <ChipInput tags={[]} onAddTag={onAddTag} onRemoveTag={vi.fn()} placeholder="태그 추가" />,
    );
    const input = screen.getByPlaceholderText('태그 추가');

    await user.type(input, 'tdd,');

    expect(onAddTag).toHaveBeenCalled();
    expect(input).toHaveValue('');
  });

  it('should not include the comma character in the committed tag when comma is pressed', async () => {
    const user = userEvent.setup();
    const onAddTag = vi.fn();
    render(
      <ChipInput tags={[]} onAddTag={onAddTag} onRemoveTag={vi.fn()} placeholder="태그 추가" />,
    );
    const input = screen.getByPlaceholderText('태그 추가');

    await user.type(input, 'tdd,');

    expect(onAddTag).toHaveBeenCalledWith('tdd');
    expect(onAddTag).not.toHaveBeenCalledWith('tdd,');
  });

  it('should render the given tags as chips', () => {
    render(<ChipInput tags={['react', 'tdd']} onAddTag={vi.fn()} onRemoveTag={vi.fn()} />);

    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('tdd')).toBeInTheDocument();
  });

  it('should not call onAddTag when the input is empty and Enter is pressed', async () => {
    const user = userEvent.setup();
    const onAddTag = vi.fn();
    render(
      <ChipInput tags={[]} onAddTag={onAddTag} onRemoveTag={vi.fn()} placeholder="태그 추가" />,
    );
    const input = screen.getByPlaceholderText('태그 추가');

    await user.type(input, '{Enter}');

    expect(onAddTag).not.toHaveBeenCalled();
  });
});

// 시나리오 2.3(TAG-2) — ChipInput (삭제 위임)
describe('ChipInput (삭제)', () => {
  it('should render each tag chip with a remove(×) button', () => {
    render(<ChipInput tags={['react', 'tdd']} onAddTag={vi.fn()} onRemoveTag={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'react 태그 삭제' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'tdd 태그 삭제' })).toBeInTheDocument();
  });

  it('should call onRemoveTag with the tag value when that chip × is clicked', async () => {
    const user = userEvent.setup();
    const onRemoveTag = vi.fn();
    render(<ChipInput tags={['react']} onAddTag={vi.fn()} onRemoveTag={onRemoveTag} />);

    await user.click(screen.getByRole('button', { name: 'react 태그 삭제' }));

    expect(onRemoveTag).toHaveBeenCalledWith('react');
  });

  it('should call onRemoveTag with the correct value when one of multiple chips × is clicked', async () => {
    const user = userEvent.setup();
    const onRemoveTag = vi.fn();
    render(
      <ChipInput tags={['React', 'TypeScript']} onAddTag={vi.fn()} onRemoveTag={onRemoveTag} />,
    );

    await user.click(screen.getByRole('button', { name: 'React 태그 삭제' }));

    expect(onRemoveTag).toHaveBeenCalledWith('React');
    expect(onRemoveTag).not.toHaveBeenCalledWith('TypeScript');
  });
});
