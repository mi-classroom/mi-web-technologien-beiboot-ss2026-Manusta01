import { NormalizedLandmark } from '@mediapipe/tasks-vision'
import { GestureDebug } from '../gesture-library'
import { reducePoseLandmarks } from '../landmarks/landmarks'

function serializeArmFeatures(arm: GestureDebug['rightArm']) {
  if (arm === null) return null

  return {
    visible: arm.visible,
    elbowVisible: arm.elbowVisible,
    visibilityScore: Number(arm.visibilityScore.toFixed(3)),
    dx: Number(arm.dx.toFixed(4)),
    dy: Number(arm.dy.toFixed(4)),
    extension: Number(arm.extension.toFixed(4)),
    elbowAngleDeg: Number(arm.elbowAngleDeg.toFixed(1)),
    horizontalRatio: Number(arm.horizontalRatio.toFixed(2)),
  }
}

export function toRawDebugText(
  landmarks: NormalizedLandmark[][] | undefined,
  debug: GestureDebug,
  labelFn: (name: string) => string
): string {
  if (!landmarks || landmarks.length === 0) {
    return 'Keine Pose erkannt'
  }

  return JSON.stringify(
    {
      gestureDebug: {
        activeGesture: labelFn(debug.activeGesture),
        candidateGesture: labelFn(debug.candidateGesture),
        candidateHoldMs: Number(debug.candidateHoldMs.toFixed(1)),
        cooldownMs: Number(debug.cooldownMs.toFixed(1)),
        armed: debug.armed,
        inNeutral: debug.inNeutral,
        maxAbsDx: Number(debug.maxAbsDx.toFixed(4)),
        shoulderSpan: Number(debug.shoulderSpan.toFixed(4)),
        dynamicDxThreshold: Number(debug.dynamicDxThreshold.toFixed(4)),
        rightArm: serializeArmFeatures(debug.rightArm),
        leftArm: serializeArmFeatures(debug.leftArm),
      },
      landmarks: reducePoseLandmarks(landmarks[0]),
    },
    null,
    2
  )
}
