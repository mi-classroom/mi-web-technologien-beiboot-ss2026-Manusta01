import { GestureDefinition } from '../types'

export const GEHE_ZURUECK: GestureDefinition = {
  name: 'GEHE_ZURUECK',
  label: 'Gehe zurück',
  priority: 0,
  evaluate(ctx) {
    if (!ctx.canDetect || !ctx.armed) return null
    const { dominantDx, dynamicDxThreshold } = ctx.features
    if (dominantDx < -dynamicDxThreshold) {
      return { confidence: 1 }
    }
    return null
  },
}
