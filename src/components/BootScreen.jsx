import React, { useEffect, useRef, useState } from 'react';

// Assets worth having in cache before the first screen: the room art, the
// dialogue scroll and every frame of the character sprite sheet.
const PRELOAD = [
  '/room-overworld.webp',
  '/parchment-scroll.webp',
  ...[0, 1, 2, 3].flatMap(r => [0, 1, 2, 3].map(c => `/sprites/raghav_r${r}_c${c}.png`))
];

const BOOT_LINES = [
  'DIGI-WORLD OS v2.0',
  'CHECKING CARTRIDGE ........ OK',
  'LOADING ROOM ART',
  'WAKING UP THE CAT',
  'READY.'
];

const MIN_BOOT_MS = 2000; // never flash by faster than this, even when cached
const FADE_MS = 350;

// Handheld "power on" screen shown over the game viewport on page load.
// Progress tracks real image loading; any key / tap skips it. While it is up
// it swallows key presses so they can't reach the character screen behind.
export default function BootScreen({ onDone }) {
  const [loaded, setLoaded] = useState(0);
  const [minTimeUp, setMinTimeUp] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setLeaving(true);
    setTimeout(onDone, FADE_MS);
  };

  useEffect(() => {
    PRELOAD.forEach(src => {
      const img = new Image();
      // count failures too, so a missing file can never hang the boot
      img.onload = img.onerror = () => setLoaded(n => n + 1);
      img.src = src;
    });
    const t = setTimeout(() => setMinTimeUp(true), MIN_BOOT_MS);
    return () => clearTimeout(t);
  }, []);

  const progress = loaded / PRELOAD.length;
  useEffect(() => {
    if (progress >= 1 && minTimeUp) finish();
  }, [progress, minTimeUp]);

  // Any key skips; capture phase so the screen behind never sees it
  useEffect(() => {
    const swallow = (e) => {
      e.stopImmediatePropagation();
      e.preventDefault();
      finish();
    };
    window.addEventListener('keydown', swallow, true);
    return () => window.removeEventListener('keydown', swallow, true);
  }, []);

  // Reveal the boot log line by line as loading progresses
  const linesShown = Math.max(1, Math.ceil(progress * (BOOT_LINES.length - 1)) + (progress >= 1 ? 1 : 0));

  return (
    <div
      className={`boot-screen${leaving ? ' leaving' : ''}`}
      onPointerDown={finish}
      role="status"
      aria-label={`Loading ${Math.round(progress * 100)}%`}
    >
      <div className="boot-logo pixel-header">
        RAGHAV'S<br />DIGITAL WORLD
      </div>
      <div className="boot-log pixel-text">
        {BOOT_LINES.slice(0, linesShown).map(line => (
          <div key={line}>&gt; {line}</div>
        ))}
      </div>
      <div className="boot-bar" aria-hidden="true">
        <div className="boot-bar-fill" style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
      <div className="boot-skip pixel-header">PRESS ANY BUTTON TO SKIP</div>
    </div>
  );
}
