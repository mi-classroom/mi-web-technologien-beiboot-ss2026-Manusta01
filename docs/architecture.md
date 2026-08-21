# Architekturüberblick

```mermaid
flowchart LR
  subgraph apps [Anwendungen]
    PoseDemo["Pose-Demo<br/>src/main.ts"]
    Presentation["Präsentation<br/>apps/presentation-demo"]
  end

  subgraph packages [Workspace-Pakete]
    PoseCamera["@beiboot/pose-camera<br/>Kamera + MediaPipe"]
    GestureLib["@beiboot/gesture-library<br/>Gestenerkennung"]
  end

  MediaPipe["MediaPipe Pose Landmarker<br/>WASM + Modell CDN"]

  PoseDemo --> PoseCamera
  PoseDemo --> GestureLib
  Presentation --> PoseCamera
  Presentation --> GestureLib
  PoseCamera --> MediaPipe
  PoseCamera -->|"Landmarks"| GestureLib
```

## Zuständigkeiten

| Schicht | Verantwortung |
| --- | --- |
| Apps | UI, Domänenlogik (Folien), Konsum der öffentlichen APIs |
| `@beiboot/pose-camera` | Webcam, Inferenz, Landmark-Rendering |
| `@beiboot/gesture-library` | Features, Stabilisierung, Gesten-Plugins, Events |

## Trade-offs (Kurz)

- Heuristiken statt ML-Klassifikator: debuggbar, aber begrenzte Robustheit (ADR 005–007).
- Clientseitige Inferenz: Datenschutz besser als Server-ML, aber geräteabhängig (ADR 001).
- Pose-Loss-Grace / EMA: weniger Fehlabbrüche, etwas mehr Latenz (Baseline K3/K4).

Details: [ADRs](adr/).
