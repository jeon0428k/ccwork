# 태그 필터링 — 이슈 분해

> 입력: [`prd.md`](./prd.md). 수직 슬라이스 3개. 의존성: FILTER-1 → FILTER-2 → FILTER-3.
> 각 이슈는 단독으로 "사용자에게 보여줄 동작"을 갖는다.

> ⚠️ 참고: `origin/main`에는 이미 별도 계보의 태그 필터 구현(FILTER-1/2 라벨)이 머지돼 있다.
> 이 분해는 현재 `dev` 라인 기준의 독립 설계이며, 나중에 main과 합칠 때 조정이 필요할 수 있다.

---

## FILTER-1 — 사이드바에 태그 필터 칩 목록 표시

**가치**: 사용자가 존재하는 태그를 사이드바 상단에서 칩으로 본다.

**범위**: `useTagFilter(notes)` 훅의 `allTags`(태그 합집합) + `TagFilter` 표시 컴포넌트.
필터 동작 자체는 아직 없어도 됨(칩 렌더와 토글 시각 상태까지).

### Acceptance Criteria

- [ ] Given 노트들이 ["work","idea"], ["work"] 태그를 가질 때, When 사이드바가 렌더되면, Then 중복 제거된 칩 "work", "idea"가 노트 목록 위에 표시된다.
- [ ] Given 어떤 노트에도 태그가 없을 때, When 사이드바가 렌더되면, Then 필터 칩 영역이 렌더되지 않는다.
- [ ] Given 필터 칩이 표시될 때, When 한 칩을 클릭하면, Then 그 칩이 "켜짐" 상태로 시각적으로 구분된다(다시 클릭하면 꺼짐).

---

## FILTER-2 — 태그 선택으로 노트 목록 좁히기 (OR)

**가치**: 칩을 켜면 해당 태그의 노트만, 여러 개면 OR로 목록이 좁혀진다.

**범위**: `useTagFilter`의 `activeTags`/`toggleTag`/`visibleNotes` + `Sidebar` 컨테이너가
`NoteList`에 `visibleNotes` 전달(NoteList는 notes prop 수신으로 리팩터).

### Acceptance Criteria

- [ ] Given "work" 칩을 켰을 때, When 목록을 보면, Then "work" 태그를 가진 노트만 표시된다.
- [ ] Given "work"와 "idea"를 모두 켰을 때, When 목록을 보면, Then work 또는 idea를 가진 노트가 모두(OR) 표시된다.
- [ ] Given 태그가 없는 노트가 있을 때, When 아무 태그라도 켜져 있으면, Then 그 무태그 노트는 목록에서 숨겨진다.
- [ ] Given 켜진 태그가 하나도 없을 때, When 목록을 보면, Then 전체 노트가 표시된다(필터 해제 상태).

---

## FILTER-3 — 빈 결과 안내 + 필터 해제

**가치**: 결과가 0개여도 사용자가 갇히지 않고 빠져나온다.

**범위**: 빈 결과 안내 메시지 + 필터 해제 버튼(`clearTags`). 켜진 칩 재클릭 해제는 FILTER-2에서 동작하므로, 여기선 "전체 해제" 수단과 빈 상태 UX.

### Acceptance Criteria

- [ ] Given 켜진 태그 조합에 맞는 노트가 0개일 때, When 목록을 보면, Then "해당 태그의 노트가 없습니다" 안내와 "필터 해제" 버튼이 표시된다.
- [ ] Given 빈 결과 상태일 때, When "필터 해제"를 클릭하면, Then 모든 켜진 태그가 꺼지고 전체 노트가 다시 표시된다.
- [ ] Given 필터로 현재 선택된(에디터에 열린) 노트가 목록에서 숨겨질 때, When 목록이 갱신되면, Then 에디터의 선택 상태는 그대로 유지된다.
