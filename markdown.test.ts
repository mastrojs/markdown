import { assertEquals } from "@std/assert"
import { markdownToHtml } from "./markdown.ts";

Deno.test("markdownToHtml", () => {
  assertEquals(
    markdownToHtml("hi *there*"),
    {
      content: new String("<p>hi <em>there</em></p>"),
      meta: {},
    },
  );

  assertEquals(
    markdownToHtml("---\ntitle: go\n---\nhi *there*"),
    {
      content: new String("<p>hi <em>there</em></p>"),
      meta: { title: "go" },
    },
  );
});
