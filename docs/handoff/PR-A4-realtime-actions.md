# PR-A4 — Realtime Actions

**Branch:** `pr-a4-realtime-actions`  
**Trilha:** A (Workstation)  
**Depende de:** A3  
**PRD-024:** Fase 5

## Objetivo

Atualizar Actions e snapshots do Workstation via Supabase Realtime sem transformar o cliente em autoridade de estado.

## Escopo

- Assinar mudanças seguras em `process_runs`, `node_runs` e/ou eventos mínimos.
- Cliente invalida/refaz snapshot; não aplica transições autoritativas localmente.
- Catch-up por `updated_at`/cursor após reconnect.
- Backoff de reconnect e fallback de Refresh manual.
- Mensagens honestas: `Queued — execution delayed` quando worker atrasar.
- Garantir RLS em eventos; nenhum payload sensível em Realtime.

## Fora de escopo

- Worker/outbox (A3).
- DLQ replay e alertas (A5).

## Arquivos prováveis

- `src/domains/workstation/core/supabase-workstation-adapter.ts`
- `src/domains/workstation/core/workstation-provider.tsx`
- `src/domains/workstation/actions/*`
- `src/lib/supabase.ts`
- `tests/unit/*realtime*.test.ts` ou Playwright smoke

## Gate de aceite

- [ ] Actions atualiza após stage/status sem refresh manual.
- [ ] Reconnect recupera estado confirmado por snapshot.
- [ ] Realtime desligado mantém último estado confirmado + Refresh manual.
- [ ] Nenhum snapshot sensível publicado em evento.
- [ ] `npm run lint`, `npm run typecheck`, testes relevantes, `npm run build`.
