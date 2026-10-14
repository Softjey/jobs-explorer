import type { JobDetails, JobId, JobSummary } from '@/entities/job'
import { jobDetailsSchema, jobSummarySchema } from '@/entities/job/job.schema'
import type { Paginated } from '@/entities/pagination'
import { paginatedSchema } from '@/entities/pagination/pagination.schema'
import { unwrapEnvelope } from '../envelope'
import type { HttpClient } from '../http-client'

interface GetManyParams {
  pageNum: number
  pageSize: number
}

export class JobsResource {
  private readonly basePath = '/work-assignments/public-jobs'

  constructor(private readonly http: HttpClient) {}

  async getMany({ pageNum, pageSize }: GetManyParams): Promise<Paginated<JobSummary>> {
    const query = new URLSearchParams({ pageNum: String(pageNum), pageSize: String(pageSize) })
    const response = await this.http.get(`${this.basePath}/list?${query.toString()}`)
    return unwrapEnvelope(response, paginatedSchema(jobSummarySchema))
  }

  async getOne(id: JobId): Promise<JobDetails> {
    const response = await this.http.get(`${this.basePath}/${encodeURIComponent(id)}`)
    return unwrapEnvelope(response, jobDetailsSchema)
  }
}
