import { NormalizedLandmark } from '@mediapipe/tasks-vision'

export type ArmFeatures = {
  visible: boolean
  elbowVisible: boolean
  visibilityScore: number
  dx: number
  dy: number
  extension: number
  elbowAngleDeg: number
  horizontalRatio: number
}

export type FrameFeatures = {
  rightArm: ArmFeatures | null
  leftArm: ArmFeatures | null
  shoulderSpan: number
  dynamicDxThreshold: number
  dynamicDyThreshold: number
  dominantDx: number
  maxAbsDx: number
  rightWristAboveShoulder: boolean
  leftWristAboveShoulder: boolean
}

export type GestureContext = {
  armed: boolean
  canDetect: boolean
  features: FrameFeatures
  timestamp: number
}

export type GestureMatch = {
  confidence: number
}

export type GestureDefinition = {
  name: string
  label: string
  priority?: number
  evaluate: (ctx: GestureContext) => GestureMatch | null
}

export type GestureDebug = {
  activeGesture: string
  candidateGesture: string
  candidateHoldMs: number
  cooldownMs: number
  armed: boolean
  inNeutral: boolean
  maxAbsDx: number
  shoulderSpan: number
  dynamicDxThreshold: number
  rightArm: ArmFeatures | null
  leftArm: ArmFeatures | null
  poseLostMs: number
}

export type GestureResult = {
  activeGesture: string
  candidateGesture: string
  debug: GestureDebug
}

export type GestureEvent = {
  name: string
  label: string
  timestamp: number
}

export type RegisteredGesture = {
  name: string
  label: string
}

export type RecognizerConfig = {
  holdTimeMs?: number
  cooldownMs?: number
  horizontalDxMin?: number
  shoulderSpanFactor?: number
  candidateGraceMs?: number
  elbowVisibilityMin?: number
  visibilityMin?: number
  neutralDxFactor?: number
  neutralHoldMs?: number
  poseLossGraceMs?: number
  smoothingAlpha?: number
}

export type PoseLandmarks = NormalizedLandmark[][]

export const NONE_GESTURE = 'NONE'
