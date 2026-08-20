import { describe, expect, it } from 'vitest'
import { geheVorPose, naechsterEintragPose, neutralPose, pauseStopPose } from '../test-helpers'
import { createDefaultGestureRecognizer } from '../defaults'
import { collectAllTriggers, concatFrames, framesFor } from './test-utils'

type DisambiguationCase = {
  id: string
  pose: () => ReturnType<typeof neutralPose>
  expected: string
  unwanted: string[]
}

const CASES: DisambiguationCase[] = [
  {
    id: 'S3a',
    pose: pauseStopPose,
    expected: 'PAUSE_STOP',
    unwanted: ['NAECHSTER_EINTRAG'],
  },
  {
    id: 'S3b',
    pose: naechsterEintragPose,
    expected: 'NAECHSTER_EINTRAG',
    unwanted: ['PAUSE_STOP'],
  },
  {
    id: 'S3c',
    pose: geheVorPose,
    expected: 'GEHE_VOR',
    unwanted: ['PAUSE_STOP', 'NAECHSTER_EINTRAG'],
  },
]

describe('S3 — Disambiguation matrix (K5)', () => {
  it.each(CASES)('$id — $expected without unwanted triggers', ({ id, pose, expected, unwanted }) => {
    const recognizer = createDefaultGestureRecognizer()
    const warmup = framesFor(300, neutralPose())
    const gesture = framesFor(2000, pose(), 300)
    const { triggers } = collectAllTriggers(recognizer, concatFrames(warmup, gesture))

    const fired = triggers.map((t) => t.name)
    const wrong = fired.filter((name) => unwanted.includes(name))

    console.log(`${id} — expected ${expected}, fired [${fired.join(', ')}], wrong [${wrong.join(', ')}]`)

    expect(fired).toContain(expected)
    expect(wrong).toHaveLength(0)
  })

  it('reports disambiguation failure rate (K5)', () => {
    let failures = 0
    for (const { pose, expected, unwanted } of CASES) {
      const recognizer = createDefaultGestureRecognizer()
      const warmup = framesFor(300, neutralPose())
      const gesture = framesFor(2000, pose(), 300)
      const { triggers } = collectAllTriggers(recognizer, concatFrames(warmup, gesture))
      const fired = triggers.map((t) => t.name)
      const hasWrong = fired.some((name) => unwanted.includes(name))
      const missingExpected = !fired.includes(expected)
      if (hasWrong || missingExpected) failures += 1
    }

    const rate = (failures / CASES.length) * 100
    console.log(`K5 — Disambiguation failure rate: ${rate}% (${failures}/${CASES.length} cases)`)

    expect(rate).toBeGreaterThanOrEqual(0)
    expect(rate).toBe(0)
  })
})
