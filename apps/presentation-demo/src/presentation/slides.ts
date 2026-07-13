export type Slide = {
  title: string
  bullets: string[]
}

export const SLIDES: Slide[] = [
  {
    title: 'Willkommen zur Gesten-Präsentation',
    bullets: [
      'Diese Demo steuert Folien ausschließlich über die öffentliche Gesture-Library-API.',
      'Halten Sie kurz eine neutrale Pose, bis „Bereit“ erscheint.',
      'Führen Sie dann eine Geste stabil aus — sie muss etwa 450 ms gehalten werden.',
    ],
  },
  {
    title: 'Navigation zwischen Folien',
    bullets: [
      'Gehe vor: nächste Folie',
      'Gehe zurück: vorherige Folie',
      'Die Erkennung nutzt horizontale Armbewegungen relativ zur Schulter.',
    ],
  },
  {
    title: 'Feinsteuerung auf der aktuellen Folie',
    bullets: [
      'Nächster Eintrag: nächster Bullet-Point',
      'Pause / Stop: Auto-Weiter pausieren oder fortsetzen',
      'So lassen sich Inhalte Schritt für Schritt enthüllen.',
    ],
  },
  {
    title: 'Reflexion aus Consumer-Sicht',
    bullets: [
      'Für die Hilfe-UI fehlte eine Möglichkeit, registrierte Gesten abzufragen.',
      'Die Library ergänzt deshalb getRegisteredGestures() in der öffentlichen API.',
      'Details stehen in docs/adr/004-gesture-enumeration-api.md.',
    ],
  },
]
