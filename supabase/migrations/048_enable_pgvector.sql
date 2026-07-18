-- 048_enable_pgvector.sql
-- Enables the pgvector extension required by the Context Memory Layer (PRD-CML-001).
-- Idempotent: safe to re-run.

create extension if not exists vector with schema extensions;