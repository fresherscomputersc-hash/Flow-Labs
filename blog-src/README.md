# Blog source

Every post on the site is one Markdown file in this folder. The build turns
each file into `/blog/<slug>/` using the same page shell as the rest of the
site — header, footer, canonical, OpenGraph tags, `Article` JSON-LD, sitemap
entry, and the card on `/blog/`.

Renderer: `tools/site/blog.py`. It is stdlib-only, like the rest of the build.

## Write a post

1. Copy an existing file, rename it to the slug you want
   (`why-we-quote-before-we-code.md`).
2. Fill in the frontmatter and write the body in Markdown.
3. Preview locally: `python tools/site/build.py`, then open
   `blog/<slug>/index.html`.
4. Commit and push. Vercel rebuilds the site.

Use `draft: true` to keep a half-written post in the folder without shipping
it. Drafts are skipped by the build.

Files named `README.md`, `index.md`, or starting with `_` or `.` are ignored, so
documentation and notes can live in this folder.

## Frontmatter

Everything except `title` and `description` is optional.

| Key | Used for | Falls back to |
| :--- | :--- | :--- |
| `title` | `<title>` and the OpenGraph title | filename |
| `description` | Meta description and the card copy on `/blog/` | empty |
| `date` | `Article.datePublished` and sort order (newest first) | build date (`YEAR` in `build.py`) |
| `slug` | URL: `/blog/<slug>/` | slugified filename |
| `h1` | The `<h1>` on the post | `headline` |
| `subtitle` | Line under the headline | empty |
| `pill` | Small label above the headline, e.g. `Founder-written · 2026` | empty (pill hidden) |
| `crumb` | Breadcrumb label after "Blog" | `h1` |
| `headline` | `Article.headline` in JSON-LD and the card heading | `title` minus ` | The Flow Labs` |
| `card` | Heading on the `/blog/` index card | same as `headline` |
| `og_title` | OpenGraph title when it should differ from `title` | `headline` |
| `cta_h2` / `cta_p` | Closing call-to-action block | block omitted |
| `draft` | `true` / `yes` / `1` hides the post | `false` |

Keep `title` under ~60 characters where you can. The site appends
` | The Flow Labs` in the existing posts, so put the suffix in the value
yourself if you want it.

## Supported Markdown

Deliberately small. Anything outside this list renders as plain text.

- Paragraphs, one blank line between blocks. Wrapped lines are joined.
- `## Heading` and `### Heading` (`####` also works). No `#`, the `h1` comes
  from frontmatter.
- `- item` / `* item` / `+ item` for unordered lists, with indented
  continuation lines.
- `1. item` / `1) item` for ordered lists.
- `**bold**`, `*italic*`, `` `inline code` ``
- `[label](/internal/path/)` and `[label](https://external.example)` — external
  links automatically get `target="_blank" rel="noopener"`.
- `![alt text](/assets/blog/name.png)` — rendered lazy-loaded. Alt text is
  required in practice; write it.
- `> a pull quote` for a blockquote.
- ```` ``` ```` fences for code blocks (optional language for the class name).
- `---` on its own line for a horizontal rule.

Raw HTML is escaped, not executed. A stray `<div>` shows up as text instead of
breaking the page. That is on purpose.

## Images

Put files in `assets/blog/` and reference them with a root-relative path:

```md
![Flow HQ content editor](/assets/blog/flow-hq-content.png)
```

Keep them under ~200 KB and around 1200px wide. Nothing resizes them for you.

## Things to check before publishing

- `python tools/site/build.py` prints `generated N pages` with no traceback.
- `python tools/site/check_cms_keys.py` still prints `all CMS and section keys resolve`.
- The post appears on `/blog/`, newest first.
- `sitemap.xml` contains the new URL.
- `/blog/<slug>/` opens and the CTA at the bottom points where you intend.
