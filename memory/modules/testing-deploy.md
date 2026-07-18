# Testing And Deploy

## Commands

```bash
npm run typecheck
npm run build
npm run lint
npm run test:e2e
python -m graphify update . --force
```

## Current Validation Baseline

- Run `npm run typecheck` after TypeScript or route changes.
- Run `npm run build` after App Router/component changes.
- Run graphify structural update after architecture or structural code changes when feasible.

## Known Blockers

- Full graph extraction/rebuild requires an LLM API key.
- Authenticated Workstation E2E is implemented and requires E2E_TEST_EMAIL/E2E_TEST_PASSWORD for a confirmed account.
- next.config.ts pins turbopack.root to the repository directory so parent lockfiles cannot make dev route discovery intermittent.
