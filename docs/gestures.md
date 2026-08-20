# Gestenvokabular fuer die Demo

Diese Tabelle ist als Arbeitsgrundlage fuer die Pose-Demo gedacht. Sie bewertet typische Interaktionen danach, wie gut sie sich mit den verfuegbaren Pose-Landmarks im Browser robust erkennen lassen.

| Interaktion        | Moegliche Geste fuer den Nahbereich                    | Verfuegbare Daten & Reliabilitaet                                                                                        | Moegliche Geste fuer den Fernbereich   | Verfuegbare Daten & Reliabilitaet                                                |
| ------------------ | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- | -------------------------------------------------------------------------------- |
| Gehe vor           | Rechtes Handgelenk klar rechts von rechter Schulter    | `right_shoulder`, `right_elbow`, `right_wrist`; hohe Reliabilitaet bei sichtbarem Ellbogen, robust gegen Finger-Rauschen | Rechter Arm zeigt seitlich nach rechts | Schulter-/Ellbogen-/Handgelenkkoordinaten; gute Reliabilitaet frontal zur Kamera |
| Gehe zurueck       | Linkes Handgelenk klar links von linker Schulter       | `left_shoulder`, `left_elbow`, `left_wrist`; hohe Reliabilitaet bei sichtbarem Ellbogen                                  | Linker Arm zeigt seitlich nach links   | Schulter-/Ellbogen-/Handgelenkkoordinaten; gute Reliabilitaet frontal zur Kamera |
| Pause / Stop       | Beide Handgelenke oberhalb der Schultern halten        | `left/right_wrist` relativ zu `left/right_shoulder`; mittlere Reliabilitaet, weil Dehnbewegungen aehnlich aussehen       | Beide Arme ueber Kopf                  | Schulter-/Ellbogen-/Handgelenkhoehen; mittlere bis gute Reliabilitaet            |
| Bestaetigen        | Rechte Hand kurz vor dem Oberkoerper halten            | `right_wrist` relativ zu Schulter-/Hueftbereich; geringe bis mittlere Reliabilitaet                                      | Eine Hand zentral vor dem Torso        | `wrist`, `shoulder`, `hip`; mittlere Reliabilitaet                               |
| Abbrechen          | Linke Hand deutlich ueber die Koerpermitte nach rechts | `left_wrist` relativ zu Schulterachse; mittlere Reliabilitaet, abhaengig von Torso-Rotation                              | Arm kreuzt vor dem Koerper             | Arm- und Schulterlandmarks; mittlere Reliabilitaet                               |
| Menue oeffnen      | Beide Arme seitlich oeffnen                            | Distanz `left_wrist` zu `right_wrist` + Schulterbreite; mittlere Reliabilitaet                                           | Beide Arme weit abgespreizt            | Schulter-/Handgelenkabstand; gute Reliabilitaet bei freiem Bild                  |
| Naechster Eintrag  | Rechte Hand kurz nach oben fuehren                     | `right_wrist.y` relativ zu `right_shoulder.y`; mittlere Reliabilitaet (Jitter in Y)                                      | Rechter Arm diagonal oben              | Ellbogen-/Handgelenkhoehe und Richtung; mittlere Reliabilitaet                   |
| Vorheriger Eintrag | Linke Hand kurz nach oben fuehren                      | `left_wrist.y` relativ zu `left_shoulder.y`; mittlere Reliabilitaet                                                      | Linker Arm diagonal oben               | Ellbogen-/Handgelenkhoehe und Richtung; mittlere Reliabilitaet                   |
| Zoom rein          | Beide Haende voneinander weg bewegen                   | Zeitliche Aenderung im Handgelenkabstand; mittlere Reliabilitaet mit Zeitfenster                                         | Arme nach aussen auseinander           | Schulter-/Handgelenkabstand ueber Zeit; mittlere Reliabilitaet                   |
| Zoom raus          | Beide Haende zueinander bewegen                        | Zeitliche Aenderung im Handgelenkabstand; mittlere Reliabilitaet                                                         | Arme nach innen zusammenfuehren        | Schulter-/Handgelenkabstand ueber Zeit; mittlere Reliabilitaet                   |

## Auswahl fuer den Prototyp

Fuer die prototypische Implementierung wurden zwei Gesten ausgewaehlt:

- Gehe vor
- Gehe zurueck

Begruendung:

- Beide Gesten sind fuer Navigation intuitiv und semantisch eindeutig.
- Beide sind symmetrisch und mit denselben Landmark-Typen erfassbar.
- Die Erkennung ist mit einer einfachen X-Achsen-Heuristik robust umsetzbar.

## Implementierte Gesten (Gesture Library)

