'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

export default function VisitForm({ patientId }: { patientId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const payload = {
      patientId,
      date: fd.get('date'),
      weightKg: fd.get('weightKg') ? Number(fd.get('weightKg')) : null,
      bpSystolic: fd.get('bpSystolic') ? Number(fd.get('bpSystolic')) : null,
      bpDiastolic: fd.get('bpDiastolic') ? Number(fd.get('bpDiastolic')) : null,
      adherence: fd.get('adherence') || null,
      notes: fd.get('notes') || null,
    }
    const res = await fetch('/api/visits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setSubmitting(false)
    if (!res.ok) {
      setError('Could not save visit.')
      return
    }
    setOpen(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
      >
        + Add visit
      </button>
    )
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-lg border bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold">New visit</div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Field label="Date" required>
          <input name="date" type="date" required defaultValue={today} className="input" />
        </Field>
        <Field label="Weight (kg)">
          <input name="weightKg" type="number" step="0.1" className="input" />
        </Field>
        <Field label="BP systolic">
          <input name="bpSystolic" type="number" className="input" />
        </Field>
        <Field label="BP diastolic">
          <input name="bpDiastolic" type="number" className="input" />
        </Field>
        <Field label="Adherence">
          <select name="adherence" defaultValue="" className="input">
            <option value="">—</option>
            <option value="GOOD">Good</option>
            <option value="FAIR">Fair</option>
            <option value="POOR">Poor</option>
          </select>
        </Field>
      </div>
      <Field label="Notes">
        <textarea name="notes" rows={2} maxLength={1000} className="input" />
      </Field>

      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {submitting ? 'Saving…' : 'Save visit'}
        </button>
      </div>
      <style jsx>{`
        :global(.input) {
          width: 100%;
          border-radius: 0.375rem;
          border: 1px solid rgb(203 213 225);
          padding: 0.4rem 0.6rem;
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
