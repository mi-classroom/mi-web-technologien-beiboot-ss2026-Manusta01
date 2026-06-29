import { NormalizedLandmark } from '@mediapipe/tasks-vision'
import { ArmFeatures, FrameFeatures } from '../types'

export const LEFT_SHOULDER = 11
export const RIGHT_SHOULDER = 12
export const LEFT_ELBOW = 13
export const RIGHT_ELBOW = 14
export const LEFT_WRIST = 15
export const RIGHT_WRIST = 16

export type FeatureConfig = {
  visibilityMin: number
  elbowVisibilityMin: number
  horizontalDxMin: number
  shoulderSpanFactor: number
}

function computeAngleDeg(ax: number, ay: number, bx: number, by: number): number {
  const dot = ax * bx + ay * by
  const magA = Math.hypot(ax, ay)
  const magB = Math.hypot(bx, by)
  if (magA === 0 || magB === 0) return 0
  const cos = Math.min(1, Math.max(-1, dot / (magA * magB)))
  return (Math.acos(cos) * 180) / Math.PI
}

export function computeArmFeatures(
  pose: NormalizedLandmark[],
  shoulderIndex: number,
  elbowIndex: number,
  wristIndex: number,
  config: FeatureConfig
): ArmFeatures | null {
  const shoulder = pose[shoulderIndex]
  const elbow = pose[elbowIndex]
  const wrist = pose[wristIndex]

  if (!shoulder || !elbow || !wrist) return null

  const shoulderVisibility = shoulder.visibility ?? 1
  const wristVisibility = wrist.visibility ?? 1
  const elbowVisibility = elbow.visibility ?? 0

  const dx = wrist.x - shoulder.x
  const dy = wrist.y - shoulder.y
  const extension = Math.hypot(dx, dy)
  const elbowVisible = elbowVisibility >= config.elbowVisibilityMin
  const elbowAngleDeg = elbowVisible
    ? computeAngleDeg(shoulder.x - elbow.x, shoulder.y - elbow.y, wrist.x - elbow.x, wrist.y - elbow.y)
    : 0
  const horizontalRatio = Math.abs(dx) / (Math.abs(dy) + 0.001)
  const visibilityScore = Math.min(shoulderVisibility, wristVisibility, elbowVisibility)

  return {
    visible: shoulderVisibility > config.visibilityMin && wristVisibility > config.visibilityMin && elbowVisible,
    elbowVisible,
    visibilityScore,
    dx,
    dy,
    extension,
    elbowAngleDeg,
    horizontalRatio,
  }
}

function isWristAboveShoulder(
  pose: NormalizedLandmark[],
  shoulderIndex: number,
  wristIndex: number,
  dyThreshold: number
): boolean {
  const shoulder = pose[shoulderIndex]
  const wrist = pose[wristIndex]
  if (!shoulder || !wrist) return false
  return shoulder.y - wrist.y > dyThreshold
}

export function extractFrameFeatures(pose: NormalizedLandmark[], config: FeatureConfig): FrameFeatures {
  const rightArm = computeArmFeatures(pose, RIGHT_SHOULDER, RIGHT_ELBOW, RIGHT_WRIST, config)
  const leftArm = computeArmFeatures(pose, LEFT_SHOULDER, LEFT_ELBOW, LEFT_WRIST, config)
  const leftShoulder = pose[LEFT_SHOULDER]
  const rightShoulder = pose[RIGHT_SHOULDER]
  const shoulderSpan = leftShoulder && rightShoulder ? Math.abs(rightShoulder.x - leftShoulder.x) : 0
  const dynamicDxThreshold = Math.max(config.horizontalDxMin, shoulderSpan * config.shoulderSpanFactor)
  const dynamicDyThreshold = dynamicDxThreshold

  const rightValid = rightArm !== null && rightArm.visible
  const leftValid = leftArm !== null && leftArm.visible
  const rightDx = rightValid ? rightArm.dx : 0
  const leftDx = leftValid ? leftArm.dx : 0
  const dominantDx = Math.abs(rightDx) >= Math.abs(leftDx) ? rightDx : leftDx
  const maxAbsDx = Math.max(Math.abs(rightDx), Math.abs(leftDx))

  return {
    rightArm,
    leftArm,
    shoulderSpan,
    dynamicDxThreshold,
    dynamicDyThreshold,
    dominantDx,
    maxAbsDx,
    rightWristAboveShoulder: isWristAboveShoulder(pose, RIGHT_SHOULDER, RIGHT_WRIST, dynamicDyThreshold),
    leftWristAboveShoulder: isWristAboveShoulder(pose, LEFT_SHOULDER, LEFT_WRIST, dynamicDyThreshold),
  }
}

export function emptyFrameFeatures(config: FeatureConfig): FrameFeatures {
  return {
    rightArm: null,
    leftArm: null,
    shoulderSpan: 0,
    dynamicDxThreshold: config.horizontalDxMin,
    dynamicDyThreshold: config.horizontalDxMin,
    dominantDx: 0,
    maxAbsDx: 0,
    rightWristAboveShoulder: false,
    leftWristAboveShoulder: false,
  }
}
