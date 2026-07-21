# PR-A2 — Redaction e audit hardening

**Branch:** `pr-a2-redaction-audit-hardening`  
**Trilha:** A (Workstation)  
**Depende de:** A1  
**PRD-024:** Fase 3

## Objetivo

Fechar a camada de auditoria e proteção de payloads antes de executar integrações/worker duráveis.

## Escopo

- Implementar `redactPayload` compartilhado server/worker, conforme ADR-004.
- Redigir recursivamente chaves sensíveis: `password`, `secret`, `token`, `api_key`, `authorization`, `credential`, `private_key`, `cookie`, `session`.
- Redigir padrões óbvios de credenciais em strings (Bearer/JWT/`sk-`).
- Aplicar redação antes de `audit_log`, `run_events`, `outbox_events`, snapshots e logs estruturados.
- Garantir truncamento explícito com `_truncated: true` para limites de 32 KiB/16 KiB.
- Cobrir erro de payload grande antes do banco quando possível.

## Fora de escopo

- Worker de execução.
- Realtime.
- Storage externo para payloads grandes.

## Arquivos prováveis

- `src/domains/workstation/server/redaction.ts` (novo)
- `src/domains/workstation/server/commands.ts`
- `src/domains/workstation/server/rpc-errors.ts`
- `tests/unit/redaction.test.ts`
- `supabase/migrations/*` se helper SQL adicional for necessário

## Gate de aceite

- [ ] Segredos não aparecem em `audit_log`, outbox, run events, snapshots ou logs.
- [ ] Payload acima do limite é truncado explicitamente ou rejeitado com erro claro.
- [ ] Unit tests positivos/negativos para redação recursiva.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run build`.
- [ ] `memory/TASK_LOG.md` atualizado.
