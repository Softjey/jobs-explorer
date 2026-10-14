import { env } from '@/lib/env'
import { HttpClient } from './http-client'
import { JobsResource } from './resources/jobs.resource'

class Api {
  readonly jobs: JobsResource

  constructor(http: HttpClient) {
    this.jobs = new JobsResource(http)
  }
}

export const api = new Api(new HttpClient(env.VITE_API_BASE_URL))
