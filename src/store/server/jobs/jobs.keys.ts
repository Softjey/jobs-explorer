export const jobsKeys = {
  all: ['jobs'] as const,
  list: () => [...jobsKeys.all, 'list'] as const,
  detail: (id: string) => [...jobsKeys.all, 'detail', id] as const,
}
