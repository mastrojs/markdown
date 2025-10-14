# @mastrojs/markdown

A few simple helper functions to generate HTML from markdown. Just enough to get you started with markdown with [Mastro](https://mastrojs.github.io/).

Uses `micromark` with `micromark-extension-gfm` under the hood.


## Install

### Deno

    deno add jsr:@mastrojs/markdown

### Node.js

    pnpm add jsr:@mastrojs/markdown


## Usage

```ts
import { markdownToHtml } from "@mastrojs/markdown";

const { content, meta } = markdownToHtml(`
---
title: my title
---

hi *there*"
`),
```

To see all functions `@mastrojs/markdown` exports, see its [API docs](https://jsr.io/@mastrojs/markdown/doc).

For a tutorial, read the following chapter in the Mastro Guide: [A static blog from markdown files](https://mastrojs.github.io/guide/static-blog-from-markdown-files/)
