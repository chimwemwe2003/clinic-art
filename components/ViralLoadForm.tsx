'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

export default function ViralLoadForm({ patientId }: { patientId: string }) {
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
      testDate: fd.get('testDate'),
      copiesPerMl: Number(fd.get('copiesPerMl')),
    }
    const res = await fetch('/api/viral-loads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setSubmitting(false)
    if (!res.ok) {
      setError('Could not save viral load result.')
      return
    }
    setOpen(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
      >
        + Add viral load
      </button>
    )
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-lg border bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold">New viral load result</div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Test date" required>
          <input name="testDate" type="date" required defaultValue={today} className="input" />
        </Field>
        <Field label="Copies / mL" required>
          <input
            name="copiesPerMl"
            type="number"
            min={0}
            required
            placeholder="e.g. 50"
            className="input"
          />
        </Field>
      </div>
      <p className="text-xs text-slate-500">
        Suppressed = below 1,000 copies/mL (computed automatically).
      </p>

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
          {submitting ? 'Saving…' : 'Save'}
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
