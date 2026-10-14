import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import details from './fixtures/details.json'
import list from './fixtures/list.json'
import notFound from './fixtures/not-found.json'

const API = '/api/work-assignments/public-jobs'

/** The fixture list as page `pageNum`. Pages after the first get their own ids, like the real API. */
export function listPage(pageNum: number): typeof list {
  if (pageNum === 0) return list
  const suffix = pageNum.toString(16).padStart(4, '0')
  const items = list.data.items.map((item) => ({
    ...item,
    workAssignmentId: `${item.workAssignmentId.slice(0, -4)}${suffix}`,
  }))
  return { ...list, data: { ...list.data, items } }
}

const handlers = [
  http.get(`*${API}/list`, ({ request }) =>
    HttpResponse.json(listPage(Number(new URL(request.url).searchParams.get('pageNum') ?? 0))),
  ),
  http.get(`*${API}/:id`, ({ params }) =>
    params['id'] === details.data.workAssignmentId
      ? HttpResponse.json(details)
      : HttpResponse.json(notFound, { status: 404 }),
  ),
]

export const server = setupServer(...handlers)
