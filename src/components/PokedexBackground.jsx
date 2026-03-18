/*
 * PokedexBackground.jsx Scrolling Pokémon sprite grid rendered on a single
 * module-level canvas that persists across route changes. Mounts the canvas
 * into a fixed container on first render and re-uses it on subsequent mounts.
 * Sprites run from Bulbasaur to Genesect in sequential order,
 * filling every cell so the grid loops seamlessly.
 */

import React, { useEffect, useRef, memo } from 'react';

const SPRITE_URL = id =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

const FPS_LIMIT  = 20;
const PX_PER_SEC = 10;

// All IDs from 1 to 649 sequential, Bulbasaur through Genesect.
const ALL_IDS = Array.from({ length: 649 }, (_, i) => i + 1);

/*
 * Module level singleton state. The canvas and all loaded images live here
 * so they survive React unmount/remount across route changes.
 */
const BG = {
  container: null,   /* the fixed position host div appended to document.body */
  canvas:    null,
  images:    [],     /* Image objects, index matches ALL_IDS */
  loadedCount: 0,
  allLoaded: false,
  animId:    null,
  state:     { offset: 0, loopH: 1, ready: false, lastTime: 0 },
  listeners: new Set(), /* components currently mounted — used to know when to stop */
  resizeTimer: null,
};

/* Build or rebuild the canvas grid to exactly fill the current viewport. */
function rebuildCanvas() {
  if (!BG.canvas || !BG.allLoaded) return;

  const vw   = window.innerWidth;
  const vh   = window.innerHeight;

  /* Compute box size so columns divide evenly into the viewport width.
     Start from a target of 64px and nudge to the nearest whole divisor. */
  const targetBox = 64;
  const cols      = Math.round(vw / targetBox);
  const BOX       = Math.floor(vw / cols);

  /* Pad the ID list so it fills a whole number of rows. */
  const rem  = ALL_IDS.length % cols;
  const ids  = rem === 0 ? ALL_IDS : [...ALL_IDS, ...ALL_IDS.slice(0, cols - rem)];
  const rows = ids.length / cols;
  const W    = cols * BOX;
  const H    = rows * BOX;

  /* Canvas must be tall enough that one full scroll loop never shows a gap. */
  const passCount = Math.ceil((vh * 2) / H) + 1;

  BG.canvas.width  = W;
  BG.canvas.height = H * passCount;

  BG.state.loopH  = H;
  BG.state.offset = BG.state.offset % H;
  BG.state.ready  = false;

  const ctx = BG.canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  function drawPass(yOffset) {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, yOffset, W, H);
    ids.forEach((id, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx  = col * BOX;
      const cy  = yOffset + row * BOX;
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth   = 1;
      ctx.strokeRect(cx + 0.5, cy + 0.5, BOX - 1, BOX - 1);
      const img = BG.images[id - 1]; /* images are 0-indexed, IDs are 1-indexed */
      if (img?.complete && img.naturalWidth > 0) {
        const pad = (BOX - Math.min(BOX - 4, 48)) / 2;
        const sz  = BOX - pad * 2;
        ctx.drawImage(img, cx + pad, cy + pad, sz, sz);
      }
    });
  }

  for (let p = 0; p < passCount; p++) drawPass(p * H);
  BG.state.ready = true;
}

/* Start the RAF animation loop if it isn't already running. */
function startLoop() {
  if (BG.animId !== null) return;
  const frameMs = 1000 / FPS_LIMIT;
  function animate(now) {
    BG.animId = requestAnimationFrame(animate);
    const s = BG.state;
    if (!s.ready || s.loopH < 1) return;
    const elapsed = now - s.lastTime;
    if (elapsed < frameMs) return;
    s.offset   = (s.offset + (elapsed / 1000) * PX_PER_SEC) % s.loopH;
    s.lastTime = now - (elapsed % frameMs);
    if (BG.canvas) BG.canvas.style.transform = `translateY(-${s.offset.toFixed(2)}px)`;
  }
  BG.animId = requestAnimationFrame(animate);
}

/* Stop the RAF loop. */
function stopLoop() {
  if (BG.animId !== null) { cancelAnimationFrame(BG.animId); BG.animId = null; }
}

/* Initialise the singleton on first use — creates container, canvas, loads images. */
function initSingleton(onReady) {
  if (BG.container) {
    /* Already initialised — just call onReady if images are loaded. */
    if (BG.allLoaded) onReady();
    else BG._pendingCallbacks = [...(BG._pendingCallbacks || []), onReady];
    return;
  }

  /* Create the fixed host div and canvas once. */
  BG.container = document.createElement('div');
  Object.assign(BG.container.style, {
    position: 'fixed', inset: '0', zIndex: '0',
    overflow: 'hidden', pointerEvents: 'none', background: '#000',
  });
  BG.canvas = document.createElement('canvas');
  BG.canvas.style.cssText = 'display:block;will-change:transform;';

  /* Dark overlay */
  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'absolute', inset: '0', background: 'rgba(0,0,0,0.82)',
  });

  BG.container.appendChild(BG.canvas);
  BG.container.appendChild(overlay);
  document.body.appendChild(BG.container);

  BG._pendingCallbacks = [onReady];

  /* Load all sprites. */
  BG.images = ALL_IDS.map((id, idx) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = SPRITE_URL(id);
    const onDone = () => {
      BG.loadedCount++;
      if (BG.loadedCount === ALL_IDS.length) {
        BG.allLoaded = true;
        rebuildCanvas();
        startLoop();
        (BG._pendingCallbacks || []).forEach(cb => cb());
        BG._pendingCallbacks = [];
      }
    };
    img.onload  = onDone;
    img.onerror = onDone;
    return img;
  });

  /* Debounced resize handler. */
  window.addEventListener('resize', () => {
    clearTimeout(BG.resizeTimer);
    BG.resizeTimer = setTimeout(rebuildCanvas, 200);
  });
}

const PokedexBackground = memo(function PokedexBackground({ onReady }) {
  const hostRef = useRef(null);

  useEffect(() => {
    BG.listeners.add(hostRef);

    initSingleton(() => {
      if (onReady) onReady();
    });

    /* Move the singleton container to be a child of this component's host
       so it visually participates in the correct stacking context. */
    if (BG.container && hostRef.current && !hostRef.current.contains(BG.container)) {
      hostRef.current.appendChild(BG.container);
    }

    startLoop();

    return () => {
      BG.listeners.delete(hostRef);
      /* Move container back to body on unmount so it persists for next mount. */
      if (BG.container && !document.body.contains(BG.container)) {
        document.body.appendChild(BG.container);
      }
    };
  }, []);

  return <div ref={hostRef} style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }} />;
});

export default PokedexBackground;
