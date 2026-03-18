/*
 * PokedexBackground.jsx Scrolling Pokémon sprite grid on a single canvas.
 * Redraws on resize so it always fills the screen. Scrolls at 10px/s,
 * throttled to 20fps.
 */

import React, { useEffect, useRef, memo } from 'react';

const SPRITE_URL = id =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

const BOX        = 64;
const FPS_LIMIT  = 20;
const PX_PER_SEC = 10;

function buildRawIds() {
  const ids = [];
  for (let i = 1; i <= 649; i += 3) ids.push(i);
  return ids;
}
const RAW_IDS = buildRawIds();

const PokedexBackground = memo(function PokedexBackground() {
  const canvasRef   = useRef(null);
  const animRef     = useRef(null);
  const imagesRef   = useRef([]);
  const loadedRef   = useRef(false);
  const stateRef    = useRef({ offset: 0, loopH: 1, ready: false, lastTime: 0 });

  /* rebuildCanvas is defined outside useEffect and stored in a ref
     so the resize listener always calls the latest version */
  const rebuildRef = useRef(null);
  rebuildRef.current = function rebuildCanvas() {
    const canvas = canvasRef.current;
    if (!canvas || !loadedRef.current) return;

    const vw    = window.innerWidth;
    const vh    = window.innerHeight;
    const cols  = Math.ceil(vw / BOX);
    const rem   = RAW_IDS.length % cols;
    const ids   = rem === 0 ? RAW_IDS : [...RAW_IDS, ...RAW_IDS.slice(0, cols - rem)];
    const rows  = ids.length / cols;
    const W     = cols * BOX;
    const H     = rows * BOX;

    /* Canvas must be at least 2× viewport height so the loop never shows a gap.
       We draw the sprite grid twice: if H < vh we tile extra copies to fill. */
    const passCount = Math.ceil((vh * 2) / H) + 1;
    const totalH    = H * passCount;

    canvas.width  = W;
    canvas.height = totalH;

    /* Update loop height and clamp offset */
    stateRef.current.loopH  = H;
    stateRef.current.offset = stateRef.current.offset % H;
    stateRef.current.ready  = false;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    /* Draw one pass of the sprite grid at yOffset */
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
        const imgIdx = RAW_IDS.indexOf(id);
        const img    = imgIdx >= 0 ? imagesRef.current[imgIdx] : null;
        if (img?.complete && img.naturalWidth > 0) {
          const pad = (BOX - 48) / 2;
          ctx.drawImage(img, cx + pad, cy + pad, 48, 48);
        }
      });
    }

    /* Fill the canvas height with as many passes as needed */
    for (let p = 0; p < passCount; p++) drawPass(p * H);

    stateRef.current.ready = true;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* Load all images once */
    let loaded = 0;
    imagesRef.current = RAW_IDS.map(id => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = SPRITE_URL(id);
      const onDone = () => {
        loaded++;
        if (loaded === RAW_IDS.length) {
          loadedRef.current = true;
          rebuildRef.current();
        }
      };
      img.onload  = onDone;
      img.onerror = onDone;
      return img;
    });

    /* Animation loop */
    const frameMs = 1000 / FPS_LIMIT;
    function animate(now) {
      animRef.current = requestAnimationFrame(animate);
      const s = stateRef.current;
      if (!s.ready || s.loopH < 1) return;
      const elapsed = now - s.lastTime;
      if (elapsed < frameMs) return;
      s.offset   = (s.offset + (elapsed / 1000) * PX_PER_SEC) % s.loopH;
      s.lastTime = now - (elapsed % frameMs);
      canvas.style.transform = `translateY(-${s.offset.toFixed(2)}px)`;
    }
    animRef.current = requestAnimationFrame(animate);

    /* Debounced resize: redraws canvas at new viewport size */
    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => rebuildRef.current(), 200);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animRef.current);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      imagesRef.current.forEach(img => { img.onload = null; img.onerror = null; });
    };
  }, []);

  return (
    <div style={{
      position:      'fixed',
      inset:         0,
      zIndex:        0,
      overflow:      'hidden',
      pointerEvents: 'none',
      background:    '#000',
    }}>
      <canvas ref={canvasRef} style={{ display:'block', willChange:'transform' }} />
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.82)' }} />
    </div>
  );
});

export default PokedexBackground;
