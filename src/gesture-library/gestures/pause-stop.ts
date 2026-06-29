import { GestureDefinition } from '../types'

export const PAUSE_STOP: GestureDefinition = {
  name: 'PAUSE_STOP',
  label: 'Pause / Stop',
  priority: 10,
  evaluate(ctx) {
    if (!ctx.canDetect || !ctx.armed) return null
    const { rightWristAboveShoulder, leftWristAboveShoulder } = ctx.features
    if (rightWristAboveShoulder && leftWristAboveShoulder) {
      return { confidence: 1 }
    }
    return null
  },
}
