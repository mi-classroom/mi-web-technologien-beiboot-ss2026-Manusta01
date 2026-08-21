# Gestenvokabular für die Demo

Diese Tabelle ist als Arbeitsgrundlage für die Pose-Demo gedacht. Sie bewertet typische Interaktionen danach, wie gut sie sich mit den verfügbaren Pose-Landmarks im Browser robust erkennen lassen.

| Interaktion | Mögliche Geste für den Nahbereich | Verfügbare Daten & Reliabilität | Mögliche Geste für den Fernbereich | Verfügbare Daten & Reliabilität |
| --- | --- | --- | --- | --- |
| Gehe vor | Arm seitlich ausstrecken (Bild: Handgelenk rechts der Schulter) | Schulter/Ellbogen/Handgelenk; hohe Reliabilität bei sichtbarem Ellbogen | Arm zeigt seitlich | Schulter-/Arm-Koordinaten; gut frontal |
| Gehe zurück | Arm seitlich zur anderen Seite | wie oben | Arm zeigt zur anderen Seite | wie oben |
| Pause / Stop | Beide Handgelenke oberhalb der Schultern halten | Wrist vs. Shoulder Y; mittlere Reliabilität | Beide Arme über Kopf | mittlere bis gute Reliabilität |
| Bestätigen | Rechte Hand vor dem Oberkörper | geringe bis mittlere Reliabilität | Hand zentral vor Torso | mittlere Reliabilität |
| Abbrechen | Arm kreuzt vor dem Körper | mittlere Reliabilität | Arm kreuzt | mittlere Reliabilität |
| Menü öffnen | Beide Arme seitlich öffnen | Handgelenkabstand + Schulterbreite | Arme weit abgespreizt | gute Reliabilität |
| Nächster Eintrag | Rechten Arm oben halten (links unten) | Y-Relativ + Jitter | Arm diagonal oben | mittlere Reliabilität |
| Vorheriger Eintrag | Linken Arm oben halten | wie oben | wie oben | mittlere Reliabilität |
| Zoom rein | Hände voneinander weg | zeitlicher Abstand | Arme nach außen | mittlere Reliabilität |
| Zoom raus | Hände zueinander | zeitlicher Abstand | Arme nach innen | mittlere Reliabilität |

## Auswahl für den Prototyp (Issue #2, historisch)

Für die erste prototypische Implementierung wurden **nur** gewählt:

- Gehe vor
- Gehe zurück

Begründung damals: Navigation, Symmetrie, einfache X-Heuristik. Später (Issue #3) kamen Pause / Stop und Nächster Eintrag hinzu — siehe Abschnitt „Implementierte Gesten“.

## Implementierte Gesten (Gesture Library)

Die Erkennung liegt in `src/gesture-library/`. Öffentliche API: [gesture-library-api.md](gesture-library-api.md).

| Geste | Plugin | Erkennungsprinzip (Code) |
| --- | --- | --- |
| Gehe vor | `gestures/gehe-vor.ts` | `dominantDx > threshold` (stärkerer sichtbarer Arm, Bild-X) |
| Gehe zurück | `gestures/gehe-zurueck.ts` | `dominantDx < -threshold` |
| Pause / Stop | `gestures/pause-stop.ts` | Beide Arme sichtbar, beide Handgelenke oberhalb der Schultern; `priority: 10` |
| Nächster Eintrag | `gestures/naechster-eintrag.ts` | Rechter Arm oben halten (`dy`), linker Arm **nicht** oben; `priority: 5` |

### Ausführung (How-to)

Koordinaten kommen aus dem **ungespiegelten** Kamerabild. Die Vorschau (`drawPoseFrame`) ist standardmäßig **gespiegelt** (Spiegelbild). Deshalb:

1. Kurz **neutral** stehen (Arme unten), bis der Status „Bereit“ / Armed zeigt (~220 ms Neutral).
2. Pose **halten** (~450 ms Hold), nicht nur kurz tippen.
3. Nach Trigger ~900 ms Cooldown.

| Geste | Praktisch |
| --- | --- |
| Gehe vor / zurück | Einen Arm klar seitlich ausstrecken und halten. Richtung = Bild-X (`dominantDx`); bei falscher Richtung die andere Seite versuchen. |
| Pause / Stop | **Beide** Arme nach oben (Handgelenke über Schultern), halten. |
| Nächster Eintrag | **Nur rechten** Arm nach oben halten, linker Arm unten. |

Details zu Spiegelung: [data-quality.md](data-quality.md).

Die Pose-Demo (`src/main.ts`) und die Präsentation nutzen `createDefaultGestureRecognizer()`.

## Implementierte Detektionslogik (Stabilisierung)

Stabilisierung: `stabilization.ts`. Glättung: `smoothing.ts`. Gestenregeln: `gestures/`.

- Sichtbarkeit: Schulter/Handgelenk `> 0.45`, Ellbogen `>= 0.45`
- Navigation: `dx = wrist.x - shoulder.x`; dominantes `dx`; Schwelle `max(0.03, shoulderSpan * 0.2)`
- Pause / Nächster Eintrag: wie in der Tabelle oben (Disambiguierung ADR 007)
- EMA `smoothingAlpha = 0.45`
- Hold 450 ms, Candidate-Grace 180 ms, Pose-Loss-Grace 200 ms
- Arming: Neutral 220 ms; Cooldown 900 ms

Vorher/Nachher: [baseline-measurement.md](baseline-measurement.md).

## Demo-Ausgabe

- Status, HUD, Metriken inkl. `poseLostMs`, Rohdaten `#raw`

## Ehrliche Grenzen

- Teilverdeckung / schräger Blick senken die Zuverlässigkeit.
- Seitlich gehaltene Arme können trotz Arming Fehltrigger erzeugen.
- Pose-Loss-Grace und Glättung ersetzen keine nutzerspezifische Kalibrierung (**nicht implementiert**).
- Heuristik priorisiert Nachvollziehbarkeit vor maximaler Modellgüte.
