import { ArmFeatures, FrameFeatures } from './types'

export type SmoothingState = {
  rightDx: number | null
  rightDy: number | null
  leftDx: number | null
  leftDy: number | null
}

export function createSmoothingState(): SmoothingState {
  return {
    rightDx: null,
    rightDy: null,
    leftDx: null,
    leftDy: null,
  }
}

function ema(current: number, previous: number | null, alpha: number): number {
  return previous === null ? current : alpha * current + (1 - alpha) * previous
}

function smoothArm(
  arm: ArmFeatures | null,
  previousDx: number | null,
  previousDy: number | null,
  alpha: number
): { arm: ArmFeatures | null; dx: number | null; dy: number | null } {
  if (!arm) {
    return { arm: null, dx: previousDx, dy: previousDy }
  }

  const dx = ema(arm.dx, previousDx, alpha)
  const dy = ema(arm.dy, previousDy, alpha)

  return {
    arm: {
      ...arm,
      dx,
      dy,
      extension: Math.hypot(dx, dy),
      horizontalRatio: Math.abs(dx) / (Math.abs(dy) + 0.001),
    },
    dx,
    dy,
  }
}

export function smoothFrameFeatures(features: FrameFeatures, state: SmoothingState, alpha: number): FrameFeatures {
  const right = smoothArm(features.rightArm, state.rightDx, state.rightDy, alpha)
  const left = smoothArm(features.leftArm, state.leftDx, state.leftDy, alpha)

  state.rightDx = right.dx
  state.rightDy = right.dy
  state.leftDx = left.dx
  state.leftDy = left.dy

  const rightValid = right.arm?.visible ?? false
  const leftValid = left.arm?.visible ?? false
  const rightDx = rightValid ? right.arm!.dx : 0
  const leftDx = leftValid ? left.arm!.dx : 0
  const dominantDx = Math.abs(rightDx) >= Math.abs(leftDx) ? rightDx : leftDx
  const maxAbsDx = Math.max(Math.abs(rightDx), Math.abs(leftDx))
  const { dynamicDyThreshold } = features

  return {
    rightArm: right.arm,
    leftArm: left.arm,
    shoulderSpan: features.shoulderSpan,
    dynamicDxThreshold: features.dynamicDxThreshold,
    dynamicDyThreshold: features.dynamicDyThreshold,
    dominantDx,
    maxAbsDx,
    rightWristAboveShoulder: rightValid && right.arm!.dy < -dynamicDyThreshold,
    leftWristAboveShoulder: leftValid && left.arm!.dy < -dynamicDyThreshold,
  }
}

export function resetSmoothingState(state: SmoothingState): void {
  state.rightDx = null
  state.rightDy = null
  state.leftDx = null
  state.leftDy = null
}
