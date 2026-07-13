# API zum Auflisten registrierter Gesten

- Status: Angenommen
- Entscheider: [Manuel Stamm](https://github.com/Manusta01)
- Datum: 13.07.2026

## Kontext

Für Issue #4 wurde eine eigenständige Präsentations-Demo unter `apps/presentation-demo/` gebaut. Sie importiert die Gesture Library ausschließlich als externe Abhängigkeit (`@beiboot/gesture-library`) und nutzt nur die öffentliche API.

Beim Bauen der Hilfe-UI („Welche Geste steuert was?“) zeigte sich eine Lücke: Die Demo kennt zwar `createDefaultGestureRecognizer()`, aber nicht welche Gesten darin registriert sind. Ohne neue API blieben nur zwei unsaubere Wege:

1. **Gesten-Namen hardcoden** — bricht, sobald sich die Default-Registrierung ändert.
2. **Einzelne Gesture-Plugins importieren** (`GEHE_VOR`, `PAUSE_STOP`, …) — dupliziert Wissen aus `defaults.ts` und widerspricht dem Factory-Pattern.

Die Demo soll ausschließlich über die öffentliche Schnittstelle mit der Library sprechen. Eine Hilfe- oder Einstellungs-UI, die verfügbare Gesten anzeigt, ist ein typischer Consumer-Fall.

## Entscheidung

`GestureRecognizer` erhält die Methode:

```typescript
getRegisteredGestures(): ReadonlyArray<{ name: string; label: string }>
```

Sie liefert die registrierten Gesten in Registrierungsreihenfolge. Der Typ `RegisteredGesture` wird über `index.ts` exportiert.

Die Präsentations-Demo nutzt diese Methode für die Steuerungshilfe; semantische Zuordnungen (z. B. „Gehe vor → nächste Folie“) bleiben bewusst in der Anwendung.

## Begründung

- **Kein Duplikat-Wissen**: Consumer, die `createDefaultGestureRecognizer()` oder eine eigene Plugin-Sammlung nutzen, können Gesten für UI/Logging auflisten, ohne interne Maps oder Plugin-Dateien zu importieren.
- **Minimal-invasive Erweiterung**: Eine schreibgeschützte Abfrage; kein Einfluss auf Erkennung oder Stabilisierung.
- **Konsistent mit bestehender API**: `labelFor(name)` existiert bereits für einzelne Namen; `getRegisteredGestures()` vervollständigt das für die Gesamtmenge.

## Alternativen

### Hardcodierte Gestenliste in der Demo

Schnell umsetzbar, aber fragil und nicht generalisierbar. Verworfen, weil die Reflexion aus Consumer-Sicht zeigen soll, wo die Library-Lücke lag.

### Export einer Konstante `DEFAULT_GESTURES`

Statische Liste parallel zu `createDefaultGestureRecognizer()`. Würde bei custom Registrierungen nicht zum tatsächlichen Recognizer passen. Verworfen zugunsten einer Instanz-Methode.

### Event `register` / Observable Registry

Flexibler für dynamische Plugins, aber für den aktuellen Scope überdimensioniert.

## Konsequenzen

- Öffentliche API und `docs/gesture-library-api.md` sind erweitert.
- Die Präsentations-Demo kann die Hilfe-UI ohne Plugin-Imports rendern.
- Bestehende Consumer (`src/main.ts`) sind unverändert kompatibel.
