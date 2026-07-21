# ADR-004 — Payload, snapshots e redação

- Status: Proposto (gate Fase 0 da PRD-024)
- Data: 2026-07-21
- Fonte: PRD-024 §5, §9; pendência §15 (limite/armazenamento de snapshots — decidir antes da Fase 3)

## Contexto

`node_runs` carrega `input_snapshot`/`output_snapshot`, `audit_log` carrega `before/after` e `outbox_events`/`run_events` carregam payloads. Segredos, credenciais e tokens não podem entrar em audit log, eventos, Realtime ou UI; payloads grandes não podem degradar o banco.

## Decisão

### Limites

1. Snapshots (`input_snapshot`, `output_snapshot`) são `jsonb` com limite de **32 KiB** por campo, garantido por CHECK `pg_column_size(...) <= 32768` e por truncamento aplicado no servidor/worker antes do insert.
2. Payload de `outbox_events`/`run_events`: limite de **16 KiB**; eventos carregam referências (ids) e o mínimo para o handler refazer a leitura autoritativa — nunca o estado inteiro.
3. `audit_log.before/after`: **16 KiB** por campo, já redigidos.
4. Truncamento é explícito: o objeto recebe `"_truncated": true` e mantém as chaves de primeiro nível; nunca truncar silenciosamente no meio de um JSON.

Estes limites resolvem a pendência da PRD §15 para a Fase 3; armazenamento externo (Storage) para payloads maiores fica fora do escopo v1 — o executor determinístico não os produz.

### Redação

5. Redação acontece **antes** de qualquer persistência ou publicação, na camada de servidor/worker (função única compartilhada `redactPayload`), nunca na UI.
6. Lista de chaves sensíveis (case-insensitive, por substring): `password`, `secret`, `token`, `api_key`, `apikey`, `authorization`, `credential`, `private_key`, `cookie`, `session`. Valores substituídos por `"[redacted]"` recursivamente.
7. Strings com formato de credencial (bearer, JWT `eyJ...`, chaves `sk-`/`pk-`) são redigidas por padrão mesmo fora de chaves sensíveis.
8. Realtime publica eventos mínimos (ids, status, stage, timestamps) — nunca snapshots (PRD §10); a UI busca o snapshot autoritativo via SELECT sob RLS.
9. `node_connections`, `process_nodes.config` e demais `jsonb` de configuração passam pela mesma redação ao entrar em `audit_log`.

### Contrato de exibição

10. A UI continua exibindo `inputSnapshot`/`outputSnapshot` do run (contrato de `ActionNodeRun`); o que ela recebe já é a versão redigida/truncada persistida. Não existe caminho para recuperar o valor bruto.

## Alternativas rejeitadas

- Armazenar payloads em Supabase Storage com ponteiro: complexidade e novo vetor de autorização sem necessidade no executor v1; decisão pode ser revisitada quando integrações externas existirem.
- Redação por view no banco: o dado bruto já estaria em disco/WAL/replica — redação precisa ocorrer antes do insert.

## Consequências

- CHECKs de tamanho tornam violação de limite um erro de programação visível em staging, não um incidente de produção.
- A função `redactPayload` ganha testes unitários próprios e é dependência obrigatória do worker (Fase 4) e do audit (Fase 3).
