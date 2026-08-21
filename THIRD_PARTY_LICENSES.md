# Drittanbieter-Lizenzen

Dieses Projekt nutzt folgende **wesentliche** Drittkomponenten (Auswahl). Weitere Dev-Dependencies (z. B. husky, lint-staged) stehen in `package-lock.json`.

| Paket | Verwendung | Lizenz (laut Upstream) | Quelle |
| --- | --- | --- | --- |
| `@mediapipe/tasks-vision` | Pose-Landmarker (Inferenz im Browser) | Apache-2.0 | [MediaPipe](https://developers.google.com/mediapipe) / npm |
| MediaPipe Pose Landmarker Lite (Modell) | Modellgewichte via Google Storage CDN | Apache-2.0 (MediaPipe Models) | [Model Card / MediaPipe](https://developers.google.com/mediapipe/solutions/vision/pose_landmarker) |
| `vite` | Dev-Server und Production-Build | MIT | npm |
| `typescript` | Typsystem | Apache-2.0 | npm |
| `vitest` | Unit-Tests der Gesture Library | MIT | npm |
| `eslint` / `typescript-eslint` / `prettier` | Lint und Formatierung | MIT / MIT / MIT | npm |

Die Wahl von MediaPipe ist in [ADR 001](docs/adr/001-mediapipe-pose-landmarker.md) begründet.

**Hinweis:** Systemschriften in der UI (`Inter`, `Segoe UI`, `Arial`) sind Fallbacks der jeweiligen Plattform — es werden keine eigenen Fontdateien ausgeliefert.
