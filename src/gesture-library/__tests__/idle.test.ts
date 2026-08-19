import { describe, expect, it } from 'vitest'
import { neutralPose } from '../test-helpers'
import { NONE_GESTURE } from '../types'
import { buildNeutralWarmup, createRecognizerWithTriggers, framesFor, runSequence } from './test-utils'

describe('S1 — Idle false positives (K1)', () => {
  it('arms during warmup without triggering', () => {
    const { recognizer, triggers } = createRecognizerWithTriggers()
    const results = runSequence(recognizer, buildNeutralWarmup(neutralPose(), 300))

    expect(triggers).toHaveLength(0)
    expect(results.at(-1)?.debug.armed).toBe(true)
  })

  it('measures false positives over 30 s neutral hold', () => {
    const { recognizer, triggers } = createRecognizerWithTriggers()
    const results = runSequence(recognizer, framesFor(30_000, neutralPose()))

    const activeFrames = results.filter((r) => r.activeGesture !== NONE_GESTURE).length

    console.log(`K1 — False positives / 30 s: ${triggers.length} (active frames: ${activeFrames})`)

    expect(activeFrames).toBe(0)
    expect(triggers.length).toBeLessThanOrEqual(2)
  })
})
