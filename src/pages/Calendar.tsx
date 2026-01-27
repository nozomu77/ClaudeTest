import { useMemo } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isToday,
  isBefore,
} from 'date-fns'
import { ja } from 'date-fns/locale'
import { getDailyRecords, getWalkRecords } from '../store'

function scoreColor(score: number): string {
  if (score >= 4.5) return 'bg-green-400'
  if (score >= 3.5) return 'bg-lime-400'
  if (score >= 2.5) return 'bg-yellow-400'
  if (score >= 1.5) return 'bg-orange-400'
  return 'bg-red-400'
}

function calcStreak(dates: Set<string>): number {
  let streak = 0
  const today = new Date()
  let d = today
  while (true) {
    const key = format(d, 'yyyy-MM-dd')
    if (dates.has(key)) {
      streak++
      d = addDays(d, -1)
    } else {
      break
    }
  }
  return streak
}

export default function Calendar() {
  const records = useMemo(() => getDailyRecords(), [])
  const walks = useMemo(() => getWalkRecords(), [])

  const recordMap = useMemo(() => {
    const m = new Map<string, { mood: number; health: number }>()
    records.forEach((r) => m.set(r.date, { mood: r.moodScore, health: r.healthScore }))
    return m
  }, [records])

  const walkDates = useMemo(() => {
    const s = new Set<string>()
    walks.forEach((w) => s.add(w.date))
    return s
  }, [walks])

  const allDates = useMemo(() => {
    const s = new Set<string>()
    records.forEach((r) => s.add(r.date))
    return s
  }, [records])

  const streak = useMemo(() => calcStreak(allDates), [allDates])

  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days: Date[] = []
  let cursor = calStart
  while (!isBefore(calEnd, cursor)) {
    days.push(cursor)
    cursor = addDays(cursor, 1)
  }

  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return (
    <div className="p-4 space-y-4">
      {/* Streak */}
      <div className="bg-white rounded-2xl p-4 shadow-md text-center">
        <p className="text-4xl">{streak > 0 ? '\u{1F525}' : '\u{1F43E}'}</p>
        <p className="text-2xl font-bold text-shiba mt-1">
          {streak > 0 ? `${streak}日連続！` : 'まだ記録がないよ'}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          毎日記録してストリークを伸ばそう
        </p>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl p-4 shadow-md">
        <p className="text-center font-bold text-gray-700 mb-3">
          {format(now, 'yyyy年M月', { locale: ja })}
        </p>
        <div className="grid grid-cols-7 gap-1 text-center">
          {['月', '火', '水', '木', '金', '土', '日'].map((d) => (
            <div key={d} className="text-xs font-medium text-gray-400 pb-1">
              {d}
            </div>
          ))}
          {weeks.flat().map((day, i) => {
            const key = format(day, 'yyyy-MM-dd')
            const inMonth = isSameMonth(day, now)
            const today = isToday(day)
            const rec = recordMap.get(key)
            const walked = walkDates.has(key)

            return (
              <div
                key={i}
                className={`relative aspect-square flex flex-col items-center justify-center rounded-lg text-xs ${
                  today ? 'ring-2 ring-shiba' : ''
                } ${!inMonth ? 'opacity-30' : ''}`}
              >
                <span
                  className={`font-medium ${today ? 'text-shiba font-bold' : 'text-gray-600'}`}
                >
                  {format(day, 'd')}
                </span>
                <div className="flex gap-0.5 mt-0.5">
                  {rec && (
                    <span
                      className={`w-2 h-2 rounded-full ${scoreColor(rec.mood)}`}
                    />
                  )}
                  {walked && (
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
            ご機嫌
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
            おさんぽ
          </span>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-xl p-3 shadow-sm text-center">
          <p className="text-xl font-bold text-shiba">{records.length}</p>
          <p className="text-xs text-gray-400">記録日数</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center">
          <p className="text-xl font-bold text-blue-500">{walks.length}</p>
          <p className="text-xs text-gray-400">おさんぽ回数</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center">
          <p className="text-xl font-bold text-orange-500">{streak}</p>
          <p className="text-xs text-gray-400">連続日数</p>
        </div>
      </div>
    </div>
  )
}
