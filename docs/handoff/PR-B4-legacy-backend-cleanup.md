# PR-B4 — Cleanup do backend legado (PRD-079)

**Branch:** `pr-b4-legacy-backend-cleanup`  
**Trilha:** B (manutenção)  
**Depende de:** A6 recomendado

## Objetivo

Remover ou arquivar com segurança artefatos legados `workspaces/flows/tasks` que não são fonte de verdade do RedRise atual.

## Escopo

- Inventário de migrations/functions/scripts legados.
- Decisão explícita: manter, arquivar ou remover.
- Garantir que Workstation durable não depende deles.
- Plano de rollback documental; sem drop destrutivo em produção sem aprovação humana.

## Gate de aceite

- [ ] Inventário aprovado.
- [ ] Código não usado removido ou marcado legado.
- [ ] Nenhuma rota atual quebra.
- [ ] Docs/memória atualizadas.
