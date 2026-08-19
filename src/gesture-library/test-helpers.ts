import { NormalizedLandmark } from '@mediapipe/tasks-vision'
import {
  LEFT_ELBOW,
  LEFT_SHOULDER,
  LEFT_WRIST,
  RIGHT_ELBOW,
  RIGHT_SHOULDER,
  RIGHT_WRIST,
} from './features/pose'

function landmark(x: number, y: number, visibility = 1): NormalizedLandmark {
  return { x, y, z: 0, visibility }
}

export function createPose(overrides: Partial<Record<number, NormalizedLandmark>> = {}): NormalizedLandmark[] {
  const pose = Array.from({ length: 33 }, () => landmark(0.5, 0.5))

  pose[LEFT_SHOULDER] = landmark(0.4, 0.5)
  pose[RIGHT_SHOULDER] = landmark(0.6, 0.5)
  pose[LEFT_ELBOW] = landmark(0.38, 0.55)
  pose[RIGHT_ELBOW] = landmark(0.62, 0.55)
  pose[LEFT_WRIST] = landmark(0.38, 0.62)
  pose[RIGHT_WRIST] = landmark(0.62, 0.62)

  for (const [index, value] of Object.entries(overrides)) {
    if (value) pose[Number(index)] = value
  }

  return pose
}

export function neutralPose(): NormalizedLandmark[] {
  return createPose()
}

export function geheVorPose(): NormalizedLandmark[] {
  return createPose({
    [RIGHT_WRIST]: landmark(0.72, 0.55),
    [RIGHT_ELBOW]: landmark(0.65, 0.55),
  })
}

export function pauseStopPose(): NormalizedLandmark[] {
  return createPose({
    [RIGHT_WRIST]: landmark(0.64, 0.35),
    [LEFT_WRIST]: landmark(0.36, 0.35),
    [RIGHT_ELBOW]: landmark(0.62, 0.42),
    [LEFT_ELBOW]: landmark(0.38, 0.42),
  })
}

export function naechsterEintragPose(): NormalizedLandmark[] {
  return createPose({
    [RIGHT_WRIST]: landmark(0.64, 0.35),
    [RIGHT_ELBOW]: landmark(0.62, 0.42),
  })
}
