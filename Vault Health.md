---
type: dashboard
tags: [sandbox]
cssclasses: [dashboard-layout, atelier-dashboard-page]
---

```dataviewjs
(async () => {
const H = new Function("dv", "require", "app", await app.vault.read((app.vault.getAbstractFileByPath("_core/helpers.js") || app.vault.getAbstractFileByPath(H.path("_core/helpers.js")))))(dv, require, app);
const { icon, open, empty } = H;
const root = dv.container.createDiv({ cls: "adx adx-enter" });
H.mountHome(root);

const lab = H.labPages().filter(p => !p.file.path.startsWith(H.path("_")));
const missingType = lab.filter(p => !p.type && !p.file.path.includes("Inbox"));
const badProgress = lab.filter(p => p.progress !== undefined && (isNaN(Number(p.progress)) || Number(p.progress) < 0 || Number(p.progress) > 100));
const unknownStatus = lab.filter(p => {
  const t = p.type; if (!p.status) return false;
  const map = { project: H.values("project"), job_application: H.values("job"), book: H.values("book") };
  return map[t] && !map[t].includes(String(p.status));
});
const orphans = lab.filter(p => !p.file.inlinks.length && !p.file.outlinks.length);

const hero = root.createDiv({ cls: "adx-hero" });
const copy = hero.createDiv({ cls: "adx-hero-copy" });
copy.createDiv({ cls: "adx-date", text: "VAULT HEALTH / LAB" });
copy.createEl("h1", { text: "Keep the Lab trustworthy." });
copy.createDiv({ cls: "adx-focus", text: "Unknown statuses, malformed values and isolated notes — scoped to Atelier Lab only." });

const grid = root.createDiv({ cls: "adx-grid" });
const main = grid.createDiv({ cls: "adx-column adx-main" });
const side = grid.createDiv({ cls: "adx-column adx-side" });

const metrics = side.createDiv({ cls: "adx-panel adx-academic-stats" });
metrics.createDiv({ cls: "adx-label", text: "Health signal" });
[[lab.length, "lab notes"], [missingType.length, "missing type"],
 [unknownStatus.length + badProgress.length, "bad values"], [orphans.length, "orphans"]]
  .forEach(([n, l]) => { const s = metrics.createDiv(); s.createEl("strong", { text: String(n) }); s.createEl("span", { text: l }); });

const issues = [...unknownStatus.map(p => [p, `Unknown ${p.type} status: "${p.status}"`]),
                ...badProgress.map(p => [p, "progress must be 0–100"]),
                ...missingType.map(p => [p, "missing type"])];
const issuePanel = main.createDiv({ cls: "adx-panel" });
issuePanel.createDiv({ cls: "adx-label", text: "Notes needing attention" });
if (!issues.length) empty(issuePanel, "No metadata issues in the Lab.");
issues.slice(0, 25).forEach(([p, reason]) => {
  const row = issuePanel.createDiv({ cls: "adx-note-row" }); icon(row, "alert-triangle");
  const body = row.createDiv({ cls: "adx-note-body" });
  body.createDiv({ cls: "adx-note-title", text: p.file.name });
  body.createDiv({ cls: "adx-note-path", text: reason });
  row.onclick = () => open(p.file.path);
});

const orphanPanel = main.createDiv({ cls: "adx-panel" });
orphanPanel.createDiv({ cls: "adx-label", text: "Isolated notes (no links)" });
if (!orphans.length) empty(orphanPanel, "Everything is connected.");
orphans.slice(0, 15).forEach(p => {
  const row = orphanPanel.createDiv({ cls: "adx-note-row" }); icon(row, "unlink");
  row.createDiv({ cls: "adx-note-body" }).createDiv({ cls: "adx-note-title", text: p.file.name });
  row.onclick = () => open(p.file.path);
});
})();
```
