import { Note } from '../types/note';

interface UseTagFilterResult {
  allTags: string[];
  activeTags: string[];
  toggleTag: (tag: string) => void;
}

// TDD Red 스텁 — 구현은 tdd-green에서. 현재는 호출 시 실패한다.
export function useTagFilter(notes: Note[]): UseTagFilterResult {
  void notes;
  throw new Error('useTagFilter not implemented');
}
