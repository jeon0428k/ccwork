import { useState } from 'react';

interface UseTagInput {
  tags: string[];
  addTag: (raw: string) => void; // Enter/쉼표 확정 시
  reset: (tags: string[]) => void; // 노트 전환 시 폼 재동기화
}

export function useTagInput(initialTags: string[]): UseTagInput {
  const [tags, setTags] = useState<string[]>(initialTags);

  // 최소 가드: 빈 문자열만 무시 (상세 trim·중복·한도 검증은 TAG-4/TAG-5)
  const addTag = (raw: string) => {
    if (!raw) return;
    setTags((prev) => [...prev, raw]);
  };

  const reset = (next: string[]) => setTags(next);

  return { tags, addTag, reset };
}
