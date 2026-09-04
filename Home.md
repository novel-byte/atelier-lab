---
type: dashboard
tags: [sandbox]
cssclasses: [dashboard-layout, atelier-dashboard-page]
---

```dataviewjs
(async () => {
const f = (app.vault.getAbstractFileByPath("_core/helpers.js") || app.vault.getAbstractFileByPath(H.path("_core/helpers.js")));
const H = new Function("dv", "require", "app", await app.vault.read(f))(dv, require, app);
const { icon, open, sectionHead, empty, relative, taskRow, store, captureToInbox, Notice } = H;

const root = dv.container.createDiv({ cls: "adx adx-enter" });
H.mountNav(root);
const state = { name: store.get("name", "friend"), focus: store.get("focus", "Choose the work that changes you.") };
const now = new Date();
const greeting = now.getHours() < 5 ? "Still awake" : now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";

// Data — sandbox scope only
const labTasks = H.labPages().file.tasks.array().filter(t => H.isLab(t.path) && !t.path.includes("_templates/"));
const openTasks = labTasks.filter(t => !t.completed);
const doneWeek = labTasks.filter(t => t.completed && t.completion && t.completion >= dv.date("today") - dv.duration("7 days"));
const projects = dv.pages(H.q("Projects")).where(p => p.type === "project" && H.ACTIVE_PROJECT.includes(p.status)).array();
const books = dv.pages(H.q("Books")).where(p => p.type === "book" && p.status === "reading").array();
const applications = dv.pages(H.q("Applications"))
  .where(p => p.type === "job_application" && !["rejected", "withdrawn", "archived"].includes(p.status)).array();

// Hero
const hero = root.createDiv({ cls: "adx-hero" });
const copy = hero.createDiv({ cls: "adx-hero-copy" });
copy.createDiv({ cls: "adx-date", text: now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }) + "  ·  LAB" });
const title = copy.createEl("h1");
title.createEl("span", { text: `${greeting}, ` });
const nameEl = title.createEl("span", { cls: "adx-editable", text: state.name, attr: { contenteditable: "true", spellcheck: "false" } });
title.createEl("span", { text: "." });
nameEl.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); nameEl.blur(); } };
nameEl.onblur = () => { state.name = nameEl.textContent.trim() || state.name; nameEl.textContent = state.name; store.set("name", state.name); };
const focus = copy.createDiv({ cls: "adx-focus", text: state.focus, attr: { contenteditable: "true", spellcheck: "true" } });
focus.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); focus.blur(); } };
focus.onblur = () => { store.set("focus", focus.textContent.trim()); };

const score = openTasks.length + doneWeek.length ? Math.round(doneWeek.length / (openTasks.length + doneWeek.length) * 100) : 0;
const orbit = hero.createDiv({ cls: "adx-orbit" });
orbit.createDiv({ cls: "adx-orbit-ring" });
orbit.createDiv({ cls: "adx-orbit-value", text: `${score}%` });
orbit.createDiv({ cls: "adx-orbit-label", text: "weekly rhythm" });

// Command bar
const command = root.createDiv({ cls: "adx-command" });
const search = command.createDiv({ cls: "adx-command-item adx-search" });
icon(search, "search"); search.createEl("span", { text: "Search the vault" }); search.createEl("kbd", { text: "Ctrl P" });
search.onclick = () => app.commands.executeCommandById("switcher:open");

const capture = command.createDiv({ cls: "adx-command-item adx-capture" });
icon(capture, "plus");
const captureInput = capture.createEl("input", { attr: { placeholder: "Capture to the Lab inbox..." } });
captureInput.onkeydown = async e => {
  if (e.key !== "Enter" || !captureInput.value.trim()) return;
  await captureToInbox(captureInput.value, "thought");
  captureInput.value = "";
};

const createBtn = command.createDiv({ cls: "adx-command-item adx-create" });
icon(createBtn, "plus-circle"); createBtn.createEl("span", { text: "Create" });
createBtn.onclick = () => app.commands.executeCommandById("atelier-tools:new-note");

// Navigation — Lab-internal
const nav = root.createDiv({ cls: "adx-nav" });
[["graduation-cap","Academics",H.path("Academics.md")],["code-2","Programming",H.path("Programming.md")],
 ["blocks","Projects",H.path("Projects.md")],["book-open","Library",H.path("Library.md")],
 ["briefcase-business","Career",H.path("Jobs.md")],["microscope","Research",H.path("Research.md")],
 ["heart-pulse","Life",H.path("Life.md")],["users","People",H.path("People.md")],
 ["palette","Culture",H.path("Culture.md")],["headphones","Lo-fi",H.path("Lo-fi Workspace.md")],
 ["activity","Health",H.path("Vault Health.md")]
].forEach(([i, l, p]) => { const n = nav.createDiv({ cls: "adx-nav-item" }); icon(n, i); n.createEl("span", { text: l }); n.onclick = () => open(p); });

const grid = root.createDiv({ cls: "adx-grid" });
const main = grid.createDiv({ cls: "adx-column adx-main" });
const side = grid.createDiv({ cls: "adx-column adx-side" });

// Pipeline
const pipeline = main.createDiv({ cls: "adx-panel adx-pipeline" });
sectionHead(pipeline, "Today / Pipeline", `${openTasks.length} open`);
[...openTasks].sort((a, b) => (a.due?.ts || 9e15) - (b.due?.ts || 9e15)).slice(0, 7)
  .forEach(t => taskRow(pipeline, t));

// Projects
const work = main.createDiv({ cls: "adx-section" });
sectionHead(work, "In motion", "All projects", () => open(H.path("Projects.md")));
const workGrid = work.createDiv({ cls: "adx-work-grid" });
if (!projects.length) empty(workGrid, "No active projects in the Lab yet.");
projects.slice(0, 4).forEach((p, i) => {
  const card = workGrid.createDiv({ cls: `adx-work-card tone-${i % 4}` });
  card.createDiv({ cls: "adx-work-index", text: String(i + 1).padStart(2, "0") });
  card.createDiv({ cls: "adx-work-title", text: p.file.name });
  card.createDiv({ cls: "adx-work-next", text: p.next_milestone || "Define the next milestone" });
  const prog = card.createDiv({ cls: "adx-progress" });
  prog.createDiv({ attr: { style: `width:${H.clampPct(p.progress)}%` } });
  card.onclick = () => open(p.file.path);
});

// Recent (lab only)
const recent = main.createDiv({ cls: "adx-panel" });
sectionHead(recent, "Recently touched in the Lab");
H.labPages().filter(p => p.path && !p.path.includes("_templates/")).sort(p => p.file.mtime.toMillis(), "desc").limit(6).forEach(p => {
  const row = recent.createDiv({ cls: "adx-note-row" }); icon(row, "file-text");
  const body = row.createDiv({ cls: "adx-note-body" });
  body.createDiv({ cls: "adx-note-title", text: p.file.name });
  body.createDiv({ cls: "adx-note-path", text: p.file.folder.replace("Atelier Lab", "Lab") || "Lab" });
  row.createDiv({ cls: "adx-note-time", text: relative(p.file.mtime) });
  row.onclick = () => open(p.file.path);
});

// Timer (persisted under sbx keys)
const timerPanel = side.createDiv({ cls: "adx-panel adx-timer-panel" });
sectionHead(timerPanel, "Focus room");
const timer = timerPanel.createDiv({ cls: "adx-timer" });
const time = timer.createDiv({ cls: "adx-time", text: "25:00" });
timer.createDiv({ cls: "adx-timer-caption", text: "Deep work · sessions log to Sessions/" });
const presets = timer.createDiv({ cls: "adx-presets" });
let total = store.get("timer-total", 25 * 60), interval = null;
const renderTime = () => time.textContent = `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
renderTime();
[25, 45, 5].forEach((m, i) => {
  const b = presets.createEl("button", { cls: i === 0 ? "is-active" : "", text: `${m}m` });
  b.onclick = () => { clearInterval(interval); interval = null; total = m * 60; store.set("timer-total", total); renderTime(); start.textContent = "Start"; presets.querySelectorAll("button").forEach(x => x.classList.remove("is-active")); b.classList.add("is-active"); };
});
const controls = timer.createDiv({ cls: "adx-timer-controls" });
const start = controls.createEl("button", { cls: "adx-button-primary", text: "Start" });
start.onclick = () => {
  if (interval) { clearInterval(interval); interval = null; start.textContent = "Resume"; time.classList.remove("is-running"); return; }
  start.textContent = "Pause"; time.classList.add("is-running");
  interval = setInterval(() => { total--; store.set("timer-total", total); renderTime(); if (total <= 0) { clearInterval(interval); interval = null; start.textContent = "Start"; time.classList.remove("is-running"); H.logFocusSession({ minutes: 25 }); } }, 1000);
};

