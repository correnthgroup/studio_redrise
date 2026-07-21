# PR-B6 — Settings, Team e Billing v1

**Branch:** `pr-b6-settings-team-billing-v1`  
**Trilha:** B (produto)  
**Depende de:** Workstation canário estável recomendado

## Objetivo

Completar as áreas administrativas mínimas para operação do RedRise após o Workstation estar viável.

## Escopo

- Settings/profile/team com dados reais.
- Convites/membership alinhados às tabelas `organizations`/`organization_members`.
- Billing v1 somente se contratos de negócio estiverem definidos.
- Sem misturar mudanças de Workstation no mesmo PR.

## Gate de aceite

- [ ] Admin consegue gerenciar membros sem quebrar RLS.
- [ ] Viewer/User não acessam ações administrativas.
- [ ] Billing não bloqueia uso interno/canário se ainda não contratado.
