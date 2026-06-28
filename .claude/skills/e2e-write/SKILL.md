---
name: e2e-write
description: >
  하나의 기능에 대해 `docs/features/{기능명}/prd.md`의 **사용자 스토리(US)** 를 읽어
  Playwright **E2E 테스트 코드**로 변환하는 스킬. 단위 테스트가 이미 검증하는 로직 분기는
  중복하지 않고, 컴포넌트·실제 백엔드·브라우저를 가로지르는 **사용자 여정**만 골라
  `e2e/{기능명}.spec.ts`에 작성하고 실행해 통과를 확인한다.
  Use when 특정 기능의 PRD를 E2E 시나리오로 바꾸거나, Playwright E2E 테스트를 작성하거나,
  사용자 스토리 기반 통합 테스트를 만들 때. 사용법 `/e2e-write {기능명}`.
  Triggers on requests like "E2E 테스트 작성해줘", "e2e 시나리오 만들어줘",
  "PRD로 e2e 짜줘", "write e2e tests for {feature}", "/e2e-write tag".
---

# E2E Write

기능 한 건의 PRD 사용자 스토리를 입력받아 **E2E로 검증할 여정 선별 → 시나리오 도출 →
Playwright 스펙 작성 → 실행 검증**을 순서대로 처리한다.

- **입력**: 기능명 `$ARGUMENTS` (예: `/e2e-write tag` → `docs/features/tag/prd.md`).
- **산출물**: `e2e/{기능명}.spec.ts` (필요 시 `e2e/fixtures/seed.json` 시드 보강).
- **전제**: Playwright 격리 환경이 이미 셋업되어 있다. 규칙은
  [`references/e2e-best-practices.md`](references/e2e-best-practices.md) 참조 — **스펙을 쓰기
  전에 반드시 읽는다.**

> **승인 게이트가 1곳 있다(3단계 시나리오).** 시나리오를 승인받은 뒤에만 코드를 작성한다.

## Workflow

### 1. PRD + 단위 테스트 인벤토리 읽기

- `docs/features/{기능명}/prd.md`의 **2. 사용자 스토리(US 표)** 와 **4. Out of Scope**를 읽는다.
- `src/**/*.test.{ts,tsx}`를 훑어 **이미 단위 테스트가 검증하는 것**을 목록화한다
  (훅 로직 분기·컴포넌트 단위 동작·Context 액션). 이게 "중복 금지"의 기준선이다.

### 2. E2E 여정 선별 (중복 제거)

각 US를 분류한다:

- **E2E로 검증** — 여러 컴포넌트 + **실제 백엔드 영속화** + 브라우저 상호작용을 가로지르는
  사용자 여정(예: "노트 열기 → 태그 추가 → 저장 → 새로고침 → 유지됨" 같은 라운드트립).
- **단위에 위임(E2E 생략)** — 검증 규칙의 분기 전수(길이·개수·대소문자·trim 등)는 단위 책임.
  E2E에선 **대표 1경로만** 훑거나 아예 다루지 않는다.
- **Out of Scope** — PRD가 제외한 항목은 시나리오로 만들지 않는다.

US ↔ 시나리오 매핑 표를 만들고, 각 항목에 `E2E / 단위위임 / OoS` 사유를 단다.

### 3. 시나리오 검토 — `[GATE]`

선별된 E2E 시나리오 목록(여정 단위, Given–When–Then)과 US 매핑 표를 개발자에게 보여주고
**승인**을 받는다. 승인 전 코드를 쓰지 않는다.

### 4. 스펙 작성

[`references/e2e-best-practices.md`](references/e2e-best-practices.md)를 따라
`e2e/{기능명}.spec.ts`를 작성한다. 핵심:

- 역할/접근성·텍스트 기반 로케이터(`getByRole`/`getByLabel`/`getByPlaceholder`/`getByText`),
  CSS/XPath·클래스 셀렉터 금지.
- web-first assertion(`await expect(locator).toBeVisible()` 등)으로 auto-wait. 수동 `waitForTimeout` 금지.
- 각 테스트는 **독립**(자체 상태 준비, 순서 비의존). 여정은 `test.step`으로 구조화.
- 시드가 더 필요하면 `e2e/fixtures/seed.json`을 보강한다(테스트가 임시 db만 건드리도록 격리 유지).

### 5. 실행 검증

`npm run test:e2e`로 돌려 **전부 통과**를 확인한다. 실패하면 셀렉터/대기/시드를 고쳐
초록이 될 때까지 반복한다(테스트 의도는 바꾸지 않는다).

### 6. 보고

작성한 스펙 경로, 시나리오 수, US 커버리지(어떤 US를 E2E/단위위임/OoS로 처리했는지),
실행 결과를 요약한다.

## Guidelines / Constraints

- **단위 테스트와 중복 금지.** 같은 분기를 단위·E2E 양쪽에서 검증하지 않는다 — E2E는
  "단위가 못 보는 통합·영속화·여정"만.
- **PRD가 단일 출처.** US에 없거나 Out of Scope인 동작은 테스트하지 않는다.
- **3단계 `[GATE]`에서 멈춘다.** 시나리오 승인 없이 코드 작성 금지.
- **격리 인프라를 깨지 않는다** — 실 `db.json`·운영 포트(3003/5173)를 건드리지 않고,
  `seed.json` + 임시 db만 사용한다.
- 구현 코드(`src/`)는 수정하지 않는다. 이 스킬의 산출물은 E2E 스펙(+필요 시 시드)뿐이다.

## Output

- `e2e/{기능명}.spec.ts` — 사용자 여정 단위 Playwright 테스트.
- (선택) `e2e/fixtures/seed.json` 시드 보강분.
- 다음 단계: `npm run test:e2e`로 회귀 검증, CI 파이프라인 편입.
