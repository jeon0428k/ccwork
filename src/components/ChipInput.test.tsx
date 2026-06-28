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
      <ChipInput
        tags={[]}
        onAddTag={onAddTag}
        onRemoveTag={vi.fn()}
        onRemoveLast={vi.fn()}
        placeholder="태그 추가"
      />,
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
      <ChipInput
        tags={[]}
        onAddTag={onAddTag}
        onRemoveTag={vi.fn()}
        onRemoveLast={vi.fn()}
        placeholder="태그 추가"
      />,
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
      <ChipInput
        tags={[]}
        onAddTag={onAddTag}
        onRemoveTag={vi.fn()}
        onRemoveLast={vi.fn()}
        placeholder="태그 추가"
      />,
    );
    const input = screen.getByPlaceholderText('태그 추가');

    await user.type(input, 'tdd,');

    expect(onAddTag).toHaveBeenCalledWith('tdd');
    expect(onAddTag).not.toHaveBeenCalledWith('tdd,');
  });

  it('should render the given tags as chips', () => {
    render(
      <ChipInput
        tags={['react', 'tdd']}
        onAddTag={vi.fn()}
        onRemoveTag={vi.fn()}
        onRemoveLast={vi.fn()}
      />,
    );

    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('tdd')).toBeInTheDocument();
  });

  it('should not call onAddTag when the input is empty and Enter is pressed', async () => {
    const user = userEvent.setup();
    const onAddTag = vi.fn();
    render(
      <ChipInput
        tags={[]}
        onAddTag={onAddTag}
        onRemoveTag={vi.fn()}
        onRemoveLast={vi.fn()}
        placeholder="태그 추가"
      />,
    );
    const input = screen.getByPlaceholderText('태그 추가');

    await user.type(input, '{Enter}');

    expect(onAddTag).not.toHaveBeenCalled();
  });
});

// 시나리오 2.3(TAG-2) — ChipInput (삭제 위임)
describe('ChipInput (삭제)', () => {
  it('should render each tag chip with a remove(×) button', () => {
    render(
      <ChipInput
        tags={['react', 'tdd']}
        onAddTag={vi.fn()}
        onRemoveTag={vi.fn()}
        onRemoveLast={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'react 태그 삭제' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'tdd 태그 삭제' })).toBeInTheDocument();
  });

  it('should call onRemoveTag with the tag value when that chip × is clicked', async () => {
    const user = userEvent.setup();
    const onRemoveTag = vi.fn();
    render(
      <ChipInput
        tags={['react']}
        onAddTag={vi.fn()}
        onRemoveTag={onRemoveTag}
        onRemoveLast={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'react 태그 삭제' }));

    expect(onRemoveTag).toHaveBeenCalledWith('react');
  });

  it('should call onRemoveTag with the correct value when one of multiple chips × is clicked', async () => {
    const user = userEvent.setup();
    const onRemoveTag = vi.fn();
    render(
      <ChipInput
        tags={['React', 'TypeScript']}
        onAddTag={vi.fn()}
        onRemoveTag={onRemoveTag}
        onRemoveLast={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'React 태그 삭제' }));

    expect(onRemoveTag).toHaveBeenCalledWith('React');
    expect(onRemoveTag).not.toHaveBeenCalledWith('TypeScript');
  });
});

// 시나리오 2.2(TAG-3) — ChipInput (Backspace 위임)
describe('ChipInput (Backspace)', () => {
  it('should call onRemoveLast when Backspace is pressed and the input is empty', async () => {
    const user = userEvent.setup();
    const onRemoveLast = vi.fn();
    render(
      <ChipInput
        tags={['React']}
        onAddTag={vi.fn()}
        onRemoveTag={vi.fn()}
        onRemoveLast={onRemoveLast}
        placeholder="태그 추가"
      />,
    );
    const input = screen.getByPlaceholderText('태그 추가');

    input.focus();
    await user.keyboard('{Backspace}');

    expect(onRemoveLast).toHaveBeenCalledTimes(1);
  });

  it('should not call onRemoveLast when Backspace is pressed and the input has text', async () => {
    const user = userEvent.setup();
    const onRemoveLast = vi.fn();
    render(
      <ChipInput
        tags={['React']}
        onAddTag={vi.fn()}
        onRemoveTag={vi.fn()}
        onRemoveLast={onRemoveLast}
        placeholder="태그 추가"
      />,
    );
    const input = screen.getByPlaceholderText('태그 추가');

    await user.type(input, 'Vu');
    await user.keyboard('{Backspace}');

    expect(onRemoveLast).not.toHaveBeenCalled();
    expect(input).toHaveValue('V');
  });

  it('should call onRemoveLast on empty-input Backspace even when there are no chips', async () => {
    const user = userEvent.setup();
    const onRemoveLast = vi.fn();
    render(
      <ChipInput
        tags={[]}
        onAddTag={vi.fn()}
        onRemoveTag={vi.fn()}
        onRemoveLast={onRemoveLast}
        placeholder="태그 추가"
      />,
    );
    const input = screen.getByPlaceholderText('태그 추가');

    input.focus();
    await user.keyboard('{Backspace}');

    expect(onRemoveLast).toHaveBeenCalledTimes(1);
  });
});

// 시나리오 2.2(TAG-5) — ChipInput 입력 길이 차단
describe('ChipInput (입력 길이 제한)', () => {
  it('should cap the text input at 15 characters via maxLength', () => {
    render(
      <ChipInput
        tags={[]}
        onAddTag={vi.fn()}
        onRemoveTag={vi.fn()}
        onRemoveLast={vi.fn()}
        placeholder="태그 추가"
      />,
    );
    const input = screen.getByPlaceholderText('태그 추가');

    expect(input).toHaveAttribute('maxlength', '15');
  });

  // 역할 분담 고정: 공백 판정은 훅(addTag)이 담당, ChipInput은 위임만 + 무조건 비움
  it('should delegate a whitespace-only value to onAddTag and clear the input on Enter', async () => {
    const user = userEvent.setup();
    const onAddTag = vi.fn();
    render(
      <ChipInput
        tags={[]}
        onAddTag={onAddTag}
        onRemoveTag={vi.fn()}
        onRemoveLast={vi.fn()}
        placeholder="태그 추가"
      />,
    );
    const input = screen.getByPlaceholderText('태그 추가');

    await user.type(input, '   {Enter}');

    expect(onAddTag).toHaveBeenCalledWith('   ');
    expect(input).toHaveValue('');
  });
});
