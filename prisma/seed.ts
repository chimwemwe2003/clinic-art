import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

const districts = ['Lusaka', 'Ndola', 'Kitwe', 'Livingstone', 'Kabwe']
const regimens = ['TDF/3TC/DTG', 'TDF/FTC/EFV', 'ABC/3TC/DTG', 'AZT/3TC/NVP']

async function main() {
  await prisma.auditLog.deleteMany()
  await prisma.viralLoad.deleteMany()
  await prisma.visit.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await bcrypt.hash('demo1234', 10)

  const manager = await prisma.user.create({
    data: {
      email: 'manager@demo.ahf',
      name: 'Mary Manager',
      password: passwordHash,
      role: 'MANAGER',
    },
  })

  const clinician = await prisma.user.create({
    data: {
      email: 'clinician@demo.ahf',
      name: 'Chris Clinician',
      password: passwordHash,
      role: 'CLINICIAN',
    },
  })

  for (let i = 0; i < 50; i++) {
    const enrollmentDate = faker.date.between({ from: '2024-01-01', to: '2026-05-01' })
    const hasArt = faker.datatype.boolean({ probability: 0.9 })
    const artStartDate = hasArt ? faker.date.soon({ days: 30, refDate: enrollmentDate }) : null

    const patient = await prisma.patient.create({
      data: {
        anonId: `AHF-${faker.string.alphanumeric({ length: 6, casing: 'upper' })}`,
        sex: faker.helpers.arrayElement(['MALE', 'FEMALE']),
        birthYear: faker.number.int({ min: 1960, max: 2010 }),
        district: faker.helpers.arrayElement(districts),
        enrollmentDate,
        artStartDate,
        currentRegimen: artStartDate ? faker.helpers.arrayElement(regimens) : null,
        status: faker.helpers.weightedArrayElement([
          { value: 'ACTIVE', weight: 80 },
          { value: 'LOST_TO_FOLLOWUP', weight: 10 },
          { value: 'TRANSFERRED_OUT', weight: 5 },
          { value: 'DECEASED', weight: 5 },
        ]),
      },
    })

    const visitCount = faker.number.int({ min: 1, max: 4 })
    for (let v = 0; v < visitCount; v++) {
      await prisma.visit.create({
        data: {
          patientId: patient.id,
          date: faker.date.between({ from: enrollmentDate, to: new Date() }),
          weightKg: Number(faker.number.float({ min: 45, max: 90, fractionDigits: 1 }).toFixed(1)),
          bpSystolic: faker.number.int({ min: 100, max: 145 }),
          bpDiastolic: faker.number.int({ min: 60, max: 95 }),
          adherence: faker.helpers.arrayElement(['GOOD', 'FAIR', 'POOR']),
          recordedBy: clinician.id,
        },
      })
    }

    const vlCount = faker.number.int({ min: 1, max: 3 })
    for (let v = 0; v < vlCount; v++) {
      const copies = faker.helpers.weightedArrayElement([
        { value: faker.number.int({ min: 0, max: 999 }), weight: 80 },
        { value: faker.number.int({ min: 1000, max: 100000 }), weight: 20 },
      ])
      await prisma.viralLoad.create({
        data: {
          patientId: patient.id,
          testDate: faker.date.between({ from: enrollmentDate, to: new Date() }),
          copiesPerMl: copies,
          suppressed: copies < 1000,
        },
      })
    }
  }

  console.log(`Seeded users: ${manager.email}, ${clinician.email} (password: demo1234)`)
  console.log('Seeded 50 patients with visits + viral loads.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
