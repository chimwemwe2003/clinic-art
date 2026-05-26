import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  monthlyReport,
  monthlyEnrollmentSeries,
  monthlySuppressionSeries,
} from '@/lib/reports'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'MANAGER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const now = new Date()
  const year = Number(searchParams.get('year') ?? now.getFullYear())
  const month = Number(searchParams.get('month') ?? now.getMonth() + 1)

  const [summary, enrollmentSeries, suppressionSeries] = await Promise.all([
    monthlyReport(year, month),
    monthlyEnrollmentSeries(12),
    monthlySuppressionSeries(12),
  ])

  return NextResponse.json({ summary, enrollmentSeries, suppressionSeries })
}
