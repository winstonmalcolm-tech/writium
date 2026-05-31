# Scholarly Editor — Claude Context

## Project overview

A desktop word processor built for students, researchers, and professional writers. It combines a rich text editor with AI-assisted writing tools, an academic reference manager, a bibliography generator, a humanizer, and a plagiarism checker. The app is distributed as a Windows desktop application.

---

## Tech stack

| Layer | Technology |
|---|---|
| Desktop shell | Electron 30+ (Windows only for v1) |
| Frontend | Vue 3 + Vite + TypeScript |
| Styling | **Tailwind CSS** + **Naive UI** component library |
| Rich text editor | TipTap 2 (ProseMirror-based) |
| Backend | Node 20 + Express 5 (local server, runs inside Electron) |
| AI engine | Gemini 2.5 Flash (via Google Generative AI SDK) |
| Database | Supabase (Postgres + Auth + Realtime) |
| Citations | citation-js + CSL files (per-version: APA 7, MLA 9, Chicago 17th, Harvard, IEEE) |
| Reference APIs | Semantic Scholar, OpenAlex, Crossref (all free, no key required) |
| Zotero | Zotero Web API v3 (OAuth, personal library sync) |
| .docx import | mammoth.js |
| .docx export | docx.js |
| Web scraping | Firecrawl (API key user-supplied in settings, gracefully disabled if absent) |
| Plagiarism | Winnowing + TF-IDF cosine similarity (open-source, Copyleaks plug-in slot reserved) |
| App settings | electron-store (local persistent config) |
| Packaging | electron-builder (NSIS installer, Windows only) |
| Auto-update | electron-updater |

---

## Styling rules

- Use **Tailwind CSS** for all layout, spacing, typography, and utility classes.
- Use **Naive UI** for all interactive components: buttons, inputs, selects, dropdowns, modals, drawers, tooltips, tabs, progress bars, badges, notifications (via `useMessage`, `useDialog`, `useNotification`).
- Do **not** use raw HTML form elements when a Naive UI equivalent exists.
- Do **not** use other CSS frameworks or component libraries (no Vuetify, no Element Plus, no PrimeVue).
- The app supports **light and dark themes**. Use Naive UI's `n-config-provider` with a dynamic theme prop toggled from the settings store. Always use Naive UI theme tokens (not hardcoded hex values) for colours that need to adapt.
- Custom CSS (in `<style scoped>`) is allowed for editor-specific styles (TipTap content, custom scrollbars, ghost text decorations, citation badges) that Tailwind or Naive UI cannot handle.
- Tailwind's `dark:` variant is available and should be used for non-Naive-UI elements that need dark mode support.

---

## Project structure

