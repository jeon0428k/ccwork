# 태그 기능 — 이슈 분해 (수직 슬라이싱)

> [`prd.md`](./prd.md) 기반. 각 이슈는 **데이터 → API → 상태 → UI**를 관통하는 얇은 수직 슬라이스로, 독립적으로 데모/배포 가능한 사용자 가치를 담는다.
> 수평 분해("타입만", "API만", "UI만")가 아니라, 기능 단위로 끝까지 동작하는 슬라이스로 쪼갰다.

## 슬라이스 개요

| #     | 이슈                                   | 핵심 가치                             | 의존  | 관련 US    |
| ----- | -------------------------------------- | ------------------------------------- | ----- | ---------- |
| TAG-1 | 태그 추가·저장·표시 (Walking Skeleton) | 태그를 입력해 저장하고 재오픈 시 본다 | —     | US-1, US-5 |
| TAG-2 | 칩 삭제 (× 버튼)                       | 칩을 클릭해 제거한다                  | TAG-1 | US-3       |
| TAG-3 | Backspace로 마지막 칩 삭제             | 키보드로 마지막 태그를 취소한다       | TAG-1 | US-2       |
| TAG-4 | 중복 태그 방지 (대소문자 무시)         | 같은 태그가 중복 생성되지 않는다      | TAG-1 | US-4       |
| TAG-5 | 입력 검증 (trim·최대 15자·최대 10개)   | 비정상 태그 입력이 차단된다           | TAG-1 | US-7       |
| TAG-6 | 빈 태그 상태 UX (placeholder·0개 저장) | 태그 없는 노트도 자연스럽게 동작한다  | TAG-1 | US-6       |

> **TAG-1이 기반 슬라이스**다. 데이터 모델(`Note.tags`)·`useTagInput` 훅·`ChipInput` 컴포넌트·영속화 배선이 여기서 처음 생기고, TAG-2~6은 그 위에 행동을 덧붙인다. TAG-2~6은 서로 독립적이라 순서를 바꿔도 된다.

---

## TAG-1. 태그 추가·저장·표시 (Walking Skeleton)

**설명**
태그 기능의 가장 얇은 end-to-end 슬라이스. `NoteEditor` 제목 입력란 아래에 `ChipInput`을 두어, 사용자가 텍스트를 입력하고 **Enter 또는 쉼표(`,`)** 로 확정하면 칩이 추가된다. 저장 시 태그가 노트 본문과 함께 영속화되고, 노트를 다시 열면 저장된 태그가 칩으로 표시된다.

이 슬라이스에서 처음 도입되는 기반 요소:

- `Note` 타입에 `tags: string[]` 추가 (`src/types/note.ts`). 읽기 시점 `note.tags ?? []` 폴백(ADR-2).
- `useTagInput` 커스텀 훅: 태그 배열 상태 + `addTag` 액션 (ADR-3·4). 영속화는 모른다.
- `ChipInput` + `Chip` 컴포넌트 (디자인 시스템 `chip` 스펙 준수).
- `NotesContext.createNote`에 `tags` 인자 확장 (`createNote(title, content, tags)`). `updateNote`는 `Partial<Note>`라 무변경.
- `NoteEditor` 폼 로컬 상태에 `tags` 추가, `handleSave`에서 함께 커밋.

**완료조건 (Acceptance Criteria)**

- **AC-1 (Enter로 추가)**
  - **Given** 노트 편집 화면에서 태그 input에 `React`를 입력했을 때
  - **When** Enter 키를 누르면
  - **Then** `React` 칩이 input 좌측에 추가되고 input은 비워진다.

- **AC-2 (쉼표로 추가)**
  - **Given** 태그 input에 `TypeScript`를 입력했을 때
  - **When** 쉼표(`,`) 키를 누르면
  - **Then** `TypeScript` 칩이 추가되고 input은 비워진다(쉼표 문자는 칩에 포함되지 않는다).

