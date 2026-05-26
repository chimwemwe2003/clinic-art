'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

const DISTRICTS = ['Lusaka', 'Ndola', 'Kitwe', 'Livingstone', 'Kabwe']
const REGIMENS = ['TDF/3TC/DTG', 'TDF/FTC/EFV', 'ABC/3TC/DTG', 'AZT/3TC/NVP']

export default function PatientForm() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const payload = {
      anonId: String(fd.get('anonId') || '').trim(),
      sex: fd.get('sex'),
      birthYear: Number(fd.get('birthYear')),
      district: fd.get('district'),
      enrollmentDate: fd.get('enrollmentDate'),
      artStartDate: fd.get('artStartDate') || null,
      currentRegimen: fd.get('currentRegimen') || null,
    }

    const res = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setSubmitting(false)

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(typeof body.error === 'string' ? body.error : 'Could not create patient.')
      return
    }
    const patient = await res.json()
    router.push(`/patients/${patient.id}`)
    router.refresh()
  }

  const thisYear = new Date().getFullYear()
  const today = new Date().toISOString().slice(0, 10)

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Anonymized patient ID" required>
          <input
            name="anonId"
            required
            placeholder="AHF-XXXXXX"
            className="input"
          />
        </Field>
        <Field label="Sex" required>
          <select name="sex" required defaultValue="" className="input">
            <option value="" disabled>
              Select…
            </option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </Field>
        <Field label="Birth year" required>
          <input
            name="birthYear"
            type="number"
            min={1900}
            max={thisYear}
            required
            className="input"
          />
        </Field>
        <Field label="District" required>
          <select name="district" required defaultValue="" className="input">
            <option value="" disabled>
              Select…
            </option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Enrollment date" required>
          <input
            name="enrollmentDate"
            type="date"
            required
            defaultValue={today}
            className="input"
          />
        </Field>
        <Field label="ART start date">
          <input name="artStartDate" type="date" className="input" />
        </Field>
        <Field label="Current regimen">
          <select name="currentRegimen" defaultValue="" className="input">
            <option value="">—</option>
            {REGIMENS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {submitting ? 'Saving…' : 'Enroll patient'}
        </button>
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          border-radius: 0.375rem;
          border: 1px solid rgb(203 213 225);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        :global(.input:focus) {
          border-color: rgb(100 116 139);
        }
      `}</style>
    </form>
  )
}

function Field({
  label,
  children,
  required,
}: {
  label: string
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-medium uppercase text-slate-600">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </div>
      {children}
    </label>
  )
}
