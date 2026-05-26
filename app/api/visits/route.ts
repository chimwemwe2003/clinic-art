import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { visitSchema } from '@/lib/validators'
import { writeAudit } from '@/lib/audit'
import { Prisma } from '@prisma/client'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const json = await req.json()
  const parsed = visitSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 })
  }

  const visit = await prisma.visit.create({
    data: {
      ...parsed.data,
      recordedBy: session.user.id,
    },
  })
  await writeAudit(
    session.user.id,
    'visit.create',
    'Visit',
    visit.id,
    parsed.data as Prisma.InputJsonValue,
  )
  return NextResponse.json(visit, { status: 201 })
}
