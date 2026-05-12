import z from 'zod'
import { HealthcareProviderExtraSchema } from './healthcare-provider-extra.schema'

export const DocTypeValues = ['dokter', 'dierenarts', 'verpleeg(st)er', 'bioloog'] as const
export const DocType = z.enum(DocTypeValues)
export type DocType = z.infer<typeof DocType>

export const HealthcareProviderSchema = z
  .object({
    id: z.number().int().default(-1),
    firstName: z.string().min(2).default('Dokter'),
    name: z.string().min(3).default('Familienaam'),
    address: z.string().min(1).default('Geneeskundestraat 1, 1000 Brussel'),
    docType: DocType.default('dokter'),
    office: z.string().default('A'),
    offices: z.array(z.string()).default(['A']),
    hospital: z.number().optional(),
    requestCounter: z.int().default(0),
    active: z.boolean().default(false),
    firstSeenAt: z.string().datetime().optional(),
    extra: HealthcareProviderExtraSchema.optional(),
  })
  .describe('Schema for a healthcare provider')

export type HealthcareProvider = z.infer<typeof HealthcareProviderSchema>

export function createHealthcareProvider(override: Partial<HealthcareProvider> = {}): HealthcareProvider {
  return HealthcareProviderSchema.parse(override)
}
