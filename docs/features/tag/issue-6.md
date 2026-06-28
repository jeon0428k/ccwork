# Issue #6 — TAG-1: 태그 추가·저장·표시 (Walking Skeleton)

> [`prd.md`](./prd.md) · GitHub 이슈 [#6](https://github.com/jeon0428k/ccwork/issues/6) 기반.
> 이 문서는 **TDD 구현 직전 입력**이다. 상단=확정 시그니처, 하단=테스트 시나리오 + AC 커버리지.
> 구현 코드·테스트 코드는 포함하지 않는다.

---

## 1. 확정 시그니처

### 1.1 데이터 모델 — `src/types/note.ts`

```ts
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[]; // ➕ 비정규화·non-optional·기본 [] (ADR-1)
  createdAt: string;
  updatedAt: string;
}
```

- 모든 읽기 경로는 `note.tags ?? []` 폴백(ADR-2). 타입은 non-optional, 폼 초기화 경계에서 1회 정규화.

### 1.2 커스텀 훅 — `src/hooks/useTagInput.ts` (신규)

```ts
interface UseTagInput {
  tags: string[];
  addTag: (raw: string) => void; // Enter/쉼표 확정 시
  reset: (tags: string[]) => void; // 노트 전환 시 폼 재동기화
}

export function useTagInput(initialTags: string[]): UseTagInput;
```

- TAG-1 범위는 `addTag`·`reset`. `removeTag`/`removeLast`는 TAG-2/TAG-3에서 이 인터페이스에 추가(시그니처 안정).
- `addTag` 내부 게이트(trim·15자·중복·10개)는 ADR-4 순서로 뒤 이슈에서 확장. 시그니처 `(raw) => void` 불변, 입력은 항상 비워지므로 반환 없음.

### 1.3 컴포넌트 Props — `src/components/ChipInput.tsx`, `src/components/Chip.tsx` (신규)

```ts
interface ChipInputProps {
  tags: string[];
  onAddTag: (raw: string) => void; // Enter/쉼표 시
  placeholder?: string;
}

interface ChipProps {
  label: string;
}
```

- `ChipInput`은 내부 텍스트 입력 상태(`useState('')`)만 보유, 확정 시 `onAddTag(text)` 위임 후 비움 — dumb 컴포넌트.
- `Chip`은 표시 전용. `onRemove`(× 버튼)는 TAG-2에서 추가.
- 네이밍: `on`+PascalCase(`onAddTag`), named export — 기존 패턴 준수.

### 1.4 Context — `src/context/NotesContext.tsx`

```ts
createNote: (title: string, content: string, tags: string[]) => Promise<void>; // tags 인자 확장 (필수)
updateNote: (id: string, updates: Partial<Note>) => Promise<void>; // 변경 없음
```

- `createNote` 내부에서 `api.createNote({ title, content, tags })`. `updateNote`는 `{ title, content, tags }`를 그대로 흡수.
- `src/api/notes.ts` **무변경**(`Omit<Note, 'id'|'createdAt'|'updatedAt'>`에 `tags` 자동 포함).

### 1.5 배선 — `src/components/NoteEditor.tsx` (참고)

- `const { tags, addTag, reset } = useTagInput(selectedNote?.tags ?? [])`
- `useEffect`(노트 전환): `reset(selectedNote?.tags ?? [])`
- `handleSave`: `createNote(title, content, tags)` / `updateNote(id, { title, content, tags })`

### 1.6 에러 정책

- TAG-1은 **신규 throw를 도입하지 않는다.** `addTag`의 빈값·중복·한도 초과는 조용히 무시(input만 비움) — 게이트 구현은 TAG-4/TAG-5.
- API 계층 `!res.ok → throw`는 기존 유지. 저장 실패는 `NoteEditor.handleSave`의 `try/catch`에서 `console.error`.

---

## 2. 테스트 시나리오

> 형식: `[정상/경계/예외] 함수(유닛)명 - should [기대동작] when [조건]`
> 범위는 TAG-1 AC 한정. trim·중복·길이/개수 한도의 **상세 검증은 TAG-4/TAG-5**.

### 2.1 `useTagInput.addTag`

- [정상] addTag - should append the tag to `tags` when given a non-empty string
- [정상] addTag - should keep insertion order when adding multiple tags
- [경계] addTag - should not add an empty chip when raw is `""` (최소 가드; 상세 trim 검증은 TAG-5)

### 2.2 `useTagInput`(초기화) · `reset`

- [정상] useTagInput - should initialize `tags` from `initialTags` when mounted
- [경계] useTagInput - should initialize to `[]` when a legacy note has no `tags` field (`note.tags ?? []`)
- [정상] reset - should replace current `tags` with the provided array when the selected note changes

### 2.3 `ChipInput`

- [정상] ChipInput - should call `onAddTag` with the input text and clear the input when Enter is pressed
- [정상] ChipInput - should call `onAddTag` and clear the input when comma(`,`) is pressed
- [경계] ChipInput - should not include the comma character in the committed tag when comma is pressed
- [정상] ChipInput - should render the given `tags` as chips
- [경계] ChipInput - should not call `onAddTag` when the input is empty and Enter is pressed

### 2.4 `NotesContext.createNote`

- [정상] createNote - should call `api.createNote` with `{ title, content, tags }` exactly once when saving
- [정상] createNote - should persist the note including the `tags` array (no separate tag API call)
- [경계] createNote - should persist `tags: []` when no tags were added
- [예외] NoteEditor.handleSave - should `console.error` and not throw when `createNote` rejects

### 2.5 `NoteEditor`(재오픈 표시 · 폴백)

- [정상] NoteEditor - should render saved tags as a chip list under the title when reopening a note with tags
- [경계] NoteEditor - should render an empty tag area without error when opening a legacy note without `tags`

---

## 3. AC 커버리지 대조

| AC                          | 커버 시나리오                                                                                              |
| --------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **AC-1** (Enter로 추가)     | `addTag` should append…; `ChipInput` should call onAddTag…Enter; `ChipInput` should render tags as chips   |
| **AC-2** (쉼표로 추가)      | `ChipInput` should call onAddTag…comma; `ChipInput` should not include comma char                          |
| **AC-3** (본문과 함께 저장) | `createNote` should call api.createNote `{title,content,tags}` once; should persist tags (no separate API) |
| **AC-4** (재오픈 시 표시)   | `NoteEditor` should render saved tags as chip list; `reset` should replace tags on note change             |
| **AC-5** (기존 노트 폴백)   | `useTagInput` should init to `[]` for legacy note; `NoteEditor` should render empty tag area without error |

✅ **모든 AC(5/5)가 최소 1개 이상의 시나리오로 커버됨 — 누락 0건.**

---

> 다음 단계: 이 문서를 입력으로 **TDD 구현**(Red→Green→Refactor). 시그니처는 위 §1 고정, 시나리오 §2가 테스트의 씨앗.
