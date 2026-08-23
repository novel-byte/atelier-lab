# Atelier Lab

A cinematic, dashboard-first Obsidian vault for students and builders — glass bento panels, a live reading tracker with Open Library search, a career pipeline, and a full-screen lo-fi workspace with rain, focus timer, and music.

<p align="center">
  <img src="docs/screenshots/home.png" width="820" alt="Home dashboard"/><!-- REPLACE with your capture -->
</p>

## Highlights

- **Command-center Home** — editable greeting + daily focus, task pipeline with real checkboxes, project cards, weekly rhythm
- **9 domain studios** — Academics, Programming, Projects, Library, Jobs, Research, Life, People, Culture
- **Library** — search Open Library by title/author/ISBN, one-click import with cover art, page-level progress, ratings, statuses
- **Career studio** — application funnel with inline stage changes, interview room
- **Lo-fi workspace** — three.js rain & dust over an original pixel-city night scene, persisted focus timer, session logging, local-audio playlist
- **Universal capture** — `Ctrl/Cmd+Shift+Space` from anywhere; typed Create menu with tags + related-note linking
- **Auto-skeletons** — new notes in domain folders get metadata applied automatically (empty-body, zero intrusion)
- **Vault Health** — unknown statuses, malformed progress, orphan notes

## Setup (5 minutes)

1. `git clone` this repo, then open the folder as an Obsidian vault
2. Trust the vault → **enable community plugins** → install the suggested list (all free)
3. Settings → **Dataview** → enable **JavaScript Queries** → reload
4. Confirm both snippets (**atelier**, **lofi-scene**) are on under Appearance → CSS snippets
5. Open **Home**. Delete anything tagged `#demo` whenever you're ready.

Requires desktop Obsidian ≥ 1.5. Internet needed once (plugin install) and for Open Library search; everything else works offline.

## Folder map

| Folder | Purpose |
|---|---|
| `00` dashboards | Home + one command center per life area |
| `_core/` | Shared dashboard runtime (`helpers.js`) + vendored [three.js](NOTICE) |
| `_templates/` | Rich templates (explicit creation) + `light/` auto-skeletons |
| Domain folders | Books, Projects, Courses, Concepts, People… |
| `Sessions/` | Auto-logged Lo-fi focus sessions |

## Customize

| What | Where |
|---|---|
| Your name / daily focus | Click them on Home |
| Accent color | Settings → Appearance → accent (`#c8895b` default) |
| Reading goal | Library → "Set goal" |
| Focus music | Drop `.mp3/.ogg` files anywhere; select on the Lo-fi page |

## Credits

Built with [Dataview](https://github.com/blacksmithgu/obsidian-dataview), [Tasks](https://github.com/obsidian-tasks-group/obsidian-tasks), [Templater](https://github.com/SilentVoid13/Templater), [Homepage](https://github.com/mirnovov/obsidian-homepage) — and vendored [three.js](NOTICE). Layout inspiration from the Obsidian dashboard community.
