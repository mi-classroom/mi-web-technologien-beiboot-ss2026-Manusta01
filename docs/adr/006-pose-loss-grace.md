# Pose-Verlust-Grace in der Stabilisierung

- Status: Angenommen
- Entscheider: [Manuel Stamm](https://github.com/Manusta01)
- Datum: 19.08.2026

## Kontext

Issue #5 (Weg B) adressiert Robustheit der Gestenerkennung. Baseline-Tests (S4/K6) zeigten: Eine Tracking-Lücke von 150 ms zerstört Kandidat und Arming — `resetStabilizationOnLostPose()` setzte bei jedem Frame ohne Landmarks sofort alles zurück. In der Live-Demo bedeutet das: Kurzes Kamera-Rauschen oder Teilverdeckung bricht laufende Gesten ab.

## Entscheidung

`StabilizationState` erhält `poseLostAt`. Bei fehlenden Landmarks wird `stepStabilizationOnPoseLoss()` aufgerufen statt sofortigem Reset:

- Innerhalb **`poseLossGraceMs`** (Default: 200 ms): Kandidat, Arming und Hold-Timer laufen weiter; Trigger ist möglich.
- Danach: Vollständiger Reset wie bisher (`resetStabilizationOnLostPose()`).

Neue Config-Option: `poseLossGraceMs` in `RecognizerConfig`. Debug-Feld: `poseLostMs` in `GestureDebug`.

## Begründung

- **K6 Baseline:** Vorher 0 % Überleben, nachher 100 % bei 150 ms Lücke.
- Analog zu `candidateGraceMs` für kurze Erkennungs-Aussetzer — konsistentes Muster.
- Kein Breaking Change: Default-Verhalten ist toleranter, API bleibt gleich.

## Alternativen

### Sofortiger Reset (Status quo)

Einfach, aber frustrierend bei kurzen Tracking-Lücken. Verworfen.

### Unbegrenzte Hold-Fortsetzung ohne Timeout

Würde veraltete Kandidaten ewig halten. Verworfen.

### Grace nur für Kandidat, nicht für Arming

Unvollständig — nach Recovery müsste Nutzer erneut armen. Verworfen.

## Konsequenzen

- `engine.ts`: `handleMissingPose()` delegiert an Stabilization.
- Smoothing-State wird erst nach Grace-Timeout zurückgesetzt.
- Tests: `pose-loss.test.ts` (S4/S5) mit expliziten Grace-Erwartungen.

## Trade-offs

- Längere Grace erhöht Risiko veralteter Kandidaten bei längerer Abwesenheit — deshalb Default 200 ms, konfigurierbar.
- Keine Breaking Changes an öffentlicher API.
