# Issue #5: Weg B — Robustheit der Gestenerkennung

- Status: Angenommen
- Entscheider: [Manuel Stamm](https://github.com/Manusta01)
- Datum: 19.08.2026

## Kontext

Issue #4 lieferte eine eigenständige Präsentations-Demo (`apps/presentation-demo/`), die die Gesture Library ausschließlich über die öffentliche API nutzt. Dabei zeigte sich, dass die Library grundsätzlich konsumierbar ist, aber die Erkennungsqualität unter realen Bedingungen die größte Schwachstelle bleibt.

In `docs/gestures.md` sind die Grenzen bereits benannt: Y-Jitter bei vertikalen Gesten, Verwechslungsrisiko bei erhobenen Armen, harte Resets bei kurzzeitig verlorener Pose, träge Hold-/Cooldown-Zeiten. Beim Bauen der Präsentation fiel zusätzlich auf:

- **PAUSE_STOP** und **NAECHSTER_EINTRAG** überlappen semantisch (rechter Arm nach oben).
- Nach kurzem Landmark-Aussetzer muss der Nutzer den Arming-Zyklus („neutral halten") erneut durchlaufen.
- Schwellenwerte sind statisch und kennen keine nutzerspezifische Neutralpose.

Issue #5 bietet zwei gleichwertige Wege: eine Vision-Anwendung (Weg A) oder Vertiefung an einer Schwachstelle (Weg B).

## Entscheidung

**Weg B — Vertiefung:** Robustheit und Fehlertoleranz der Gestenerkennung in der bestehenden Gesture Library.

Konkret werden in der Timebox (20–24 h) folgende Bereiche adressiert:

1. **Feature-Glättung** — zeitliche Filterung von `dx`/`dy` und Sichtbarkeitswerten vor der Gestenbewertung.
2. **Gesten-Disambiguierung** — klare Trennung zwischen Pause (beide Arme) und Nächster Eintrag (nur rechter Arm, vertikal).
3. **Weicherer Umgang mit Pose-Verlust** — kurze Tracking-Lücken unterbrechen Kandidat/Arming nicht sofort.
4. **Baseline-Messung mit Tests** — Vitest-Suite mit synthetischen Poses und reproduzierbaren Kennzahlen (Vorher/Nachher).

Die bestehenden Consumer (`src/main.ts`, `apps/presentation-demo/`) bleiben unverändert kompatibel zur öffentlichen API. Erweiterungen erfolgen über optionale Config-Felder und erweiterte Debug-Ausgaben.

## Begründung

### Warum Weg B statt Weg A

| Kriterium                          | Weg A (Vision-App)                               | Weg B (Vertiefung)                                     |
| ---------------------------------- | ------------------------------------------------ | ------------------------------------------------------ |
| Issue #4 als Vorarbeit             | Präsentation ist bereits ein Consumer-Nachweis   | Vertiefung baut direkt auf den API-Erkenntnissen auf   |
| Risiko in Live-Demo                | Teilweise unzuverlässige Gesten                  | Verbesserung wirkt in **beiden** bestehenden Demos     |
| Timebox 20–24 h                    | Neue App + UX + Deploy + Video = Scope-Explosion | Fokussierte Library-Arbeit + Doku passt in die Timebox |
| Issue-Anforderung „Vorher/Nachher" | Schwer messbar bei rein gestalterischen Apps     | Natürlich durch Test-Kennzahlen belegbar               |
| Persönliches Interesse             | Interaktionsdesign                               | Technische Tiefe, Debugbarkeit, messbare Qualität      |

Eine zweite Anwendung würde das gleiche Erkennungsproblem mit mehr CSS verdecken. Die Präsentation aus Issue #4 ist bereits ein tragfähiger Consumer, sie braucht zuverlässigere Gesten, nicht einen Ersatz.

### Warum diese vier Schwerpunkte

- **Glättung** adressiert das dokumentierte Y-Jitter-Problem ohne API-Bruch.
- **Disambiguierung** löst den konkretesten Fehler aus der Präsentation (Pause vs. Nächster Eintrag).
- **Weicher Pose-Verlust** reduziert Frust bei kurzen Kamera-/Tracking-Aussetzern.
- **Tests + Baseline** erfüllen das Akzeptanzkriterium „Vorher/Nachher belegt" und schließen die Lücke aus ADR 002 (Vitest versprochen, noch nicht implementiert).

## Alternativen

### Weg A: Gestengesteuertes Exponat oder Musik-Instrument

Attraktiv für Portfolio und UX, aber abhängig von derselben Erkennungsqualität. Verworfen, weil eine Live-Demo auf aktuellen Heuristiken unzuverlässig wirken würde und der Aufwand für App + Library-Qualität die Timebox sprengt.

### Nur Schwellenwerte hart nachziehen

Schnell, aber nicht robust gegen Nutzergröße, Kamerawinkel und Jitter. Kein messbarer Fortschritt über Einzelfälle hinaus. Verworfen.

### Wechsel auf Hand-Tracking (MediaPipe Hands)

Potenziell präziser für Einzelarm-Gesten, aber größerer Architekturbruch, neues Modell, neue Feature-Pipeline. Außerhalb der Timebox. Als langfristige Alternative dokumentiert.

### ML-Klassifikator auf Landmark-Vektoren

Trainierbar und skalierbar, aber Overkill für vier Gesten in 20–24 h. Verworfen zugunsten interpretierbarer Heuristiken mit besserer Stabilisierung.

## Konsequenzen

### Positiv

- Beide Demos profitieren ohne Code-Änderung an der Consumer-Seite.
- Vitest-Suite macht Regressionen sichtbar.
- Vorher/Nachher-Kennzahlen sind für Issue #5 und das Video verwertbar.
- ADR-Kette (001–004) wird um technische Vertiefung ergänzt.

### Trade-offs

- Hold-/Cooldown-Defaults können sich ändern → Latenz vs. Fehltrigger (bewusst dokumentiert).
- Optional neue Config-Felder (`smoothingAlpha`, `poseLossGraceMs`, …) — kein Breaking Change, aber mehr API-Oberfläche.
- **Nutzer-Kalibrierung der Neutralpose wurde nicht umgesetzt** (bewusst deferred, Scope); Arming bleibt über feste Neutral-Schwellen.

### Breaking Changes

Keine geplant. `process()`, `on('gesture')` und bestehende Gesture-Plugins bleiben kompatibel. Geändert werden interne Feature-Extraktion, Stabilisierung und die Evaluate-Logik von `PAUSE_STOP` / `NAECHSTER_EINTRAG`.

## Umsetzungsplan (Timebox)

| Phase               | Stunden | Inhalt                                                                                                              |
| ------------------- | ------- | ------------------------------------------------------------------------------------------------------------------- |
| 1 — Baseline        | 3–4     | Vitest einrichten, synthetische Sequenzen, Kennzahlen messen (siehe [Baseline-Messung](../baseline-measurement.md)) |
| 2 — Library         | 10–12   | Glättung, Disambiguierung, Pose-Verlust-Grace                                                                       |
| 3 — Nachher-Messung | 2       | Tests erneut laufen lassen, Kennzahlen vergleichen                                                                  |
| 4 — Doku & Deploy   | 4       | README, Deploy (GitHub Pages), ADRs 006/007                                                                         |
| 5 — Video           | 3       | Problem → Vorher → Nachher → Live-Demo                                                                              |

## Verwandte Dokumente

- [Baseline-Messung (Vorher/Nachher)](../baseline-measurement.md)
- [Gestenvokabular und Grenzen](../gestures.md)
- [Gesture Library API](../gesture-library-api.md)
- [ADR 002: Gesture Library Architektur](002-gesture-library-architecture.md)
- [API zum Auflisten registrierter Gesten](004-gesture-enumeration-api.md)
