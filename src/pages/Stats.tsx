import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { getDailyRecords, getWalkRecords } from '../store'

export default function Stats() {
  const records = useMemo(() => {
    return getDailyRecords().sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }, [])

  const walks = useMemo(() => {
    return getWalkRecords().sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }, [])

  const moodData = records.map((r) => ({
    date: r.date.slice(5), // MM-DD
    '\u3054\u6a5f\u5acc': r.moodScore,
    '\u4f53\u8abf': r.healthScore,
  }))

  const walkData = useMemo(() => {
    const byDate = new Map<string, { count: number; totalDist: number; totalDur: number }>()
    walks.forEach((w) => {
      const existing = byDate.get(w.date) ?? { count: 0, totalDist: 0, totalDur: 0 }
      existing.count++
      existing.totalDist += w.distance
      existing.totalDur += w.duration
      byDate.set(w.date, existing)
    })
    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({
        date: date.slice(5),
        '\u8ddd\u96e2(m)': v.totalDist,
        '\u6642\u9593(\u5206)': Math.round(v.totalDur / 60),
      }))
  }, [walks])

  const avgMood =
    records.length > 0
      ? (records.reduce((s, r) => s + r.moodScore, 0) / records.length).toFixed(1)
      : '-'
  const avgHealth =
    records.length > 0
      ? (records.reduce((s, r) => s + r.healthScore, 0) / records.length).toFixed(1)
      : '-'
  const totalWalkDist = walks.reduce((s, w) => s + w.distance, 0)

  const hasData = records.length > 0 || walks.length > 0

  return (
    <div className="p-4 space-y-4">
      <div className="text-center py-2">
        <p className="text-lg font-bold text-shiba-dark">
          {'\u{1F4CA}'} 推移グラフ
        </p>
      </div>

      {!hasData && (
        <div className="bg-white rounded-2xl p-8 shadow-md text-center space-y-3">
          <p className="text-4xl">{'\u{1F436}'}</p>
          <p className="text-gray-500 text-sm">
            まだデータがありません。
            <br />
            「今日のしば」から記録を始めよう！
          </p>
        </div>
      )}

      {records.length > 0 && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white rounded-xl p-3 shadow-sm text-center">
              <p className="text-xl font-bold text-green-500">{avgMood}</p>
              <p className="text-xs text-gray-400">平均ご機嫌</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm text-center">
              <p className="text-xl font-bold text-blue-500">{avgHealth}</p>
              <p className="text-xs text-gray-400">平均体調</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm text-center">
              <p className="text-xl font-bold text-orange-500">
                {totalWalkDist >= 1000
                  ? `${(totalWalkDist / 1000).toFixed(1)}km`
                  : `${totalWalkDist}m`}
              </p>
              <p className="text-xs text-gray-400">総散歩距離</p>
            </div>
          </div>

          {/* Mood/Health chart */}
          <div className="bg-white rounded-2xl p-4 shadow-md">
            <p className="text-sm font-bold text-gray-600 mb-3">
              ご機嫌 & 体調の推移
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                />
                <YAxis
                  domain={[0, 5]}
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    fontSize: '12px',
                    border: '1px solid #fed7aa',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px' }}
                />
                <Line
                  type="monotone"
                  dataKey={'\u3054\u6a5f\u5acc'}
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#f97316' }}
                />
                <Line
                  type="monotone"
                  dataKey={'\u4f53\u8abf'}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {walkData.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <p className="text-sm font-bold text-gray-600 mb-3">
            おさんぽの推移
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={walkData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  fontSize: '12px',
                  border: '1px solid #fed7aa',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px' }}
              />
              <Line
                type="monotone"
                dataKey={'\u8ddd\u96e2(m)'}
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4, fill: '#10b981' }}
              />
              <Line
                type="monotone"
                dataKey={'\u6642\u9593(\u5206)'}
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 4, fill: '#8b5cf6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
