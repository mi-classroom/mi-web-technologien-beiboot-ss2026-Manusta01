import { FilesetResolver, PoseLandmarker, PoseLandmarkerResult } from '@mediapipe/tasks-vision'

export async function createPoseLandmarker(): Promise<PoseLandmarker> {
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
  )

  return PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
    },
    runningMode: 'VIDEO',
    numPoses: 1,
    minPoseDetectionConfidence: 0.5,
    minPosePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
    outputSegmentationMasks: false,
  })
}

export function detectPoseForVideo(
  poseLandmarker: PoseLandmarker,
  video: HTMLVideoElement
): { result: PoseLandmarkerResult; inferenceMs: number } {
  const started = performance.now()
  const result = poseLandmarker.detectForVideo(video, started)
  return { result, inferenceMs: performance.now() - started }
}

export async function setupCamera(video: HTMLVideoElement): Promise<void> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      facingMode: 'user',
    },
    audio: false,
  })

  video.srcObject = stream

  await new Promise<void>((resolve) => {
    video.onloadedmetadata = () => resolve()
  })

  await video.play()
}
