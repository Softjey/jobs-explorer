import type { z } from 'zod'
import type { moneySchema } from './money.schema'

export type Money = z.infer<typeof moneySchema>
