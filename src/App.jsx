import React, { useState, useEffect } from 'react';
import RPGStats from './components/RPGStats';
import InteractiveAvatar from './components/InteractiveAvatar';
import Sprite from './components/Sprite';
import { motion, AnimatePresence } from 'framer-motion';
import { GameStateProvider, useGameState } from './components/GameStateContext';

// ── Developer character file (the fun "inspect developer" screen) ──────────
const DEV_COLORS = { hat: '#e53935', skin: '#ffb6c1', shirt: '#111111', pants: '#1e88e5', shoes: '#ffffff' };
const DEV_SKILLS = [
  { name: '⚛️ React Sorcery', val: 92, color: '#4fc3f7' },
  { name: '🟢 Node.js Conjuring', val: 85, color: '#66bb6a' },
  { name: '🐍 Python Scraping', val: 78, color: '#ffd54f' },
  { name: '🧗 Bouldering (V5)', val: 70, color: '#ff8a65' },
  { name: '⚽ Football IQ', val: 95, color: '#aed581' },
  { name: '😴 Sleep Discipline', val: 12, color: '#ef5350' },
];
const DEV_STATUSES = [
  '🧗 thinking about one more V5 problem…',
  '☕ caffeine buff active (stack ×3)',
  '📈 watching cursed stock indices',
  '⚽ replaying Messi highlights — for research',
  '📚 re-reading Hunter×Hunter, again',
  '⌨️ refactoring something that already worked',
  '🗺️ planning a trek he will absolutely overpack for',
];

function StatBar({ label, val, max = 100, color, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW((val / max) * 100), 120 + delay);
    return () => clearTimeout(t);
  }, [val, max, delay]);
  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
        <span className="pixel-text" style={{ fontSize: '1.15rem', color: '#ddd' }}>{label}</span>
        <span className="pixel-text" style={{ fontSize: '1.15rem', color }}>{val}/{max}</span>
      </div>
      <div style={{ width: '100%', height: '12px', background: '#000', border: '2px solid #333', borderRadius: '999px', overflow: 'hidden' }}>
        <div style={{ width: `${w}%`, height: '100%', background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: '999px', transition: 'width 0.9s cubic-bezier(0.22, 1, 0.36, 1)', boxShadow: `0 0 8px ${color}66` }} />
      </div>
    </div>
  );
}

