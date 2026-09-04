---
type: dashboard
tags: [sandbox]
cssclasses: [dashboard-layout, atelier-dashboard-page]
---

```dataviewjs
(async () => {
const { setIcon, requestUrl, Notice, normalizePath } = require("obsidian");
const H = new Function("dv", "require", "app", await app.vault.read((app.vault.getAbstractFileByPath("_core/helpers.js") || app.vault.getAbstractFileByPath(H.path("_core/helpers.js")))))(dv, require, app);
const { icon, open, sectionHead, empty, tabBar } = H;
const root = dv.container.createDiv({ cls: "adx adx-library adx-enter" });
H.mountHome(root);
H.mountNav(root);
const books = () => dv.pages(H.q("Books")).where(p => p.type === "book").array();
const iconOf = (p, n) => { const e = p.createDiv({ cls: "adx-icon" }); try { setIcon(e, n); } catch (_) {} return e; };
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

const head = root.createDiv({ cls: "adx-hero adx-library-hero" });
const copy = head.createDiv({ cls: "adx-hero-copy" });
copy.createDiv({ cls: "adx-date", text: "THE LIBRARY / LAB" });
copy.createEl("h1", { text: "Read what expands you." });
copy.createDiv({ cls: "adx-focus", text: "Status, pages and rating are editable on every card." });
const stats = head.createDiv({ cls: "adx-library-stats" });
[["Want to read", "want_to_read"], ["Reading", "reading"], ["Finished", "finished"]].forEach(([l, v]) => {
  const s = stats.createDiv(); s.createEl("strong", { text: String(books().filter(b => b.status === v).length) }); s.createEl("span", { text: l });
});

// Open Library search
const searchPanel = root.createDiv({ cls: "adx-search-panel" });
const formEl = searchPanel.createDiv({ cls: "adx-book-search" }); iconOf(formEl, "search");
const input = formEl.createEl("input", { attr: { placeholder: "Search Open Library by title, author, ISBN..." } });
const searchBtn = formEl.createEl("button", { cls: "adx-button-primary", text: "Search" });
const results = searchPanel.createDiv({ cls: "adx-book-results" });
const yaml = v => JSON.stringify(String(v || "").replace(/\n/g, " "));
const slugify = t => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `book-${Date.now()}`;
  const createBook = async book => {
    const path = normalizePath(H.path(`Books/${slugify(book.title)}.md`));
    if (app.vault.getAbstractFileByPath(path)) return Notice("Already in the Lab shelf.");
    // Stage outside mapped folders, then rename — protects rich content from the light-skeleton trigger.
    const staged = await app.vault.create(normalizePath(H.path(`_core/staging-${Date.now()}.md`)), `---\ntype: book\ntitle: ${yaml(book.title)}\nauthor: ${yaml(book.authors?.[0] || "Unknown author")}\nstatus: want_to_read\nprogress: 0\ncurrent_page: 0\npages: ${book.pages || ""}\nrating:\nstarted:\nfinished:\ncover: ${yaml(book.cover)}\ndate_added: ${window.moment().format("YYYY-MM-DD")}\n---\n\n# ${book.title}\n\n${book.cover ? `![cover|200](${book.cover})` : ""}\n\n## Why this book\n\n## Quotes\n\n## Review\n`);
    await app.vault.rename(staged, path);
    new Notice(`Added ${book.title}`); setTimeout(() => location.reload(), 400);
  };
