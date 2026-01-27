import type { DailyRecord, WalkRecord } from './types'

const DAILY_KEY = 'shibalog_daily'
const WALK_KEY = 'shibalog_walks'

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveJSON<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data))
}

// Daily Records
export function getDailyRecords(): DailyRecord[] {
  return loadJSON<DailyRecord[]>(DAILY_KEY, [])
}

export function saveDailyRecord(record: DailyRecord): void {
  const records = getDailyRecords()
  const idx = records.findIndex((r) => r.id === record.id)
  if (idx >= 0) {
    records[idx] = record
  } else {
    records.push(record)
  }
  saveJSON(DAILY_KEY, records)
}

export function getDailyRecordByDate(date: string): DailyRecord | undefined {
  return getDailyRecords().find((r) => r.date === date)
}

// Walk Records
export function getWalkRecords(): WalkRecord[] {
  return loadJSON<WalkRecord[]>(WALK_KEY, [])
}

export function saveWalkRecord(record: WalkRecord): void {
  const records = getWalkRecords()
  const idx = records.findIndex((r) => r.id === record.id)
  if (idx >= 0) {
    records[idx] = record
  } else {
    records.push(record)
  }
  saveJSON(WALK_KEY, records)
}

export function getWalkRecordsByDate(date: string): WalkRecord[] {
  return getWalkRecords().filter((r) => r.date === date)
}

// Score calculation
export function calcMoodScore(ear: string, tail: string, eye: string): number {
  const scores: Record<string, number> = {
    up: 5, curled: 5, bright: 5,
    normal: 3,
    down: 1, sleepy: 1,
  }
  const total = (scores[ear] ?? 3) + (scores[tail] ?? 3) + (scores[eye] ?? 3)
  return Math.round((total / 15) * 5 * 10) / 10
}

export function calcHealthScore(ear: string, tail: string, eye: string): number {
  const scores: Record<string, number> = {
    up: 4, curled: 4, bright: 5,
    normal: 3,
    down: 2, sleepy: 1,
  }
  const total = (scores[ear] ?? 3) + (scores[tail] ?? 3) + (scores[eye] ?? 3)
  return Math.round((total / 14) * 5 * 10) / 10
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}
