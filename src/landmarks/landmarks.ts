import { NormalizedLandmark } from '@mediapipe/tasks-vision'

export const POSE_LANDMARK_NAMES = [
  'nose',
  'left_eye_inner',
  'left_eye',
  'left_eye_outer',
  'right_eye_inner',
  'right_eye',
  'right_eye_outer',
  'left_ear',
  'right_ear',
  'mouth_left',
  'mouth_right',
  'left_shoulder',
  'right_shoulder',
  'left_elbow',
  'right_elbow',
  'left_wrist',
  'right_wrist',
  'left_pinky',
  'right_pinky',
  'left_index',
  'right_index',
  'left_thumb',
  'right_thumb',
  'left_hip',
  'right_hip',
  'left_knee',
  'right_knee',
  'left_ankle',
  'right_ankle',
  'left_heel',
  'right_heel',
  'left_foot_index',
  'right_foot_index',
]

export function reducePoseLandmarks(firstPose: NormalizedLandmark[]) {
  return firstPose.map((lm, index) => ({
    index,
    name: POSE_LANDMARK_NAMES[index],
    x: Number(lm.x.toFixed(4)),
    y: Number(lm.y.toFixed(4)),
    z: Number(lm.z.toFixed(4)),
    visibility: lm.visibility !== undefined ? Number(lm.visibility.toFixed(4)) : null,
  }))
}
