(function () {
  'use strict';

  var cfg = window.SITE_CONFIG ? window.SITE_CONFIG.supabase : null;
  if (!cfg || !cfg.url || !cfg.anonKey || !window.supabase) return;

  var db = window.supabase.createClient(cfg.url, cfg.anonKey);

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getQueryParam(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
  }

  async function init() {
    var previewSlug = getQueryParam('preview');
    var postSlug = getQueryParam('post');

    if (previewSlug) {
      await renderDraftPreview(previewSlug);
    } else if (postSlug) {
      await renderDynamicPost(postSlug);
    } else {
      await loadLiveBlogFeed();
    }
  }

  /* ---------------- Live Index Feed (<5s after publish) ---------------- */
  async function loadLiveBlogFeed() {
    var grid = document.querySelector('.mini-grid');
    if (!grid) return;

    try {
      var res = await db.from('site_blog_posts')
        .select('slug, title, description, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (res.error || !res.data || !res.data.length) return;

      var posts = res.data;
      // Re-render mini-grid with all live published posts from Supabase
      grid.innerHTML = posts.map(function (post) {
        var url = '/blog/' + esc(post.slug) + '/';
        return '<div class="mini reveal visible">' +
          '<h4><a href="' + url + '" style="color:inherit;text-decoration:none">' + esc(post.title) + '</a></h4>' +
          '<p>' + esc(post.description || '') + '</p>' +
          '<p style="margin-top:10px"><a href="' + url + '">Read →</a></p>' +
          '</div>';
      }).join('');
    } catch (_) {
      /* Keep static fallback if network or db fails */
    }
  }

  /* ---------------- Draft Preview ---------------- */
  async function renderDraftPreview(slug) {
    var main = document.getElementById('top') || document.querySelector('main');
    if (!main) return;

    var res = await db.from('site_blog_posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (res.error || !res.data) {
      main.innerHTML = '<div class="wrap" style="padding:60px 0;text-align:center;">' +
        '<h1>Draft Not Found</h1>' +
        '<p style="color:var(--muted);margin-top:10px;">The draft post could not be loaded. Ensure you are signed in to Flow HQ.</p>' +
        '<p style="margin-top:20px;"><a href="/blog/" class="btn btn-primary">Return to Blog</a></p>' +
        '</div>';
      return;
    }

    var post = res.data;
    document.title = (post.title || 'Draft Preview') + ' | The Flow Labs';

    main.innerHTML =
      '<div style="background:#F59E0B;color:#000;font-weight:600;font-size:0.85rem;padding:0.75rem 1.5rem;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:999;">' +
        '<span>⚠️ <strong>DRAFT PREVIEW:</strong> This post is unlisted and not yet published.</span>' +
        '<a href="/flow-hq/#blog" style="color:#000;text-decoration:underline;">Return to Editor &rarr;</a>' +
      '</div>' +
      '<div class="page-hero"><div class="wrap">' +
        '<div class="crumbs"><a href="/">Home</a> <span aria-hidden="true">›</span> <a href="/blog/">Blog</a> <span aria-hidden="true">›</span> <span>' + esc(post.crumb || post.title) + '</span></div>' +
        (post.pill ? '<span class="pill"><span class="dot"></span> <span>' + esc(post.pill) + '</span></span>' : '') +
        '<h1>' + (post.h1 || esc(post.title)) + '</h1>' +
        (post.subtitle ? '<p class="sub">' + esc(post.subtitle) + '</p>' : '') +
      '</div></div>' +
      '<section><div class="wrap"><div class="prose" style="max-width:720px;margin:0 auto;line-height:1.7;">' +
        (post.body || '') +
      '</div></div></section>' +
      (post.cta_h2 ? '<section id="contact" style="padding-top:60px"><div class="wrap"><div class="cta-box"><h2>' + esc(post.cta_h2) + '</h2><p>' + esc(post.cta_p || '') + '</p><a href="/contact/" class="btn btn-primary">Start a project</a></div></div></section>' : '');
  }

  /* ---------------- Dynamic Live Post Fallback ---------------- */
  async function renderDynamicPost(slug) {
    var main = document.getElementById('top') || document.querySelector('main');
    if (!main) return;

    var res = await db.from('site_blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (res.error || !res.data) return;

    var post = res.data;
    document.title = (post.title || 'Blog Post') + ' | The Flow Labs';

    main.innerHTML =
      '<div class="page-hero"><div class="wrap">' +
        '<div class="crumbs"><a href="/">Home</a> <span aria-hidden="true">›</span> <a href="/blog/">Blog</a> <span aria-hidden="true">›</span> <span>' + esc(post.crumb || post.title) + '</span></div>' +
        (post.pill ? '<span class="pill"><span class="dot"></span> <span>' + esc(post.pill) + '</span></span>' : '') +
        '<h1>' + (post.h1 || esc(post.title)) + '</h1>' +
        (post.subtitle ? '<p class="sub">' + esc(post.subtitle) + '</p>' : '') +
      '</div></div>' +
      '<section><div class="wrap"><div class="prose" style="max-width:720px;margin:0 auto;line-height:1.7;">' +
        (post.body || '') +
      '</div></div></section>' +
      (post.cta_h2 ? '<section id="contact" style="padding-top:60px"><div class="wrap"><div class="cta-box"><h2>' + esc(post.cta_h2) + '</h2><p>' + esc(post.cta_p || '') + '</p><a href="/contact/" class="btn btn-primary">Start a project</a></div></div></section>' : '');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
