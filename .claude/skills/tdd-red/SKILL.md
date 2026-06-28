---
name: tdd-red
description: >
  승인된 테스트 시나리오(issue-{N}.md)를 **실패하는 테스트 코드**로 작성하는 TDD "Red"
  단계 스킬. 시그니처만 있고 구현이 없는 상태에서 시나리오를 Vitest + React Testing Library
  테스트로 옮기고, 작성 즉시 실행해 실패를 확인한다. 구현 코드는 절대 건드리지 않는다.
  Use when 도출된 테스트 시나리오를 실패 테스트로 옮기거나, TDD Red 단계를 진행하거나,
  이슈의 시나리오를 테스트 코드화할 때. 사용법 `/tdd-red {이슈번호}`.
  Triggers on requests like "실패 테스트 작성해줘", "tdd red 진행해줘", "시나리오를 테스트로 만들어줘",
  "write failing tests for issue N", "/tdd-red 6".
---

# TDD Red드

`test-scenarios` 스킬이 산출한 `docs/features/tag/issue-{N}.md`(시그니처 + 승인된 시나리오)를
입력으로, 각 시나리오를 **실패하는 테스트 코드**로 옮긴다. TDD 사이클의 Red — 구현은 없고
테스트만 존재해 전부 실패하는 상태를 만드는 것이 목표다.

- **입력**: 이슈 번호 `$ARGUMENTS` (예: `/tdd-red 6`).
- **산출물**: 테스트 파일(`*.test.ts` / `*.test.tsx`)만. **구현 코드(`src/`)는 작성·수정하지 않는다.**
- **도구**: Vitest + React Testing Library (`npm test` = `vitest run`).

## Workflow

### 1. 시나리오·시그니처 읽기

`docs/features/tag/issue-{N}.md`에서 **§1 확정 시그니처**와 **§2 테스트 시나리오**를 읽는다.
시그니처(함수명·파라미터·반환·Props 타입)는 테스트가 기대할 인터페이스의 근거다.

### 2. 시나리오를 하나씩 테스트로 작성

시나리오 1건 = 테스트 1건. 순서대로 옮긴다.

- 테스트 이름: `should [기대 동작] when [조건]` 형식(시나리오 문구를 그대로 반영).
- `describe` 블록은 **함수/컴포넌트 단위**로 묶는다. 예: `describe('addTag', () => { it('should ...') })`.
- Vitest + React Testing Library 사용. 컴포넌트는 `render`/`screen`/`userEvent`, 훅은 `renderHook`.

### 3. 작성 즉시 실행 → 실패 확인 → 다음으로

한 시나리오를 쓸 때마다 해당 파일만 실행해 **실패(또는 모듈 미존재)**를 확인한 뒤 다음 시나리오로 넘어간다.

```bash
npx vitest run <테스트파일경로>
```

실패 이유가 "기대 단언 불일치" 또는 "아직 없는 모듈/함수"임을 확인한다(이게 정상적인 Red).

### 4. 전체 실행 → 전부 실패 확인

모든 시나리오를 옮긴 뒤 전체를 돌려 **새로 작성한 테스트가 모두 실패**하는지 확인한다.

```bash
npm test
```

## 테스트 파일 컨벤션

- **위치**: 테스트 대상 파일과 **같은 디렉터리**(colocated).
  - `src/hooks/useTagInput.ts` → `src/hooks/useTagInput.test.ts`
  - `src/components/ChipInput.tsx` → `src/components/ChipInput.test.tsx`
- **네이밍**: `{파일명}.test.ts` / `{파일명}.test.tsx`.
- **describe**: 함수/컴포넌트 단위로 그룹화. 시나리오 분류(정상/경계/예외)는 `it` 단위로 표현.

## Guidelines / Constraints

- **테스트 파일만 생성/수정한다.** `src/`의 구현 코드는 **절대 수정 금지**(Red 단계이므로 구현이 없거나 미완인 게 정상).
- 새 테스트는 **반드시 실패**해야 한다 — 통과하면 시나리오가 잘못됐거나 구현이 이미 있다는 뜻이니 점검한다.
- 시나리오에 없는 케이스를 임의로 추가하지 않는다(시나리오 = 단일 출처). 누락 발견 시 `test-scenarios`로 되돌아가 보강한다.
- 시그니처(`issue-{N}.md` §1)를 그대로 따른다 — 테스트가 기대하는 함수명·인자·Props를 발명하지 않는다.
- 입력은 이슈 번호(`$ARGUMENTS`). 산출물 경로는 `docs/features/tag/issue-{N}.md` 기준.

## Output

- 콜로케이션된 테스트 파일(`*.test.ts` / `*.test.tsx`) — 시나리오를 1:1로 옮긴 실패 테스트.
- `npm test` 결과: 새 테스트 전부 실패(Red) 확인.
- 다음 단계: 이 실패 테스트를 통과시키는 **최소 구현(Green)** → 리팩터링(Refactor).
