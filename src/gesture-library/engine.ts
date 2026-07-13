import {
  GestureContext,
  GestureDebug,
  GestureDefinition,
  GestureEvent,
  GestureResult,
  NONE_GESTURE,
  PoseLandmarks,
  RecognizerConfig,
  RegisteredGesture,
} from './types'
import { emptyFrameFeatures, extractFrameFeatures } from './features/pose'
import {
  createStabilizationState,
  resetStabilizationOnLostPose,
  StabilizationConfig,
  stepStabilization,
} from './stabilization'

export const DEFAULT_HOLD_TIME_MS = 450
export const DEFAULT_COOLDOWN_MS = 900

type ResolvedConfig = {
  holdTimeMs: number
  cooldownMs: number
  horizontalDxMin: number
  shoulderSpanFactor: number
  candidateGraceMs: number
  elbowVisibilityMin: number
  visibilityMin: number
  neutralDxFactor: number
  neutralHoldMs: number
}

function resolveConfig(config: RecognizerConfig): ResolvedConfig {
  return {
    holdTimeMs: config.holdTimeMs ?? DEFAULT_HOLD_TIME_MS,
    cooldownMs: config.cooldownMs ?? DEFAULT_COOLDOWN_MS,
    horizontalDxMin: config.horizontalDxMin ?? 0.03,
    shoulderSpanFactor: config.shoulderSpanFactor ?? 0.2,
    candidateGraceMs: config.candidateGraceMs ?? 180,
    elbowVisibilityMin: config.elbowVisibilityMin ?? 0.45,
    visibilityMin: config.visibilityMin ?? 0.45,
    neutralDxFactor: config.neutralDxFactor ?? 0.55,
    neutralHoldMs: config.neutralHoldMs ?? 220,
  }
}

type GestureHandler = (event: GestureEvent) => void

export class GestureRecognizer {
  private readonly config: ResolvedConfig
  private readonly stabilizationConfig: StabilizationConfig
  private readonly featureConfig: {
    visibilityMin: number
    elbowVisibilityMin: number
    horizontalDxMin: number
    shoulderSpanFactor: number
  }
  private readonly gestures: GestureDefinition[] = []
  private readonly gestureLabels = new Map<string, string>()
  private readonly handlers = new Map<string, Set<GestureHandler>>()
  private readonly state = createStabilizationState()

  constructor(config: RecognizerConfig = {}) {
    this.config = resolveConfig(config)
    this.stabilizationConfig = {
      holdTimeMs: this.config.holdTimeMs,
      cooldownMs: this.config.cooldownMs,
      horizontalDxMin: this.config.horizontalDxMin,
      neutralDxFactor: this.config.neutralDxFactor,
      neutralHoldMs: this.config.neutralHoldMs,
      candidateGraceMs: this.config.candidateGraceMs,
    }
    this.featureConfig = {
      visibilityMin: this.config.visibilityMin,
      elbowVisibilityMin: this.config.elbowVisibilityMin,
      horizontalDxMin: this.config.horizontalDxMin,
      shoulderSpanFactor: this.config.shoulderSpanFactor,
    }
  }

  register(gesture: GestureDefinition): void {
    if (this.gestureLabels.has(gesture.name)) {
      throw new Error(`Gesture "${gesture.name}" is already registered`)
    }
    this.gestures.push(gesture)
    this.gestureLabels.set(gesture.name, gesture.label)
  }

  on(event: 'gesture', handler: GestureHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)!.add(handler)
    return () => this.handlers.get(event)?.delete(handler)
  }

  getHoldTimeMs(): number {
    return this.config.holdTimeMs
  }

  getRegisteredGestures(): ReadonlyArray<RegisteredGesture> {
    return this.gestures.map((gesture) => ({
      name: gesture.name,
      label: gesture.label,
    }))
  }

  labelFor(name: string): string {
    if (name === NONE_GESTURE) return '—'
    return this.gestureLabels.get(name) ?? name
  }

  process(landmarks: PoseLandmarks | undefined, timestamp: number): GestureResult {
    if (!landmarks || landmarks.length === 0) {
      resetStabilizationOnLostPose(this.state)
      const features = emptyFrameFeatures(this.featureConfig)
      const active = timestamp <= this.state.activeGestureUntil ? this.state.activeGesture : NONE_GESTURE
      return this.buildResult(active, NONE_GESTURE, 0, features, {
        armed: false,
        inNeutral: false,
        cooldownMs: Math.max(0, this.state.cooldownUntil - timestamp),
      })
    }

    const features = extractFrameFeatures(landmarks[0], this.featureConfig)
    const canDetect = timestamp >= this.state.cooldownUntil
    const ctx: GestureContext = {
      armed: this.state.armed,
      canDetect,
      features,
      timestamp,
    }

    const frameGesture = this.pickFrameGesture(ctx)
    const step = stepStabilization(this.state, frameGesture, features, timestamp, this.stabilizationConfig)

    if (step.triggered) {
      this.emit('gesture', {
        name: this.state.activeGesture,
        label: this.labelFor(this.state.activeGesture),
        timestamp,
      })
    }

    return this.buildResult(step.activeGesture, step.candidateGesture, step.candidateHoldMs, features, step)
  }

  private pickFrameGesture(ctx: GestureContext): string {
    let winner: GestureDefinition | null = null
    let winnerPriority = -Infinity

    for (const gesture of this.gestures) {
      const match = gesture.evaluate(ctx)
      if (!match) continue
      const priority = gesture.priority ?? 0
      if (priority > winnerPriority) {
        winner = gesture
        winnerPriority = priority
      }
    }

    return winner?.name ?? NONE_GESTURE
  }

  private buildResult(
    activeGesture: string,
    candidateGesture: string,
    candidateHoldMs: number,
    features: ReturnType<typeof extractFrameFeatures>,
    step: {
      armed: boolean
      inNeutral: boolean
      cooldownMs: number
    }
  ): GestureResult {
    const debug: GestureDebug = {
      activeGesture,
      candidateGesture,
      candidateHoldMs,
      cooldownMs: step.cooldownMs,
      armed: step.armed,
      inNeutral: step.inNeutral,
      maxAbsDx: features.maxAbsDx,
      shoulderSpan: features.shoulderSpan,
      dynamicDxThreshold: features.dynamicDxThreshold,
      rightArm: features.rightArm,
      leftArm: features.leftArm,
    }

    return { activeGesture, candidateGesture, debug }
  }

  private emit(event: 'gesture', payload: GestureEvent): void {
    for (const handler of this.handlers.get(event) ?? []) {
      handler(payload)
    }
  }
}
