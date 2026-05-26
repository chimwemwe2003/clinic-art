'use client'

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'

type EnrollmentPoint = { label: string; count: number }
type SuppressionPoint = { label: string; rate: number; tested: number }

export function EnrollmentBarChart({ data }: { data: EnrollmentPoint[] }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-2 text-sm font-semibold text-slate-700">
        Monthly new enrollments (last 12 months)
      </div>
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" fontSize={12} />
            <YAxis fontSize={12} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#0f172a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function SuppressionLineChart({ data }: { data: SuppressionPoint[] }) {
  const chartData = data.map((d) => ({
    label: d.label,
    pct: Math.round(d.rate * 1000) / 10,
    tested: d.tested,
  }))
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-2 text-sm font-semibold text-slate-700">
        Viral suppression rate trend (12-month rolling)
      </div>
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" fontSize={12} />
            <YAxis
              fontSize={12}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              formatter={(value, _name, item) => {
                const tested = (item?.payload as { tested?: number } | undefined)?.tested ?? 0
                return [`${value}% (${tested} tested)`, 'Suppression'] as [string, string]
              }}
            />
            <Line
              type="monotone"
              dataKey="pct"
              stroke="#059669"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
