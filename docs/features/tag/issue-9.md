# Issue #9 — TAG-4: 중복 태그 방지 (대소문자 무시)

> [`prd.md`](./prd.md) · GitHub 이슈 [#9](https://github.com/jeon0428k/ccwork/issues/9) 기반.
> 이 문서는 **TDD 구현 직전 입력**이다. 상단=확정 시그니처, 하단=테스트 시나리오 + AC 커버리지.
> 구현 코드·테스트 코드는 포함하지 않는다. 의존: TAG-1(#6, 머지됨).

---

## 1. 확정 시그니처

### 1.1 커스텀 훅 — `src/hooks/useTagInput.ts` (내부 로직만 확장, 시그니처 불변)

```ts
interface UseTagInput {
  tags: string[];
  addTag: (raw: string) => void; // ⬅ 시그니처 불변. 내부에 대소문자 무시 중복 게이트 추가
  removeTag: (tag: string) => void;
  removeLast: () => void;
  reset: (tags: string[]) => void;
}
```

- **TAG-4는 새 함수·새 prop을 추가하지 않는다.** `addTag` 내부 동작만 확장:
  - 기존 빈값 가드(`if (!raw) return`) 유지.
  - **대소문자 무시 중복 검사**: `tags.some((t) => t.toLowerCase() === raw.toLowerCase())` 이면 **조용히 무시**(append 안 함, throw 없음).
  - 중복이 아니면 **원본 표기 그대로** 저장(`React` 입력 → `React` 보관, 소문자화 안 함 / ADR-4).
- **비교는 `toLowerCase()`만 사용**(trim은 TAG-5 범위). TAG-4 AC엔 공백 케이스가 없어 trim 불필요 — 슬라이스 경계 유지. 최종(ADR-4) `trim().toLowerCase()`는 TAG-5에서 trim 게이트와 함께 완성.
- 게이트 순서(ADR-4 최종): trim → 빈값 → 길이15 → **중복(TAG-4)** → 개수10. 이번 슬라이스는 빈값 + 중복만.

### 1.2 컴포넌트 — `src/components/ChipInput.tsx`, `NoteEditor.tsx` — **무변경**

- `ChipInput.commit()`은 이미 확정 시 `onAddTag(text)` 위임 후 `setText('')`로 **무조건 input을 비운다**. 중복이라 훅이 무시해도 input은 비워진다(AC-1의 "input만 비워진다"는 기존 동작으로 충족).
- `NoteEditor`의 `addTag` 배선·저장 경로(`createNote`/`updateNote`) 모두 그대로. 원본 표기가 메모리 배열에 남아 저장되므로 재오픈 시 원본 표기 유지(AC-3).

### 1.3 Context / API — **무변경**

### 1.4 에러 정책

- TAG-4는 **신규 throw를 도입하지 않는다.** 중복은 조용히 무시(input만 비움).
- 유니코드 케이스폴딩/전각 공백 등은 비대상(ADR-4 한도).

---

## 2. 테스트 시나리오

> 형식: `[정상/경계/예외] 함수(유닛)명 - should [기대동작] when [조건]`
> 범위는 TAG-4 AC 한정(대소문자 무시 중복 방지). trim·길이·개수는 TAG-5.

### 2.1 `useTagInput.addTag` (중복 게이트)

- [정상] addTag - should not add a duplicate tag with identical casing (`[React]` + `addTag('React')` → `[React]`)
- [정상] addTag - should not add a duplicate that differs only in case (`[React]` + `addTag('react')` → length 1)
- [정상] addTag - should preserve the existing original casing when a case-variant is attempted (`[React]` + `addTag('react')` → tags stay `['React']`, not `['react']`)
- [정상] addTag - should add a non-duplicate tag normally (`[React]` + `addTag('Vue')` → `[React, Vue]`)
- [경계] addTag - should compare case-insensitively for any case form (`[React]` + `addTag('REACT')` → `[React]`)

### 2.2 `NoteEditor` (통합 — input 비움 / 원본 저장)

- [정상] NoteEditor - should keep a single chip and clear the input when the same tag is entered twice (`React`+Enter, `React`+Enter → 칩 `React` 1개, input 비어있음) — AC-1
- [정상] NoteEditor - should persist the original casing `React` (not lowercased) when saving after entering `React` (`createNote` called with `tags: ['React']`) — AC-3

---

## 3. AC 커버리지 대조

| AC                              | 커버 시나리오                                                                                                                       |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **AC-1** (동일 표기 중복)       | `addTag` should not add identical-casing duplicate; `NoteEditor` should keep a single chip and clear input                          |
| **AC-2** (대소문자만 다른 중복) | `addTag` should not add case-only duplicate; `addTag` should preserve existing original casing; `addTag` compare case-insensitively |
| **AC-3** (원본 표기 보존)       | `addTag` should preserve existing original casing; `NoteEditor` should persist original casing `React` on save                      |

✅ **모든 AC(3/3)가 최소 1개 이상의 시나리오로 커버됨 — 누락 0건.**

---

> 다음 단계: 이 문서를 입력으로 **TDD 구현**(Red→Green→Refactor). 시그니처는 위 §1 고정, 시나리오 §2가 테스트의 씨앗.