- **AC-3 (본문과 함께 저장)**
  - **Given** 칩 `React`, `TypeScript`를 추가한 상태에서
  - **When** 저장 버튼을 누르면
  - **Then** 해당 노트가 `tags: ["React","TypeScript"]`를 포함해 영속화된다(별도 태그 API 호출 없음, 본문 저장 1회에 포함).

- **AC-4 (재오픈 시 표시)**
  - **Given** 태그가 저장된 노트가 있을 때
  - **When** 그 노트를 다시 선택해 편집 화면을 열면
  - **Then** 저장된 태그가 제목 아래에 칩 목록으로 표시된다.

- **AC-5 (기존 노트 폴백)**
  - **Given** `tags` 필드가 없는 기존 노트를 열었을 때
  - **When** 편집 화면이 렌더되면
  - **Then** 오류 없이 빈 태그 영역으로 표시된다(`note.tags ?? []`).

---

## TAG-2. 칩 삭제 (× 버튼, hover 노출)

**설명**
각 칩에 hover하면 우측에 × 버튼이 나타나고, 클릭하면 해당 태그가 즉시 칩 목록에서 제거된다. 평소(비-hover)에는 × 버튼을 숨겨 화면을 깔끔하게 유지한다. 제거된 태그는 저장 시 반영된다. `useTagInput`에 `removeTag(tag)` 액션 추가.

**완료조건 (Acceptance Criteria)**

- **AC-1 (hover 시 × 노출)**
  - **Given** 칩 `React`가 표시된 상태에서
  - **When** 해당 칩에 마우스를 올리면
  - **Then** 칩 우측에 × 삭제 버튼이 나타난다(비-hover 시에는 보이지 않는다).

- **AC-2 (× 클릭 시 제거)**
  - **Given** 칩 `React`, `TypeScript`가 있을 때
  - **When** `React` 칩의 × 버튼을 클릭하면
  - **Then** `React` 칩이 즉시 사라지고 `TypeScript`만 남는다.

- **AC-3 (삭제 후 저장 반영)**
  - **Given** `React`를 제거한 상태에서
  - **When** 저장 버튼을 누르고 노트를 재오픈하면
  - **Then** 저장된 태그에 `React`가 없다.

---

## TAG-3. Backspace로 마지막 칩 삭제

**설명**
태그 input이 **비어 있는 상태**에서 Backspace를 누르면 가장 마지막 칩이 삭제된다. input에 텍스트가 있을 때의 Backspace는 일반 문자 삭제로 동작해야 한다(칩에 영향 없음). `useTagInput`에 `removeLast()` 액션 추가.

**완료조건 (Acceptance Criteria)**

- **AC-1 (빈 input에서 마지막 칩 삭제)**
  - **Given** 칩 `React`, `TypeScript`가 있고 input이 비어 있을 때
  - **When** Backspace를 누르면
  - **Then** 마지막 칩 `TypeScript`가 삭제된다.

- **AC-2 (input에 텍스트가 있으면 칩 보존)**
  - **Given** 칩 `React`가 있고 input에 `Vu`가 입력된 상태에서
  - **When** Backspace를 누르면
  - **Then** input 텍스트만 `V`로 줄고, 칩 `React`는 그대로 유지된다.

- **AC-3 (칩이 없을 때 무동작)**
  - **Given** 칩이 하나도 없고 input이 비어 있을 때
  - **When** Backspace를 누르면
  - **Then** 아무 일도 일어나지 않는다(오류 없음).

---

## TAG-4. 중복 태그 방지 (대소문자 무시)

**설명**
이미 존재하는 태그를 다시 추가하려 하면 **대소문자를 무시**하고 같은 값으로 판정해 조용히 무시한다(에러 메시지 없이 input만 비움). 저장 표기는 **먼저 입력된 원본**을 유지한다(ADR-4). 비교는 `trim().toLowerCase()` 기준.

> **슬라이스 의도**: 구현 로직은 `useTagInput`에 모이지만, 이 이슈는 "**중복 칩이 생기지 않는다**"는 하나의 사용자 가치를 기준으로 묶은 수직 슬라이스다(훅 레이어 기준 분해가 아니다).

**완료조건 (Acceptance Criteria)**

