# ADR-002 — RLS e autorização do Workstation

- Status: Proposto (gate Fase 0 da PRD-024)
- Data: 2026-07-21
- Fonte: PRD-024 §3, §6; matriz `ROLE_CAPABILITIES` em `src/domains/workstation/core/workstation.ts`

## Contexto

A PRD exige que o banco seja a barreira final de autorização, com RLS equivalente às capabilities já usadas pela UI: `space.read`, `space.manage`, `space.members.manage`, `process.read`, `process.manage`, `process.run`, `run.read`, `run.retry`. Admin/Owner/Board atuam em toda a organização; Staff gerencia/executa Spaces atribuídos; User lê/executa no escopo atribuído; Viewer só lê.

## Decisão

### Papéis de banco e superfícies

1. Browser (anon key + JWT do usuário) tem acesso **somente leitura** às tabelas de domínio, filtrado por RLS. É a superfície de snapshot e de Realtime.
2. **Nenhuma policy de INSERT/UPDATE/DELETE** é criada para `authenticated` nas tabelas de domínio. Toda mutação passa por RPCs `workstation.*` (`SECURITY DEFINER`) chamadas por server actions/route handlers, que validam sessão, capability e idempotência dentro de uma única transação (ADR-003). RLS bloqueia bypass por construção: sem policy de escrita, não há escrita direta.
3. `service_role` fica restrito a servidor/worker (outbox, leases, recuperação). Jamais no browser.
4. Tabelas internas (`outbox_events`, `idempotency_keys`, `worker_leases`, `dead_letter_events`, `audit_log`, `run_events`*) têm RLS habilitado e **zero policies** para `anon`/`authenticated`, além de `revoke all`. Só service role e RPCs definidas enxergam. (*`run_events` ganha policy de leitura junto com a projeção de Actions na Fase 5, se necessário.)

### Funções helper

Schema `workstation`, `SECURITY DEFINER`, `set search_path = ''`, `stable`:

- `workstation.member_id(org uuid) → uuid`: linha ativa de `organization_members` para `auth.uid()`.
- `workstation.is_active_member(org uuid) → boolean`.
- `workstation.org_role(org uuid) → text`.
- `workstation.is_org_admin(org uuid) → boolean`: role em `Admin|Owner|Board`.
- `workstation.has_space_access(org uuid, space uuid) → boolean`: admin OU membro do Space.
- `workstation.can_manage_space(org uuid, space uuid) → boolean`: admin OU (`Staff` E membro do Space).

Todas com `revoke execute from public/anon` exceto as usadas em policies (que precisam de execute para `authenticated`).

### Matriz capability → RLS (leitura)

| Tabela | Policy SELECT (`authenticated`) |
|---|---|
| `organizations` | membro ativo da organização |
| `organization_members` | membro ativo da mesma organização |
| `spaces` | `is_active_member` E (`is_org_admin` OU membro do Space) |
| `space_members` | mesma regra do Space referenciado |
| `processes`, `process_nodes`, `node_connections` | `has_space_access(organization_id, space_id)` |
| `process_runs`, `node_runs` | `has_space_access(organization_id, space_id)` |

Viewer, User, Staff enxergam apenas Spaces atribuídos; Admin/Owner/Board enxergam a organização inteira. Cross-org é negado já em `is_active_member`.

### Matriz capability → RPC (escrita, Fases 2–4)

| Capability | Papéis | Verificação na RPC |
|---|---|---|
| `space.manage` | Admin/Owner/Board org-wide; Staff | criar: role ∈ admin∪Staff; editar/arquivar: `can_manage_space` |
| `space.members.manage` | Admin/Owner/Board | `is_org_admin` |
| `process.manage` | Admin/Owner/Board; Staff no Space | `can_manage_space` |
| `process.run` (start/cancel) | Admin/Owner/Board; Staff/User no Space | `has_space_access` E role ≠ Viewer |
| `run.retry` | Admin/Owner/Board; Staff no Space | `can_manage_space` (User não possui `run.retry`) |

O domínio TypeScript continua validando capability antes (erro claro na UI, PRD §6.4); a RPC revalida sempre (barreira final).

### Regras de implementação

- Policies usam apenas as funções helper (nunca subqueries repetidas), mantendo o plano de execução estável e a revisão de segurança legível.
- Funções privilegiadas: schema-qualified, `search_path` fixo, autorização explícita na primeira instrução; erro `permission_denied` mapeável para o `DomainErrorCode` existente.
- Cada combinação papel × operação exige teste positivo e negativo (PRD §6); ver `supabase/tests/database/` e `tests/integration/`.
- `auth.uid()` é a única fonte de identidade; o cliente nunca envia `organization_id` como autoridade — o servidor resolve organização pelo slug da rota + membership (Fase 1).

## Alternativas rejeitadas

- Policies de escrita diretas para `authenticated`: impossibilitam idempotência + auditoria + outbox atômicos via PostgREST (sem transação multi-statement no supabase-js) e duplicam a matriz de autorização em dois lugares mutáveis.
- Claims de role no JWT: papéis mudam em runtime (assignment de Space); membership no banco é a fonte de verdade.

## Consequências

- A Fase 2 implementa as RPCs de comando; até lá o banco aceita apenas leitura para usuários e escrita por service role (worker/testes).
- Realtime (`postgres_changes`) respeita as mesmas policies de SELECT — nenhum evento vaza além do escopo do Space.
