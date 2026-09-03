---
type: dashboard
tags: [sandbox]
cssclasses: [dashboard-layout, atelier-dashboard-page]
---

```dataviewjs
(async () => {
const H = new Function("dv", "require", "app", await app.vault.read((app.vault.getAbstractFileByPath("_core/helpers.js") || app.vault.getAbstractFileByPath(H.path("_core/helpers.js")))))(dv, require, app);
const { icon, open, sectionHead, empty, tabBar, taskRow, createNote, patchFrontmatter, Notice } = H;
const root = dv.container.createDiv({ cls: "adx adx-enter" });
H.mountHome(root);
H.mountNav(root);

const concepts = dv.pages(H.q("Concepts")).where(p => p.type === "concept").array();
const algorithms = dv.pages(H.q("Algorithms")).array();
const builds = dv.pages(H.q("Projects")).where(p => p.type === "project").array();
const tasks = H.labPages().file.tasks.array().filter(t => H.isLab(t.path) && !t.completed && !t.path.includes("_templates/"));

const hero = root.createDiv({ cls: "adx-hero" });
const copy = hero.createDiv({ cls: "adx-hero-copy" });
copy.createDiv({ cls: "adx-date", text: "PROGRAMMING LAB / SANDBOX" });
copy.createEl("h1", { text: "Build fluency." });
copy.createDiv({ cls: "adx-focus", text: "Confidence dots are clickable — set your level right on the radar." });
const orbit = hero.createDiv({ cls: "adx-orbit" }); orbit.createDiv({ cls: "adx-orbit-ring" });
orbit.createDiv({ cls: "adx-orbit-value", text: String(concepts.length) });
orbit.createDiv({ cls: "adx-orbit-label", text: "concepts tracked" });

let tab = "radar";
const navBar = root.createDiv({ cls: "adx-nav" });
const grid = root.createDiv({ cls: "adx-grid" });
const main = grid.createDiv({ cls: "adx-column adx-main" });
const side = grid.createDiv({ cls: "adx-column adx-side" });
const panel = main.createDiv({ cls: "adx-panel" });
const labelEl = panel.createDiv({ cls: "adx-label" });
const body = panel.createDiv();

const TABS = [["code-2","Radar","radar"],["binary","Algorithms","algorithms"],["terminal","Builds","builds"],["repeat-2","Review","review"]];

const confidenceDots = (row, concept) => {
  const dots = row.createDiv({ cls: "adx-confidence is-clickable" });
  for (let i = 1; i <= 5; i++) {
    const d = dots.createEl("button", { cls: i <= (concept.confidence || 0) ? "is-on" : "", attr: { title: `Set confidence ${i}`, "aria-label": `Set confidence ${i}` } });
    d.onclick = async e => { e.stopPropagation(); if (await patchFrontmatter(concept.file.path, { confidence: i })) new Notice(`${concept.file.name} → ${i}/5`); };
  }
  return dots;
};

const render = () => {
  body.innerHTML = "";
  tabBar(navBar, TABS, tab, v => { tab = v; render(); });
  if (tab === "radar") {
    labelEl.textContent = `Learning radar · ${concepts.length}`;
    if (!concepts.length) return empty(body, "No concepts yet — create one below.");
    concepts.sort((a, b) => (a.confidence || 0) - (b.confidence || 0)).forEach(c => {
      const r = body.createDiv({ cls: "adx-concept-row" });
      const b = r.createDiv({ cls: "adx-task-body" });
      b.createDiv({ cls: "adx-task-title", text: c.file.name });
      b.createDiv({ cls: "adx-task-meta", text: c.domain || "computer science" });
      confidenceDots(r, c);
      r.onclick = () => open(c.file.path);
    });
  } else if (tab === "algorithms") {
    labelEl.textContent = `Algorithms · ${algorithms.length}`;
    if (!algorithms.length) return empty(body, "No algorithm notes yet.");
    algorithms.forEach(a => {
      const r = body.createDiv({ cls: "adx-project-row" });
      r.createDiv({ cls: "adx-task-body" }).createDiv({ cls: "adx-project-title", text: a.file.name });
      r.onclick = () => open(a.file.path);
    });
  } else if (tab === "builds") {
    labelEl.textContent = `Builds · ${builds.length}`;
    if (!builds.length) return empty(body, "No builds linked yet.");
    builds.forEach(p => {
      const r = body.createDiv({ cls: "adx-project-row tone-1" });
      const b = r.createDiv({ cls: "adx-task-body" });
      b.createDiv({ cls: "adx-project-title", text: p.file.name });
      b.createDiv({ cls: "adx-task-meta", text: H.label("project", p.status) });
      r.onclick = () => open(p.file.path);
    });
  } else {
    labelEl.textContent = "Review queue · lowest confidence first";
    if (!tasks.length && !concepts.length) return empty(body, "Nothing to review.");
    concepts.sort((a, b) => (a.confidence || 0) - (b.confidence || 0)).slice(0, 6)
      .forEach(c => { const r = body.createDiv({ cls: "adx-concept-row" }); r.createDiv({ cls: "adx-task-body" }).createDiv({ cls: "adx-project-title", text: c.file.name }); confidenceDots(r, c); r.onclick = () => open(c.file.path); });
  }
};
render();

const queuePanel = main.createDiv({ cls: "adx-panel" });
queuePanel.createDiv({ cls: "adx-label", text: "Lab queue" });
if (!tasks.length) empty(queuePanel, "No open lab tasks.");
tasks.slice(0, 7).forEach(t => taskRow(queuePanel, t));

const principle = side.createDiv({ cls: "adx-panel adx-reading-principles" });
principle.createDiv({ cls: "adx-label", text: "The lab rule" });
principle.createEl("blockquote", { text: "Every idea gets a tiny example. Every example gets a question." });

const stats = side.createDiv({ cls: "adx-panel adx-academic-stats" });
stats.createDiv({ cls: "adx-label", text: "Signal" });
[[concepts.length, "concepts"], [concepts.filter(c => (c.confidence || 0) >= 4).length, "confident"], [tasks.length, "open"]]
  .forEach(([n, l]) => { const s = stats.createDiv(); s.createEl("strong", { text: String(n) }); s.createEl("span", { text: l }); });

const quick = side.createDiv({ cls: "adx-panel" });
quick.createDiv({ cls: "adx-label", text: "Quick create" });
const btns = quick.createDiv(); btns.style.display = "flex"; btns.style.gap = "6px";
[["Concept", "Concepts", "Concept.md"], ["Algorithm", "Algorithms", "Algorithm.md"]].forEach(([k, f, t]) => {
  const b = btns.createEl("button", { cls: "adx-button-primary", text: k });
  b.onclick = () => createNote({ kind: k, folder: f, template: t });
});
})();
```
