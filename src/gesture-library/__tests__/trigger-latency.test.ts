import { describe, expect, it } from 'vitest'
import { geheVorPose, naechsterEintragPose, neutralPose, pauseStopPose } from '../test-helpers'
import { createDefaultGestureRecognizer } from '../defaults'
import { runUntilTrigger } from './test-utils'

const GESTURES = [
  { name: 'GEHE_VOR', metric: 'K2', pose: geheVorPose },
  { name: 'PAUSE_STOP', metric: 'K3', pose: pauseStopPose },
  { name: 'NAECHSTER_EINTRAG', metric: 'K4', pose: naechsterEintragPose },
] as const

describe('S2 — Time-to-trigger (K2–K4)', () => {
  it.each(GESTURES)('$metric — triggers $name within hold window', ({ name, metric, pose }) => {
    const recognizer = createDefaultGestureRecognizer()
    const { triggers, latencyMs } = runUntilTrigger(recognizer, neutralPose(), pose())

    console.log(`${metric} — TTG ${name} (ms): ${latencyMs ?? 'no trigger'}`)

    expect(triggers.some((t) => t.name === name)).toBe(true)
    expect(latencyMs).not.toBeNull()
    expect(latencyMs!).toBeGreaterThanOrEqual(450)
    expect(latencyMs!).toBeLessThanOrEqual(900)
  })
})
