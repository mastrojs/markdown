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

In addition to [`markdownToHtml(inputStr, opts)`](https://jsr.io/@mastrojs/markdown/doc/~/markdownToHtml), there are utility functions for use with Mastro:

- [`readMarkdownFile(filePath, opts)`](https://jsr.io/@mastrojs/markdown/doc/~/readMarkdownFile)
- [`readMarkdownFiles(globPattern, opts)`](https://jsr.io/@mastrojs/markdown/doc/~/readMarkdownFiles)
- [`serveMarkdownFolder(opts, renderFn)`](https://jsr.io/@mastrojs/markdown/doc/~/serveMarkdownFolder)

### Options

Use the `parse` option to supply either a [Micromark options object](https://github.com/micromark/micromark/blob/main/packages/micromark/readme.md#options):

```ts
markdownToHtml(input, { parse: { allowDangerousHtml: true } });
```

or a custom markdown-to-HTML function:

```ts
import markdownIt from "markdown-it";
markdownToHtml(input, { parse: markdownIt.render });
```

Use a schema to validate the YAML frontmatter. For example using [validate.js](https://github.com/jakelazaroff/validate.js):

```ts
import { object, string } from "./validate.js";
const schema = object({
  title: string,
});
const { content, meta } = await markdownToHtml(input, { schema }),
```

To see all functions `@mastrojs/markdown` exports, see its [API docs](https://jsr.io/@mastrojs/markdown/doc).

For a tutorial, read the following chapter in the Mastro Guide: [A static blog from markdown files](https://mastrojs.github.io/guide/static-blog-from-markdown-files/)
