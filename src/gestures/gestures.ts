import { NormalizedLandmark } from '@mediapipe/tasks-vision'

const statusEl = document.querySelector<HTMLDivElement>('#status')!
const canvas = document.querySelector<HTMLCanvasElement>('#overlay')!
const ctx = canvas.getContext('2d')!

const LEFT_SHOULDER = 11
const RIGHT_SHOULDER = 12
const LEFT_ELBOW = 13
const RIGHT_ELBOW = 14
const LEFT_WRIST = 15
const RIGHT_WRIST = 16

const VISIBILITY_MIN = 0.45
export const HOLD_TIME_MS = 450
const COOLDOWN_MS = 900
const HORIZONTAL_DX_MIN = 0.03
const SHOULDER_SPAN_FACTOR = 0.2
const CANDIDATE_GRACE_MS = 180
const ELBOW_VISIBILITY_MIN = 0.45
const NEUTRAL_DX_FACTOR = 0.55
const NEUTRAL_HOLD_MS = 220

type GestureName = 'NONE' | 'GEHE_VOR' | 'GEHE_ZURUECK'

type ArmFeatures = {
  visible: boolean
  elbowVisible: boolean
  visibilityScore: number
  dx: number
  dy: number
  extension: number
  elbowAngleDeg: number
  horizontalRatio: number
}

export type GestureDebug = {
  activeGesture: GestureName
  candidateGesture: GestureName
  candidateHoldMs: number
  cooldownMs: number
  armed: boolean
  inNeutral: boolean
  maxAbsDx: number
  shoulderSpan: number
  dynamicDxThreshold: number
  rightArm: ArmFeatures | null
  leftArm: ArmFeatures | null
}

let candidateGesture: GestureName = 'NONE'
let candidateSince = 0
let candidateLostAt = 0
let armed = false
let neutralSince = 0
let activeGesture: GestureName = 'NONE'
let activeGestureUntil = 0
let cooldownUntil = 0

export function labelForGesture(gesture: GestureName): string {
  switch (gesture) {
    case 'GEHE_VOR':
      return 'Gehe vor'
    case 'GEHE_ZURUECK':
      return 'Gehe zurück'
    default:
      return '—'
  }
}

function computeAngleDeg(ax: number, ay: number, bx: number, by: number): number {
  const dot = ax * bx + ay * by
  const magA = Math.hypot(ax, ay)
  const magB = Math.hypot(bx, by)
  if (magA === 0 || magB === 0) return 0
  const cos = Math.min(1, Math.max(-1, dot / (magA * magB)))
  return (Math.acos(cos) * 180) / Math.PI
}

function computeArmFeatures(
  pose: NormalizedLandmark[],
  shoulderIndex: number,
  elbowIndex: number,
  wristIndex: number
): ArmFeatures | null {
  const shoulder = pose[shoulderIndex]
  const elbow = pose[elbowIndex]
  const wrist = pose[wristIndex]

  if (!shoulder || !elbow || !wrist) return null

  // Some MediaPipe variants do not always provide visibility values.
  // Missing values should not fully block gesture detection.
  const shoulderVisibility = shoulder.visibility ?? 1
  const wristVisibility = wrist.visibility ?? 1
  const elbowVisibility = elbow.visibility ?? 0

  const dx = wrist.x - shoulder.x
  const dy = wrist.y - shoulder.y
  const extension = Math.hypot(dx, dy)
  const elbowVisible = elbowVisibility >= ELBOW_VISIBILITY_MIN
  const elbowAngleDeg = elbowVisible
    ? computeAngleDeg(shoulder.x - elbow.x, shoulder.y - elbow.y, wrist.x - elbow.x, wrist.y - elbow.y)
    : 0
  const horizontalRatio = Math.abs(dx) / (Math.abs(dy) + 0.001)

  const visibilityScore = Math.min(shoulderVisibility, wristVisibility, elbowVisibility)

  return {
    visible: shoulderVisibility > VISIBILITY_MIN && wristVisibility > VISIBILITY_MIN && elbowVisible,
    elbowVisible,
    visibilityScore,
    dx,
    dy,
    extension,
    elbowAngleDeg,
    horizontalRatio,
  }
}

