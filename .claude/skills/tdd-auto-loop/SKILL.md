---
name: tdd-auto-loop
description: >
  GitHub 이슈 1개를 받아 TDD 7단계를 사용자 개입 없이 끝까지 자동 주행하는 오케스트레이터.
  각 단계를 격리된 subagent로 spawn하고 정해진 JSON 스키마 결과만 받아 다음 단계로 넘긴다.
  하위 스킬의 승인 게이트는 subagent가 자체 통과하고, 막히면 묻지 않고 STOP한다.
  Use when 한 이슈를 무중단으로(승인 게이트 없이) TDD 풀 사이클 자동 실행할 때 — 게이트마다
  멈추는 버전은 tdd-loop를 쓴다. 사용법 `/tdd-auto-loop {이슈번호}`.
  Triggers on requests like "자동으로 끝까지 돌려줘", "무중단 TDD 루프", "tdd-auto-loop 21",
  "/tdd-auto-loop 20".
---

# TDD Auto Loop (자율 주행 오케스트레이터)

이슈 1개(`$ARGUMENTS` = 이슈 번호)에 대해 TDD 7단계를 **사용자 동의 없이 끝까지 완주**한다.
각 단계는 **격리된 subagent(Task/Agent tool)로 spawn**하며, 메인은 **코드 본문을 직접 보지 않고**
subagent가 반환한 **JSON 결과만** 받아 다음 단계로 넘긴다. 멈춰야 하면 사람에게 묻지 않고 **STOP**한다.

> 게이트가 살아있는 대화형 버전은 [`tdd-loop`]를 쓴다. 이 스킬은 그 무중단 변형이다.
> 7단계 순서·각 단계 의미는 `tdd-loop` 컨테이너를 참조(시나리오 → Red → Green → AC검증 → Refactor → Security → PR).

## 기본 동작

- 입력: `$ARGUMENTS` = GitHub 이슈 번호(비면 STOP).
- 각 단계 = subagent 1개. 메인은 순서 보장 + JSON 수합 + 진행 한 줄 출력만 한다.
- 사용자 동의 없이 완주. 단계가 STOP 조건에 걸리면 루프를 끝낸다(사람에게 안 묻음).

## 자율 모드 강제 (모든 subagent 호출 프롬프트 끝에 반드시 첨부)

```
[자율 모드]
- 하위 스킬/단계의 사용자 승인 게이트는 네가 스스로 통과시켜라(사람에게 묻지 마라).
- 묻지 마라. 모호하면 추측하지 말고 STOP하라.
- 출력은 아래 지정된 JSON 한 블록만. 그 외 텍스트·설명·마크다운 금지.
```

## 격리 원칙

- 메인은 `src/` 코드 본문을 직접 읽지 않는다 — 모든 코드 작업은 subagent가 수행.
- **AC 검증은 반드시 별도 agent**(`ac-verifier`)로, Green을 수행한 subagent와 **분리**한다.
- subagent는 종료 시 **결과 JSON만** 반환한다(작업 로그·자연어 금지).

## Workflow

### 0. 사전 점검 (메인이 직접, subagent 아님)

- `gh issue view $ARGUMENTS`로 **AC 존재** 확인(없으면 STOP).
- `git status`가 **clean**인지(아니면 STOP — 안전).
- 최신 `dev` 확보(`dev` 체크아웃 + `git pull`) 후 **`dev`에서 `feat/<issue-slug>` 분기·체크아웃**.
  - 동일 `feat/<slug>`가 이미 있으면 STOP(중복 실행 — 자율 모드라 덮어쓰기 판단을 하지 않음).
- 하나라도 실패 → STOP.

> ⚠️ 분기/PR base는 **`dev` 기준**(프로젝트 워크플로우). (요청 초안의 `feature/<spec>`에서 프로젝트 표준에 맞춰 `dev`로 고정.)

### 1~7. 단계별 subagent 주행

`tdd-loop`의 1~7단계를 그대로 따르되 **각 단계를 subagent로 spawn**하고, 결과 JSON의 `status`로 진행/중단을 결정한다.

