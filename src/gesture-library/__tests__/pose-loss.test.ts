import { describe, expect, it } from 'vitest'
import { geheVorPose, neutralPose } from '../test-helpers'
import { NONE_GESTURE } from '../types'
import { createDefaultGestureRecognizer } from '../defaults'
import { collectAllTriggers, concatFrames, framesFor } from './test-utils'

describe('S4 — Pose loss during candidate (K6)', () => {
  it('measures whether GEHE_VOR survives 150 ms tracking gap', () => {
    const recognizer = createDefaultGestureRecognizer()
    const frames = concatFrames(
      framesFor(300, neutralPose()),
      framesFor(200, geheVorPose(), 300),
      framesFor(150, undefined, 500),
      framesFor(800, geheVorPose(), 650)
    )

    const { triggers, results } = collectAllTriggers(recognizer, frames)

    const maxCandidateBeforeLoss = Math.max(
      0,
      ...results
        .filter((r) => r.debug.candidateGesture === 'GEHE_VOR')
        .slice(0, Math.ceil(500 / 16))
        .map((r) => r.debug.candidateHoldMs)
    )

    const triggered = triggers.some((t) => t.name === 'GEHE_VOR')
    const candidateRetained = results.some(
      (r, i) => i > Math.ceil(650 / 16) && r.debug.candidateHoldMs > maxCandidateBeforeLoss
    )

    const survivalRate = triggered ? 100 : candidateRetained ? 50 : 0
    console.log(
      `K6 — Trigger after 150 ms loss: ${triggered}, max candidate before loss: ${maxCandidateBeforeLoss} ms, survival: ${survivalRate}%`
    )

    // Baseline (Issue #5 Vorher): pose loss aborts in-flight gesture
    expect(triggered).toBe(false)
    expect(survivalRate).toBe(0)
  })
})

describe('S5 — Re-arming after pose loss (K7)', () => {
  it('measures time-to-trigger after recovery', () => {
    const recognizer = createDefaultGestureRecognizer()
    const warmupMs = 300
    const lossMs = 500
    const reNeutralMs = 300
    const gestureStartAt = warmupMs + lossMs + reNeutralMs

    const frames = concatFrames(
      framesFor(warmupMs, neutralPose()),
      framesFor(lossMs, undefined, warmupMs),
      framesFor(reNeutralMs, neutralPose(), warmupMs + lossMs),
      framesFor(2000, geheVorPose(), gestureStartAt)
    )

    const { triggers, results } = collectAllTriggers(recognizer, frames)
    const trigger = triggers.find((t) => t.name === 'GEHE_VOR' && t.timestamp >= gestureStartAt)
    const latencyMs = trigger ? trigger.timestamp - gestureStartAt : null
    const armedBeforeGesture = results.find((r) => r.debug.armed)?.debug.armed ?? false

    console.log(
      `K7 — Re-arm TTG GEHE_VOR after loss (ms): ${latencyMs ?? 'no trigger'} (armed before gesture phase: ${armedBeforeGesture})`
    )

    expect(trigger).toBeDefined()
    expect(latencyMs).toBe(464)
  })
})

describe('S4/S5 sanity', () => {
  it('resets candidate on lost pose in current implementation', () => {
    const recognizer = createDefaultGestureRecognizer()
    const frames = concatFrames(
      framesFor(300, neutralPose()),
      framesFor(200, geheVorPose(), 300),
      framesFor(150, undefined, 500)
    )
    const { results } = collectAllTriggers(recognizer, frames)
    const last = results.at(-1)

    expect(last?.debug.candidateGesture).toBe(NONE_GESTURE)
    expect(last?.debug.armed).toBe(false)
  })
})
