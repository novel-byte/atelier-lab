---
type: monthly_review
tags: [journal/monthly]
aliases: []
related: []
month: {{date:YYYY-MM}}
---

# {{date:MMMM YYYY}}
<span class="atelier-kicker">Zoom out · choose · simplify</span>

## Signals
```dataview
TABLE WITHOUT ID sum(study_hours) AS "Study", sum(coding_hours) AS "Coding", sum(pages_read) AS "Pages", average(energy) AS "Energy"
FROM "01 Journal/Daily"
WHERE date >= date(today) - dur(30 days) AND date <= date(today)
```

## What mattered
- The work that compounded:
- The people and places that gave energy:
- What I am ready to release:

## Next month
- One academic focus:
- One technical focus:
- One project focus:
- One life focus:
