# Barrierefreiheit, Performance, Sicherheit

Kurzreflexion im Sinne der Master-Kriterien ([notes-on-code](https://cnoss.github.io/thesis/notes-on-code.html)). Das Projekt ist eine gestengesteuerte Pose-Demo — vollständige WCAG-Konformität ist kein Produktziel, relevante Grenzen sind bewusst benannt.

## Barrierefreiheit (WCAG-Orientierung)

| Thema              | Stand                                                                              |
| ------------------ | ---------------------------------------------------------------------------------- |
| Sprache / Viewport | `lang="de"`, responsive Meta-Viewport                                              |
| Gestensteuerung    | Primär körperbasiert; **kein** vollständiger Keyboard-Fallback in der Präsentation |
| Statusmeldungen    | Textstatus in der UI; Screenreader-Live-Regions nicht ausgearbeitet                |
| Kontrast           | Dunkle Themes in beiden Apps; nicht systematisch gegen WCAG AA geprüft             |

**Trade-off:** Fokus lag auf robuster Gestenerkennung (Issue #5). Keyboard-Steuerung und ARIA wären der nächste sinnvolle Schritt für inklusivere Bedienung.

## Performance-Budget (bewusst)

| Metrik      | Ziel / Beobachtung                                                               |
| ----------- | -------------------------------------------------------------------------------- |
| Inferenz    | niedrige zweistellige ms (Lite-Modell), siehe [data-quality.md](data-quality.md) |
| Hold-Latenz | ~450–480 ms bis Trigger (Baseline K2–K4)                                         |
| Auflösung   | ideal 1080p angefragt; für Gesten oft 720p ausreichend                           |
| Bundle      | Vite Production-Build, ein JS-Chunk ~150 kB gzip ~46 kB (Stand Build)            |

Kein hartes CI-Budget; Werte dienen der Einordnung und dem Video-/Review-Vergleich.

## Web-Security (OWASP-Orientierung)

| Thema        | Maßnahme                                                                   |
| ------------ | -------------------------------------------------------------------------- |
| Secrets      | Keine API-Keys im Repo; reine Client-App                                   |
| XSS          | Kein untrusted HTML aus Netzquellen; Slide-Inhalte sind app-intern         |
| HTTPS        | Für Kamera auf öffentlichem Deploy erforderlich                            |
| Dependencies | Versionen über `package-lock.json` fixiert; CI installiert mit `npm ci`    |
| CDN          | MediaPipe WASM/Modell von bekannten CDNs, **Versions-Pin** statt `@latest` |

Nicht abgedeckt (bewusst out of scope): AuthN/AuthZ, CSRF, Server-Injection — es gibt keinen eigenen Server.
