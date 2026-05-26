import RoleGuard from '@/components/RoleGuard'
import KpiCard from '@/components/KpiCard'
import {
  EnrollmentBarChart,
  SuppressionLineChart,
} from '@/components/ReportsCharts'
import {
  monthlyReport,
  monthlyEnrollmentSeries,
  monthlySuppressionSeries,
} from '@/lib/reports'

export const dynamic = 'force-dynamic'

function pct(n: number) {
  return `${(n * 100).toFixed(1)}%`
}

export default async function ReportsPage() {
  return (
    <RoleGuard allow={['MANAGER']}>
      <ReportsContent />
    </RoleGuard>
  )
}

async function ReportsContent() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const [summary, enrollmentSeries, suppressionSeries] = await Promise.all([
    monthlyReport(year, month),
    monthlyEnrollmentSeries(12),
    monthlySuppressionSeries(12),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Reports</h1>
          <p className="text-sm text-slate-600">
            {now.toLocaleString('en', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <a
          href="/api/export/patients"
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Export patients CSV
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="New enrollments this month"
          value={summary.enrolled}
        />
        <KpiCard
          label="Active on ART"
          value={summary.activeOnArt}
          hint={`of ${summary.totalEnrolled} total`}
          tone="good"
        />
        <KpiCard
          label="Retention rate"
          value={pct(summary.retentionRate)}
          hint="active / total enrolled"
        />
        <KpiCard
          label="Viral suppression rate"
          value={pct(summary.suppressionRate)}
          hint={`${summary.suppressed}/${summary.tested} tested in last 12 mo`}
          tone={summary.suppressionRate >= 0.9 ? 'good' : 'warn'}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <EnrollmentBarChart data={enrollmentSeries} />
        <SuppressionLineChart data={suppressionSeries} />
      </div>
    </div>
  )
}
