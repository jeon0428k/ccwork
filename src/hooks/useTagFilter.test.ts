import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTagFilter } from './useTagFilter';
import { Note } from '../types/note';

// 테스트용 노트 팩토리
function note(id: string, tags: string[]): Note {
  return {
    id,
    title: `note-${id}`,
    content: '',
    tags,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

// issue-20 §2 — useTagFilter.allTags
describe('useTagFilter.allTags', () => {
  it('should return the union of all note tags when multiple notes have tags', () => {
    const notes = [note('1', ['work']), note('2', ['idea'])];

    const { result } = renderHook(() => useTagFilter(notes));

    expect(result.current.allTags).toEqual(['work', 'idea']);
  });

  it('should include a duplicate tag only once preserving first-seen order', () => {
    const notes = [note('1', ['work', 'idea']), note('2', ['work'])];

    const { result } = renderHook(() => useTagFilter(notes));

    expect(result.current.allTags).toEqual(['work', 'idea']);
  });

  it('should return an empty array when no note has tags', () => {
    const notes = [note('1', []), note('2', [])];

    const { result } = renderHook(() => useTagFilter(notes));

    expect(result.current.allTags).toEqual([]);
  });

  it('should return an empty array when notes is empty', () => {
    const { result } = renderHook(() => useTagFilter([]));

    expect(result.current.allTags).toEqual([]);
  });
});

// issue-20 §2 — useTagFilter.activeTags / toggleTag
describe('useTagFilter.activeTags & toggleTag', () => {
  it('should start with an empty activeTags on initial render', () => {
    const { result } = renderHook(() => useTagFilter([note('1', ['work'])]));

    expect(result.current.activeTags).toEqual([]);
  });

  it('should add a tag to activeTags when toggling an inactive tag', () => {
    const { result } = renderHook(() => useTagFilter([note('1', ['work'])]));

    act(() => result.current.toggleTag('work'));

    expect(result.current.activeTags).toEqual(['work']);
  });

  it('should remove a tag from activeTags when toggling an active tag again', () => {
    const { result } = renderHook(() => useTagFilter([note('1', ['work'])]));

    act(() => result.current.toggleTag('work'));
    act(() => result.current.toggleTag('work'));

    expect(result.current.activeTags).toEqual([]);
  });

  it('should keep other active tags intact when toggling one tag', () => {
    const { result } = renderHook(() => useTagFilter([note('1', ['work', 'idea'])]));

    act(() => result.current.toggleTag('work'));
    act(() => result.current.toggleTag('idea'));
    act(() => result.current.toggleTag('work'));

    expect(result.current.activeTags).toEqual(['idea']);
  });
});
