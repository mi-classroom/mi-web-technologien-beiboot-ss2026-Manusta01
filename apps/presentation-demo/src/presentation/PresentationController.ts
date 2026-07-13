import { Slide } from './slides'

const AUTO_ADVANCE_MS = 12_000

export type PresentationView = {
  slideIndex: number
  bulletIndex: number
  paused: boolean
  slideCount: number
}

export class PresentationController {
  private slideIndex = 0
  private bulletIndex = 0
  private paused = false
  private autoAdvanceTimer: number | null = null

  constructor(
    private readonly slides: Slide[],
    private readonly onUpdate: () => void
  ) {
    this.scheduleAutoAdvance()
  }

  handleGesture(name: string): void {
    switch (name) {
      case 'GEHE_VOR':
        this.nextSlide()
        break
      case 'GEHE_ZURUECK':
        this.previousSlide()
        break
      case 'PAUSE_STOP':
        this.togglePause()
        break
      case 'NAECHSTER_EINTRAG':
        this.nextBullet()
        break
    }
  }

  getView(): PresentationView {
    return {
      slideIndex: this.slideIndex,
      bulletIndex: this.bulletIndex,
      paused: this.paused,
      slideCount: this.slides.length,
    }
  }

  getCurrentSlide(): Slide {
    return this.slides[this.slideIndex]
  }

  destroy(): void {
    this.clearAutoAdvance()
  }

  private nextSlide(): void {
    if (this.slideIndex >= this.slides.length - 1) return
    this.slideIndex += 1
    this.bulletIndex = 0
    this.restartAutoAdvance()
    this.onUpdate()
  }

  private previousSlide(): void {
    if (this.slideIndex <= 0) return
    this.slideIndex -= 1
    this.bulletIndex = this.slides[this.slideIndex].bullets.length - 1
    this.restartAutoAdvance()
    this.onUpdate()
  }

  private nextBullet(): void {
    const maxBullets = this.slides[this.slideIndex].bullets.length
    if (this.bulletIndex >= maxBullets - 1) {
      this.nextSlide()
      return
    }
    this.bulletIndex += 1
    this.restartAutoAdvance()
    this.onUpdate()
  }

  private togglePause(): void {
    this.paused = !this.paused
    if (this.paused) {
      this.clearAutoAdvance()
    } else {
      this.scheduleAutoAdvance()
    }
    this.onUpdate()
  }

  private restartAutoAdvance(): void {
    this.clearAutoAdvance()
    if (!this.paused) {
      this.scheduleAutoAdvance()
    }
  }

  private scheduleAutoAdvance(): void {
    this.autoAdvanceTimer = window.setTimeout(() => {
      this.nextSlide()
    }, AUTO_ADVANCE_MS)
  }

  private clearAutoAdvance(): void {
    if (this.autoAdvanceTimer !== null) {
      window.clearTimeout(this.autoAdvanceTimer)
      this.autoAdvanceTimer = null
    }
  }
}
