import { z } from 'zod'

export const patientSchema = z.object({
  anonId: z.string().min(3).max(32),
  sex: z.enum(['MALE', 'FEMALE', 'OTHER']),
  birthYear: z.number().int().min(1900).max(new Date().getFullYear()),
  district: z.string().min(2),
  enrollmentDate: z.coerce.date(),
  artStartDate: z.coerce.date().optional().nullable(),
  currentRegimen: z.string().optional().nullable(),
  status: z
    .enum(['ACTIVE', 'LOST_TO_FOLLOWUP', 'TRANSFERRED_OUT', 'DECEASED'])
    .optional(),
})

export const patientUpdateSchema = patientSchema.partial()

export const visitSchema = z.object({
  patientId: z.string(),
  date: z.coerce.date(),
  weightKg: z.number().positive().optional().nullable(),
  bpSystolic: z.number().int().optional().nullable(),
  bpDiastolic: z.number().int().optional().nullable(),
  adherence: z.enum(['GOOD', 'FAIR', 'POOR']).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
})

export const viralLoadSchema = z.object({
  patientId: z.string(),
  testDate: z.coerce.date(),
  copiesPerMl: z.number().int().nonnegative(),
})

export type PatientInput = z.infer<typeof patientSchema>
export type VisitInput = z.infer<typeof visitSchema>
export type ViralLoadInput = z.infer<typeof viralLoadSchema>
