# The Flow Labs — website

Single-page marketing site for **The Flow Labs**.
Websites · AI · Automation · Software.

## Stack

Plain HTML, CSS and a sprinkle of vanilla JS. No build step, no dependencies.

```
index.html          the whole site (styles + script inline)
assets/             work screenshots used in the Work section
_design/            source mockups the screenshots were rendered from
.nojekyll           tells GitHub Pages to serve files as-is
```

## Run locally

Open `index.html` in a browser. That's it.

## Deploy (GitHub Pages)

1. Repo → **Settings** → **Pages**
2. Source: *Deploy from a branch* → `main` → `/ (root)`
3. Save. Live at `https://<user>.github.io/Flow-Labs/`

Custom domain later: add a `CNAME` file containing the domain, and point a
`CNAME` DNS record at `<user>.github.io`.

## Editing

- **Content** — text lives directly in `index.html`, grouped by section
  (`#work`, `#services`, `#process`, `#contact`).
- **Work screenshots** — drop a 1440×900 PNG into `assets/` and point an
  `<img src="assets/...">` at it.
- **Colours / spacing** — the `:root` block at the top of the `<style>` tag.

## Contact

- Email: theflowlabs01@gmail.com
- Instagram: [@the.flow.labs](https://www.instagram.com/the.flow.labs/)
