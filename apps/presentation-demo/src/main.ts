import './style.css'
import { createDefaultGestureRecognizer } from '@beiboot/gesture-library'
import { createPoseLandmarker, detectPoseForVideo, setupCamera } from './camera/posePipeline'
import { PresentationController } from './presentation/PresentationController'
import { SLIDES } from './presentation/slides'
import { renderGestureHelp, renderSlide, updateGestureStatus, updateMetrics } from './ui/render'
import { drawPoseFrame } from './camera/render'

const video = document.querySelector<HTMLVideoElement>('#video')!
const canvas = document.querySelector<HTMLCanvasElement>('#overlay')!
const slideEl = document.querySelector<HTMLElement>('#slide')!
const counterEl = document.querySelector<HTMLElement>('#slide-counter')!
const footerEl = document.querySelector<HTMLElement>('#slide-footer')!
const gestureStatusEl = document.querySelector<HTMLElement>('#gesture-status')!
const gestureHelpEl = document.querySelector<HTMLUListElement>('#gesture-help')!
const metricsEl = document.querySelector<HTMLElement>('#metrics')!
const ctx = canvas.getContext('2d')!

const recognizer = createDefaultGestureRecognizer()

const presentation = new PresentationController(SLIDES, () => {
  renderSlide(slideEl, counterEl, footerEl, presentation.getView(), presentation.getCurrentSlide())
})

renderGestureHelp(gestureHelpEl, recognizer.getRegisteredGestures())
renderSlide(slideEl, counterEl, footerEl, presentation.getView(), presentation.getCurrentSlide())

recognizer.on('gesture', (event) => {
  presentation.handleGesture(event.name)
})

let poseLandmarker: Awaited<ReturnType<typeof createPoseLandmarker>> | null = null
let lastVideoTime = -1
let lastFrameAt = performance.now()
let fps = 0

async function renderLoop(): Promise<void> {
  if (!poseLandmarker) return

  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime

    const { result, inferenceMs } = detectPoseForVideo(poseLandmarker, video)
    const gestureResult = recognizer.process(result.landmarks, performance.now())
    const debug = gestureResult.debug

    const now = performance.now()
    const delta = now - lastFrameAt
    fps = delta > 0 ? 1000 / delta : 0
    lastFrameAt = now

    updateGestureStatus(gestureStatusEl, debug, recognizer.labelFor.bind(recognizer), recognizer.getHoldTimeMs())
    updateMetrics(metricsEl, fps, inferenceMs, debug, recognizer.labelFor.bind(recognizer), recognizer.getHoldTimeMs())
    drawPoseFrame(ctx, canvas, video, result.landmarks)
  }

  requestAnimationFrame(renderLoop)
}

async function main(): Promise<void> {
  try {
    gestureStatusEl.textContent = 'Starte Kamera…'
    await setupCamera(video)

    gestureStatusEl.textContent = 'Lade MediaPipe…'
    poseLandmarker = await createPoseLandmarker()

    gestureStatusEl.textContent = 'Bereit — kurz neutral halten'
    requestAnimationFrame(renderLoop)
  } catch (error) {
    gestureStatusEl.textContent = 'Fehler beim Starten der Demo'
    console.error(error)
  }
}

main()