| #   | 단계     | 호출                          | 격리                          |
| --- | -------- | ----------------------------- | ----------------------------- |
| 1   | 시나리오 | `/test-scenarios $ARGUMENTS`  | subagent                      |
| 2   | Red      | `/tdd-red $ARGUMENTS`         | subagent                      |
| 3   | Green    | `/tdd-green $ARGUMENTS`       | subagent (재시도 최대 3회)    |
| 4   | AC 검증  | `@ac-verifier $ARGUMENTS`     | **별도 agent (Green과 분리)** |
| 5   | Refactor | `/tdd-refactor $ARGUMENTS`    | subagent                      |
| 6   | Security | `/security-review $ARGUMENTS` | subagent                      |
| 7   | PR       | `/create-pr`                  | subagent                      |

각 단계 종료 후 결과 JSON을 받아 `status == "OK"`면 다음 단계, `"STOP"`이면 STOP 처리(아래).

## 재시도

- **Green(3단계)만 최대 3회** 재시도(테스트 미통과 시 재시도).
- 그 외 단계는 **결과 JSON이 schema 위반이면 1회 재시도** 후에도 위반이면 STOP.

## 단계별 결과 JSON 스키마 (예시값 — 변형 금지)

각 subagent는 정확히 아래 키 구조의 JSON 한 블록만 반환한다. 값은 예시이며 키·타입은 고정.

```json
// 1 scenarios
{ "step": "scenarios", "status": "OK", "scenario_count": 14, "ac_covered": true, "artifacts": ["docs/features/<feat>/issue-20.md"], "stop_reason": null }
// 2 red
{ "step": "red", "status": "OK", "test_files": ["src/hooks/useX.test.ts"], "failing_count": 14, "stop_reason": null }
// 3 green
{ "step": "green", "status": "OK", "impl_files": ["src/hooks/useX.ts"], "passing": 80, "total": 80, "attempts": 1, "stop_reason": null }
// 4 ac-verify
{ "step": "ac-verify", "status": "OK", "ac_passed": true, "gaps": [], "stop_reason": null }
// 5 refactor
{ "step": "refactor", "status": "OK", "changed": false, "notes": "클린", "stop_reason": null }
// 6 security
{ "step": "security", "status": "OK", "tsc_clean": true, "audit_high_critical": 0, "env_exposed": false, "stop_reason": null }
// 7 pr
{ "step": "pr", "status": "OK", "pr_url": "https://github.com/o/r/pull/23", "closes": 20, "commitlint_ok": true, "stop_reason": null }
```

STOP 시에는 동일 스키마에서 `status: "STOP"` + `stop_reason: "<사유>"`로 반환한다.

## STOP 조건 (단계별)

- **0**: AC 없음 / 작업트리 dirty / base 분기 실패 / `feat/<slug>` 이미 존재.
- **3 Green**: 3회 재시도 후에도 테스트 미통과(`attempts == 3 && passing < total`).
- **4 AC**: `ac_passed == false`(갭 존재).
- **6 Security**: `audit_high_critical > 0` 또는 `tsc_clean == false` 또는 `env_exposed == true`(🔴 존재).
- **7 PR**: commitlint 실패 또는 E2E 실패(`commitlint_ok == false` 등).
- **공통**: 결과 JSON schema 위반이 1회 재시도 후에도 지속.

## STOP 처리

STOP이면 **사람에게 묻지 않고** 다음을 수행하고 루프를 종료한다:

- 메인 세션에 STOP 로그(어느 단계·사유).
- `gh issue comment $ARGUMENTS`로 STOP 단계·사유 코멘트.
- 루프 종료(이후 단계 실행 안 함).

## 리포트 / 진행 표시

- 진행 메시지는 단계마다 **한 줄**: `[<단계명>] OK` 또는 `[<단계명>] STOP(<사유>)`.
- 완주/중단 후 메인 세션에 **단계별 결과 JSON을 모은 요약**을 본 세션 리포트로 출력.

## Guidelines / Constraints

- **사람에게 묻지 않는다.** 게이트는 subagent가 자체 통과, 막히면 STOP.
- **메인은 코드 본문 비열람** — 모든 구현/수정은 subagent.
- **AC 검증 agent는 Green agent와 반드시 분리.**
- 분기/PR base는 **`dev`**. PR body에 `Closes #$ARGUMENTS`.
- 입력은 이슈 번호(`$ARGUMENTS`).

## Output

- 완주 시: `dev` base PR(`Closes #$ARGUMENTS`) + 단계별 결과 JSON 요약.
- 중단 시: STOP 단계·사유(메인 로그 + 이슈 코멘트).
