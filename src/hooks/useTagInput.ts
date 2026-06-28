import { useState } from 'react';

interface UseTagInput {
  tags: string[];
  addTag: (raw: string) => void; // Enter/쉼표 확정 시
  removeTag: (tag: string) => void; // × 클릭 시 해당 태그 제거
  removeLast: () => void; // 빈 input + Backspace 시 마지막 칩 삭제
  reset: (tags: string[]) => void; // 노트 전환 시 폼 재동기화
}

export function useTagInput(initialTags: string[]): UseTagInput {
  const [tags, setTags] = useState<string[]>(initialTags);

  // 빈값 + 대소문자 무시 중복 게이트. trim·길이·개수는 TAG-5
  const addTag = (raw: string) => {
    if (!raw) return;
    // 중복이면 원본 표기를 유지한 채 무시 (조용히 input만 비워짐)
    setTags((prev) =>
      prev.some((t) => t.toLowerCase() === raw.toLowerCase()) ? prev : [...prev, raw],
    );
  };

  // 값 정확 일치로 제거. 미존재 태그면 no-op (filter 결과 동일)
  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  // 마지막 1개 제거. 빈 배열이면 slice 결과가 동일해 no-op
  const removeLast = () => setTags((prev) => prev.slice(0, -1));

  const reset = (next: string[]) => setTags(next);

  return { tags, addTag, removeTag, removeLast, reset };
}
