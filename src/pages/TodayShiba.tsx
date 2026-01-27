import { useRef, useState } from 'react'
import type { EarStatus, TailStatus, EyeStatus, DailyRecord } from '../types'
import {
  calcMoodScore,
  calcHealthScore,
  saveDailyRecord,
  getDailyRecordByDate,
  generateId,
} from '../store'
import { format } from 'date-fns'

type Step = 'photo' | 'ear' | 'tail' | 'eye' | 'done'

const TODAY = format(new Date(), 'yyyy-MM-dd')

function getInitialState(): { step: Step; saved: DailyRecord | null } {
  const existing = getDailyRecordByDate(TODAY)
  return existing ? { step: 'done', saved: existing } : { step: 'photo', saved: null }
}

function scoreEmoji(score: number): string {
  if (score >= 4.5) return '\u{1F929}'
  if (score >= 3.5) return '\u{1F60A}'
  if (score >= 2.5) return '\u{1F642}'
  if (score >= 1.5) return '\u{1F614}'
  return '\u{1F622}'
}

function scoreBg(score: number): string {
  if (score >= 4.5) return 'bg-green-100 text-green-700'
  if (score >= 3.5) return 'bg-lime-100 text-lime-700'
  if (score >= 2.5) return 'bg-yellow-100 text-yellow-700'
  if (score >= 1.5) return 'bg-orange-100 text-orange-700'
  return 'bg-red-100 text-red-700'
}

