# PR-C1 — CI e Definition of Done para vendor

**Branch:** `pr-c1-ci-definition-of-done`  
**Trilha:** C (processo)  
**Depende de:** A1 recomendado

## Objetivo

Garantir que todo PR da empresa tenha validação mínima, checklist e gate de segurança.

## Escopo

- GitHub PR template com checklist do `VENDOR_ENGAGEMENT.md`.
- CI para `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run build`.
- Job opcional/segregado para `npm run test:db` quando secrets estiverem disponíveis.
- Job opcional para Playwright smoke.
- Regras de branch/proteção recomendadas.

## Gate de aceite

- [ ] PR template ativo.
- [ ] CI bloqueia erro de lint/typecheck/unit/build.
- [ ] `test:db` documentado e seguro sem vazar secrets.
- [ ] DoD repetido no corpo do PR GitHub.
