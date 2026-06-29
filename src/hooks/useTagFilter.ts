import { useMemo, useState } from 'react';
import { Note } from '../types/note';

interface UseTagFilterResult {
  allTags: string[];
  activeTags: string[];
  toggleTag: (tag: string) => void;
  visibleNotes: Note[]; // FILTER-2: activeTags가 비면 전체, 아니면 OR 매칭 노트
}

// 노트들의 태그 합집합(중복 제거, 첫 등장 순서 유지) + 켜진 태그 토글 상태.
export function useTagFilter(notes: Note[]): UseTagFilterResult {
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const allTags = useMemo(() => {
    const seen: string[] = [];
    for (const note of notes) {
      // 영속 데이터에 tags 필드가 없는(레거시) 노트가 있을 수 있어 방어한다.
      for (const tag of note.tags ?? []) {
        if (!seen.includes(tag)) seen.push(tag);
      }
    }
    return seen;
  }, [notes]);

  const toggleTag = (tag: string) => {
    setActiveTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  // FILTER-2: activeTags가 비면 전체, 아니면 OR 매칭(노트 tags ∩ activeTags ≠ ∅).
  const visibleNotes = useMemo(() => {
    if (activeTags.length === 0) return notes;
    return notes.filter((note) => (note.tags ?? []).some((tag) => activeTags.includes(tag)));
  }, [notes, activeTags]);

  return {
    allTags,
    activeTags,
    toggleTag,
    visibleNotes,
  };
}
