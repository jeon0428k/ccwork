import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTagInput } from './useTagInput';

// 시나리오 2.1 — addTag
describe('useTagInput.addTag', () => {
  it('should append the tag to tags when given a non-empty string', () => {
    const { result } = renderHook(() => useTagInput([]));

    act(() => result.current.addTag('react'));

    expect(result.current.tags).toEqual(['react']);
  });

  it('should keep insertion order when adding multiple tags', () => {
    const { result } = renderHook(() => useTagInput([]));

    act(() => result.current.addTag('a'));
    act(() => result.current.addTag('b'));
    act(() => result.current.addTag('c'));

    expect(result.current.tags).toEqual(['a', 'b', 'c']);
  });

  it('should not add an empty chip when raw is "" (최소 가드)', () => {
    const { result } = renderHook(() => useTagInput([]));

    act(() => result.current.addTag(''));

    expect(result.current.tags).toEqual([]);
  });
});

// 시나리오 2.2 — 초기화 · reset
describe('useTagInput (초기화/reset)', () => {
  it('should initialize tags from initialTags when mounted', () => {
    const { result } = renderHook(() => useTagInput(['x', 'y']));

    expect(result.current.tags).toEqual(['x', 'y']);
  });

  it('should initialize to [] when a legacy note has no tags field (note.tags ?? [])', () => {
    // 레거시 노트: NoteEditor가 (note.tags ?? [])로 정규화해 빈 배열을 넘긴다.
    const { result } = renderHook(() => useTagInput([]));

    expect(result.current.tags).toEqual([]);
  });

  it('should replace current tags with the provided array when the selected note changes', () => {
    const { result } = renderHook(() => useTagInput(['old']));

    act(() => result.current.reset(['new1', 'new2']));

    expect(result.current.tags).toEqual(['new1', 'new2']);
  });
});

// 시나리오 2.1(TAG-2) — removeTag
describe('useTagInput.removeTag', () => {
  it('should remove the matching tag from tags when called with an existing value', () => {
    const { result } = renderHook(() => useTagInput(['react']));

    act(() => result.current.removeTag('react'));

    expect(result.current.tags).toEqual([]);
  });

  it('should keep the remaining tags and their order when removing one', () => {
    const { result } = renderHook(() => useTagInput(['React', 'TypeScript']));

    act(() => result.current.removeTag('React'));

    expect(result.current.tags).toEqual(['TypeScript']);
  });

  it('should be a no-op when called with a tag that is not present', () => {
    const { result } = renderHook(() => useTagInput(['React', 'TypeScript']));

    act(() => result.current.removeTag('Vue'));

    expect(result.current.tags).toEqual(['React', 'TypeScript']);
  });

  it('should result in [] when removing the only remaining tag', () => {
    const { result } = renderHook(() => useTagInput(['solo']));

    act(() => result.current.removeTag('solo'));

    expect(result.current.tags).toEqual([]);
  });
});

// 시나리오 2.1(TAG-3) — removeLast
describe('useTagInput.removeLast', () => {
  it('should remove the last tag from tags when there is at least one tag', () => {
    const { result } = renderHook(() => useTagInput(['React', 'TypeScript']));

    act(() => result.current.removeLast());

    expect(result.current.tags).toEqual(['React']);
  });

  it('should be a no-op when tags is empty', () => {
    const { result } = renderHook(() => useTagInput([]));

    act(() => result.current.removeLast());

    expect(result.current.tags).toEqual([]);
  });

  it('should result in [] when removing the only remaining tag', () => {
    const { result } = renderHook(() => useTagInput(['solo']));

    act(() => result.current.removeLast());

    expect(result.current.tags).toEqual([]);
  });
});