```
scholarly-editor/
├── electron/                  # Electron main process
│   ├── main.ts                # App entry, BrowserWindow setup
│   ├── preload.ts             # Context bridge (IPC exposure)
│   ├── ipc/                   # IPC handler modules
│   │   ├── file.ts            # Open/save .docx, .txt, .pdf
│   │   └── settings.ts        # electron-store read/write
│   └── updater.ts             # electron-updater logic
│
├── server/                    # Express backend (spawned by Electron)
│   ├── index.ts               # Server entry, port binding
│   ├── routes/
│   │   ├── ai.ts              # Gemini proxy endpoints
│   │   ├── references.ts      # Semantic Scholar / OpenAlex / Crossref
│   │   ├── zotero.ts          # Zotero Web API proxy
│   │   ├── firecrawl.ts       # Firecrawl metadata extraction
│   │   └── plagiarism.ts      # Plagiarism check orchestration
│   ├── services/
│   │   ├── gemini.ts          # Gemini 2.5 Flash SDK wrapper
│   │   ├── semanticScholar.ts
│   │   ├── openAlex.ts
│   │   ├── crossref.ts
│   │   ├── zoteroService.ts
│   │   ├── firecrawlService.ts
│   │   ├── plagiarismEngine.ts  # Winnowing + TF-IDF
│   │   └── citationFormatter.ts # citation-js + CSL
│   └── middleware/
│       ├── auth.ts            # Supabase JWT verification
│       └── rateLimit.ts       # Per-endpoint rate limiting
│
├── src/                       # Vue 3 renderer process
│   ├── main.ts                # Vue app entry
│   ├── App.vue                # Root component, n-config-provider, theme setup
│   ├── router/index.ts        # Vue Router (Editor, Settings, Auth views)
│   │
│   ├── components/
│   │   ├── editor/
│   │   │   ├── EditorCore.vue         # TipTap editor instance
│   │   │   ├── Toolbar.vue            # Formatting toolbar (Bold, Italic, fonts…)
│   │   │   ├── BubbleMenu.vue         # Floating selection menu
│   │   │   ├── AiCommandPalette.vue   # /ai slash command floating palette
│   │   │   ├── CitationNode.vue       # TipTap custom node view for citations
│   │   │   └── BibliographyPage.vue   # Auto-generated bibliography section
│   │   │
│   │   ├── sidebar/
│   │   │   ├── AppSidebar.vue         # Left sidebar shell
│   │   │   ├── DocumentTree.vue       # Open documents list
│   │   │   └── OutlinePanel.vue       # Heading outline navigation
│   │   │
│   │   ├── references/
│   │   │   ├── ReferenceDrawer.vue    # Right drawer: search + library
│   │   │   ├── ReferenceSearch.vue    # Multi-source search UI
│   │   │   ├── ReferenceCard.vue      # Single result card
│   │   │   ├── ReferenceLibrary.vue   # Saved references list
│   │   │   └── CitationStylePicker.vue
│   │   │
│   │   ├── ai/
│   │   │   ├── AiSidePanel.vue        # Persistent AI chat assistant
│   │   │   └── AiResultPopover.vue    # Inline rephrase / humanize result
│   │   │
│   │   ├── plagiarism/
│   │   │   ├── PlagiarismPanel.vue    # Trigger check + results panel
│   │   │   └── SimilarityReport.vue   # Matched sources + score cards
│   │   │
│   │   └── dialogs/
│   │       ├── SettingsModal.vue      # App settings (keys, theme, account)
│   │       └── VersionHistoryModal.vue
│   │
│   ├── composables/
│   │   ├── useEditor.ts          # TipTap instance + commands
│   │   ├── useAiCommands.ts      # /ai palette logic + Gemini calls
│   │   ├── useReferences.ts      # Reference search + library CRUD
│   │   ├── useCitations.ts       # Insert citation, format bibliography
│   │   ├── usePlagiarism.ts      # Trigger check, parse results
│   │   ├── useFileSystem.ts      # IPC file open/save wrapper
│   │   └── useTheme.ts           # Light/dark toggle, persist to electron-store
│   │
│   ├── stores/
│   │   ├── document.ts           # Pinia: current doc content, title, dirty flag
│   │   ├── references.ts         # Pinia: reference library, used citations
│   │   ├── ai.ts                 # Pinia: AI panel state, history
│   │   ├── plagiarism.ts         # Pinia: check state, results
│   │   └── settings.ts           # Pinia: theme, API keys, citation style
│   │
│   ├── styles/
│   │   ├── tailwind.css          # Tailwind base + components + utilities
│   │   ├── editor.css            # TipTap content styles (typography, tables)
│   │   └── variables.css         # CSS custom properties for editor chrome
│   │
│   └── utils/
│       ├── citationStyles.ts     # CSL style registry (APA 7, MLA 9, etc.)
│       ├── docxParser.ts         # mammoth.js wrapper → TipTap JSON
│       ├── docxExporter.ts       # TipTap JSON → docx.js
│       └── supabase.ts           # Supabase client init
│
├── shared/
│   └── types.ts                 # Shared TypeScript interfaces (Document, Reference, Citation…)
│
├── CLAUDE.md                    # ← this file
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── electron-builder.config.ts
```

---

## Key architectural decisions