const doSearch = async () => {
  const q = input.value.trim(); if (!q) return;
  searchBtn.disabled = true; results.innerHTML = ""; results.createDiv({ cls: "adx-loading", text: "Searching the stacks..." });
  try {
    const data = (await requestUrl({ url: `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=8`, headers: { Accept: "application/json" } })).json;
    results.innerHTML = "";
    (data.docs || []).slice(0, 6).forEach(d => {
      const card = results.createDiv({ cls: "adx-result-card" });
      if (d.cover_i) card.createEl("img", { attr: { src: `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg`, alt: "" } });
      else iconOf(card.createDiv({ cls: "adx-cover-placeholder" }), "book-open");
      const body = card.createDiv({ cls: "adx-result-body" });
      body.createDiv({ cls: "adx-result-title", text: d.title });
      body.createDiv({ cls: "adx-result-author", text: (d.author_name || []).join(", ") || "Unknown author" });
      body.createDiv({ cls: "adx-result-meta", text: [d.first_publish_year, d.number_of_pages_median ? `${d.number_of_pages_median}p` : ""].filter(Boolean).join(" · ") });
      const add = card.createEl("button", { cls: "adx-button-primary", text: "Add to shelf" });
      add.onclick = e => { e.stopPropagation(); createBook({ title: d.title, authors: d.author_name, pages: d.number_of_pages_median, cover: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg` : "" }); };
    });
    if (!(data.docs || []).length) results.createDiv({ cls: "adx-empty", text: "No results." });
  } catch (_) { results.innerHTML = ""; results.createDiv({ cls: "adx-empty", text: "Open Library unreachable." }); }
  searchBtn.disabled = false;
};
searchBtn.onclick = doSearch; input.onkeydown = e => { if (e.key === "Enter") doSearch(); };

// Shelf with tabs + inline controls
let filter = "all";
const navBar = root.createDiv({ cls: "adx-nav" });
const shelfPanel = root.createDiv({ cls: "adx-panel" });
shelfPanel.createDiv({ cls: "adx-label", text: "Your shelf" });
const shelfGrid = shelfPanel.createDiv({ cls: "adx-shelf-grid" });
const STATUSES = H.STATUS.book;

const update = async (book, updates) => {
  if (await H.patchFrontmatter(book.file.path, updates)) { new Notice("Shelf updated."); setTimeout(() => location.reload(), 350); }
};
const renderShelf = () => {
  shelfGrid.innerHTML = "";
  tabBar(navBar, [["books", "All", "all"], ...STATUSES.map(([v, l]) => ["book-open", l, v])], filter, v => { filter = v; renderShelf(); });
  const list = books().filter(b => filter === "all" || b.status === filter);
  if (!list.length) return empty(shelfGrid, "This shelf is empty.");
  list.forEach(book => {
    const card = shelfGrid.createDiv({ cls: "adx-book-card" });
    const coverSrc = resolveCover(book.cover, app);
    if (coverSrc) card.createEl("img", { attr: { src: coverSrc, alt: "" } });
    else iconOf(card.createDiv({ cls: "adx-cover-placeholder" }), "book-open");
    const info = card.createDiv({ cls: "adx-book-card-info" });
    info.createDiv({ cls: "adx-book-title", text: book.title || book.file.name });
    info.createDiv({ cls: "adx-book-author", text: Array.isArray(book.authors) ? book.authors.join(", ") : book.author || "" });
    const cur = Number(book.current_page || 0), pages = Number(book.pages || 0);
    const pct = pages ? Math.min(100, Math.round(cur / pages * 100)) : H.clampPct(book.progress);
    const bar = info.createDiv({ cls: "adx-progress" }); bar.createDiv({ attr: { style: `width:${pct}%` } });
    info.createDiv({ cls: "adx-book-progress-label", text: pages ? `${cur} / ${pages} · ${pct}%` : `${pct}% read` });
    const controls = info.createDiv({ cls: "adx-book-controls" });
    const status = controls.createEl("select", { cls: "adx-select" });
    STATUSES.forEach(([v, l]) => { const o = status.createEl("option", { text: l, value: v }); o.selected = book.status === v; });
    status.onchange = async () => {
      const next = status.value, today = window.moment().format("YYYY-MM-DD"), upd = { status: next };
      if (next === "reading" && !book.started) upd.started = today;
      if (next === "finished") { upd.finished = today; upd.progress = 100; if (pages) upd.current_page = pages; }
      update(book, upd);
    };
    const page = controls.createEl("input", { cls: "adx-page-input", attr: { type: "number", min: "0", value: String(cur), title: "Current page" } });
    page.onchange = () => {
      const v = Math.max(0, pages || 99999, Number(page.value) || 0);
      update(book, { current_page: v, progress: pages ? Math.round(v / pages * 100) : H.clampPct(book.progress),
        status: v > 0 && book.status === "want_to_read" ? "reading" : book.status,
        started: v > 0 && !book.started ? window.moment().format("YYYY-MM-DD") : book.started || null });
    };
    const rateWrap = controls.createDiv({ style: "grid-column:1/-1;display:flex;align-items:center;gap:6px;" });
    rateWrap.createEl("span", { cls: "adx-book-progress-label", text: "rating" });
    const rating = rateWrap.createEl("select", { cls: "adx-select" });
    [["", "—"], ...[1, 2, 3, 4, 5].map(n => [String(n), "★".repeat(n)])].forEach(([v, l]) => { const o = rating.createEl("option", { text: l, value: v }); o.selected = String(book.rating ?? "") === v; });
    rating.onchange = () => update(book, { rating: rating.value ? Number(rating.value) : null });
    card.onclick = () => open(book.file.path);
  });
};
renderShelf();
})();
```
