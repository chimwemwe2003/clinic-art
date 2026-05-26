import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return ''
  const s = String(v)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const patients = await prisma.patient.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const headers = [
    'anonId',
    'sex',
    'birthYear',
    'district',
    'enrollmentDate',
    'artStartDate',
    'currentRegimen',
    'status',
    'createdAt',
  ]
  const rows = patients.map((p) =>
    [
      p.anonId,
      p.sex,
      p.birthYear,
      p.district,
      p.enrollmentDate.toISOString().slice(0, 10),
      p.artStartDate ? p.artStartDate.toISOString().slice(0, 10) : '',
      p.currentRegimen ?? '',
      p.status,
      p.createdAt.toISOString(),
    ]
      .map(csvEscape)
      .join(','),
  )
  const csv = [headers.join(','), ...rows].join('\n')

  const filename = `patients-${new Date().toISOString().slice(0, 10)}.csv`
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
