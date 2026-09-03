---
type: dashboard
tags: [sandbox]
cssclasses: [dashboard-layout, atelier-dashboard-page]
---

```dataviewjs
(async () => {
const H = new Function("dv", "require", "app", await app.vault.read((app.vault.getAbstractFileByPath("_core/helpers.js") || app.vault.getAbstractFileByPath(H.path("_core/helpers.js")))))(dv, require, app);
const { icon, open, sectionHead, empty, tabBar, taskRow, createNote } = H;
const root = dv.container.createDiv({ cls: "adx adx-enter" });
H.mountHome(root);

const courses = dv.pages(H.q("Courses")).where(p => p.type === "course").array();
const assignments = dv.pages(H.q("Assignments")).array();
const concepts = dv.pages(H.q("Concepts")).where(p => p.type === "concept").array();
const tasks = H.labPages().file.tasks.array().filter(t => H.isLab(t.path) && !t.completed && !t.path.includes("_templates/"))
  .sort((a, b) => (a.due?.ts || 9e15) - (b.due?.ts || 9e15));

const hero = root.createDiv({ cls: "adx-hero" });
const copy = hero.createDiv({ cls: "adx-hero-copy" });
copy.createDiv({ cls: "adx-date", text: "ACADEMIC STUDIO / LAB" });
copy.createEl("h1", { text: "Understand deeply." });
copy.createDiv({ cls: "adx-focus", text: "Courses, assessments, and review — sandbox edition." });
const orbit = hero.createDiv({ cls: "adx-orbit" }); orbit.createDiv({ cls: "adx-orbit-ring" });
orbit.createDiv({ cls: "adx-orbit-value", text: String(courses.filter(c => c.status === "active").length) });
orbit.createDiv({ cls: "adx-orbit-label", text: "active courses" });

const grid = root.createDiv({ cls: "adx-grid" });
const main = grid.createDiv({ cls: "adx-column adx-main" });
const side = grid.createDiv({ cls: "adx-column adx-side" });

let tab = "courses";
const navBar = root.createDiv({ cls: "adx-nav" });
const panel = main.createDiv({ cls: "adx-panel" });
const head = panel.createDiv({ cls: "adx-section-head" });
const labelEl = head.createDiv({ cls: "adx-label" });
const body = panel.createDiv();

const render = () => {
  body.innerHTML = "";
  if (tab === "courses") {
    labelEl.textContent = `Current courses · ${courses.length}`;
    tabBar(navBar, [["layout-dashboard","Courses","courses"],["file-check-2","Assignments","assignments"],["brain","Review","review"]], tab, v => { tab = v; render(); });
    if (!courses.length) return empty(body, "No courses yet.");
    courses.forEach(c => {
      const row = body.createDiv({ cls: "adx-course-row" });
      const b = row.createDiv({ cls: "adx-task-body" });
      b.createDiv({ cls: "adx-task-title", text: c.file.name });
      b.createDiv({ cls: "adx-task-meta", text: c.term || c.instructor || "" });
      const meter = row.createDiv({ cls: "adx-course-meter" });
      meter.createDiv({ attr: { style: `width:${H.clampPct(c.progress)}%` } });
      row.createDiv({ cls: "adx-course-percent", text: `${c.progress || 0}%` });
      row.onclick = () => open(c.file.path);
    });
  } else if (tab === "assignments") {
    labelEl.textContent = `Assignments · ${assignments.length}`;
    tabBar(navBar, [["layout-dashboard","Courses","courses"],["file-check-2","Assignments","assignments"],["brain","Review","review"]], tab, v => { tab = v; render(); });
    if (!assignments.length) return empty(body, "No assignments yet.");
    assignments.forEach(a => {
      const r = body.createDiv({ cls: "adx-project-row" });
      const b = r.createDiv({ cls: "adx-task-body" });
      b.createDiv({ cls: "adx-project-title", text: a.file.name });
      b.createDiv({ cls: "adx-task-meta", text: [a.course, a.status].filter(Boolean).join(" · ") });
      r.onclick = () => open(a.file.path);
    });
  } else {
    labelEl.textContent = `Review queue`;
    tabBar(navBar, [["layout-dashboard","Courses","courses"],["file-check-2","Assignments","assignments"],["brain","Review","review"]], tab, v => { tab = v; render(); });
    if (!concepts.length && !tasks.length) return empty(body, "Nothing queued for review.");
    concepts.sort((a, b) => (a.confidence || 0) - (b.confidence || 0)).slice(0, 8).forEach(c => {
      const r = body.createDiv({ cls: "adx-concept-row" });
      const b = r.createDiv({ cls: "adx-task-body" });
      b.createDiv({ cls: "adx-task-title", text: c.file.name });
      b.createDiv({ cls: "adx-task-meta", text: `confidence ${c.confidence || 0}/5` });
      r.onclick = () => open(c.file.path);
    });
  }
};
render();
sectionHead(side.createDiv({ cls: "adx-panel" }).createDiv({ cls: "adx-section-head" }), "Study loop");
const loopPanel = side.querySelector(".adx-panel");
[["Explain","Say it without notes."],["Implement","Make it tangible."],["Retrieve","Recall first."],["Connect","Link to a real problem."]]
  .forEach(([a, b]) => { const r = loopPanel.createDiv({ cls: "adx-principle-row" }); r.createDiv({ cls: "adx-work-index" }); const bd = r.createDiv(); bd.createDiv({ cls: "adx-task-title", text: a }); bd.createDiv({ cls: "adx-task-meta", text: b }); });

const stats = side.createDiv({ cls: "adx-panel adx-academic-stats" });
stats.createDiv({ cls: "adx-label", text: "Signal" });
[[courses.length, "courses"], [assignments.length, "assignments"], [tasks.length, "open tasks"]]
  .forEach(([n, l]) => { const s = stats.createDiv(); s.createEl("strong", { text: String(n) }); s.createEl("span", { text: l }); });

const addCourse = side.createDiv({ cls: "adx-panel" });
addCourse.createDiv({ cls: "adx-label", text: "Quick create" });
const btns = addCourse.createDiv(); btns.style.display = "flex"; btns.style.gap = "6px";
[["Course", "Courses", "Course.md"], ["Assignment", "Assignments", "Assignment.md"]].forEach(([k, f, t]) => {
  const b = btns.createEl("button", { cls: "adx-button-primary", text: k });
  b.onclick = () => createNote({ kind: k, folder: f, template: t });
});
})();
```
