# Beiboot — Web-Technologien (Demoprojekt)

## Kurzbeschreibung

Dieses Repository enthält ein kleines Frontend-Demoprojekt zur Pose-/Landmark-Erkennung im Browser (TypeScript, Vite). Es demonstriert die Integration von Mediapipe-ähnlichen Modelle, Anzeige von Landmarken und eine einfache Entwicklungs- sowie Dokumentationsstruktur (ADR).

## Wichtigste Merkmale

- Live-Webcam-Demo mit Pose/Landmark-Visualisierung
- Implementiert in TypeScript + Vite
- Prototypische Gestenerkennung auf Basis der Pose-Landmarks mit sichtbarer Textausgabe in der Demo

## Dokumentation

- [Gestenvokabular und Bewertung](docs/gestures.md)
- [ADR: MediaPipe Pose Landmarker](docs/adr/001-mediapipe-pose-landmarker.md)

## Voraussetzungen

- Node.js >= 23
- npm oder yarn

## Schnellstart (Entwicklung)

Installieren und starten:

```bash
npm install
npm run dev
```

Öffne anschließend `http://localhost:5173` im Browser (Vite-Standardport) oder folge der Konsole.

## Build für Produktion

```bash
npm run build
npm run preview
```
