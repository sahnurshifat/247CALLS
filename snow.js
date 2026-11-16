/* Light snowfall (one small canvas, no images). To remove after Christmas, delete the
   <script src="snow.js"> line from index.html, or set ENABLED to false. */
(function () {
  const ENABLED = true;
  const MAX_FLAKES = 55;                      // fewer = lighter. Phones automatically get fewer.
  const COLOR = '175, 167, 255';              // soft purple so flakes show on a white page (use '255,255,255' on a dark background)

  if (!ENABLED || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:30';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let w, h, flakes = [], raf = null;

  function size() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.min(MAX_FLAKES, Math.round(w / 22));
    while (flakes.length < count) flakes.push(make(true));
    flakes.length = count;
  }
  function make(anywhere) {
    return {
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : -10,
      r: 1 + Math.random() * 2.6,              // size
      v: 0.4 + Math.random() * 0.9,            // fall speed
      p: Math.random() * Math.PI * 2,          // sway phase
      a: 0.35 + Math.random() * 0.5            // opacity
    };
  }
  function tick() {
    ctx.clearRect(0, 0, w, h);
    for (const f of flakes) {
      f.y += f.v;
      f.p += 0.015;
      f.x += Math.sin(f.p) * 0.4;
      if (f.y > h + 10) Object.assign(f, make(false), { x: Math.random() * w });
      ctx.fillStyle = 'rgba(' + COLOR + ',' + f.a + ')';
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, 6.2832);
      ctx.fill();
    }
    raf = requestAnimationFrame(tick);
  }
  function start() { if (!raf) raf = requestAnimationFrame(tick); }
  function stop() { cancelAnimationFrame(raf); raf = null; }

  size();
  start();
  window.addEventListener('resize', size);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));   // pauses in background tabs
})();