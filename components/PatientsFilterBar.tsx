'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

const DISTRICTS = ['Lusaka', 'Ndola', 'Kitwe', 'Livingstone', 'Kabwe']
const STATUSES = [
  'ACTIVE',
  'LOST_TO_FOLLOWUP',
  'TRANSFERRED_OUT',
  'DECEASED',
] as const

export default function PatientsFilterBar() {
  const router = useRouter()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()

  const [q, setQ] = useState(params.get('q') ?? '')
  const [district, setDistrict] = useState(params.get('district') ?? '')
  const [status, setStatus] = useState(params.get('status') ?? '')

  function apply(next: Partial<{ q: string; district: string; status: string }>) {
    const sp = new URLSearchParams(params.toString())
    const fields = { q, district, status, ...next }
    for (const [k, v] of Object.entries(fields)) {
      if (v) sp.set(k, v)
      else sp.delete(k)
    }
    startTransition(() => router.push(`/patients?${sp.toString()}`))
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        apply({ q })
      }}
      className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4 shadow-sm"
    >
      <div className="flex-1 min-w-[200px]">
        <label className="mb-1 block text-xs font-medium uppercase text-slate-600">
          Search anon ID
        </label>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="AHF-XXXXXX"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium uppercase text-slate-600">
          District
        </label>
        <select
          value={district}
          onChange={(e) => {
            setDistrict(e.target.value)
            apply({ district: e.target.value })
          }}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All</option>
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium uppercase text-slate-600">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            apply({ status: e.target.value })
          }}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {pending ? 'Searching…' : 'Search'}
      </button>
      {(q || district || status) && (
        <button
          type="button"
          onClick={() => {
            setQ('')
            setDistrict('')
            setStatus('')
            startTransition(() => router.push('/patients'))
          }}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Clear
        </button>
      )}
    </form>
  )
}
