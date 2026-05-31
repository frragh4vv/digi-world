import React, { useState } from 'react';
import RPGStats from './components/RPGStats';
import InteractiveAvatar from './components/InteractiveAvatar';
import { motion, AnimatePresence } from 'framer-motion';
import { GameStateProvider, useGameState } from './components/GameStateContext';

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
    const code = key === 'e' ? 'KeyE' : key === 'Escape' ? 'Escape' : '';
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
        
        <header style={{ textAlign: 'center', marginBottom: '15px' }}>
          <h1 className="pixel-header" style={{ fontSize: '1.7rem', color: 'var(--rpg-highlight)', textShadow: '0 0 10px rgba(0,255,255,0.4)', margin: '0 0 5px 0' }}>
            🏡 Raghav's Cozy Personal Space
          </h1>
          <p className="pixel-text" style={{ fontSize: '1.25rem', color: '#aaa', margin: 0 }}>
            Walk around my bedroom overworld! [WASD/Arrows to Walk, Click tiles, E to Inspect]
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
                onClick={() => setActiveItemId(null)}
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
            - Kick the soccer ball into the goalpost to score! Bounces off goalie & cones.
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
                  🔍 Item Inspected
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

              {/* Main Content Info */}
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

              {/* Gallery scroll list */}
              {selectedItem.gallery && selectedItem.gallery.length > 0 && (
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
