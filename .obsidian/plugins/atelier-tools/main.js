const { Plugin, Modal, Setting, Notice, TFile, TFolder, normalizePath } = require("obsidian");

// ---------- universal creation targets ----------
const TYPES = [
  ["Blank note", "02 Capture", ""],
  ["Project", "05 Projects", "_templates/Project.md"],
  ["Course", "03 Academics/Courses", "_templates/Course.md"],
  ["Assignment", "03 Academics/Assignments", "_templates/Assignment.md"],
  ["Concept", "04 Programming/Concepts", "_templates/Concept.md"],
  ["Book", "06 Library/Books", "_templates/Book.md"],
  ["Research question", "07 Research/Questions", "_templates/Research Question.md"],
  ["Person", "10 People/People", "_templates/Person.md"],
  ["Life area", "08 Life/Areas", "_templates/Life Area.md"],
  ["Cultural work", "11 Art & Literature/Works", "_templates/Work.md"]
];

// ---------- Atelier Lab folder→light-template mappings ----------
const SKELETONS = {
  "Books": "Book.md", "Projects": "Project.md", "Courses": "Course.md",
  "Assignments": "Assignment.md", "Concepts": "Concept.md", "Algorithms": "Algorithm.md",
  "Questions": "Research Question.md", "Sources": "Source.md", "Areas": "Life Area.md",
  "People": "Person.md", "Works": "Work.md", "Applications": "Job Application.md",
  "Interviews": "Interview.md"
};

