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
(async () => {
const f = (app.vault.getAbstractFileByPath("_core/helpers.js") || app.vault.getAbstractFileByPath(H.path("_core/helpers.js")));
const H = new Function("dv", "require", "app", await app.vault.read(f))(dv, require, app);
const days = dv.pages(H.q("Inbox")).where(p => /^\d{4}-\d{2}-\d{2}$/.test(p.file.name)).sort(p => (p.file.day ? p.file.day.ts : 0), "asc").array();
const rows = [];
for (const p of days) {
  const file = app.vault.getAbstractFileByPath(H.path(`Inbox/${p.file.name}.md`));
  if (!file) continue;
  const content = await app.vault.read(file);
  content.split("\n").forEach(line => {
    let m = line.match(/^\s*- \[( |x)\]\s+(.*)$/);
    let text = m ? m[2] : null;
    if (!text) { m = line.match(/^\s*- (?!\[)(.*)$/); if (m) text = m[1]; }
    if (!text) return;
    const clean = text.trim().replace(/\s*\*[^*]*\*$/, "").trim();
    if (clean) rows.push(`- [ ] ${clean} *(${p.file.name})*`);
  });
}
if (!rows.length) dv.paragraph("Inbox clear. Nothing is waiting to be clarified.");
else dv.paragraph(rows.join("\n"));
})();
```
