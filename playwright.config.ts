import { defineConfig, devices } from '@playwright/test';

// E2E 는 실제 db.json / 3003 포트가 아닌, 격리된 fixture db + 전용 포트를 쓴다.
const API_PORT = process.env.E2E_API_PORT ?? '3999';
const WEB_PORT = process.env.E2E_WEB_PORT ?? '5174';
const API_URL = `http://localhost:${API_PORT}`;
const BASE_URL = `http://localhost:${WEB_PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      // 격리된 JSON Server (fixture db, 전용 포트)
      command: 'node scripts/e2e-server.mjs',
      port: Number(API_PORT),
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      // Vite — VITE_API_URL 로 테스트용 API 포트를 가리킨다
      command: `vite --port ${WEB_PORT} --strictPort`,
      port: Number(WEB_PORT),
      reuseExistingServer: !process.env.CI,
      env: { VITE_API_URL: API_URL },
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