function safeName(value) { return value.trim().replace(/[\\/:*?"<>|#^[\]]/g, "-").trim() || "untitled"; }
function frontmatter(tags, related) {
  const cleanTags = tags.split(",").map(v => v.trim()).filter(Boolean);
  const cleanRelated = related.trim() ? [`[[${related.trim().replace(/\.md$/, "")}]]`] : [];
  return `tags: ${JSON.stringify(cleanTags)}\naliases: []\nrelated: ${JSON.stringify(cleanRelated)}\n`;
}

// ============================================================
// Modals
// ============================================================
class CaptureModal extends Modal {
  onOpen() {
    this.titleEl.setText("Quick capture");
    new Setting(this.contentEl).setName("Capture").setDesc("Saved to 02 Capture/Inbox.md").addText(text => {
      this.input = text; text.setPlaceholder("Thought, task, link, or next action");
    });
    new Setting(this.contentEl).setName("Kind").addDropdown(drop => {
      this.kind = drop; drop.addOption("thought", "Thought").addOption("task", "Task").addOption("link", "Link").setValue("thought");
    });
    new Setting(this.contentEl).addButton(button => button.setButtonText("Save").setCta().onClick(() => this.save()));
    this.input.inputEl.focus();
  }
  async save() {
    const value = this.input.getValue().trim(); if (!value) return;
    const file = this.app.vault.getAbstractFileByPath("02 Capture/Inbox.md");
    if (!file) return new Notice("Capture inbox is missing.");
    const prefix = this.kind.getValue() === "task" ? "- [ ] " : "- ";
    await this.app.vault.append(file, `\n${prefix}${value} *${window.moment().format("YYYY-MM-DD HH:mm")}*`);
    new Notice("Saved to Inbox."); this.close();
  }
  onClose() { this.contentEl.empty(); }
}

class NewNoteModal extends Modal {
  onOpen() {
    this.titleEl.setText("Create a note");
    new Setting(this.contentEl).setName("Type").addDropdown(drop => {
      this.type = drop; TYPES.forEach((item, i) => drop.addOption(String(i), item[0])); drop.setValue("0");
    });
    new Setting(this.contentEl).setName("Title").addText(text => { this.title = text; text.setPlaceholder("Note title"); });
    new Setting(this.contentEl).setName("Tags").addText(text => { this.tags = text; text.setPlaceholder("study, cs, priority"); });
    new Setting(this.contentEl).setName("Related note").addText(text => { this.related = text; text.setPlaceholder("Optional note path"); });
    new Setting(this.contentEl).addButton(button => button.setButtonText("Create").setCta().onClick(() => this.create()));
    this.title.inputEl.focus();
  }
  async create() {
    const title = safeName(this.title.getValue()); if (!title) return new Notice("Add a title first.");
    const [label, folder, templatePath] = TYPES[Number(this.type.getValue())];
    const path = normalizePath(`${folder}/${title}.md`); if (this.app.vault.getAbstractFileByPath(path)) return new Notice("That note already exists.");
    let content = `---\ntype: note\ncreated: ${window.moment().format("YYYY-MM-DD")}\n---\n\n# ${title}\n\n`;
    if (templatePath) {
      const template = this.app.vault.getAbstractFileByPath(templatePath);
      if (template instanceof TFile) content = (await this.app.vault.read(template)).replaceAll("{{title}}", title).replaceAll("{{date:YYYY-MM-DD}}", window.moment().format("YYYY-MM-DD"));
      if (!content.startsWith("---\n")) content = `---\ntype: ${label.toLowerCase().replace(/\s+/g, "_")}\n---\n\n${content}`;
    }
    const file = await this.app.vault.create(path, content);
    await this.app.fileManager.processFrontMatter(file, fm => {
      fm.tags = this.tags.getValue().split(",").map(v => v.trim()).filter(Boolean);
      fm.aliases = Array.isArray(fm.aliases) ? fm.aliases : [];
      fm.related = this.related.getValue().trim() ? [`[[${this.related.getValue().trim().replace(/\.md$/, "")}]]`] : (Array.isArray(fm.related) ? fm.related : []);
    });
    this.close(); await this.app.workspace.getLeaf(false).openFile(file); new Notice(`${label} created.`);
  }
  onClose() { this.contentEl.empty(); }
}

// ============================================================
// Plugin
// ============================================================
module.exports = class AtelierTools extends Plugin {
  async onload() {
    this.addCommand({ id: "quick-capture", name: "Quick capture", hotkeys: [{ modifiers: ["Mod", "Shift"], key: "Space" }], callback: () => new CaptureModal(this.app).open() });
    this.addCommand({ id: "new-note", name: "Create a note", callback: () => new NewNoteModal(this.app).open() });
    this.setupSkeletonEngine();
  }

  // ------------------------------------------------------------
  // Deterministic Lab skeletons.
  // Applies light templates to EMPTY .md files created or moved into
  // mapped Lab folders. Independent of Templater's event handling,
  // so it works for sidebar creation AND move-into-folder.
  // Scoped strictly to Atelier Lab roots; production vault unaffected.
  // ------------------------------------------------------------
  setupSkeletonEngine() {
    let ROOT = "";
    if (this.app.vault.getAbstractFileByPath("_core/helpers.js")) ROOT = "";
    else if (this.app.vault.getAbstractFileByPath("Atelier Lab/_core/helpers.js")) ROOT = "Atelier Lab";
    else return; // not an Atelier Lab vault — stay inert

    const inFlight = new Set();

    const applySkeleton = async (file) => {
      try {
        if (!(file instanceof TFile) || file.extension !== "md") return;
        if (file.path.includes("/staging-")) return;
        const rel = ROOT ? file.path.slice(ROOT.length + 1) : file.path;
        const parent = rel.includes("/") ? rel.slice(0, rel.lastIndexOf("/")) : "";
        const templateName = SKELETONS[parent];
        if (!templateName || inFlight.has(file.path)) return;
        const current = (await this.app.vault.read(file)).trim();
        if (current.length > 0) return; // never touch non-empty files
        inFlight.add(file.path);
        try {
          const tf = this.app.vault.getAbstractFileByPath(`${ROOT}/_templates/light/${templateName}`);
          if (!(tf instanceof TFile)) return;
          let text = await this.app.vault.read(tf);
          text = text
            .replace(/<% tp\.file\.title %>/g, file.basename)
            .replace(/<% tp\.date\.now\("([^"]+)"\) %>/g, (_, fmt) => window.moment().format(fmt));
          await this.app.vault.modify(file, text);
          new Notice(`${parent.replace(/s$/, "")} registered.`);
        } finally { setTimeout(() => inFlight.delete(file.path), 1500); }
      } catch (_) { /* never break the user's vault over a skeleton */ }
    };

    // Untitled → rename flow means BOTH events can carry the final state;
    // emptiness check makes double-fire idempotent.
    this.registerEvent(this.app.vault.on("create", file => setTimeout(() => this && applySkeleton(file), 400)));
    this.registerEvent(this.app.vault.on("rename", file => setTimeout(() => this && applySkeleton(file), 200)));
  }
};
