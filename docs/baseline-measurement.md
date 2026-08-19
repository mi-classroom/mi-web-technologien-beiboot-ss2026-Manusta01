# Baseline-Messung — Vorher/Nachher für Issue #5

Dieses Dokument definiert die reproduzierbaren Kennzahlen für Weg B (Robustheit der Gestenerkennung). Alle Messungen laufen gegen `createDefaultGestureRecognizer()` mit den **Default-Config-Werten** aus `engine.ts`.

## Setup

### Test-Framework

```bash
npm install -D vitest
```

Neues Script in `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

Tests liegen unter `src/gesture-library/__tests__/`. Synthetische Poses kommen aus `test-helpers.ts`.

### Simulations-Hilfsfunktion

Jeder Test durchläuft Frames mit festem `timestamp`-Inkrement (16 ms ≈ 60 fps):

```typescript
function runSequence(
  recognizer: GestureRecognizer,
  frames: Array<{ landmarks: NormalizedLandmark[] | undefined; t: number }>
): GestureResult[] {
  return frames.map(({ landmarks, t }) => recognizer.process(landmarks, t))
}
```

Gesten gelten als **getriggert**, wenn `activeGesture !== 'NONE'` in einem Frame oder ein `gesture`-Event gefeuert wird.

### Arming-Vorlauf

Alle Gesten-Tests beginnen mit einer **Neutral-Sequenz** von 300 ms (19 Frames à 16 ms), damit `armed === true` ist, bevor die Test-Geste startet. Das entspricht dem realen Nutzerfluss („kurz neutral halten").

---

## Kennzahlen

| ID  | Kennzahl                                   | Einheit             | Ziel (Nachher) |
| --- | ------------------------------------------ | ------------------- | -------------- |
| K1  | False-Positive-Rate im Idle                | Trigger / 30 s      | ≤ 1            |
| K2  | Time-to-trigger (GEHE_VOR)                 | ms                  | ≤ 700          |
| K3  | Time-to-trigger (PAUSE_STOP)               | ms                  | ≤ 700          |
| K4  | Time-to-trigger (NAECHSTER_EINTRAG)        | ms                  | ≤ 700          |
| K5  | Verwechslungsrate Pause ↔ Nächster Eintrag | %                   | 0 %            |
| K6  | Überlebensrate bei Pose-Verlust            | % Kandidat erhalten | ≥ 80 %         |
| K7  | Re-Arming nach Pose-Verlust                | ms                  | ≤ 500          |

---

## Testsequenzen

### S1 — Idle (False Positives, K1)

**Zweck:** Misst Fehltrigger bei stabiler Neutralpose.

| Phase   | Dauer              | Pose            |
| ------- | ------------------ | --------------- |
| Neutral | 30 s (1875 Frames) | `neutralPose()` |

**Messung:** Anzahl `gesture`-Events oder Frames mit `activeGesture !== 'NONE'`.

**Erwartung Vorher:** 0–2 (Arming-Artefakte möglich).

**Datei:** `__tests__/idle.test.ts`

---

### S2 — Time-to-trigger je Geste (K2–K4)

**Zweck:** Misst Latenz von Geste-start bis erstem Trigger.

| Phase        | Dauer   | Pose            |
| ------------ | ------- | --------------- |
| Neutral      | 300 ms  | `neutralPose()` |
| Geste halten | 2000 ms | jeweilige Pose  |

**Poses:**

- GEHE_VOR → `geheVorPose()`
- PAUSE_STOP → `pauseStopPose()`
- NAECHSTER_EINTRAG → `naechsterEintragPose()`

**Messung:** `triggerAt - gestureStartAt` (ms). Enthält Arming (220 ms) + Hold (450 ms) = theoretisches Minimum ~670 ms.

**Datei:** `__tests__/trigger-latency.test.ts`

---

### S3 — Verwechslungsmatrix (K5)

**Zweck:** Prüft, ob eine Geste fälschlich eine andere auslöst.

| Testfall | Pose                     | Erwarteter Trigger | Unerwünschter Trigger         |
| -------- | ------------------------ | ------------------ | ----------------------------- |
| S3a      | `pauseStopPose()`        | PAUSE_STOP         | NAECHSTER_EINTRAG             |
| S3b      | `naechsterEintragPose()` | NAECHSTER_EINTRAG  | PAUSE_STOP                    |
| S3c      | `geheVorPose()`          | GEHE_VOR           | PAUSE_STOP, NAECHSTER_EINTRAG |

**Messung:** Boolean — wurde ein unerwünschter Trigger ausgelöst?

**Bekanntes Vorher-Problem:** S3a und S3b teilen sich fast dieselbe Pose (rechter Arm oben). `pauseStopPose()` und `naechsterEintragPose()` unterscheiden sich nur am linken Arm. Ohne Disambiguierung kann S3b fälschlich PAUSE_STOP feuern, wenn der linke Arm kurz sichtbar wird.

**Datei:** `__tests__/disambiguation.test.ts`

---

### S4 — Pose-Verlust mitten in Kandidat (K6)

**Zweck:** Misst, ob ein kurzes Tracking-Loch den Kandidaten zerstört.

| Phase            | Dauer      | Landmarks       |
| ---------------- | ---------- | --------------- |
| Neutral          | 300 ms     | `neutralPose()` |
| Geste            | 200 ms     | `geheVorPose()` |
| **Verlust**      | **150 ms** | `undefined`     |
| Geste fortsetzen | 800 ms     | `geheVorPose()` |

**Messung:** Wird GEHE_VOR innerhalb der Gesamtsequenz getriggert? Wie viele ms Kandidat-Haltung (`candidateHoldMs`) gehen verloren?

**Erwartung Vorher:** Trigger scheitert oft — `resetStabilizationOnLostPose()` setzt `armed` und Kandidat zurück.

**Datei:** `__tests__/pose-loss.test.ts`

---

### S5 — Re-Arming nach längerem Pose-Verlust (K7)

**Zweck:** Misst, wie schnell der Recognizer nach totalem Tracking-Verlust wieder einsatzbereit ist.

| Phase           | Dauer   | Landmarks       |
| --------------- | ------- | --------------- |
| Neutral + armed | 300 ms  | `neutralPose()` |
| Verlust         | 500 ms  | `undefined`     |
| Neutral         | 300 ms  | `neutralPose()` |
| Geste           | 2000 ms | `geheVorPose()` |

**Messung:** Time-to-trigger ab Geste-start nach Recovery.

**Datei:** `__tests__/pose-loss.test.ts` (zusammen mit S4)

---

### S6 — Jitter-Robustheit (qualitativ, optional)

**Zweck:** Simuliert MediaPipe-Rauschen auf der Y-Achse.

```typescript
function jitteredPose(base: NormalizedLandmark[], noiseY = 0.008): NormalizedLandmark[] {
  return base.map((lm) => ({
    ...lm,
    y: lm.y + (Math.random() - 0.5) * noiseY,
  }))
}
```

10 Durchläufe à 60 Frames `naechsterEintragPose()` mit Jitter. Messung: Trigger-Rate (Ziel ≥ 90 %).

**Datei:** `__tests__/jitter.test.ts`

---

## Ergebnis-Tabelle (ausfüllen)

| Kennzahl                              | Vorher     | Nachher | Δ   |
| ------------------------------------- | ---------- | ------- | --- |
| K1 — False Positives / 30 s           | 0          |         |     |
| K2 — TTG GEHE_VOR (ms)                | 464        |         |     |
| K3 — TTG PAUSE_STOP (ms)              | 464        |         |     |
| K4 — TTG NAECHSTER_EINTRAG (ms)       | 464        |         |     |
| K5 — Verwechslungsrate                | 0 % (0/3)  |         |     |
| K6 — Trigger nach 150 ms Pose-Verlust | nein (0 %) |         |     |
| K7 — Re-Arming nach Verlust (ms)      | 464        |         |     |

Gemessen am 19.08.2026 mit `npm test` (Vitest, synthetische Poses). Ausführung: `npm test -- --reporter=verbose` zeigt die Kennzahlen in stdout.

**Interpretation Vorher:**

- K1–K5 sind mit idealisierten Poses stabil — das bestätigt die Heuristik unter Laborbedingungen.
- **K6 ist die Haupthschwäche:** 150 ms Tracking-Lücke zerstört Kandidat und Arming; die Geste triggert danach nicht mehr.
- K7 zeigt, dass Re-Arming nach längerem Verlust grundsätzlich funktioniert (464 ms ≈ Hold 450 ms + 1 Frame).
- K5 kann in der Live-Demo trotzdem scheitern (Jitter, Teilverdeckung) — dafür ist S6 (Jitter) vorgesehen.

---

## Manuelle Webcam-Baseline (optional, 30 min)

Für qualitative Beobachtungen, die synthetische Tests nicht abdecken:

1. **Gute Bedingungen** — frontal, gleichmäßiges Licht, 1 m Abstand.
2. **Schräger Blick** — 30° seitlich gedreht.
3. **Schlechtes Licht** — Fenster schließen, nur Bildschirmlicht.

Pro Bedingung je Geste 5 Versuche. Notieren:

- Erkannt ja/nein
- Falsche Geste ja/nein
- Wartezeit subjektiv (schnell / ok / träge)

Das ist **kein Ersatz** für K1–K7, aber gutes Material fürs Video.

---

## Implementierungs-Reihenfolge

1. Vitest + `runSequence`-Helper anlegen
2. S1 (Idle) und S2 (Latency) laufen lassen → Baseline-Tabelle Spalte „Vorher"
3. Library-Änderungen (ADR 006/007)
4. Alle Tests erneut → Spalte „Nachher"
5. Tabelle in README oder Issue-Kommentar veröffentlichen
