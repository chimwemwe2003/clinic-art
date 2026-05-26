'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

type Point = { date: string; copiesPerMl: number; suppressed: boolean }

export default function ViralLoadChart({ data }: { data: Point[] }) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center text-sm text-slate-500">
        No viral load results yet.
      </div>
    )
  }

  // log scale needs >0 values; floor at 1
  const series = data.map((d) => ({
    ...d,
    plotValue: Math.max(d.copiesPerMl, 1),
  }))

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-2 text-sm font-semibold text-slate-700">
        Viral load history (log scale)
      </div>
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <LineChart data={series} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis
              scale="log"
              domain={[1, 'dataMax']}
              fontSize={12}
              tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : String(v))}
              allowDataOverflow
            />
            <Tooltip
              formatter={(_v, _n, item) => [
                `${item.payload.copiesPerMl.toLocaleString()} copies/mL`,
                item.payload.suppressed ? 'Suppressed' : 'Detectable',
              ]}
            />
            <ReferenceLine
              y={1000}
              stroke="#dc2626"
              strokeDasharray="4 4"
              label={{ value: '1,000 (threshold)', fontSize: 10, fill: '#dc2626' }}
            />
            <Line
              type="monotone"
              dataKey="plotValue"
              stroke="#0f172a"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
