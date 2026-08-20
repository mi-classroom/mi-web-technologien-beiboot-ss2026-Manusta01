# Beiboot — Web-Technologien (Demoprojekt)

## Kurzbeschreibung

Browser-Demo zur Pose-/Landmark-Erkennung (TypeScript, Vite, MediaPipe) mit erweiterbarer Gesture Library. Zwei Anwendungen nutzen dieselbe Library und eine gemeinsame Kamera-/Pose-Infrastruktur.

## Anwendungen

| App | Befehl | Zweck |
| --- | --- | --- |
| **Pose-Demo** (Root) | `npm run dev` | Rohdaten, Landmarks, Debug-Metriken (Issue #1–#3) |
| **Gesten-Präsentation** | `npm run dev:presentation` | Folien steuern per Geste — Consumer der öffentlichen API (Issue #4); **empfohlene Demo für Issue #5** |

## Architektur

- `@beiboot/gesture-library` (`src/gesture-library/`) — Gestenerkennung, öffentliche API
- `@beiboot/pose-camera` (`src/pose-camera/`) — Kamera, MediaPipe-Inferenz, Landmark-Rendering (geteilt von beiden Apps)
- `apps/presentation-demo/` — eigenständige App, importiert nur die öffentlichen Pakete

## Wichtigste Merkmale

- Live-Webcam mit Pose/Landmark-Visualisierung
- Plugin-basierte Gestenerkennung (Hold, Cooldown, Arming, Pose-Loss-Grace, EMA-Glättung)
- Vitest-Baseline mit Vorher/Nachher-Kennzahlen (Issue #5, Weg B)

## Dokumentation

- [Gestenvokabular und Bewertung](docs/gestures.md)
- [Datenqualität der Pose-Landmarks (Issue #1)](docs/data-quality.md)
- [Gesture Library API](docs/gesture-library-api.md)
- [ADR: MediaPipe Pose Landmarker](docs/adr/001-mediapipe-pose-landmarker.md)
- [ADR: Gesture Library Architektur](docs/adr/002-gesture-library-architecture.md)
- [ADR: Auswahl weiterer Gesten](docs/adr/003-gesture-selection.md)
- [ADR: API zum Auflisten registrierter Gesten](docs/adr/004-gesture-enumeration-api.md)
- [ADR: Issue #5 — Weg B Robustheit](docs/adr/005-issue5-path-b-robustness.md)
- [ADR: Pose-Verlust-Grace](docs/adr/006-pose-loss-grace.md)
- [ADR: Glättung und Disambiguierung](docs/adr/007-smoothing-and-disambiguation.md)
- [Baseline-Messung Vorher/Nachher (Issue #5)](docs/baseline-measurement.md)
- [Gesten-Präsentation (Issue #4)](apps/presentation-demo/README.md)

## Voraussetzungen

- Node.js >= 23 (siehe auch `engines` in `package.json`)
- npm
- Webcam und HTTPS bzw. `localhost` für Kamerazugriff

## Schnellstart (Entwicklung)

```bash
npm install
npm run dev
```

Gesten-Präsentation:

```bash
npm run dev:presentation
```

Tests:

```bash
npm test
```

Öffne `http://localhost:5173` (Pose-Demo) bzw. `http://localhost:5174` (Präsentation).

## Build für Produktion

Pose-Demo:

```bash
npm run build
npm run preview
```

Präsentation (empfohlen für öffentliches Demo):

```bash
npm run build:presentation
npm run preview --workspace=@beiboot/presentation-demo
```

Die Build-Ausgabe liegt unter `dist/` bzw. `apps/presentation-demo/dist/`.

## Deploy (selbst)

Statisches Hosting mit **HTTPS** (Kamera-API). Beispiel GitHub Pages:

1. Präsentation bauen: `npm run build:presentation`
2. Inhalt von `apps/presentation-demo/dist/` als Pages-Artefakt veröffentlichen
3. Bei Projekt-Seiten unter `/<repo>/` in `apps/presentation-demo/vite.config.ts` `base: '/<repo>/'` setzen und neu bauen
4. Öffentliche URL in der README oder im Issue hinterlegen

Alternativen: Cloudflare Pages, Netlify, Vercel — jeweils Build-Befehl `npm run build:presentation` und Publish-Directory `apps/presentation-demo/dist`.