### AI command system (`/ai`)
- Triggered by typing `/ai` anywhere in the editor body.
- Opens a floating `AiCommandPalette.vue` anchored to the cursor position.
- Available commands: **Suggest** (continue writing), **Rephrase**, **Humanize**, **Expand**, **Summarize**, **Fix grammar**.
- All commands send the surrounding paragraph (or selected text) as context to the Gemini proxy endpoint on the Express server.
- Results appear in `AiResultPopover.vue` with Accept / Discard / Try again actions.
- The `/ai` text itself is removed from the document before the command fires.

### Ghost text — removed
Ghost text / inline prediction has been removed from the spec. The `/ai` command is the sole AI entry point from within the editor.

### Citation inline nodes
- Citations are TipTap custom `NodeView` components rendered as small interactive badges: `[Smith et al., 2023]`.
- Each badge stores the full reference metadata as node attrs.
- The bibliography page is a separate append-only section auto-rebuilt whenever citations change.
- Style (APA 7, MLA 9, etc.) is a global setting that re-renders all badges and the bibliography live.

### .docx handling
- **Import**: mammoth.js converts .docx → HTML → TipTap JSON via `docxParser.ts`.
- **Export**: TipTap JSON → docx.js nodes via `docxExporter.ts`. Bibliography page appended as a final section.

### Plagiarism engine
- **Stage 1**: Winnowing fingerprinting on the local document (fast, no network).
- **Stage 2**: Text chunks sent to the Express `/plagiarism/check` endpoint.
- **Stage 3**: Express queries a search API (Brave Search or SerpAPI), Firecrawl fetches top results, TF-IDF cosine similarity scores each chunk against fetched content.
- **Result**: Highlighted passages in editor + `SimilarityReport.vue` with per-source breakdown.
- Copyleaks is a reserved provider slot — swap in by implementing the same interface in `plagiarismEngine.ts`.

### Firecrawl
- Used in two places: (1) URL/DOI metadata extraction for reference import, (2) fetching web content for plagiarism corpus.
- API key is stored via `electron-store` and set in Settings → Integrations.
- If the key is absent or blank, both features degrade gracefully: URL import shows a manual entry form, plagiarism web check is skipped (fingerprint-only mode).

### Supabase schema (key tables)
```
documents        (id, user_id, title, content_json, updated_at)
references       (id, user_id, doi, metadata_json, created_at)
citations        (id, document_id, reference_id, position, style)
doc_versions     (id, document_id, content_json, created_at)
user_settings    (user_id, citation_style, theme, firecrawl_key, zotero_token)
```
Row-level security is enabled on all tables. All reads/writes go through the Supabase JS client in the renderer, except for operations that need the service role key (handled server-side in Express).

### Express server
- Spawned as a child process from `electron/main.ts` on app start.
- Listens on a random available port; port is passed to the renderer via IPC.
- All external API keys (Gemini, Firecrawl, Zotero) are read from `electron-store` at request time — never bundled or exposed to the renderer.
- Endpoints are prefixed `/api/v1/`.

---

## Environment / config

```
# .env (development only — never committed)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# Stored in electron-store (user-supplied via Settings UI)
GEMINI_API_KEY
FIRECRAWL_API_KEY
ZOTERO_API_KEY
```

---

## Citation style versions supported

| Style | Versions |
|---|---|
| APA | 7th edition (default), 6th edition |
| MLA | 9th edition (default), 8th edition |
| Chicago | 17th edition Notes-Bibliography, 17th edition Author-Date |
| Harvard | Anglia 2008 (most common Harvard variant) |
| IEEE | 2024 reference guide |

CSL files live in `src/utils/citationStyles.ts` as named exports loaded lazily into citation-js.

---

## Coding conventions

- All components use `<script setup lang="ts">` (Vue 3 Composition API).
- Pinia stores use the `defineStore` setup function syntax (not options API).
- All API calls from the renderer go through composables — never fetch directly in components.
- Async errors are caught and surfaced via Naive UI's `useMessage()` toast system.
- IPC calls use typed wrappers in `useFileSystem.ts` — never call `window.electron.ipcRenderer` directly in components.
- File names: `PascalCase` for Vue components, `camelCase` for composables / utils / stores.
- Imports use `@/` alias mapped to `src/`.