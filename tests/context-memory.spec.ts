import { expect, test } from '@playwright/test'
import { openAuthenticatedApp } from './support/app'

test.describe('Context Memory', () => {
  test.beforeEach(async ({ page }) => {
    await openAuthenticatedApp(page)
    await page.goto('/default/context')
  })

  test('renders the context memory page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Context Memory/i })).toBeVisible({
      timeout: 15000,
    })
    await expect(page.getByRole('tab', { name: /Indexed Documents/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Search Console/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Context Pack Builder/i })).toBeVisible()
  })

  test('search console tab accepts a query', async ({ page }) => {
    await page.getByRole('tab', { name: /Search Console/i }).click()
    await page.getByLabel(/Query/i).first().fill('WS-ACTIONS')
    await page.getByRole('button', { name: /^Search$/i }).click()
    await expect(page.getByText(/Run a search|No matches|matches/)).toBeVisible({
      timeout: 10000,
    })
  })

  test('context pack builder renders output area', async ({ page }) => {
    await page.getByRole('tab', { name: /Context Pack Builder/i }).click()
    await page.getByLabel(/Objective/i).first().fill('Implement WS-ACTIONS run history')
    await expect(page.getByRole('button', { name: /Generate/i })).toBeVisible()
  })

  test('entities and relations tab is reachable', async ({ page }) => {
    await page.getByRole('tab', { name: /Entities & Relations/i }).click()
    await expect(
      page.getByText(/No entities extracted|Entities \(\d+\)/i),
    ).toBeVisible({ timeout: 10000 })
  })
})