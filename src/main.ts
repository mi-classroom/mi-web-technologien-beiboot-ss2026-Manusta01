import './style.css'
import { FilesetResolver, PoseLandmarker, DrawingUtils, NormalizedLandmark } from '@mediapipe/tasks-vision'
import { POSE_LANDMARK_NAMES } from './landmark_names'

const video = document.querySelector<HTMLVideoElement>('#video')!
const canvas = document.querySelector<HTMLCanvasElement>('#overlay')!
const statusEl = document.querySelector<HTMLDivElement>('#status')!
const metricsEl = document.querySelector<HTMLDivElement>('#metrics')!
const rawEl = document.querySelector<HTMLPreElement>('#raw')!
const ctx = canvas.getContext('2d')!

let poseLandmarker: PoseLandmarker | null = null
let lastVideoTime = -1
let lastFrameAt = performance.now()
let fps = 0

async function setupCamera() {
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

async function setupPose() {
  statusEl.textContent = 'Lade MediaPipe…'

  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
  )

  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
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

  statusEl.textContent = 'Bereit'
}

function resizeCanvas() {
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
}

function updateMetrics(inferenceMs: number, landmarkCount: number) {
  const now = performance.now()
  const delta = now - lastFrameAt
  fps = delta > 0 ? 1000 / delta : 0
  lastFrameAt = now

  metricsEl.innerHTML = `
    <div>FPS: ${fps.toFixed(1)}</div>
    <div>Inference: ${inferenceMs.toFixed(1)} ms</div>
    <div>Landmarks: ${landmarkCount}</div>
    <div>Video: ${video.videoWidth}x${video.videoHeight}</div>
  `
}

function drawResults(landmarks?: NormalizedLandmark[][]) {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  if (!landmarks || landmarks.length === 0) {
    return
  }

  const drawingUtils = new DrawingUtils(ctx)

  for (const pose of landmarks) {
    drawingUtils.drawLandmarks(pose, {
      radius: 3,
      color: '#00ff88',
      fillColor: '#00ff88',
    })
  }
}

function showRawData(landmarks?: NormalizedLandmark[][]) {
  if (!landmarks || landmarks.length === 0) {
    rawEl.textContent = 'Keine Pose erkannt'
    return
  }

  const firstPose = landmarks[0]
  const reduced = firstPose.map((lm, index) => ({
    index,
    name: POSE_LANDMARK_NAMES[index],
    x: Number(lm.x.toFixed(4)),
    y: Number(lm.y.toFixed(4)),
    z: Number(lm.z.toFixed(4)),
    visibility: lm.visibility !== undefined ? Number(lm.visibility.toFixed(4)) : null,
  }))

  rawEl.textContent = JSON.stringify(reduced, null, 2)
}

async function renderLoop() {
  if (!poseLandmarker) return

  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime

    const started = performance.now()
    const result = poseLandmarker.detectForVideo(video, started)
    const inferenceMs = performance.now() - started

    drawResults(result.landmarks)
    showRawData(result.landmarks)
    updateMetrics(inferenceMs, result.landmarks?.[0]?.length ?? 0)
  }

  requestAnimationFrame(renderLoop)
}

async function main() {
  try {
    await setupCamera()
    resizeCanvas()
    await setupPose()
    requestAnimationFrame(renderLoop)
  } catch (error) {
    statusEl.textContent = 'Fehler beim Starten der Demo'
    rawEl.textContent = error instanceof Error ? error.message : String(error)
  }
}

main()
