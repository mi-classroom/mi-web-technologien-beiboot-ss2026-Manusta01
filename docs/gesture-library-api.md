# Gesture Library API

Die Gesture Library kapselt Pose-basierte Gestenerkennung unabhängig von der Demo-Anwendung. Sie nimmt MediaPipe-Pose-Landmarks entgegen und liefert stabilisierte Gestenergebnisse zurück.

## Installation und Import

Die Library liegt im Projekt unter `src/gesture-library/` und wird direkt importiert:

```typescript
import { GestureRecognizer, createDefaultGestureRecognizer, GEHE_VOR, PAUSE_STOP } from './gesture-library'
```

## Schnellstart

```typescript
const recognizer = createDefaultGestureRecognizer()

// Pro Frame nach der Pose-Inferenz:
const result = recognizer.process(landmarks, performance.now())

console.log(result.activeGesture) // z. B. 'GEHE_VOR' oder 'NONE'
console.log(result.candidateGesture) // aktueller Kandidat
console.log(result.debug) // Debug-Metriken für UI/Logging
```

`createDefaultGestureRecognizer()` registriert alle vier Standard-Gesten:

- `GEHE_VOR` — Gehe vor
- `GEHE_ZURUECK` — Gehe zurück
- `PAUSE_STOP` — Pause / Stop
- `NAECHSTER_EINTRAG` — Nächster Eintrag

## GestureRecognizer instanziieren

```typescript
const recognizer = new GestureRecognizer({
  holdTimeMs: 450, // Kandidat muss so lange stabil sein
  cooldownMs: 900, // Sperrzeit nach erkanntem Trigger
  horizontalDxMin: 0.03,
  shoulderSpanFactor: 0.2,
  neutralHoldMs: 220, // Dauer in neutraler Pose vor Arming
})
```

Alle Optionen sind optional. Fehlende Werte nutzen die Defaults aus `engine.ts`.

## Gesten registrieren

Neue Gesten werden als Plugins registriert, ohne bestehenden Code zu ändern:

```typescript
import { GestureDefinition } from './gesture-library'

const meineGeste: GestureDefinition = {
  name: 'MEINE_GESTE',
  label: 'Meine Geste',
  priority: 5, // optional, höhere Priorität gewinnt bei Konflikten
  evaluate(ctx) {
    if (!ctx.canDetect || !ctx.armed) return null

    const { rightArm, dynamicDxThreshold } = ctx.features
    if (rightArm?.visible && rightArm.dx > dynamicDxThreshold) {
      return { confidence: 1 }
    }
    return null
  },
}

recognizer.register(meineGeste)
```

### GestureContext

Jede `evaluate()`-Funktion erhält einen Kontext:

| Feld        | Bedeutung                                               |
| ----------- | ------------------------------------------------------- |
| `armed`     | Nutzer hat neutral gehalten, Trigger ist erlaubt        |
| `canDetect` | Cooldown ist abgelaufen                                 |
| `features`  | Extrahierte Pose-Merkmale (Arme, Schwellen, Richtungen) |
| `timestamp` | Aktueller Zeitstempel in ms                             |

Rückgabe `null` bedeutet: Geste trifft in diesem Frame nicht zu. Ein `GestureMatch`-Objekt markiert einen Treffer.

## Erkannte Gesten abfragen

```typescript
const { activeGesture, candidateGesture, debug } = recognizer.process(landmarks, timestamp)

// Labels für die UI
recognizer.labelFor(activeGesture) // z. B. 'Gehe vor'
recognizer.getHoldTimeMs() // konfigurierte Haltezeit
recognizer.getRegisteredGestures() // [{ name: 'GEHE_VOR', label: 'Gehe vor' }, …]
```

### Events

```typescript
const unsubscribe = recognizer.on('gesture', (event) => {
  console.log(event.name, event.label, event.timestamp)
})

// später: unsubscribe()
```

Events feuern, wenn eine Geste nach Hold-Zeit bestätigt wurde.

### Registrierte Gesten auflisten

```typescript
for (const gesture of recognizer.getRegisteredGestures()) {
  console.log(gesture.name, gesture.label)
}
```

Nützlich für Hilfe-UI, Einstellungen oder Logging — ohne einzelne Gesture-Plugins importieren zu müssen.

## Öffentliche vs. interne API

**Öffentlich** (über `src/gesture-library/index.ts`):

- `GestureRecognizer`
- `createDefaultGestureRecognizer`
- Vordefinierte Gesten-Plugins
- Typen: `GestureDefinition`, `GestureResult`, `GestureDebug`, …

**Intern** (nicht exportiert):

- `features/pose.ts` — Landmark-Indizes, Feature-Extraktion
- `stabilization.ts` — Hold, Grace, Cooldown, Arming
- `test-helpers.ts` — Synthetische Poses für Tests

Die Demo (`src/main.ts`, `src/demo/gestureUi.ts`) ist ein separater Consumer der Library.

## Tests

```bash
npm test
npm run test:watch
```

Tests verwenden synthetische Landmark-Daten und prüfen Erkennung sowie Stabilisierung ohne Browser-DOM. Baseline-Kennzahlen: [baseline-measurement.md](../baseline-measurement.md).
