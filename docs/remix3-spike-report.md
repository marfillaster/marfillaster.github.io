# Phase 1 spike report — Remix 3 (beta) on Cloudflare Workers (workerd)

Run 2026-07-18 per `docs/remix3-migration-plan.md` Phase 1. Local `wrangler dev`
only; nothing deployed, blog code untouched. Spike code lived in session
scratch; this report is the durable record.

## Verdict: GO (with minor caveats)

Remix 3 `3.0.0-beta.5` runs on real workerd (`wrangler dev --local` / miniflare)
as a Worker `fetch` handler **with no `nodejs_compat` flag**. SSR HTML, an
interactive `clientEntry()` counter, a JSON API route, and a full
unified + Shiki markdown route all work. Server output is byte-identical
between the Node adapter and workerd. Hydration verified end-to-end (real
`run()` runtime driving SSR HTML in jsdom: counter hydrated and responded to
clicks). Worker bundle: **1100.6 KiB raw / ~212 KiB gzip** — ~7% of the 3 MB
gzip budget, with unified + Shiki + grammars included. No runtime blockers.

## Pinned versions

| Package | Version |
|---|---|
| `remix` (npm tag `next`) | `3.0.0-beta.5` |
| `wrangler` / workerd | `4.112.0` / `1.20260714.1` |
| `esbuild` (client precompile) | `0.27.7` |
| unified / remark-parse / remark-gfm / remark-rehype / rehype-stringify | `11.0.5` / `11.0.0` / `4.0.1` / `11.1.2` / `10.0.1` |
| `shiki` (+ core, engine-javascript) | `4.3.1` |
| Node (control + build) | `v26.5.0` (remix requires `>=24.3.0`) |

`remix` is a thin re-export shim over pinned `@remix-run/*` scoped packages
(`@remix-run/ui@^0.4.0`, `@remix-run/fetch-router@^0.20.1`, …). npm also
carries a legacy `rc: 1.0.0-rc.4` dist-tag — unrelated to 3.x; always install
by exact version.

## Key configuration

**`wrangler.jsonc`** — no compat flags needed:

```jsonc
{
  "name": "remix3-spike",
  "main": "src/worker.ts",
  "compatibility_date": "2025-07-01",
  "assets": { "binding": "ASSETS", "directory": "./public" },
  "version_metadata": { "binding": "CF_VERSION_METADATA" }
}
```

**`tsconfig.json`** — the scaffold's own config works under Wrangler's esbuild
unchanged; the decisive line is `"jsxImportSource": "remix/ui"` (runtime module
`remix/ui/jsx-runtime`, re-exporting `@remix-run/ui/jsx-runtime`) with
`"jsx": "react-jsx"`. JSX only compiles in `.tsx` files under the `node-tsx`
loader — a `.ts` file with JSX throws.

**Client precompile (`build-client.mjs`)** — esbuild, `bundle: true`,
`splitting: true` (shares the remix/ui runtime as one chunk), `format: "esm"`,
`platform: "browser"`, `jsx: "automatic"`, `jsxImportSource: "remix/ui"`,
outputs to the static assets dir.

## Client-entry serving pattern (the crux for workerd)

The guides only show Node's on-demand `createAssetServer()` (`node:fs`-based —
cannot run on workerd). The working replacement:

1. `clientEntry('counter', fn)` with a **stable string id**, not
   `import.meta.url` (URLs collide once entries bundle into one worker).
2. Precompile each entry with esbuild to a static ESM module in the assets dir,
   plus a boot module that calls `run({ loadModule })`.
3. An app-owned `resolveClientEntry(id) → { href, exportName }` map, handed to
   the render middleware; the server emits the hydration marker + a JSON
   payload (`moduleUrl`, `exportName`, props).
4. `/assets/*` served by Workers Assets (`env.ASSETS.fetch`); everything else
   goes to the router.
5. The document references the boot script; `loadModule` dynamic-imports the
   entry and picks the export.

Client JS totals ~23 KB gzip (boot + counter + shared runtime chunk) — far
below the current React/React-DOM payload.

## Failures hit and fixes

1. **JSX in `.ts`** — `node-tsx` parses JSX only in `.tsx`. Rename.
2. **`router.map` type error off the documented path** — calling
   `renderToStream` directly fights the types (compile-time only; runtime
   worked). Fix: the idiomatic render-middleware shape — `renderWith(...)`,
   `declare module 'remix/router' { interface RouterTypes { context: AppContext } }`,
   `createRouter<AppContext>({ middleware: [render(platform)] })`. Deviating
   from the documented middleware pattern fights the type system.
3. **No `dangerouslySetInnerHTML`** — Remix UI has a framework `innerHTML`
   prop (`<main innerHTML={html}/>`); needed for injecting rendered markdown.
4. **jsdom gaps** (Navigation API, some DOM globals) — hydration-harness only,
   stubbed; not a framework or workerd issue.
5. **pnpm/npm `allow-scripts`** may skip esbuild/workerd postinstalls on clean
   CI — approve those install scripts.

## Node vs workerd divergences

- Server HTML: **none** — byte-identical (only the per-render marker hash
  differs).
- Node-only modules (`remix/node-tsx`, `remix/node-fetch-server`,
  `remix/assets`, `remix/response/compress` via `node:zlib`) are simply never
  imported by the worker. The rendering path — `@remix-run/ui`, `fetch-router`,
  `route-pattern`, `headers`, `html-template` — has **zero `node:` imports**.
- `versionId`: workerd reads `env.CF_VERSION_METADATA.id`; Node stubs it.
  Assets: Workers Assets vs `fs`. Dev loop: Node is the genuine no-build path;
  workerd always bundles via Wrangler (platform constraint, plan §0).
- Platform layering (plan §1): clean — `node:` builtins confined to
  `server/node.ts`, `Env` to `src/worker.ts`, app layer Web-API only. The one
  wrinkle (render middleware needing `resolveClientEntry`) resolves by closure
  injection.

## Beta-stability judgment

Moderate and manageable. Solid today: router, `renderToStream`/`renderToString`,
`Handle` components, `clientEntry` + `run()` hydration, `innerHTML`, Web-API-only
rendering — all unmodified on workerd. Churn surface: many pre-1.0
`@remix-run/*` packages move together — pin the exact `remix` version and
re-run this spike at each beta bump and at RC; the strict typing off the
middleware path and our (unblessed but small) string-id client-entry convention
are the things to re-check. First `/md` render ~90 ms (Shiki init), then
edge-cacheable.

**Recommendation: Phases 2+ are unblocked by the runtime question.** Timing per
the plan still applies — hold for RC/stable unless deliberately proceeding on
the pinned beta.
