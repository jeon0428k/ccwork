# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

React 19 + TypeScript + Vite 기반 노트 앱 실습 프로젝트. JSON Server를 로컬 REST API 백엔드로 사용한다.

- 앱: http://localhost:5173
- API: http://localhost:3003/notes

## 주요 명령어

```bash
npm run dev        # Vite + JSON Server 동시 실행 (concurrently)
npm run server     # JSON Server만 단독 실행
npm run build      # tsc + vite build
npm run lint       # ESLint --fix
npm run format     # Prettier --write
npm test           # vitest run (1회 실행)
npm run test:watch # vitest (watch 모드)
```

## 아키텍처

```
src/
├── types/note.ts          # Note 인터페이스 (id, title, content, createdAt, updatedAt)
├── api/notes.ts           # fetch 기반 CRUD 함수 (API_URL=http://localhost:3003)
├── context/NotesContext.tsx  # 전역 상태: notes[], loading, error + addNote/editNote/removeNote
├── components/
│   ├── Layout.tsx         # sidebar + main 슬롯을 받는 레이아웃
│   ├── NoteList.tsx       # 노트 목록, 선택 상태 관리
│   ├── NoteItem.tsx       # 개별 노트 항목
│   └── NoteEditor.tsx     # 노트 생성/편집 폼
└── App.tsx                # selectedNoteId, isCreating 상태 — NotesProvider 루트
```

**데이터 흐름**: `App` → `NotesProvider`(Context) → 컴포넌트. 모든 API 호출은 `context/NotesContext.tsx`에서만 수행하고, 컴포넌트는 `useNotes()` 훅을 통해 데이터에 접근한다.

**백엔드**: `db.json`이 JSON Server의 데이터 소스. `src/api/notes.ts`는 순수 fetch 함수만 포함하며, 타임스탬프(`createdAt`, `updatedAt`) 세팅도 여기서 처리한다.

## 디자인 시스템

**모든 스타일/UI 작업은 "Sanctuary Archive" 디자인 시스템을 따른다.** 정본은 [`docs/design-system/`](docs/design-system/), 작업 시 `design-system` 스킬이 자동 발동해 작업 유형에 맞는 조각만 읽도록 라우팅한다. 토큰·컴포넌트 스펙·Do/Don't는 모두 그 문서에 있으므로 여기 중복하지 않는다.

- 핵심 원칙: **Editorial Serif**(Playfair Display + Source Serif 4, 한글은 Noto Serif KR 폴백) · **Warm Parchment**(어스톤, 순수 검정·순백 회피) · **Tonal & Letterpress Depth**(흐릿한 그림자 대신 톤 레이어 + 음각) · **Analog Object**(여백 프레임).
- **자동 검사**: `.tsx/.jsx/.ts/.css/.scss` 저장 시 PostToolUse hook(`.claude/hooks/design-system-check.sh`)이 `dont.md` 위반을 검사한다 — 순수 검정·흐릿한 그림자·`rounded-3xl`은 차단(exit 2), 중성 그레이·산세리프 등은 경고. `.claude/settings.json`에 등록되어 별도 설정 없이 동작한다.

## 구현 패턴

### 컴포넌트

- **named export** 사용 (`export function ComponentName`). `App.tsx`만 예외적으로 default export.
- Props 타입은 컴포넌트 바로 위에 `interface ${ComponentName}Props`로 정의하고 파라미터에서 직접 destructuring.
- 상태에 따른 early return(loading, error, empty)을 JSX 앞에 배치.

### 상태 관리 (3계층 분리)

| 계층         | 위치           | 내용                           |
| ------------ | -------------- | ------------------------------ |
| 서버 상태    | `NotesContext` | `notes[]`, `loading`, `error`  |
| UI 상태      | `App.tsx`      | `selectedNoteId`, `isCreating` |
| 폼 로컬 상태 | `NoteEditor`   | `title`, `content`, `saving`   |

컴포넌트는 직접 API를 호출하지 않는다. 반드시 `useNotes()` 훅을 통해 Context 함수를 사용한다.

### API 호출

- `src/api/notes.ts`는 순수 fetch 함수만 담는다. 상태 변경 없음.
- 에러 처리: `!res.ok`이면 `throw new Error(메시지)`.
- Context에서 API 호출 후 응답값으로 `setNotes`를 즉시 갱신 (낙관적 업데이트 없음).

### 네이밍

