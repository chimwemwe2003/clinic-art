import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { patientSchema } from '@/lib/validators'
import { writeAudit } from '@/lib/audit'
import { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  const district = searchParams.get('district') || undefined
  const status = searchParams.get('status') || undefined

  const where: Prisma.PatientWhereInput = {}
  if (q) where.anonId = { contains: q, mode: 'insensitive' }
  if (district) where.district = district
  if (status) where.status = status as Prisma.EnumPatientStatusFilter['equals']

  const patients = await prisma.patient.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 500,
  })
  return NextResponse.json(patients)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const json = await req.json()
  const parsed = patientSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 })
  }

  try {
    const patient = await prisma.patient.create({ data: parsed.data })
    await writeAudit(
      session.user.id,
      'patient.create',
      'Patient',
      patient.id,
      parsed.data as Prisma.InputJsonValue,
    )
    return NextResponse.json(patient, { status: 201 })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ error: 'anonId already exists' }, { status: 409 })
    }
    throw err
  }
}
