# Gesten-Präsentation (Issue #4)

Eigenständige Demo-Anwendung, die die Gesture Library als externe Abhängigkeit nutzt. Steuert Folien und Bullet-Points per Körpergesten.

**Live:** https://mi-classroom.github.io/mi-web-technologien-beiboot-ss2026-Manusta01/ (deployed aus `main`).

## Gesten-Mapping

| Geste (Library)  | Pose (kurz)                                              | Aktion in der Demo                                                          |
| ---------------- | -------------------------------------------------------- | --------------------------------------------------------------------------- |
| Gehe vor         | Arm seitlich halten (`dominantDx` positiv im Kamerabild) | Nächste Folie                                                               |
| Gehe zurück      | Arm zur anderen Seite halten                             | Vorherige Folie (Bullet-Index springt auf den **letzten** Bullet der Folie) |
| Nächster Eintrag | Nur rechter Arm oben, links unten                        | Nächster Bullet; beim **letzten** Bullet → nächste Folie                    |
| Pause / Stop     | Beide Arme oben                                          | Auto-Weiter pausieren / fortsetzen                                          |

Ausführliche Posen und Spiegelung: [docs/gestures.md](../../docs/gestures.md).

### Ablauf

1. Neutral halten, bis „Bereit“ erscheint (~220 ms Arming).
2. Geste ca. **450 ms** halten.
3. Nach Erkennung ~900 ms Cooldown.
4. Auto-Weiter alle ca. **12 s** zur nächsten Folie (pausierbar).

## Abhängigkeiten

Die App importiert **ausschließlich** aus:

- `@beiboot/gesture-library` — Gestenerkennung (öffentliche API)
- `@beiboot/pose-camera` — Kamera, MediaPipe-Inferenz, Landmark-Rendering

Kein Zugriff auf interne Library-Module wie `features/`, `stabilization.ts` oder einzelne Gesture-Plugins.

## Starten

Vom Repository-Root (empfohlen, nutzt Lockfile):

```bash
npm ci
npm run dev:presentation
```

Die Demo läuft standardmäßig auf [http://localhost:5174](http://localhost:5174).

## Reflexion (API-Erkenntnis)

Beim Bauen der Hilfe-UI fehlte eine Möglichkeit, registrierte Gesten über die öffentliche API abzufragen. Details: [ADR 004](../../docs/adr/004-gesture-enumeration-api.md).
