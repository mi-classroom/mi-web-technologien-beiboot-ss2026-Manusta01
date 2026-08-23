# Datenqualität der Pose-Landmarks (Issue #1)

Kurze Beobachtungen zur MediaPipe Pose Landmarker Demo im Browser. Grundlage: Live-Webcam mit `pose_landmarker_lite`, siehe [ADR 001](adr/001-mediapipe-pose-landmarker.md).

## Was stabil ist

- **Schulter- und Hüftlandmarks** sind frontal und bei guter Beleuchtung zuverlässig sichtbar.
- **Handgelenk-Koordinaten** reichen für grobe Armrichtungen (links/rechts, oben/unten), solange der Ellbogen im Bild ist.
- **Relative Abstände** (z. B. Schulterbreite) skalieren besser als absolute Pixelwerte und eignen sich als dynamische Schwellen.
- **Tracking über Frames** hält die Pose bei ruhiger Bewegung meist über viele Frames hinweg.

## Was unzuverlässig / verrauscht ist

- **Visibility-Scores** schwanken stark bei Teilverdeckung, seitlichem Blick oder schlechtem Licht — Werte können kurz unter sinnvolle Schwellen fallen, obwohl der Arm noch sichtbar ist.
- **Y-Koordinaten der Handgelenke** zittern stärker als X; vertikale Gesten (z. B. Arm nach oben) sind anfälliger für False Negatives.
- **Ellbogen** verschwinden oft zuerst aus dem Tracking; ohne Ellbogen bricht eine Arm-Heuristik, die Sichtbarkeit verlangt, ab.
- **Spiegelung / Kamera-Facing:** Die Landmark-Erkennung und Gesture Library arbeiten auf dem **ungespiegelten** Videobild (MediaPipe-Bildkoordinaten: `x` wächst nach rechts im Frame). Die Canvas-Vorschau in `@beiboot/pose-camera` spiegelt standardmäßig (`mirror: true`), damit die Ansicht wie ein Spiegel wirkt. How-tos müssen das trennen: Erkennung = Bildraum; Vorschau = gespiegelt. Navigation nutzt `dominantDx` (stärkerer sichtbarer Arm), nicht zwingend „nur rechter“ bzw. „nur linker“ Arm.

## Performance (Beobachtung)

- Auf einem Desktop mit Webcam 1080p liegt die Inferenz typischerweise im niedrigen zweistelligen Millisekundenbereich; FPS der Render-Schleife hängt stärker von Kamera und Browser ab als von der Gesture Library selbst.
- Höhere Auflösung verbessert Landmark-Qualität kaum proportional, kostet aber CPU/GPU. Für Gesten reichen oft 720p.
- WASM und Modell werden von CDN geladen — erster Start ist spürbar langsamer als Folge-Sessions (Cache).

## Konsequenz für spätere Issues

Diese Beobachtungen haben die Gestenwahl (Issue #2) und die Stabilisierung (Hold, Grace, Arming; später Pose-Loss-Grace und EMA in Issue #5) geprägt: lieber relative Schwellen und zeitliche Filter als Frame-für-Frame-Entscheidungen auf Rohwerten.
