import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { patientUpdateSchema } from '@/lib/validators'
import { writeAudit } from '@/lib/audit'
import { Prisma } from '@prisma/client'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const patient = await prisma.patient.findUnique({
    where: { id: params.id },
    include: {
      visits: { orderBy: { date: 'desc' } },
      viralLoads: { orderBy: { testDate: 'desc' } },
    },
  })
  if (!patient) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(patient)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const json = await req.json()
  const parsed = patientUpdateSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 })
  }

  try {
    const patient = await prisma.patient.update({
      where: { id: params.id },
      data: parsed.data,
    })
    await writeAudit(
      session.user.id,
      'patient.update',
      'Patient',
      patient.id,
      parsed.data as Prisma.InputJsonValue,
    )
    return NextResponse.json(patient)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    throw err
  }
}
