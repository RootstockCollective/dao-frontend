import { z } from 'zod'

export const AddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid address format')
export const SortDirectionEnum = z.enum(['asc', 'desc'])
