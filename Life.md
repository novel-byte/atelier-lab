---
type: dashboard
tags: [sandbox]
cssclasses: [dashboard-layout, atelier-dashboard-page]
---

```dataviewjs
(async () => {
const H = new Function("dv", "require", "app", await app.vault.read((app.vault.getAbstractFileByPath("_core/helpers.js") || app.vault.getAbstractFileByPath(H.path("_core/helpers.js")))))(dv, require, app);
const { icon, open, empty, taskRow, tabBar } = H;
const root = dv.container.createDiv({ cls: "adx adx-enter" });
H.mountHome(root);
H.mountNav(root);
const areas = dv.pages(H.q("Areas")).array();
const tasks = H.labPages().file.tasks.array().filter(t => H.isLab(t.path) && !t.completed && !t.path.includes("_templates/"));

const hero = root.createDiv({ cls: "adx-hero" });
const copy = hero.createDiv({ cls: "adx-hero-copy" });
copy.createDiv({ cls: "adx-date", text: "LIFE STUDIO / SANDBOX" });
copy.createEl("h1", { text: "Live deliberately." });
copy.createDiv({ cls: "adx-focus", text: "Health, money, home, and the quiet systems that hold everything up." });

let filter = "all";
const navBar = root.createDiv({ cls: "adx-nav" });
const grid = root.createDiv({ cls: "adx-grid" });
const main = grid.createDiv({ cls: "adx-column adx-main" });
const side = grid.createDiv({ cls: "adx-column adx-side" });
const panel = main.createDiv({ cls: "adx-panel" });
const labelEl = panel.createDiv({ cls: "adx-label" });
const body = panel.createDiv();
const render = () => {
  body.innerHTML = "";
  tabBar(navBar, [["heart-pulse","Areas","areas"],["check-square","Admin","admin"]], filter, v => { filter = v; render(); });
  if (filter === "areas") {
    labelEl.textContent = `Life areas · ${areas.length}`;
    if (!areas.length) return empty(body, "No life areas yet.");
    areas.forEach(a => { const r = body.createDiv({ cls: "adx-project-row" }); icon(r, "heart-pulse");
      const b = r.createDiv({ cls: "adx-task-body" });
      b.createDiv({ cls: "adx-project-title", text: a.file.name });
      b.createDiv({ cls: "adx-task-meta", text: a.focus || a.status || "maintain" });
      r.onclick = () => open(a.file.path); });
  } else {
    labelEl.textContent = `Life admin · ${tasks.length}`;
    if (!tasks.length) return empty(body, "Nothing waiting.");
    tasks.slice(0, 8).forEach(t => taskRow(body, t));
  }
};
render();

const ritual = side.createDiv({ cls: "adx-panel adx-reading-principles" });
ritual.createDiv({ cls: "adx-label", text: "Life principle" });
ritual.createEl("blockquote", { text: "A system should make room for a life, not become the life." });
const quick = side.createDiv({ cls: "adx-panel" });
quick.createDiv({ cls: "adx-label", text: "Quick create" });
const btns = quick.createDiv();
const b = btns.createEl("button", { cls: "adx-button-primary", text: "Life area" });
b.onclick = () => H.createNote({ kind: "Life area", folder: "Areas", template: "Life Area.md" });
})();
```
