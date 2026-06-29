import { DrawingUtils, NormalizedLandmark } from '@mediapipe/tasks-vision'

export function drawPoseFrame(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  landmarks?: NormalizedLandmark[][]
) {
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
