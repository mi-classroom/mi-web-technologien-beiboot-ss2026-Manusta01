import { GestureRecognizer } from './engine'
import { GEHE_VOR } from './gestures/gehe-vor'
import { GEHE_ZURUECK } from './gestures/gehe-zurueck'
import { NAECHSTER_EINTRAG } from './gestures/naechster-eintrag'
import { PAUSE_STOP } from './gestures/pause-stop'

export function createDefaultGestureRecognizer(config?: ConstructorParameters<typeof GestureRecognizer>[0]) {
  const recognizer = new GestureRecognizer(config)
  recognizer.register(GEHE_VOR)
  recognizer.register(GEHE_ZURUECK)
  recognizer.register(PAUSE_STOP)
  recognizer.register(NAECHSTER_EINTRAG)
  return recognizer
}
