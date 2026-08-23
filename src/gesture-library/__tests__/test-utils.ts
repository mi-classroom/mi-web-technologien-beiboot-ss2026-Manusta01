import { NormalizedLandmark } from '@mediapipe/tasks-vision'
import { createDefaultGestureRecognizer } from '../defaults'
import { GestureRecognizer } from '../engine'
import { GestureResult, PoseLandmarks } from '../types'

export const FRAME_MS = 16

export type FrameSpec = {
  landmarks: NormalizedLandmark[] | undefined
  t: number
}

export type TriggerRecord = {
  name: string
  timestamp: number
}

export function wrapLandmarks(pose: NormalizedLandmark[] | undefined): PoseLandmarks | undefined {
  return pose ? [pose] : undefined
}

export function framesFor(durationMs: number, pose: NormalizedLandmark[] | undefined, startT = 0): FrameSpec[] {
  const count = Math.ceil(durationMs / FRAME_MS)
  return Array.from({ length: count }, (_, i) => ({
    landmarks: pose,
    t: startT + i * FRAME_MS,
  }))
}

export function concatFrames(...segments: FrameSpec[][]): FrameSpec[] {
  return segments.flat()
}

export function runSequence(recognizer: GestureRecognizer, frames: FrameSpec[]): GestureResult[] {
  return frames.map(({ landmarks, t }) => recognizer.process(wrapLandmarks(landmarks), t))
}

export function createRecognizerWithTriggers(): {
  recognizer: GestureRecognizer
  triggers: TriggerRecord[]
} {
  const recognizer = createDefaultGestureRecognizer()
  const triggers: TriggerRecord[] = []
  recognizer.on('gesture', (event) => {
    triggers.push({ name: event.name, timestamp: event.timestamp })
  })
  return { recognizer, triggers }
}

export function buildNeutralWarmup(neutralPose: NormalizedLandmark[], durationMs = 300): FrameSpec[] {
  return framesFor(durationMs, neutralPose)
}

export function findTriggerAt(triggers: TriggerRecord[], gestureStartAt: number): number | null {
  const hit = triggers.find((t) => t.timestamp >= gestureStartAt)
  return hit ? hit.timestamp - gestureStartAt : null
}

export function runUntilTrigger(
  recognizer: GestureRecognizer,
  neutralPose: NormalizedLandmark[],
  gesturePose: NormalizedLandmark[],
  gestureHoldMs = 2000
): { triggers: TriggerRecord[]; latencyMs: number | null; gestureStartAt: number } {
  const triggers: TriggerRecord[] = []
  recognizer.on('gesture', (event) => {
    triggers.push({ name: event.name, timestamp: event.timestamp })
  })

  const warmupMs = 300
  const warmup = buildNeutralWarmup(neutralPose, warmupMs)
  const gestureStartAt = warmupMs
  const gesture = framesFor(gestureHoldMs, gesturePose, gestureStartAt)

  runSequence(recognizer, concatFrames(warmup, gesture))

  const latencyMs = findTriggerAt(triggers, gestureStartAt)
  return { triggers, latencyMs, gestureStartAt }
}

export function collectAllTriggers(
  recognizer: GestureRecognizer,
  frames: FrameSpec[]
): { triggers: TriggerRecord[]; results: GestureResult[] } {
  const triggers: TriggerRecord[] = []
  recognizer.on('gesture', (event) => {
    triggers.push({ name: event.name, timestamp: event.timestamp })
  })
  const results = runSequence(recognizer, frames)
  return { triggers, results }
}