Die Erkennung liegt in `src/gesture-library/` und ist von der Demo getrennt. Öffentliche API: [gesture-library-api.md](gesture-library-api.md).

| Geste            | Plugin                          | Erkennungsprinzip                                                        |
| ---------------- | ------------------------------- | ------------------------------------------------------------------------ |
| Gehe vor         | `gestures/gehe-vor.ts`          | Dominantes `dx` nach rechts                                              |
| Gehe zurück      | `gestures/gehe-zurueck.ts`      | Dominantes `dx` nach links                                               |
| Pause / Stop     | `gestures/pause-stop.ts`        | Beide Arme sichtbar und Handgelenke oberhalb der Schultern               |
| Nächster Eintrag | `gestures/naechster-eintrag.ts` | Rechter Arm oben; linker Arm nicht oben (Disambiguierung zu Pause/Stop) |

Die Demo in `src/main.ts` nutzt `createDefaultGestureRecognizer()` und visualisiert Ergebnisse über `src/demo/gestureUi.ts`.

## Implementierte Detektionslogik (Stabilisierung)

Die Stabilisierung (Hold, Grace, Cooldown, Arming, Pose-Verlust) steckt in `src/gesture-library/stabilization.ts`. Feature-Glättung liegt in `smoothing.ts`. Gesten-spezifische Regeln liegen in den jeweiligen Plugins unter `src/gesture-library/gestures/`.

Verwendete Regeln und Schwellwerte:

- Sichtbarkeit:
  - Schulter und Handgelenk muessen `visibility > 0.45` haben.
  - Ellbogen muss `visibility >= 0.45` haben (sonst keine Bewertung des Arms).
- Richtung (nur X-Achse für Navigation):
  - `dx = wrist.x - shoulder.x`.
  - Pro Frame wird das dominante `dx` aus beiden Armen verwendet.
  - Dynamische Schwellwertbildung: `max(0.03, shoulderSpan * 0.2)`.
  - `dominantDx > threshold` => Kandidat `Gehe vor`.
  - `dominantDx < -threshold` => Kandidat `Gehe zurueck`.
- Vertikal / Pause:
  - `PAUSE_STOP`: beide Arme sichtbar und Handgelenke oberhalb der Schultern.
  - `NAECHSTER_EINTRAG`: nur rechter Arm oben; linker Arm darf nicht oben sein (Disambiguierung).
- Feature-Glättung (Issue #5):
  - EMA auf Arm-`dx`/`dy` mit Default `smoothingAlpha = 0.45`.
  - Reduziert Y-Jitter bei vertikalen Gesten.
- Stabilisierung:
  - Kandidat muss `450 ms` stabil sein (`holdTimeMs`).
  - Kurzzeitige Erkennungs-Aussetzer bis `180 ms` werden toleriert (`candidateGraceMs`).
  - Tracking-Lücken bis `200 ms` erhalten Kandidat und Arming (`poseLossGraceMs`, ADR 006).
- False-Positive-Schutz:
  - Arming-Mechanismus: erst nach neutraler Haltung (`maxAbsDx` unter Neutralgrenze fuer `220 ms`) wird ein Trigger erlaubt.
  - Nach Trigger gilt `900 ms` Cooldown.

Vorher/Nachher-Messung der Robustheit: [baseline-measurement.md](baseline-measurement.md).

## Demo-Ausgabe

Die Demo zeigt erkannte Gesten sowohl textuell als auch visuell:

- Statusfeld `#status` mit Zustand (Kandidat, erkannt, Cooldown, neutral/armed).
- Overlay-HUD auf dem Video (`drawGestureHud`) mit aktiver Geste, Kandidat und Pose-Verlust.
- Metrikpanel `#metrics` mit Timing, Schwellen, Arming-Status und `poseLostMs`.
- Rohdatenfeld `#raw` inklusive `gestureDebug` (u. a. `dx`, Visibility, Schwellen, Armed, `poseLostMs`).

## Ehrliche Grenzen und Rest-Risiken

- Bei starker Teilverdeckung oder sehr schraegem Blick auf den Oberkoerper sinkt die Zuverlaessigkeit.
- Wenn Nutzer dauerhaft seitlich gehaltene Armpositionen einnehmen, koennen trotz Arming noch vereinzelt Fehltrigger auftreten.
- Pose-Loss-Grace und Glättung verbessern kurze Aussetzer und Jitter, ersetzen aber keine nutzerspezifische Kalibrierung.
- Die Heuristik priorisiert Nachvollziehbarkeit und Debugbarkeit vor maximaler Modellguete.
- Das ist ein Prototyp; fuer produktiven Einsatz waeren nutzerspezifische Kalibrierung und mehr zeitliche Merkmale sinnvoll.
