import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto mt-16 max-w-md rounded-lg border bg-white p-8 text-center shadow-sm">
      <h1 className="text-xl font-semibold">Not found</h1>
      <p className="mt-2 text-sm text-slate-600">
        The page or resource you requested doesn’t exist.
      </p>
      <Link
        href="/dashboard"
        className="mt-4 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        Back to dashboard
      </Link>
    </div>
  )
}
