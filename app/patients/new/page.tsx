import Link from 'next/link'
import PatientForm from '@/components/PatientForm'

export default function NewPatientPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <Link href="/patients" className="text-sm text-slate-500 hover:underline">
          ← Back to patients
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Enroll a new patient</h1>
        <p className="text-sm text-slate-600">
          Use an anonymized ID. Do not enter names or other identifying information.
        </p>
      </div>
      <PatientForm />
    </div>
  )
}
