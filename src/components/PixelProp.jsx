import React from 'react';

export default function PixelProp({ type }) {
  const wood = '#5c3a21';
  const woodDark = '#422f18';
  const rock = '#4a4a52';
  const rockLight = '#6e6e76';

  if (type === 'bed') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <rect x="1" y="2" width="14" height="4" fill={wood} />
        <rect x="2" y="3" width="12" height="3" fill={woodDark} />
        <rect x="2" y="5" width="5" height="3" fill="#eeeeee" />
        <rect x="3" y="6" width="3" height="1" fill="#cccccc" />
        <rect x="9" y="5" width="5" height="3" fill="#eeeeee" />
        <rect x="10" y="6" width="3" height="1" fill="#cccccc" />
        <rect x="1" y="8" width="14" height="6" fill="#1e88e5" /> 
        <rect x="1" y="7" width="14" height="1" fill="#ff8c00" /> 
        <rect x="2" y="9" width="12" height="1" fill="#42a5f5" />
        <rect x="1" y="13" width="2" height="3" fill={woodDark} />
        <rect x="13" y="13" width="2" height="3" fill={woodDark} />
      </svg>
    );
  }

  if (type === 'bookshelf') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <rect x="1" y="1" width="14" height="14" fill={wood} />
        <rect x="2" y="2" width="12" height="12" fill={woodDark} />
        <rect x="2" y="6" width="12" height="1" fill={wood} />
        <rect x="2" y="10" width="12" height="1" fill={wood} />
        <rect x="3" y="3" width="1" height="3" fill="#e53935" />
        <rect x="4" y="3" width="2" height="3" fill="#1e88e5" />
        <rect x="6" y="4" width="1" height="2" fill="#ffd700" />
        <rect x="8" y="3" width="2" height="3" fill="#43a047" />
        <rect x="11" y="3" width="1" height="3" fill="#8a2be2" />
        <rect x="3" y="7" width="2" height="3" fill="#ff8c00" />
        <rect x="6" y="8" width="1" height="2" fill="#eeeeee" />
        <rect x="8" y="7" width="1" height="3" fill="#1e88e5" />
        <rect x="9" y="7" width="2" height="3" fill="#e53935" />
        <rect x="12" y="7" width="1" height="3" fill="#ffd700" />
        <rect x="4" y="11" width="1" height="3" fill="#43a047" />
        <rect x="5" y="11" width="2" height="3" fill="#8a2be2" />
        <rect x="8" y="12" width="1" height="2" fill="#ff8c00" />
        <rect x="10" y="11" width="3" height="3" fill="#1e88e5" />
      </svg>
    );
  }

  if (type === 'fridge') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <rect x="2" y="1" width="12" height="14" fill="#37474f" />
        <rect x="3" y="2" width="10" height="12" fill="#212121" />
        <rect x="4" y="3" width="8" height="10" fill="rgba(0, 255, 102, 0.15)" stroke="var(--rpg-text)" strokeWidth="1" />
        <rect x="5" y="5" width="2" height="3" fill="#e53935" />
        <rect x="8" y="5" width="2" height="3" fill="#00ffff" />
        <rect x="5" y="9" width="2" height="3" fill="#ffd700" />
        <rect x="9" y="9" width="2" height="3" fill="#ff007f" />
        <rect x="11" y="6" width="1" height="4" fill="#cfd8dc" />
        <rect x="4" y="1" width="2" height="2" fill="#ffd700" />
      </svg>
    );
  }

  if (type === 'bouldering-wall') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        {/* Blue Crash Pad at bottom */}
        <rect x="0" y="13" width="16" height="3" fill="#1565c0" />
        <rect x="0" y="13" width="16" height="0.8" fill="#1e88e5" />
        {/* Climbing Wall surface */}
        <rect x="0" y="0" width="16" height="13" fill={rock} />
        {/* Wall panels shading */}
        <polygon points="0,0 8,0 4,13 0,13" fill="#3f3f46" /> {/* Overhang angle */}
        <rect x="0" y="3" width="16" height="0.8" fill={rockLight} opacity="0.3" />
        <rect x="0" y="8" width="16" height="0.8" fill={rockLight} opacity="0.3" />
        {/* Colorful protruding holds with 3D shadows */}
        {/* Pink hold */}
        <rect x="3" y="4" width="2.2" height="1.8" fill="#ff007f" />
        <rect x="3" y="5.2" width="2.2" height="0.6" fill="#c2005f" />
        {/* Green hold */}
        <rect x="10" y="2" width="2" height="1.5" fill="#43a047" />
        <rect x="10" y="3" width="2" height="0.5" fill="#2e7d32" />
        {/* Gold hold */}
        <rect x="8" y="7" width="2.2" height="1.8" fill="#ffd700" />
        <rect x="8" y="8.2" width="2.2" height="0.6" fill="#c5a300" />
        {/* Cyan hold */}
        <rect x="5" y="10" width="2" height="2" fill="#00ffff" />
        <rect x="5" y="11.4" width="2" height="0.6" fill="#00b2b2" />
        {/* Orange hold */}
        <rect x="12" y="9" width="1.8" height="1.8" fill="#ff8c00" />
        <rect x="12" y="10.2" width="1.8" height="0.6" fill="#cc7000" />
        {/* Chalk dust marks */}
        <circle cx="4" cy="6" r="0.6" fill="#fff" opacity="0.5" />
        <circle cx="9" cy="9" r="0.8" fill="#fff" opacity="0.4" />
      </svg>
    );
  }

  if (type === 'tent') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <polygon points="1,14 15,14 8,3" fill="#1b3c1a" />
        <polygon points="3,14 8,14 8,5" fill="#43a047" />
        <polygon points="13,14 8,14 8,5" fill="#2e7d32" />
        <polygon points="6,14 10,14 8,8" fill="#111" />
        <line x1="1" y1="14" x2="0" y2="15" stroke="#999" strokeWidth="1" />
        <line x1="15" y1="14" x2="16" y2="15" stroke="#999" strokeWidth="1" />
      </svg>
    );
  }

  if (type === 'campfire') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <rect x="4" y="12" width="8" height="2" rx="1" fill="#5c3a21" />
        <rect x="6" y="10" width="4" height="2" rx="1" fill="#422f18" transform="rotate(25, 8, 11)" />
        <rect x="6" y="10" width="4" height="2" rx="1" fill="#422f18" transform="rotate(-25, 8, 11)" />
        <g className="flicker-flame">
          <polygon points="8,1 5,10 11,10" fill="#ff3d00" />
          <polygon points="8,3 6,9 10,9" fill="#ff9100" />
          <polygon points="8,5 7,9 9,9" fill="#ffea00" />
        </g>
        <style>{`
          @keyframes flame-flicker {
            0% { transform: scale(1) translateY(0); }
            50% { transform: scale(0.92, 1.08) translateY(-1px) rotate(1deg); }
            100% { transform: scale(1) translateY(0); }
          }
          .flicker-flame {
            transform-origin: 8px 11px;
            animation: flame-flicker 0.2s infinite ease-in-out;
          }
        `}</style>
      </svg>
    );
  }

  if (type === 'goalpost-top') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <rect x="0" y="0" width="16" height="16" fill="#143618" />
        <path d="M 0,0 L 16,16 M 0,4 L 12,16 M 0,8 L 8,16 M 0,12 L 4,16 M 4,0 L 16,12 M 8,0 L 16,8 M 12,0 L 16,4" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        <path d="M 0,16 L 16,0 M 0,12 L 12,0 M 0,8 L 8,0 M 0,4 L 4,0 M 4,16 L 16,4 M 8,16 L 16,8 M 12,16 L 16,12" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        <rect x="0" y="0" width="2" height="16" fill="#ffffff" /> 
        <rect x="0" y="0" width="16" height="2" fill="#ffffff" /> 
        <rect x="14" y="0" width="2" height="16" fill="#ffffff" /> 
      </svg>
    );
  }

  if (type === 'goalpost-mid') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <rect x="0" y="0" width="16" height="16" fill="#143618" />
        <path d="M 0,0 L 16,16 M 0,4 L 12,16 M 0,8 L 8,16 M 0,12 L 4,16 M 4,0 L 16,12 M 8,0 L 16,8 M 12,0 L 16,4" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        <path d="M 0,16 L 16,0 M 0,12 L 12,0 M 0,8 L 8,0 M 0,4 L 4,0 M 4,16 L 16,4 M 8,16 L 16,8 M 12,16 L 16,12" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        <rect x="0" y="0" width="2" height="16" fill="#ffffff" /> 
        <rect x="14" y="0" width="2" height="16" fill="#ffffff" /> 
      </svg>
    );
  }

  if (type === 'goalpost-bottom') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <rect x="0" y="0" width="16" height="16" fill="#143618" />
        <path d="M 0,0 L 16,16 M 0,4 L 12,16 M 0,8 L 8,16 M 0,12 L 4,16 M 4,0 L 16,12 M 8,0 L 16,8 M 12,0 L 16,4" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        <path d="M 0,16 L 16,0 M 0,12 L 12,0 M 0,8 L 8,0 M 0,4 L 4,0 M 4,16 L 16,4 M 8,16 L 16,8 M 12,16 L 16,12" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        <rect x="0" y="0" width="2" height="16" fill="#ffffff" /> 
        <rect x="0" y="14" width="16" height="2" fill="#ffffff" /> 
        <rect x="14" y="0" width="2" height="16" fill="#ffffff" /> 
      </svg>
    );
  }

  if (type === 'ball') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <ellipse cx="8" cy="13" rx="5" ry="2" fill="rgba(0,0,0,0.4)" />
        <circle cx="8" cy="8" r="6" fill="#ffffff" />
        <rect x="7" y="7" width="2" height="2" fill="#111" />
        <rect x="4" y="4" width="2" height="1" fill="#111" />
        <rect x="10" y="4" width="2" height="1" fill="#111" />
        <rect x="4" y="10" width="2" height="1" fill="#111" />
        <rect x="10" y="10" width="2" height="1" fill="#111" />
        <circle cx="8" cy="8" r="6" fill="none" stroke="#222222" strokeWidth="1" />
      </svg>
    );
  }

  if (type === 'suitcase') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <ellipse cx="8" cy="12" rx="6" ry="2.5" fill="rgba(0,0,0,0.4)" />
        <rect x="2" y="4" width="12" height="7" rx="1" fill="#a0522d" /> 
        <rect x="3" y="5" width="10" height="5" fill="#8b4513" /> 
        <rect x="4" y="4" width="2" height="7" fill="#5c3a21" />
        <rect x="10" y="4" width="2" height="7" fill="#5c3a21" />
        <rect x="4" y="6" width="2" height="1" fill="#ffd700" />
        <rect x="10" y="6" width="2" height="1" fill="#ffd700" />
        <rect x="6" y="2" width="4" height="2" rx="1" fill="none" stroke="#5c3a21" strokeWidth="1" />
        <rect x="2" y="4" width="1" height="1" fill="#ffd700" />
        <rect x="13" y="4" width="1" height="1" fill="#ffd700" />
        <rect x="2" y="10" width="1" height="1" fill="#ffd700" />
        <rect x="13" y="10" width="1" height="1" fill="#ffd700" />
        <rect x="1" y="9" width="3" height="4" fill="#0d1b3e" transform="rotate(-15, 2, 11)" /> 
        <rect x="2" y="10" width="1" height="2" fill="#ffd700" transform="rotate(-15, 2, 11)" /> 
      </svg>
    );
  }

  // --- NEW: 🕹️ ARCADE LORE CABINET ---
  if (type === 'arcade') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        {/* Chassis */}
        <rect x="2" y="1" width="12" height="14" fill="#4a154b" /> {/* Retro purple casing */}
        <rect x="3" y="2" width="10" height="13" fill="#2d0830" />
        {/* Screen */}
        <rect x="4" y="3" width="8" height="5" fill="#000" stroke="#00ffff" strokeWidth="1" />
        <rect x="5" y="4" width="6" height="3" fill="#1b2e1b" />
        {/* Glowing space invaders sprite pixels */}
        <rect x="7" y="5" width="2" height="1" fill="var(--rpg-text)" />
        {/* Control Panel board */}
        <rect x="3" y="9" width="10" height="2" fill="#111" />
        {/* Joysticks & buttons */}
        <circle cx="5" cy="10" r="1" fill="#ff0000" />
        <circle cx="11" cy="10" r="1" fill="#00ff66" />
        {/* Cabinet Coin Slot */}
        <rect x="7" y="12" width="2" height="3" fill="#111" />
        <rect x="7.5" y="12.5" width="1" height="1.5" fill="#ffd700" />
      </svg>
    );
  }

  // --- NEW: 📽️ POLAROID PROJECTOR ---
  if (type === 'projector') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        {/* Base stand */}
        <rect x="4" y="13" width="8" height="2" fill="#333" />
        <rect x="7" y="10" width="2" height="3" fill="#666" />
        {/* Projector Body */}
        <rect x="3" y="4" width="10" height="6" rx="1" fill="#cfd8dc" />
        <rect x="4" y="5" width="8" height="4" fill="#90a4ae" />
        {/* Reels */}
        <circle cx="5" cy="3" r="3" fill="#78909c" />
        <circle cx="11" cy="3" r="3" fill="#78909c" />
        <circle cx="5" cy="3" r="1" fill="#111" />
        <circle cx="11" cy="3" r="1" fill="#111" />
        {/* Lens */}
        <rect x="12" y="5" width="2" height="4" fill="#ff8c00" />
        {/* Glowing Beam */}
        <polygon points="14,7 16,4 16,10" fill="rgba(255, 235, 59, 0.3)" />
      </svg>
    );
  }

  // --- NEW: 🪧 BULLETIN GUESTBOOK BOARD ---
  if (type === 'bulletin') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        {/* Wooden Frame */}
        <rect x="1" y="1" width="14" height="14" fill="#8b4513" />
        <rect x="2" y="2" width="12" height="12" fill="#cd853f" /> {/* Cork board beige */}
        {/* Pinned visitor sheets */}
        <rect x="3" y="3" width="4" height="5" fill="#ffffff" /> {/* Note 1 */}
        <rect x="4" y="4" width="2" height="1" fill="#1e88e5" />
        <rect x="8" y="4" width="5" height="4" fill="#fff59d" /> {/* Note 2 */}
        <rect x="9" y="5" width="3" height="1" fill="#ff8c00" />
        <rect x="4" y="9" width="8" height="4" fill="#e0f2f1" /> {/* Note 3 */}
        <rect x="5" y="10" width="6" height="1" fill="#43a047" />
        {/* Push-Pins */}
        <circle cx="5" cy="3" r="0.7" fill="#ff0000" />
        <circle cx="10" cy="4" r="0.7" fill="#00ffff" />
        <circle cx="8" cy="9" r="0.7" fill="#ffd700" />
      </svg>
    );
  }

  // --- NEW: 🚲 RETRO RED BICYCLE ---
  if (type === 'bike') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        {/* Mechanic's mat */}
        <rect x="1" y="10" width="14" height="5" fill="#33333b" rx="1" />
        <rect x="2" y="11" width="12" height="3" fill="#222227" rx="0.5" />
        {/* Kickstand */}
        <line x1="8" y1="10" x2="6" y2="13" stroke="#555" strokeWidth="1" />
        {/* Shadow */}
        <ellipse cx="8" cy="12.5" rx="5" ry="1.5" fill="rgba(0,0,0,0.4)" />
        {/* Wheels */}
        <circle cx="4.5" cy="11.5" r="2.8" fill="#111" stroke="#555" strokeWidth="0.8" />
        <circle cx="11.5" cy="11.5" r="2.8" fill="#111" stroke="#555" strokeWidth="0.8" />
        {/* Engine and Exhaust block */}
        <rect x="6.5" y="9.5" width="3.5" height="2.5" fill="#555" />
        <rect x="7" y="10" width="2.5" height="1.5" fill="#888" />
        <line x1="9.5" y1="11" x2="13.5" y2="11" stroke="#aaa" strokeWidth="1.2" /> {/* Exhaust pipe */}
        {/* Red frame body */}
        <polygon points="4.5,11.5 8,6 10.5,6.5 11.5,11.5 8,11.5" fill="#e53935" />
        <rect x="7.5" y="6" width="3" height="2" fill="#d32f2f" rx="0.5" /> {/* Gas tank */}
        {/* Black leather seat */}
        <rect x="8.5" y="5.2" width="2.8" height="1" fill="#111" rx="0.5" />
        {/* Handlebars */}
        <line x1="11.5" y1="11.5" x2="10.5" y2="4.5" stroke="#777" strokeWidth="1" />
        <line x1="9.5" y1="4.5" x2="11.5" y2="4.5" stroke="#222" strokeWidth="1" />
        {/* Headlight */}
        <rect x="9.3" y="5.2" width="1.2" height="1.2" fill="#ffd700" />
      </svg>
    );
  }

  // --- NEW: 🏁 LOOP CHECKPOINT GATE ---
  if (type === 'checkpoint') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        {/* Support Post */}
        <rect x="7" y="5" width="2" height="11" fill="#777" />
        {/* Checkered Flag */}
        <rect x="9" y="2" width="6" height="4" fill="#000" />
        <rect x="9" y="2" width="2" height="2" fill="#fff" />
        <rect x="13" y="2" width="2" height="2" fill="#fff" />
        <rect x="11" y="4" width="2" height="2" fill="#fff" />
        {/* Glowing Indicator light at the top of flag */}
        <circle cx="8" cy="1" r="1.2" fill="#00ff66" style={{ animation: 'light-glow 1s infinite alternate' }} />
        
        <style>{`
          @keyframes light-glow {
            0% { fill: #00ff66; filter: drop-shadow(0 0 2px #00ff66); }
            100% { fill: #ff007f; filter: drop-shadow(0 0 5px #ff007f); }
          }
        `}</style>
      </svg>
    );
  }

  // --- NEW: 🍕 PIZZA FOOD PILE ---
  if (type === 'pizza') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        {/* Shadow */}
        <ellipse cx="8" cy="12" rx="4" ry="1.5" fill="rgba(0,0,0,0.3)" />
        {/* Triangular Slice */}
        <polygon points="8,3 3,11 13,11" fill="#ffd54f" /> {/* Cheese yellow */}
        <polygon points="3,11 13,11 8,12" fill="#d84315" /> {/* Crust brown */}
        {/* Pepperoni circles */}
        <circle cx="6" cy="8" r="1" fill="#e53935" />
        <circle cx="10" cy="8" r="1" fill="#e53935" />
        <circle cx="8" cy="6" r="1" fill="#e53935" />
      </svg>
    );
  }

  // --- NEW: 🥤 SODA CAN ENERGY RESTORE ---
  if (type === 'can') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        {/* Shadow */}
        <ellipse cx="8" cy="13" rx="3" ry="1.2" fill="rgba(0,0,0,0.3)" />
        {/* Can cylindrical shape */}
        <rect x="5" y="4" width="6" height="8" rx="1" fill="#e53935" /> {/* Red can */}
        <rect x="5" y="3" width="6" height="1" fill="#cfd8dc" /> {/* Silver tab rim */}
        {/* Diagonal Swoosh white detail */}
        <line x1="6" y1="10" x2="10" y2="6" stroke="#ffffff" strokeWidth="1" />
      </svg>
    );
  }

  // --- NEW: 🧤 GOALIE NPC SPRITE ---
  if (type === 'goalie') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        {/* Shadow */}
        <ellipse cx="8" cy="14" rx="4" ry="1.5" fill="rgba(0,0,0,0.4)" />
        {/* Torso team jersey (Yellow/Green) */}
        <rect x="4" y="7" width="8" height="5" rx="1" fill="#ffd700" />
        <rect x="6" y="7" width="4" height="5" fill="#43a047" /> {/* center stripe */}
        <rect x="4" y="11" width="8" height="2" fill="#111" /> {/* black shorts */}
        {/* Head */}
        <rect x="5" y="3" width="6" height="4" fill="#ffb6c1" />
        <rect x="5" y="2" width="6" height="2" fill="#8b4513" /> {/* brown hair */}
        {/* Goalie huge gloves */}
        <rect x="1" y="6" width="3" height="4" fill="#ff8c00" stroke="#111" strokeWidth="0.5" /> {/* Left Glove */}
        <rect x="12" y="6" width="3" height="4" fill="#ff8c00" stroke="#111" strokeWidth="0.5" /> {/* Right Glove */}
        {/* Arms */}
        <rect x="2" y="7" width="2" height="2" fill="#ffd700" />
        <rect x="12" y="7" width="2" height="2" fill="#ffd700" />
        {/* Eyes */}
        <rect x="6" y="4" width="1" height="1" fill="#111" />
        <rect x="9" y="4" width="1" height="1" fill="#111" />
        {/* Shoes */}
        <rect x="4" y="13" width="3" height="2" fill="#fff" />
        <rect x="9" y="13" width="3" height="2" fill="#fff" />
      </svg>
    );
  }

  // --- MOTORBIKES: SHINE (BLUE CRUISER) ---
  if (type === 'motorbike-shine') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <ellipse cx="8" cy="13" rx="6" ry="1.5" fill="rgba(0,0,0,0.4)" />
        <circle cx="3.5" cy="10.5" r="3.2" fill="#111" stroke="#888" strokeWidth="0.8" />
        <circle cx="12.5" cy="10.5" r="3.2" fill="#111" stroke="#888" strokeWidth="0.8" />
        <line x1="3.5" y1="10.5" x2="8" y2="10.5" stroke="#1e88e5" strokeWidth="1.2" />
        <line x1="12.5" y1="10.5" x2="8" y2="10.5" stroke="#1e88e5" strokeWidth="1.2" />
        <rect x="6" y="6" width="4.5" height="3" fill="#1e88e5" rx="1" />
        <rect x="5.5" y="5.5" width="2" height="1.5" fill="#ffd700" /> {/* Headlight */}
        <rect x="6.8" y="5.2" width="2.5" height="1" fill="#222" rx="0.5" /> {/* Seat */}
        <line x1="12.5" y1="10.5" x2="11.5" y2="4.5" stroke="#666" strokeWidth="1.2" /> {/* Handlebar */}
        <rect x="10.5" y="4.5" width="2.5" height="0.8" fill="#111" />
      </svg>
    );
  }

  // --- MOTORBIKES: MT15 (NEON SPORTS BIKE) ---
  if (type === 'motorbike-mt15') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <ellipse cx="8" cy="13" rx="6" ry="1.5" fill="rgba(0,0,0,0.4)" />
        <circle cx="3.5" cy="10.5" r="3.2" fill="#111" stroke="#39ff14" strokeWidth="1" />
        <circle cx="12.5" cy="10.5" r="3.2" fill="#111" stroke="#39ff14" strokeWidth="1" />
        <line x1="3.5" y1="10.5" x2="8" y2="10.5" stroke="#37474f" strokeWidth="1.5" />
        <line x1="12.5" y1="10.5" x2="8" y2="10.5" stroke="#37474f" strokeWidth="1.5" />
        <polygon points="5.5,5 11.5,5.5 10.5,9.5 6,9" fill="#212121" /> {/* Body */}
        <polygon points="5.5,5 7.5,4 9.5,4 10.5,5.5" fill="#39ff14" /> {/* Neon Cowling */}
        <rect x="5.5" y="4.5" width="2" height="1" fill="#ffd700" /> {/* Sharp Light */}
        <rect x="8" y="4.5" width="2.5" height="1" fill="#111" rx="0.5" /> {/* Seat */}
        <line x1="12.5" y1="10.5" x2="11" y2="4" stroke="#444" strokeWidth="1.5" /> {/* Handlebars */}
      </svg>
    );
  }

  // --- CYBER TYRE WALL OBSTACLE ---
  if (type === 'tyre') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <ellipse cx="8" cy="12" rx="6" ry="2.5" fill="rgba(0,0,0,0.4)" />
        <circle cx="8" cy="7.5" r="6.2" fill="#1b1b1b" stroke="#333" strokeWidth="1.2" />
        <circle cx="8" cy="7.5" r="3" fill="#cfd8dc" stroke="#90a4ae" strokeWidth="0.8" />
        {/* Treads */}
        <line x1="8" y1="1.3" x2="8" y2="3.3" stroke="#222" strokeWidth="0.8" />
        <line x1="1.3" y1="7.5" x2="3.3" y2="7.5" stroke="#222" strokeWidth="0.8" />
        <line x1="12.7" y1="7.5" x2="14.7" y2="7.5" stroke="#222" strokeWidth="0.8" />
        <line x1="8" y1="11.7" x2="8" y2="13.7" stroke="#222" strokeWidth="0.8" />
      </svg>
    );
  }

  // --- DINER FOODS: DBT POPCORN ---
  if (type === 'dbt-popcorn') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <ellipse cx="8" cy="13.5" rx="4" ry="1.2" fill="rgba(0,0,0,0.3)" />
        {/* Popcorn Bucket */}
        <polygon points="5,6 11,6 10,13 6,13" fill="#ffffff" />
        {/* Red Stripes */}
        <rect x="6.2" y="6" width="0.9" height="7" fill="#e53935" />
        <rect x="8" y="6" width="0.9" height="7" fill="#e53935" />
        <rect x="9.8" y="6" width="0.9" height="7" fill="#e53935" />
        {/* Popcorn Kernels (Yellow puffy circles) */}
        <circle cx="5" cy="5" r="1.5" fill="#ffe082" />
        <circle cx="6.5" cy="4.2" r="1.6" fill="#ffd54f" />
        <circle cx="8" cy="3.5" r="1.7" fill="#ffb300" />
        <circle cx="9.5" cy="4.2" r="1.6" fill="#ffd54f" />
        <circle cx="11" cy="5" r="1.5" fill="#ffe082" />
        <circle cx="7" cy="5.2" r="1.5" fill="#ffe082" />
        <circle cx="9" cy="5.2" r="1.5" fill="#ffd54f" />
      </svg>
    );
  }

  // --- DINER FOODS: SHWARMA WRAP ---
  if (type === 'shwarma') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <ellipse cx="8" cy="13.5" rx="3.5" ry="1" fill="rgba(0,0,0,0.3)" />
        {/* Foil base */}
        <polygon points="6,9 10,9 9.5,13.5 6.5,13.5" fill="#b0bec5" />
        <line x1="6.3" y1="11" x2="9.7" y2="11" stroke="#90a4ae" strokeWidth="0.8" />
        {/* Wrap Bread */}
        <rect x="5.5" y="6" width="5" height="3.5" rx="1.2" fill="#ffd54f" />
        {/* Meat and greens sticking out */}
        <rect x="6" y="3.5" width="1.5" height="3" fill="#8d6e63" />
        <rect x="8.5" y="3.8" width="1.2" height="2.5" fill="#4caf50" />
        <rect x="7.3" y="3.2" width="1.6" height="3" fill="#a1887f" />
        <circle cx="7" cy="3.5" r="0.8" fill="#e53935" /> {/* Tomato red */}
      </svg>
    );
  }

  // --- DINER FOODS: CHAAP SKEWER ---
  if (type === 'chaap') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <ellipse cx="8" cy="13.5" rx="3" ry="1" fill="rgba(0,0,0,0.3)" />
        {/* Wooden Skewer Stick */}
        <rect x="7.5" y="2" width="1" height="12" fill="#d7ccc8" />
        {/* skewered soya pieces (spicy red-orange rectangles) */}
        <rect x="4.5" y="3.5" width="7" height="2.2" rx="0.5" fill="#ff7043" stroke="#e64a19" strokeWidth="0.5" />
        <rect x="4" y="6.5" width="8" height="2.2" rx="0.5" fill="#ff7043" stroke="#e64a19" strokeWidth="0.5" />
        <rect x="4.5" y="9.5" width="7" height="2.2" rx="0.5" fill="#ff7043" stroke="#e64a19" strokeWidth="0.5" />
        {/* Herb sprinkles */}
        <rect x="6" y="4" width="0.8" height="0.8" fill="#4caf50" />
        <rect x="9" y="7" width="0.8" height="0.8" fill="#4caf50" />
        <rect x="7" y="10.2" width="0.8" height="0.8" fill="#4caf50" />
      </svg>
    );
  }

  // --- DINER FOODS: GARLIC BREAD ---
  if (type === 'garlic-bread') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <ellipse cx="8" cy="12.5" rx="4.5" ry="1.2" fill="rgba(0,0,0,0.3)" />
        {/* Bread Slice */}
        <ellipse cx="8" cy="7.5" rx="6" ry="4" fill="#d7ccc8" stroke="#8d6e63" strokeWidth="1" />
        <ellipse cx="8" cy="7.5" rx="5" ry="3" fill="#ffe082" /> {/* buttery center */}
        {/* Grilled herb marks */}
        <circle cx="5" cy="7" r="0.6" fill="#2e7d32" />
        <circle cx="7.2" cy="5.8" r="0.7" fill="#2e7d32" />
        <circle cx="9" cy="8.2" r="0.6" fill="#2e7d32" />
        <circle cx="11" cy="7.2" r="0.6" fill="#2e7d32" />
        <circle cx="7" cy="8.5" r="0.5" fill="#2e7d32" />
        {/* Garlic butter drops */}
        <circle cx="6" cy="6" r="0.5" fill="#ffd54f" />
        <circle cx="10" cy="8" r="0.5" fill="#ffd54f" />
      </svg>
    );
  }

  // --- DINER FOODS: THUMBS UP GLASS BOTTLE ---
  if (type === 'thumbs-up') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <ellipse cx="8" cy="13.5" rx="2.5" ry="1" fill="rgba(0,0,0,0.3)" />
        {/* Bottle Neck & Mouth */}
        <rect x="7" y="2" width="2" height="1" rx="0.5" fill="#cfd8dc" />
        <rect x="7.3" y="3" width="1.4" height="3" fill="rgba(77, 182, 172, 0.4)" stroke="#4db6ac" strokeWidth="0.5" />
        {/* Glass Bottle Body */}
        <rect x="5.5" y="6" width="5" height="7.5" rx="1.5" fill="rgba(77, 182, 172, 0.3)" stroke="#4db6ac" strokeWidth="0.5" />
        {/* Dark Cola Liquid inside */}
        <rect x="6" y="6.8" width="4" height="6" rx="0.5" fill="#211107" />
        {/* Red Shield Logo */}
        <polygon points="6.8,8.2 9.2,8.2 8,10.2" fill="#e53935" />
        <circle cx="8" cy="8.8" r="0.7" fill="#ffffff" /> {/* small white thumb silhouette */}
      </svg>
    );
  }

  // --- DINER FOODS: HOT COFFEE MUG ---
  if (type === 'coffee') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <ellipse cx="7.5" cy="13.2" rx="3.8" ry="1.2" fill="rgba(0,0,0,0.3)" />
        {/* Mug Handle */}
        <path d="M 9.5,7.5 C 12.5,7.5 12.5,11.5 9.5,11.5" fill="none" stroke="#eeeeee" strokeWidth="1.8" />
        {/* Ceramic Mug Cup */}
        <rect x="3.5" y="6.2" width="7" height="6.5" rx="1" fill="#ffffff" stroke="#e0e0e0" strokeWidth="0.5" />
        <rect x="4.2" y="6.8" width="5.6" height="1" fill="#5c3a21" /> {/* Hot Coffee line */}
        {/* Steam waves */}
        <path d="M 5,2 Q 6,3 5,4 Q 6,5 5,6" fill="none" stroke="#b0bec5" strokeWidth="0.6" />
        <path d="M 7,1.8 Q 8,2.8 7,3.8 Q 8,4.8 7,5.8" fill="none" stroke="#b0bec5" strokeWidth="0.6" />
        <path d="M 9,2.2 Q 10,3.2 9,4.2 Q 10,5.2 9,6.2" fill="none" stroke="#b0bec5" strokeWidth="0.6" />
      </svg>
    );
  }

  // --- GILDED VISITOR GALLERY PHOTO FRAME ---
  if (type === 'photo-frame') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        {/* Gilded frame shadow */}
        <rect x="1" y="2" width="14" height="12" fill="#5c3a21" />
        <rect x="1.5" y="2.5" width="13" height="11" fill="#ffd700" /> {/* Shiny gold rim */}
        <rect x="3" y="4" width="10" height="8" fill="#111" /> {/* Glass display inner */}
        {/* Glimmer slash on glass */}
        <line x1="4" y1="11" x2="11" y2="4" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
        {/* Portrait Silhouette */}
        <circle cx="8" cy="7.2" r="2.2" fill="#555" />
        <path d="M 4.2,11.5 C 4.2,9.2 6,9 8,9 C 10,9 11.8,9.2 11.8,11.5 Z" fill="#555" />
      </svg>
    );
  }

  if (type === 'stove') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <rect x="1" y="1" width="14" height="14" fill="#37474f" />
        <rect x="2" y="2" width="12" height="12" fill="#212121" />
        <circle cx="5" cy="5" r="2.2" fill="none" stroke="#e53935" strokeWidth="1" />
        <circle cx="5" cy="5" r="0.8" fill="#e53935" />
        <circle cx="11" cy="5" r="1.8" fill="none" stroke="#e53935" strokeWidth="0.8" />
        <circle cx="5" cy="11" r="1.8" fill="none" stroke="#e53935" strokeWidth="0.8" />
        <circle cx="11" cy="11" r="2.2" fill="none" stroke="#e53935" strokeWidth="1" />
        <circle cx="11" cy="11" r="0.8" fill="#e53935" />
        <rect x="3" y="1" width="1" height="1" fill="#cfd8dc" />
        <rect x="6" y="1" width="1" height="1" fill="#cfd8dc" />
        <rect x="9" y="1" width="1" height="1" fill="#cfd8dc" />
        <rect x="12" y="1" width="1" height="1" fill="#cfd8dc" />
      </svg>
    );
  }

  if (type === 'kitchen-counter') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <rect x="1" y="1" width="14" height="14" fill="#8d6e63" />
        <rect x="2" y="2" width="12" height="12" fill="#5d4037" />
        <rect x="3" y="4" width="7" height="8" rx="0.5" fill="#d7ccc8" />
        <rect x="4" y="6" width="1.5" height="1.5" fill="#4caf50" />
        <rect x="7" y="8" width="1.5" height="1.5" fill="#e53935" />
        <line x1="8" y1="5" x2="6" y2="7" stroke="#37474f" strokeWidth="0.8" />
      </svg>
    );
  }

  if (type === 'toolbox') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        {/* Shadow */}
        <ellipse cx="8" cy="14.5" rx="5" ry="1.2" fill="rgba(0,0,0,0.5)" />
        {/* Toolbox Main Body (Red Chrome) */}
        <rect x="2" y="2" width="12" height="11" fill="#c62828" rx="0.5" />
        {/* Gold Cabinet Trim */}
        <rect x="2" y="1" width="12" height="1" fill="#ffeb3b" />
        <rect x="1" y="2" width="1" height="11" fill="#ffeb3b" />
        <rect x="14" y="2" width="1" height="11" fill="#ffeb3b" />
        {/* Drawers lines & chrome handles */}
        {/* Drawer 1 */}
        <rect x="3" y="3.2" width="10" height="1.8" fill="#1e1e1e" />
        <rect x="5" y="3.8" width="6" height="0.6" fill="#cfd8dc" />
        {/* Drawer 2 */}
        <rect x="3" y="5.8" width="10" height="1.8" fill="#1e1e1e" />
        <rect x="5" y="6.4" width="6" height="0.6" fill="#cfd8dc" />
        {/* Drawer 3 */}
        <rect x="3" y="8.4" width="10" height="1.8" fill="#1e1e1e" />
        <rect x="5" y="9.0" width="6" height="0.6" fill="#cfd8dc" />
        {/* Bottom Lock panel */}
        <rect x="3" y="11" width="10" height="1.5" fill="#3e2723" />
        <circle cx="8" cy="11.7" r="0.6" fill="#ffd700" />
        {/* Caster Wheels */}
        <rect x="3.5" y="13" width="2" height="2" fill="#263238" />
        <rect x="10.5" y="13" width="2" height="2" fill="#263238" />
      </svg>
    );
  }

  if (type === 'hangboard') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        {/* Wooden Mount Plate */}
        <rect x="1" y="4" width="14" height="7" fill="#3e2723" rx="0.5" stroke="#27150c" strokeWidth="0.8" />
        {/* Hangboard Body (Granite grey composite) */}
        <rect x="2" y="5" width="12" height="5" fill="#78909c" rx="1" />
        <rect x="2.5" y="5.5" width="11" height="4" fill="#546e7a" rx="0.5" />
        {/* Edge / Pocket holds */}
        {/* Outer deep jugs */}
        <rect x="3" y="6" width="2.2" height="1.2" fill="#263238" />
        <rect x="10.8" y="6" width="2.2" height="1.2" fill="#263238" />
        {/* Mid pockets */}
        <rect x="5.8" y="6.2" width="1.8" height="1" fill="#1c282d" />
        <rect x="8.4" y="6.2" width="1.8" height="1" fill="#1c282d" />
        {/* Crimp edges */}
        <rect x="3.5" y="8" width="4" height="0.8" fill="#111" />
        <rect x="8.5" y="8" width="4" height="0.8" fill="#111" />
        {/* Screw points */}
        <circle cx="2.5" cy="4.5" r="0.4" fill="#bbb" />
        <circle cx="13.5" cy="4.5" r="0.4" fill="#bbb" />
      </svg>
    );
  }

  if (type === 'tacticboard') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        {/* Shadow */}
        <ellipse cx="8" cy="14.8" rx="5" ry="1.2" fill="rgba(0,0,0,0.4)" />
        {/* Wood Stand Legs */}
        <line x1="4" y1="9" x2="2.5" y2="15" stroke="#5c3a21" strokeWidth="1.2" />
        <line x1="12" y1="9" x2="13.5" y2="15" stroke="#5c3a21" strokeWidth="1.2" />
        <line x1="8" y1="9" x2="8" y2="14.5" stroke="#422f18" strokeWidth="0.8" />
        {/* Board Wooden Frame */}
        <rect x="1.5" y="1" width="13" height="9" fill="#5c3a21" rx="0.5" />
        {/* Green Blackboard */}
        <rect x="2.2" y="1.8" width="11.6" height="7.4" fill="#1b3c1a" />
        {/* Chalk Tactics Drawing */}
        {/* Soccer Field Pitch outline */}
        <rect x="3" y="2.5" width="10" height="6" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6" />
        <line x1="8" y1="2.5" x2="8" y2="8.5" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6" />
        <circle cx="8" cy="5.5" r="1.5" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6" />
        {/* X and O plays */}
        <circle cx="5" cy="4.2" r="0.5" fill="none" stroke="#e53935" strokeWidth="0.6" /> {/* Attack O */}
        <circle cx="6.5" cy="5.5" r="0.5" fill="none" stroke="#e53935" strokeWidth="0.6" />
        {/* Defense X */}
        <path d="M 9.5,4 L 10.5,5 M 10.5,4 L 9.5,5" stroke="#29b6f6" strokeWidth="0.6" />
        <path d="M 11,6 L 12,7 M 12,6 L 11,7" stroke="#29b6f6" strokeWidth="0.6" />
        {/* Tactical Arrow */}
        <path d="M 5,4.2 Q 7,3 9.8,4.5" fill="none" stroke="#ffd700" strokeWidth="0.6" />
        <polygon points="9.8,4.5 9,4.1 9.5,5" fill="#ffd700" />
      </svg>
    );
  }

  if (type === 'cd_shelf') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        {/* Wooden Frame */}
        <rect x="2" y="1" width="12" height="14" fill={wood} />
        <rect x="3" y="2" width="10" height="12" fill={woodDark} />
        {/* Horizontal CD Shelves */}
        <rect x="3" y="5" width="10" height="1" fill={wood} />
        <rect x="3" y="9" width="10" height="1" fill={wood} />
        {/* Row 1 CDs */}
        <rect x="4" y="2.5" width="0.8" height="2.2" fill="#ffd700" />
        <rect x="5" y="2.5" width="0.8" height="2.2" fill="#00ffff" />
        <rect x="6" y="2.5" width="0.8" height="2.2" fill="#ff00ff" />
        <rect x="7" y="2.5" width="0.8" height="2.2" fill="#ff8c00" />
        <rect x="8" y="2.5" width="0.8" height="2.2" fill="#39ff14" />
        <rect x="9.5" y="3.2" width="2" height="1.5" fill="#e53935" transform="rotate(15, 10, 3)" />
        {/* Row 2 CDs */}
        <rect x="4" y="6.5" width="0.8" height="2.2" fill="#ff007f" />
        <rect x="5" y="6.5" width="0.8" height="2.2" fill="#8a2be2" />
        <rect x="6.2" y="6.5" width="0.8" height="2.2" fill="#eeeeee" />
        <rect x="7.5" y="6.5" width="0.8" height="2.2" fill="#00ff66" />
        <rect x="8.5" y="6.5" width="0.8" height="2.2" fill="#ff8c00" />
        <rect x="9.5" y="6.5" width="0.8" height="2.2" fill="#00ffff" />
        {/* Row 3 Films / Vinyls */}
        <rect x="4" y="10.5" width="2.2" height="2.2" fill="#e53935" />
        <circle cx="5.1" cy="11.6" r="0.7" fill="#111" />
        <rect x="7.2" y="10.5" width="2.2" height="2.2" fill="#1e88e5" />
        <rect x="10" y="10.5" width="2.2" height="2.2" fill="#43a047" />
      </svg>
    );
  }

  if (type === 'computerglowing') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        {/* Desk under PC */}
        <rect x="0" y="11" width="16" height="5" fill="#4e3b26" stroke="#2e1f10" strokeWidth="0.8" />
        {/* Dual Monitors Setup */}
        {/* Left Monitor (Coding screen - blue neon code lines) */}
        <rect x="1.5" y="3" width="6.2" height="5" fill="#111" stroke="#00e5ff" strokeWidth="0.6" />
        <rect x="2" y="3.5" width="5.2" height="4" fill="#000" />
        {/* Code lines visual */}
        <line x1="2.5" y1="4.2" x2="6" y2="4.2" stroke="#00e5ff" strokeWidth="0.5" />
        <line x1="2.5" y1="5.2" x2="4.5" y2="5.2" stroke="#ff007f" strokeWidth="0.5" />
        <line x1="2.5" y1="6.2" x2="5" y2="6.2" stroke="#ffd700" strokeWidth="0.5" />
        {/* Right Monitor (Stock chart screen - green indices) */}
        <rect x="8.3" y="3" width="6.2" height="5" fill="#111" stroke="#39ff14" strokeWidth="0.6" />
        <rect x="8.8" y="3.5" width="5.2" height="4" fill="#000" />
        {/* Graph lines visual */}
        <path d="M 9.2,6.5 L 10.5,5.2 L 12,6 L 13.5,4.2" fill="none" stroke="#39ff14" strokeWidth="0.6" />
        {/* Monitor stands */}
        <rect x="4" y="8" width="1.2" height="3.2" fill="#37474f" />
        <rect x="10.8" y="8" width="1.2" height="3.2" fill="#37474f" />
        <rect x="2.5" y="11" width="4.2" height="0.8" fill="#1c282d" />
        <rect x="9.3" y="11" width="4.2" height="0.8" fill="#1c282d" />
        {/* Keyboard on desk */}
        <rect x="5.5" y="12" width="5" height="1.2" fill="#1e1e1e" stroke="#555" strokeWidth="0.4" />
        {/* Neon Glowing PC Tower on left side */}
        <rect x="0.2" y="5.2" width="1.5" height="6.2" fill="#212121" />
        <rect x="0.4" y="5.8" width="1.1" height="5" fill="#ff007f" opacity="0.8" /> {/* glowing pink fan */}
      </svg>
    );
  }

  if (type === 'beanbag') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        {/* Shadow */}
        <ellipse cx="8" cy="13.2" rx="6.2" ry="2" fill="rgba(0,0,0,0.35)" />
        {/* Bean Bag Body (Squishy round orange) */}
        <ellipse cx="8" cy="9.2" rx="6" ry="4.5" fill="#ff7043" />
        {/* Center indentation reading seat */}
        <ellipse cx="8" cy="8.2" rx="4.2" ry="2.2" fill="#f4511e" />
        {/* Stitching and folding lines */}
        <path d="M 2.2,9.2 C 4,11 6,12.5 8,12.5 C 10,12.5 12,11 13.8,9.2" fill="none" stroke="#d84315" strokeWidth="0.8" />
        <path d="M 8,6.2 C 8,7.2 8,8.2 8,11.2" fill="none" stroke="#d84315" strokeWidth="0.8" />
        <path d="M 4.2,8 C 5,8.8 6.5,9.2 8,9.2" fill="none" stroke="#d84315" strokeWidth="0.6" strokeDasharray="1.2 0.8" />
        <path d="M 11.8,8 C 11,8.8 9.5,9.2 8,9.2" fill="none" stroke="#d84315" strokeWidth="0.6" strokeDasharray="1.2 0.8" />
      </svg>
    );
  }

  // Fallback
  return <div style={{ width: '4px', height: '4px', background: '#333' }} />;
}
