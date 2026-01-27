import { useState, useEffect, useRef, useCallback } from 'react'
import type { WalkRecord, GeoPoint } from '../types'
import { saveWalkRecord, getWalkRecordsByDate, generateId } from '../store'
import { format } from 'date-fns'

type WalkState = 'idle' | 'tracking' | 'finished'

const TODAY = format(new Date(), 'yyyy-MM-dd')

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`
  return `${(meters / 1000).toFixed(2)}km`
}

function calcDistance(a: GeoPoint, b: GeoPoint): number {
  const R = 6371000
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)
  const x =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinLng * sinLng
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

function totalDistance(route: GeoPoint[]): number {
  let d = 0
  for (let i = 1; i < route.length; i++) {
    d += calcDistance(route[i - 1], route[i])
  }
  return d
}

export default function WalkTracker() {
  const [state, setState] = useState<WalkState>('idle')
  const [seconds, setSeconds] = useState(0)
  const [route, setRoute] = useState<GeoPoint[]>([])
  const [distance, setDistance] = useState(0)
  const [memo, setMemo] = useState('')
  const [todayWalks, setTodayWalks] = useState<WalkRecord[]>([])
  const [geoError, setGeoError] = useState<string | null>(null)

  const startTimeRef = useRef<string>('')
  const watchIdRef = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setTodayWalks(getWalkRecordsByDate(TODAY))
  }, [])

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('GPS非対応のブラウザです')
      return
    }

    setGeoError(null)
    setState('tracking')
    startTimeRef.current = new Date().toISOString()
    setSeconds(0)
    setRoute([])
    setDistance(0)

    timerRef.current = setInterval(() => {
      setSeconds((s) => s + 1)
    }, 1000)

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const pt: GeoPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: pos.timestamp,
        }
        setRoute((prev) => {
          const next = [...prev, pt]
          setDistance(totalDistance(next))
          return next
        })
      },
      (err) => {
        setGeoError(`GPS取得エラー: ${err.message}`)
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    )
  }, [])

  const stopTracking = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (watchIdRef.current !== null)
      navigator.geolocation.clearWatch(watchIdRef.current)
    setState('finished')
  }, [])

  const saveWalk = () => {
    const record: WalkRecord = {
      id: generateId(),
      date: TODAY,
      startTime: startTimeRef.current,
      endTime: new Date().toISOString(),
      duration: seconds,
      distance: Math.round(distance),
      route,
      memo,
    }
    saveWalkRecord(record)
    setTodayWalks((prev) => [...prev, record])
    setState('idle')
    setMemo('')
  }

  return (
    <div className="p-4 space-y-4">
      <div className="text-center py-2">
        <p className="text-sm text-gray-500">{TODAY}</p>
        <p className="text-lg font-bold text-shiba-dark">
          {'\u{1F43E}'} おさんぽトラッカー
        </p>
      </div>

      {geoError && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">
          {geoError}
        </div>
      )}

      {/* Idle state */}
      {state === 'idle' && (
        <div className="flex flex-col items-center gap-6 py-8">
          <button
            onClick={startTracking}
            className="w-36 h-36 rounded-full bg-shiba text-white flex flex-col items-center justify-center shadow-lg hover:bg-shiba-dark active:scale-95 transition-all"
          >
            <span className="text-4xl">{'\u{1F6B6}'}</span>
            <span className="text-sm font-bold mt-1">おさんぽ開始</span>
          </button>
          <p className="text-xs text-gray-400">
            GPSで距離と時間を自動記録します
          </p>
        </div>
      )}

      {/* Tracking state */}
      {state === 'tracking' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-md text-center space-y-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide">
              おさんぽ中...
            </p>
            <p className="text-5xl font-mono font-bold text-shiba">
              {formatDuration(seconds)}
            </p>
            <div className="flex justify-center gap-8">
              <div>
                <p className="text-2xl font-bold text-gray-700">
                  {formatDistance(distance)}
                </p>
                <p className="text-xs text-gray-400">距離</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-700">
                  {route.length}
                </p>
                <p className="text-xs text-gray-400">GPS点</p>
              </div>
            </div>
          </div>
          <button
            onClick={stopTracking}
            className="w-full py-4 bg-red-500 text-white rounded-xl font-bold text-lg shadow-md hover:bg-red-600 active:scale-95 transition-all"
          >
            {'\u{23F9}\u{FE0F}'} おさんぽ終了
          </button>
        </div>
      )}

      {/* Finished state */}
      {state === 'finished' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-md text-center space-y-2">
            <p className="text-2xl">{'\u{1F389}'}</p>
            <p className="font-bold text-lg text-gray-700">おつかれさま！</p>
            <div className="flex justify-center gap-6 mt-3">
              <div>
                <p className="text-xl font-bold text-shiba">
                  {formatDuration(seconds)}
                </p>
                <p className="text-xs text-gray-400">時間</p>
              </div>
              <div>
                <p className="text-xl font-bold text-shiba">
                  {formatDistance(distance)}
                </p>
                <p className="text-xs text-gray-400">距離</p>
              </div>
            </div>
          </div>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="おさんぽメモ（任意）"
            className="w-full p-3 rounded-xl border border-orange-200 bg-white text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-shiba"
          />
          <button
            onClick={saveWalk}
            className="w-full py-3 bg-shiba text-white rounded-xl font-bold text-lg shadow-md hover:bg-shiba-dark active:scale-95 transition-all"
          >
            {'\u{1F43E}'} 記録する！
          </button>
        </div>
      )}

      {/* Today's walk history */}
      {todayWalks.length > 0 && state === 'idle' && (
        <div className="space-y-2">
          <p className="text-sm font-bold text-gray-600">
            今日のおさんぽ履歴
          </p>
          {todayWalks.map((w) => (
            <div
              key={w.id}
              className="bg-white rounded-xl p-3 shadow-sm flex justify-between items-center"
            >
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {formatDuration(w.duration)} / {formatDistance(w.distance)}
                </p>
                {w.memo && (
                  <p className="text-xs text-gray-400 mt-0.5">{w.memo}</p>
                )}
              </div>
              <span className="text-xl">{'\u{1F43E}'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
