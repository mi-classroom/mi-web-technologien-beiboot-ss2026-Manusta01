import { GestureDebug } from '../gesture-library'

export function updateGestureStatus(
  statusEl: HTMLElement,
  debug: GestureDebug,
  labelFn: (name: string) => string,
  holdTimeMs: number
): void {
  if (debug.activeGesture !== 'NONE') {
    statusEl.textContent = `Erkannt: ${labelFn(debug.activeGesture)}`
    return
  }
  if (debug.candidateGesture !== 'NONE') {
    statusEl.textContent = `Kandidat: ${labelFn(debug.candidateGesture)} (${debug.candidateHoldMs.toFixed(0)} / ${holdTimeMs} ms)`
    return
  }
  if (debug.cooldownMs > 0) {
    statusEl.textContent = `Cooldown aktiv (${debug.cooldownMs.toFixed(0)} ms)`
    return
  }
  if (!debug.armed) {
    statusEl.textContent = 'Bitte kurz neutral halten, dann Geste ausführen'
    return
  }
  statusEl.textContent = 'Bereit - warte auf Geste'
}

export function drawGestureHud(
  debug: GestureDebug,
  labelFn: (name: string) => string,
  holdTimeMs: number,
  ctx: CanvasRenderingContext2D
): void {
  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
  ctx.fillRect(12, 12, 500, 74)
  ctx.fillStyle = '#ffffff'
  ctx.font = '20px sans-serif'
  ctx.fillText(`Aktive Geste: ${labelFn(debug.activeGesture)}`, 24, 40)
  ctx.font = '16px sans-serif'
  ctx.fillText(
    `Kandidat: ${labelFn(debug.candidateGesture)} (${debug.candidateHoldMs.toFixed(0)} / ${holdTimeMs} ms), Cooldown: ${debug.cooldownMs.toFixed(0)} ms`,
    24,
    64
  )
  ctx.restore()
}
