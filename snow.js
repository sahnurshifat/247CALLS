/* Crystal snowfall: small ice-crystal sprites drawn once, then reused (very light).
   To remove after Christmas, delete the <script src="snow.js"> line from index.html or set ENABLED to false. */
(function () {
  const ENABLED = true;
  const MAX_FLAKES = 40;                       // fewer = lighter (phones automatically get fewer)
  const COLOR = '125, 135, 255';               // ice-blue/purple so crystals show on a white page ('255,255,255' for dark backgrounds)

  if (!ENABLED || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Draw 3 crystal designs once onto small hidden canvases
  function makeSprite(type) {
    const s = 64, c = document.createElement('canvas');
    c.width = c.height = s;
    const x = c.getContext('2d');
    x.translate(s / 2, s / 2);
    x.strokeStyle = 'rgba(' + COLOR + ',1)';
    x.lineCap = 'round'; x.lineJoin = 'round';
    x.lineWidth = type === 2 ? 2.4 : 2;
    x.shadowColor = 'rgba(' + COLOR + ',.7)'; x.shadowBlur = 4;
    for (let i = 0; i < 6; i++) {
      x.save(); x.rotate(i * Math.PI / 3); x.beginPath();
      x.moveTo(0, 0); x.lineTo(0, -28);
      if (type === 0) { x.moveTo(0, -13); x.lineTo(7, -20); x.moveTo(0, -13); x.lineTo(-7, -20); }
      if (type === 1) {
        x.moveTo(0, -10); x.lineTo(6, -16); x.moveTo(0, -10); x.lineTo(-6, -16);
        x.moveTo(0, -19); x.lineTo(5, -25); x.moveTo(0, -19); x.lineTo(-5, -25);
      }
      if (type === 2) { x.moveTo(0, -16); x.lineTo(5, -22); x.lineTo(0, -28); x.lineTo(-5, -22); x.closePath(); }
      x.stroke(); x.restore();
    }
    return c;
  }
  const sprites = [0, 1, 2].map(makeSprite);

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:30';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let w, h, flakes = [], raf = null;

  function make(anywhere) {
    return {
      x: Math.random() * w, y: anywhere ? Math.random() * h : -20,
      r: 5 + Math.random() * 10,                 // half-size in px
      v: 0.35 + Math.random() * 0.8,             // fall speed
      p: Math.random() * 6.28, rot: Math.random() * 6.28,
      spin: (Math.random() - 0.5) * 0.02,
      a: 0.45 + Math.random() * 0.45,
      s: sprites[(Math.random() * 3) | 0]
    };
  }
  function size() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.min(MAX_FLAKES, Math.round(w / 28));
    while (flakes.length < count) flakes.push(make(true));
    flakes.length = count;
  }
  function tick() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    for (const f of flakes) {
      f.y += f.v; f.p += 0.012; f.x += Math.sin(f.p) * 0.4; f.rot += f.spin;
      if (f.y > h + 20) Object.assign(f, make(false));
      const c = Math.cos(f.rot), s = Math.sin(f.rot);
      ctx.setTransform(c, s, -s, c, f.x, f.y);
      ctx.globalAlpha = f.a;
      ctx.drawImage(f.s, -f.r, -f.r, f.r * 2, f.r * 2);
    }
    raf = requestAnimationFrame(tick);
  }
  const start = () => { if (!raf) raf = requestAnimationFrame(tick); };
  const stop = () => { cancelAnimationFrame(raf); raf = null; };

  size(); start();
  window.addEventListener('resize', size);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));   // pauses in background tabs
})();