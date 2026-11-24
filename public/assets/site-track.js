/* The Flow Labs — cookie-less page-view tracking. Fire and forget. */
(function () {
  'use strict';

  var path = window.location.pathname;
  if (path.indexOf('/flow-hq') === 0 || path.indexOf('/api/') === 0) return;
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return;

  var payload = {
    page: path,
    ref: document.referrer || '',
    w: window.screen ? window.screen.width : 0,
    h: window.screen ? window.screen.height : 0
  };

  try {
    if (navigator.sendBeacon) {
      var blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon('/api/track', blob);
      return;
    }
  } catch (error) {
    /* fall through to fetch */
  }

  try {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(function () {});
  } catch (error) {
    /* ignore */
  }
})();
