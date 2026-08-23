# Chat-Protokoll — Issue #5 und Repo-Härtung (Cursor)

- **Zeitraum:** August 2026
- **Werkzeug:** Cursor Agent
- **Person:** Manuel Stamm
- **Zweck:** Modul Web-Technologien, Issue #5 (Weg B) und Abgleich mit Bewertungskriterien

## Verlauf (Zusammenfassung)

1. **Issue #5 einordnen:** Empfehlung Weg B (Robustheit) statt neuer Vision-App; Begründung über bestehende Präsentations-Demo und dokumentierte Schwachstellen.
2. **Entscheidung dokumentieren:** ADR 005, Baseline-Messkonzept (K1–K7).
3. **Baseline implementieren:** Vitest, synthetische Sequenzen, Vorher-Messung; K6 (Pose-Verlust) als Hauptproblem.
4. **Library vertiefen:** Pose-Loss-Grace (ADR 006), EMA-Glättung und Disambiguierung (ADR 007), Nachher-Messung.
5. **Demo-Empfehlung:** öffentliche Demo = Präsentation (`build:presentation`).
6. **Ungereimtheiten:** Build-Fix, Shared `pose-camera`, Doku-Nachzug, Datenqualität Issue #1.
7. **Master-Checkliste (cnoss):** Lockfile, LICENSE, CI, README-Kontext, CDN-Pin, KI-Transparenz.

## Entscheidungen mit KI-Unterstützung (menschlich bestätigt)

| Thema       | Entscheidung                                     |
| ----------- | ------------------------------------------------ |
| Weg A vs B  | B — Robustheit der Gestenerkennung               |
| Messbarkeit | Synthetische Vitest-Baseline vor Code-Änderungen |
| API         | Keine Breaking Changes an `process` / Events     |
| Deploy-Ziel | Präsentation; Deploy/Video durch Autor selbst    |
