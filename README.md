# kmpkt-docs

Documentation website for [kmpkt](https://github.com/kmpktio/kmpkt), built with [VitePress](https://vitepress.dev/).

Markdown guides are synced at build time from `kmpktio/kmpkt` (`docs/*.md`) via `scripts/sync-docs.mjs`.

## Local Development

```bash
npm install
npm run dev
```

If `../kmpkt/docs` exists locally, `npm run sync` reads from it directly; otherwise it performs a shallow clone of `https://github.com/kmpktio/kmpkt.git`.

## Build

```bash
npm run build
```
