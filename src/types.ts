export type EarStatus = 'up' | 'normal' | 'down'
export type TailStatus = 'curled' | 'normal' | 'down'
export type EyeStatus = 'bright' | 'normal' | 'sleepy'

export interface DailyRecord {
  id: string
  date: string // YYYY-MM-DD
  photo?: string // base64 data URL
  earStatus: EarStatus
  tailStatus: TailStatus
  eyeStatus: EyeStatus
  moodScore: number // 1-5
  healthScore: number // 1-5
  memo: string
  createdAt: string
}

export interface WalkRecord {
  id: string
  date: string // YYYY-MM-DD
  startTime: string // ISO string
  endTime: string // ISO string
  duration: number // seconds
  distance: number // meters
  route: GeoPoint[]
  memo: string
}

export interface GeoPoint {
  lat: number
  lng: number
  timestamp: number
}

export type Page = 'today' | 'walk' | 'calendar' | 'stats'
