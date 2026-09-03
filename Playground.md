---
type: dashboard
tags: [sandbox]
cssclasses: [dashboard-layout, atelier-dashboard-page]
---

```dataviewjs
(async () => {
const H = new Function("dv", "require", "app", await app.vault.read((app.vault.getAbstractFileByPath("_core/helpers.js") || app.vault.getAbstractFileByPath(H.path("_core/helpers.js")))))(dv, require, app);
const { icon, open, Notice } = H;
const root = dv.container.createDiv({ cls: "adx adx-enter" });
H.mountHome(root);
H.mountNav(root);
const labPages = H.labPages().filter(p => p.path !== H.path("Home.md") && !p.path.includes("_templates/"));

const hero = root.createDiv({ cls: "adx-hero" });
const copy = hero.createDiv({ cls: "adx-hero-copy" });
copy.createDiv({ cls: "adx-date", text: "ATELIER PLAYGROUND / SANDBOX" });
copy.createEl("h1", { text: "Make room for wonder." });
copy.createDiv({ cls: "adx-focus", text: "Serendipity over Lab pages only — production vault stays untouched." });

const grid = root.createDiv({ cls: "adx-grid" });
const main = grid.createDiv({ cls: "adx-column adx-main" });
const side = grid.createDiv({ cls: "adx-column adx-side" });

const random = main.createDiv({ cls: "adx-panel adx-serendipity" });
random.createDiv({ cls: "adx-label", text: "Serendipity" });
const reveal = random.createDiv({ cls: "adx-serendipity-result", text: "Press the button to surface an idea." });
random.createEl("button", { cls: "adx-button-primary", text: "Show me something" }).onclick = () => {
  if (!labPages.length) return Notice("Lab is empty.");
  const p = labPages[Math.floor(Math.random() * labPages.length)];
  reveal.textContent = p.file.name; reveal.onclick = () => open(p.file.path);
};

const links = main.createDiv({ cls: "adx-panel" });
links.createDiv({ cls: "adx-label", text: "Open studios" });
[["home","Home",H.path("Home.md")],["headphones","Lo-fi workspace",H.path("Lo-fi Workspace.md")],
 ["book-open","Library",H.path("Library.md")],["activity","Vault health",H.path("Vault Health.md")]]
  .forEach(([i, l, p]) => { const r = links.createDiv({ cls: "adx-nav-item" }); icon(r, i); r.createEl("span", { text: l }); r.onclick = () => open(p); });

const stats = side.createDiv({ cls: "adx-panel adx-academic-stats" });
stats.createDiv({ cls: "adx-label", text: "Play signals" });
[[labPages.length, "lab notes"], [labPages.filter(p => p.file.tasks.where(t => !t.completed).length).length, "notes with tasks"],
 [labPages.file.tasks.where(t => !t.completed).length, "open tasks"]]
  .forEach(([n, l]) => { const s = stats.createDiv(); s.createEl("strong", { text: String(n) }); s.createEl("span", { text: l }); });
})();
```
