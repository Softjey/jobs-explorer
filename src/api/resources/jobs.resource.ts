import { jobDetailsSchema, jobSummarySchema } from '@/entities/job/job.schema'
import type { JobDetails, JobSummary } from '@/entities/job'
import { paginatedSchema } from '@/entities/pagination/pagination.schema'
import type { Paginated } from '@/entities/pagination'
import type { HttpClient } from '../http-client'

const BASE = '/work-assignments/public-jobs'

export interface GetManyParams {
  pageNum: number
  pageSize: number
}

export class JobsResource {
  constructor(private readonly http: HttpClient) {}

  getMany({ pageNum, pageSize }: GetManyParams): Promise<Paginated<JobSummary>> {
    const query = new URLSearchParams({ pageNum: String(pageNum), pageSize: String(pageSize) })
    return this.http.request(`${BASE}/list?${query.toString()}`, paginatedSchema(jobSummarySchema))
  }

  getOne(id: string): Promise<JobDetails> {
    return this.http.request(`${BASE}/${encodeURIComponent(id)}`, jobDetailsSchema)
  }
}
