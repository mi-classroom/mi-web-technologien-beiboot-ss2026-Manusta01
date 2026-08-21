import { GestureDebug } from '@beiboot/gesture-library'
import { PresentationView } from '../presentation/PresentationController'

const GESTURE_ACTIONS: Record<string, string> = {
  GEHE_VOR: 'Arm seitlich halten → nächste Folie',
  GEHE_ZURUECK: 'Andere Seite halten → vorherige Folie',
  PAUSE_STOP: 'Beide Arme oben → Auto-Weiter pausieren / fortsetzen',
  NAECHSTER_EINTRAG: 'Nur rechter Arm oben → nächster Bullet (letzter → nächste Folie)',
}

export function renderGestureHelp(
  listEl: HTMLUListElement,
  gestures: ReadonlyArray<{ name: string; label: string }>
): void {
  listEl.innerHTML = gestures
    .map((gesture) => {
      const action = GESTURE_ACTIONS[gesture.name] ?? '—'
      return `<li><strong>${gesture.label}</strong><span>${action}</span></li>`
    })
    .join('')
}

export function renderSlide(
  slideEl: HTMLElement,
  counterEl: HTMLElement,
  footerEl: HTMLElement,
  view: PresentationView,
  slide: { title: string; bullets: string[] }
): void {
  counterEl.textContent = `Folie ${view.slideIndex + 1} / ${view.slideCount}`
  slideEl.innerHTML = `
    <h1>${slide.title}</h1>
    <ul>
      ${slide.bullets
        .map((bullet, index) => {
          const visible = index <= view.bulletIndex
          return `<li class="${visible ? 'visible' : 'hidden'}">${bullet}</li>`
        })
        .join('')}
    </ul>
  `
  footerEl.textContent = view.paused
    ? 'Auto-Weiter pausiert — Pause / Stop erneut für Fortsetzen'
    : 'Auto-Weiter aktiv (ca. 12 s pro Folie)'
}

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
    statusEl.textContent = `Cooldown (${debug.cooldownMs.toFixed(0)} ms)`
    return
  }
  if (!debug.armed) {
    statusEl.textContent = 'Bitte kurz neutral halten…'
    return
  }
  statusEl.textContent = 'Bereit — Geste ausführen'
}

export function updateMetrics(
  metricsEl: HTMLElement,
  fps: number,
  inferenceMs: number,
  debug: GestureDebug,
  labelFn: (name: string) => string,
  holdTimeMs: number
): void {
  metricsEl.innerHTML = `
    <div>FPS: ${fps.toFixed(1)}</div>
    <div>Inference: ${inferenceMs.toFixed(1)} ms</div>
    <div>Aktiv: ${labelFn(debug.activeGesture)}</div>
    <div>Kandidat: ${labelFn(debug.candidateGesture)} (${debug.candidateHoldMs.toFixed(0)} / ${holdTimeMs} ms)</div>
    <div>Armed: ${debug.armed ? 'ja' : 'nein'}</div>
    <div>Cooldown: ${debug.cooldownMs.toFixed(0)} ms</div>
    <div>Pose-Verlust: ${debug.poseLostMs > 0 ? `${debug.poseLostMs.toFixed(0)} ms` : '—'}</div>
  `
}