function DevCharacterCard() {
  const [frame, setFrame] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);
  useEffect(() => {
    const walk = setInterval(() => setFrame(f => (f + 1) % 4), 240);
    const status = setInterval(() => setStatusIdx(i => (i + 1) % DEV_STATUSES.length), 2600);
    return () => { clearInterval(walk); clearInterval(status); };
  }, []);

  return (
    <div style={{ display: 'flex', gap: '22px', flexWrap: 'wrap', marginTop: '10px' }}>
      {/* Left: animated sprite on a pedestal + identity + live status ticker */}
      <div style={{ width: '230px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
        <div className="rpg-box" style={{ width: '170px', height: '170px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 50% 35%, #1c2418 0%, #000 75%)', border: '3px solid var(--rpg-highlight)', boxShadow: '0 0 18px rgba(0,255,255,0.35)' }}>
          <div style={{ width: '104px', height: '104px' }}>
            <Sprite direction="down" frame={frame} customColors={DEV_COLORS} />
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3 className="pixel-header" style={{ fontSize: '1.05rem', color: '#fff', margin: '0 0 4px 0' }}>RAGHAV</h3>
          <span className="pixel-header" style={{ fontSize: '0.6rem', color: 'var(--rpg-text)' }}>CLASS: CHAOTIC CO-PILOT · LV 20+</span>
        </div>
        {/* Live status ticker */}
        <div className="rpg-box" style={{ width: '100%', background: '#0a0a12', borderColor: '#ffd166', padding: '8px 10px' }}>
          <div className="pixel-header" style={{ fontSize: '0.5rem', color: '#ffd166', marginBottom: '4px' }}>◉ CURRENT STATUS:</div>
          <div className="pixel-text" style={{ fontSize: '1.1rem', color: '#fff', minHeight: '34px' }}>{DEV_STATUSES[statusIdx]}</div>
        </div>
      </div>

      {/* Right: vitals, skills, buffs & debuffs */}
      <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ border: '2px dashed var(--rpg-text)', padding: '12px', background: '#09090f' }}>
          <h4 className="pixel-header" style={{ fontSize: '0.7rem', margin: '0 0 10px 0', color: 'var(--rpg-highlight)' }}>❤️ VITALS:</h4>
          <StatBar label="HP · Social Battery" val={75} color="#ef5350" />
          <StatBar label="MP · Caffeine Reserve" val={88} color="#4fc3f7" delay={120} />
          <StatBar label="XP · Level Progress" val={68} color="#66bb6a" delay={240} />
        </div>

        <div style={{ border: '2px dashed var(--rpg-text)', padding: '12px', background: '#09090f' }}>
          <h4 className="pixel-header" style={{ fontSize: '0.7rem', margin: '0 0 10px 0', color: 'var(--rpg-highlight)' }}>⚔️ SKILL TREE:</h4>
          {DEV_SKILLS.map((s, i) => (
            <StatBar key={s.name} label={s.name} val={s.val} color={s.color} delay={i * 90} />
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '170px', border: '2px solid #2e7d32', padding: '10px', background: '#0a120a' }}>
            <h4 className="pixel-header" style={{ fontSize: '0.6rem', margin: '0 0 8px 0', color: '#66bb6a' }}>▲ ACTIVE BUFFS:</h4>
            {['☕ Caffeine Surge ×3', '🧗 Chalked Up (+grip)', '📺 Anime Arc Momentum'].map(b => (
              <div key={b} className="pixel-text" style={{ fontSize: '1.1rem', color: '#cde6cd', marginBottom: '4px' }}>{b}</div>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: '170px', border: '2px solid #8a3a2a', padding: '10px', background: '#120a0a' }}>
            <h4 className="pixel-header" style={{ fontSize: '0.6rem', margin: '0 0 8px 0', color: '#ef9a8a' }}>▼ DEBUFFS:</h4>
            {['💤 Sleep Discipline -10', '🧲 Hyperfixation (random)', '🛒 Gear Acquisition Syndrome'].map(b => (
              <div key={b} className="pixel-text" style={{ fontSize: '1.1rem', color: '#e6cdcd', marginBottom: '4px' }}>{b}</div>
            ))}
          </div>
        </div>

        <div style={{ border: '2px solid var(--rpg-highlight)', padding: '10px', background: '#0a0a12' }}>
          <h4 className="pixel-header" style={{ fontSize: '0.6rem', margin: '0 0 8px 0', color: 'var(--rpg-highlight)' }}>🏆 NOTABLE ACHIEVEMENTS:</h4>
          <div className="pixel-text" style={{ fontSize: '1.1rem', color: '#ddd', lineHeight: 1.6 }}>
            🥾 GR20 Corsica Finisher (180km) · 🧗 V5 Sender, Hampi Granite · ⚽ Unlicensed UEFA Tactics Oracle · 🕹️ Shipped this very overworld
          </div>
        </div>
      </div>
    </div>
  );
}

// Expanded portfolio database matching mapConfig IDs
const inventoryItems = [
  {
    id: 'profile',
    title: 'Character: Raghav',
    mainImg: '/profile.png',
    desc: 'The developer candidate NPC. Class: Chaotic Co-Pilot. Stats: +15 Hyperfixation, +80 Bouldering Enthusiasm, -10 Sleep Discipline. A software engineer who loves converting normal web components into immersive retro games.',
    attributes: [
      { name: 'HP (Social Battery)', val: '75 / 100' },
      { name: 'EXP (Age Level)', val: 'Level 20+' },
      { name: 'Archetype', val: 'Highly Lonely Yearner' },
      { name: 'Active Buffs', val: 'Caffeine Surge, Code Flow' }
    ],
    gallery: ['/profile.png']
  },
  {
    id: 'bouldering',
    title: 'Bouldering Shoes',
    mainImg: '/bouldering.png',
    desc: 'Equippable Item. +10 Wall Grip, -5 Finger Skin. Restores passion when solving physical puzzles on walls. Grants a passive ability to point at random cliffs and say "I can climb that" (usually can\'t).',
    attributes: [
      { name: 'Item Rarity', val: 'Rare Artifact' },
      { name: 'Grip Power', val: '+10' },
      { name: 'Chalk Consumption', val: 'Extreme' }
    ],
    gallery: ['/bouldering.png', '/bouldering_2.png']
  },
  {
    id: 'anime',
    title: 'Ancient Tome of Lore',
    mainImg: '/anime.png',
    desc: 'Quest Item. A deep, unyielding well of anime and manga knowledge. Grants +15 Charisma to fellow weebs. Prepare for an intense, highly energetic 40-minute analysis of a series you have never heard of.',
    attributes: [
      { name: 'Lore Depth', val: 'Infinite' },
      { name: 'Spoken Speed', val: '1.5x' },
      { name: 'Weeb Factor', val: '99%' }
    ],
    gallery: ['/anime.png', '/anime_2.png']
  },
  {
    id: 'trekking',
    title: 'Travel Diary & Scrapbook',
    mainImg: '/trekking.png',
    desc: 'Raghav\'s personal travel scrapbook detailing alpine treks, historical temple trails in Kyoto, high-friction sandstone blocks in Hampi, and monsoons in the Western Ghats. A living collection of travel memories and climbing logs.',
    attributes: [
      { name: 'Travel Journeys', val: 'Corsica, Hampi, Tokyo' },
      { name: 'Altitude Scaled', val: '2,700m+ Peaks' },
      { name: 'Passions Detailed', val: 'Climbing, Hiking, Lore' }
    ],
    gallery: ['/trekking.png', '/trekking_2.png']
  },
  {
    id: 'football',
    title: 'The Orb of Chaos',
    mainImg: '/football.png',
    desc: 'Artifact. The beautiful game. I spend 50% of my time playing it on the pitch and 50% providing completely unsolicited tactical analyses of Champions League matches as if I were a UEFA manager.',
    attributes: [
      { name: 'Agility Boost', val: '+8' },
      { name: 'Tactical Backseat Driver', val: '+99' },
      { name: 'Stamina battery', val: 'Low' }
    ],
    gallery: ['/football.png']
  }
];

function GameConsole() {
  const {
    activeItemId,
    setActiveItemId,
    caffeineTimer
  } = useGameState();

  // Keyboard Event Dispatcher for Console D-Pad and Buttons (Mobile Touch Support!)
  const simulateKeyEvent = (key, type) => {
    const code = key === 'e' ? 'KeyE' : key === 'b' ? 'KeyB' : key === 'Escape' ? 'Escape' : '';
    const event = new KeyboardEvent(type, {
      key: key,
      code: code,
      bubbles: true,
      cancelable: true
    });
    window.dispatchEvent(event);
  };

  const selectedItem = inventoryItems.find(item => item.id === activeItemId);

  return (
    <div className="console-layout">
      {/* Starry Space Parallax Grid Background (Handled in CSS) */}
      
      {/* Handheld Console Screen Chassis */}
      <div className="handheld-container" style={{ flex: 1 }}>
        
        <header style={{ textAlign: 'center', marginBottom: '18px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          {/* Reference-style status title bar */}
          <div className="title-bar pixel-header">
            <span className="title-bar-dot" />
            <span className="title-bar-text">
              RAGHAV'S DIGITAL WORLD <span className="title-bar-sep">//</span> <span className="title-bar-online">ONLINE</span> <span className="title-bar-sep">//</span> V2.0
            </span>
          </div>
          <p className="pixel-text" style={{ fontSize: 'clamp(1rem, 3.4vw, 1.25rem)', color: '#9aa0b0', margin: 0, lineHeight: 1.4 }}>
            Walk around my bedroom overworld! <br className="hide-desktop" />[WASD / Arrows to walk · Click tiles · E to inspect]
          </p>
        </header>

        <div className="handheld-chassis">
          {/* Main Game Screen Viewport */}
          <div className="game-viewport">
            <div className="crt-scanline" />
            <InteractiveAvatar />
          </div>

          {/* Handheld Physical Controls */}
          <div className="console-controls">
            {/* D-Pad */}
            <div className="d-pad">
              <button 
                onMouseDown={() => simulateKeyEvent('ArrowUp', 'keydown')}
                onMouseUp={() => simulateKeyEvent('ArrowUp', 'keyup')}
                onTouchStart={() => simulateKeyEvent('ArrowUp', 'keydown')}
                onTouchEnd={() => simulateKeyEvent('ArrowUp', 'keyup')}
                className="d-pad-btn d-pad-up"
              >
                ▲
              </button>
              <button 
                onMouseDown={() => simulateKeyEvent('ArrowLeft', 'keydown')}
                onMouseUp={() => simulateKeyEvent('ArrowLeft', 'keyup')}
                onTouchStart={() => simulateKeyEvent('ArrowLeft', 'keydown')}
                onTouchEnd={() => simulateKeyEvent('ArrowLeft', 'keyup')}
                className="d-pad-btn d-pad-left"
              >
                ◀
              </button>
              <div className="d-pad-center"></div>
              <button 
                onMouseDown={() => simulateKeyEvent('ArrowRight', 'keydown')}
                onMouseUp={() => simulateKeyEvent('ArrowRight', 'keyup')}
                onTouchStart={() => simulateKeyEvent('ArrowRight', 'keydown')}
                onTouchEnd={() => simulateKeyEvent('ArrowRight', 'keyup')}
                className="d-pad-btn d-pad-right"
              >
                ▶
              </button>
              <button 
                onMouseDown={() => simulateKeyEvent('ArrowDown', 'keydown')}
                onMouseUp={() => simulateKeyEvent('ArrowDown', 'keyup')}
                onTouchStart={() => simulateKeyEvent('ArrowDown', 'keydown')}
                onTouchEnd={() => simulateKeyEvent('ArrowDown', 'keyup')}
                className="d-pad-btn d-pad-down"
              >
                ▼
              </button>
            </div>

            {/* Handheld brand label */}
            <div className="pixel-header" style={{ fontSize: '0.8rem', color: '#555', letterSpacing: '2px', textAlign: 'center' }}>
              ANTIGRAVITY<br/>
              <span style={{ fontSize: '0.6rem', color: '#333' }}>8-BIT EDITION</span>
            </div>

            {/* Action Buttons A & B */}
            <div className="action-buttons">
              <button 
                onMouseDown={() => simulateKeyEvent('e', 'keydown')}
                onMouseUp={() => simulateKeyEvent('e', 'keyup')}
                onTouchStart={() => simulateKeyEvent('e', 'keydown')}
                onTouchEnd={() => simulateKeyEvent('e', 'keyup')}
                className="action-btn btn-b"
              >
                A
              </button>
              <button
                onMouseDown={() => simulateKeyEvent('b', 'keydown')}
                onMouseUp={() => simulateKeyEvent('b', 'keyup')}
                onTouchStart={() => simulateKeyEvent('b', 'keydown')}
                onTouchEnd={() => simulateKeyEvent('b', 'keyup')}
                className="action-btn btn-a"
              >
                B
              </button>
            </div>
          </div>

          {/* Aesthetic Speaker slots */}
          <div className="speaker-grille">
            <div className="speaker-line" />
            <div className="speaker-line" />
            <div className="speaker-line" />
            <div className="speaker-line" />
          </div>
        </div>
      </div>

      {/* Realtime Stats HUD Sidebar */}
      <aside className="hud-sidebar">
        <RPGStats />
        
        {/* Helper quick tips panel */}
        <div className="rpg-box" style={{ width: '100%' }}>
          <h2 className="pixel-header" style={{ fontSize: '1rem', borderBottom: '2px solid var(--rpg-text)', paddingBottom: '8px', marginBottom: '10px' }}>
            📜 Guide Book
          </h2>
          <p className="pixel-text" style={{ fontSize: '1.3rem', margin: '4px 0', lineHeight: '1.4' }}>
            - Open the Football Chalkboard (bottom-right) to read Raghav's Barça/Messi lore & play a 1v1 match.
          </p>
          <p className="pixel-text" style={{ fontSize: '1.3rem', margin: '4px 0', lineHeight: '1.4' }}>
            - Grab energy drinks / pizza for active buffs and stamina restoration.
          </p>
          <p className="pixel-text" style={{ fontSize: '1.3rem', margin: '4px 0', lineHeight: '1.4', color: 'var(--rpg-highlight)' }}>
            - Cheat Code: Type <strong style={{ color: 'var(--rpg-accent)' }}>wwssadadba</strong> in the overworld!
          </p>
        </div>
      </aside>

      {/* Details Inspection Modal Overlay */}
      <AnimatePresence>
        {activeItemId && selectedItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.92)',
              zIndex: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={() => setActiveItemId(null)}
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: 'spring', damping: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="rpg-box"
              style={{
                width: '100%',
                maxWidth: '750px',
                maxHeight: '90vh',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                borderColor: 'var(--rpg-highlight)',
                boxShadow: '0 0 30px rgba(0, 255, 255, 0.4)'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid var(--rpg-highlight)', paddingBottom: '10px' }}>
                <h2 className="pixel-header" style={{ fontSize: '1.4rem', color: 'var(--rpg-highlight)', margin: 0 }}>
                  {selectedItem.id === 'profile' ? '⚔️ Character File' : '🔍 Item Inspected'}
                </h2>
                <button 
                  onClick={() => setActiveItemId(null)}
                  className="pixel-header"
                  style={{
                    background: 'var(--rpg-accent)',
                    color: '#fff',
                    border: '3px solid #000',
                    padding: '4px 10px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    boxShadow: '2px 2px 0 #000'
                  }}
                >
                  CLOSE [B]
                </button>
              </div>

              {/* Main Content Info — the developer gets a full RPG character file */}
              {selectedItem.id === 'profile' ? (
                <DevCharacterCard />
              ) : (
              <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', marginTop: '10px' }}>
                <img 
                  src={selectedItem.mainImg} 
                  alt={selectedItem.title} 
                  style={{ 
                    width: '240px', 
                    height: '240px', 
                    objectFit: 'cover', 
                    border: '4px solid var(--rpg-highlight)',
                    imageRendering: 'pixelated',
                    background: '#111'
                  }} 
                />
                
                <div style={{ flex: 1, minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <h3 className="pixel-header" style={{ fontSize: '1.3rem', margin: 0, color: 'var(--rpg-text)' }}>
                    {selectedItem.title}
                  </h3>
                  
                  <p className="pixel-text" style={{ fontSize: '1.5rem', margin: 0, color: '#fff', lineHeight: '1.4' }}>
                    {selectedItem.desc}
                  </p>
                  
                  {/* Detailed Spec stats */}
                  <div style={{ border: '2px dashed var(--rpg-text)', padding: '10px', background: '#09090f' }}>
                    <h4 className="pixel-header" style={{ fontSize: '0.8rem', margin: '0 0 10px 0', color: 'var(--rpg-highlight)' }}>Item Attributes:</h4>
                    {selectedItem.attributes.map((attr, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '1.3rem' }}>
                        <span>• {attr.name}:</span>
                        <span style={{ color: 'var(--rpg-highlight)' }}>{attr.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              )}

              {/* Gallery scroll list */}
              {selectedItem.id !== 'profile' && selectedItem.gallery && selectedItem.gallery.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <h4 className="pixel-header" style={{ fontSize: '0.9rem', marginBottom: '10px', color: 'var(--rpg-text)' }}>
                    📷 Empirical Visual Evidence:
                  </h4>
                  <div className="gallery-scroll" style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                    {selectedItem.gallery.map((img, idx) => (
                      <img 
                        key={idx} 
                        src={img} 
                        alt={`Evidence ${idx}`} 
                        style={{ 
                          width: '200px', 
                          height: '140px', 
                          objectFit: 'cover', 
                          border: '3px solid var(--rpg-text)',
                          flexShrink: 0
                        }} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <GameStateProvider>
      <GameConsole />
    </GameStateProvider>
  );
}
