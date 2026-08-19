# Beiboot — Web-Technologien (Demoprojekt)

## Kurzbeschreibung

Dieses Repository enthält ein kleines Frontend-Demoprojekt zur Pose-/Landmark-Erkennung im Browser (TypeScript, Vite). Es demonstriert die Integration von Mediapipe-ähnlichen Modelle, Anzeige von Landmarken und eine einfache Entwicklungs- sowie Dokumentationsstruktur (ADR).

## Wichtigste Merkmale

- Live-Webcam-Demo mit Pose/Landmark-Visualisierung
- Implementiert in TypeScript + Vite
- Prototypische Gestenerkennung auf Basis der Pose-Landmarks mit erweiterbarer Gesture Library
- Eigenständige Gesten-Präsentation (`apps/presentation-demo/`, Issue #4)

## Dokumentation

- [Gestenvokabular und Bewertung](docs/gestures.md)
- [Gesture Library API](docs/gesture-library-api.md)
- [ADR: MediaPipe Pose Landmarker](docs/adr/001-mediapipe-pose-landmarker.md)
- [ADR: Gesture Library Architektur](docs/adr/002-gesture-library-architecture.md)
- [ADR: Auswahl weiterer Gesten](docs/adr/003-gesture-selection.md)
- [ADR: API zum Auflisten registrierter Gesten](docs/adr/004-gesture-enumeration-api.md)
- [ADR: Issue #5 — Weg B Robustheit](docs/adr/005-issue5-path-b-robustness.md)
- [Baseline-Messung Vorher/Nachher (Issue #5)](docs/baseline-measurement.md)
- [Gesten-Präsentation (Issue #4)](apps/presentation-demo/README.md)

## Voraussetzungen

- Node.js >= 23
- npm oder yarn

## Schnellstart (Entwicklung)

Installieren und starten:

```bash
npm install
npm run dev
```

Gesten-Präsentation (Issue #4):

```bash
npm run dev:presentation
```

Tests (Gesture Library Baseline):

```bash
npm test
```

Öffne anschließend `http://localhost:5173` (Pose-Demo) bzw. `http://localhost:5174` (Präsentation) im Browser.

## Build für Produktion

```bash
npm run build
npm run preview
```
