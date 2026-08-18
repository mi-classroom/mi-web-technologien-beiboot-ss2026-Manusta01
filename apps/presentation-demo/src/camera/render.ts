import { NormalizedLandmark } from '@mediapipe/tasks-vision'

export type PoseDrawOptions = {
  mirror?: boolean
  backgroundColor?: string
  landmarkColor?: string
  landmarkRadius?: number
}

export function drawPoseFrame(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  landmarks?: NormalizedLandmark[][],
  options: PoseDrawOptions = {}
): void {
  const { mirror = true, backgroundColor = '#02050a', landmarkColor = '#7cf0ff', landmarkRadius = 4 } = options

  if (!video.videoWidth || !video.videoHeight) {
    return
  }

  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.save()
  if (mirror) {
    ctx.scale(-1, 1)
    ctx.translate(-canvas.width, 0)
  }

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  if (landmarks) {
    ctx.fillStyle = landmarkColor
    for (const pose of landmarks) {
      for (const landmark of pose) {
        ctx.beginPath()
        ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, landmarkRadius, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  ctx.restore()
}
