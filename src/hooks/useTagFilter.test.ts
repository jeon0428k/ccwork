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

  it('should treat a note without a tags field as having no tags (no crash)', () => {
    // 레거시/시드 데이터: tags 필드가 없는 노트 (Note 타입엔 있으나 영속 데이터엔 누락 가능)
    const legacy = {
      id: '0',
      title: 'legacy',
      content: '',
      createdAt: '',
      updatedAt: '',
    } as unknown as Note;

    const { result } = renderHook(() => useTagFilter([legacy, note('1', ['work'])]));

    expect(result.current.allTags).toEqual(['work']);
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

// issue-21 §시나리오 — useTagFilter.visibleNotes (FILTER-2)
describe('useTagFilter.visibleNotes', () => {
  it('should return all notes when activeTags is empty (filter off)', () => {
    const notes = [note('1', ['work']), note('2', ['idea'])];

    const { result } = renderHook(() => useTagFilter(notes));

    expect(result.current.visibleNotes).toEqual(notes);
  });

  it('should return only "work" notes when only "work" is toggled on', () => {
    const notes = [note('1', ['work']), note('2', ['idea'])];

    const { result } = renderHook(() => useTagFilter(notes));
    act(() => result.current.toggleTag('work'));

    expect(result.current.visibleNotes).toEqual([notes[0]]);
  });

  it('should return notes having work OR idea when both "work" and "idea" are on', () => {
    const notes = [note('1', ['work']), note('2', ['idea']), note('3', ['personal'])];

    const { result } = renderHook(() => useTagFilter(notes));
    act(() => result.current.toggleTag('work'));
    act(() => result.current.toggleTag('idea'));

    expect(result.current.visibleNotes).toEqual([notes[0], notes[1]]);
  });

  it('should preserve the input notes order when several notes match', () => {
    const notes = [note('a', ['work']), note('b', ['idea']), note('c', ['work'])];

    const { result } = renderHook(() => useTagFilter(notes));
    act(() => result.current.toggleTag('work'));

    expect(result.current.visibleNotes).toEqual([notes[0], notes[2]]);
  });

  it('should exclude untagged notes when at least one tag is active', () => {
    const notes = [note('1', ['work']), note('2', [])];

    const { result } = renderHook(() => useTagFilter(notes));
    act(() => result.current.toggleTag('work'));

    expect(result.current.visibleNotes).toEqual([notes[0]]);
  });

  it('should return an empty array when no note matches the active tags', () => {
    const notes = [note('1', ['work']), note('2', ['idea'])];

    const { result } = renderHook(() => useTagFilter(notes));
    act(() => result.current.toggleTag('archive'));

    expect(result.current.visibleNotes).toEqual([]);
  });

  it('should return all notes again when the last active tag is toggled back off', () => {
    const notes = [note('1', ['work']), note('2', ['idea'])];

    const { result } = renderHook(() => useTagFilter(notes));
    act(() => result.current.toggleTag('work'));
    act(() => result.current.toggleTag('work'));

    expect(result.current.visibleNotes).toEqual(notes);
  });

  it('should treat a legacy note without a tags field as untagged and exclude it when a tag is active', () => {
    const legacy = {
      id: '0',
      title: 'legacy',
      content: '',
      createdAt: '',
      updatedAt: '',
    } as unknown as Note;
    const notes = [legacy, note('1', ['work'])];

    const { result } = renderHook(() => useTagFilter(notes));
    act(() => result.current.toggleTag('work'));

    expect(result.current.visibleNotes).toEqual([notes[1]]);
  });
});
