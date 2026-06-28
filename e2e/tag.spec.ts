import { test, expect } from '@playwright/test';

// 태그 기능 E2E — docs/features/tag/prd.md 의 사용자 스토리를 "실제 백엔드 영속화 라운드트립"
// 관점에서만 검증한다. 검증 규칙의 분기 전수(길이·개수·대소문자·trim·키 이벤트 등)는
// 단위 테스트(useTagInput / ChipInput / Chip / NoteEditor)가 담당하므로 여기서 반복하지 않는다.
//
// 병렬 안전: 각 테스트는 시드의 전용 노트(추가용/삭제용)만 다루거나 새 노트를 생성하며,
// 공유 db 의 카운트에는 의존하지 않는다.

// 저장 버튼을 누르고, 서버에 영속화(POST/PATCH 2xx)가 끝날 때까지 결정적으로 기다린다.
// reload 전에 이 대기가 없으면 저장 요청이 완료되기 전에 새로고침되어 경쟁이 발생한다.
async function saveAndWaitPersisted(page: import('@playwright/test').Page) {
  await Promise.all([
    page.waitForResponse(
      (res) => res.url().includes('/notes') && res.request().method() !== 'GET' && res.ok(),
    ),
    page.getByRole('button', { name: '저장' }).click(),
  ]);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('E2E-1: 태그를 추가해 저장하면 새로고침 후에도 유지된다 (US-1, US-5)', async ({ page }) => {
  await test.step('태그가 없는 노트를 연다', async () => {
    await page.getByText('태그 추가용 노트').click();
    await expect(page.getByPlaceholder('제목')).toHaveValue('태그 추가용 노트');
  });

  await test.step('태그를 추가하고 저장한다', async () => {
    const input = page.getByPlaceholder('태그 입력 후 Enter');
    await input.fill('업무');
    await input.press('Enter');
    await expect(page.getByText('업무')).toBeVisible();
    await saveAndWaitPersisted(page);
  });

  await test.step('새로고침 후 재오픈 시 태그가 영속화되어 있다', async () => {
    await page.reload();
    await page.getByText('태그 추가용 노트').click();
    await expect(page.getByText('업무')).toBeVisible();
  });
});

test('E2E-2: 태그를 삭제해 저장하면 새로고침 후에도 삭제가 유지된다 (US-3, US-5)', async ({
  page,
}) => {
  await test.step('태그가 달린 노트를 연다', async () => {
    await page.getByText('태그 삭제용 노트').click();
    await expect(page.getByText('임시')).toBeVisible();
  });

  await test.step('칩의 × 버튼으로 태그를 삭제하고 저장한다', async () => {
    await page.getByRole('button', { name: '임시 태그 삭제' }).click();
    await expect(page.getByText('임시')).toBeHidden();
    await saveAndWaitPersisted(page);
  });

  await test.step('새로고침 후 재오픈 시 삭제가 영속화되어 있다', async () => {
    await page.reload();
    await page.getByText('태그 삭제용 노트').click();
    await expect(page.getByPlaceholder('제목')).toHaveValue('태그 삭제용 노트');
    await expect(page.getByText('임시')).toBeHidden();
  });
});

test('E2E-3: 새 노트를 태그와 함께 만들면 목록에 추가되고 태그가 유지된다 (US-6, US-1)', async ({
  page,
}) => {
  const title = 'E2E 신규 태그 노트';

  await test.step('새 노트를 작성해 저장한다', async () => {
    await page.getByRole('button', { name: '+ 새 노트' }).click();
    await page.getByPlaceholder('제목').fill(title);
    await page.getByPlaceholder('내용을 입력하세요...').fill('새 노트 생성 여정 검증');

    const input = page.getByPlaceholder('태그 입력 후 Enter');
    await input.fill('신규');
    await input.press('Enter');

    await saveAndWaitPersisted(page);
  });

  await test.step('새로고침 후 목록에 보이고 태그가 영속화되어 있다', async () => {
    await page.reload();
    await expect(page.getByText(title)).toBeVisible();
    await page.getByText(title).click();
    await expect(page.getByText('신규')).toBeVisible();
  });
});
