import { defineConfig } from '@playwright/test'

const e2eHost = '127.0.0.1'
const e2ePort = process.env.PORT ?? '5173'
const e2eBaseURL = `http://${e2eHost}:${e2ePort}`

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  retries: 1,
  globalSetup: './tests/global-setup.ts',
  use: {
    baseURL: e2eBaseURL,
    actionTimeout: 30000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'auth-session',
      testMatch: /smoke-auth\.spec\.ts/,
      dependencies: ['auth-setup'],
      use: { storageState: 'tests/.auth/user.json' },
    },
    {
      name: 'auth-public',
      testMatch: /smoke-unauth\.spec\.ts/,
    },
    {
      name: 'navigation',
      testMatch: /navigation\.spec\.ts/,
      dependencies: ['auth-setup'],
      use: { storageState: 'tests/.auth/user.json' },
    },
    {
      name: 'dashboard',
      testMatch: /dashboard\.spec\.ts/,
      dependencies: ['auth-setup'],
      use: { storageState: 'tests/.auth/user.json' },
    },
    {
      name: 'flow',
      testMatch: /flow\.spec\.ts/,
      dependencies: ['auth-setup'],
      use: { storageState: 'tests/.auth/user.json' },
    },
    {
      name: 'tasks',
      testMatch: /tasks\.spec\.ts/,
      dependencies: ['auth-setup'],
      use: { storageState: 'tests/.auth/user.json' },
    },
    {
      name: 'agents',
      testMatch: /agents\.spec\.ts/,
      dependencies: ['auth-setup'],
      use: { storageState: 'tests/.auth/user.json' },
    },
    {
      name: 'analytics',
      testMatch: /analytics\.spec\.ts/,
      dependencies: ['auth-setup'],
      use: { storageState: 'tests/.auth/user.json' },
    },
    {
      name: 'workspaces',
      testMatch: /workspaces\.spec\.ts/,
      dependencies: ['auth-setup'],
      use: { storageState: 'tests/.auth/user.json' },
      fullyParallel: false,
    },
{
      name: "settings",
      testMatch: /settings\.spec\.ts/,
      dependencies: ['auth-setup'],
      use: { storageState: 'tests/.auth/user.json' },
      fullyParallel: false,
    },
    {
      name: "context-memory",
      testMatch: /context-memory\.spec\.ts/,
      dependencies: ['auth-setup'],
      use: { storageState: 'tests/.auth/user.json' },
      fullyParallel: false,
    },
  ],
  webServer: {
    command: `npm run dev -- --hostname ${e2eHost} --port ${e2ePort}`,
    url: e2eBaseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  outputDir: 'tests/test-results',
})
