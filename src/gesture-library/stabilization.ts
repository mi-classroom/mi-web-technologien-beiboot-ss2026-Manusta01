import { FrameFeatures, NONE_GESTURE } from './types'

export type StabilizationConfig = {
  holdTimeMs: number
  cooldownMs: number
  horizontalDxMin: number
  neutralDxFactor: number
  neutralHoldMs: number
  candidateGraceMs: number
  poseLossGraceMs: number
}

export type StabilizationState = {
  candidateGesture: string
  candidateSince: number
  candidateLostAt: number
  armed: boolean
  neutralSince: number
  activeGesture: string
  activeGestureUntil: number
  cooldownUntil: number
  poseLostAt: number
}

export function createStabilizationState(): StabilizationState {
  return {
    candidateGesture: NONE_GESTURE,
    candidateSince: 0,
    candidateLostAt: 0,
    armed: false,
    neutralSince: 0,
    activeGesture: NONE_GESTURE,
    activeGestureUntil: 0,
    cooldownUntil: 0,
    poseLostAt: 0,
  }
}

export type StabilizationStepResult = {
  activeGesture: string
  candidateGesture: string
  candidateHoldMs: number
  cooldownMs: number
  armed: boolean
  inNeutral: boolean
  triggered: boolean
  poseLostMs: number
}

export function isInNeutral(features: FrameFeatures, config: StabilizationConfig): boolean {
  const neutralThreshold = Math.max(config.horizontalDxMin * 0.6, features.dynamicDxThreshold * config.neutralDxFactor)
  const horizontallyNeutral = features.maxAbsDx < neutralThreshold
  const armsRaised = features.rightWristAboveShoulder || features.leftWristAboveShoulder
  return horizontallyNeutral && !armsRaised
}

function triggerCandidate(state: StabilizationState, timestamp: number, config: StabilizationConfig): boolean {
  const candidateHoldMs = timestamp - state.candidateSince
  if (state.candidateGesture === NONE_GESTURE || candidateHoldMs < config.holdTimeMs) {
    return false
  }

  state.activeGesture = state.candidateGesture
  state.activeGestureUntil = timestamp + config.cooldownMs
  state.cooldownUntil = timestamp + config.cooldownMs
  state.armed = false
  state.neutralSince = 0
  state.candidateGesture = NONE_GESTURE
  state.candidateSince = 0
  state.candidateLostAt = 0
  state.poseLostAt = 0
  return true
}

export function stepStabilization(
  state: StabilizationState,
  frameGesture: string,
  features: FrameFeatures,
  timestamp: number,
  config: StabilizationConfig
): StabilizationStepResult {
  state.poseLostAt = 0

  const canDetect = timestamp >= state.cooldownUntil
  const inNeutral = isInNeutral(features, config)

  if (inNeutral) {
    if (state.neutralSince === 0) state.neutralSince = timestamp
    if (timestamp - state.neutralSince >= config.neutralHoldMs) {
      state.armed = true
    }
  } else {
    state.neutralSince = 0
  }

  const effectiveFrameGesture = canDetect && state.armed ? frameGesture : NONE_GESTURE

  if (effectiveFrameGesture !== NONE_GESTURE) {
    state.candidateLostAt = 0
    if (state.candidateGesture !== effectiveFrameGesture) {
      state.candidateGesture = effectiveFrameGesture
      state.candidateSince = timestamp
    }
  } else if (state.candidateGesture !== NONE_GESTURE) {
    if (state.candidateLostAt === 0) state.candidateLostAt = timestamp
    if (timestamp - state.candidateLostAt > config.candidateGraceMs) {
      state.candidateGesture = NONE_GESTURE
      state.candidateSince = 0
      state.candidateLostAt = 0
    }
  }

  const triggered = triggerCandidate(state, timestamp, config)
  const active = timestamp <= state.activeGestureUntil ? state.activeGesture : NONE_GESTURE
  const candidateHoldMs = state.candidateGesture === NONE_GESTURE ? 0 : timestamp - state.candidateSince

  return {
    activeGesture: active,
    candidateGesture: state.candidateGesture,
    candidateHoldMs,
    cooldownMs: Math.max(0, state.cooldownUntil - timestamp),
    armed: state.armed,
    inNeutral,
    triggered,
    poseLostMs: 0,
  }
}

export type PoseLossStepResult = StabilizationStepResult & {
  withinGrace: boolean
  reset: boolean
}

export function stepStabilizationOnPoseLoss(
  state: StabilizationState,
  timestamp: number,
  config: StabilizationConfig
): PoseLossStepResult {
  if (state.poseLostAt === 0) {
    state.poseLostAt = timestamp
  }

  const poseLostMs = timestamp - state.poseLostAt

  if (poseLostMs <= config.poseLossGraceMs) {
    const candidateHoldMs = state.candidateGesture === NONE_GESTURE ? 0 : timestamp - state.candidateSince
    const triggered = triggerCandidate(state, timestamp, config)
    const active = timestamp <= state.activeGestureUntil ? state.activeGesture : NONE_GESTURE

    return {
      activeGesture: active,
      candidateGesture: state.candidateGesture,
      candidateHoldMs,
      cooldownMs: Math.max(0, state.cooldownUntil - timestamp),
      armed: state.armed,
      inNeutral: false,
      triggered,
      poseLostMs,
      withinGrace: true,
      reset: false,
    }
  }

  resetStabilizationOnLostPose(state)

  return {
    activeGesture: NONE_GESTURE,
    candidateGesture: NONE_GESTURE,
    candidateHoldMs: 0,
    cooldownMs: Math.max(0, state.cooldownUntil - timestamp),
    armed: false,
    inNeutral: false,
    triggered: false,
    poseLostMs,
    withinGrace: false,
    reset: true,
  }
}

export function resetStabilizationOnLostPose(state: StabilizationState): void {
  state.candidateGesture = NONE_GESTURE
  state.candidateSince = 0
  state.candidateLostAt = 0
  state.armed = false
  state.neutralSince = 0
  state.poseLostAt = 0
}
