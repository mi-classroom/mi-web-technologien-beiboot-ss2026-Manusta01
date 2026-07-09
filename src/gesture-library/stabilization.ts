import { FrameFeatures, NONE_GESTURE } from './types'

export type StabilizationConfig = {
  holdTimeMs: number
  cooldownMs: number
  horizontalDxMin: number
  neutralDxFactor: number
  neutralHoldMs: number
  candidateGraceMs: number
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
}

export function isInNeutral(features: FrameFeatures, config: StabilizationConfig): boolean {
  const neutralThreshold = Math.max(config.horizontalDxMin * 0.6, features.dynamicDxThreshold * config.neutralDxFactor)
  const horizontallyNeutral = features.maxAbsDx < neutralThreshold
  const armsRaised = features.rightWristAboveShoulder || features.leftWristAboveShoulder
  return horizontallyNeutral && !armsRaised
}

export function stepStabilization(
  state: StabilizationState,
  frameGesture: string,
  features: FrameFeatures,
  timestamp: number,
  config: StabilizationConfig
): StabilizationStepResult {
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

  const candidateHoldMs = state.candidateGesture === NONE_GESTURE ? 0 : timestamp - state.candidateSince

  let triggered = false
  if (state.candidateGesture !== NONE_GESTURE && candidateHoldMs >= config.holdTimeMs) {
    state.activeGesture = state.candidateGesture
    state.activeGestureUntil = timestamp + config.cooldownMs
    state.cooldownUntil = timestamp + config.cooldownMs
    state.armed = false
    state.neutralSince = 0
    state.candidateGesture = NONE_GESTURE
    state.candidateSince = 0
    state.candidateLostAt = 0
    triggered = true
  }

  const active = timestamp <= state.activeGestureUntil ? state.activeGesture : NONE_GESTURE

  return {
    activeGesture: active,
    candidateGesture: state.candidateGesture,
    candidateHoldMs,
    cooldownMs: Math.max(0, state.cooldownUntil - timestamp),
    armed: state.armed,
    inNeutral,
    triggered,
  }
}

export function resetStabilizationOnLostPose(state: StabilizationState): void {
  state.candidateGesture = NONE_GESTURE
  state.candidateLostAt = 0
  state.armed = false
  state.neutralSince = 0
}
