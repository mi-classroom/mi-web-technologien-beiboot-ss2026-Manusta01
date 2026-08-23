export type Slide = {
  title: string
  bullets: string[]
}

export const SLIDES: Slide[] = [
  {
    title: 'Willkommen zur Gesten-Präsentation',
    bullets: [
      'Diese Demo steuert Folien ausschließlich über die öffentliche Gesture-Library-API.',
      'Halten Sie kurz eine neutrale Pose (Arme unten), bis „Bereit“ erscheint.',
      'Führen Sie dann eine Geste aus und halten Sie sie ca. 450 ms — kein kurzes Tippen.',
    ],
  },
  {
    title: 'Navigation zwischen Folien',
    bullets: [
      'Gehe vor: einen Arm klar seitlich halten (Bild-X / dominantDx).',
      'Gehe zurück: Arm zur anderen Seite halten.',
      'Die Vorschau ist gespiegelt; die Erkennung läuft auf dem ungespiegelten Kamerabild.',
    ],
  },
  {
    title: 'Feinsteuerung auf der aktuellen Folie',
    bullets: [
      'Nächster Eintrag: nur rechten Arm oben halten (links unten) — letzter Bullet springt zur nächsten Folie.',
      'Pause / Stop: beide Arme oben — Auto-Weiter pausieren oder fortsetzen.',
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
