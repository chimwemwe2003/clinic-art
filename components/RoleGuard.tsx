import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import type { Role } from '@prisma/client'
import type { ReactNode } from 'react'

export default async function RoleGuard({
  allow,
  children,
}: {
  allow: Role[]
  children: ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if (!allow.includes(session.user.role)) redirect('/dashboard')
  return <>{children}</>
}
