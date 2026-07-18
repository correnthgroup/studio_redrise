import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function loadEnv(): Record<string, string> {
  const env: Record<string, string> = { ...process.env } as Record<string, string>
  const envPath = resolve(__dirname, '..', '.env')
  if (!existsSync(envPath)) return env
  const raw = readFileSync(envPath, 'utf-8')
  const content = raw.charCodeAt(0) === 0xFEFF ? raw.slice(1) : raw
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  for (const line of normalized.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq > 0) {
      env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
    }
  }
  return env
}

const env = loadEnv()
export default async function globalSetup() {
  if (!process.env.E2E_TEST_EMAIL || !process.env.E2E_TEST_PASSWORD) {
    throw new Error('[global-setup] Configure E2E_TEST_EMAIL and E2E_TEST_PASSWORD with a confirmed test account')
  }

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('[global-setup] Supabase admin environment unavailable; using the confirmed E2E account without provisioning')
    return
  }

  console.log('[global-setup] Supabase admin environment detected; test account provisioning remains external')
}
