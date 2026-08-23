---
type: monthly_review
tags: [journal/monthly]
aliases: []
related: []
month: <% tp.date.now("YYYY-MM") %>
---

# <% tp.date.now("MMMM YYYY") %>
<span class="atelier-kicker">Zoom out · choose · simplify</span>

## Signals
```dataview
TABLE WITHOUT ID sum(study_hours) AS "Study", sum(coding_hours) AS "Coding", sum(pages_read) AS "Pages", average(energy) AS "Energy"
FROM "01 Journal/Daily"
WHERE date >= date(<% tp.date.now("YYYY-MM-01") %>) AND date < date(<% tp.date.now("YYYY-MM-01") %>) + dur(1 month)
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
