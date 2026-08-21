# Gesture Library API

Die Gesture Library kapselt Pose-basierte Gestenerkennung unabhängig von der Demo-Anwendung. Sie nimmt MediaPipe-Pose-Landmarks entgegen und liefert stabilisierte Gestenergebnisse zurück.

## Installation und Import

Workspace-Paket `@beiboot/gesture-library` (Quellcode unter `src/gesture-library/`):

```typescript
import {
  GestureRecognizer,
  createDefaultGestureRecognizer,
  GEHE_VOR,
  PAUSE_STOP,
  NONE_GESTURE,
} from '@beiboot/gesture-library'
```

In der Root-Pose-Demo ist auch ein relativer Import möglich (`./gesture-library`). Consumer-Apps sollen das Paket nutzen.

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

| Name | Label | Default-`priority` |
| --- | --- | --- |
| `GEHE_VOR` | Gehe vor | 0 |
| `GEHE_ZURUECK` | Gehe zurück | 0 |
| `PAUSE_STOP` | Pause / Stop | 10 |
| `NAECHSTER_EINTRAG` | Nächster Eintrag | 5 |

Bei Konflikten gewinnt die höhere Priorität.

## GestureRecognizer instanziieren

```typescript
const recognizer = new GestureRecognizer({
  holdTimeMs: 450,
  cooldownMs: 900,
  horizontalDxMin: 0.03,
  shoulderSpanFactor: 0.2,
  neutralHoldMs: 220,
  neutralDxFactor: 0.55,
  poseLossGraceMs: 200,
  smoothingAlpha: 0.45,
})
```

Alle Optionen sind optional. Defaults aus `engine.ts` (exportiert als `DEFAULT_HOLD_TIME_MS`, `DEFAULT_COOLDOWN_MS`, `DEFAULT_POSE_LOSS_GRACE_MS`, `DEFAULT_SMOOTHING_ALPHA`).

| Option | Default | Bedeutung |
| --- | --- | --- |
| `holdTimeMs` | 450 | Kandidat muss so lange stabil sein |
| `cooldownMs` | 900 | Sperrzeit nach Trigger |
| `candidateGraceMs` | 180 | Toleranz bei kurzzeitigem Gesten-Aussetzer |
| `poseLossGraceMs` | 200 | Tracking-Lücke, in der Kandidat/Arming erhalten bleiben |
| `smoothingAlpha` | 0.45 | EMA-Glättung für Arm-`dx`/`dy` (`0` ≈ aus) |
| `neutralHoldMs` | 220 | Neutrale Pose vor Arming |
| `neutralDxFactor` | 0.55 | Faktor für Neutral-Schwelle relativ zu `dynamicDxThreshold` |
| `horizontalDxMin` / `shoulderSpanFactor` | 0.03 / 0.2 | Dynamische X-Schwelle |
| `visibilityMin` / `elbowVisibilityMin` | 0.45 | Sichtbarkeitsgrenzen |

## Gesten registrieren

```typescript
import { GestureDefinition } from '@beiboot/gesture-library'

const meineGeste: GestureDefinition = {
  name: 'MEINE_GESTE',
  label: 'Meine Geste',
  priority: 5,
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

| Feld | Bedeutung |
| --- | --- |
| `armed` | Nutzer hat neutral gehalten, Trigger ist erlaubt |
| `canDetect` | Cooldown ist abgelaufen |
| `features` | Extrahierte Pose-Merkmale (Arme, Schwellen, Richtungen) |
| `timestamp` | Aktueller Zeitstempel in ms |

Rückgabe `null` = kein Treffer. `GestureMatch` = Treffer.

## Erkannte Gesten abfragen

```typescript
const { activeGesture, candidateGesture, debug } = recognizer.process(landmarks, timestamp)

recognizer.labelFor(activeGesture)
recognizer.getHoldTimeMs()
recognizer.getRegisteredGestures()
```

### GestureDebug

| Feld | Bedeutung |
| --- | --- |
| `activeGesture` / `candidateGesture` | Bestätigte bzw. laufende Geste |
| `candidateHoldMs` | Haltedauer des Kandidaten |
| `cooldownMs` | Verbleibende Sperrzeit |
| `armed` / `inNeutral` | Arming-Zustand |
| `poseLostMs` | Dauer der aktuellen Tracking-Lücke (`0`, wenn Pose da ist) |
| `maxAbsDx` / `shoulderSpan` / `dynamicDxThreshold` | Feature-Metriken |
| `rightArm` / `leftArm` | Arm-Features (ggf. geglättet) |

### Events

```typescript
const unsubscribe = recognizer.on('gesture', (event) => {
  console.log(event.name, event.label, event.timestamp)
})
```

### Registrierte Gesten auflisten

```typescript
for (const gesture of recognizer.getRegisteredGestures()) {
  console.log(gesture.name, gesture.label)
}
```

## Öffentliche vs. interne API

**Öffentlich** (`src/gesture-library/index.ts`):

- `GestureRecognizer`, `createDefaultGestureRecognizer`
- `GEHE_VOR`, `GEHE_ZURUECK`, `PAUSE_STOP`, `NAECHSTER_EINTRAG`
- `NONE_GESTURE`
- `DEFAULT_HOLD_TIME_MS`, `DEFAULT_COOLDOWN_MS`, `DEFAULT_POSE_LOSS_GRACE_MS`, `DEFAULT_SMOOTHING_ALPHA`
- Typen: `GestureDefinition`, `GestureResult`, `GestureDebug`, `RecognizerConfig`, …

**Intern** (nicht exportiert):

- `features/pose.ts`, `smoothing.ts`, `stabilization.ts`, `test-helpers.ts`

Kamera/Pose-Inferenz: `@beiboot/pose-camera`. How-to und Spiegelung: [gestures.md](gestures.md).

## Tests

```bash
npm test
npm run test:watch
```

Baseline: [baseline-measurement.md](baseline-measurement.md).
