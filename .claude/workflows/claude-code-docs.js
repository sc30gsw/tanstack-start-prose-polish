export const meta = {
  name: 'claude-code-docs',
  description:
    "Generate a multi-page Japanese HTML site documenting this project's Claude Code config (skills, rules, hooks, settings.json) plus the enabled ECC plugin surface. Reads actual files in parallel, builds HTML deterministically, writes verbatim, verifies sizes.",
  whenToUse:
    'When you want browsable HTML docs that explain the project .claude/ setup and the ECC plugin.',
  phases: [
    { title: '解析', detail: 'Read .claude rules/hooks/settings + ECC plugin cache in parallel' },
    { title: '生成', detail: 'Build small pages in JS (verbatim write); skills page is built+written by an agent that reads the files itself' },
  ],
}

// ---- inputs (passed via Workflow args) ----
const PROJECT = (args && args.projectDir) || '/Users/kakikaito/dev/github.com/sc30gsw/tanstack-start-prose-polish'
const PLUGIN = (args && args.pluginRoot) || '/Users/kakikaito/.claude/plugins/cache/ecc/ecc/2.0.0-rc.1'
const DATE = (args && args.date) || ''
const OUT = `${PROJECT}/docs/claude-code`

// 37 project skill directories. Skills page is built by a dedicated agent that
// reads each SKILL.md itself — we intentionally do NOT pass skill bodies through
// the script or a writer prompt, because a single ~300KB verbatim-write prompt is
// unreliable (this was the original skills.html failure mode).
const SKILL_DIRS = [
  'accessibility', 'agent-browser', 'better-result-adopt', 'caveman', 'composition-patterns',
  'diagnose', 'doc-coauthoring', 'find-docs', 'find-skills', 'frontend-design',
  'git-guardrails-claude-code', 'grill-me', 'grill-with-docs', 'handoff',
  'improve-codebase-architecture', 'instantdb', 'mantine-custom-components', 'mantine-form',
  'modern-web-guidance',
  'nodejs-backend-patterns', 'nodejs-best-practices', 'react-best-practices', 'react-doctor',
  'seo', 'setup-matt-pocock-skills', 'skill-creator', 'tailwind-css-patterns', 'tanstack-start',
  'tanstack-start-server-fn-testing', 'to-issues', 'to-prd', 'triage', 'typescript-advanced-types',
  'vite', 'web-design-guidelines', 'webapp-testing', 'write-a-skill', 'zoom-out',
]
const SKILLS_COUNT = SKILL_DIRS.length

const RULE_PATHS = [
  '.claude/rules/common/coding-style.md',
  '.claude/rules/common/development-workflow.md',
  '.claude/rules/common/security.md',
  '.claude/rules/common/testing.md',
  '.claude/rules/typescript/better-result.md',
  '.claude/rules/typescript/project-structure.md',
  '.claude/rules/typescript/react-conventions.md',
  '.claude/rules/typescript/valibot-validation.md',
  '.claude/rules/web/mantine-tailwind.md',
]

const SKILLS_PLACEHOLDER = '<!--CARDS_PLACEHOLDER-->'

// ---- schemas ----
const RULES_SCHEMA = {
  type: 'object',
  required: ['rules'],
  properties: {
    rules: {
      type: 'array',
      items: {
        type: 'object',
        required: ['path', 'description', 'explainJa', 'globs', 'alwaysApply', 'body'],
        properties: {
          path: { type: 'string' },
          description: { type: 'string' },
          explainJa: { type: 'string' },
          globs: { type: 'string' },
          alwaysApply: { type: 'string' },
          body: { type: 'string' },
        },
      },
    },
  },
}

const HOOKS_SCHEMA = {
  type: 'object',
  required: ['settingsHooks', 'scripts'],
  properties: {
    settingsHooks: {
      type: 'array',
      items: {
        type: 'object',
        required: ['event', 'matcher', 'async', 'purpose'],
        properties: {
          event: { type: 'string' },
          matcher: { type: 'string' },
          async: { type: 'boolean' },
          purpose: { type: 'string' },
        },
      },
    },
    scripts: {
      type: 'array',
      items: {
        type: 'object',
        required: ['path', 'purpose', 'body'],
        properties: {
          path: { type: 'string' },
          purpose: { type: 'string' },
          body: { type: 'string' },
        },
      },
    },
  },
}

