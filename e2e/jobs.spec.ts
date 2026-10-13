import { expect, test, type Page } from '@playwright/test'
import details from './details.json' with { type: 'json' }
import list from './list.json' with { type: 'json' }
import notFound from './not-found.json' with { type: 'json' }

const ID = details.data.workAssignmentId
const NAME = details.data.workAssignmentName
const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000'

// a single page: the mock would otherwise return the same items for every pageNum
const onePageList = { ...list, data: { ...list.data, total: list.data.items.length } }

async function mockApi(page: Page) {
  await page.route('**/api/work-assignments/public-jobs/**', async (route) => {
    const { pathname } = new URL(route.request().url())
    if (pathname.endsWith('/list')) return route.fulfill({ json: onePageList })
    if (pathname.endsWith(`/${ID}`)) return route.fulfill({ json: details })
    return route.fulfill({ status: 404, json: notFound })
  })
}

test.beforeEach(async ({ page }) => {
  await mockApi(page)
})

test('open the list, open a job, see its details', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: NAME }).click()
  await expect(page).toHaveURL(`/job/${ID}`)
  await expect(page.getByRole('heading', { level: 1, name: NAME })).toBeVisible()
  await expect(page.getByText('Deine Aufgaben')).toBeVisible()
})

test('favourite survives a reload and can be un-marked', async ({ page }) => {
  await page.goto('/')
  const card = page.getByRole('article').filter({ hasText: NAME })
  await card.getByRole('button', { name: 'Add to favourites' }).click()

  await page.getByRole('link', { name: /Favourites/ }).click()
  await expect(page.getByRole('link', { name: NAME })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('link', { name: NAME })).toBeVisible()

  await page.getByRole('button', { name: 'Remove from favourites' }).click()
  await expect(page.getByText('No favourites yet')).toBeVisible()
})

test('direct links: valid id, unknown id, non-UUID id', async ({ page }) => {
  await page.goto(`/job/${ID}`)
  await expect(page.getByRole('heading', { level: 1, name: NAME })).toBeVisible()

  await page.goto(`/job/${UNKNOWN_ID}`)
  await expect(page.getByText('Job not found')).toBeVisible()

  await page.goto('/job/not-a-uuid')
  await expect(page.getByText('Job not found')).toBeVisible()
})
