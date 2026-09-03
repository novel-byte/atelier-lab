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
H.mountNav(root);
const works = dv.pages(H.q("Works")).where(p => p.type === "work").array();

const hero = root.createDiv({ cls: "adx-hero" });
const copy = hero.createDiv({ cls: "adx-hero-copy" });
copy.createDiv({ cls: "adx-date", text: "CULTURE STUDIO / SANDBOX" });
copy.createEl("h1", { text: "Pay attention." });
copy.createDiv({ cls: "adx-focus", text: "Films, music, essays, paintings — art that leaves a trace." });
const orbit = hero.createDiv({ cls: "adx-orbit" }); orbit.createDiv({ cls: "adx-orbit-ring" });
orbit.createDiv({ cls: "adx-orbit-value", text: String(works.length) });
orbit.createDiv({ cls: "adx-orbit-label", text: "works tracked" });

const grid = root.createDiv({ cls: "adx-grid" });
const main = grid.createDiv({ cls: "adx-column adx-main" });
const side = grid.createDiv({ cls: "adx-column adx-side" });

const gallery = main.createDiv({ cls: "adx-panel" });
gallery.createDiv({ cls: "adx-label", text: "Recent works" });
if (!works.length) empty(gallery, "Nothing collected yet.");
works.sort((a, b) => b.file.mtime.toMillis() - a.file.mtime.toMillis()).forEach(w => {
  const r = gallery.createDiv({ cls: "adx-project-row" });
  icon(r, w.kind === "film" ? "clapperboard" : w.kind === "music" ? "music" : "palette");
  const b = r.createDiv({ cls: "adx-task-body" });
  b.createDiv({ cls: "adx-project-title", text: w.title || w.file.name });
  b.createDiv({ cls: "adx-task-meta", text: [w.creator, w.kind, w.status].filter(Boolean).join(" · ") });
  r.onclick = () => open(w.file.path);
});

const stats = side.createDiv({ cls: "adx-panel adx-academic-stats" });
stats.createDiv({ cls: "adx-label", text: "Collection" });
[[works.length, "works"], [new Set(works.map(w => w.creator).filter(Boolean)).size, "creators"],
 [works.filter(w => w.status === "experiencing").length, "in progress"]]
  .forEach(([n, l]) => { const s = stats.createDiv(); s.createEl("strong", { text: String(n) }); s.createEl("span", { text: l }); });

const quick = side.createDiv({ cls: "adx-panel" });
quick.createDiv({ cls: "adx-label", text: "Quick create" });
const btns = quick.createDiv();
btns.createEl("button", { cls: "adx-button-primary", text: "Work" })
  .onclick = () => H.createNote({ kind: "Cultural work", folder: "Works", template: "Work.md",
    extraFields: [{ key: "kind", label: "Kind", type: "select",
      options: [["book","Book"],["film","Film"],["music","Music"],["essay","Essay"],["artwork","Artwork"],["other","Other"]] }] });
})();
```
