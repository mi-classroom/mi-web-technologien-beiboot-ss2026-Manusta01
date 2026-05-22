# MediaPipe Pose Landmarker für browserbasierte Pose-Erkennung

- Status: Angenommen
- Entscheider: [Manuel Stamm](https://github.com/Manusta01)
- Datum: 11.05.2026

## Kontext

Für das Projekt soll eine lokal startbare Browser-Demo entstehen, die Live-Körperdaten aus einer Kamera sichtbar macht. Ziel ist nicht der Bau einer eigenen ML-Abstraktion, sondern die direkte Anzeige von Rohdaten wie Landmark-Koordinaten, Sichtbarkeitswerten und beobachtbarer Laufzeitcharakteristik im Browser.

Die Lösung soll mit überschaubarem Implementierungsaufwand in einem engen Zeitrahmen realisierbar sein und gleichzeitig genug Transparenz bieten, um Datenqualität, Stabilität und Performance praktisch zu bewerten.

## Entscheidung

Für die browserbasierte Pose-Erkennung wird **MediaPipe Tasks Vision**, konkret der **Pose Landmarker**, verwendet.

Die Inferenz läuft clientseitig im Browser. Das Kamerabild wird über Browser-APIs erfasst, an das Modell übergeben und die erkannten Landmark-Daten werden direkt in der Oberfläche visualisiert.

## Begründung

MediaPipe passt gut zum Anwendungsfall, weil die Lösung auf Wahrnehmungsaufgaben wie Pose-, Hand- und Gesichtserkennung zugeschnitten ist und damit näher am Problem liegt als ein generischer ML-Baukasten.

Der Pose Landmarker liefert direkt verwertbare Pose-Daten mit 33 Landmarken, wodurch sich Rohdaten ohne zusätzliche Modellierungs- oder Trainingsschritte sichtbar machen lassen.

Für den Web-Kontext ist MediaPipe besonders geeignet, weil eine offizielle Web-Integration vorhanden ist. Dadurch kann die Erkennung direkt im Browser laufen, ohne dass ein separates ML-Backend erforderlich ist.

Ein weiterer Grund ist die geringe Time-to-First-Demo: Vortrainierte Modelle, klar definierte APIs und dokumentierte Web-Setups reduzieren den Integrationsaufwand deutlich.

Die Open-Source-Ausrichtung ist zusätzlich relevant, weil sie Transparenz, Nachvollziehbarkeit und spätere Anpassbarkeit unterstützt.

## Alternativen

### TensorFlow.js / MoveNet

TensorFlow.js mit MoveNet ist eine tragfähige Alternative für Pose-Erkennung im Browser und bietet mehr Freiheit bei Modell- und Pipeline-Entscheidungen. Für den vorliegenden Use Case ist diese Flexibilität jedoch nicht der Haupttreiber; wichtiger ist eine schnell integrierbare, spezialisierte Pose-Lösung mit geringer Setup-Komplexität.

### Eigenes Modell oder serverseitige ML-Verarbeitung

Ein eigener Modell-Stack oder eine serverseitige Inferenz würde mehr Freiheitsgrade eröffnen, erhöht aber Entwicklungs-, Betriebs- und Debugging-Aufwand deutlich. Zusätzlich würden lokale Startbarkeit, Latenz und Datenschutz im ersten Schritt eher verschlechtert als verbessert.

## Konsequenzen

### Vorteile

- Schnelle Integration in eine Browser-Demo mit lokalem Kamerazugriff.
- Direkte Ausgabe von Landmark-Daten, passend zur Anforderung, Rohdaten sichtbar zu machen.
- Kein separates ML-Backend nötig, da die Verarbeitung clientseitig erfolgen kann.
- Gute Grundlage für Beobachtungen zu Stabilität, Rauschen und Performance im realen Lauf.

### Nachteile

- Geringere Modellfreiheit als bei einem generischen ML-Framework oder einer selbst aufgebauten Pipeline.
- Bindung an die Konzepte, APIs und Modellgrenzen von MediaPipe.
- Abhängigkeit von Browser- und Gerätecharakteristika bei Performance und Erkennungsqualität.
