---
type: dashboard
tags: [sandbox]
cssclasses: [dashboard-layout, atelier-dashboard-page]
---

```dataviewjs
(async () => {
const H = new Function("dv", "require", "app", await app.vault.read((app.vault.getAbstractFileByPath("_core/helpers.js") || app.vault.getAbstractFileByPath(H.path("_core/helpers.js")))))(dv, require, app);
const { icon, open, empty, tabBar, taskRow, STATUS } = H;
const root = dv.container.createDiv({ cls: "adx adx-enter" });
H.mountHome(root);
const apps = dv.pages(H.q("Applications")).where(p => p.type === "job_application").array();
const interviews = dv.pages(H.q("Interviews")).array();
const tasks = H.labPages().file.tasks.array().filter(t => H.isLab(t.path) && !t.completed && !t.path.includes("_templates/"));
const closedStages = ["rejected", "withdrawn", "archived"];
const active = apps.filter(a => !closedStages.includes(a.status));

const hero = root.createDiv({ cls: "adx-hero" });
const copy = hero.createDiv({ cls: "adx-hero-copy" });
copy.createDiv({ cls: "adx-date", text: "CAREER STUDIO / SANDBOX" });
copy.createEl("h1", { text: "Build your next chapter." });
copy.createDiv({ cls: "adx-focus", text: "Machine statuses under the hood — every card has an inline stage dropdown." });
const orbit = hero.createDiv({ cls: "adx-orbit" }); orbit.createDiv({ cls: "adx-orbit-ring" });
orbit.createDiv({ cls: "adx-orbit-value", text: String(active.length) });
orbit.createDiv({ cls: "adx-orbit-label", text: "active threads" });

let tab = "pipeline";
const navBar = root.createDiv({ cls: "adx-nav" });
const grid = root.createDiv({ cls: "adx-grid" });
const main = grid.createDiv({ cls: "adx-column adx-main" });
const side = grid.createDiv({ cls: "adx-column adx-side" });
const panel = main.createDiv({ cls: "adx-panel" });
const labelEl = panel.createDiv({ cls: "adx-label" });
const body = panel.createDiv();
const TABS = [["briefcase-business","Pipeline","pipeline"],["calendar-clock","Interviews","interviews"],["archive","Closed","closed"]];

const changeStage = async (a, v) => { if (await H.patchFrontmatter(a.file.path, { status: v })) { new Notice(`${a.file.name} → ${H.label("job", v)}`); setTimeout(() => location.reload(), 400); } };

const render = () => {
  body.innerHTML = "";
  tabBar(navBar, TABS, tab, v => { tab = v; render(); });
  if (tab === "pipeline") {
    labelEl.textContent = `Pipeline · ${apps.length} tracked`;
    STATUS.job.filter(([v]) => !closedStages.includes(v)).forEach(([v]) => {
      const n = apps.filter(a => a.status === v).length;
      const row = body.createDiv({ cls: "adx-funnel-row" });
      row.createEl("span", { text: H.label("job", v) });
      row.createDiv().createDiv({ attr: { style: `width:${n ? Math.min(100, 20 + n * 18) : 3}%` } });
      row.createEl("strong", { text: String(n) });
    });
    const list = body.createDiv();
    if (!active.length) return empty(list, "No active applications.");
    active.forEach(a => jobRow(list, a));
  } else if (tab === "interviews") {
    labelEl.textContent = `Interview room · ${interviews.length}`;
    if (!interviews.length) return empty(body, "No interviews yet.");
    interviews.forEach(i => { const r = body.createDiv({ cls: "adx-note-row" }); icon(r, "calendar-clock");
      r.createDiv({ cls: "adx-note-body" }).createDiv({ cls: "adx-note-title", text: i.file.name }); r.onclick = () => open(i.file.path); });
  } else {
    const closed = apps.filter(a => closedStages.includes(a.status));
    labelEl.textContent = `Closed · ${closed.length}`;
    if (!closed.length) return empty(body, "Nothing closed.");
    closed.forEach(a => jobRow(body, a));
  }
};
function jobRow(parent, a) {
  const row = parent.createDiv({ cls: "adx-task" }); icon(row, "arrow-up-right");
  const b = row.createDiv({ cls: "adx-task-body" });
  b.createDiv({ cls: "adx-task-title", text: a.role || a.file.name });
  b.createDiv({ cls: "adx-task-meta", text: a.company || "" });
  const sel = row.createEl("select", { cls: "adx-select" });
  STATUS.job.forEach(([v, l]) => { const o = sel.createEl("option", { text: l, value: v }); o.selected = a.status === v; });
  sel.onclick = e => e.stopPropagation();
  sel.onchange = () => changeStage(a, sel.value);
  row.onclick = () => open(a.file.path);
}
render();

const actions = side.createDiv({ cls: "adx-panel" });
actions.createDiv({ cls: "adx-label", text: "Career actions" });
if (!tasks.length) empty(actions, "No open career actions.");
tasks.slice(0, 6).forEach(t => taskRow(actions, t));

const addPanel = side.createDiv({ cls: "adx-panel" });
addPanel.createDiv({ cls: "adx-label", text: "Quick create" });
const btns = addPanel.createDiv(); btns.style.display = "flex"; btns.style.gap = "6px";
[["Application", "Applications", "Job Application.md"], ["Interview", "Interviews", "Interview.md"]].forEach(([k, fld, tpl]) => {
  const b = btns.createEl("button", { cls: "adx-button-primary", text: k });
  b.onclick = () => H.createNote({ kind: k, folder: fld, template: tpl,
    extraFields: [{ key: "company", label: "Company", type: "text", placeholder: "Company name" },
                  ...(k === "Application" ? [{ key: "status", label: "Stage", type: "select", options: STATUS.job.map(([v, l]) => [v, l]), value: "saved" }] : [])] });
});
})();
```
