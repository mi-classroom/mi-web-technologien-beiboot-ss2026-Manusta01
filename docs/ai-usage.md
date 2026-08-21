# Einsatz generativer Werkzeuge / KI

Gemäß den Bewertungsgrundsätzen ([notes-on-code](https://cnoss.github.io/thesis/notes-on-code.html)): Einsatz von KI-Tools ist transparent gemacht; Chat-Verläufe liegen als Protokoll im Repo.

## Verwendete Werkzeuge

| Werkzeug                  | Rolle                                                                                                                                                 |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cursor (Agent / Chat)     | Unterstützung bei Architekturvorschlägen, Implementierung (Tests, Robustheit, Refactoring), Dokumentation und Abgleich mit Modul-/Bewertungskriterien |
| Composer-Modell in Cursor | Code- und Textänderungen im Editor                                                                                                                    |

## Was KI unterstützt hat (Auswahl)

- Empfehlung und Ausarbeitung Issue #5 Weg B (Robustheit)
- ADR-Entwürfe und Baseline-Messkonzept
- Vitest-Suite, Pose-Loss-Grace, Glättung, Disambiguierung
- Shared Package `@beiboot/pose-camera`, Build-/Doku-Fixes
- Abgleich gegen Issue-Akzeptanzkriterien und Master-Checkliste

## Was menschlich verantwortet bleibt

- Fachliche Entscheidungen (Weg B, Gestenwahl, Trade-offs)
- Abnahme der Messwerte und Live-Demo
- Deploy, Video, Merge auf `main`, Release-Tag
- Finale inhaltliche Verantwortung für Code und Texte

## Chat-Protokolle

Exportierte bzw. zusammengefasste Verläufe:

- [Protokoll: Issue #5 Vertiefung und Repo-Härtung](ai-chat-log/2026-issue5-cursor.md)