// Inbox preview — latest captures from daily inbox notes
const inboxPanel = side.createDiv({ cls: "adx-panel" });
sectionHead(inboxPanel, "Inbox", "Open inbox", () => open(H.path("Inbox.md")));
(async () => {
  const days = dv.pages(H.q("Inbox"))
    .where(p => /^\d{4}-\d{2}-\d{2}$/.test(p.file.name))
    .sort(p => (p.file.day ? p.file.day.ts : 0), "desc")
    .array();
  const items = [];
  for (const p of days.slice(0, 3)) {
    const file = app.vault.getAbstractFileByPath(H.path(`Inbox/${p.file.name}.md`));
    if (!file) continue;
    const content = await app.vault.read(file);
    content.split("\n").forEach(line => {
      let m = line.match(/^\s*- \[( |x)\]\s+(.*)$/);
      let body = null, done = false;
      if (m) { body = m[2]; done = m[1] === "x"; }
      else { m = line.match(/^\s*- (?!\[)(.*)$/); if (m) body = m[1]; }
      if (!body) return;
      const clean = body.trim().replace(/\s*\*[^*]*\*$/, "").trim();
      if (clean) items.push({ text: clean, day: p.file.name, done });
    });
  }
  if (!items.length) { empty(inboxPanel, "Inbox is clear."); return; }
  items.slice(0, 5).forEach(it => {
    const row = inboxPanel.createDiv({ cls: "adx-note-row" });
    icon(row, it.done ? "check-circle" : "inbox");
    const body = row.createDiv({ cls: "adx-note-body" });
    body.createDiv({ cls: "adx-note-title", text: it.text });
    body.createDiv({ cls: "adx-note-path", text: it.day });
    row.onclick = () => open(H.path("Inbox.md"));
  });
})();

// Shelf
const shelf = side.createDiv({ cls: "adx-panel" });
sectionHead(shelf, "Currently reading", "Open library", () => open(H.path("Library.md")));
const resolveCover = (cover, app) => {
  try {
    if (!cover) return null;
    if (typeof cover === "object") cover = cover.path || cover.display;
    if (!cover) return null;
    let name = cover;
    const m = cover.match(/^\[\[(.+?)\]\]$/);
    if (m) name = m[1];
    const base = name.replace(/\.[a-z0-9]+$/i, "").toLowerCase();
    const file = (app.metadataCache.getFirstLinkpathDest(name, "") || app.metadataCache.getLinkpath?.(name))
      || app.vault.getFiles().find(f => f.path.toLowerCase().endsWith(name.toLowerCase()) || f.basename.toLowerCase() === base);
    return file ? app.vault.adapter.getResourcePath(file.path) : cover;
  } catch (_) { return cover; }
};
if (!books.length) empty(shelf, "The Lab shelf is waiting.");
books.slice(0, 3).forEach(b => {
  const row = shelf.createDiv({ cls: "adx-book-row" });
  const coverSrc = resolveCover(b.cover, app);
  if (coverSrc) row.createEl("img", { attr: { src: coverSrc, alt: "" } });
  else { row.createDiv({ cls: "adx-cover-placeholder" }); icon(row.querySelector(".adx-cover-placeholder"), "book-open"); }
  const body = row.createDiv({ cls: "adx-book-body" });
  body.createDiv({ cls: "adx-book-title", text: b.title || b.file.name });
  body.createDiv({ cls: "adx-book-author", text: Array.isArray(b.authors) ? b.authors.join(", ") : b.author || "" });
  const meter = body.createDiv({ cls: "adx-progress" });
  meter.createDiv({ attr: { style: `width:${H.clampPct(b.progress)}%` } });
  row.onclick = () => open(b.file.path);
});

// Career funnel — normalized statuses
const career = side.createDiv({ cls: "adx-panel adx-career" });
sectionHead(career, "Career signal", "Open studio", () => open(H.path("Jobs.md")));
const funnel = career.createDiv({ cls: "adx-funnel" });
H.STATUS.job.filter(([v]) => !["rejected", "withdrawn", "archived"].includes(v)).forEach(([value]) => {
  const count = applications.filter(a => a.status === value).length;
  const bar = funnel.createDiv({ cls: "adx-funnel-row" });
  bar.createEl("span", { text: H.label("job", value) });
  const track = bar.createDiv(); track.createDiv({ attr: { style: `width:${count ? Math.min(100, 24 + count * 18) : 3}%` } });
  bar.createEl("strong", { text: String(count) });
});

// Activity heatmap — Lab-scoped
const activity = side.createDiv({ cls: "adx-panel" });
sectionHead(activity, "12-week activity");
const counts = {};
H.labPages().filter(p => p.path && !p.path.includes("_templates/")).forEach(p => { if (p.file.mtime) { const key = p.file.mtime.toFormat("yyyy-MM-dd"); counts[key] = (counts[key] || 0) + 1; } });
const heat = activity.createDiv({ cls: "adx-heat" });
const cursor = window.moment().startOf("day").subtract(83, "days").startOf("week");
let totalEdits = 0;
for (let w = 0; w < 12; w++) {
  const col = heat.createDiv({ cls: "adx-heat-col" });
  for (let d = 0; d < 7; d++) {
    const key = cursor.format("YYYY-MM-DD"), count = counts[key] || 0; totalEdits += count;
    const level = count === 0 ? 0 : count < 2 ? 1 : count < 4 ? 2 : count < 7 ? 3 : 4;
    col.createDiv({ cls: `adx-heat-cell l${level}`, attr: { title: `${count} notes · ${cursor.format("MMM D")}` } }); cursor.add(1, "day");
  }
}
activity.createDiv({ cls: "adx-heat-caption", text: `${totalEdits} note-touches across twelve weeks` });
})(); 
```
