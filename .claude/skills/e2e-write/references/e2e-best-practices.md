# E2E Best Practices (이 프로젝트 기준)

스펙을 쓰기 전에 읽는다. 일반 Playwright 원칙 + 이 노트 앱의 구체 규칙을 함께 담는다.

## 1. 무엇을 E2E로 검증하는가 (단위와의 경계)

E2E는 **사용자가 실제로 거치는 여정**을, 단위가 못 보는 **통합 지점**에서만 검증한다.

| 검증 대상                                                    | 담당                       | 이유                               |
| ------------------------------------------------------------ | -------------------------- | ---------------------------------- |
| 순수 로직 분기(길이·개수·대소문자·trim 경계 전수)            | **단위** (`renderHook` 등) | DOM/네트워크 없이 빠르고 전수 가능 |
| 단일 컴포넌트의 props→렌더/키 이벤트 위임                    | **단위** (RTL)             | 격리 렌더로 충분                   |
| Context 액션이 상태를 갱신하는지                             | **단위** (mock API)        | 네트워크 불필요                    |
| **여러 컴포넌트 + 실제 백엔드 + 브라우저**를 가로지르는 흐름 | **E2E**                    | 통합·영속화는 단위로 못 잡음       |
| 저장 → **새로고침 후에도 유지**(서버 라운드트립)             | **E2E**                    | 영속화 검증은 E2E 고유             |

**중복 금지 원칙**: 어떤 규칙이 단위 테스트(`src/**/*.test.tsx`)에 이미 있으면 E2E에서
같은 분기를 반복하지 않는다. E2E에선 그 규칙이 _실제 UI 흐름 안에서 한 번_ 작동하는지만
대표 경로로 확인한다. (예: "중복 태그 무시"의 대소문자 매트릭스는 단위에 두고, E2E는
"이미 있는 태그를 다시 입력하면 칩이 안 늘어난다" 1케이스만.)

## 2. 로케이터 — 사용자가 보는 대로 선택

우선순위(위에서부터):

1. `getByRole('button', { name: '저장' })` — 접근성 트리 기반, 가장 견고.
2. `getByLabel(...)` / `getByPlaceholder(...)` — 폼 컨트롤.
3. `getByText(...)` — 표시 텍스트.
4. (최후) `getByTestId(...)` — 위로 안 잡힐 때만. 이 앱엔 아직 testid가 없다.

**금지**: CSS 클래스(`.text-muted-foreground`)·태그·XPath·nth 인덱스 셀렉터. 디자인 시스템
클래스는 자주 바뀌므로 셀렉터로 쓰면 테스트가 깨진다.

`getByText`가 **여러 요소에 매치되면**(strict mode violation) 더 구체적인 로케이터로 좁힌다.
이 앱에선 같은 문자열이 *목록 미리보기*와 _에디터 textarea_ 양쪽에 나오는 경우가 있으니,
에디터 값은 `getByPlaceholder('내용을 입력하세요...')`처럼 컨트롤을 직접 겨냥하고
`toHaveValue(...)`로 검증한다.

### 이 앱의 알려진 셀렉터

| 대상               | 로케이터                                                     |
| ------------------ | ------------------------------------------------------------ |
| 노트 개수 헤더     | `getByText('노트 N개')`                                      |
| 사이드바 노트 항목 | `getByText('{제목}')`                                        |
| 제목 입력          | `getByPlaceholder('제목')`                                   |
| 내용 입력          | `getByPlaceholder('내용을 입력하세요...')`                   |
| 태그 입력          | `getByPlaceholder('태그 입력 후 Enter')`                     |
| 저장 / 취소        | `getByRole('button', { name: '저장' })` / `{ name: '취소' }` |
| 빈 상태            | `getByText('노트를 선택하거나 새 노트를 만드세요')`          |

UI 텍스트는 한국어다. PRD/실제 컴포넌트의 문구를 그대로 쓴다(추측 금지 — 불확실하면 해당
`src/components/*.tsx`를 확인).

## 3. 대기 — auto-wait만, 수동 sleep 금지

- web-first assertion을 쓴다: `await expect(locator).toBeVisible()` / `.toHaveValue()` /
  `.toHaveCount()`. 조건이 만족될 때까지 자동 재시도한다.
- `page.waitForTimeout(...)`(고정 sleep) 금지. 플레이키의 주원인.
- 네트워크/리렌더가 끼는 동작(저장 후 목록 갱신 등)도 assertion이 알아서 기다린다.

## 4. 테스트 격리·독립성

- 각 `test()`는 자신이 필요한 상태를 스스로 만들고, **다른 테스트 순서에 의존하지 않는다**.
- 공통 진입은 `test.beforeEach`에서 `page.goto('/')` 정도로. 데이터 선행조건이 다르면
  테스트 안에서 직접 만든다(생성→검증).
- 긴 여정은 `test.step('태그 추가', async () => { ... })`으로 단계를 묶어 가독성·리포트를 높인다.
- 한 테스트 = 하나의 사용자 의도. 무관한 검증을 한 테스트에 욱여넣지 않는다.

## 5. 격리 인프라 (절대 깨지 말 것)

이 프로젝트의 E2E는 운영 데이터/포트와 분리돼 있다:

|             | 운영(dev) | E2E                                                          |
| ----------- | --------- | ------------------------------------------------------------ |
| 데이터      | `db.json` | `e2e/fixtures/seed.json` → `e2e/.tmp/db.json` (매 실행 복사) |
| JSON Server | 3003      | 3999                                                         |
| Vite        | 5173      | 5174                                                         |
| API 주소    | 기본값    | `VITE_API_URL` 주입                                          |

- `playwright.config.ts`의 `webServer`가 격리 서버 2개를 자동 기동한다. 테스트에서 포트/주소를
  하드코딩하지 말고 `baseURL` 기준 상대 경로(`page.goto('/')`)를 쓴다.
- **선행 데이터가 필요하면 `e2e/fixtures/seed.json`을 보강**한다. 테스트는 임시 db만 변경하므로
  실 `db.json`·`seed.json`은 무손상이다. 단, 같은 시드를 공유하니 _생성·삭제 테스트는
  서로의 데이터를 가정하지 않게_ 작성한다.
- 새 기능이 새 API 경로/필드를 쓰면 시드 항목에 그 필드를 포함시킨다(예: `tags: []`).

## 6. 스펙 골격 (참고)

```ts
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('US-x: <여정 한 줄 요약>', async ({ page }) => {
  await test.step('준비/진입', async () => {
    await page.getByText('E2E 시드 노트').click();
  });

  await test.step('조작', async () => {
    await page.getByPlaceholder('태그 입력 후 Enter').fill('업무');
    await page.getByPlaceholder('태그 입력 후 Enter').press('Enter');
  });

  await test.step('검증(영속화 포함)', async () => {
    await page.getByRole('button', { name: '저장' }).click();
    await page.reload();
    await page.getByText('E2E 시드 노트').click();
    await expect(page.getByText('업무')).toBeVisible();
  });
});
```

테스트 파일명은 `e2e/{기능명}.spec.ts`(평면 구조). 실행은 `npm run test:e2e`.
