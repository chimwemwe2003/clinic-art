import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import PatientsTable from '@/components/PatientsTable'
import PatientsFilterBar from '@/components/PatientsFilterBar'
import type { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: { q?: string; district?: string; status?: string }
}) {
  const where: Prisma.PatientWhereInput = {}
  if (searchParams.q) {
    where.anonId = { contains: searchParams.q, mode: 'insensitive' }
  }
  if (searchParams.district) where.district = searchParams.district
  if (searchParams.status) {
    where.status = searchParams.status as Prisma.PatientWhereInput['status']
  }

  const patients = await prisma.patient.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 500,
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Patients</h1>
          <p className="text-sm text-slate-600">
            {patients.length} patient{patients.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/export/patients"
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Export CSV
          </a>
          <Link
            href="/patients/new"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            + Enroll patient
          </Link>
        </div>
      </div>

      <PatientsFilterBar />

      <PatientsTable patients={patients} />
    </div>
  )
}
