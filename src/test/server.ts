import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import details from './fixtures/details.json'
import list from './fixtures/list.json'
import notFound from './fixtures/not-found.json'

const API = '/api/work-assignments/public-jobs'

const handlers = [
  http.get(`*${API}/list`, () => HttpResponse.json(list)),
  http.get(`*${API}/:id`, ({ params }) =>
    params['id'] === details.data.workAssignmentId
      ? HttpResponse.json(details)
      : HttpResponse.json(notFound, { status: 404 }),
  ),
]

export const server = setupServer(...handlers)
