# PR-A1 — Bootstrap org, membership e middleware

**Branch:** `pr-a1-bootstrap-org-middleware`  
**Trilha:** A (Workstation)  
**Depende de:** `main` com PRD-024 Fases 0–2  
**Desbloqueia:** A2+, B1, uso real de `WORKSTATION_DURABLE`

## Objetivo

Garantir que um usuário autenticado tenha organização e membership reais no banco, sessão refresh confiável, e que o path durable não dependa de gambiarra manual opaca.

## Escopo

- Middleware Next.js (ou equivalente App Router) para refresh de sessão Supabase
- Fluxo de bootstrap: criar/vincular `organizations` + `organization_members` (signup ou first-login) alinhado a PRD-002 se aplicável
- Script/seed documentado de canário (org slug + member Admin) para staging
- Trazer para o repo a migration remota faltante `048_project_plan_limits` (ou documentar no-op se irrelevante) e eliminar drift local/remoto
- Confirmar `git remote` → `studio_redrise` na doc de ops se ainda divergente

## Fora de escopo

- Worker, Realtime, mudanças de UI Workstation
- Billing completo

## Arquivos prováveis

- `src/middleware.ts` (novo)
- `src/domains/workstation/server/*` ou `src/domains/auth/*`
- `supabase/migrations/*` (aditiva)
- `docs/handoff` / `memory/modules/supabase.md`

## Gate de aceite

- [ ] Login → rota `/{slug}/workstation` com `WORKSTATION_DURABLE=true` carrega snapshot (vazio ok)
- [ ] Não-membro → 404; não autenticado → sign-in
- [ ] Membership `accepted` necessária
- [ ] typecheck, lint, unit, build
- [ ] Seed canário reproduzível documentado
