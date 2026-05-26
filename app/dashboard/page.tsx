import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import KpiCard from '@/components/KpiCard'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const role = session?.user.role

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalPatients,
    activeOnArt,
    enrolledThisMonth,
    visitsThisMonth,
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.patient.count({
      where: { status: 'ACTIVE', artStartDate: { not: null } },
    }),
    prisma.patient.count({
      where: { enrollmentDate: { gte: monthStart } },
    }),
    prisma.visit.count({
      where: { date: { gte: monthStart } },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-slate-600">
          Welcome back, {session?.user.name}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total patients" value={totalPatients} />
        <KpiCard label="Active on ART" value={activeOnArt} tone="good" />
        <KpiCard
          label="Enrolled this month"
          value={enrolledThisMonth}
          hint={now.toLocaleString('en', { month: 'long', year: 'numeric' })}
        />
        <KpiCard label="Visits this month" value={visitsThisMonth} />
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">
          Quick actions
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/patients/new"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            + Enroll patient
          </Link>
          <Link
            href="/patients"
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            All patients
          </Link>
          {role === 'MANAGER' && (
            <Link
              href="/reports"
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Reports
            </Link>
          )}
          <a
            href="/api/export/patients"
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Export patients CSV
          </a>
        </div>
      </div>
    </div>
  )
}
