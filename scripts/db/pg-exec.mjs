#!/usr/bin/env node
/**
 * Executa SQL contra o Postgres apontado por SUPABASE_DB_URL (env, nunca arquivo).
 *
 * Uso:
 *   node scripts/db/pg-exec.mjs --query "select version()"
 *   node scripts/db/pg-exec.mjs --file supabase/tests/database/workstation_rls.test.sql --tap
 *
 * Com --tap, interpreta a saída como TAP (pgTAP): imprime as linhas de teste e
 * sai com código 1 se houver qualquer "not ok". Nenhuma credencial é lida de
 * arquivos nem impressa.
 */

import { readFileSync } from "node:fs"
import process from "node:process"

const { Client } = await import("pg")

function parseArgs(argv) {
  const args = { tap: false, file: null, query: null }
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === "--tap") args.tap = true
    else if (argv[i] === "--file") args.file = argv[++i]
    else if (argv[i] === "--query") args.query = argv[++i]
  }
  return args
}

const args = parseArgs(process.argv)
const connectionString = process.env.SUPABASE_DB_URL

if (!connectionString) {
  console.error("SUPABASE_DB_URL is not set (build it in-process from the environment; never store it in files).")
  process.exit(2)
}
if (!args.file && !args.query) {
  console.error("Provide --file <path> or --query <sql>.")
  process.exit(2)
}

const sql = (args.query ?? readFileSync(args.file, "utf8")).replace(/^\uFEFF/, "")
// Pooler certs may not chain to a public CA; never log the connection string.
const sanitizedUrl = connectionString.replace(/([?&])sslmode=[^&]*/g, "$1").replace(/[?&]$/, "")
const client = new Client({
  connectionString: sanitizedUrl,
  ssl: { rejectUnauthorized: false },
})

try {
  await client.connect()
  const outcome = await client.query(sql)
  const results = Array.isArray(outcome) ? outcome : [outcome]
  const lines = []
  for (const result of results) {
    for (const row of result.rows ?? []) {
      for (const value of Object.values(row)) {
        if (value !== null && value !== undefined && String(value).length > 0) lines.push(String(value))
      }
    }
  }

  if (args.tap) {
    for (const line of lines) console.log(line)
    const failures = lines.filter((line) => /^not ok/m.test(line))
    const testLines = lines.filter((line) => /^(ok|not ok) /m.test(line))
    console.log(`\nTAP summary: ${testLines.length - failures.length}/${testLines.length} passed`)
    process.exit(failures.length > 0 ? 1 : 0)
  } else {
    for (const result of results) {
      for (const row of result.rows ?? []) console.log(JSON.stringify(row))
    }
  }
} catch (error) {
  console.error(`SQL execution failed: ${error.message}`)
  process.exit(1)
} finally {
  await client.end().catch(() => {})
}
