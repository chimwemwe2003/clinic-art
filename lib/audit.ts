import { prisma } from './prisma'
import type { Prisma } from '@prisma/client'

export async function writeAudit(
  actorId: string,
  action: string,
  entity: string,
  entityId: string,
  payload?: Prisma.InputJsonValue,
) {
  await prisma.auditLog.create({
    data: { actorId, action, entity, entityId, payload },
  })
}
