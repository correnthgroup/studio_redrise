# PR-B1 — Organization Switcher com dados reais

**Branch:** `pr-b1-org-switcher-real-data`  
**Trilha:** B (produto após bootstrap)  
**Depende de:** A1

## Objetivo

Trocar dados fixos do shell/organization switcher por organizações e membership reais sem interferir no Workstation.

## Escopo

- Carregar organizações do usuário autenticado sob RLS.
- Exibir nome/slug/role reais no `OrganizationSwitcher` e `AppShell`.
- Redirecionar slug inválido ou sem membership.
- Manter UX atual; sem redesenho.

## Gate de aceite

- [ ] Usuário com múltiplas orgs alterna corretamente.
- [ ] Slug sem membership não vaza dados.
- [ ] Workstation memory/durable continuam funcionando.
- [ ] typecheck/lint/build.
