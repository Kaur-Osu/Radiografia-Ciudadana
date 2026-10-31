import { defineConfig } from '@playwright/test';
import process from 'node:process';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5174',
    browserName: process.env.PLAYWRIGHT_BROWSER === 'firefox' ? 'firefox' : 'chromium',
    channel: process.env.PLAYWRIGHT_BROWSER === 'firefox' ? undefined : process.env.PLAYWRIGHT_BROWSER === 'edge' ? 'msedge' : 'chrome',
    headless: true,
  },
  reporter: 'list',
});