const SETTINGS_SCHEMA = {
  type: 'object',
  required: ['envVars', 'permissionsDeny', 'enabledPlugins', 'raw'],
  properties: {
    envVars: {
      type: 'array',
      items: {
        type: 'object',
        required: ['key', 'value'],
        properties: { key: { type: 'string' }, value: { type: 'string' } },
      },
    },
    permissionsDeny: { type: 'array', items: { type: 'string' } },
    enabledPlugins: { type: 'array', items: { type: 'string' } },
    raw: { type: 'string' },
  },
}

const PLUGIN_LIST_SCHEMA = {
  type: 'object',
  required: ['items', 'count'],
  properties: {
    count: { type: 'number' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'description'],
        properties: { name: { type: 'string' }, description: { type: 'string' } },
      },
    },
  },
}

const RECEIPT_SCHEMA = {
  type: 'object',
  required: ['path', 'written'],
  properties: {
    path: { type: 'string' },
    written: { type: 'boolean' },
    note: { type: 'string' },
  },
}

// ---- helpers ----
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
function ds(s) {
  return esc(String(s == null ? '' : s).toLowerCase().replace(/"/g, ' '))
}
function byName(a, b) {
  return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
}

// ---- analysis prompts ----
const RULES_PROMPT = [
  'You are documenting the Claude Code rule files of this project. Read each file and extract data.',
  `Base directory: ${PROJECT}`,
  `Files (relative): ${RULE_PATHS.join(', ')}`,
  'For each file produce:',
  '- path: the relative path exactly as given',
  '- explainJa: a concise 1-2 sentence JAPANESE explanation of what this rule enforces and where/when it applies (its scope), written for a developer skimming the page. ALWAYS in Japanese regardless of the file language.',
  '- description: frontmatter `description:` if present; otherwise an empty string',
  '- globs: frontmatter `globs:` joined by ", " if present; otherwise an empty string',
  '- alwaysApply: frontmatter `alwaysApply:` as a string ("true"/"false"); otherwise empty string',
  '- body: the ENTIRE file content verbatim, byte-for-byte. DO NOT summarize or truncate.',
  'Note: these files may NOT have frontmatter (they may start directly with a markdown heading). In that case leave description/globs/alwaysApply empty and still return the full body.',
  'Output strictly via the structured tool.',
].join('\n')

const HOOKS_PROMPT = [
  'You are documenting the Claude Code hooks of this project.',
  `Read ${PROJECT}/.claude/settings.json. Under the "hooks" key there are PostToolUse entries and a Stop entry; each entry has a matcher and one inline shell command.`,
  'For EACH hook entry, produce {event, matcher, async, purpose}:',
  '- event: "PostToolUse" or "Stop"',
  '- matcher: the matcher string (e.g. "Edit|Write" or "*")',
  '- async: true if the hook config sets async:true, else false',
  '- purpose: ONE concise Japanese sentence describing what the inline command actually does (read the script to determine this).',
  'List the PostToolUse entries in file order, then the Stop entry.',
  `Also read ${PROJECT}/.claude/hooks/claude-doctor-continuous.sh and return scripts:[{path, purpose, body}] where path=".claude/hooks/claude-doctor-continuous.sh", purpose=1-2 Japanese sentences, body=the ENTIRE script content verbatim byte-for-byte (no truncation).`,
  'Output strictly via the structured tool.',
].join('\n')

const SETTINGS_PROMPT = [
  'You are documenting the Claude Code settings of this project.',
  `Read ${PROJECT}/.claude/settings.json and return:`,
  '- envVars: array of {key,value} from the "env" object (value as string)',
  '- permissionsDeny: array of strings from permissions.deny',
  '- enabledPlugins: array of "<id>" strings from enabledPlugins whose value is true',
  '- raw: the ENTIRE settings.json file content verbatim, byte-for-byte (no truncation).',
  'Output strictly via the structured tool.',
].join('\n')

function pluginListPrompt(kind, dir, opts) {
  const lines = [
    `You are enumerating the ECC Claude Code plugin's ${kind}. This is an OVERVIEW only — names and short descriptions, NOT full bodies.`,
    `Directory: ${dir}`,
    'Use Bash for speed (ls, grep/sed on frontmatter). For EACH item produce {name, description}:',
    '- name: the item name (frontmatter `name:` if present, else the file/dir base name without extension)',
    '- description: the frontmatter `description:` first sentence, collapsed to a single line and truncated to 160 characters; empty string if none',
    'Sort items by name. Also return count = number of items you processed.',
  ]
  if (opts && opts.head != null) lines.push(`ONLY process the FIRST ${opts.head} entries (sort the directory entries ascending, then take the first ${opts.head}).`)
  if (opts && opts.skip != null) lines.push(`SKIP the first ${opts.skip} entries (sort ascending, then take everything AFTER the first ${opts.skip}).`)
  lines.push('Output strictly via the structured tool.')
  return lines.join('\n')
}

// =========================================================
// PHASE 1 — 解析 (parallel reads). Skills are read by the skills-page agent
// in phase 2, so they are not analyzed here.
// =========================================================
phase('解析')

const tasks = [
  { key: 'rules', run: () => agent(RULES_PROMPT, { label: 'rules', phase: '解析', schema: RULES_SCHEMA, agentType: 'general-purpose' }) },
  { key: 'hooks', run: () => agent(HOOKS_PROMPT, { label: 'hooks', phase: '解析', schema: HOOKS_SCHEMA, agentType: 'general-purpose' }) },
  { key: 'settings', run: () => agent(SETTINGS_PROMPT, { label: 'settings', phase: '解析', schema: SETTINGS_SCHEMA, agentType: 'general-purpose' }) },
  { key: 'pAgents', run: () => agent(pluginListPrompt('agents', `${PLUGIN}/agents`), { label: 'plugin:agents', phase: '解析', schema: PLUGIN_LIST_SCHEMA, agentType: 'general-purpose' }) },
  { key: 'pCommands', run: () => agent(pluginListPrompt('commands', `${PLUGIN}/commands`), { label: 'plugin:commands', phase: '解析', schema: PLUGIN_LIST_SCHEMA, agentType: 'general-purpose' }) },
  { key: 'pSkillsA', run: () => agent(pluginListPrompt('skills', `${PLUGIN}/skills`, { head: 125 }), { label: 'plugin:skills(1/2)', phase: '解析', schema: PLUGIN_LIST_SCHEMA, agentType: 'general-purpose' }) },
  { key: 'pSkillsB', run: () => agent(pluginListPrompt('skills', `${PLUGIN}/skills`, { skip: 125 }), { label: 'plugin:skills(2/2)', phase: '解析', schema: PLUGIN_LIST_SCHEMA, agentType: 'general-purpose' }) },
]

const out = await parallel(tasks.map((t) => t.run))
const byKey = {}
tasks.forEach((t, i) => (byKey[t.key] = out[i]))

const rules = ((byKey.rules && byKey.rules.rules) || []).slice()
const settingsHooks = (byKey.hooks && byKey.hooks.settingsHooks) || []
const hookScripts = (byKey.hooks && byKey.hooks.scripts) || []
const settings = byKey.settings || { envVars: [], permissionsDeny: [], enabledPlugins: [], raw: '' }
const pAgents = byKey.pAgents || { items: [], count: 0 }
const pCommands = byKey.pCommands || { items: [], count: 0 }
const pSkills = {
  items: [...((byKey.pSkillsA && byKey.pSkillsA.items) || []), ...((byKey.pSkillsB && byKey.pSkillsB.items) || [])].sort(byName),
  count: ((byKey.pSkillsA && byKey.pSkillsA.count) || 0) + ((byKey.pSkillsB && byKey.pSkillsB.count) || 0),
}

log(`解析完了: skills=${SKILLS_COUNT}(dir), rules=${rules.length}, hooks=${settingsHooks.length}+${hookScripts.length}script, plugin agents=${pAgents.count}/skills=${pSkills.count}/commands=${pCommands.count}`)

// =========================================================
// build HTML deterministically
// =========================================================
const COUNTS = {
  index: '',
  skills: SKILLS_COUNT,
  rules: rules.length,
  hooks: settingsHooks.length + hookScripts.length,
  settings: '',
  plugin: pAgents.count + pSkills.count + pCommands.count,
}
const NAV = [
  { id: 'index', href: './index.html', label: '概要' },
  { id: 'skills', href: './skills.html', label: 'Skills' },
  { id: 'rules', href: './rules.html', label: 'Rules' },
  { id: 'hooks', href: './hooks.html', label: 'Hooks' },
  { id: 'settings', href: './settings.html', label: 'settings.json' },
  { id: 'plugin', href: './plugin.html', label: 'Plugin (ECC)' },
]

function shell(title, activeId, contentHtml, opts) {
  const showToolbar = !(opts && opts.noToolbar)
  const nav = NAV.map((n) => {
    const c = COUNTS[n.id]
    const count = c === '' || c == null ? '' : `<span class="n">${c}</span>`
    return `<a href="${n.href}" class="${n.id === activeId ? 'active' : ''}">${esc(n.label)}${count}</a>`
  }).join('\n        ')
  const toolbar = showToolbar
    ? `<div class="toolbar">
        <input id="q" type="search" placeholder="このページ内を検索…" autocomplete="off" />
        <button class="btn" id="expand-all">すべて展開</button>
        <button class="btn" id="collapse-all">すべて折りたたみ</button>
      </div>`
    : ''
  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)} — Claude Code 設定ガイド</title>
<link rel="stylesheet" href="./assets/styles.css" />
</head>
<body>
<div class="layout">
  <aside class="sidebar">
    <h1>Claude Code 設定</h1>
    <div class="sub">tanstack-start-prose-polish</div>
    <nav class="nav">
        ${nav}
    </nav>
  </aside>
  <main class="main">
    <div class="page-head">
      <h2>${esc(title)}</h2>
      <div class="meta">生成日: ${esc(DATE)} ・ 実データ（.claude/ 配下の実ファイル）から自動生成</div>
    </div>
    ${toolbar}
    ${contentHtml}
    <footer style="margin-top:48px;color:var(--muted);font-size:12px;border-top:1px solid var(--border);padding-top:16px">
      Generated by the <code>claude-code-docs</code> workflow ・ ${esc(DATE)}
    </footer>
  </main>
</div>
<script src="./assets/app.js"></script>
</body>
</html>
`
}

function ruleCard(r) {
  const file = r.path.split('/').pop()
  const badges =
    (r.globs ? `<span class="badge">${esc(r.globs)}</span>` : '') +
    (r.alwaysApply === 'true' ? `<span class="badge ok">alwaysApply</span>` : '')
  return `<article class="card" data-search="${ds(`${file} ${r.path} ${r.explainJa} ${r.description} ${r.globs}`)}">
  <div class="card-head"><h3>${esc(file)}</h3>${badges}</div>
  <p class="explain"><strong>解説:</strong> ${esc(r.explainJa)}</p>
  <p class="desc">${esc(r.description || '（frontmatter なし — 本文冒頭の見出しを参照）')}</p>
  <p class="when"><code>${esc(r.path)}</code></p>
  <details><summary>ルール全文を表示</summary><pre class="md">${esc(r.body)}</pre></details>
</article>`
}

function pluginTable(title, list) {
  const rows = list.items
    .map(
      (it) =>
        `<tr data-search="${ds(`${it.name} ${it.description}`)}"><td><code>${esc(it.name)}</code></td><td>${esc(it.description)}</td></tr>`,
    )
    .join('\n      ')
  return `<h3 style="margin-top:32px">${esc(title)} <span class="badge">${list.count}</span></h3>
  <table>
    <thead><tr><th style="width:32%">名前</th><th>説明</th></tr></thead>
    <tbody>
      ${rows}
    </tbody>
  </table>`
}

// ---- index ----
const indexContent = `
<section class="hero">
  <p style="margin:0;font-size:15px;color:var(--fg)">
    このサイトは、<code>tanstack-start-prose-polish</code> プロジェクトの <code>.claude/</code> 配下にある
    <strong>プロジェクトスコープの Claude Code 設定</strong>（AI アシスタントへの指示・ガードレール・自動化）を、
    実ファイルから解析して可視化したものです。
  </p>
  <p>左のナビゲーションから各カテゴリへ。各項目はサマリ表示で、<strong>「全文を表示」</strong>を開くと元ファイルの全文を確認できます。</p>
</section>

<div class="stats">
  <div class="stat"><div class="big">${SKILLS_COUNT}</div><div class="lbl">Skills（手順書・専門知識）</div></div>
  <div class="stat"><div class="big">${rules.length}</div><div class="lbl">Rules（常時/条件付きガードレール）</div></div>
  <div class="stat"><div class="big">${settingsHooks.length}+${hookScripts.length}</div><div class="lbl">Hooks（settings.json + スクリプト）</div></div>
  <div class="stat"><div class="big">${pAgents.count + pSkills.count + pCommands.count}</div><div class="lbl">ECC Plugin（agents/skills/commands）</div></div>
</div>

<div class="sectlink">
  <a href="./skills.html"><h3>Skills →</h3><p>特定タスクで使う手順書・専門知識。${SKILLS_COUNT} 件を name / description / 全文付きで一覧。</p></a>
  <a href="./rules.html"><h3>Rules →</h3><p>コーディング規約・設計制約のガードレール。${rules.length} 件（common / typescript / web）。</p></a>
  <a href="./hooks.html"><h3>Hooks →</h3><p>編集後フォーマット・lint・規約違反警告・claude-doctor 等の自動化。${settingsHooks.length} 個のフック + ${hookScripts.length} スクリプト。</p></a>
  <a href="./settings.html"><h3>settings.json →</h3><p>env / permissions(deny .env) / hooks / enabledPlugins。設定ファイル全文も収録。</p></a>
  <a href="./plugin.html"><h3>Plugin (ECC) →</h3><p>有効化中の <code>ecc@ecc</code> プラグインが提供する agents/skills/commands の概要。</p></a>
</div>

<section class="card" style="margin-top:28px">
  <div class="card-head"><h3>補足</h3><span class="badge ok">実データ準拠</span></div>
  <p class="desc">既存の <code>docs/claude-code-guide.md</code> は rules を 11 件と記載していますが、現在の実ファイルは <strong>${rules.length} 件</strong>です（このサイトは実ファイルを正とします）。</p>
</section>
`

// ---- rules ----
const rulesContent = `<div class="cards">
${rules.map(ruleCard).join('\n')}
</div>`

// ---- hooks ----
const hookRows = settingsHooks
  .map(
    (h) =>
      `<tr data-search="${ds(`${h.event} ${h.matcher} ${h.purpose}`)}"><td><code>${esc(h.event)}</code></td><td><code>${esc(h.matcher)}</code></td><td>${h.async ? '<span class="badge ok">async</span>' : '—'}</td><td>${esc(h.purpose)}</td></tr>`,
  )
  .join('\n      ')
const scriptCards = hookScripts
  .map(
    (s) =>
      `<article class="card" data-search="${ds(`${s.path} ${s.purpose}`)}">
  <div class="card-head"><h3>${esc(s.path.split('/').pop())}</h3><span class="badge">${esc(s.path)}</span></div>
  <p class="desc">${esc(s.purpose)}</p>
  <details><summary>スクリプト全文を表示</summary><pre class="md">${esc(s.body)}</pre></details>
</article>`,
  )
  .join('\n')
const hooksContent = `
<p class="desc"><code>settings.json</code> の <code>hooks</code> で定義された自動化です。<code>Edit|Write</code> 後に走るチェックと、<code>Stop</code> 時の継続診断があります。</p>
<table>
  <thead><tr><th>イベント</th><th>マッチャ</th><th>実行</th><th>動作</th></tr></thead>
  <tbody>
      ${hookRows}
  </tbody>
</table>
<h3 style="margin-top:32px">フックスクリプト</h3>
<div class="cards">
${scriptCards}
</div>`

// ---- settings ----
const envRows = settings.envVars
  .map((e) => `<tr data-search="${ds(`${e.key} ${e.value}`)}"><td><code>${esc(e.key)}</code></td><td><code>${esc(e.value)}</code></td></tr>`)
  .join('\n      ')
const denyItems = settings.permissionsDeny
  .map((d) => `<tr data-search="${ds(d)}"><td><code>${esc(d)}</code></td></tr>`)
  .join('\n      ')
const pluginItems = settings.enabledPlugins
  .map((p) => `<tr data-search="${ds(p)}"><td><code>${esc(p)}</code></td></tr>`)
  .join('\n      ')
const settingsContent = `
<h3>env</h3>
<table><thead><tr><th style="width:40%">キー</th><th>値</th></tr></thead><tbody>
      ${envRows}
</tbody></table>

<h3 style="margin-top:32px">permissions.deny <span class="badge ok">.env 保護</span></h3>
<table><thead><tr><th>拒否ルール</th></tr></thead><tbody>
      ${denyItems}
</tbody></table>

<h3 style="margin-top:32px">enabledPlugins</h3>
<table><thead><tr><th>プラグイン ID</th></tr></thead><tbody>
      ${pluginItems}
</tbody></table>

<h3 style="margin-top:32px">settings.json 全文</h3>
<div class="cards"><article class="card" data-search="settings json raw">
  <details open><summary>全文を表示 / 折りたたみ</summary><pre class="md">${esc(settings.raw)}</pre></details>
</article></div>`

// ---- plugin ----
const pluginContent = `
<section class="hero">
  <p style="margin:0;color:var(--fg)">有効化中のプラグイン <code>ecc@ecc</code> が提供するエージェント・スキル・コマンドの<strong>概要一覧</strong>です（本文は各プラグイン側に委譲し、ここでは name と説明のみ）。</p>
</section>
<div class="stats">
  <div class="stat"><div class="big">${pAgents.count}</div><div class="lbl">Agents</div></div>
  <div class="stat"><div class="big">${pSkills.count}</div><div class="lbl">Skills</div></div>
  <div class="stat"><div class="big">${pCommands.count}</div><div class="lbl">Commands</div></div>
</div>
${pluginTable('Agents', pAgents)}
${pluginTable('Skills', pSkills)}
${pluginTable('Commands', pCommands)}
`

// ---- assets ----
const CSS = `:root{--bg:#0d1117;--panel:#161b22;--panel2:#1c2330;--border:#30363d;--fg:#e6edf3;--muted:#8b949e;--accent:#58a6ff;--accent2:#7ee787;--badge:#21262d}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Hiragino Kaku Gothic ProN',Meiryo,sans-serif;background:var(--bg);color:var(--fg);line-height:1.65}
a{color:var(--accent);text-decoration:none}
a:hover{text-decoration:underline}
.layout{display:grid;grid-template-columns:260px 1fr;min-height:100vh}
.sidebar{background:var(--panel);border-right:1px solid var(--border);padding:24px 16px;position:sticky;top:0;height:100vh;overflow:auto}
.sidebar h1{font-size:16px;margin:0 0 4px}
.sidebar .sub{color:var(--muted);font-size:12px;margin-bottom:20px;font-family:ui-monospace,Menlo,monospace}
.nav a{display:block;padding:9px 12px;border-radius:8px;color:var(--fg);margin-bottom:4px;font-size:14px}
.nav a:hover{background:var(--panel2);text-decoration:none}
.nav a.active{background:var(--accent);color:#0d1117;font-weight:600}
.nav a .n{float:right;color:var(--muted);font-size:12px}
.nav a.active .n{color:#0d1117}
.main{padding:32px 40px;max-width:1120px}
.page-head h2{margin:0 0 6px;font-size:28px}
.page-head .meta{color:var(--muted);font-size:13px;margin-bottom:20px}
.toolbar{display:flex;gap:10px;align-items:center;margin-bottom:24px;position:sticky;top:0;background:var(--bg);padding:12px 0;z-index:5}
#q{flex:1;padding:10px 14px;border-radius:10px;border:1px solid var(--border);background:var(--panel);color:var(--fg);font-size:14px}
#q:focus{outline:none;border-color:var(--accent)}
.btn{padding:9px 12px;border:1px solid var(--border);background:var(--panel);color:var(--fg);border-radius:8px;cursor:pointer;font-size:13px;white-space:nowrap}
.btn:hover{background:var(--panel2)}
.cards{display:grid;gap:16px}
.card{background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:18px 20px}
.card-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px}
.card-head h3{margin:0;font-size:17px}
.badge{background:var(--badge);border:1px solid var(--border);color:var(--muted);font-size:11px;padding:2px 9px;border-radius:999px;font-family:ui-monospace,Menlo,monospace}
.badge.ok{color:var(--accent2);border-color:#238636}
.desc{margin:0 0 8px}
.explain{margin:0 0 10px;background:rgba(88,166,255,.08);border-left:3px solid var(--accent);padding:9px 12px;border-radius:6px;font-size:14px;line-height:1.6}
.explain strong{color:var(--accent)}
.when{margin:0 0 4px;color:var(--muted);font-size:13px}
details{border-top:1px dashed var(--border);margin-top:10px;padding-top:8px}
summary{cursor:pointer;color:var(--accent);font-size:13px;user-select:none}
summary:hover{text-decoration:underline}
pre.md{background:#0b0f14;border:1px solid var(--border);border-radius:8px;padding:14px;overflow:auto;font-size:12.5px;line-height:1.55;white-space:pre-wrap;word-break:break-word;max-height:560px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
table{width:100%;border-collapse:collapse;font-size:13px;background:var(--panel);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-top:8px}
th,td{text-align:left;padding:10px 12px;border-bottom:1px solid var(--border);vertical-align:top}
th{background:var(--panel2);color:var(--muted);font-weight:600}
tr:last-child td{border-bottom:none}
code{font-family:ui-monospace,Menlo,monospace;background:var(--badge);padding:1px 6px;border-radius:6px;font-size:12px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;margin:24px 0}
.stat{background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:18px}
.stat .big{font-size:30px;font-weight:700;color:var(--accent)}
.stat .lbl{color:var(--muted);font-size:13px;margin-top:4px}
.hero{background:linear-gradient(135deg,#161b22,#1c2330);border:1px solid var(--border);border-radius:16px;padding:26px;margin-bottom:8px}
.hero p{color:var(--muted);margin:10px 0 0}
.sectlink{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px;margin-top:24px}
.sectlink a{background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:18px;color:var(--fg)}
.sectlink a:hover{border-color:var(--accent);text-decoration:none}
.sectlink h3{margin:0 0 6px;color:var(--accent);font-size:16px}
.sectlink p{margin:0;color:var(--muted);font-size:13px}
@media(max-width:820px){.layout{grid-template-columns:1fr}.sidebar{position:static;height:auto}}
`

const APPJS = `(function(){
  function setAll(open){document.querySelectorAll('details').forEach(function(d){d.open=open})}
  document.addEventListener('input',function(e){
    if(e.target&&e.target.id==='q'){
      var q=e.target.value.trim().toLowerCase();
      document.querySelectorAll('[data-search]').forEach(function(el){
        var hit=!q||(el.getAttribute('data-search')||'').indexOf(q)>-1;
        el.style.display=hit?'':'none';
      });
    }
  });
  document.addEventListener('click',function(e){
    if(!e.target)return;
    if(e.target.id==='expand-all')setAll(true);
    if(e.target.id==='collapse-all')setAll(false);
  });
})();
`

// =========================================================
// PHASE 2 — 生成
// Small pages: build deterministically in JS and write verbatim (reliable).
// Skills page: an agent reads all 37 SKILL.md itself and writes the page, so the
// large skill bodies never flow through the script or a giant writer prompt.
// =========================================================
phase('生成')

const files = [
  { name: 'assets/styles.css', content: CSS, kind: 'CSS' },
  { name: 'assets/app.js', content: APPJS, kind: 'JavaScript' },
  { name: 'index.html', content: shell('概要', 'index', indexContent, { noToolbar: true }), kind: 'HTML' },
  { name: 'rules.html', content: shell('Rules', 'rules', rulesContent), kind: 'HTML' },
  { name: 'hooks.html', content: shell('Hooks', 'hooks', hooksContent), kind: 'HTML' },
  { name: 'settings.html', content: shell('settings.json', 'settings', settingsContent), kind: 'HTML' },
  { name: 'plugin.html', content: shell('Plugin (ECC)', 'plugin', pluginContent), kind: 'HTML' },
]

function writePrompt(p) {
  return [
    `Use the Write tool to create a file with EXACTLY the content provided below — byte-for-byte, verbatim.`,
    `Target absolute path: ${OUT}/${p.name}`,
    `File kind: ${p.kind}`,
    'STRICT RULES:',
    '- Write the ENTIRE content between the markers, unchanged.',
    '- Do NOT add, remove, reorder, reformat, escape, unescape, summarize, or "improve" anything.',
    '- Do NOT wrap it in code fences. The file content is the raw bytes between the markers.',
    'After writing, return {path, written:true}. If you could not write, return {path, written:false, note:"reason"}.',
    '----CONTENT START----',
    p.content,
    '----CONTENT END----',
  ].join('\n')
}

// Skills page shell with a placeholder where the cards go (built without bodies).
const skillsShell = shell('Skills', 'skills', SKILLS_PLACEHOLDER)
const skillsPagePrompt = [
  'Build and write the Skills page of an HTML docs site. You will read the skill source files yourself — do NOT expect them in this prompt.',
  '',
  `## Step 1 — read sources`,
  `Read every SKILL.md under these ${SKILLS_COUNT} directories in ${PROJECT}/.claude/skills/:`,
  SKILL_DIRS.join(', '),
  'For each: name = frontmatter `name:` (fallback = directory name); description = frontmatter `description:` (verbatim text); body = the ENTIRE SKILL.md content verbatim, byte-for-byte (frontmatter included). DO NOT summarize or truncate.',
  'Also produce explainJa = a concise 1-2 sentence JAPANESE explanation of what this skill does and when to use it, written for a developer skimming the page. ALWAYS in Japanese, even when the SKILL.md is in English.',
  '',
  '## Step 2 — build cards',
  'Sort skills by `name` ascending. For EACH skill build this exact card markup:',
  '<article class="card" data-search="{SEARCH}">',
  '  <div class="card-head"><h3>{NAME}</h3><span class="badge">{DIR}/</span></div>',
  '  <p class="explain"><strong>解説:</strong> {EXPLAIN_JA}</p>',
  '  <p class="desc">{DESCRIPTION}</p>',
  '  <details><summary>SKILL.md 全文を表示</summary><pre class="md">{BODY}</pre></details>',
  '</article>',
  'HTML-escape {NAME},{DIR},{DESCRIPTION},{BODY},{EXPLAIN_JA} by replacing in order: & -> &amp; , < -> &lt; , > -> &gt; , " -> &quot; .',
  '{SEARCH} = lowercase(name + " " + dir + " " + description + " " + explainJa), then replace " with a space, then HTML-escape.',
  'Join all cards and wrap them in a single <div class="cards"> ... </div>.',
  '',
  '## Step 3 — assemble and write',
  `Take the page template below and replace the token ${SKILLS_PLACEHOLDER} with your <div class="cards">…</div> block. Change NOTHING else in the template.`,
  `Write the result with the Write tool to: ${OUT}/skills.html`,
  '',
  '## Step 4 — self-check',
  `Confirm the written file contains exactly ${SKILLS_COUNT} occurrences of "SKILL.md 全文を表示" and full bodies (not summaries). Return {path, written:true} or {path, written:false, note}.`,
  '',
  '----PAGE TEMPLATE START----',
  skillsShell,
  '----PAGE TEMPLATE END----',
].join('\n')

const writeThunks = files.map((p) => () => agent(writePrompt(p), { label: `write:${p.name}`, phase: '生成', schema: RECEIPT_SCHEMA, agentType: 'general-purpose' }))
writeThunks.push(() => agent(skillsPagePrompt, { label: 'write:skills.html', phase: '生成', schema: RECEIPT_SCHEMA, agentType: 'general-purpose' }))

const receipts = await parallel(writeThunks)

const allOutputs = [...files.map((p) => ({ name: p.name, expectedChars: p.content.length })), { name: 'skills.html', expectedChars: 'agent-built' }]
const report = allOutputs.map((o, i) => ({
  file: `${OUT}/${o.name}`,
  expectedChars: o.expectedChars,
  written: !!(receipts[i] && receipts[i].written),
  note: (receipts[i] && receipts[i].note) || '',
}))

log(`生成完了: ${report.filter((r) => r.written).length}/${report.length} ファイル書き込み`)

return {
  site: OUT,
  entry: `${OUT}/index.html`,
  workflow: '.claude/workflows/claude-code-docs.js',
  totals: {
    skills: SKILLS_COUNT,
    rules: rules.length,
    hooks: settingsHooks.length,
    hookScripts: hookScripts.length,
    pluginAgents: pAgents.count,
    pluginSkills: pSkills.count,
    pluginCommands: pCommands.count,
  },
  report,
}
