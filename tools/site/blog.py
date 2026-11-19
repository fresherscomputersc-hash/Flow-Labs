# -*- coding: utf-8 -*-
"""Markdown blog pipeline for the static site build.

A post is one file in `blog-src/` with a small frontmatter block:

    ---
    title: Why We Quote Before We Code | The Flow Labs
    description: One or two sentences. Used as the meta description and the
      card copy on /blog/.
    date: 2026-11-19
    slug: why-we-quote-before-we-code
    h1: Why we quote before we code
    subtitle: One line under the headline.
    pill: Founder-written · 2026
    crumb: Why we quote before we code
    headline: Why We Quote Before We Code
    cta_h2: Want a fixed quote before any code?
    cta_p: Tell us what you need. We scope it, price it, then build it.
    draft: false
    ---

    The body is ordinary Markdown: paragraphs, ## headings, - lists,
    1. numbered lists, **bold**, *italic*, `code`, [links](/contact/) and
    ![images](/assets/blog/shot.png).

Every key except `title` and `description` is optional: `slug` falls back to
the filename, `h1`/`crumb` to `title`, `date` to the build date, and the CTA
block is skipped when `cta_h2` is empty. Set `draft: true` to keep a post out
of the build without deleting it.

Only the Markdown subset above is supported on purpose. Raw HTML in a post is
escaped, not executed, so a stray tag can never break the page.
"""
from __future__ import annotations

import html as _html
import io
import os
import re

SUPPORTED_EXT = (".md", ".markdown")
# Files that are documentation for the folder, never posts.
IGNORED_NAMES = ("readme.md", "readme.markdown", "index.md")

HEADING_RX = re.compile(r"^(#{2,4})\s+(.*)$")
UL_RX = re.compile(r"^[-*+]\s+(.*)$")
OL_RX = re.compile(r"^\d+[.)]\s+(.*)$")
HR_RX = re.compile(r"^(?:-{3,}|\*{3,}|_{3,})$")
FENCE_RX = re.compile(r"^```")


def slugify(value):
    value = str(value or "").strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or "post"


def _truthy(value):
    return str(value or "").strip().lower() in ("1", "true", "yes", "on")


def _unquote(value):
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
        return value[1:-1]
    return value


def parse_frontmatter(raw):
    """Return (meta dict, body string). Missing frontmatter is not an error."""
    text = raw.replace("\r\n", "\n").replace("\r", "\n")
    if not text.lstrip().startswith("---"):
        return {}, text

    lines = text.split("\n")
    start = 0
    while start < len(lines) and not lines[start].strip():
        start += 1
    if lines[start].strip() != "---":
        return {}, text

    meta = {}
    end = None
    for i in range(start + 1, len(lines)):
        line = lines[i]
        if line.strip() == "---":
            end = i
            break
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        # Block scalars are handy for long descriptions.
        meta[key.strip().lower()] = _unquote(value)

    if end is None:
        return {}, text
    body = "\n".join(lines[end + 1:]).strip("\n")
    return meta, body


def _inline(text):
    """Escape, then apply the inline subset. Order matters."""
    out = _html.escape(text, quote=False)

    stashed = []

    def keep_code(match):
        stashed.append("<code>" + match.group(2) + "</code>")
        return "\x00%d\x00" % (len(stashed) - 1)

    out = re.sub(r"(`+)(.+?)\1", keep_code, out)

    def image(match):
        alt = match.group(1).replace('"', "&quot;")
        src = match.group(2).replace('"', "&quot;")
        return '<img src="%s" alt="%s" loading="lazy" decoding="async">' % (src, alt)

    out = re.sub(r"!\[([^\]]*)\]\(([^)\s]+)\)", image, out)

    def link(match):
        label, href = match.group(1), match.group(2)
        attrs = ""
        if re.match(r"^(?:https?:)?//", href):
            attrs = ' target="_blank" rel="noopener"'
        return '<a href="%s"%s>%s</a>' % (href.replace('"', "&quot;"), attrs, label)

    out = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", link, out)
    out = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", out)
    out = re.sub(r"(?<![\w*])\*(?!\s)([^*]+?)(?<!\s)\*(?![\w*])", r"<em>\1</em>", out)

    return re.sub(r"\x00(\d+)\x00", lambda m: stashed[int(m.group(1))], out)


def _is_block_start(line):
    stripped = line.strip()
    if not stripped:
        return True
    return bool(
        FENCE_RX.match(stripped)
        or HEADING_RX.match(stripped)
        or UL_RX.match(stripped)
        or OL_RX.match(stripped)
        or HR_RX.match(stripped)
        or stripped.startswith(">")
    )


