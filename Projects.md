---
type: dashboard
tags: [sandbox]
cssclasses: [dashboard-layout, atelier-dashboard-page]
---

```dataviewjs
(async () => {
const H = new Function("dv", "require", "app", await app.vault.read((app.vault.getAbstractFileByPath("_core/helpers.js") || app.vault.getAbstractFileByPath(H.path("_core/helpers.js")))))(dv, require, app);
const { icon, open, sectionHead, empty, tabBar, taskRow, createNote, STATUS, Notice } = H;
const root = dv.container.createDiv({ cls: "adx adx-enter" });
H.mountHome(root);

const projects = dv.pages(H.q("Projects")).where(p => p.type === "project").array();
const tasks = H.labPages().file.tasks.array().filter(t => H.isLab(t.path) && !t.completed)
  .sort((a, b) => (a.due?.ts || 9e15) - (b.due?.ts || 9e15));

const hero = root.createDiv({ cls: "adx-hero" });
const copy = hero.createDiv({ cls: "adx-hero-copy" });
copy.createDiv({ cls: "adx-date", text: "PROJECT ATELIER / SANDBOX" });
copy.createEl("h1", { text: "Ship small things." });
copy.createDiv({ cls: "adx-focus", text: "Status pills are editable inline — pick a stage right on the card." });
const orbit = hero.createDiv({ cls: "adx-orbit" }); orbit.createDiv({ cls: "adx-orbit-ring" });
orbit.createDiv({ cls: "adx-orbit-value", text: String(projects.filter(p => H.ACTIVE_PROJECT.includes(p.status)).length) });
orbit.createDiv({ cls: "adx-orbit-label", text: "in motion" });

let currentFilter = "active";
const navBar = root.createDiv({ cls: "adx-nav" });
const grid = root.createDiv({ cls: "adx-grid" });
const main = grid.createDiv({ cls: "adx-column adx-main" });
const side = grid.createDiv({ cls: "adx-column adx-side" });

const panel = main.createDiv({ cls: "adx-panel" });
const head = panel.createDiv({ cls: "adx-section-head" });
head.createDiv({ cls: "adx-label", text: "Project field" });
const count = head.createEl("span", { cls: "adx-search-source" });
const list = panel.createDiv();

// New project space — native modal, creates hub + Tasks/Decisions/Changelog + subfolders
const createBtnHolder = root.createDiv({ style: "display:none" });
const filtered = () => projects.filter(p =>
  currentFilter === "all" ? true :
  currentFilter === "active" ? H.ACTIVE_PROJECT.includes(p.status) :
  p.status === currentFilter);

const render = () => {
  list.innerHTML = "";
  const items = filtered();
  count.textContent = `${items.length} ${currentFilter}`;
  tabBar(navBar,
    [["blocks", "All", "all"], ["rocket", "Active", "active"], ...STATUS.project.filter(([v]) => !["idea", "planned", "complete", "active"].includes(v)).map(([v, l]) => [v === "blocked" ? "octagon-alert" : v === "paused" ? "pause-circle" : "archive", l, v]), ["complete-circle-2", "Complete", "complete"]],
    currentFilter, v => { currentFilter = v; render(); });
  if (!items.length) return empty(list, `No ${currentFilter} projects.`);
  items.forEach((p, i) => {
    const card = list.createDiv({ cls: `adx-project-row tone-${i % 4}` });
    card.createDiv({ cls: "adx-work-index", text: String(i + 1).padStart(2, "0") });
    const body = card.createDiv({ cls: "adx-task-body" });
    body.createDiv({ cls: "adx-project-title", text: p.file.name });
    body.createDiv({ cls: "adx-task-meta", text: p.next_milestone || "Next milestone undefined" });
    const meter = card.createDiv({ cls: "adx-progress" });
    meter.createDiv({ attr: { style: `width:${H.clampPct(p.progress)}%` } });
    const sel = card.createEl("select", { cls: "adx-select" });
    STATUS.project.forEach(([v, l]) => { const o = sel.createEl("option", { text: l, value: v }); o.selected = p.status === v; });
    sel.onclick = e => e.stopPropagation();
    sel.onchange = async e => { e.stopPropagation(); if (await H.patchFrontmatter(p.file.path, { status: e.target.value })) { new Notice(`${p.file.name} → ${H.label("project", e.target.value)}`); setTimeout(() => location.reload(), 400); } };
    card.onclick = () => open(p.file.path);
  });
};

const newBtn = navBar.createDiv({ cls: "adx-nav-item adx-project-create" });
icon(newBtn, "folder-plus"); newBtn.createEl("span", { text: "New project space" });
newBtn.onclick = async () => {
  const res = await H.form({ title: "New project space", fields: [
    { key: "name", label: "Project name", type: "text", placeholder: "My next build" },
  ], submitText: "Create" });
  if (!res || !res.name.trim()) return;
  const safeN = H.safeName(res.name);
  const base = H.path(`Projects/${safeN}`);
  if (app.vault.getAbstractFileByPath(base)) return Notice("That project folder already exists.");
  await app.vault.createFolder(base);
  for (const child of ["Notes", "Research", "Assets"]) await app.vault.createFolder(`${base}/${child}`);
  await H.patchFrontmatter(await app.vault.create(`${base}/${safeN}.md`,
    (await app.vault.read(app.vault.getAbstractFileByPath(H.path("_templates/Project.md"))))
      .replace(/\{\{title\}\}/g, safeN).replace(/\{\{date:YYYY-MM-DD\}\}/g, window.moment().format("YYYY-MM-DD"))),
    { tags: ["sandbox/project"] });
  await app.vault.create(`${base}/Changelog.md`, `# ${safeN} / Changelog\n\n## ${window.moment().format("YYYY-MM-DD")}\n- Created in the Lab.\n`);
  new Notice("Project space created."); setTimeout(() => location.reload(), 500);
};
render();

const actions = main.createDiv({ cls: "adx-panel" });
actions.createDiv({ cls: "adx-label", text: "Next actions" });
if (!tasks.length) empty(actions, "Runway clear.");
tasks.slice(0, 8).forEach(t => taskRow(actions, t));

const stats = side.createDiv({ cls: "adx-panel adx-academic-stats" });
stats.createDiv({ cls: "adx-label", text: "Signal" });
[[projects.filter(p => H.ACTIVE_PROJECT.includes(p.status)).length, "active"],
 [projects.filter(p => p.status === "blocked").length, "blocked"], [tasks.length, "open actions"]]
  .forEach(([n, l]) => { const s = stats.createDiv(); s.createEl("strong", { text: String(n) }); s.createEl("span", { text: l }); });
})();
```
