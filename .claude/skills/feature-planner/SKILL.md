---
name: feature-planner
description: >
  하나의 feature를 "아이디어(spec)"에서 "개발 가능한 이슈 단위(issues + GitHub Issues)"로
  변환하는 기획 파이프라인. spec-fixed → PRD(ADR 포함) → 수직 슬라이스 이슈 분해를 승인
  게이트와 함께 진행한다. Use when 새 기능을 기획·정리하거나, 요구사항을 확정(spec-fixed)하거나,
  PRD/기술결정(ADR)을 작성하거나, 기능을 실행 가능한 이슈로 분해할 때.
  Triggers on requests like "기능 기획해줘", "feature 기획", "PRD 작성해줘", "이슈 분해해줘",
  "요구사항 확정", "spec 확정", "아키텍처 3안 비교", "feature planning", "break this into issues".
---

# Feature Planner

feature를 "아이디어 → 확정 요구사항 → 단일 기준 PRD → 실행 가능한 이슈"로 변환하는 3단계 파이프라인.
전 과정은 `docs/features/{name}/` 아래에서 진행한다. 상세 근거·질문 템플릿·비교 기준 전문은
[`docs/features/feature-planning-workflow.md`](../../../docs/features/feature-planning-workflow.md) 참조.

> **승인 게이트가 이 스킬의 핵심이다.** `[GATE]`마다 멈추고 사용자 확정을 받는다.
> 게이트를 건너뛰고 끝까지 달리지 않는다.

## 전체 흐름

```
spec.md ──①요구사항 인터뷰──▶ spec-fixed.md ──②PRD+ADR──▶ prd.md ──③이슈 분해──▶ issues.md + GitHub Issues
```

## Workflow

### 단계 1 — 요구사항 인터뷰

- **입력**: `docs/features/{name}/spec.md` + 코드베이스(기존 구조·패턴 탐색).
- AI가 **인터뷰어**가 되어 구현 전 확인 사항을 **한 번에 하나씩** 질문하고, 추천안을 이유와 함께 제시한다.
- 다룰 질문 영역: ①primary user ②최소 동작 시나리오 3개 ③데이터 저장 방식 ④경계 조건(최대값·빈값·중복·동시성) ⑤에러 처리 ⑥기존 UI 패턴 재사용 ⑦성능 제약 ⑧향후 확장.
- **Ubiquitous Language** 고정 → `spec-fixed.md`의 "용어 정의" 섹션으로 명시.
- **산출물**: `docs/features/{name}/spec-fixed.md`
- `[GATE]` 사용자가 spec-fixed.md를 읽고 확정할 때까지 대기.

### 단계 2 — PRD 작성 + 기술 결정(ADR)

- **입력**: `spec-fixed.md`, (있으면)`design.md`, 코드베이스.
- **2-1. PRD 뼈대** 생성(기술 결정은 TODO로 비움). 구조: **개요 / 사용자 스토리 / 기술 결정 / Out of Scope / 용어 정의**.
- **2-2. 아키텍처 3안 제안 & 비교** — 최소 3안을 아래 **7가지 고정 기준**으로 표 비교:
  1. 데이터 구조 2. API 레이어 변경지점 3. 상태관리 변경지점 4. 핵심 동작 5. 컴포넌트 구조 6. 기존 패턴과의 일관성 7. 테스트 용이성
  - `[GATE]` 사용자가 3안 중 하나를 **선택**할 때까지 대기.
- **2-3. 선택안을 ADR 4요소로** "기술 결정" 섹션에 작성:
  - **Context**(왜 필요한가) / **Decision**(무엇을 선택) / **Alternatives**(거부안 + **각각의 거부 이유 필수**) / **Consequences**(트레이드오프 — **단점도 반드시 명시**).
- **2-4. Out of Scope** 구체적으로 나열(미명시 시 AI가 범위 초과 구현함).
  - `[GATE]` 사용자가 Out of Scope를 읽고 확정할 때까지 대기.
- **산출물**: `docs/features/{name}/prd.md`

### 단계 3 — 이슈 분해

- **입력**: `prd.md`, GitHub 프로젝트 보드.
- **수직 슬라이싱 원칙**: "이 이슈만 완료하면 사용자에게 보여줄 동작이 있는가?" → Yes면 수직 슬라이스. **수평 슬라이싱(레이어별 API→Context→UI) 금지.**
- **이슈 크기**: 반나절~하루 안에 TDD 사이클(Red→Green→Refactor) 완료 가능.
- **의존성 순서**: 앞 이슈 결과가 다음 이슈 입력이 되도록 배치(역방향 개발 금지).
- 각 이슈에 **Given-When-Then** Acceptance Criteria 필수.
  ```markdown
  ## Acceptance Criteria

  - [ ] Given [사전 조건], When [행동], Then [기대 결과]
  ```
- `[GATE]` 사용자가 이슈 목록의 수직 슬라이스·AC·의존성 순서를 확인할 때까지 대기.
- **GitHub 등록**: `gh issue create --title "..." --body "설명 + AC + 의존성"` → 프로젝트 보드 Todo에 배치.
- **산출물**: `docs/features/{name}/issues.md` + GitHub Issues.

## 승인 게이트 요약

| 지점        | 확인 내용                                         |
| ----------- | ------------------------------------------------- |
| 단계 1 후   | spec-fixed.md — 모호성 제거, 용어 확정            |
| 단계 2-2 후 | 3가지 안 비교 — 사용자가 안을 선택                |
| 단계 2-4 후 | Out of Scope — 범위 확정                          |
| 단계 3 후   | 이슈 목록 — 수직 슬라이스, AC 구체성, 의존성 순서 |

## Guidelines / Constraints

- **각 `[GATE]`에서 반드시 멈춘다.** 사용자 확정 없이 다음 단계로 진행하지 않는다.
- 한 단계의 산출물 파일을 만든 뒤 다음 단계로 넘어간다(`spec-fixed.md → prd.md → issues.md` 순서 고정).
- ADR의 Alternatives는 **거부 이유 없이 적지 않는다**. Consequences는 **장점만 적지 않는다**(단점 필수).
- Out of Scope는 추상적으로 적지 않고 **구체 항목**으로 나열한다.
- 이슈는 수직 슬라이스만. 레이어 단위로 쪼개고 싶을 땐 "사용자 가치" 기준으로 다시 묶는다.

## Output

- `docs/features/{name}/spec-fixed.md`, `prd.md`, `issues.md`
- GitHub Issues (각 이슈에 Given-When-Then AC 포함) + 프로젝트 칸반 Todo 배치
