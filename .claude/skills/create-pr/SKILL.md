---
name: create-pr
description: >
  현재 브랜치의 변경사항을 요약해 PR 초안을 만들고, 개발자 승인 → E2E 통과 확인을 거쳐
  git push + gh pr create로 PR을 생성하는 워크플로우. Use when 사용자가 현재 작업을
  PR로 올리려 하거나, 브랜치를 머지 준비 상태로 만들 때. E2E가 실패하면 PR을 만들지 않고
  근본 원인 진단 절차를 안내한다.
  Triggers on requests like "PR 만들어줘", "PR 올려줘", "PR 보내줘", "이거 머지하자",
  "create-pr", "/create-pr".
---

# Create PR

현재 브랜치의 변경사항을 PR로 올리는 절차를 자동화한다. **초안 승인 게이트**와 **E2E 통과 게이트**
두 개를 반드시 통과해야 PR이 생성된다. E2E를 우회하거나 E2E 코드를 고쳐 통과시키는 것은 금지한다.

## Workflow

### 0. 사전 점검

- 현재 브랜치를 확인한다(`git rev-parse --abbrev-ref HEAD`). `main` 또는 `dev`에서 직접 PR을
  올리려 하면 **중단**하고, 작업 브랜치로 옮길 것을 안내한다.
- 변경사항이 있는지 확인한다. 커밋되지 않은 변경(`git status`)이 있으면 먼저 커밋이 필요함을 알린다.
  - 커밋이 필요하면 **Conventional Commits**(`<type>: <제목>` + 본문 최소 2줄)를 지켜 커밋한다.
    type: `feat|fix|chore|refactor|test|docs|style`. (pre-commit으로 lint-staged·commitlint 동작)
- 원격에 푸시할 커밋이 있는지(`git log --oneline origin/dev..HEAD` 또는 upstream 기준) 확인한다.

### 1. PR 초안 생성

- 베이스 브랜치(`dev`) 대비 diff를 요약한다:
  `git log --oneline dev..HEAD` 와 `git diff dev...HEAD --stat`.
- 이를 바탕으로 **제목**(Conventional Commits 스타일 권장, 예: `feat: 태그 필터링`)과
  **본문**(요약 / 주요 변경 / 테스트 노트)을 작성한다.

### 2. 승인 게이트 (수정 가능)

- 생성한 초안(제목·본문)을 개발자에게 보여주고 **승인을 요청한다**.
- 수정 요청이 있으면 반영 후 다시 보여준다. **명시적 승인 전에는 다음 단계로 넘어가지 않는다.**

### 3. E2E 실행

- 승인되면 `npm run test:e2e`를 실행한다(Playwright. 격리 fixture db + 전용 포트로 자동 기동).

### 4. E2E 실패 시 — PR 생성 중단

PR을 **만들지 않고** 다음 진단 절차를 출력하고 멈춘다:

1. **Trace Viewer / 리포트 확인** — `npx playwright show-report`로 실패 지점을 본다.
   (trace는 `on-first-retry` 설정이라 로컬에서 trace가 없으면 `npx playwright test --retries=1`로 재현)
2. **레이어 판별** — 어디서 깨졌는지 식별:
   - **API**: `src/api/notes.ts` (fetch/CRUD, 타임스탬프)
   - **렌더링**: `src/components/*` (NoteList, NoteItem, NoteEditor, Layout)
   - **로직/상태**: `src/context/NotesContext.tsx`, 훅
3. **단위 테스트에 케이스 추가 (Red)** — 해당 레이어의 `*.test.ts(x)`에 실패를 재현하는 케이스를 추가.
4. **프로덕션 코드 수정 (Green)** — 단위 테스트를 통과시킨 뒤 다시 `/create-pr`.

> ⚠ **E2E 코드(`e2e/*.spec.ts`)를 고쳐 통과시키는 것은 금지.** 근본 원인 회피이며,
> E2E가 가리키는 실제 버그는 단위 테스트 → 프로덕션 코드 수정으로 해결한다.

### 5. E2E 통과 시 — PR 생성

- `git push -u origin <현재 브랜치>`.
- `gh pr create --base dev --title "<제목>" --body "<본문>"`.
  - 베이스는 항상 `dev`(이 프로젝트의 통합 브랜치). `main`을 베이스로 하지 않는다.
- 생성된 PR URL을 보고한다.

## Guidelines / Constraints

- **두 게이트는 건너뛸 수 없다**: 초안 승인 없이 E2E를 돌리지 않고, E2E 통과 없이 PR을 만들지 않는다.
- PR 베이스는 **`dev`** (CLAUDE.md의 TDD 이슈 사이클 워크플로우 기준).
- E2E 실패는 **프로덕션 코드의 신호**로 다룬다. E2E 테스트 자체를 완화/수정하지 않는다.
- 커밋 메시지·PR 제목은 Conventional Commits를 따른다.

## Output

- PR 본문 끝에 다음 한 줄을 붙인다:

  ```
  🤖 Generated with [Claude Code](https://claude.com/claude-code)
  ```

- 최종 산출물: `dev`를 베이스로 한 GitHub PR. 완료 후 PR URL을 보고한다.
