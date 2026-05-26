import { Suspense } from 'react'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="mx-auto mt-16 max-w-sm">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold">Clinic ART Tracker</h1>
        <p className="text-sm text-slate-600">Sign in to continue</p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-lg border bg-white p-6 shadow-sm">Loading…</div>
        }
      >
        <LoginForm />
      </Suspense>

      <div className="mt-4 rounded-md border border-dashed border-slate-300 bg-white p-3 text-xs text-slate-600">
        <div className="mb-1 font-semibold text-slate-700">Demo credentials</div>
        <div>
          Manager — <code className="rounded bg-slate-100 px-1">manager@demo.ahf</code> /{' '}
          <code className="rounded bg-slate-100 px-1">demo1234</code>
        </div>
        <div>
          Clinician — <code className="rounded bg-slate-100 px-1">clinician@demo.ahf</code> /{' '}
          <code className="rounded bg-slate-100 px-1">demo1234</code>
        </div>
      </div>
    </div>
  )
}
