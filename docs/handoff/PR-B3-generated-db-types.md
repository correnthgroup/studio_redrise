# PR-B3 — Types gerados do Supabase

**Branch:** `pr-b3-generated-db-types`  
**Trilha:** B (qualidade)  
**Depende de:** A1

## Objetivo

Eliminar drift do `src/lib/database.types.ts` mantido à mão.

## Escopo

- Script para `supabase gen types typescript` em ambiente com acesso apropriado.
- CI verifica se o arquivo gerado está atualizado.
- Atualizar imports se o formato gerado divergir do arquivo atual.
- Documentar fallback sem Docker/CLI.

## Gate de aceite

- [ ] Types gerados batem com migrations 050+.
- [ ] CI falha se types estiverem desatualizados.
- [ ] Sem secrets em logs.
