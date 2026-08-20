# Gesten-Präsentation (Issue #4)

Eigenständige Demo-Anwendung, die die Gesture Library als externe Abhängigkeit nutzt. Steuert Folien und Bullet-Points per Körpergesten.

## Gesten-Mapping

| Geste (Library)  | Aktion in der Demo               |
| ---------------- | -------------------------------- |
| Gehe vor         | Nächste Folie                    |
| Gehe zurück      | Vorherige Folie                  |
| Nächster Eintrag | Nächster Bullet-Point            |
| Pause / Stop     | Auto-Weiter pausieren/fortsetzen |

## Abhängigkeiten

Die App importiert **ausschließlich** aus:

- `@beiboot/gesture-library` — Gestenerkennung (öffentliche API)
- `@beiboot/pose-camera` — Kamera, MediaPipe-Inferenz, Landmark-Rendering

Kein Zugriff auf interne Library-Module wie `features/`, `stabilization.ts` oder einzelne Gesture-Plugins.

## Starten

Vom Repository-Root:

```bash
npm install
npm run dev:presentation
```

Oder direkt im App-Ordner:

```bash
cd apps/presentation-demo
npm install
npm run dev
```

Die Demo läuft standardmäßig auf [http://localhost:5174](http://localhost:5174).

## Reflexion (API-Erkenntnis)

Beim Bauen der Hilfe-UI fehlte eine Möglichkeit, registrierte Gesten über die öffentliche API abzufragen. Details und Begründung der Library-Änderung: [ADR 004](../../docs/adr/004-gesture-enumeration-api.md).
