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

// 시나리오 2.1(TAG-4) — addTag 대소문자 무시 중복 게이트
describe('useTagInput.addTag (중복 방지)', () => {
  it('should not add a duplicate tag with identical casing', () => {
    const { result } = renderHook(() => useTagInput(['React']));

    act(() => result.current.addTag('React'));

    expect(result.current.tags).toEqual(['React']);
  });

  it('should not add a duplicate that differs only in case', () => {
    const { result } = renderHook(() => useTagInput(['React']));

    act(() => result.current.addTag('react'));

    expect(result.current.tags).toHaveLength(1);
  });

  it('should preserve the existing original casing when a case-variant is attempted', () => {
    const { result } = renderHook(() => useTagInput(['React']));

    act(() => result.current.addTag('react'));

    expect(result.current.tags).toEqual(['React']);
  });

  it('should add a non-duplicate tag normally', () => {
    const { result } = renderHook(() => useTagInput(['React']));

    act(() => result.current.addTag('Vue'));

    expect(result.current.tags).toEqual(['React', 'Vue']);
  });

  it('should compare case-insensitively for any case form', () => {
    const { result } = renderHook(() => useTagInput(['React']));

    act(() => result.current.addTag('REACT'));

    expect(result.current.tags).toEqual(['React']);
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

// 시나리오 2.1(TAG-5) — addTag 입력 검증(trim·15자·10개)
describe('useTagInput.addTag (입력 검증)', () => {
  it('should not add a tag when the value is only whitespace', () => {
    const { result } = renderHook(() => useTagInput([]));

    act(() => result.current.addTag('   '));

    expect(result.current.tags).toEqual([]);
  });

  it('should store the trimmed value when the input is surrounded by whitespace', () => {
    const { result } = renderHook(() => useTagInput([]));

    act(() => result.current.addTag('  React  '));

    expect(result.current.tags).toEqual(['React']);
  });

  it('should treat a whitespace-padded value as a duplicate of an existing tag', () => {
    const { result } = renderHook(() => useTagInput(['React']));

    act(() => result.current.addTag('  react  '));

    expect(result.current.tags).toEqual(['React']);
  });

  it('should not add a tag longer than 15 characters', () => {
    const { result } = renderHook(() => useTagInput([]));

    act(() => result.current.addTag('x'.repeat(16)));

    expect(result.current.tags).toEqual([]);
  });

  it('should add a tag of exactly 15 characters', () => {
    const { result } = renderHook(() => useTagInput([]));
    const fifteen = 'x'.repeat(15);

    act(() => result.current.addTag(fifteen));

    expect(result.current.tags).toEqual([fifteen]);
  });

  it('should not add an 11th tag when 10 already exist', () => {
    const ten = Array.from({ length: 10 }, (_, i) => `tag${i}`);
    const { result } = renderHook(() => useTagInput(ten));

    act(() => result.current.addTag('eleventh'));

    expect(result.current.tags).toHaveLength(10);
  });

  it('should add the 10th tag when 9 already exist', () => {
    const nine = Array.from({ length: 9 }, (_, i) => `tag${i}`);
    const { result } = renderHook(() => useTagInput(nine));

    act(() => result.current.addTag('tenth'));

    expect(result.current.tags).toHaveLength(10);
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
