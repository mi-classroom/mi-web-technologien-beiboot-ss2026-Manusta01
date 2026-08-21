# Auswahl der Gesten PAUSE_STOP und NAECHSTER_EINTRAG

- Status: Angenommen
- Entscheider: [Manuel Stamm](https://github.com/Manusta01)
- Datum: 29.06.2026

## Kontext

Die Gesture Library soll mindestens vier Gesten umfassen: die zwei bestehenden aus Issue #2 plus zwei neue aus dem Gesten-Mapping (`docs/gestures.md`). Die neuen Gesten sollen zeigen, dass die Library verschiedene Erkennungsmuster unterstützt.

## Entscheidung

Zusätzlich zu **Gehe vor** und **Gehe zurück** werden implementiert:

1. **PAUSE_STOP** — beide Handgelenke oberhalb der Schultern
2. **NAECHSTER_EINTRAG** — rechtes Handgelenk deutlich über rechter Schulter (Y-Achse); gehaltene Pose, kein Swipe

## Begründung

- **Pause / Stop** nutzt beide Arme gleichzeitig und ist semantisch eindeutig; `priority: 10` löst Konflikte mit horizontalen Gesten.
- **Nächster Eintrag** testet eine **vertikale** Einzelarm-Heuristik — damit wird die Library-Struktur nicht nur auf X-Achsen-Navigation reduziert.
- Beide Gesten sind im Mapping als mittel bis gut erkennbar eingestuft und benötigen keine zeitliche Abstandsänderung (im Gegensatz zu Zoom-Gesten).

## Alternativen

- **Vorheriger Eintrag** — symmetrisch zu Nächster Eintrag, aber für den Erweiterbarkeitsnachweis redundant.
- **Menü öffnen** — erfordert Abstandsmessung zwischen beiden Handgelenken; sinnvoll als nächster Schritt nach der Library-Migration.
- **Bestätigen** — geringere Reliabilität laut Mapping.

## Konsequenzen

- Die Neutral-Erkennung berücksichtigt erhobene Arme (`armsRaised`), damit Pause nicht fälschlich als „neutral" gilt.
- Weitere Gesten können nach demselben Plugin-Muster ergänzt werden.

## Nachtrag (Issue #5 / ADR 007)

`NAECHSTER_EINTRAG` verlangt zusätzlich, dass der **linke** Arm nicht oben ist (`!leftWristAboveShoulder`), damit Pause und Nächster Eintrag nicht verwechselt werden. Details: [007-smoothing-and-disambiguation.md](007-smoothing-and-disambiguation.md).
