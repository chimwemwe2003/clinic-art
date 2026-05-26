'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

const linkBase =
  'px-3 py-2 rounded-md text-sm font-medium transition-colors'

export default function NavBar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  if (status === 'loading' || !session) return null

  const role = session.user.role
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  const link = (href: string, label: string) => (
    <Link
      href={href}
      className={`${linkBase} ${
        isActive(href)
          ? 'bg-slate-900 text-white'
          : 'text-slate-700 hover:bg-slate-200'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-1">
          <Link href="/dashboard" className="mr-4 text-lg font-semibold">
            Clinic ART Tracker
          </Link>
          {link('/dashboard', 'Dashboard')}
          {link('/patients', 'Patients')}
          {role === 'MANAGER' && link('/reports', 'Reports')}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-600">
            {session.user.name}{' '}
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs uppercase text-slate-600">
              {role}
            </span>
          </span>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
