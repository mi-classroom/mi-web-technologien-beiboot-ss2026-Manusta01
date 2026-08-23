import { NormalizedLandmark } from '@mediapipe/tasks-vision'
import { describe, expect, it } from 'vitest'
import { naechsterEintragPose, neutralPose } from '../test-helpers'
import { createDefaultGestureRecognizer } from '../defaults'
import { collectAllTriggers, concatFrames, framesFor } from './test-utils'

function jitteredPose(base: NormalizedLandmark[], noiseY = 0.008): NormalizedLandmark[] {
  return base.map((lm) => ({
    ...lm,
    y: lm.y + (Math.random() - 0.5) * noiseY,
  }))
}

describe('S6 — Jitter robustness', () => {
  it('triggers NAECHSTER_EINTRAG in at least 90% of jittered runs', () => {
    const runs = 10
    const framesPerRun = 60
    let successes = 0

    for (let run = 0; run < runs; run += 1) {
      const recognizer = createDefaultGestureRecognizer()
      const warmup = framesFor(300, neutralPose())
      const gesture = Array.from({ length: framesPerRun }, (_, i) => ({
        landmarks: jitteredPose(naechsterEintragPose()),
        t: 300 + i * 16,
      }))
      const { triggers } = collectAllTriggers(recognizer, concatFrames(warmup, gesture))

      if (triggers.some((t) => t.name === 'NAECHSTER_EINTRAG')) {
        successes += 1
      }
    }

    const rate = (successes / runs) * 100
    console.log(`S6 — NAECHSTER_EINTRAG trigger rate with Y-jitter: ${rate}% (${successes}/${runs})`)

    expect(rate).toBeGreaterThanOrEqual(90)
  })
})
