# Datenschutz und Kamera

Die Demos verarbeiten **Webcam-Bilder lokal im Browser** (MediaPipe WASM). Es gibt kein Backend, das Videostreams speichert oder hochlädt.

## Was passiert technisch

1. Der Browser fragt per `getUserMedia` um Kamerazugriff.
2. Frames werden an den Pose Landmarker im Tab übergeben.
3. Landmark-Koordinaten und Gestenstatus bleiben in der laufenden Session (Speicher des Tabs).

## Hinweise für Nutzer und Bewertung

- Ohne Kamerazugriff starten die Demos nicht.
- Auf öffentlichem Hosting ist **HTTPS** nötig (außer `localhost`).
- Es werden keine Accounts, Tracking-Cookies oder Server-Logs für Pose-Daten genutzt.
- Für Vorführungen: Personen im Bildraum informieren; Aufzeichnungen (z. B. Abgabevideo) sind vom Demo-Code getrennt und unterliegen den jeweiligen Einwilligungen.
