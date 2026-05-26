import { prisma } from './prisma'

export type MonthlyReport = {
  period: { year: number; month: number }
  enrolled: number
  activeOnArt: number
  totalEnrolled: number
  retentionRate: number
  suppressionRate: number
  tested: number
  suppressed: number
}

export async function monthlyReport(year: number, month: number): Promise<MonthlyReport> {
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 1)

  const enrolled = await prisma.patient.count({
    where: { enrollmentDate: { gte: start, lt: end } },
  })

  const activeOnArt = await prisma.patient.count({
    where: { status: 'ACTIVE', artStartDate: { not: null } },
  })

  const totalEnrolled = await prisma.patient.count()

  const twelveMoAgo = new Date()
  twelveMoAgo.setFullYear(twelveMoAgo.getFullYear() - 1)

  const recent = await prisma.viralLoad.findMany({
    where: { testDate: { gte: twelveMoAgo } },
    orderBy: { testDate: 'desc' },
    select: { patientId: true, suppressed: true },
  })

  const latestByPatient = new Map<string, boolean>()
  for (const vl of recent) {
    if (!latestByPatient.has(vl.patientId)) latestByPatient.set(vl.patientId, vl.suppressed)
  }
  const suppressed = Array.from(latestByPatient.values()).filter(Boolean).length
  const tested = latestByPatient.size

  return {
    period: { year, month },
    enrolled,
    activeOnArt,
    totalEnrolled,
    retentionRate: totalEnrolled ? activeOnArt / totalEnrolled : 0,
    suppressionRate: tested ? suppressed / tested : 0,
    tested,
    suppressed,
  }
}

export type EnrollmentPoint = { label: string; count: number }

export async function monthlyEnrollmentSeries(months = 12): Promise<EnrollmentPoint[]> {
  const now = new Date()
  const out: EnrollmentPoint[] = []
  for (let i = months - 1; i >= 0; i--) {
    const s = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const e = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    const count = await prisma.patient.count({
      where: { enrollmentDate: { gte: s, lt: e } },
    })
    out.push({
      label: s.toLocaleString('en', { month: 'short', year: '2-digit' }),
      count,
    })
  }
  return out
}

export type SuppressionPoint = { label: string; rate: number; tested: number }

export async function monthlySuppressionSeries(months = 12): Promise<SuppressionPoint[]> {
  const now = new Date()
  const out: SuppressionPoint[] = []
  for (let i = months - 1; i >= 0; i--) {
    const windowEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    const windowStart = new Date(windowEnd)
    windowStart.setFullYear(windowStart.getFullYear() - 1)

    const recent = await prisma.viralLoad.findMany({
      where: { testDate: { gte: windowStart, lt: windowEnd } },
      orderBy: { testDate: 'desc' },
      select: { patientId: true, suppressed: true },
    })
    const latestByPatient = new Map<string, boolean>()
    for (const vl of recent) {
      if (!latestByPatient.has(vl.patientId)) latestByPatient.set(vl.patientId, vl.suppressed)
    }
    const suppressed = Array.from(latestByPatient.values()).filter(Boolean).length
    const tested = latestByPatient.size

    const labelDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
    out.push({
      label: labelDate.toLocaleString('en', { month: 'short', year: '2-digit' }),
      rate: tested ? suppressed / tested : 0,
      tested,
    })
  }
  return out
}
