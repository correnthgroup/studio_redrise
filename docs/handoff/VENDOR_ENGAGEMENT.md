# Vendor engagement — RedRise Workstation

## Objetivo do engajamento

Tornar o menu **Workstation** viável em produção (persistência, autorização no banco, execução durável, Actions operáveis), **sem reescrever as telas**.

Somente após a Trilha A (PRD-024 Fases 3–7 + bootstrap) estar estável, priorizar outras áreas do produto.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Supabase Auth + PostgreSQL (RLS)
- Tailwind v4, shadcn, Sonner
- npm; Playwright; Vitest
- Package manager: npm

## Contratos que não podem quebrar

- `WorkstationRepository`, `ExecutionRuntime`, `AuthorizationPolicy` via `WorkstationProvider`
- Rotas `/:organizationSlug/workstation/...`
- Dialogs/modals para criação; sem side panels
- Sem `localStorage` para dados de domínio
- Capabilities: `space.*`, `process.*`, `run.*`
- Process Run: `queued → running → completed | failed | cancelled`
- Node Run: `queued → planning → preparing → executing → completed | failed | skipped | cancelled`
- Retry: novo Node Run, `attempt++`, `retriedFromNodeRunId`

## Regras duras

- Browser: SELECT sob RLS apenas; mutações via server actions → RPCs `ws_*` / `workstation.*`
- `service_role` só server/worker
- Toda mutação: `Idempotency-Key` + audit redigido
- Migrations aditivas e reversíveis por flag; sem drop destrutivo automatizado
- **Proibido:** RedScale, CML embutido/fallback local, embeddings locais, persistência de domínio em `localStorage`
- CML: somente SDK/API oficial server-side quando provisionado

## Como rodar

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run test:unit
npm run build
npm run test:e2e   # requer E2E_TEST_EMAIL / E2E_TEST_PASSWORD
```

Flags (server-only, ver `.env.example`):

- `WORKSTATION_DURABLE=true|false`
- `WORKSTATION_DURABLE_ORGS=slug1,slug2` ou `*`

SQL remoto (sem Docker): `scripts/db/pg-exec.mjs` + `SUPABASE_DB_URL` montada em processo (nunca em arquivo).

## Definition of Done (todo PR)

- [ ] Escopo do arquivo `docs/handoff/PR-*.md` correspondente
- [ ] `npm run lint` (0 errors) + `npm run typecheck` + testes relevantes
- [ ] `npm run build`
- [ ] Migration aditiva se schema mudar; RLS revisado
- [ ] Sem segredos em git
- [ ] `memory/TASK_LOG.md` + módulo afetado atualizados
- [ ] Gate de aceite do PR marcado no corpo do PR GitHub

## Contato de autoridade

Conflito de decisão: PRD vigente > ADR > `CURRENT_DIRECTION` operacional > código.
