import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { viralLoadSchema } from '@/lib/validators'
import { writeAudit } from '@/lib/audit'
import { Prisma } from '@prisma/client'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const json = await req.json()
  const parsed = viralLoadSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 })
  }

  const suppressed = parsed.data.copiesPerMl < 1000
  const vl = await prisma.viralLoad.create({
    data: { ...parsed.data, suppressed },
  })
  await writeAudit(
    session.user.id,
    'viralLoad.create',
    'ViralLoad',
    vl.id,
    { ...parsed.data, suppressed } as Prisma.InputJsonValue,
  )
  return NextResponse.json(vl, { status: 201 })
}
