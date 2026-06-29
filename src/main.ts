import './style.css'
import { PoseLandmarker, NormalizedLandmark } from '@mediapipe/tasks-vision'
import { GestureDebug, labelForGesture, evaluateGesture, drawGestureHud, HOLD_TIME_MS } from './gestures/gestures'
import { createPoseLandmarker, detectPoseForVideo } from './landmarks/inference'
import { drawPoseFrame } from './landmarks/render'
import { toRawDebugText } from './debug/rawFormatter'

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

let lastDebug: GestureDebug = {
  activeGesture: 'NONE',
  candidateGesture: 'NONE',
  candidateHoldMs: 0,
  cooldownMs: 0,
  armed: false,
  inNeutral: false,
  maxAbsDx: 0,
  shoulderSpan: 0,
  dynamicDxThreshold: 0,
  rightArm: null,
  leftArm: null,
}

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
  poseLandmarker = await createPoseLandmarker()

  statusEl.textContent = 'Bereit'
}

function resizeCanvas() {
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
}

function updateMetrics(inferenceMs: number, landmarkCount: number, debug: GestureDebug) {
  const now = performance.now()
  const delta = now - lastFrameAt
  fps = delta > 0 ? 1000 / delta : 0
  lastFrameAt = now

  const candidateLabel = labelForGesture(debug.candidateGesture)
  const activeLabel = labelForGesture(debug.activeGesture)

  metricsEl.innerHTML = `
    <div>FPS: ${fps.toFixed(1)}</div>
    <div>Inference: ${inferenceMs.toFixed(1)} ms</div>
    <div>Landmarks: ${landmarkCount}</div>
    <div>Video: ${video.videoWidth}x${video.videoHeight}</div>
    <div>Aktive Geste: ${activeLabel}</div>
    <div>Kandidat: ${candidateLabel} (${debug.candidateHoldMs.toFixed(0)} / ${HOLD_TIME_MS} ms)</div>
    <div>Cooldown: ${debug.cooldownMs.toFixed(0)} ms</div>
    <div>Armed: ${debug.armed ? 'ja' : 'nein'}, Neutral: ${debug.inNeutral ? 'ja' : 'nein'}, max|dx|: ${debug.maxAbsDx.toFixed(3)}</div>
    <div>Schulterbreite: ${debug.shoulderSpan.toFixed(3)}, X-Schwelle: ${debug.dynamicDxThreshold.toFixed(3)}</div>
  `
}

function drawResults(landmarks?: NormalizedLandmark[][]) {
  drawPoseFrame(ctx, canvas, video, landmarks)
  drawGestureHud(lastDebug)
}

function showRawData(landmarks?: NormalizedLandmark[][]) {
  rawEl.textContent = toRawDebugText(landmarks, lastDebug)
}
async function renderLoop() {
  if (!poseLandmarker) return

  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime

    const { result, inferenceMs } = detectPoseForVideo(poseLandmarker, video)

    lastDebug = evaluateGesture(result.landmarks)
    drawResults(result.landmarks)
    showRawData(result.landmarks)
    updateMetrics(inferenceMs, result.landmarks?.[0]?.length ?? 0, lastDebug)
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
    console.log('Error during initialization:', error)
  }
}

main()
