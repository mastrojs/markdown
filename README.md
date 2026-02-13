# @mastrojs/markdown

A few simple helper functions to generate HTML from markdown. Just enough to get you started with markdown with [Mastro](https://mastrojs.github.io/).

By default, it uses `micromark` with `micromark-extension-gfm` under the hood.

Validate YAML frontmatter by bringing your own [Standard Schema](https://standardschema.dev/)-compliant validation library (e.g. [Zod](https://zod.dev), [Valibot](https://valibot.dev) or [validate.js](https://github.com/jakelazaroff/validate.js)).


## Install

### Deno

    deno add jsr:@mastrojs/markdown

### Node.js

    pnpm add jsr:@mastrojs/markdown

### Bun

    bunx jsr add @mastrojs/markdown


## Usage

```ts
import { markdownToHtml } from "@mastrojs/markdown";

const { content, meta } = await markdownToHtml(`
---
title: my title
---

hi *there*
`),
```

To see all functions `@mastrojs/markdown` exports, see its [API docs](https://jsr.io/@mastrojs/markdown/doc).

For a tutorial, read the following chapter in the Mastro Guide: [A static blog from markdown files](https://mastrojs.github.io/guide/static-blog-from-markdown-files/)
