# Issue #10 — TAG-5: 입력 검증 (trim·최대 15자·최대 10개)

> [`prd.md`](./prd.md) · GitHub 이슈 [#10](https://github.com/jeon0428k/ccwork/issues/10) 기반.
> 이 문서는 **TDD 구현 직전 입력**이다. 상단=확정 시그니처, 하단=테스트 시나리오 + AC 커버리지.
> 구현 코드·테스트 코드는 포함하지 않는다. 의존: TAG-1(#6, 머지됨). TAG-4 dedup 게이트 위에 trim·길이·개수 규칙을 얹어 ADR-4 게이트를 완성.

---

## 1. 확정 시그니처

### 1.1 커스텀 훅 — `src/hooks/useTagInput.ts` (내부 로직만 확장, 시그니처 불변)

```ts
const MAX_TAG_LENGTH = 15; // 1개 태그 최대 길이
const MAX_TAGS = 10; // 노트당 최대 태그 개수

interface UseTagInput {
  tags: string[];
  addTag: (raw: string) => void; // ⬅ 시그니처 불변. 내부 게이트 확장(trim·15자·10개)
  removeTag: (tag: string) => void;
  removeLast: () => void;
  reset: (tags: string[]) => void;
}
```

- **TAG-5는 새 함수·새 prop을 추가하지 않는다.** `addTag` 내부 게이트를 ADR-4 순서로 완성:
  1. `const value = raw.trim()` — 앞뒤 공백 제거
  2. **빈값 차단**: `if (!value) return` (공백만 입력 시 미추가)
  3. **길이 차단**: `if (value.length > MAX_TAG_LENGTH) return` (15자 초과 미추가)
  4. **중복 차단(TAG-4)**: `prev.some((t) => t.toLowerCase() === value.toLowerCase())` 이면 무시 — 이제 **trim된 `value` 기준** 비교(`'  react  '`도 `React`의 중복으로 판정)
  5. **개수 차단**: `if (prev.length >= MAX_TAGS) return` (10개 도달 시 미추가)
  6. 통과 시 **trim된 `value`** 저장(`[...prev, value]`) — 원본 표기는 보존하되 공백만 제거
- 모든 차단은 **조용히 무시**(throw·메시지 없음). input 비움은 `ChipInput.commit`의 기존 동작.

### 1.2 컴포넌트 Props — `src/components/ChipInput.tsx` (시그니처 불변, input 속성만 추가)

- `<input>`에 **`maxLength={15}`** 추가 — 16번째 문자 타이핑 자체를 차단(AC-3의 "15자에서 멈춤"). Props 인터페이스 변화 없음.
- `commit()`의 빈값 가드(`if (!text) return`)는 유지하되, 공백만(`'   '`)은 통과해 `addTag`가 trim 후 차단(역할 분담: 길이/공백 의미 판정은 훅).

### 1.3 NoteEditor / Context / API — **무변경**

### 1.4 에러 정책

- TAG-5는 **신규 throw를 도입하지 않는다.** 모든 경계 위반은 조용히 무시.
- 유니코드 정규화/전각 공백 등은 비대상(ADR-4 한도). `trim()`은 표준 공백만 처리.

---

## 2. 테스트 시나리오

> 형식: `[정상/경계/예외] 함수(유닛)명 - should [기대동작] when [조건]`
> 범위는 TAG-5 AC 한정(trim·15자·10개).

### 2.1 `useTagInput.addTag` (경계 게이트)

- [경계] addTag - should not add a tag when the value is only whitespace (`'   '` → `[]`) — AC-1
- [정상] addTag - should store the trimmed value when the input is surrounded by whitespace (`'  React  '` → `['React']`) — AC-2
- [경계] addTag - should treat a whitespace-padded value as a duplicate of an existing tag (`['React']` + `'  react  '` → `['React']`, length 1) — trim+중복 결합
- [경계] addTag - should not add a tag longer than 15 characters (16자 → `[]`) — AC-3(로직)
- [경계] addTag - should add a tag of exactly 15 characters (15자 → 추가됨) — 경계값
- [경계] addTag - should not add an 11th tag when 10 already exist (length 유지 10) — AC-4
- [경계] addTag - should add the 10th tag when 9 already exist (length 10) — 경계값

### 2.2 `ChipInput` (입력 길이 차단)

- [경계] ChipInput - should cap the text input at 15 characters via `maxLength` (input에 `maxLength=15` 적용) — AC-3(입력)

### 2.3 `NoteEditor` (통합)

- [정상] NoteEditor - should render the trimmed chip `React` (not `  React  `) when a padded value is entered — AC-2 통합

---

## 3. AC 커버리지 대조

| AC                                | 커버 시나리오                                                                                          |
| --------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **AC-1** (공백 trim 후 빈값 차단) | `addTag` should not add when value is only whitespace                                                  |
| **AC-2** (앞뒤 공백 제거 저장)    | `addTag` should store the trimmed value; `NoteEditor` should render the trimmed chip `React`           |
| **AC-3** (최대 15자 입력 차단)    | `ChipInput` should cap input at 15 via `maxLength`; `addTag` should not add >15 chars; exactly-15 경계 |
| **AC-4** (최대 10개 추가 차단)    | `addTag` should not add an 11th tag; add-10th 경계                                                     |

✅ **모든 AC(4/4)가 최소 1개 이상의 시나리오로 커버됨 — 누락 0건.**

---

> 다음 단계: 이 문서를 입력으로 **TDD 구현**(Red→Green→Refactor). 시그니처는 위 §1 고정, 시나리오 §2가 테스트의 씨앗.
