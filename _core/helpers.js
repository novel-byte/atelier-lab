// Atelier Lab shared layer.
// Loaded by every Lab dashboard via:
//   const H = new Function("dv","require","app", await app.vault.read(helpersFile))(dv, require, app);
// One implementation for icons, navigation, task mutation, statuses, modals,
// note creation, focus logging and sandbox-scoped storage.

return (function build({ dv, require, app }) {
  const { setIcon, Notice, Modal, Setting, normalizePath } = require("obsidian");
  // Dual-mode: works standalone (vault root = Lab) or nested inside the main vault.
  const ROOT = app.vault.getAbstractFileByPath("_core/helpers.js") ? "" : "Atelier Lab";
  const path = rel => (ROOT ? `${ROOT}/${rel}` : rel);
  const q = folder => `"${ROOT ? `${ROOT}/${folder}` : folder}"`;
  const isLab = p => (ROOT ? String(p).startsWith(`${ROOT}/`) : true);

  // ---------- storage (sandbox-namespaced) ----------
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem("sbx-" + key); return v == null ? fallback : JSON.parse(v); }
      catch (_) { return fallback; }
    },
    set(key, value) { localStorage.setItem("sbx-" + key, JSON.stringify(value)); },
  };

  // ---------- canonical status vocabularies ----------
  const STATUS = {
    project: [["idea", "Idea"], ["planned", "Planned"], ["active", "Active"], ["blocked", "Blocked"],
              ["paused", "Paused"], ["complete", "Complete"], ["archived", "Archived"]],
    job: [["saved", "Saved"], ["preparing", "Preparing"], ["applied", "Applied"],
          ["recruiter_screen", "Recruiter screen"], ["interviewing", "Interviewing"], ["offer", "Offer"],
          ["rejected", "Rejected"], ["withdrawn", "Withdrawn"], ["archived", "Archived"]],
    book: [["want_to_read", "Want to read"], ["reading", "Reading"], ["finished", "Finished"],
           ["paused", "Paused"], ["abandoned", "Abandoned"], ["revisit", "Revisit"]],
  };
  const ACTIVE_PROJECT = ["idea", "planned", "active"];
  const values = type => STATUS[type].map(([v]) => v);
  const label = (type, value) => { const hit = STATUS[type].find(([v]) => v === value); return hit ? hit[1] : value || "—"; };

  // ---------- small utilities ----------
  const icon = (parent, name) => { const el = parent.createDiv({ cls: "adx-icon" }); try { setIcon(el, name); } catch (_) {} return el; };
  const open = path => app.workspace.openLinkText(path, "", false);
  const sectionHead = (parent, text, action, onAction) => {
    const head = parent.createDiv({ cls: "adx-section-head" });
    head.createDiv({ cls: "adx-label", text });
    if (action) { const b = head.createEl("button", { cls: "adx-text-button", text: action }); b.onclick = onAction; }
    return head;
  };
  const empty = (parent, text) => parent.createDiv({ cls: "adx-empty", text });
  const relative = date => {
    if (!date) return "";
    const m = Math.floor((Date.now() - date.toMillis()) / 60000);
    if (m < 1) return "now"; if (m < 60) return `${m}m`;
    if (m < 1440) return `${Math.floor(m / 60)}h`; return `${Math.floor(m / 1440)}d`;
  };
  const safeName = t => String(t).trim().replace(/[\\/:*?"<>|#^[\]]/g, "-").trim() || "untitled";
  const clampPct = n => Math.max(0, Math.min(100, Number(n) || 0));
  const pagesIn = folder => dv.pages(q(folder));
  const labPages = () => dv.pages(ROOT ? `"${ROOT}"` : "");

  // ---------- task completion (source-line mutation) ----------
  async function completeTask(task) {
    if (!task || !task.path) return Notice("Task has no source.");
    const file = app.vault.getAbstractFileByPath(task.path);
    if (!file) return Notice("Task source note is missing.");
    const lines = (await app.vault.read(file)).split("\n");
    const line = Math.max(0, Number(task.line || 0));
    if (!lines[line]) return Notice("Task line could not be found.");
    lines[line] = lines[line].replace(/^(\s*[-*+]\s*)\[ \]/, "$1[x]");
    await app.vault.modify(file, lines.join("\n"));
    new Notice("Task completed.");
    return true;
  }

  function taskRow(parent, task, metaOverride) {
    const row = parent.createDiv({ cls: "adx-task" });
    const check = row.createEl("button", { cls: "adx-task-check", attr: { title: "Complete task", "aria-label": "Complete task" } });
    icon(check, "circle");
    check.onclick = async e => { e.stopPropagation(); if (await completeTask(task)) check.classList.add("is-done"); };
    const body = row.createDiv({ cls: "adx-task-body" });
    body.createDiv({ cls: "adx-task-title", text: task.text.replace(/📅.*|⏫|🔼|🔽|✅.*|\(.*?\)/g, "").trim() || "(untitled)" });
    body.createDiv({ cls: "adx-task-meta", text: metaOverride || task.path.split("/").pop().replace(".md", "") });
    const due = row.createDiv({ cls: `adx-pill ${task.due && task.due <= dv.date("today") ? "is-hot" : ""}`,
                                text: task.due ? task.due.toFormat("MMM d") : "Open" });
    row.onclick = () => open(task.path);
    return row;
  }

  // ---------- native modal form ----------
  function form({ title, fields, submitText = "Save" }) {
    return new Promise(resolve => {
      let modal;
      class FormModal extends Modal {
        onOpen() {
          this.titleEl.setText(title);
          const refs = {};
          for (const f of fields) {
            const setting = new Setting(this.contentEl).setName(f.label);
            if (f.type === "select") {
              setting.addDropdown(drop => {
                (f.options || []).forEach(([value, text]) => drop.addOption(value, text));
                if (f.value != null) drop.setValue(String(f.value));
                refs[f.key] = drop.selectEl;
              });
            } else if (f.type === "textarea") {
              setting.addTextArea(area => { area.inputEl.placeholder = f.placeholder || ""; area.setValue(f.value != null ? String(f.value) : ""); refs[f.key] = area.inputEl; });
            } else {
              setting.addText(text => {
                text.inputEl.type = f.type === "number" ? "number" : "text";
                text.inputEl.placeholder = f.placeholder || "";
                text.setValue(f.value != null ? String(f.value) : "");
                refs[f.key] = text.inputEl;
              });
            }
          }
          new Setting(this.contentEl)
            .addButton(b => b.setButtonText("Cancel").onClick(() => { this.close(); resolve(null); }))
            .addButton(b => b.setButtonText(submitText).setCta().onClick(() => {
              const out = {};
              for (const f of fields) {
                const raw = (refs[f.key] && refs[f.key].value) ?? "";
                out[f.key] = f.type === "number" ? Number(raw) : raw;
              }
              this.close(); resolve(out);
            }));
        }
        onClose() { this.contentEl.empty(); }
      }
      modal = new FormModal(app); modal.open();
    });
  }

  // ---------- template-based note creation ----------
  async function createNote({ kind, folder, template, extraFields = [] }) {
    const data = await form({
      title: `New ${kind}`, submitText: "Create",
      fields: [
        { key: "title", label: "Title", type: "text", placeholder: `${kind} title` },
        ...extraFields,
        { key: "tags", label: "Tags", type: "text", placeholder: "comma,separated (optional)" },
        { key: "related", label: "Related note", type: "text", placeholder: "optional note name" },
      ],
    });
    if (!data || !data.title.trim()) return null;
    const name = safeName(data.title);
    const path = normalizePath(`${ROOT}/${folder}/${name}.md`);
    if (app.vault.getAbstractFileByPath(path)) { new Notice("A note with that name already exists."); return null; }
    let content = `# ${name}\n`;
    const tf = template ? app.vault.getAbstractFileByPath(`${ROOT}/_templates/${template}`) : null;
    if (tf) content = (await app.vault.read(tf))
      .replace(/<% tp\.file\.title %>/g, name)
      .replace(/<% tp\.date\.now\("YYYY-MM-DD"\) %>/g, window.moment().format("YYYY-MM-DD"))
      .replace(/\{\{title\}\}/g, name)
      .replace(/\{\{date:YYYY-MM-DD\}\}/g, window.moment().format("YYYY-MM-DD"));
    if (!content.startsWith("---")) content = `---\n---\n\n${content}`;
    const tags = data.tags.split(",").map(s => s.trim()).filter(Boolean);
    const rel = data.related.trim() ? [`[[${data.related.trim().replace(/\.md$/, "")}]]`] : [];
    const extras = {};
    for (const f of extraFields) {
      const v = data[f.key];
      if (v !== undefined && v !== null && v !== "") extras[f.key] = v;
    }
    // Stage outside mapped folders, then rename in — rename fires no folder-trigger,
    // so deliberate rich creation can never be clobbered by the light-skeleton layer.
    const staged = await app.vault.create(normalizePath(`${ROOT}/_core/staging-${Date.now()}.md`), content);
    const file = await (async () => {
      await app.fileManager.processFrontMatter(staged, fm => {
        fm.tags = Array.from(new Set([...(Array.isArray(fm.tags) ? fm.tags : []), ...tags]));
        fm.aliases = Array.isArray(fm.aliases) ? fm.aliases : [];
        fm.related = rel.length ? rel : (Array.isArray(fm.related) ? fm.related : []);
        Object.assign(fm, extras);
      });
      await app.vault.rename(staged, path);
      return app.vault.getAbstractFileByPath(path);
    })();
    new Notice(`${kind} created.`); open(path);
    return file;
  }

  // ---------- frontmatter patch helper ----------
  async function patchFrontmatter(pathOrPage, updates) {
    const path = typeof pathOrPage === "string" ? pathOrPage : pathOrPage.file.path;
    const file = app.vault.getAbstractFileByPath(path);
    if (!file) { new Notice("Note not found."); return false; }
    await app.fileManager.processFrontMatter(file, fm => Object.assign(fm, updates));
    return true;
  }

  // ---------- focus session logging ----------
  async function logFocusSession({ label: sessionLabel = "Deep work", minutes = 25, project = "", course = "" }) {
    const day = window.moment().format("YYYY-MM-DD");
    const path = normalizePath(`${ROOT}/Sessions/${day}.md`);
    let file = app.vault.getAbstractFileByPath(path);
    if (!file) {
      file = await app.vault.create(path,
        `---\ntype: focus_log\ndate: ${day}\ntags: [focus]\n---\n\n# Focus Log / ${day}\n`);
    }
    const bits = [`${sessionLabel}`, `${minutes} min`];
    if (project) bits.push(project);
    if (course) bits.push(course);
    await app.vault.append(file, `\n- [x] ${bits.join(" · ")} #focus-session`);
    new Notice("Focus session logged.");
  }

  // ---------- back-to-home floating button ----------
  function mountHome(rootEl) {
    if (rootEl.querySelector(".sbx-home-fab")) return;
    const btn = rootEl.createDiv({ cls: "sbx-home-fab", attr: { title: "Back to Home", "aria-label": "Back to Home" } });
    icon(btn, "home");
    btn.onclick = () => open(path("Home.md"));
    return btn;
  }

  // ---------- filter tab bar ----------
  function tabBar(parent, defs, current, onChange) {
    parent.innerHTML = "";
    defs.forEach(([iconName, text, value]) => {
      const item = parent.createDiv({ cls: `adx-nav-item${value === current ? " is-active" : ""}`, attr: { "data-filter": value } });
      icon(item, iconName); item.createEl("span", { text });
      item.onclick = () => onChange(value);
    });
    return parent;
  }

  return {
    ROOT, STATUS, ACTIVE_PROJECT, values, label,
    icon, open, sectionHead, empty, relative, safeName, clampPct,
    path, q, isLab, pagesIn, labPages, store,
    completeTask, taskRow, form, createNote, patchFrontmatter,
    logFocusSession, tabBar, mountHome, Notice,
  };
})({ dv, require, app });
