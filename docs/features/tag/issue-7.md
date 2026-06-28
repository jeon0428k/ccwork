# Issue #7 — TAG-2: 칩 삭제 (× 버튼, hover 노출)

> [`prd.md`](./prd.md) · GitHub 이슈 [#7](https://github.com/jeon0428k/ccwork/issues/7) 기반.
> 이 문서는 **TDD 구현 직전 입력**이다. 상단=확정 시그니처, 하단=테스트 시나리오 + AC 커버리지.
> 구현 코드·테스트 코드는 포함하지 않는다. 의존: TAG-1(#6, 머지됨).

---

## 1. 확정 시그니처

### 1.1 커스텀 훅 — `src/hooks/useTagInput.ts` (확장)

```ts
interface UseTagInput {
  tags: string[];
  addTag: (raw: string) => void; // Enter/쉼표 확정 시 (TAG-1)
  removeTag: (tag: string) => void; // ➕ TAG-2: × 클릭 시 해당 태그 제거
  reset: (tags: string[]) => void; // 노트 전환 시 폼 재동기화 (TAG-1)
}

export function useTagInput(initialTags: string[]): UseTagInput;
```

- `removeTag`는 **값(원본 표기) 정확 일치**로 제거: `tags.filter((t) => t !== tag)`.
- 존재하지 않는 태그면 **조용히 no-op**(throw 없음). 동일 값이 여러 개면 전부 제거되나, 중복 자체는 TAG-4에서 차단되므로 실제로는 발생하지 않음.
- 시그니처 `(tag) => void` — 반환 없음. 인덱스가 아닌 값 기준(이슈 `removeTag(tag)` 명세 준수).

### 1.2 컴포넌트 Props — `src/components/Chip.tsx` (확장)

```ts
interface ChipProps {
  label: string;
  onRemove?: () => void; // ➕ TAG-2: × 버튼 클릭 핸들러. 없으면 표시 전용(기존 호환)
}
```

- `onRemove`가 **있을 때만** × 버튼을 렌더한다. 없으면 기존처럼 표시 전용 칩.
- × 버튼은 **hover 시 노출** — 칩 래퍼에 `group`, 버튼에 `opacity-0 group-hover:opacity-100`(평소 숨김, hover 시 표시).
- 접근성/테스트: × 버튼 `type="button"` + `aria-label={`${label} 태그 삭제`}` — 칩별 ×를 특정 가능(AC-2의 "React의 × 클릭").
- 디자인: 기존 칩 토큰 유지. ×는 `text-foreground/60` 계열(순수 검정·흐릿 그림자·`rounded-3xl` 회피).

### 1.3 컴포넌트 Props — `src/components/ChipInput.tsx` (확장)

```ts
interface ChipInputProps {
  tags: string[];
  onAddTag: (raw: string) => void; // Enter/쉼표 시 (TAG-1)
  onRemoveTag: (tag: string) => void; // ➕ TAG-2: 칩 × 클릭 위임
  placeholder?: string;
}
```

- 각 칩 렌더: `<Chip key={`${tag}-${i}`} label={tag} onRemove={() => onRemoveTag(tag)} />`.
- 네이밍: `on`+PascalCase(`onRemoveTag`), named export — 기존 패턴 준수.

### 1.4 배선 — `src/components/NoteEditor.tsx` (참고, 시그니처 변화 없음)

- `const { tags, addTag, removeTag, reset } = useTagInput(selectedNote?.tags ?? [])`
- `<ChipInput tags={tags} onAddTag={addTag} onRemoveTag={removeTag} placeholder="태그 추가" />`
- `handleSave`는 **변경 없음** — 이미 `tags`를 `createNote(title, content, tags)` / `updateNote(id, { title, content, tags })`에 전달하므로, 삭제된 태그는 메모리 배열에서 빠진 채 저장됨(AC-3 자동 충족).

### 1.5 Context / API — **무변경**

- `createNote`·`updateNote`(`NotesContext`)·`src/api/notes.ts` 모두 그대로. 삭제는 메모리 태그 배열 변경 + 기존 저장 경로 재사용(별도 삭제 API 없음, ADR-3).

### 1.6 에러 정책

- TAG-2는 **신규 throw를 도입하지 않는다.** `removeTag` 미존재 태그는 no-op.
- 저장 실패 시 기존 정책 유지(`NoteEditor.handleSave`의 `try/catch` → `console.error`).

---

## 2. 테스트 시나리오

> 형식: `[정상/경계/예외] 함수(유닛)명 - should [기대동작] when [조건]`
> 범위는 TAG-2 AC 한정(칩 삭제). 중복·trim·한도 등은 TAG-4/TAG-5.

### 2.1 `useTagInput.removeTag`

- [정상] removeTag - should remove the matching tag from `tags` when called with an existing value
- [정상] removeTag - should keep the remaining tags and their order when removing one (`[React, TypeScript]` → remove `React` → `[TypeScript]`)
- [경계] removeTag - should be a no-op when called with a tag that is not present
- [경계] removeTag - should result in `[]` when removing the only remaining tag

### 2.2 `Chip` (× 버튼 · hover 노출)

- [정상] Chip - should render a remove(×) button with `aria-label` `"{label} 태그 삭제"` when `onRemove` is provided
- [경계] Chip - should not render any remove button when `onRemove` is omitted (표시 전용 호환)
- [정상] Chip - should call `onRemove` exactly once when the × button is clicked
- [경계] Chip - should apply hover-reveal classes (hidden by default, shown on hover) to the × button

### 2.3 `ChipInput` (삭제 위임)

- [정상] ChipInput - should render each tag's chip with a remove(×) button
- [정상] ChipInput - should call `onRemoveTag` with the tag value when that chip's × is clicked
- [정상] ChipInput - should call `onRemoveTag` with the correct value when one of multiple chips' × is clicked (`React`,`TypeScript` → remove `React`)

### 2.4 `NoteEditor` (삭제 후 저장 반영)

- [정상] NoteEditor - should persist the remaining tags excluding the removed one when saving after a chip is removed (`updateNote` called with tags without `React`)
- [경계] NoteEditor - should persist `tags: []` when the only tag is removed and then saved

---

## 3. AC 커버리지 대조

| AC                           | 커버 시나리오                                                                                                                                                                                 |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AC-1** (hover 시 × 노출)   | `Chip` should render × button with aria-label when `onRemove`; `Chip` should apply hover-reveal classes; `Chip` should not render × when omitted                                              |
| **AC-2** (× 클릭 시 제거)    | `removeTag` should remove matching tag; `removeTag` should keep remaining + order; `Chip` should call `onRemove` on click; `ChipInput` should call `onRemoveTag` with value (single·multiple) |
| **AC-3** (삭제 후 저장 반영) | `NoteEditor` should persist remaining tags excluding removed one; `NoteEditor` should persist `[]` when last tag removed                                                                      |

✅ **모든 AC(3/3)가 최소 1개 이상의 시나리오로 커버됨 — 누락 0건.**

---

> 다음 단계: 이 문서를 입력으로 **TDD 구현**(Red→Green→Refactor). 시그니처는 위 §1 고정, 시나리오 §2가 테스트의 씨앗.
