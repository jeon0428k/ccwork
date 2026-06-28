import { useState } from 'react';

const MAX_TAG_LENGTH = 15; // 1개 태그 최대 길이
const MAX_TAGS = 10; // 노트당 최대 태그 개수

interface UseTagInput {
  tags: string[];
  addTag: (raw: string) => void; // Enter/쉼표 확정 시
  removeTag: (tag: string) => void; // × 클릭 시 해당 태그 제거
  removeLast: () => void; // 빈 input + Backspace 시 마지막 칩 삭제
  reset: (tags: string[]) => void; // 노트 전환 시 폼 재동기화
}

export function useTagInput(initialTags: string[]): UseTagInput {
  const [tags, setTags] = useState<string[]>(initialTags);

  // ADR-4 게이트: trim → 빈값 → 15자 → 중복(대소문자 무시) → 10개. 모두 조용히 무시
  const addTag = (raw: string) => {
    const value = raw.trim();
    if (!value) return;
    if (value.length > MAX_TAG_LENGTH) return;
    setTags((prev) => {
      if (prev.some((t) => t.toLowerCase() === value.toLowerCase())) return prev; // 중복
      if (prev.length >= MAX_TAGS) return prev; // 개수 한도
      return [...prev, value]; // trim된 원본 표기 저장
    });
  };

  // 값 정확 일치로 제거. 미존재 태그면 no-op (filter 결과 동일)
  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  // 마지막 1개 제거. 빈 배열이면 slice 결과가 동일해 no-op
  const removeLast = () => setTags((prev) => prev.slice(0, -1));

  const reset = (next: string[]) => setTags(next);

  return { tags, addTag, removeTag, removeLast, reset };
}
