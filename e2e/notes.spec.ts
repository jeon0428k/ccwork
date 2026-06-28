import { test, expect } from '@playwright/test';

// 스모크 테스트: 앱이 격리된 fixture db 의 시드 노트를 로드해 표시하는지 검증.
test('시드 노트 목록이 로드되어 표시된다', async ({ page }) => {
  await page.goto('/');

  // 시드 데이터의 제목들이 사이드바에 보인다(카운트는 다른 테스트의 생성과 간섭하므로 단언하지 않는다).
  await expect(page.getByText('E2E 시드 노트')).toBeVisible();
  await expect(page.getByText('두 번째 시드 노트')).toBeVisible();
});

test('노트를 선택하면 에디터에 내용이 표시된다', async ({ page }) => {
  await page.goto('/');

  await page.getByText('E2E 시드 노트').click();

  // 에디터 폼 컨트롤(제목 input / 내용 textarea)에 선택한 노트 값이 채워진다.
  await expect(page.getByPlaceholder('제목')).toHaveValue('E2E 시드 노트');
  await expect(page.getByPlaceholder('내용을 입력하세요...')).toHaveValue(
    '이 노트는 E2E 테스트용 고정 시드 데이터입니다.',
  );
});
