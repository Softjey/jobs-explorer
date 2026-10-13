import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { renderApp } from '@/test/render'
import { server } from '@/test/server'

const ID = '3b9d71a8-f900-496b-b0d0-433d587fbe04'
const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000'

describe('JobDetailsPage', () => {
  it('shows a skeleton while loading', async () => {
    server.use(http.get(`*/${ID}`, () => new Promise(() => undefined)))
    await renderApp(`/job/${ID}`)
    expect(await screen.findByTestId('job-details-skeleton')).toBeInTheDocument()
  })

  it('renders the job details', async () => {
    await renderApp(`/job/${ID}`)
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Stammdatenerfassung' }),
    ).toBeInTheDocument()
    expect(screen.getByText('CHF 27.50')).toBeInTheDocument()
    expect(screen.getByText('14 shifts · 109 h')).toBeInTheDocument()
    expect(screen.getByText(/Deine Aufgaben/)).toBeInTheDocument()
    expect(screen.queryByText('Clothing')).not.toBeInTheDocument()
  })

  it('shows the header from the list cache while details load', async () => {
    await renderApp('/')
    const link = await screen.findByRole('link', { name: 'Stammdatenerfassung' })
    server.use(http.get(`*/${ID}`, () => new Promise(() => undefined)))
    await userEvent.click(link)

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Stammdatenerfassung' }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('job-details-skeleton')).toBeInTheDocument()
  })

  it('shows not found when the API returns 404', async () => {
    await renderApp(`/job/${UNKNOWN_ID}`)
    expect(await screen.findByText('Job not found')).toBeInTheDocument()
  })

  it('shows not found without a request when the id is not a UUID', async () => {
    let requested = false
    server.use(
      http.get('*/not-a-uuid', () => {
        requested = true
        return HttpResponse.json({ error: true }, { status: 401 })
      }),
    )
    await renderApp('/job/not-a-uuid')
    expect(await screen.findByText('Job not found')).toBeInTheDocument()
    expect(requested).toBe(false)
  })

  it('shows an error with Retry and recovers', async () => {
    server.use(http.get(`*/${ID}`, () => HttpResponse.json({ error: true }, { status: 500 })))
    await renderApp(`/job/${ID}`)
    expect(await screen.findByText('Could not load the job')).toBeInTheDocument()

    server.resetHandlers()
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Stammdatenerfassung' }),
    ).toBeInTheDocument()
  })

  it('shows an error when the response has no data', async () => {
    server.use(http.get(`*/${ID}`, () => HttpResponse.json({ status: 200, error: false })))
    await renderApp(`/job/${ID}`)
    expect(await screen.findByText('Could not load the job')).toBeInTheDocument()
  })
})
