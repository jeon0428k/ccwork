# FILTER-1 — 사이드바에 태그 필터 칩 목록 표시 (issue #20)

> test-scenarios 산출물. 상단=확정 시그니처, 하단=테스트 시나리오. 구현/테스트 코드는 다음 단계(TDD).

## 확정 시그니처

### 훅 — `src/hooks/useTagFilter.ts` (FILTER-1 범위)

```ts
import { Note } from '../types/note';

interface UseTagFilterResult {
  allTags: string[]; // 모든 노트 태그의 합집합(중복 제거, 첫 등장 순서 유지)
  activeTags: string[]; // 켜진 태그 목록 (초기값 [])
  toggleTag: (tag: string) => void; // 해당 태그 켜짐↔꺼짐 토글
  // clearTags, visibleNotes 는 FILTER-2/3에서 추가 (이번 범위 아님)
}

export function useTagFilter(notes: Note[]): UseTagFilterResult;
```

### 표시 컴포넌트 — `src/components/TagFilter.tsx`

```ts
interface TagFilterProps {
  allTags: string[];
  activeTags: string[];
  onToggle: (tag: string) => void;
}

export function TagFilter({ allTags, activeTags, onToggle }: TagFilterProps): JSX.Element | null;
```

### 동작·에러 규약

- `allTags`가 빈 배열이면 `TagFilter`는 `null` 렌더(칩 영역 미표시).
- 각 태그는 토글 버튼으로 렌더, 켜진 칩은 `aria-pressed={true}`로 구분. 시각 스타일은 기존 `Chip` 톤 재사용.
- throw 없음. `notes`의 `tags`는 `string[]` 전제(빈 배열 허용).
- `allTags`는 노트 순회 중 첫 등장 순서를 유지하며 중복 제거.

## 테스트 시나리오

### useTagFilter (훅)

- `[정상] useTagFilter.allTags - should 모든 노트의 태그를 합쳐 반환 when 여러 노트가 태그를 가짐`
- `[정상] useTagFilter.allTags - should 중복 태그를 한 번만 포함 when 여러 노트가 같은 태그를 가짐 (예: ["work","idea"],["work"] → ["work","idea"])`
- `[경계] useTagFilter.allTags - should 빈 배열 반환 when 어떤 노트에도 태그가 없음`
- `[경계] useTagFilter.allTags - should 빈 배열 반환 when notes가 빈 배열`
- `[정상] useTagFilter.activeTags - should 초기값 빈 배열 when 훅 초기 렌더`
- `[정상] useTagFilter.toggleTag - should 태그를 activeTags에 추가 when 꺼진 태그를 toggle`
- `[정상] useTagFilter.toggleTag - should 태그를 activeTags에서 제거 when 켜진 태그를 다시 toggle`
- `[경계] useTagFilter.toggleTag - should 다른 켜진 태그는 유지 when 한 태그만 토글 (독립성)`

### TagFilter (컴포넌트)

- `[정상] TagFilter - should allTags의 각 태그를 칩으로 렌더 when allTags가 비어있지 않음`
- `[정상] TagFilter - should 중복 없이 전달된 태그를 그대로 렌더 when allTags=["work","idea"]`
- `[경계] TagFilter - should 아무것도 렌더하지 않음(null) when allTags가 빈 배열`
- `[정상] TagFilter - should 켜진 태그를 aria-pressed=true로 표시 when activeTags에 포함된 태그`
- `[정상] TagFilter - should 꺼진 태그를 aria-pressed=false로 표시 when activeTags에 없는 태그`
- `[정상] TagFilter - should onToggle(tag) 호출 when 칩 클릭`

## AC 커버리지 대조

| Acceptance Criteria                                                           | 커버 시나리오                                                |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------ |
| AC1: ["work","idea"],["work"] → 중복 제거된 "work","idea" 칩이 목록 위에 표시 | useTagFilter.allTags 중복 제거 + TagFilter 칩 렌더           |
| AC2: 어떤 노트도 태그 없으면 필터 칩 영역 미렌더                              | useTagFilter.allTags 빈 배열 + TagFilter null 렌더           |
| AC3: 칩 클릭 시 "켜짐" 상태 시각 구분(재클릭 시 꺼짐)                         | toggleTag 추가/제거 + TagFilter aria-pressed + onToggle 호출 |

누락 AC: 없음 (3/3 커버).
