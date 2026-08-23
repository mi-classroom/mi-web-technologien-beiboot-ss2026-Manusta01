# Beiboot — Pose-Gesten im Browser

Studienprojekt (Master) zur browserbasierten Pose- und Gestenerkennung mit MediaPipe und einer eigenen Gesture Library.

## Live-Demo

**Gesten-Präsentation:** https://mi-classroom.github.io/mi-web-technologien-beiboot-ss2026-Manusta01/

Die Seite wird bei jedem Push auf `main` automatisch über GitHub Pages deployed (Workflow `Deploy Demo App to Pages`).

## Hochschulkontext

|                 |                                                     |
| --------------- | --------------------------------------------------- |
| **Hochschule**  | TH Köln, Campus Gummersbach                         |
| **Studiengang** | Digital Sciences (Master)                           |
| **Modul**       | Web-Technologien                                    |
| **Semester**    | Sommersemester 2026                                 |
| **Betreuung**   | Prof. Christian Noss                                |
| **Art**         | Studienleistung / Praxisprojekt (Issue-Serie #1–#5) |
| **Autor**       | [Manuel Stamm](https://github.com/Manusta01)        |

## Zielsetzung

**Forschungs- bzw. Entwicklungsfrage:** Wie lässt sich eine erweiterbare, testbare Gesture Library auf Pose-Landmarks so bauen, dass sie über eine klare öffentliche API nutzbar ist und wo stößt frame-basierte Heuristik an Grenzen der Robustheit?

Das Repository beantwortet das schrittweise:

1. Rohdaten sichtbar machen (Issue #1)
2. Gestenvokabular und Prototyp (Issue #2)
3. Library-Struktur und API (Issue #3)
4. Fremde Consumer-App nur über die öffentliche API (Issue #4)
5. Vertiefung Robustheit mit Vorher/Nachher-Messung (Issue #5, **Weg B**)

## Abbildung Repo ↔ Ausarbeitung / Issues

| Thema                  | Dokumentation                                                                                    | Code                             |
| ---------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------- |
| ML-Wahl, Datenqualität | [ADR 001](docs/adr/001-mediapipe-pose-landmarker.md), [data-quality.md](docs/data-quality.md)    | `src/pose-camera/`               |
| Gestenmapping          | [gestures.md](docs/gestures.md), [ADR 003](docs/adr/003-gesture-selection.md)                    | `src/gesture-library/gestures/`  |
| Library-Architektur    | [ADR 002](docs/adr/002-gesture-library-architecture.md), [architecture.md](docs/architecture.md) | `src/gesture-library/`           |
| API-Lücke Enumeration  | [ADR 004](docs/adr/004-gesture-enumeration-api.md)                                               | `getRegisteredGestures()`        |
| Consumer-Demo          | [presentation-demo README](apps/presentation-demo/README.md)                                     | `apps/presentation-demo/`        |
| Robustheit / Messung   | [ADR 005–007](docs/adr/), [baseline-measurement.md](docs/baseline-measurement.md)                | Stabilisierung, Smoothing, Tests |

## Anwendungen

| App                     | Befehl                     | Zweck                                                                           |
| ----------------------- | -------------------------- | ------------------------------------------------------------------------------- |
| **Pose-Demo** (Root)    | `npm run dev`              | Rohdaten, Landmarks, Debug-Metriken (Issue #1–#3)                               |
| **Gesten-Präsentation** | `npm run dev:presentation` | Folien per Geste — öffentliche API (Issue #4); **empfohlene Demo für Issue #5** |

## Architektur

Siehe [docs/architecture.md](docs/architecture.md).

- Root-npm-Paket heißt `pose-demo` (Vite-App); Workspace-Pakete nutzen den Scope `@beiboot/*`
- `@beiboot/gesture-library` — Gestenerkennung, öffentliche API
- `@beiboot/pose-camera` — Kamera, MediaPipe-Inferenz, Landmark-Rendering
- `apps/presentation-demo/` — eigenständige App über die öffentlichen Pakete

Pose-Demo-Port: Vite-Default **5173** (kein Root-`vite.config`). Präsentation: **5174**.

## Voraussetzungen

- Node.js >= 23 (`engines` in `package.json`)
- npm (Installationen über **`package-lock.json`** / `npm ci`)
- Webcam; Kamerazugriff nur unter HTTPS oder `localhost`
- **Keine Umgebungsvariablen** erforderlich

## Schnellstart

```bash
npm ci
npm run dev
```

Präsentation:

```bash
npm run dev:presentation
```

Tests, Lint, Builds:

```bash
npm test
npm run lint
npm run build
npm run build:presentation
```

Öffne `http://localhost:5173` (Pose-Demo) bzw. `http://localhost:5174` (Präsentation).

## Dokumentation

- [Architektur](docs/architecture.md)
- [Gestenvokabular](docs/gestures.md)
- [Datenqualität](docs/data-quality.md)
- [Gesture Library API](docs/gesture-library-api.md)
- [Baseline Vorher/Nachher](docs/baseline-measurement.md)
- [Datenschutz / Kamera](docs/privacy.md)
- [Qualität: a11y, Performance, Security](docs/quality-attributes.md)
- [KI-Einsatz](docs/ai-usage.md)
- [Drittanbieter-Lizenzen](THIRD_PARTY_LICENSES.md)
- ADRs: [001](docs/adr/001-mediapipe-pose-landmarker.md) … [007](docs/adr/007-smoothing-and-disambiguation.md)

## Lizenz

MIT — siehe [LICENSE](LICENSE). Drittkomponenten: [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).
