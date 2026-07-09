import { GestureDefinition } from '../types'

export const GEHE_VOR: GestureDefinition = {
  name: 'GEHE_VOR',
  label: 'Gehe vor',
  priority: 0,
  evaluate(ctx) {
    if (!ctx.canDetect || !ctx.armed) return null
    const { dominantDx, dynamicDxThreshold } = ctx.features
    if (dominantDx > dynamicDxThreshold) {
      return { confidence: 1 }
    }
    return null
  },
}
