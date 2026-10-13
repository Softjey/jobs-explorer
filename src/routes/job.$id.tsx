import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/job/$id')({
  component: () => <h1>Job</h1>,
})
