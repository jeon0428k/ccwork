import { useState } from 'react';

interface UseTagInput {
  tags: string[];
  addTag: (raw: string) => void; // Enter/쉼표 확정 시
  removeTag: (tag: string) => void; // × 클릭 시 해당 태그 제거
  reset: (tags: string[]) => void; // 노트 전환 시 폼 재동기화
}

export function useTagInput(initialTags: string[]): UseTagInput {
  const [tags, setTags] = useState<string[]>(initialTags);

  // 최소 가드: 빈 문자열만 무시 (상세 trim·중복·한도 검증은 TAG-4/TAG-5)
  const addTag = (raw: string) => {
    if (!raw) return;
    setTags((prev) => [...prev, raw]);
  };

  // 값 정확 일치로 제거. 미존재 태그면 no-op (filter 결과 동일)
  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const reset = (next: string[]) => setTags(next);

  return { tags, addTag, removeTag, reset };
}
