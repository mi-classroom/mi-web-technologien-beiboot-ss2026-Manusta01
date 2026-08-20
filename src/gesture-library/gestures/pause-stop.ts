import { GestureDefinition } from '../types'

export const PAUSE_STOP: GestureDefinition = {
  name: 'PAUSE_STOP',
  label: 'Pause / Stop',
  priority: 10,
  evaluate(ctx) {
    if (!ctx.canDetect || !ctx.armed) return null
    const { rightWristAboveShoulder, leftWristAboveShoulder, rightArm, leftArm } = ctx.features
    if (!rightArm?.visible || !leftArm?.visible) return null
    if (rightWristAboveShoulder && leftWristAboveShoulder) {
      return { confidence: 1 }
    }
    return null
  },
}
