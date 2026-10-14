import { z } from 'zod'

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().min(1),
})

/** Validated environment. Throws at startup when a variable is missing or invalid. */
export const env = envSchema.parse(import.meta.env)
