# Issue #11 — TAG-6: 빈 태그 상태 UX (placeholder · 0개 저장)

> [`prd.md`](./prd.md) · GitHub 이슈 [#11](https://github.com/jeon0428k/ccwork/issues/11) 기반.
> 이 문서는 **TDD 구현 직전 입력**이다. 상단=확정 시그니처, 하단=테스트 시나리오 + AC 커버리지.
> 구현 코드·테스트 코드는 포함하지 않는다. 의존: TAG-1(#6, 머지됨). 태그 기능 마지막 슬라이스.

---

## 1. 확정 시그니처

### 1.1 컴포넌트 — `src/components/ChipInput.tsx` (Props 불변, input 동작/속성 변경)

```ts
interface ChipInputProps {
  tags: string[];
  onAddTag: (raw: string) => void;
  onRemoveTag: (tag: string) => void;
  onRemoveLast: () => void;
  placeholder?: string; // ⬅ 의미 변경: "0개일 때만" 노출되는 placeholder
}
```

- **조건부 placeholder**: `<input placeholder={tags.length === 0 ? placeholder : undefined} />`
  - 칩 0개 → 전달된 `placeholder` 표시(AC-1).
  - 칩 1개 이상 → `undefined`로 숨김(AC-2).
- **`aria-label="태그 입력"`** 추가: placeholder가 조건부로 사라지므로, 테스트·접근성을 위한 **안정적 라벨**. 태그 input은 `getByRole('textbox', { name: '태그 입력' })`로 조회(placeholder 가시성과 무관).

### 1.2 배선 — `src/components/NoteEditor.tsx`

- `<ChipInput ... placeholder="태그 입력 후 Enter" />` — placeholder 문구를 AC-1 문구(`태그 입력 후 Enter`)로 변경(기존 `"태그 추가"`에서 교체).
- 저장 경로 무변경 — 0개 태그도 기존 `createNote/updateNote`로 `tags: []` 저장(AC-3, TAG-1 폴백과 동일).

### 1.3 useTagInput / Context / API — **무변경**

### 1.4 기존 테스트 파급 (TAG-6 변경의 직접 결과)

- placeholder 문구 변경 + 조건부 숨김으로, **태그 input을 `getByPlaceholderText('태그 추가')`로 조회하던 기존 테스트**는 동작이 깨진다.
- 해결: 태그 input 조회를 **`getByRole('textbox', { name: '태그 입력' })`** 로 마이그레이션(placeholder 가시성과 독립). 단언 의도는 그대로 유지.

### 1.5 에러 정책

- 신규 throw 없음. 0개 태그 저장은 정상 경로.

---

## 2. 테스트 시나리오

> 형식: `[정상/경계/예외] 함수(유닛)명 - should [기대동작] when [조건]`
> 범위는 TAG-6 AC 한정(빈 상태 UX).

### 2.1 `ChipInput` (조건부 placeholder)

- [정상] ChipInput - should show the placeholder text on the input when there are no tags
- [경계] ChipInput - should hide the placeholder (no placeholder attribute) when there is at least one tag

### 2.2 `NoteEditor` (빈 상태 통합)

- [정상] NoteEditor - should show placeholder `태그 입력 후 Enter` on the tag input when a note has no tags — AC-1
- [경계] NoteEditor - should not show the tag placeholder when the note has one or more tags — AC-2
- [정상] NoteEditor - should save a note with no tags (`createNote` called with `tags: []`) without error — AC-3
- [정상] NoteEditor - should reopen a no-tag note showing only the placeholder (no chips, no error) — AC-3

---

## 3. AC 커버리지 대조

| AC                              | 커버 시나리오                                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **AC-1** (0개일 때 placeholder) | `ChipInput` should show placeholder when no tags; `NoteEditor` should show `태그 입력 후 Enter` when no tags |
| **AC-2** (1개 이상 숨김)        | `ChipInput` should hide placeholder when >=1 tag; `NoteEditor` should not show tag placeholder with tags     |
| **AC-3** (0개 노트 저장·표시)   | `NoteEditor` should save with `tags: []`; `NoteEditor` should reopen a no-tag note with placeholder only     |

✅ **모든 AC(3/3)가 최소 1개 이상의 시나리오로 커버됨 — 누락 0건.**

---

> 다음 단계: 이 문서를 입력으로 **TDD 구현**(Red→Green→Refactor). 시그니처는 위 §1 고정, 시나리오 §2가 테스트의 씨앗.
