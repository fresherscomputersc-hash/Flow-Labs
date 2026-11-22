# -*- coding: utf-8 -*-
"""Where blog posts come from.

Two sources, one shape:

* **Supabase** (production): published rows from `site_blog_posts`, written by
  Flow HQ. Used whenever `SUPABASE_URL` and a key are present in the build
  environment.
* **`blog-src/*.md`** (fallback): the original markdown files, used locally and
  by anyone who runs the build without credentials.

Both end up as the same dict that `blog.to_pages()` already understands, so the
renderer never needs to know which one it got.
"""
from __future__ import annotations

import json
import os
import urllib.error
import urllib.request

import blog

TABLE = "site_blog_posts"


def _first_env(*names):
    for name in names:
        value = (os.environ.get(name) or "").strip()
        if value:
            return value
    return ""


def supabase_config():
    """Base URL + key for the read side of the build, or (None, None)."""
    url = _first_env("SUPABASE_URL", "SUPABASE_REST_URL").rstrip("/")
    key = _first_env(
        "SUPABASE_SERVICE_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
        "SUPABASE_ANON_KEY",
    )
    if not url or not key:
        return None, None
    if "yourproject" in url.lower():
        return None, None
    return url, key


def _fetch(url, key, timeout=20):
    query = "?" + "&".join([
        "select=*",
        "status=eq.published",
        "order=published_at.desc.nullslast,created_at.desc",
    ])
    request = urllib.request.Request(
        url + "/rest/v1/" + TABLE + query,
        headers={
            "apikey": key,
            "Authorization": "Bearer " + key,
            "Accept": "application/json",
        },
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


def _date_only(value, default_date):
    text = str(value or "").strip()
    if len(text) >= 10 and text[4] == "-" and text[7] == "-":
        return text[:10]
    return default_date


def _row_to_post(row, default_date):
    title = (row.get("title") or "").strip()
    slug = (row.get("slug") or "").strip() or blog.slugify(title)
    headline = title.split(" | ")[0]
    h1 = (row.get("h1") or "").strip() or headline
    return {
        "file": "supabase:" + slug,
        "slug": slug,
        "path": "/blog/" + slug + "/",
        "title": title,
        "description": (row.get("description") or "").strip(),
        "og_title": headline,
        "card": (row.get("description") or headline).strip(),
        "headline": headline,
        "h1": h1,
        "pill": (row.get("pill") or "").strip(),
        "crumb": (row.get("crumb") or "").strip() or h1,
        "subtitle": (row.get("subtitle") or "").strip(),
        "cta_h2": (row.get("cta_h2") or "").strip(),
        "cta_p": (row.get("cta_p") or "").strip(),
        "date": _date_only(row.get("published_at") or row.get("created_at"), default_date),
        "body": row.get("body") or "",
    }


def load_posts(directory, default_date):
    """Published posts, newest first. Supabase wins when configured."""
    url, key = supabase_config()
    if url and key:
        try:
            rows = _fetch(url, key)
        except (urllib.error.URLError, urllib.error.HTTPError, ValueError, OSError) as exc:
            # A broken/renamed table must never take the whole site down.
            print("WARNING: could not read %s (%s); falling back to blog-src/" % (TABLE, exc))
        else:
            posts = [_row_to_post(row, default_date) for row in rows if row.get("title")]
            posts = [p for p in posts if p["slug"]]
            posts.sort(key=lambda p: (p["date"], p["slug"]), reverse=True)
            print("blog: %d published post(s) from Supabase" % len(posts))
            return posts

    posts = blog.load_posts(directory, default_date)
    if os.environ.get("VERCEL"):
        print("WARNING: no Supabase credentials in this build, so blog-src/ was used. "
              "Set SUPABASE_URL and SUPABASE_ANON_KEY or edits made in Flow HQ will not appear.")
    print("blog: %d post(s) from blog-src/" % len(posts))
    return posts
