# Feature-Glättung und Gesten-Disambiguierung

- Status: Angenommen
- Entscheider: [Manuel Stamm](https://github.com/Manusta01)
- Datum: 19.08.2026

## Kontext

Nach der Pose-Verlust-Grace (ADR 006) blieben zwei Schwachstellen:

1. **Y-Jitter** bei vertikalen Gesten (`NAECHSTER_EINTRAG`) — dokumentiert in `docs/gestures.md`.
2. **Überlappung Pause / Nächster Eintrag** — beide nutzen erhobenen rechten Arm; in Live-Bedingungen kann der linke Arm durch Jitter fälschlich als „oben" gelten.

Baseline S6 (Jitter) und S3 (Disambiguierung) sollten diese Bereiche abdecken.

## Entscheidung

### 1. EMA-Glättung (`smoothing.ts`)

Arm-`dx`/`dy` werden pro Frame mit Exponential Moving Average geglättet:

- Default `smoothingAlpha: 0.45` in `RecognizerConfig`
- `rightWristAboveShoulder` / `leftWristAboveShoulder` werden aus geglätteten `dy`-Werten abgeleitet
- Smoothing-State wird bei Grace-Timeout-Reset zurückgesetzt

### 2. Disambiguierung in Gesture-Plugins

**PAUSE_STOP:** Beide Arme müssen sichtbar und oberhalb der Schultern sein.

**NAECHSTER_EINTRAG:** Rechter Arm oben, linker Arm explizit **nicht** oben (`!leftWristAboveShoulder`).

Priorität (`PAUSE_STOP: 10`) bleibt als Fallback bei echtem Zwei-Arm-Raise.

## Begründung

- S6 Jitter-Test: 100 % Trigger-Rate (10/10) mit `noiseY = 0.008` (Zufallsanteil ±0.004 auf `y`).
- S3 Disambiguierung: 0 % Fehltrigger bei idealisierten Poses; linke Arm-Anforderung verhindert Pause-Fehler bei Einzelarm-Geste.
- Glättung ist interpretierbar und debugbar (geglättete Werte in Arm-Features sichtbar).

## Alternativen

### Median-Filter über N Frames

Robuster gegen Ausreißer, aber mehr State und Latenz. Verworfen zugunsten einfacher EMA.

### Nur Priority-Erhöhung ohne Plugin-Logik

Löst nicht den Fall „linker Arm jittert nach oben" bei Einzelarm-Pose. Verworfen.

### Hand-Tracking statt Pose-Landmarks

Größerer Architekturbruch (siehe ADR 005). Nicht in Timebox.

## Konsequenzen

- Neue interne Datei `src/gesture-library/smoothing.ts`.
- Geänderte Evaluate-Logik in `pause-stop.ts` und `naechster-eintrag.ts`.
- K3/K4 Latenz steigt leicht (480 ms statt 464 ms) durch Glättungs-Aufwärmen — innerhalb Ziel ≤ 700 ms.
- Keine Breaking Changes; optionale Config `smoothingAlpha`.

## Trade-offs

- EMA führt 1–2 Frames Verzögerung ein — akzeptabel gegenüber Jitter-Reduktion.
- `smoothingAlpha = 0` würde Glättung de facto deaktivieren (kein separater Schalter nötig).
