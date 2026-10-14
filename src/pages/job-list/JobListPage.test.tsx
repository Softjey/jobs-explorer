import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import list from '@/test/fixtures/list.json'
import { triggerIntersection } from '@/test/intersection'
import { renderApp } from '@/test/render'
import { server } from '@/test/server'

describe('JobListPage', () => {
  it('shows skeletons while loading', async () => {
    server.use(http.get('*/list', () => new Promise(() => undefined)))
    await renderApp('/')
    expect((await screen.findAllByTestId('job-card-skeleton')).length).toBeGreaterThan(0)
  })

  it('renders a card per job with name and wage', async () => {
    await renderApp('/')
    expect(await screen.findByRole('link', { name: 'Stammdatenerfassung' })).toHaveAttribute(
      'href',
      '/job/3b9d71a8-f900-496b-b0d0-433d587fbe04',
    )
    expect(screen.getAllByText('CHF 27.50')).not.toHaveLength(0)
    expect(screen.queryByTestId('job-card-skeleton')).not.toBeInTheDocument()
  })

  it('shows an error with Retry and recovers', async () => {
    server.use(http.get('*/list', () => HttpResponse.json({ error: true }, { status: 404 })))
    await renderApp('/')
    expect(await screen.findByText('Could not load jobs')).toBeInTheDocument()

    server.resetHandlers()
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(await screen.findByRole('link', { name: 'Stammdatenerfassung' })).toBeInTheDocument()
  })

  it('shows an empty state', async () => {
    server.use(
      http.get('*/list', () => HttpResponse.json({ ...list, data: { items: [], total: 0 } })),
    )
    await renderApp('/')
    expect(await screen.findByText('No jobs')).toBeInTheDocument()
  })

  it('loads the next page when the sentinel becomes visible', async () => {
    await renderApp('/')
    await screen.findByRole('link', { name: 'Stammdatenerfassung' })
    expect(screen.getAllByRole('article')).toHaveLength(3)

    triggerIntersection()
    await waitFor(() => {
      expect(screen.getAllByRole('article')).toHaveLength(6)
    })
  })

  it('shows the end of the list when everything is loaded', async () => {
    server.use(
      http.get('*/list', () => HttpResponse.json({ ...list, data: { ...list.data, total: 3 } })),
    )
    await renderApp('/')
    expect(await screen.findByText('End of list')).toBeInTheDocument()
  })

  it('keeps loaded cards and offers Retry when the next page fails', async () => {
    let calls = 0
    server.use(
      http.get('*/list', () => {
        calls += 1
        return calls === 1
          ? HttpResponse.json(list)
          : HttpResponse.json({ error: true }, { status: 500 })
      }),
    )
    await renderApp('/')
    await screen.findByRole('link', { name: 'Stammdatenerfassung' })

    triggerIntersection()
    const row = await screen.findByText('Could not load more jobs')
    expect(
      within(row.parentElement as HTMLElement).getByRole('button', { name: 'Retry' }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(3)
  })

  it('shows an error on a network failure', async () => {
    server.use(http.get('*/list', () => HttpResponse.error()))
    await renderApp('/')
    expect(await screen.findByText('Could not load jobs')).toBeInTheDocument()
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
  })

  it('shows an error when the response does not match the schema', async () => {
    server.use(http.get('*/list', () => HttpResponse.json({ status: 200, data: { items: 'x' } })))
    await renderApp('/')
    expect(await screen.findByText('Could not load jobs')).toBeInTheDocument()
  })

  it('does not show the end of list while a page fails to load', async () => {
    server.use(http.get('*/list', () => HttpResponse.error()))
    await renderApp('/')
    await screen.findByText('Could not load jobs')
    expect(screen.queryByText('End of list')).not.toBeInTheDocument()
  })
})