def _collect_items(lines, index, marker_rx):
    items = []
    i = index
    total = len(lines)
    while i < total:
        match = marker_rx.match(lines[i].strip())
        if not match:
            break
        items.append(match.group(1).strip())
        i += 1
        # Indented continuation lines belong to the previous item.
        while i < total:
            nxt = lines[i]
            if not nxt.strip():
                break
            if marker_rx.match(nxt.strip()) or _is_block_start(nxt):
                break
            if nxt.startswith((" ", "\t")):
                items[-1] = items[-1] + " " + nxt.strip()
                i += 1
                continue
            break
    return items, i


def render_markdown(text):
    """Render the supported Markdown subset to HTML."""
    lines = str(text or "").replace("\r\n", "\n").replace("\r", "\n").split("\n")
    blocks = []
    i = 0
    total = len(lines)

    while i < total:
        line = lines[i]
        stripped = line.strip()

        if not stripped:
            i += 1
            continue

        if FENCE_RX.match(stripped):
            language = stripped[3:].strip()
            i += 1
            buffer = []
            while i < total and not FENCE_RX.match(lines[i].strip()):
                buffer.append(lines[i])
                i += 1
            i += 1
            attr = ' class="language-%s"' % _html.escape(language) if language else ""
            blocks.append("<pre><code%s>%s</code></pre>"
                          % (attr, _html.escape("\n".join(buffer))))
            continue

        if HR_RX.match(stripped):
            blocks.append("<hr>")
            i += 1
            continue

        heading = HEADING_RX.match(stripped)
        if heading:
            level = len(heading.group(1))
            blocks.append("<h%d>%s</h%d>" % (level, _inline(heading.group(2)), level))
            i += 1
            continue

        if stripped.startswith(">"):
            buffer = []
            while i < total and lines[i].strip().startswith(">"):
                buffer.append(lines[i].strip().lstrip(">").strip())
                i += 1
            blocks.append("<blockquote><p>%s</p></blockquote>" % _inline(" ".join(buffer)))
            continue

        if UL_RX.match(stripped):
            items, i = _collect_items(lines, i, UL_RX)
            blocks.append("<ul>%s</ul>" % "".join("<li>%s</li>" % _inline(it) for it in items))
            continue

        if OL_RX.match(stripped):
            items, i = _collect_items(lines, i, OL_RX)
            blocks.append("<ol>%s</ol>" % "".join("<li>%s</li>" % _inline(it) for it in items))
            continue

        paragraph = []
        while i < total and not _is_block_start(lines[i]):
            paragraph.append(lines[i].strip())
            i += 1
        if paragraph:
            blocks.append("<p>%s</p>" % _inline(" ".join(paragraph)))

    return "\n".join(blocks)


def load_posts(directory, default_date):
    """Read every post file, skip drafts, newest first."""
    posts = []
    if not os.path.isdir(directory):
        return posts

    for name in sorted(os.listdir(directory)):
        if not name.lower().endswith(SUPPORTED_EXT):
            continue
        if name.lower() in IGNORED_NAMES or name.startswith(("_", ".")):
            continue
        path = os.path.join(directory, name)
        with io.open(path, encoding="utf-8") as handle:
            raw = handle.read()

        meta, body = parse_frontmatter(raw)
        if _truthy(meta.get("draft")):
            continue

        title = meta.get("title") or name
        slug = meta.get("slug") or slugify(name.rsplit(".", 1)[0])
        headline = meta.get("headline") or title.split(" | ")[0]
        h1 = meta.get("h1") or headline
        date = meta.get("date") or default_date

        posts.append({
            "file": name,
            "slug": slug,
            "path": "/blog/" + slug + "/",
            "title": title,
            "description": meta.get("description") or "",
            "og_title": meta.get("og_title") or headline,
            "card": meta.get("card") or headline,
            "headline": headline,
            "h1": h1,
            "pill": meta.get("pill") or "",
            "crumb": meta.get("crumb") or h1,
            "subtitle": meta.get("subtitle") or "",
            "cta_h2": meta.get("cta_h2") or "",
            "cta_p": meta.get("cta_p") or "",
            "date": date,
            "body": body,
        })

    posts.sort(key=lambda p: (p["date"], p["slug"]), reverse=True)
    return posts


def to_page(post, cta):
    """Turn one post into the page dict build.py's emit() expects."""
    crumbs = [("/", "Home"), ("/blog/", "Blog"), (None, post["crumb"])]
    hero = (crumbs, post["pill"], post["h1"], post["subtitle"])
    body = ('<section><div class="wrap"><div class="prose">'
            + render_markdown(post["body"])
            + '</div></div></section>')
    if post["cta_h2"]:
        body += cta(post["cta_h2"], post["cta_p"])
    return dict(path=post["path"], title=post["title"],
                og_title=post["og_title"], description=post["description"],
                crumbs=crumbs, hero=hero, body=body,
                article={"headline": post["headline"], "date": post["date"]})


def to_pages(posts, cta):
    return [to_page(post, cta) for post in posts]
