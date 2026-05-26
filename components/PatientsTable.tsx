import Link from 'next/link'
import type { Patient } from '@prisma/client'

const statusStyle: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  LOST_TO_FOLLOWUP: 'bg-amber-100 text-amber-800',
  TRANSFERRED_OUT: 'bg-slate-100 text-slate-700',
  DECEASED: 'bg-red-100 text-red-800',
}

const fmtDate = (d: Date | null) =>
  d ? new Date(d).toISOString().slice(0, 10) : '—'

export default function PatientsTable({ patients }: { patients: Patient[] }) {
  if (patients.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center text-sm text-slate-500">
        No patients match your filters.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
          <tr>
            <th className="px-4 py-3">Anon ID</th>
            <th className="px-4 py-3">Sex</th>
            <th className="px-4 py-3">Birth year</th>
            <th className="px-4 py-3">District</th>
            <th className="px-4 py-3">Enrolled</th>
            <th className="px-4 py-3">ART start</th>
            <th className="px-4 py-3">Regimen</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {patients.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-mono">
                <Link
                  href={`/patients/${p.id}`}
                  className="font-medium text-slate-900 hover:underline"
                >
                  {p.anonId}
                </Link>
              </td>
              <td className="px-4 py-3">{p.sex}</td>
              <td className="px-4 py-3">{p.birthYear}</td>
              <td className="px-4 py-3">{p.district}</td>
              <td className="px-4 py-3">{fmtDate(p.enrollmentDate)}</td>
              <td className="px-4 py-3">{fmtDate(p.artStartDate)}</td>
              <td className="px-4 py-3 font-mono text-xs">
                {p.currentRegimen ?? '—'}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${
                    statusStyle[p.status] ?? ''
                  }`}
                >
                  {p.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
