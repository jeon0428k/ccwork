# Issue #8 — TAG-3: Backspace로 마지막 칩 삭제

> [`prd.md`](./prd.md) · GitHub 이슈 [#8](https://github.com/jeon0428k/ccwork/issues/8) 기반.
> 이 문서는 **TDD 구현 직전 입력**이다. 상단=확정 시그니처, 하단=테스트 시나리오 + AC 커버리지.
> 구현 코드·테스트 코드는 포함하지 않는다. 의존: TAG-1(#6, 머지됨).

---

## 1. 확정 시그니처

### 1.1 커스텀 훅 — `src/hooks/useTagInput.ts` (확장)

```ts
interface UseTagInput {
  tags: string[];
  addTag: (raw: string) => void; // Enter/쉼표 확정 시 (TAG-1)
  removeTag: (tag: string) => void; // × 클릭 시 해당 태그 제거 (TAG-2)
  removeLast: () => void; // ➕ TAG-3: 마지막 칩 삭제 (빈 input + Backspace)
  reset: (tags: string[]) => void; // 노트 전환 시 폼 재동기화 (TAG-1)
}

export function useTagInput(initialTags: string[]): UseTagInput;
```

- `removeLast`: `setTags((prev) => prev.slice(0, -1))` — 마지막 1개 제거.
- **빈 배열이면 no-op** (`[].slice(0, -1)` = `[]`, throw 없음). 인자·반환 없음.

### 1.2 컴포넌트 Props — `src/components/ChipInput.tsx` (확장)

```ts
interface ChipInputProps {
  tags: string[];
  onAddTag: (raw: string) => void; // Enter/쉼표 시 (TAG-1)
  onRemoveTag: (tag: string) => void; // 칩 × 클릭 시 (TAG-2)
  onRemoveLast: () => void; // ➕ TAG-3: 빈 input에서 Backspace 시
  placeholder?: string;
}
```

- `handleKeyDown`에 분기 추가: **`text === ''` 이고 `e.key === 'Backspace'`** 일 때만 `onRemoveLast()` 호출.
- input에 텍스트가 있으면(`text !== ''`) Backspace는 건드리지 않고 브라우저 기본 문자 삭제에 맡긴다(칩 영향 없음 → AC-2).
- 칩 개수 가드는 ChipInput에 두지 않는다 — `removeLast`가 빈 배열에서 no-op이므로 칩 0개일 때 Backspace는 `onRemoveLast()`가 호출돼도 무동작(AC-3, 오류 없음).
- 네이밍: `on`+PascalCase(`onRemoveLast`), named export — 기존 패턴 준수.

### 1.3 배선 — `src/components/NoteEditor.tsx` (참고, 시그니처 변화 없음)

- `const { tags, addTag, removeTag, removeLast, reset } = useTagInput(selectedNote?.tags ?? [])`
- `<ChipInput tags={tags} onAddTag={addTag} onRemoveTag={removeTag} onRemoveLast={removeLast} placeholder="태그 추가" />`
- `handleSave`는 변경 없음 — 삭제된 태그는 메모리 배열에서 빠진 채 기존 저장 경로로 영속.

### 1.4 Context / API — **무변경**

- `createNote`·`updateNote`·`src/api/notes.ts` 모두 그대로. Backspace 삭제는 메모리 태그 배열 변경 + 기존 저장 경로 재사용.

### 1.5 에러 정책

- TAG-3는 **신규 throw를 도입하지 않는다.** `removeLast` 빈 배열 no-op, 텍스트 있는 Backspace는 일반 문자 삭제(미간섭).

---

## 2. 테스트 시나리오

> 형식: `[정상/경계/예외] 함수(유닛)명 - should [기대동작] when [조건]`
> 범위는 TAG-3 AC 한정(Backspace 마지막 칩 삭제). 중복·trim·한도 등은 TAG-4/TAG-5.

### 2.1 `useTagInput.removeLast`

- [정상] removeLast - should remove the last tag from `tags` when there is at least one tag (`[React, TypeScript]` → `[React]`)
- [경계] removeLast - should be a no-op when `tags` is empty (no throw)
- [경계] removeLast - should result in `[]` when removing the only remaining tag

### 2.2 `ChipInput` (Backspace 위임)

- [정상] ChipInput - should call `onRemoveLast` when Backspace is pressed and the input is empty
- [경계] ChipInput - should not call `onRemoveLast` when Backspace is pressed and the input has text (일반 문자 삭제)
- [경계] ChipInput - should call `onRemoveLast` on empty-input Backspace even when there are no chips (호출되나 훅에서 no-op → 오류 없음)

### 2.3 `NoteEditor` (Backspace 삭제 후 저장 반영)

- [정상] NoteEditor - should persist tags without the last one when the last chip is removed via Backspace and the note is saved (`updateNote` called with `[React]`)

---

## 3. AC 커버리지 대조

| AC                                     | 커버 시나리오                                                                                                                                                   |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AC-1** (빈 input에서 마지막 칩 삭제) | `removeLast` should remove the last tag; `ChipInput` should call `onRemoveLast` on empty-input Backspace; `NoteEditor` should persist tags without the last one |
| **AC-2** (텍스트 있으면 칩 보존)       | `ChipInput` should not call `onRemoveLast` when the input has text                                                                                              |
| **AC-3** (칩 없을 때 무동작)           | `removeLast` should be a no-op when `tags` is empty; `ChipInput` should call `onRemoveLast` even with no chips (no error)                                       |

✅ **모든 AC(3/3)가 최소 1개 이상의 시나리오로 커버됨 — 누락 0건.**

---

> 다음 단계: 이 문서를 입력으로 **TDD 구현**(Red→Green→Refactor). 시그니처는 위 §1 고정, 시나리오 §2가 테스트의 씨앗.
