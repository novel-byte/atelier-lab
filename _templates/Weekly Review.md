---
type: weekly_review
tags: [journal/weekly]
aliases: []
related: []
week: {{date:gggg-[W]WW}}
---

# Week {{date:WW}} / {{date:YYYY}}
<span class="atelier-kicker">Review · edit · begin again</span>

> [!metric] **The week in signals**
> ```dataview
> TABLE WITHOUT ID sum(study_hours) AS "Study hours", sum(coding_hours) AS "Coding hours", sum(pages_read) AS "Pages read", average(energy) AS "Avg energy"
> FROM "01 Journal/Daily"
> WHERE date >= date(today) - dur(6 days) AND date <= date(today)
> ```

## What happened
```tasks
done
done after 7 days ago
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
