import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import VisitForm from '@/components/VisitForm'
import ViralLoadForm from '@/components/ViralLoadForm'
import ViralLoadChart from '@/components/ViralLoadChart'

export const dynamic = 'force-dynamic'

const statusStyle: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  LOST_TO_FOLLOWUP: 'bg-amber-100 text-amber-800',
  TRANSFERRED_OUT: 'bg-slate-100 text-slate-700',
  DECEASED: 'bg-red-100 text-red-800',
}

const fmtDate = (d: Date | null | undefined) =>
  d ? new Date(d).toISOString().slice(0, 10) : '—'

export default async function PatientDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const patient = await prisma.patient.findUnique({
    where: { id: params.id },
    include: {
      visits: {
        orderBy: { date: 'desc' },
        include: { user: { select: { name: true } } },
      },
      viralLoads: { orderBy: { testDate: 'asc' } },
    },
  })
  if (!patient) notFound()

  const chartData = patient.viralLoads.map((vl) => ({
    date: vl.testDate.toISOString().slice(0, 10),
    copiesPerMl: vl.copiesPerMl,
    suppressed: vl.suppressed,
  }))

  const latestVl = [...patient.viralLoads].sort(
    (a, b) => b.testDate.getTime() - a.testDate.getTime(),
  )[0]

  const age = new Date().getFullYear() - patient.birthYear

  return (
    <div className="space-y-6">
      <div>
        <Link href="/patients" className="text-sm text-slate-500 hover:underline">
          ← Back to patients
        </Link>
        <div className="mt-2 flex items-start justify-between">
          <div>
            <h1 className="font-mono text-2xl font-semibold">{patient.anonId}</h1>
            <p className="text-sm text-slate-600">
              {patient.sex} · {age} y · {patient.district}
            </p>
          </div>
          <span
            className={`rounded px-2 py-1 text-xs font-medium ${
              statusStyle[patient.status] ?? ''
            }`}
          >
            {patient.status}
          </span>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ProfileField label="Enrolled" value={fmtDate(patient.enrollmentDate)} />
        <ProfileField label="ART start" value={fmtDate(patient.artStartDate)} />
        <ProfileField
          label="Current regimen"
          value={patient.currentRegimen ?? '—'}
          mono
        />
        <ProfileField
          label="Latest VL"
          value={
            latestVl
              ? `${latestVl.copiesPerMl.toLocaleString()} cp/mL`
              : '—'
          }
          tone={latestVl ? (latestVl.suppressed ? 'good' : 'bad') : 'default'}
        />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Viral load</h2>
          <ViralLoadForm patientId={patient.id} />
        </div>
        <ViralLoadChart data={chartData} />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Visits</h2>
          <VisitForm patientId={patient.id} />
        </div>
        {patient.visits.length === 0 ? (
          <div className="rounded-lg border bg-white p-6 text-center text-sm text-slate-500">
            No visits recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Weight</th>
                  <th className="px-4 py-3">BP</th>
                  <th className="px-4 py-3">Adherence</th>
                  <th className="px-4 py-3">Notes</th>
                  <th className="px-4 py-3">Recorded by</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {patient.visits.map((v) => (
                  <tr key={v.id}>
                    <td className="px-4 py-3">{fmtDate(v.date)}</td>
                    <td className="px-4 py-3">
                      {v.weightKg != null ? `${v.weightKg} kg` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {v.bpSystolic && v.bpDiastolic
                        ? `${v.bpSystolic}/${v.bpDiastolic}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3">{v.adherence ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{v.notes ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{v.user.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function ProfileField({
  label,
  value,
  mono,
  tone = 'default',
}: {
  label: string
  value: string
  mono?: boolean
  tone?: 'default' | 'good' | 'bad'
}) {
  const toneClass = {
    default: 'text-slate-900',
    good: 'text-emerald-700',
    bad: 'text-red-700',
  }[tone]
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div
        className={`mt-1 text-base font-semibold ${toneClass} ${
          mono ? 'font-mono' : ''
        }`}
      >
        {value}
      </div>
    </div>
  )
}
