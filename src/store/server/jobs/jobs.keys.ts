import type { JobId } from '@/entities/job'

export const jobsKeys = {
  all: ['jobs'] as const,
  list: () => [...jobsKeys.all, 'list'] as const,
  detail: (id: JobId) => [...jobsKeys.all, 'detail', id] as const,
}