export default function TodayShiba() {
  const fileRef = useRef<HTMLInputElement>(null)
  const initial = getInitialState()
  const [step, setStep] = useState<Step>(initial.step)
  const [photo, setPhoto] = useState<string | undefined>()
  const [ear, setEar] = useState<EarStatus | null>(null)
  const [tail, setTail] = useState<TailStatus | null>(null)
  const [eye, setEye] = useState<EyeStatus | null>(null)
  const [memo, setMemo] = useState('')
  const [saved, setSaved] = useState<DailyRecord | null>(initial.saved)

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setPhoto(reader.result as string)
      setStep('ear')
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    if (!ear || !tail || !eye) return
    const record: DailyRecord = {
      id: generateId(),
      date: TODAY,
      photo,
      earStatus: ear,
      tailStatus: tail,
      eyeStatus: eye,
      moodScore: calcMoodScore(ear, tail, eye),
      healthScore: calcHealthScore(ear, tail, eye),
      memo,
      createdAt: new Date().toISOString(),
    }
    saveDailyRecord(record)
    setSaved(record)
    setStep('done')
  }

  const handleReset = () => {
    setStep('photo')
    setPhoto(undefined)
    setEar(null)
    setTail(null)
    setEye(null)
    setMemo('')
    setSaved(null)
  }

  // Already recorded view
  if (step === 'done' && saved) {
    return (
      <div className="p-4 space-y-4">
        <div className="text-center py-2">
          <p className="text-sm text-gray-500">{TODAY}</p>
          <p className="text-lg font-bold text-shiba-dark">
            {'\u{2705}'} 今日の記録ずみ！
          </p>
        </div>

        {saved.photo && (
          <div className="rounded-2xl overflow-hidden shadow-md">
            <img src={saved.photo} alt="今日のしば" className="w-full" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div
            className={`rounded-xl p-4 text-center ${scoreBg(saved.moodScore)}`}
          >
            <p className="text-3xl">{scoreEmoji(saved.moodScore)}</p>
            <p className="text-sm font-medium mt-1">ご機嫌指数</p>
            <p className="text-2xl font-bold">{saved.moodScore.toFixed(1)}</p>
          </div>
          <div
            className={`rounded-xl p-4 text-center ${scoreBg(saved.healthScore)}`}
          >
            <p className="text-3xl">
              {saved.healthScore >= 3.5 ? '\u{1F4AA}' : '\u{1F912}'}
            </p>
            <p className="text-sm font-medium mt-1">体調指数</p>
            <p className="text-2xl font-bold">
              {saved.healthScore.toFixed(1)}
            </p>
          </div>
        </div>

        {saved.memo && (
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <p className="text-sm text-gray-600">{saved.memo}</p>
          </div>
        )}

        <button
          onClick={handleReset}
          className="w-full py-3 text-sm text-gray-500 underline"
        >
          もう一度記録し直す
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="text-center py-2">
        <p className="text-sm text-gray-500">{TODAY}</p>
        <p className="text-lg font-bold text-shiba-dark">
          今日のしばを記録しよう！
        </p>
      </div>

      {/* Step: Photo */}
      {step === 'photo' && (
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => fileRef.current?.click()}
            className="w-48 h-48 rounded-2xl border-4 border-dashed border-orange-300 bg-white flex flex-col items-center justify-center gap-2 text-orange-400 hover:border-shiba hover:text-shiba transition-colors active:scale-95"
          >
            <span className="text-5xl">{'\u{1F4F7}'}</span>
            <span className="text-sm font-medium">写真を撮る</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhoto}
            className="hidden"
          />
          <p className="text-xs text-gray-400">
            カメラで撮影 or ライブラリから選択
          </p>
        </div>
      )}

      {/* Step: Ear */}
      {step === 'ear' && (
        <QuestionCard
          photo={photo}
          title="耳の様子は？"
          options={[
            { value: 'up', label: 'ピンと立ってる', emoji: '\u{1F53A}' },
            { value: 'normal', label: 'ふつう', emoji: '\u{2796}' },
            { value: 'down', label: '寝てる', emoji: '\u{1F53D}' },
          ]}
          onSelect={(v) => {
            setEar(v as EarStatus)
            setStep('tail')
          }}
        />
      )}

      {/* Step: Tail */}
      {step === 'tail' && (
        <QuestionCard
          photo={photo}
          title="しっぽは？"
          options={[
            { value: 'curled', label: 'くるん巻き', emoji: '\u{1F300}' },
            { value: 'normal', label: 'ふつう', emoji: '\u{2796}' },
            { value: 'down', label: '下がってる', emoji: '\u{1F447}' },
          ]}
          onSelect={(v) => {
            setTail(v as TailStatus)
            setStep('eye')
          }}
        />
      )}

      {/* Step: Eye */}
      {step === 'eye' && (
        <div className="space-y-4">
          <QuestionCard
            photo={photo}
            title="目の様子は？"
            options={[
              { value: 'bright', label: 'キラキラ', emoji: '\u{2728}' },
              { value: 'normal', label: 'ふつう', emoji: '\u{1F441}\u{FE0F}' },
              { value: 'sleepy', label: 'トロン', emoji: '\u{1F634}' },
            ]}
            onSelect={(v) => setEye(v as EyeStatus)}
          />
          {eye && (
            <div className="space-y-3">
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="今日のメモ（任意）"
                className="w-full p-3 rounded-xl border border-orange-200 bg-white text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-shiba"
              />
              <button
                onClick={handleSave}
                className="w-full py-3 bg-shiba text-white rounded-xl font-bold text-lg shadow-md hover:bg-shiba-dark active:scale-95 transition-all"
              >
                {'\u{1F43E}'} 記録する！
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function QuestionCard({
  photo,
  title,
  options,
  onSelect,
}: {
  photo?: string
  title: string
  options: { value: string; label: string; emoji: string }[]
  onSelect: (value: string) => void
}) {
  return (
    <div className="space-y-3">
      {photo && (
        <div className="rounded-2xl overflow-hidden shadow-md">
          <img src={photo} alt="しば" className="w-full max-h-56 object-cover" />
        </div>
      )}
      <p className="text-center text-lg font-bold text-gray-700">{title}</p>
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className="flex flex-col items-center gap-1 p-3 bg-white rounded-xl border-2 border-orange-100 hover:border-shiba hover:bg-orange-50 active:scale-95 transition-all shadow-sm"
          >
            <span className="text-2xl">{opt.emoji}</span>
            <span className="text-xs font-medium text-gray-600">
              {opt.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
