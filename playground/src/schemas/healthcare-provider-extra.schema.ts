import z from 'zod'

export const ExtraTypeValues = ['foo', 'bar'] as const
export const ExtraType = z.enum(ExtraTypeValues)
export type ExtraType = z.infer<typeof ExtraType>

export const HealthcareProviderExtraSchema = z.object({
  requestedAt: z.string().datetime().optional(),
  requestedTime: z.string().datetime().optional(),
  extraType: ExtraType.default('foo'),
  description: z.string().optional(),
})

export type HealthcareProviderExtra = z.infer<typeof HealthcareProviderExtraSchema>

export function createHealthcareProviderExtra(
  override: Partial<HealthcareProviderExtra> = {},
): HealthcareProviderExtra {
  return HealthcareProviderExtraSchema.parse(override)
}
