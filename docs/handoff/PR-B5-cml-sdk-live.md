# PR-B5 — CML SDK live server-only

**Branch:** `pr-b5-cml-sdk-live`  
**Trilha:** B (integração Correnth)  
**Depende de:** SDK/credenciais oficiais provisionados

## Objetivo

Ativar integração server-only com a CML externa, sem CML embutida nem fallback local.

## Escopo

- Usar SDK/API oficial `@correnth/context-memory/sdk` quando disponível.
- Consumir `CML_API_BASE_URL` e `CML_CONSUMER_ACCESS_TOKEN` server-side.
- Falha explícita se indisponível; sem corpus local, embeddings locais ou retrieval local.
- Testes de configuração ausente/invalid token/health.

## Gate de aceite

- [ ] Nenhum token em cliente, logs ou arquivos.
- [ ] CML indisponível retorna erro explícito.
- [ ] Sem Supabase/tabelas internas da CML acessadas diretamente.
