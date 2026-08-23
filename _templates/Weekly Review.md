---
type: weekly_review
tags: [journal/weekly]
aliases: []
related: []
week: <% tp.date.now("gggg-[W]WW") %>
---

# Week <% tp.date.now("WW") %> / <% tp.date.now("YYYY") %>
<span class="atelier-kicker">Review · edit · begin again</span>

> [!metric] **The week in signals**
> ```dataview
> TABLE WITHOUT ID sum(study_hours) AS "Study hours", sum(coding_hours) AS "Coding hours", sum(pages_read) AS "Pages read", average(energy) AS "Avg energy"
> FROM "01 Journal/Daily"
> WHERE date >= date(<% tp.date.now("YYYY-MM-DD") %>) - dur(6 days) AND date <= date(<% tp.date.now("YYYY-MM-DD") %>)
> ```

## What happened
```tasks
done
done after <% tp.date.now("YYYY-MM-DD") %> - dur(6 days)
done before <% tp.date.now("YYYY-MM-DD") %> + dur(1 day)
sort by done
```

## Reflection
- What created energy?
- What created friction?
- What am I proud of?
- What needs to be stopped, simplified, or renegotiated?

## Next Week
- One academic outcome:
- One technical outcome:
- One project outcome:
- One life outcome:

## Capture Processing
```dataviewjs
const inbox = dv.page('"02 Capture/Inbox"');
const tasks = inbox?.file?.tasks?.where(t => !t.completed) ?? [];
if (!tasks.length) dv.paragraph("Inbox clear. Nothing is waiting to be clarified.");
else dv.taskList(tasks, false);
```
