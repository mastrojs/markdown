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
  meta: Record<string, string | undefined>;
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
 * Serve a folder on the local filesystem containing potentially deeply nested markdown files,
 * and convert them to `Html` and metadata.
 *
 * Place the following in e.g. `routes/[...slug].server.js`
 *
 * ```ts
 * import { serveMarkdownFolder } from "@mastrojs/markdown";
 * import { html, htmlToResponse } from "@mastrojs/mastro";
 *
 * export const { GET, getStaticPaths } = serveMarkdownFolder(
 *   {
 *     folder: "data",
 *   },
 *   ({ content, meta }, req) => {
 *     return htmlToResponse(html`
 *       <!DOCTYPE html>
 *       <title>${meta.title}</title>
 *       <main>${content}</main>
 *     `);
 *   }
 * }
 * ```
 *
 * Then, make sure to access the route with URLs having a trailing slash.
 *
 * With the above example, the URL `/blog/hello-world/` will read out the file
 * `data/blog/hello-world.md`, and the URL `/` will read out the file `data/index.md`.
 *
 * Unless a `mdToHtml` function is passed as part of the first argument,
 * `micromark` is used to parse GFM with YAML frontmatter.
 */
export const serveMarkdownFolder = (
  opts: {
    folder: string;
    mdToHtml?: (md: string) => Promise<Md> | Md;
  },
  renderFn: (convertedMd: Md, req: Request) => Promise<Response> | Response,
): {
  GET: (req: Request) => Promise<Response>;
  getStaticPaths: () => Promise<string[]>;
} => {
  const { folder, mdToHtml = markdownToHtml } = opts;

  const GET = async (req: Request) => {
    let { pathname } = new URL(req.url);
    if (!pathname.endsWith("/")) {
      const err = Error("NotFound: path must end with a /");
      err.name = "NotFound";
      throw err;
    }
    pathname = pathname.slice(0, -1);
    pathname = pathname.startsWith("/") ? pathname : "/" + pathname;
    let txt;
    try {
      txt = await readTextFile(folder + pathname + ".md");
    } catch (e: unknown) {
      if (e instanceof Error && "code" in e && e.code === "ENOENT") {
        txt = await readTextFile(folder + pathname + "/index.md");
      } else {
        throw e;
      }
    }
    const converted = await mdToHtml(txt);
    return renderFn(converted, req);
  };

  const getStaticPaths = async () => {
    const files = await findFiles(folder + "/**/*.md");
    const l = folder.length;
    return files.map((file) =>
      file.endsWith("/index.md") ? file.slice(l, -8) : file.slice(l, -3) + "/"
    );
  };

  return { GET, getStaticPaths };
};

/**
 * Converts a string possibly containing yaml frontmatter to a `{ meta, body }` object.
 *
 * - `meta` is an object with the parsed yaml.
 * - `body` is a string with the rest of the input.
 */
export const parseYamlFrontmatter = (
  md: string,
): { body: string; meta: Record<string, string | undefined> } => {
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
