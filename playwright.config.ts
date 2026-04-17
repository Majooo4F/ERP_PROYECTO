import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  retries: 1,
  use: {
    baseURL: 'http://localhost:4200',
    headless: true,
    trace: 'retain-on-failure'
  },
  reporter: [['list']]
});
