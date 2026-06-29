# Gesture Library mit Plugin-Architektur

- Status: Angenommen
- Entscheider: [Manuel Stamm](https://github.com/Manusta01)
- Datum: 29.06.2026

## Kontext

In Issue #2 wurden zwei Gesten prototypisch in `src/gestures/gestures.ts` implementiert. Die Logik war mit DOM-Zugriff, globalem Zustand und Rendering vermischt. Für Issue 3 soll daraus eine erweiterbare, testbare und dokumentierte Gesture Library entstehen.

## Entscheidung

Die Gestenerkennung wird als **eigenständiges Modul** unter `src/gesture-library/` aufgebaut:

1. **`GestureRecognizer`** — zentrale Engine, registriert Gesten und verarbeitet Frames
2. **`GestureDefinition`** — Plugin-Schnittstelle pro Geste (`name`, `label`, `evaluate`)
3. **`features/`** — interne Feature-Extraktion aus Pose-Landmarks
4. **`stabilization.ts`** — interne Zustandsmaschine (Arming, Hold, Grace, Cooldown)
5. **Demo** — konsumiert die Library, enthält UI-Code (`src/demo/gestureUi.ts`)

Neue Gesten werden per `recognizer.register()` hinzugefügt, ohne Engine oder bestehende Gesten zu ändern (Open/Closed-Prinzip).

## Begründung

Das Muster orientiert sich an etablierten Gesture Libraries:

- **Hammer.js**: zentrale Engine + registrierbare Recognizer
- **ZingTouch**: konfigurierbare Gesten-Definitionen
- **Fingerpose**: Trennung von Pose-Beschreibung und Erkennungs-Pipeline

Die Stabilisierung (Hold-Zeit, Cooldown, Arming) ist **querschnittlich** und gehört nicht in einzelne Gesten. So bleiben Gesten-Plugins klein und fokussiert auf ihre Erkennungsregel.

Konflikte zwischen gleichzeitig passenden Gesten werden über ein optionales `priority`-Feld aufgelöst (z. B. `PAUSE_STOP` mit beiden Armen höher als horizontale Navigation).

## Alternativen

### Monolithische `switch`-Logik in einer Datei

Weniger Dateien, aber jede neue Geste erfordert Änderungen an zentraler Logik und globalen Typen. Widerspricht dem Erweiterbarkeits-Ziel.

### Gesten als Konfigurations-JSON ohne Code

Deklarativ, aber die vorhandenen Heuristiken (Ellbogen-Sichtbarkeit, dynamische Schwellen) sind zu kontextabhängig für ein reines JSON-Schema im Zeitrahmen.

### Separates npm-Paket

Saubere Grenze, aber für das Demoprojekt unverhältnismäßiger Aufwand (Build, Versionierung). Die Ordnerstruktur mit klarem `index.ts`-Export reicht als Library-Grenze.

## Konsequenzen

- Die Demo importiert nur die öffentliche API.
- Unit-Tests laufen ohne DOM (Vitest, synthetische Landmarks).
- API-Dokumentation in `docs/gesture-library-api.md`.
- Landmark-Indizes und Schwellenwert-Logik bleiben intern und können sich ändern, solange die öffentliche API stabil bleibt.
