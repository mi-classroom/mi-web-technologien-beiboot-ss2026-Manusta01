import { GestureDefinition } from '../types'

export const NAECHSTER_EINTRAG: GestureDefinition = {
  name: 'NAECHSTER_EINTRAG',
  label: 'Nächster Eintrag',
  priority: 5,
  evaluate(ctx) {
    if (!ctx.canDetect || !ctx.armed) return null
    const { rightArm, leftWristAboveShoulder, rightWristAboveShoulder, dynamicDyThreshold } = ctx.features
    if (!rightArm?.visible) return null
    if (leftWristAboveShoulder) return null
    if (!rightWristAboveShoulder) return null
    if (rightArm.dy < -dynamicDyThreshold) {
      return { confidence: 1 }
    }
    return null
  },
}
