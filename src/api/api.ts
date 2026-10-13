import { HttpClient } from './http-client'
import { JobsResource } from './resources/jobs.resource'

class Api {
  readonly jobs: JobsResource

  constructor(http: HttpClient) {
    this.jobs = new JobsResource(http)
  }
}

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api'

export const api = new Api(new HttpClient(baseUrl))
