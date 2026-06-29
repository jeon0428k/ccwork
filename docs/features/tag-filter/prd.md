# 태그 필터링 — PRD

> 입력: [`spec-fixed.md`](./spec-fixed.md) + 코드베이스. 단계 2 산출물.

## 1. 개요

사이드바 상단에 현재 노트들의 **태그 합집합**을 토글 칩으로 나열하고, 켜진 태그(OR 조합)에
해당하는 노트만 목록에 보여주는 클라이언트 측 필터. 서버/저장소 변경 없음, 필터 상태는 비영구
UI 상태.

## 2. 사용자 스토리

- **US-1**: 사용자로서, 사이드바 상단에서 존재하는 태그들을 칩으로 보고 싶다 — 어떤 주제가 있는지 한눈에 파악하려고.
- **US-2**: 사용자로서, 태그 칩을 클릭하면 그 태그의 노트만 목록에 보이게 하고 싶다 — 주제별로 노트를 좁혀 보려고.
- **US-3**: 사용자로서, 여러 태그를 켜면 그중 하나라도 가진 노트를 모두(OR) 보고 싶다.
- **US-4**: 사용자로서, 켜진 칩을 다시 눌러 끄거나 한 번에 필터를 해제하고 싶다.
- **US-5**: 사용자로서, 필터 결과가 없으면 "노트 없음" 안내와 해제 수단을 보고 싶다 — 빈 화면에 갇히지 않으려고.

## 3. 기술 결정 (ADR)

### 아키텍처 3안 비교

> 핵심 제약: `App.tsx`는 `NotesProvider` **바깥**이라 `useNotes()`로 notes에 접근할 수 없다.
> 따라서 "필터 상태 + 태그 합집합 계산"은 **provider 내부의 어떤 컴포넌트**에 두어야 한다.

| #   | 기준              | 안 A: NoteList 내부 처리          | **안 B: useTagFilter 훅 + Sidebar 컨테이너 (선택)**              | 안 C: NotesContext에 필터     |
| --- | ----------------- | --------------------------------- | ---------------------------------------------------------------- | ----------------------------- |
| 1   | 데이터 구조       | NoteList 로컬 useState            | `useTagFilter(notes)` 훅이 `activeTags`/파생값 소유              | Context에 `activeTags` 추가   |
| 2   | API 레이어 변경   | 없음                              | 없음                                                             | 없음                          |
| 3   | 상태관리 변경지점 | NoteList 한 곳                    | provider 내부 `Sidebar` 컨테이너(훅 호출)                        | NotesContext(서버상태와 혼재) |
| 4   | 핵심 동작         | NoteList가 칩+목록 모두 렌더·필터 | 훅이 `visibleNotes`/`allTags` 계산, Sidebar가 조립               | Context가 filteredNotes 노출  |
| 5   | 컴포넌트 구조     | NoteList 비대화                   | `Sidebar`(컨테이너) + `TagFilter`(표시) + `NoteList`(notes prop) | 컴포넌트 단순, Context 비대화 |
| 6   | 기존 패턴 일관성  | 컴포넌트가 파생상태 떠안음(약함)  | **`useTagInput` 훅 패턴과 동일, 3계층 분리 유지(강함)**          | "필터=UI상태" 원칙 위반       |
| 7   | 테스트 용이성     | 컴포넌트 통합 테스트로만 검증     | **훅 단위 테스트 + 컴포넌트 테스트 분리(높음)**                  | Context 테스트 비대화         |

### Decision

**안 B** — `useTagFilter(notes)` 커스텀 훅 + provider 내부 `Sidebar` 컨테이너 + 표시 전용 `TagFilter` 컴포넌트.

- **`useTagFilter(notes: Note[])`** → `{ allTags, activeTags, toggleTag, clearTags, visibleNotes }`
  - `allTags`: notes의 태그 합집합(중복 제거).
  - `activeTags`: 켜진 태그 집합(훅 로컬 UI 상태).
  - `visibleNotes`: activeTags가 비면 전체, 아니면 OR 매칭 노트.
- **`TagFilter`**: `allTags`·`activeTags`·`onToggle`을 받아 칩을 렌더하는 표시 전용 컴포넌트(기존 `Chip` 시각 스타일 재사용, 켜짐 상태 표현 추가).
- **`Sidebar`**: provider 내부에서 `useNotes()`로 notes를 받아 `useTagFilter` 호출 → `TagFilter` + `NoteList`(visibleNotes 전달) 조립.
- **`NoteList`**: notes를 prop으로 받도록 소폭 리팩터(현재는 context에서 직접 pull).

### Context (왜 필요한가)

태그 입력 기능으로 노트마다 태그가 쌓이지만, 목록은 전체만 보여줘 주제별 탐색이 불가능하다.
필터는 서버 데이터가 아닌 화면 상태이므로 3계층 분리 원칙상 UI 계층에 두어야 한다.

### Alternatives (거부안 + 거부 이유)

- **안 A 거부**: NoteList가 필터 상태·태그 합집합 계산·칩 렌더까지 떠안아 단일 책임이 무너지고, 파생 로직을 컴포넌트 테스트로만 검증하게 되어 회귀 취약.
- **안 C 거부**: 필터는 비영구 UI 상태인데 이를 서버 상태 저장소(NotesContext)에 넣으면 "필터=UI상태" 원칙을 위반하고, 새로고침 비영구·테스트 비대화 등 부작용이 크다.

### Consequences (트레이드오프 — 단점 포함)

- 장점: `useTagInput`과 동일한 훅 패턴으로 일관, 훅 단위 테스트로 필터 로직을 독립 검증, 3계층 분리 유지.
- **단점**: `Sidebar` 컨테이너와 `NoteList` notes-prop 리팩터가 새로 필요(기존 컴포넌트 1개 시그니처 변경). 필터 상태가 `App.tsx`가 아닌 `Sidebar`에 위치 — spec-fixed의 "App.tsx UI 상태" 표현은 provider 경계 제약상 "사이드바 UI 계층"으로 구체화된다(서버상태 아님은 유지).

## 4. Out of Scope

- AND 조합, 태그 검색/자동완성형 필터.
- 본문/제목 텍스트 검색과의 결합.
- 필터 상태 영구화(localStorage·URL 쿼리스트링).
- 고정 태그 사전(taxonomy)·태그 이름 변경/병합.
- 태그별 노트 개수 뱃지(칩에 카운트 표시).

## 5. 용어 정의

`spec-fixed.md`의 용어 정의를 그대로 따른다(필터 칩, 켜진 태그, 필터 상태, 태그 합집합, 보이는 노트).
