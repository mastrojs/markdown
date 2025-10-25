/**
 * Module with helper function to generate HTML from markdown.
 * Uses `micromark` with `micromark-extension-gfm` under the hood.
 * @module
 */

import { findFiles, type Html, readTextFile, unsafeInnerHtml } from "@mastrojs/mastro";
import jsYaml from "js-yaml";
import { micromark, type Options } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";

// from https://github.com/dworthen/js-yaml-front-matter/blob/master/src/index.js#L14
const yamlFrontRe = /^(-{3}(?:\n|\r)([\w\W]+?)(?:\n|\r)-{3})?([\w\W]*)*/;

/**
 * Return type containing the generated HTML and the YAML metadata.
 */
export interface Md {
  content: Html;
  meta: Record<string, string>;
}

/**
 * Convert a markdown string (GFM with YAML frontmatter metadata) to an `Html` node
 * and an object for the metadata.
 */
export const markdownToHtml = (md: string, opts?: Options): Md => {
  const { body, meta } = parseYamlFrontmatter(md);
  const content = unsafeInnerHtml(
    micromark(body, {
      extensions: [gfm()],
      htmlExtensions: [gfmHtml()],
      ...opts,
    }),
  );
  return { content, meta };
};

/**
 * Read a file from the local filesystem and convert its markdown contents
 * to an `Html` node and an object for the metadata.
 *
 * Unless a `mdToHtml` function is passed, `micromark` is used to parse GFM with YAML frontmatter.
 */
export const readMarkdownFile = async (
  path: string,
  mdToHtml: (md: string) => Promise<Md> | Md = markdownToHtml,
): Promise<Md> => mdToHtml(await readTextFile(path));

/**
 * Read all files from the local filesystem that match the supplied glob pattern,
 * (via `findFiles`) and convert their markdown contents to `Html` nodes and objects for their metadata.
 *
 * Unless a `mdToHtml` function is passed, `micromark` is used to parse GFM with YAML frontmatter.
 */
export const readMarkdownFiles = async (
  pattern: string,
  mdToHtml: (md: string) => Promise<Md> | Md = markdownToHtml,
): Promise<Array<Md & { path: string }>> => {
  const paths = await findFiles(pattern);
  return Promise.all(
    paths.map(async (path, i) => {
      const file = await readTextFile(path);
      const md = await mdToHtml(file);
      return { path: paths[i], ...md };
    }),
  );
};

/**
 * Read a single markdown file, potentially deeply nested in `folder` on the local filesystem,
 * and convert its contents to an `Html` node and an object for the metadata.
 *
 * ```js
 * readMarkdownFileInFolder("data", "/blog/hello-world/"); // reads data/blog/hello-world.md
 * readMarkdownFileInFolder("data", "/"); // reads data/index.md
 * ```
 *
 * Intended use-case is to serve a nested folder structure with markdown files.
 * Place the following in e.g. `routes/[...slug].server.js` and make sure you access
 * the route with URLs having a trailing slash.
 *
 * ```js
 * const { pathname } = new URL(req.url);
 * const { content, meta } = await readMarkdownFileInFolder("data", pathname);
 * ```
 *
 * Unless a `mdToHtml` function is passed, `micromark` is used to parse GFM with YAML frontmatter.
 */
export const readMarkdownFileInFolder = async (
  folder: string,
  path: string,
  mdToHtml: (md: string) => Promise<Md> | Md = markdownToHtml,
): Promise<Md> => {
  if (!path.endsWith("/")) {
    const err = Error("NotFound: path must end with a /");
    err.name = "NotFound";
    throw err;
  }
  path = path.slice(0, -1);
  path = path.startsWith("/") ? path : "/" + path;
  let txt;
  try {
    txt = await readTextFile(folder + path + ".md");
  } catch (e: unknown) {
    if (e instanceof Error && "code" in e && e.code === "ENOENT") {
      txt = await readTextFile(folder + path + "/index.md");
    } else {
      throw e;
    }
  }
  return mdToHtml(txt);
};

/**
 * Converts a string possibly containing yaml frontmatter to a `{ meta, body }` object.
 *
 * - `meta` is an object with the parsed yaml.
 * - `body` is a string with the rest of the input.
 */
export const parseYamlFrontmatter = (
  md: string,
): { body: string; meta: Record<string, string> } => {
  let meta = {};
  let body = md;
  const results = yamlFrontRe.exec(md);
  try {
    const yaml = results?.[2];
    if (yaml) {
      const metaObj = jsYaml.load(yaml, { schema: jsYaml.JSON_SCHEMA });
      if (typeof metaObj === "object" && !(metaObj instanceof Array)) {
        body = results?.[3] || "";
        meta = metaObj;
      }
    }
  } catch (e) {
    console.warn("Could not parse YAML", (e as Error).message);
  }
  return { body, meta };
};
