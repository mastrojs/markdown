# @mastrojs/markdown

A few simple helper functions to generate HTML from markdown. Just enough to get you started with markdown with [Mastro](https://mastrojs.github.io/).

By default, it uses `micromark` with `micromark-extension-gfm` under the hood.

Validate YAML frontmatter by bringing your own [Standard Schema](https://standardschema.dev/)-compliant validation library (e.g. [Zod](https://zod.dev), [Valibot](https://valibot.dev) or [validate.js](https://github.com/jakelazaroff/validate.js)).


## Install

The easiest way to get started is to [install Mastro](https://mastrojs.github.io/#powerful-for-experienced-developers) and select the "blog" template. Alternatively:

### Deno

    deno add jsr:@mastrojs/markdown

### Node.js

    pnpm add jsr:@mastrojs/markdown

### Bun

    bunx jsr add @mastrojs/markdown


## Usage

```ts
import { renderToString } from "@mastrojs";
import { markdownToHtml } from "@mastrojs/markdown";

const { content, meta } = await markdownToHtml(`
---
title: my title
---

hi *there*
`);

const htmlStr = await renderToString(content);
```

In addition to [`markdownToHtml(inputStr, opts)`](https://jsr.io/@mastrojs/markdown/doc/~/markdownToHtml), there is:

- [`readMarkdownFile(filePath, opts)`](https://jsr.io/@mastrojs/markdown/doc/~/readMarkdownFile)
- [`readMarkdownFiles(globPattern, opts)`](https://jsr.io/@mastrojs/markdown/doc/~/readMarkdownFiles)
- [`serveMarkdownFolder(opts, renderFn)`](https://jsr.io/@mastrojs/markdown/doc/~/serveMarkdownFolder)

For a tutorial, read the chapter [A static blog from markdown files](https://mastrojs.github.io/guide/static-blog-from-markdown-files/) in the Mastro Guide.

### Options

#### Parse

Use the `parse` option to supply either a [Micromark options object](https://github.com/micromark/micromark/blob/main/packages/micromark/readme.md#options):

```ts
markdownToHtml(input, { parse: { allowDangerousHtml: true } });
```

or a custom markdown-to-HTML function:

```ts
import markdownIt from "markdown-it";
markdownToHtml(input, { parse: markdownIt.render });
```

#### Schema

The default TypeScript type for the YAML metadata is `Record<string, unknown>`, but you can override that with e.g. `readMarkdownFile<{title: string}>("post.md")`. But to actually verify the metadata is correct, you should use a schema. For example using [validate.js](https://github.com/jakelazaroff/validate.js):

```ts
import { object, string } from "./validate.js";
const schema = object({
  title: string,
});
const { content, meta } = await markdownToHtml(input, { schema }),
```
