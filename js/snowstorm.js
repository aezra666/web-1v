/* ============================================
   Lightweight canvas snow effect.
   Exposes a small `snowStorm` config object so
   existing pages that set:
     snowStorm.flakesMax
     snowStorm.flakeWidth
     snowStorm.animationInterval
     snowStorm.flakesMaxActive
     snowStorm.snowColor
   before this script runs its loop keep working
   without changes.
   ============================================ */

(function (global) {
  const config = {
    flakesMax: 80,
    flakeWidth: 6,
    animationInterval: 33,
    flakesMaxActive: 80,
    snowColor: '#ffffff',
  };

  let canvas, ctx, flakes = [], running = false, lastTime = 0;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function makeFlake() {
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * -window.innerHeight,
      r: (Math.random() * 0.6 + 0.4) * (config.flakeWidth / 2),
      speed: Math.random() * 1.2 + 0.4,
      drift: Math.random() * 1 - 0.5,
      opacity: Math.random() * 0.5 + 0.4,
    };
  }

  function ensureFlakeCount() {
    const target = Math.min(config.flakesMax, config.flakesMaxActive);
    while (flakes.length < target) flakes.push(makeFlake());
    if (flakes.length > target) flakes.length = target;
  }

  function step(now) {
    if (!running) return;
    if (now - lastTime >= config.animationInterval) {
      lastTime = now;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = config.snowColor;

      for (const flake of flakes) {
        flake.y += flake.speed;
        flake.x += flake.drift;

        if (flake.y > canvas.height + 10) {
          flake.y = -10;
          flake.x = Math.random() * canvas.width;
        }
        if (flake.x > canvas.width + 10) flake.x = -10;
        if (flake.x < -10) flake.x = canvas.width + 10;

        ctx.globalAlpha = flake.opacity;
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    requestAnimationFrame(step);
  }

  function start() {
    if (running) return;
    canvas = document.createElement('canvas');
    canvas.id = 'snowstorm-canvas';
    Object.assign(canvas.style, {
      position: 'fixed',
      inset: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: '40',
    });
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);

    ensureFlakeCount();
    running = true;
    requestAnimationFrame(step);
  }

  function init() {
    if (document.body) start();
    else document.addEventListener('DOMContentLoaded', start);
  }

  // Re-sync flake count whenever config values are changed at runtime,
  // by checking again right before each animation frame batch starts.
  const snowStorm = new Proxy(config, {
    set(target, prop, value) {
      target[prop] = value;
      if (running) ensureFlakeCount();
      return true;
    },
  });

  global.snowStorm = snowStorm;
  init();
})(window);
