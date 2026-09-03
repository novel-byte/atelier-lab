---
type: dashboard
tags: [sandbox]
cssclasses: [dashboard-layout, atelier-dashboard-page]
---

```dataviewjs
(async () => {
const H = new Function("dv", "require", "app", await app.vault.read((app.vault.getAbstractFileByPath("_core/helpers.js") || app.vault.getAbstractFileByPath(H.path("_core/helpers.js")))))(dv, require, app);
const { icon, open, empty, taskRow } = H;
const root = dv.container.createDiv({ cls: "adx adx-enter" });
H.mountHome(root);
const questions = dv.pages(H.q("Questions")).where(p => p.type === "research_question").array();
const sources = dv.pages(H.q("Sources")).array();
const tasks = H.labPages().file.tasks.array().filter(t => H.isLab(t.path) && !t.completed && !t.path.includes("_templates/"));

const hero = root.createDiv({ cls: "adx-hero" });
const copy = hero.createDiv({ cls: "adx-hero-copy" });
copy.createDiv({ cls: "adx-date", text: "RESEARCH STUDIO / SANDBOX" });
copy.createEl("h1", { text: "Follow the question." });
copy.createDiv({ cls: "adx-focus", text: "Question → source → claim → output, without losing the thread." });
const orbit = hero.createDiv({ cls: "adx-orbit" }); orbit.createDiv({ cls: "adx-orbit-ring" });
orbit.createDiv({ cls: "adx-orbit-value", text: String(questions.length) });
orbit.createDiv({ cls: "adx-orbit-label", text: "open questions" });

const grid = root.createDiv({ cls: "adx-grid" });
const main = grid.createDiv({ cls: "adx-column adx-main" });
const side = grid.createDiv({ cls: "adx-column adx-side" });

const qPanel = main.createDiv({ cls: "adx-panel" });
qPanel.createDiv({ cls: "adx-label", text: `Open questions · ${questions.length}` });
if (!questions.length) empty(qPanel, "No research questions yet.");
questions.forEach(x => {
  const r = qPanel.createDiv({ cls: "adx-project-row" }); icon(r, "help-circle");
  const b = r.createDiv({ cls: "adx-task-body" });
  b.createDiv({ cls: "adx-project-title", text: x.file.name });
  b.createDiv({ cls: "adx-task-meta", text: [x.status, x.domain].filter(Boolean).join(" · ") });
  r.onclick = () => open(x.file.path);
});

const srcPanel = main.createDiv({ cls: "adx-panel" });
srcPanel.createDiv({ cls: "adx-label", text: `Sources · ${sources.length}` });
if (!sources.length) empty(srcPanel, "No sources collected.");
sources.slice(0, 8).forEach(s => {
  const r = srcPanel.createDiv({ cls: "adx-note-row" }); icon(r, "library");
  r.createDiv({ cls: "adx-note-body" }).createDiv({ cls: "adx-note-title", text: s.file.name });
  r.onclick = () => open(s.file.path);
});

const stats = side.createDiv({ cls: "adx-panel adx-academic-stats" });
stats.createDiv({ cls: "adx-label", text: "Evidence signal" });
[[questions.length, "questions"], [sources.length, "sources"], [tasks.length, "actions"]]
  .forEach(([n, l]) => { const s = stats.createDiv(); s.createEl("strong", { text: String(n) }); s.createEl("span", { text: l }); });

const quick = side.createDiv({ cls: "adx-panel" });
quick.createDiv({ cls: "adx-label", text: "Quick create" });
const btns = quick.createDiv(); btns.style.display = "flex"; btns.style.gap = "6px";
[["Question", "Questions", "Research Question.md"], ["Source", "Sources", "Source.md"]].forEach(([k, f, t]) => {
  btns.createEl("button", { cls: "adx-button-primary", text: k }).onclick = () => H.createNote({ kind: k, folder: f, template: t });
});
})();
```