- **AC-1 (동일 표기 중복)**
  - **Given** 칩 `React`가 있을 때
  - **When** `React`를 다시 입력하고 Enter를 누르면
  - **Then** 새 칩이 추가되지 않고 input만 비워진다(에러 메시지 없음).

- **AC-2 (대소문자만 다른 중복)**
  - **Given** 칩 `React`가 있을 때
  - **When** `react`를 입력하고 Enter를 누르면
  - **Then** 중복으로 판정되어 추가되지 않고, 기존 칩 표기는 `React`로 유지된다.

- **AC-3 (원본 표기 보존)**
  - **Given** 태그를 처음 추가할 때 `React`로 입력했다면
  - **When** 저장 후 재오픈하면
  - **Then** 저장된 값은 소문자가 아닌 `React`(원본 표기)다.

---

## TAG-5. 입력 검증 (trim·최대 15자·최대 10개)

**설명**
태그 입력에 경계 규칙을 적용한다 — 앞뒤 공백 `trim` 후 빈 문자열이면 추가하지 않고, 태그 1개는 최대 15자(초과 입력은 input에서 차단), 노트당 최대 10개(초과 시 추가 차단). 모든 차단은 조용히 처리(에러 메시지 없음). `useTagInput`의 `addTag` 게이트 순서: trim → 빈값 차단 → 15자 차단 → (중복 차단) → 10개 차단.

> **슬라이스 의도**: trim·15자·10개 3개 규칙을 한 이슈로 묶은 것은 "**비정상 태그 입력이 차단된다**"는 하나의 사용자 가치로 의도적으로 합친 것이다 — 검증 로직이 사는 레이어(`useTagInput`) 기준의 수평 분해가 아니다. 규칙별로 더 잘게 쪼갤 수도 있으나, 가치 단위가 동일해 묶는 편을 택했다.

**완료조건 (Acceptance Criteria)**

- **AC-1 (공백 trim 후 빈값 차단)**
  - **Given** 태그 input에 공백만(`"   "`) 입력했을 때
  - **When** Enter를 누르면
  - **Then** 칩이 추가되지 않고 input만 비워진다.

- **AC-2 (앞뒤 공백 제거 저장)**
  - **Given** 태그 input에 `  React  `를 입력했을 때
  - **When** Enter를 누르면
  - **Then** `React` 칩이 추가된다(앞뒤 공백 제거).

- **AC-3 (최대 15자 입력 차단)**
  - **Given** 태그 input에 15자가 입력된 상태에서
  - **When** 16번째 문자를 입력하려 하면
  - **Then** 16번째 문자는 input에 들어가지 않는다(15자에서 멈춤).

- **AC-4 (최대 10개 추가 차단)**
  - **Given** 칩이 이미 10개 있을 때
  - **When** 11번째 태그를 입력하고 Enter를 누르면
  - **Then** 11번째 칩이 추가되지 않는다(조용히 무시).

---

## TAG-6. 빈 태그 상태 UX (placeholder · 0개 저장)

**설명**
태그가 0개일 때만 input에 placeholder `태그 입력 후 Enter`를 표시하고, 칩이 하나라도 있으면 placeholder를 숨긴다. 태그가 0개인 노트도 정상적으로 저장·표시된다(태그는 선택 사항).

**완료조건 (Acceptance Criteria)**

- **AC-1 (0개일 때 placeholder)**
  - **Given** 칩이 하나도 없는 편집 화면에서
  - **When** 태그 input을 보면
  - **Then** placeholder `태그 입력 후 Enter`가 표시된다.

- **AC-2 (1개 이상이면 placeholder 숨김)**
  - **Given** 칩이 1개 이상 추가된 상태에서
  - **When** 태그 input을 보면
  - **Then** placeholder가 표시되지 않는다.

- **AC-3 (0개 노트 저장·표시)**
  - **Given** 태그를 하나도 추가하지 않은 노트에서
  - **When** 저장 버튼을 누르고 재오픈하면
  - **Then** 오류 없이 저장되며, 태그 영역은 빈(placeholder만) 상태로 표시된다.
