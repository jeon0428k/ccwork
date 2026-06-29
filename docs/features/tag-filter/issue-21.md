# FILTER-2 — 태그 선택으로 노트 목록 좁히기 OR (issue #21)

> test-scenarios 산출물. 상단=확정 시그니처, 하단=테스트 시나리오. 구현/테스트 코드는 다음 단계(TDD).

## 확정 시그니처

### 훅 — `src/hooks/useTagFilter.ts` (FILTER-2에서 `visibleNotes` 추가)

```ts
import { Note } from '../types/note';

interface UseTagFilterResult {
  allTags: string[]; // 모든 노트 태그의 합집합(중복 제거, 첫 등장 순서 유지) — FILTER-1
  activeTags: string[]; // 켜진 태그 목록 (초기값 []) — FILTER-1
  toggleTag: (tag: string) => void; // 해당 태그 켜짐↔꺼짐 토글 — FILTER-1
  visibleNotes: Note[]; // FILTER-2: activeTags가 비면 전체, 아니면 OR 매칭 노트
  // clearTags 는 FILTER-3에서 추가 (이번 범위 아님)
}

export function useTagFilter(notes: Note[]): UseTagFilterResult;
```

### 표시 컴포넌트 — `src/components/NoteList.tsx` (notes prop 수신으로 리팩터)

```ts
import { Note } from '../types/note';

interface NoteListProps {
  notes: Note[]; // FILTER-2: 표시할 노트를 prop으로 주입 (기존엔 context에서 직접 pull)
  selectedNoteId: string | null;
  onSelect: (id: string) => void;
}

export function NoteList({ notes, selectedNoteId, onSelect }: NoteListProps): JSX.Element;
```

### 컨테이너 — `src/components/Sidebar.tsx`

```ts
// useTagFilter에서 visibleNotes를 받아 NoteList에 전달
const { allTags, activeTags, toggleTag, visibleNotes } = useTagFilter(notes);
// <NoteList notes={visibleNotes} selectedNoteId={...} onSelect={...} />
```

### 동작·에러 규약

- `visibleNotes`: `activeTags`가 빈 배열이면 입력 `notes` 전체를 그대로 반환(필터 해제 상태).
- `activeTags`가 비어있지 않으면 **OR 매칭** — 노트의 `tags` 중 하나라도 `activeTags`에 포함되면 표시.
- 태그가 없는(빈 `tags` 또는 레거시 누락) 노트는 `activeTags`가 하나라도 켜져 있으면 어떤 태그와도 매칭되지 않아 **숨겨진다**.
- 입력 `notes`의 순서를 유지한다(필터는 순서를 바꾸지 않음).
- throw 없음. `notes`의 `tags`는 `string[]` 전제, `undefined`(레거시)는 빈 태그로 방어.
- `NoteList`의 `loading`/`error`/`deleteNote`는 기존대로 `useNotes()` context에서 가져온다(이번 리팩터 범위는 `notes` 주입만).
- `NoteList`의 빈 상태("노트가 없습니다")는 주입된 `notes.length === 0` 기준으로 동작 — 필터 결과 0건이면 빈 상태가 표시된다.

## 테스트 시나리오

### useTagFilter.visibleNotes (훅)

- `[정상] useTagFilter.visibleNotes - should 전체 노트 반환 when activeTags가 비어있음 (필터 해제)`
- `[정상] useTagFilter.visibleNotes - should "work" 태그 노트만 반환 when "work"만 토글로 켬`
- `[정상] useTagFilter.visibleNotes - should work 또는 idea를 가진 노트를 모두 반환(OR) when "work"와 "idea"를 모두 켬`
- `[정상] useTagFilter.visibleNotes - should 입력 notes의 순서를 유지 when 여러 노트가 매칭됨`
- `[경계] useTagFilter.visibleNotes - should 무태그 노트를 제외 when 태그가 하나라도 켜져 있음`
- `[경계] useTagFilter.visibleNotes - should 빈 배열 반환 when 켜진 태그와 매칭되는 노트가 하나도 없음`
- `[경계] useTagFilter.visibleNotes - should 토글로 마지막 켠 태그를 끄면 다시 전체 반환 when activeTags가 빈 배열로 복귀`
- `[예외] useTagFilter.visibleNotes - should tags 필드 없는(레거시) 노트를 무태그로 취급해 제외 when 태그가 켜져 있고 노트 tags가 undefined`

### NoteList (notes prop 리팩터)

- `[정상] NoteList - should 전달된 notes만 렌더 when notes prop으로 일부 노트가 주입됨`
- `[정상] NoteList - should "노트 N개"의 N이 주입된 notes 길이와 일치 when notes prop 주입`
- `[경계] NoteList - should "노트가 없습니다" 표시 when notes prop이 빈 배열 (필터 결과 0건)`

### Sidebar (통합: visibleNotes → NoteList)

- `[정상] Sidebar - should "work" 태그 노트만 목록에 렌더 when "work" 칩을 클릭해 켬` (AC1 end-to-end)
- `[정상] Sidebar - should work 또는 idea 노트를 모두 목록에 렌더 when "work"와 "idea" 칩을 모두 켬` (AC2 end-to-end)
- `[경계] Sidebar - should 무태그 노트를 목록에서 숨김 when 아무 태그라도 켜져 있음` (AC3 end-to-end)
- `[정상] Sidebar - should 전체 노트를 목록에 렌더 when 켜진 칩이 하나도 없음` (AC4 end-to-end)

## AC 커버리지 대조

| Acceptance Criteria                                            | 분류      | 커버 시나리오                                                                          |
| -------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------- |
| AC1: "work" 칩만 켜면 "work" 태그 노트만 표시                  | 정상      | visibleNotes "work"만 반환 + Sidebar "work" 칩 클릭 시 목록                            |
| AC2: "work"+"idea" 모두 켜면 work 또는 idea 노트 모두(OR) 표시 | 정상      | visibleNotes OR 반환 + Sidebar 두 칩 켬                                                |
| AC3: 태그 켜져 있으면 무태그 노트는 목록에서 숨김              | 경계/예외 | visibleNotes 무태그 제외 + 레거시 undefined 제외 + Sidebar 무태그 숨김                 |
| AC4: 켜진 태그가 하나도 없으면 전체 노트 표시(필터 해제)       | 정상/경계 | visibleNotes activeTags 비면 전체 + 마지막 태그 끄면 전체 복귀 + Sidebar 켠 칩 없을 때 |

누락 AC: 없음 (4/4 커버, 정상/경계/예외 분류 포함).