export function evaluateGesture(landmarks?: NormalizedLandmark[][]): GestureDebug {
  const now = performance.now()

  if (!landmarks || landmarks.length === 0) {
    candidateGesture = 'NONE'
    candidateLostAt = 0
    armed = false
    neutralSince = 0
    const active = now <= activeGestureUntil ? activeGesture : 'NONE'
    const debugWithoutPose: GestureDebug = {
      activeGesture: active,
      candidateGesture: 'NONE',
      candidateHoldMs: 0,
      cooldownMs: Math.max(0, cooldownUntil - now),
      armed,
      inNeutral: false,
      maxAbsDx: 0,
      shoulderSpan: 0,
      dynamicDxThreshold: HORIZONTAL_DX_MIN,
      rightArm: null,
      leftArm: null,
    }
    updateStatus(debugWithoutPose)
    return debugWithoutPose
  }

  const pose = landmarks[0]
  const rightArm = computeArmFeatures(pose, RIGHT_SHOULDER, RIGHT_ELBOW, RIGHT_WRIST)
  const leftArm = computeArmFeatures(pose, LEFT_SHOULDER, LEFT_ELBOW, LEFT_WRIST)
  const leftShoulder = pose[LEFT_SHOULDER]
  const rightShoulder = pose[RIGHT_SHOULDER]
  const shoulderSpan = leftShoulder && rightShoulder ? Math.abs(rightShoulder.x - leftShoulder.x) : 0
  const dynamicDxThreshold = Math.max(HORIZONTAL_DX_MIN, shoulderSpan * SHOULDER_SPAN_FACTOR)

  const canDetect = now >= cooldownUntil
  const rightValid = rightArm !== null && rightArm.visible

  const leftValid = leftArm !== null && leftArm.visible

  // Use dominant horizontal wrist movement (camera-oriented):
  // positive X => "Gehe vor", negative X => "Gehe zurück".
  const rightDx = rightValid ? rightArm.dx : 0
  const leftDx = leftValid ? leftArm.dx : 0
  const dominantDx = Math.abs(rightDx) >= Math.abs(leftDx) ? rightDx : leftDx
  const maxAbsDx = Math.max(Math.abs(rightDx), Math.abs(leftDx))
  const neutralThreshold = Math.max(HORIZONTAL_DX_MIN * 0.6, dynamicDxThreshold * NEUTRAL_DX_FACTOR)
  const inNeutral = maxAbsDx < neutralThreshold

  if (inNeutral) {
    if (neutralSince === 0) neutralSince = now
    if (now - neutralSince >= NEUTRAL_HOLD_MS) {
      armed = true
    }
  } else {
    neutralSince = 0
  }

  const forwardByDirection = canDetect && armed && dominantDx > dynamicDxThreshold
  const backByDirection = canDetect && armed && dominantDx < -dynamicDxThreshold

  let frameGesture: GestureName = 'NONE'
  if (forwardByDirection) {
    frameGesture = 'GEHE_VOR'
  } else if (backByDirection) {
    frameGesture = 'GEHE_ZURUECK'
  }

  if (frameGesture !== 'NONE') {
    candidateLostAt = 0
    if (candidateGesture !== frameGesture) {
      candidateGesture = frameGesture
      candidateSince = now
    }
  } else {
    if (candidateGesture !== 'NONE') {
      if (candidateLostAt === 0) candidateLostAt = now
      if (now - candidateLostAt > CANDIDATE_GRACE_MS) {
        candidateGesture = 'NONE'
        candidateSince = 0
        candidateLostAt = 0
      }
    }
  }

  const candidateHoldMs = candidateGesture === 'NONE' ? 0 : now - candidateSince
  if (candidateGesture !== 'NONE' && candidateHoldMs >= HOLD_TIME_MS) {
    activeGesture = candidateGesture
    activeGestureUntil = now + COOLDOWN_MS
    cooldownUntil = now + COOLDOWN_MS
    armed = false
    neutralSince = 0
    candidateGesture = 'NONE'
    candidateSince = 0
    candidateLostAt = 0
  }

  const active = now <= activeGestureUntil ? activeGesture : 'NONE'
  const debug: GestureDebug = {
    activeGesture: active,
    candidateGesture,
    candidateHoldMs,
    cooldownMs: Math.max(0, cooldownUntil - now),
    armed,
    inNeutral,
    maxAbsDx,
    shoulderSpan,
    dynamicDxThreshold,
    rightArm,
    leftArm,
  }
  updateStatus(debug)
  return debug
}

function updateStatus(debug: GestureDebug) {
  if (debug.activeGesture !== 'NONE') {
    statusEl.textContent = `Erkannt: ${labelForGesture(debug.activeGesture)}`
    return
  }
  if (debug.candidateGesture !== 'NONE') {
    statusEl.textContent = `Kandidat: ${labelForGesture(debug.candidateGesture)} (${debug.candidateHoldMs.toFixed(0)} / ${HOLD_TIME_MS} ms)`
    return
  }
  if (debug.cooldownMs > 0) {
    statusEl.textContent = `Cooldown aktiv (${debug.cooldownMs.toFixed(0)} ms)`
    return
  }
  if (!debug.armed) {
    statusEl.textContent = 'Bitte kurz neutral halten, dann Geste ausführen'
    return
  }
  statusEl.textContent = 'Bereit - warte auf Geste'
}

export function drawGestureHud(debug: GestureDebug) {
  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
  ctx.fillRect(12, 12, 500, 74)
  ctx.fillStyle = '#ffffff'
  ctx.font = '20px sans-serif'
  ctx.fillText(`Aktive Geste: ${labelForGesture(debug.activeGesture)}`, 24, 40)
  ctx.font = '16px sans-serif'
  ctx.fillText(
    `Kandidat: ${labelForGesture(debug.candidateGesture)} (${debug.candidateHoldMs.toFixed(0)} / ${HOLD_TIME_MS} ms), Cooldown: ${debug.cooldownMs.toFixed(0)} ms`,
    24,
    64
  )
  ctx.restore()
}