- 이벤트 핸들러 prop: `on` + PascalCase (`onSelect`, `onDelete`, `onDone`)
- 이벤트 핸들러 함수: `handle` + PascalCase (`handleSave`, `handleSelectNote`)
- boolean prop: `is` + PascalCase (`isSelected`, `isCreating`)
- API 함수: `fetchNotes`, `createNote`, `updateNote`, `deleteNote`
- Context 노출 함수: `createNote`, `updateNote`, `deleteNote` (API와 동일 동사)

## ⚠️ 알려진 이슈

- **useEffect 의존성 누락**: `NoteEditor`의 useEffect가 `eslint-disable`로 deps 경고를 억제 중 (`NoteEditor.tsx:27`).

## 커밋 규칙

Conventional Commits 형식을 강제한다 (commitlint + husky).

```
<type>: <제목>

<본문 — 최소 2줄>
```

- **type**: `feat` | `fix` | `chore` | `refactor` | `test` | `docs` | `style`
- 제목 필수, 본문 필수 (비어있거나 1줄이면 커밋 차단)
- pre-commit: lint-staged로 staged `.ts/.tsx` 파일에 ESLint + Prettier 자동 실행

## 테스트 환경

- Vitest + jsdom + @testing-library/react
- `src/test-setup.ts`에서 jest-dom matchers 설정
- 테스트 실행 전 JSON Server가 필요 없도록 API는 모킹해서 사용

## TDD 이슈 사이클 (워크플로우)

새 이슈 작업은 **반드시 다음 순서**로 진행한다. Claude는 이 흐름을 인지하고, 현재 단계가 끝나면 **다음 단계를 제안**한다.

| #   | 단계                                                                    | 도구  | 산출물                                                     |
| --- | ----------------------------------------------------------------------- | ----- | ---------------------------------------------------------- |
| 1   | `/test-scenarios N`                                                     | skill | 시그니처 + 시나리오 (`docs/features/{feature}/issue-N.md`) |
| 2   | `/tdd-red N`                                                            | skill | 실패 테스트 작성 (`*.test.ts(x)`)                          |
| 3   | `/tdd-green N`                                                          | skill | 최소 구현, 테스트 전체 통과                                |
| 4   | `@ac-verifier N`                                                        | agent | AC 충족 독립 검증 (**테스트 통과 ≠ AC 충족**)              |
| 5   | `/tdd-refactor N`                                                       | skill | 구조 개선, 깨지면 즉시 롤백                                |
| 6   | `/security-review N`                                                    | skill | 타입·보안 점검 (tsc·npm audit·env)                         |
| 7   | commit → PR `--base dev` → squash merge → 이슈 클로즈                   | —     | 분리 커밋(docs/test/feat) 권장                             |
| 8   | 머지 후 정리: `dev` 체크아웃 → `git pull` → 작업 브랜치 삭제(로컬·원격) | —     | 다음 이슈는 최신 `dev`에서 분기                            |

### 흐름 제어 규칙 (Claude 행동 지침)

- **각 단계는 인간 승인 게이트가 있다. 자동으로 다음 단계로 넘어가지 말 것.** 한 단계를 마치면 결과를 보고하고 다음 단계를 **제안**한 뒤 사용자의 지시를 기다린다.
- 단계 내부의 게이트(`test-scenarios`의 시그니처/시나리오 승인, `tdd-refactor`/`security-review`의 수정 승인 등)도 동일하게 멈춘다.
- 사용자가 단계를 건너뛰거나 순서를 바꾸려 하면, 그 영향을 짚어준 뒤 사용자 결정을 따른다.
- 작업 브랜치는 **`dev`에서 분기**하고, PR은 **`dev`를 베이스**로 보낸다. 이슈 의존성이 있으면 선행 이슈가 **`dev`에 머지된 뒤** 그 `dev`에서 분기한다(예: TAG-2는 TAG-1 머지 후 `dev`에서 분기).
- 커밋은 단계별로 분리(`docs:` 시나리오 → `test:` Red → `feat:` Green)하는 것을 기본으로 한다.
- **PR 머지가 확인되면 마무리 정리를 한다(8단계)**: `dev`로 체크아웃 → `git pull`로 머지분 반영 → 작업 브랜치를 로컬(`git branch -d`)·원격(`git push origin --delete`) 모두 삭제. 다음 이슈는 이 최신 `dev`에서 분기한다.

## 향후 추가 예정 (강의 진행 중)

- `Note` 타입에 `tags` 필드 추가
