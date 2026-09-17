import React, { useState } from 'react';

const PROP_IMAGE_MAP = {
  'bed': '/props/bed.png',
  'bike': '/props/bike.png',
  'bouldering-wall': '/props/bouldering-wall.png',
  'climbing_wall': '/props/bouldering-wall.png',
  'hangboard': '/props/hangboard.png',
  'computerglowing': '/props/computerglowing.png',
  'computer_desk': '/props/computerglowing.png',
  'arcade': '/props/arcade.png',
  'manga_arcade': '/props/arcade.png',
  'tacticboard': '/props/tacticboard.png',
  'tactics_board': '/props/tacticboard.png',
  'travel-table': '/props/travel-table.png',
  'travel_desk': '/props/travel-table.png',
  'bookshelf': '/props/bookshelf.png',
  'bookshelf-top': '/props/bookshelf.png',
  'bookshelf-bottom': '/props/bookshelf.png',
  'fridge': '/props/fridge.png',
  'stove': '/props/stove.png',
  'kitchen-counter': '/props/kitchen-counter.png',
  'kitchen_prep': '/props/kitchen-counter.png',
  'beanbag': '/props/beanbag.png',
  'projector': '/props/projector.png',
  'anime_pedestal': '/props/projector.png',
  'bulletin': '/props/bulletin.png',
  'hall_of_fame': '/props/bulletin.png',
  'suitcase': '/props/suitcase.png',
  'tent': '/props/tent.png',
  'campfire': '/props/campfire.png',
  'tyre': '/props/tyre.png',
  'tire': '/props/tyre.png',
};

// ───────────────────────────────────────────────────────────────────────────
// PixelProp — one cohesive warm "cozy 16-bit" pixel-art sprite set.
// Every prop is an inline SVG drawn as chunky rects on a 16-wide grid
// (taller viewBoxes for tall sprites). Shared warm palette below.
// ───────────────────────────────────────────────────────────────────────────

const OUT = '#3a2419';      // dark outline
const WOOD = '#c8884a';     // honey wood
const WOOD_LT = '#e0a96b';  // light wood
const WOOD_DK = '#8a5a30';  // dark wood
const CREAM = '#f3e6c8';
const TEAL = '#4fa098';
const TEAL_DK = '#3a7a73';
const CORAL = '#e2725b';
const RED = '#c0392b';
const SAGE = '#7fa05a';
const SAGE_DK = '#5c7a40';
const GREY = '#9aa0a8';
const GREY_DK = '#5c6066';
const NIGHT = '#2e2a3a';    // dark screens / shadow fills
const GOLD = '#e8b54a';

// Derived shades (kept in-family with the palette above)
const TEAL_LT = '#79c0b6';
const CORAL_LT = '#ea8d76';
const CORAL_DK = '#b85544';
const CREAM_DK = '#d9cdb0';
const RED_DK = '#962d22';
const GOLD_DK = '#c08a2e';
const WHITE = '#fbf6ec';
const SKIN = '#f0c8a0';
const TERRA = '#b85c3a';
const TERRA_LT = '#d27a50';
const PLY = '#cbb289';      // plywood tan
const PLY_DK = '#a8916b';
const PAD_BLUE = '#4a6fa5'; // crash pad / cruiser blue
const PAD_BLUE_LT = '#6d8fc0';
const SCREEN = '#bfe3d8';   // muted pale-teal screen glow
const SCREEN_BG = '#22383b';
const SHADOW = 'rgba(0,0,0,0.25)';
const NET = 'rgba(255,255,255,0.35)';

function Shadow({ cx = 8, cy = 14.6, rx = 5.5, ry = 1.1 }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={SHADOW} />;
}

// Net cross-hatch shared by all three goalpost segments so the diagonals
// align when the tiles stack vertically (pattern repeats every 16 units).
function NetLines() {
  return (
    <g stroke={NET} strokeWidth="0.5" fill="none">
      <path d="M0,0 L16,16 M0,4 L12,16 M0,8 L8,16 M0,12 L4,16 M4,0 L16,12 M8,0 L16,8 M12,0 L16,4" />
      <path d="M0,16 L16,0 M0,12 L12,0 M0,8 L8,0 M0,4 L4,0 M4,16 L16,4 M8,16 L16,8 M12,16 L16,12" />
    </g>
  );
}

function GoalPosts({ top = false, bottom = false }) {
  return (
    <g>
      {/* left + right uprights (same x in every tile so segments align) */}
      <rect x="0" y="0" width="2.6" height="16" fill={OUT} />
      <rect x="0.5" y="0" width="1.6" height="16" fill="#ffffff" />
      <rect x="1.7" y="0" width="0.4" height="16" fill={CREAM_DK} />
      <rect x="13.4" y="0" width="2.6" height="16" fill={OUT} />
      <rect x="13.9" y="0" width="1.6" height="16" fill="#ffffff" />
      <rect x="15.1" y="0" width="0.4" height="16" fill={CREAM_DK} />
      {top && (
        <g>
          <rect x="0" y="0" width="16" height="2.6" fill={OUT} />
          <rect x="0" y="0.5" width="16" height="1.6" fill="#ffffff" />
          <rect x="0" y="1.7" width="16" height="0.4" fill={CREAM_DK} />
        </g>
      )}
      {bottom && (
        <g>
          <rect x="0" y="13.4" width="16" height="2.6" fill={OUT} />
          <rect x="0" y="13.9" width="16" height="1.6" fill="#ffffff" />
          <rect x="0" y="15.1" width="16" height="0.4" fill={CREAM_DK} />
        </g>
      )}
    </g>
  );
}

export default function PixelProp({ type }) {
  const [imgError, setImgError] = useState(false);
  const imgSrc = PROP_IMAGE_MAP[type];

  if (imgSrc && !imgError) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <img
          src={imgSrc}
          alt={type}
          style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }}
          onError={() => setImgError(true)}
        />
      </div>
    );
  }


  // ── BED — honey-wood frame, cream pillow, teal duvet + coral stripe ──────
  if (type === 'bed') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <Shadow cx={8} cy={15.2} rx={6.8} ry={0.8} />
        <rect x="0.5" y="0.5" width="15" height="14.4" fill={OUT} />
        {/* headboard */}
        <rect x="1" y="1" width="14" height="3" fill={WOOD} />
        <rect x="1" y="1" width="14" height="0.8" fill={WOOD_LT} />
        <rect x="1" y="3.3" width="14" height="0.7" fill={WOOD_DK} />
        {/* sheet + pillow */}
        <rect x="1" y="4" width="14" height="3.2" fill={CREAM} />
        <rect x="3.6" y="4" width="8.8" height="2.6" fill={OUT} />
        <rect x="4" y="4.3" width="8" height="2" fill={WHITE} />
        <rect x="4" y="5.7" width="8" height="0.6" fill={CREAM_DK} />
        {/* duvet */}
        <rect x="1" y="7.2" width="14" height="6.3" fill={TEAL} />
        <rect x="1" y="7.2" width="14" height="0.8" fill={TEAL_LT} />
        <rect x="1" y="8.6" width="14" height="1.7" fill={CORAL} />
        <rect x="1" y="9.9" width="14" height="0.4" fill={CORAL_DK} />
        <rect x="1" y="11.8" width="14" height="0.5" fill={TEAL_DK} />
        <rect x="1" y="12.8" width="14" height="0.7" fill={TEAL_DK} />
        {/* footboard + feet */}
        <rect x="1" y="13.5" width="14" height="1" fill={WOOD_DK} />
        <rect x="1.4" y="14.5" width="1.6" height="1" fill={OUT} />
        <rect x="13" y="14.5" width="1.6" height="1" fill={OUT} />
      </svg>
    );
  }

  // ── BOOKSHELF — tall warm shelf packed with colorful spines (16×24) ──────
  if (type === 'bookshelf') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 24" shapeRendering="crispEdges">
        <Shadow cx={8} cy={23.3} rx={6.8} ry={0.7} />
        <rect x="0.5" y="0.5" width="15" height="22.4" fill={OUT} />
        <rect x="1" y="1" width="14" height="21.4" fill={WOOD} />
        <rect x="1" y="1" width="14" height="0.8" fill={WOOD_LT} />
        <rect x="1" y="1" width="0.8" height="21.4" fill={WOOD_LT} />
        {/* shelf cavities */}
        <rect x="2" y="2.6" width="12" height="5.2" fill={WOOD_DK} />
        <rect x="2" y="8.9" width="12" height="5.2" fill={WOOD_DK} />
        <rect x="2" y="15.2" width="12" height="5.2" fill={WOOD_DK} />
        {/* shelf boards */}
        <rect x="1.5" y="7.8" width="13" height="1.1" fill={WOOD_LT} />
        <rect x="1.5" y="14.1" width="13" height="1.1" fill={WOOD_LT} />
        <rect x="1.5" y="20.4" width="13" height="1.1" fill={WOOD_LT} />
        <rect x="1" y="21.5" width="14" height="0.9" fill={WOOD_DK} />
        {/* top shelf: books + trophy */}
        <rect x="2.6" y="3.6" width="1.4" height="4.2" fill={CORAL} />
        <rect x="4" y="4.2" width="1.2" height="3.6" fill={TEAL} />
        <rect x="5.2" y="3.8" width="1.6" height="4" fill={GOLD} />
        <rect x="6.8" y="4.4" width="1.2" height="3.4" fill={SAGE} />
        <rect x="8" y="3.8" width="1.4" height="4" fill={TEAL_DK} />
        <rect x="10.6" y="4.4" width="2.4" height="0.8" fill={GOLD_DK} />
        <rect x="11" y="5.2" width="1.6" height="1.8" fill={GOLD} />
        <rect x="11.4" y="7" width="0.8" height="0.4" fill={GOLD_DK} />
        <rect x="10.8" y="7.4" width="2" height="0.6" fill={GOLD_DK} />
        {/* middle shelf: books + leaning book */}
        <rect x="2.6" y="10" width="1.2" height="4.1" fill={SAGE} />
        <rect x="3.8" y="10.5" width="1.5" height="3.6" fill={CORAL_DK} />
        <rect x="5.3" y="10" width="1.2" height="4.1" fill={CREAM} />
        <rect x="6.5" y="10.4" width="1.4" height="3.7" fill={TEAL} />
        <rect x="7.9" y="10" width="1.2" height="4.1" fill={GOLD} />
        <rect x="9.1" y="10.6" width="1.3" height="3.5" fill={CORAL} />
        <polygon points="11,14.1 13.4,14.1 13.4,10.6" fill={TEAL_DK} />
        {/* bottom shelf: books + tiny plant */}
        <rect x="2.6" y="16.4" width="1.4" height="4" fill={TEAL} />
        <rect x="4" y="16.9" width="1.2" height="3.5" fill={GOLD} />
        <rect x="5.2" y="16.4" width="1.5" height="4" fill={CORAL} />
        <rect x="6.7" y="17" width="1.2" height="3.4" fill={SAGE_DK} />
        <rect x="10.6" y="18.6" width="2.2" height="1.8" fill={TERRA} />
        <rect x="10.6" y="18.6" width="2.2" height="0.5" fill={TERRA_LT} />
        <rect x="11.3" y="16.6" width="0.8" height="2" fill={SAGE} />
        <rect x="10.5" y="17.2" width="1" height="0.9" fill={SAGE_DK} />
        <rect x="12.2" y="17" width="1" height="0.9" fill={SAGE} />
      </svg>
    );
  }

  // ── FRIDGE — cream retro fridge with chrome handle ───────────────────────
  if (type === 'fridge') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <Shadow cx={8} cy={15.2} rx={5.4} ry={0.9} />
        <rect x="2.5" y="0.5" width="11" height="14.4" fill={OUT} />
        <rect x="3" y="1" width="10" height="13.5" fill={CREAM} />
        <rect x="3" y="1" width="10" height="0.9" fill={WHITE} />
        <rect x="3" y="1" width="0.8" height="13.5" fill={WHITE} />
        <rect x="11.9" y="1.4" width="1.1" height="13.1" fill={CREAM_DK} />
        {/* freezer/door split */}
        <rect x="3" y="5" width="10" height="0.6" fill={GREY_DK} />
        {/* chrome handles */}
        <rect x="4" y="2.2" width="1" height="2.2" fill={GREY} />
        <rect x="4.7" y="2.2" width="0.3" height="2.2" fill={GREY_DK} />
        <rect x="4" y="6.2" width="1" height="4.2" fill={GREY} />
        <rect x="4.7" y="6.2" width="0.3" height="4.2" fill={GREY_DK} />
        {/* magnets */}
        <rect x="8.4" y="7.2" width="1.3" height="1.3" fill={TEAL} />
        <rect x="10.2" y="8.8" width="1.2" height="1.2" fill={CORAL} />
        <rect x="8.8" y="10.6" width="1.1" height="1.1" fill={GOLD} />
        {/* feet */}
        <rect x="3.6" y="14.5" width="1.6" height="1" fill={OUT} />
        <rect x="10.8" y="14.5" width="1.6" height="1" fill={OUT} />
      </svg>
    );
  }

  // ── STOVE — cream range, lit burner + little kettle ──────────────────────
  if (type === 'stove') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <Shadow cx={8} cy={15.3} rx={6.4} ry={0.8} />
        {/* kettle on the lit burner */}
        <rect x="9" y="0.6" width="3.4" height="2.6" fill={OUT} />
        <rect x="9.4" y="1" width="2.6" height="1.8" fill={TEAL} />
        <rect x="9.4" y="1" width="2.6" height="0.5" fill={TEAL_LT} />
        <rect x="10.2" y="0" width="1" height="0.7" fill={OUT} />
        <rect x="12.4" y="1.4" width="1" height="0.7" fill={OUT} />
        {/* cooktop */}
        <rect x="1.5" y="3" width="13" height="1.8" fill={OUT} />
        <rect x="2" y="3.4" width="12" height="1" fill={GREY_DK} />
        <rect x="9.1" y="3.4" width="3.2" height="1" fill={GOLD} />
        <rect x="9.8" y="3.6" width="1.8" height="0.6" fill={CORAL} />
        <rect x="3.4" y="3.6" width="2.6" height="0.6" fill={NIGHT} />
        {/* body */}
        <rect x="1.5" y="4.8" width="13" height="9.8" fill={OUT} />
        <rect x="2" y="5.2" width="12" height="9" fill={CREAM} />
        <rect x="2" y="5.2" width="0.7" height="9" fill={WHITE} />
        <rect x="13.3" y="5.2" width="0.7" height="9" fill={CREAM_DK} />
        {/* knobs */}
        <rect x="3.4" y="5.8" width="1" height="1" fill={WOOD_DK} />
        <rect x="5.4" y="5.8" width="1" height="1" fill={WOOD_DK} />
        <rect x="9.6" y="5.8" width="1" height="1" fill={WOOD_DK} />
        <rect x="11.6" y="5.8" width="1" height="1" fill={WOOD_DK} />
        {/* oven door + warm window */}
        <rect x="3" y="7.4" width="10" height="0.8" fill={GREY} />
        <rect x="3.6" y="8.8" width="8.8" height="4.2" fill={OUT} />
        <rect x="4" y="9.2" width="8" height="3.4" fill={NIGHT} />
        <rect x="4.8" y="9.9" width="6.4" height="2" fill={GOLD} opacity="0.55" />
        {/* feet */}
        <rect x="2.6" y="14.6" width="1.4" height="0.9" fill={OUT} />
        <rect x="12" y="14.6" width="1.4" height="0.9" fill={OUT} />
      </svg>
    );
  }

  // ── KITCHEN COUNTER — light wood cabinet, stone top, cutting board ───────
  if (type === 'kitchen-counter') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <Shadow cx={8} cy={15.3} rx={6.8} ry={0.8} />
        {/* cutting board resting on the counter */}
        <rect x="2.6" y="0.8" width="6" height="2" fill={OUT} />
        <rect x="3" y="1.1" width="5.2" height="1.4" fill={WOOD_LT} />
        <rect x="7.4" y="1.5" width="0.7" height="0.6" fill={OUT} />
        <circle cx="10.6" cy="1.9" r="0.9" fill={RED} />
        <circle cx="10.3" cy="1.6" r="0.3" fill={CORAL_LT} />
        <rect x="11.9" y="1.4" width="2.4" height="0.6" fill={GREY} />
        {/* stone top */}
        <rect x="0.6" y="2.6" width="14.8" height="2.4" fill={OUT} />
        <rect x="1" y="3" width="14" height="1.7" fill={GREY} />
        <rect x="1" y="3" width="14" height="0.6" fill="#b8bdc4" />
        <rect x="1" y="4.3" width="14" height="0.4" fill={GREY_DK} />
        {/* cabinet */}
        <rect x="1" y="5" width="14" height="9.6" fill={OUT} />
        <rect x="1.5" y="5.4" width="13" height="8.8" fill={WOOD_LT} />
        <rect x="13.6" y="5.4" width="0.9" height="8.8" fill={WOOD} />
        {/* doors */}
        <rect x="2.6" y="6.4" width="4.8" height="6.6" fill={WOOD} />
        <rect x="2.6" y="6.4" width="4.8" height="0.6" fill={WOOD_LT} />
        <rect x="8.4" y="6.4" width="4.8" height="6.6" fill={WOOD} />
        <rect x="8.4" y="6.4" width="4.8" height="0.6" fill={WOOD_LT} />
        <rect x="6.6" y="9.2" width="0.8" height="1.2" fill={OUT} />
        <rect x="8.6" y="9.2" width="0.8" height="1.2" fill={OUT} />
        {/* kick */}
        <rect x="1.5" y="14.2" width="13" height="0.9" fill={WOOD_DK} />
      </svg>
    );
  }

  // ── BOULDERING WALL — plywood panel, colorful holds, crash pad (16×44) ───
  if (type === 'bouldering-wall') {
    const hold = (x, y, c, cd) => (
      <g key={`${x}-${y}`}>
        <rect x={x - 0.2} y={y - 0.2} width="2.6" height="2" rx="0.6" fill={OUT} />
        <rect x={x} y={y} width="2.2" height="1.6" rx="0.5" fill={c} />
        <rect x={x + 0.2} y={y + 1.1} width="1.8" height="0.5" rx="0.25" fill={cd} />
      </g>
    );
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 44" shapeRendering="crispEdges">
        <ellipse cx="8" cy="43.2" rx="7.2" ry="0.8" fill={SHADOW} />
        {/* plywood panel */}
        <rect x="0.5" y="0.5" width="15" height="38" fill={OUT} />
        <rect x="1" y="1" width="14" height="37" fill={PLY} />
        <rect x="1" y="1" width="0.9" height="37" fill="#dcc69e" />
        <rect x="1" y="1" width="14" height="0.8" fill="#dcc69e" />
        <rect x="14.2" y="1" width="0.8" height="37" fill={PLY_DK} />
        {/* panel seams + bolts */}
        <rect x="1" y="10" width="14" height="0.5" fill={PLY_DK} />
        <rect x="1" y="20" width="14" height="0.5" fill={PLY_DK} />
        <rect x="1" y="30" width="14" height="0.5" fill={PLY_DK} />
        <circle cx="2.4" cy="2.4" r="0.35" fill={GREY_DK} />
        <circle cx="13.6" cy="2.4" r="0.35" fill={GREY_DK} />
        <circle cx="2.4" cy="36.6" r="0.35" fill={GREY_DK} />
        <circle cx="13.6" cy="36.6" r="0.35" fill={GREY_DK} />
        {/* holds */}
        {hold(3, 3, TEAL, TEAL_DK)}
        {hold(10, 5.5, CORAL, CORAL_DK)}
        {hold(5.5, 8.5, GOLD, GOLD_DK)}
        {hold(11.5, 12, SAGE, SAGE_DK)}
        {hold(3.5, 15, CORAL, CORAL_DK)}
        {hold(8.5, 18, TEAL, TEAL_DK)}
        {hold(2.5, 22, GOLD, GOLD_DK)}
        {hold(7, 25, SAGE, SAGE_DK)}
        {hold(11.5, 27.5, CORAL, CORAL_DK)}
        {hold(4.5, 31, TEAL, TEAL_DK)}
        {hold(9.5, 34, GOLD, GOLD_DK)}
        {/* chalk smudges */}
        <circle cx="6" cy="13" r="0.7" fill="#ffffff" opacity="0.35" />
        <circle cx="10.5" cy="22.5" r="0.8" fill="#ffffff" opacity="0.3" />
        <circle cx="5" cy="28" r="0.6" fill="#ffffff" opacity="0.3" />
        {/* crash pad */}
        <rect x="0.3" y="38.4" width="15.4" height="4.8" fill={OUT} />
        <rect x="0.8" y="38.9" width="14.4" height="3.8" fill={PAD_BLUE} />
        <rect x="0.8" y="38.9" width="14.4" height="1" fill={PAD_BLUE_LT} />
        <rect x="7.7" y="38.9" width="0.6" height="3.8" fill="#37547e" />
        <rect x="0.8" y="42" width="14.4" height="0.7" fill="#37547e" />
      </svg>
    );
  }

  // ── TENT — sage dome tent with cream door flap ───────────────────────────
  if (type === 'tent') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <Shadow cx={8} cy={14.7} rx={7} ry={1} />
        {/* dome outline + body */}
        <polygon points="0.6,14.2 15.4,14.2 14,7 11.2,3.2 8,2.2 4.8,3.2 2,7" fill={OUT} />
        <polygon points="1.4,13.6 14.6,13.6 13.4,7.3 10.8,3.9 8,3 5.2,3.9 2.6,7.3" fill={SAGE} />
        <polygon points="8,3 10.8,3.9 13.4,7.3 14.6,13.6 8,13.6" fill={SAGE_DK} />
        {/* seams */}
        <polygon points="7.7,3 8.3,3 8.3,13.6 7.7,13.6" fill={SAGE_DK} />
        <polygon points="4.6,4.4 5.2,4.2 6.2,13.6 5.4,13.6" fill={SAGE_DK} opacity="0.5" />
        {/* door flap */}
        <polygon points="5.6,13.6 10.4,13.6 10.4,8.6 8,7.4 5.6,8.6" fill={OUT} />
        <polygon points="6.2,13.6 9.8,13.6 9.8,9 8,8.1 6.2,9" fill={CREAM} />
        <polygon points="8,8.1 9.8,9 9.8,13.6 8,13.6" fill={CREAM_DK} />
        {/* guy lines + stakes */}
        <rect x="0.2" y="14" width="1.4" height="0.5" fill={WOOD_DK} transform="rotate(28 0.9 14.2)" />
        <rect x="14.4" y="14" width="1.4" height="0.5" fill={WOOD_DK} transform="rotate(-28 15.1 14.2)" />
        <circle cx="8" cy="2.6" r="0.5" fill={GOLD} />
      </svg>
    );
  }

  // ── CAMPFIRE — stone ring, crossed logs, animated flame ──────────────────
  if (type === 'campfire') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <Shadow cx={8} cy={14.9} rx={6} ry={1} />
        {/* crossed logs */}
        <rect x="3.4" y="10.8" width="9.2" height="2" rx="0.6" fill={OUT} transform="rotate(16 8 11.8)" />
        <rect x="3.8" y="11.1" width="8.4" height="1.4" rx="0.5" fill={WOOD_DK} transform="rotate(16 8 11.8)" />
        <rect x="3.4" y="10.8" width="9.2" height="2" rx="0.6" fill={OUT} transform="rotate(-16 8 11.8)" />
        <rect x="3.8" y="11.1" width="8.4" height="1.4" rx="0.5" fill={WOOD_DK} transform="rotate(-16 8 11.8)" />
        <circle cx="3.9" cy="12.5" r="0.5" fill={WOOD_LT} />
        <circle cx="12.1" cy="12.5" r="0.5" fill={WOOD_LT} />
        {/* flame (animated) */}
        <g className="pp-flame">
          <polygon points="8,2.2 5.4,10.6 10.6,10.6" fill={CORAL} />
          <polygon points="8,4.6 6.3,10.4 9.7,10.4" fill={GOLD} />
          <polygon points="8,7 7.1,10.2 8.9,10.2" fill={CREAM} />
        </g>
        {/* stone ring (drawn over flame base) */}
        <circle cx="2.8" cy="13.4" r="1.1" fill={OUT} />
        <circle cx="2.8" cy="13.3" r="0.8" fill={GREY} />
        <circle cx="5.4" cy="13.9" r="1.1" fill={OUT} />
        <circle cx="5.4" cy="13.8" r="0.8" fill={GREY_DK} />
        <circle cx="8" cy="14.1" r="1.1" fill={OUT} />
        <circle cx="8" cy="14" r="0.8" fill={GREY} />
        <circle cx="10.6" cy="13.9" r="1.1" fill={OUT} />
        <circle cx="10.6" cy="13.8" r="0.8" fill={GREY_DK} />
        <circle cx="13.2" cy="13.4" r="1.1" fill={OUT} />
        <circle cx="13.2" cy="13.3" r="0.8" fill={GREY} />
        <style>{`
          @keyframes pp-flame-flicker {
            0% { transform: scale(1) translateY(0); }
            50% { transform: scale(0.93, 1.07) translateY(-0.6px) rotate(1deg); }
            100% { transform: scale(1) translateY(0); }
          }
          .pp-flame {
            transform-origin: 8px 10.6px;
            animation: pp-flame-flicker 0.22s infinite ease-in-out;
          }
        `}</style>
      </svg>
    );
  }

  // ── SUITCASE — leather brown with travel stickers ────────────────────────
  if (type === 'suitcase') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <Shadow cx={8} cy={14} rx={6} ry={1} />
        {/* handle */}
        <rect x="6" y="1" width="4" height="2.4" rx="0.8" fill="none" stroke={OUT} strokeWidth="1.1" />
        {/* body */}
        <rect x="1.5" y="2.6" width="13" height="10.4" rx="0.8" fill={OUT} />
        <rect x="2" y="3.1" width="12" height="9.4" rx="0.5" fill="#9c6b3f" />
        <rect x="2" y="3.1" width="12" height="0.9" fill="#b5824f" />
        <rect x="2" y="11.5" width="12" height="1" fill={WOOD_DK} />
        {/* straps + buckles */}
        <rect x="4" y="3.1" width="1.5" height="9.4" fill={WOOD_DK} />
        <rect x="10.5" y="3.1" width="1.5" height="9.4" fill={WOOD_DK} />
        <rect x="4.3" y="6.6" width="0.9" height="1.4" fill={GOLD} />
        <rect x="10.8" y="6.6" width="0.9" height="1.4" fill={GOLD} />
        {/* stickers */}
        <circle cx="7.9" cy="6.2" r="1.2" fill={TEAL} />
        <circle cx="7.9" cy="6.2" r="0.5" fill={CREAM} />
        <rect x="6.6" y="8.6" width="2" height="1.6" fill={CORAL} />
        <rect x="6.9" y="9" width="1.4" height="0.4" fill={CREAM} />
        <rect x="12.4" y="4.2" width="1.3" height="1.3" fill={CREAM} />
        {/* corner caps */}
        <rect x="1.8" y="2.9" width="1" height="1" fill={GOLD_DK} />
        <rect x="13.2" y="2.9" width="1" height="1" fill={GOLD_DK} />
        <rect x="1.8" y="11.7" width="1" height="1" fill={GOLD_DK} />
        <rect x="13.2" y="11.7" width="1" height="1" fill={GOLD_DK} />
      </svg>
    );
  }

  // ── TYRE — dark tyre with grey rim ───────────────────────────────────────
  if (type === 'tyre') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <Shadow cx={8} cy={14.4} rx={5.8} ry={1.1} />
        <circle cx="8" cy="7.6" r="6.4" fill={OUT} />
        <circle cx="8" cy="7.6" r="5.8" fill="#3b3b40" />
        <circle cx="7.4" cy="7" r="5" fill="#4a4a50" />
        <circle cx="8" cy="7.6" r="3" fill={OUT} />
        <circle cx="8" cy="7.6" r="2.5" fill={GREY} />
        <circle cx="7.6" cy="7.2" r="1.6" fill="#b8bdc4" />
        <circle cx="8" cy="7.6" r="0.8" fill={GREY_DK} />
        {/* treads */}
        <rect x="7.6" y="1.4" width="0.8" height="1.6" fill={NIGHT} />
        <rect x="7.6" y="12.2" width="0.8" height="1.6" fill={NIGHT} />
        <rect x="1.8" y="7.2" width="1.6" height="0.8" fill={NIGHT} />
        <rect x="12.6" y="7.2" width="1.6" height="0.8" fill={NIGHT} />
        <rect x="3.2" y="3.2" width="1.2" height="1.2" fill={NIGHT} />
        <rect x="11.6" y="3.2" width="1.2" height="1.2" fill={NIGHT} />
        <rect x="3.2" y="10.8" width="1.2" height="1.2" fill={NIGHT} />
        <rect x="11.6" y="10.8" width="1.2" height="1.2" fill={NIGHT} />
      </svg>
    );
  }

  // ── PROJECTOR — vintage slide projector, two reels ───────────────────────
  if (type === 'projector') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <Shadow cx={8} cy={14.4} rx={5.8} ry={0.9} />
        {/* reels */}
        <circle cx="4.8" cy="3.4" r="2.8" fill={OUT} />
        <circle cx="4.8" cy="3.4" r="2.3" fill={GREY_DK} />
        <circle cx="4.8" cy="3.4" r="1.4" fill={GREY} />
        <circle cx="4.8" cy="3.4" r="0.5" fill={OUT} />
        <circle cx="10.2" cy="3.4" r="2.8" fill={OUT} />
        <circle cx="10.2" cy="3.4" r="2.3" fill={GREY_DK} />
        <circle cx="10.2" cy="3.4" r="1.4" fill={GREY} />
        <circle cx="10.2" cy="3.4" r="0.5" fill={OUT} />
        {/* body */}
        <rect x="1" y="5.8" width="12.4" height="7" fill={OUT} />
        <rect x="1.5" y="6.3" width="11.4" height="6" fill={CREAM} />
        <rect x="1.5" y="6.3" width="11.4" height="0.8" fill={WHITE} />
        <rect x="1.5" y="9.2" width="11.4" height="1.4" fill={GREY} />
        <circle cx="3.4" cy="11.4" r="0.6" fill={GOLD} />
        <rect x="5" y="11" width="3" height="0.7" fill={GREY_DK} />
        {/* lens */}
        <rect x="12.9" y="7.4" width="2.6" height="3.8" fill={OUT} />
        <rect x="13.3" y="7.8" width="1.5" height="3" fill={GREY_DK} />
        <rect x="14.5" y="8.2" width="0.6" height="2.2" fill={SCREEN} />
        {/* warm beam */}
        <polygon points="15.5,8 16,7.2 16,11.2 15.5,10.4" fill={GOLD} opacity="0.25" />
        {/* feet */}
        <rect x="2.4" y="12.8" width="1.8" height="1" fill={OUT} />
        <rect x="10.2" y="12.8" width="1.8" height="1" fill={OUT} />
      </svg>
    );
  }

  // ── BULLETIN — cork board, wooden frame, pinned notes (wall-hung) ────────
  if (type === 'bulletin') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <rect x="0.5" y="1" width="15" height="13.5" fill={OUT} />
        <rect x="1" y="1.5" width="14" height="12.5" fill={WOOD} />
        <rect x="1" y="1.5" width="14" height="0.7" fill={WOOD_LT} />
        <rect x="1" y="13.3" width="14" height="0.7" fill={WOOD_DK} />
        {/* cork */}
        <rect x="2.4" y="3" width="11.2" height="9.2" fill="#d8b27a" />
        <rect x="3.2" y="4" width="0.6" height="0.6" fill="#c19a5e" />
        <rect x="12" y="10.8" width="0.6" height="0.6" fill="#c19a5e" />
        <rect x="11.4" y="5" width="0.5" height="0.5" fill="#c19a5e" />
        <rect x="4" y="11.2" width="0.5" height="0.5" fill="#c19a5e" />
        {/* notes */}
        <rect x="3.4" y="4" width="3.6" height="4.2" fill={CREAM} />
        <rect x="4" y="5" width="2.4" height="0.5" fill={GREY_DK} />
        <rect x="4" y="6" width="1.8" height="0.5" fill={GREY_DK} />
        <rect x="7.8" y="4.4" width="4.4" height="3" fill={TEAL_LT} />
        <rect x="8.4" y="5.3" width="3" height="0.5" fill={TEAL_DK} />
        <rect x="4.4" y="9" width="4" height="2.6" fill={GOLD} />
        <rect x="5" y="9.8" width="2.8" height="0.5" fill={GOLD_DK} />
        <rect x="9.4" y="8.4" width="3" height="3.2" fill={CORAL_LT} />
        <rect x="10" y="9.3" width="1.8" height="0.5" fill={CORAL_DK} />
        {/* pins */}
        <circle cx="5.2" cy="4.3" r="0.55" fill={RED} />
        <circle cx="10" cy="4.7" r="0.55" fill={TEAL_DK} />
        <circle cx="6.4" cy="9.3" r="0.55" fill={SAGE_DK} />
        <circle cx="10.9" cy="8.7" r="0.55" fill={OUT} />
      </svg>
    );
  }

  // ── BIKE — classic RED bicycle (clearly a bicycle) ───────────────────────
  if (type === 'bike') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <Shadow cx={8} cy={14.2} rx={6.8} ry={1} />
        {/* wheels: outline ring, rim, spokes */}
        <circle cx="4" cy="10.4" r="3.4" fill="none" stroke={OUT} strokeWidth="1.5" />
        <circle cx="4" cy="10.4" r="3.4" fill="none" stroke="#3b3b40" strokeWidth="0.7" />
        <path d="M4,7.4 L4,13.4 M1,10.4 L7,10.4 M1.9,8.3 L6.1,12.5 M6.1,8.3 L1.9,12.5" stroke={GREY} strokeWidth="0.4" />
        <circle cx="12" cy="10.4" r="3.4" fill="none" stroke={OUT} strokeWidth="1.5" />
        <circle cx="12" cy="10.4" r="3.4" fill="none" stroke="#3b3b40" strokeWidth="0.7" />
        <path d="M12,7.4 L12,13.4 M9,10.4 L15,10.4 M9.9,8.3 L14.1,12.5 M14.1,8.3 L9.9,12.5" stroke={GREY} strokeWidth="0.4" />
        {/* diamond frame */}
        <path d="M4,10.4 L6,4.9 M4,10.4 L8.2,10.4 M8.2,10.4 L6,4.9 M6,4.9 L11.3,4.6 M8.2,10.4 L11.3,4.6 M11.3,4.6 L12,10.4" stroke={RED} strokeWidth="1.2" fill="none" />
        <path d="M8.2,10.4 L6,4.9" stroke={RED_DK} strokeWidth="0.5" fill="none" />
        {/* crank + pedal */}
        <circle cx="8.2" cy="10.4" r="1" fill={OUT} />
        <circle cx="8.2" cy="10.4" r="0.5" fill={GREY} />
        <rect x="8.6" y="11.3" width="1.5" height="0.7" fill={OUT} />
        {/* seat */}
        <rect x="5" y="4" width="2.4" height="1" rx="0.4" fill={OUT} />
        {/* handlebars */}
        <path d="M11.3,4.6 L11.3,3.4 L12.9,3.4" stroke={OUT} strokeWidth="0.9" fill="none" />
        <rect x="12.6" y="2.9" width="1.2" height="1" rx="0.3" fill={OUT} />
        {/* headlamp */}
        <circle cx="12" cy="5.4" r="0.7" fill={GOLD} />
      </svg>
    );
  }

  // ── ARCADE — warm cabinet, cream side art, muted teal screen ─────────────
  if (type === 'arcade') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <Shadow cx={8} cy={15.3} rx={5.8} ry={0.8} />
        <rect x="2" y="0.4" width="12" height="14.8" fill={OUT} />
        <rect x="2.5" y="0.9" width="11" height="13.9" fill={WOOD_DK} />
        {/* cream side art */}
        <rect x="2.5" y="0.9" width="1.1" height="13.9" fill={CREAM} />
        <rect x="12.4" y="0.9" width="1.1" height="13.9" fill={CREAM_DK} />
        <rect x="2.7" y="3" width="0.7" height="3" fill={CORAL} />
        <rect x="12.6" y="3" width="0.7" height="3" fill={CORAL_DK} />
        {/* marquee */}
        <rect x="3.6" y="1.3" width="8.8" height="1.9" fill={CORAL} />
        <rect x="3.6" y="1.3" width="8.8" height="0.5" fill={CORAL_LT} />
        <rect x="4.6" y="2" width="2" height="0.6" fill={GOLD} />
        <rect x="7.2" y="2" width="3.4" height="0.6" fill={CREAM} />
        {/* screen */}
        <rect x="3.6" y="3.6" width="8.8" height="4.6" fill={NIGHT} />
        <rect x="4.2" y="4.2" width="7.6" height="3.4" fill={SCREEN_BG} />
        <rect x="6" y="4.8" width="1" height="0.7" fill={SCREEN} />
        <rect x="9" y="4.8" width="1" height="0.7" fill={SCREEN} />
        <rect x="7.5" y="5.6" width="1" height="0.7" fill={SCREEN} />
        <rect x="5" y="6.5" width="6" height="0.5" fill={TEAL} />
        {/* control panel */}
        <rect x="3.6" y="8.6" width="8.8" height="2" fill={WOOD} />
        <rect x="3.6" y="8.6" width="8.8" height="0.5" fill={WOOD_LT} />
        <rect x="5.4" y="8" width="0.6" height="1.2" fill={OUT} />
        <circle cx="5.7" cy="7.8" r="0.7" fill={RED} />
        <circle cx="9" cy="9.5" r="0.6" fill={GOLD} />
        <circle cx="10.8" cy="9.5" r="0.6" fill={TEAL} />
        {/* lower door + coin slot */}
        <rect x="3.6" y="11" width="8.8" height="3.4" fill={NIGHT} />
        <rect x="7" y="11.8" width="2" height="1.6" fill={GREY_DK} />
        <rect x="7.7" y="12.1" width="0.6" height="1" fill={GOLD} />
      </svg>
    );
  }

  // ── BEANBAG — squishy coral bean bag ─────────────────────────────────────
  if (type === 'beanbag') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <Shadow cx={8} cy={13.8} rx={6.6} ry={1.4} />
        <ellipse cx="8" cy="9.2" rx="6.5" ry="5" fill={OUT} />
        <ellipse cx="8" cy="9.2" rx="6" ry="4.5" fill={CORAL} />
        <ellipse cx="7" cy="7.6" rx="4" ry="2.4" fill={CORAL_LT} />
        {/* seat dent */}
        <ellipse cx="8" cy="8.6" rx="3.6" ry="1.8" fill={CORAL_DK} />
        <ellipse cx="8" cy="8.3" rx="2.8" ry="1.2" fill={CORAL} />
        {/* stitch lines */}
        <path d="M2.4,9.6 C4.2,11.6 6,12.8 8,12.8 C10,12.8 11.8,11.6 13.6,9.6" fill="none" stroke={CORAL_DK} strokeWidth="0.7" />
        <path d="M8,10.4 L8,12.8" stroke={CORAL_DK} strokeWidth="0.7" />
      </svg>
    );
  }

  // ── TRAVEL TABLE — wooden table, open scrapbook, tiny plant ──────────────
  if (type === 'travel-table') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <Shadow cx={8} cy={15.2} rx={6.6} ry={0.8} />
        {/* open scrapbook on top */}
        <rect x="3.4" y="3.6" width="8.2" height="3.4" fill={OUT} />
        <rect x="3.8" y="4" width="3.5" height="2.6" fill={WHITE} />
        <rect x="7.7" y="4" width="3.5" height="2.6" fill={CREAM} />
        <rect x="7.5" y="4" width="0.3" height="2.6" fill={CREAM_DK} />
        <rect x="4.3" y="4.6" width="2.4" height="0.4" fill={GREY_DK} />
        <rect x="4.3" y="5.4" width="1.8" height="0.4" fill={GREY_DK} />
        <rect x="8.3" y="4.5" width="1.6" height="1.4" fill={TEAL} />
        <rect x="8.3" y="4.5" width="1.6" height="0.4" fill={SCREEN} />
        {/* tiny plant */}
        <rect x="12.2" y="5.2" width="2" height="1.8" fill={OUT} />
        <rect x="12.5" y="5.5" width="1.4" height="1.2" fill={TERRA} />
        <rect x="12.9" y="3.8" width="0.6" height="1.7" fill={SAGE_DK} />
        <rect x="12.2" y="4" width="0.9" height="0.8" fill={SAGE} />
        <rect x="13.5" y="3.6" width="0.9" height="0.8" fill={SAGE} />
        {/* tabletop */}
        <rect x="1" y="7" width="14" height="2.6" fill={OUT} />
        <rect x="1.5" y="7.4" width="13" height="1.8" fill={WOOD} />
        <rect x="1.5" y="7.4" width="13" height="0.7" fill={WOOD_LT} />
        {/* legs */}
        <rect x="2.2" y="9.6" width="2" height="5.4" fill={OUT} />
        <rect x="2.6" y="9.6" width="1.2" height="5" fill={WOOD_DK} />
        <rect x="11.8" y="9.6" width="2" height="5.4" fill={OUT} />
        <rect x="12.2" y="9.6" width="1.2" height="5" fill={WOOD_DK} />
        <rect x="3.8" y="10.4" width="8.4" height="0.8" fill={WOOD_DK} />
      </svg>
    );
  }

  // ── TOOLBOX — glossy red rolling tool chest ──────────────────────────────
  if (type === 'toolbox') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <Shadow cx={8} cy={15.2} rx={5.8} ry={0.9} />
        <rect x="1.8" y="1" width="12.4" height="12.6" fill={OUT} />
        <rect x="2.3" y="1.5" width="11.4" height="11.6" fill={RED} />
        <rect x="2.3" y="1.5" width="11.4" height="0.9" fill={CORAL_LT} />
        <rect x="2.3" y="1.5" width="0.8" height="11.6" fill={CORAL} />
        <rect x="12.9" y="1.5" width="0.8" height="11.6" fill={RED_DK} />
        {/* side handle */}
        <rect x="14.2" y="4" width="1.4" height="0.9" fill={GREY} />
        <rect x="15.1" y="4" width="0.5" height="4" fill={GREY} />
        <rect x="14.2" y="7.1" width="1.4" height="0.9" fill={GREY} />
        {/* drawers */}
        <rect x="3.4" y="3" width="9.2" height="2" fill={RED_DK} />
        <rect x="5" y="3.6" width="6" height="0.7" fill={GREY} />
        <rect x="3.4" y="5.6" width="9.2" height="2" fill={RED_DK} />
        <rect x="5" y="6.2" width="6" height="0.7" fill={GREY} />
        <rect x="3.4" y="8.2" width="9.2" height="2" fill={RED_DK} />
        <rect x="5" y="8.8" width="6" height="0.7" fill={GREY} />
        {/* lock panel */}
        <rect x="3.4" y="10.8" width="9.2" height="1.5" fill={NIGHT} />
        <circle cx="8" cy="11.5" r="0.5" fill={GOLD} />
        {/* casters */}
        <rect x="3" y="13.6" width="2.2" height="1.8" fill={OUT} />
        <rect x="3.5" y="14" width="1.2" height="1" fill={GREY_DK} />
        <rect x="10.8" y="13.6" width="2.2" height="1.8" fill={OUT} />
        <rect x="11.3" y="14" width="1.2" height="1" fill={GREY_DK} />
      </svg>
    );
  }

  // ── HANGBOARD — wooden fingerboard with carved pockets (wall-hung) ───────
  if (type === 'hangboard') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <rect x="0.8" y="4.2" width="14.4" height="7.6" fill={OUT} />
        <rect x="1.3" y="4.7" width="13.4" height="6.6" fill={WOOD} />
        <rect x="1.3" y="4.7" width="13.4" height="0.9" fill={WOOD_LT} />
        <rect x="1.3" y="10.4" width="13.4" height="0.9" fill={WOOD_DK} />
        {/* top row pockets */}
        <rect x="2.6" y="6" width="2.6" height="1.6" fill={OUT} />
        <rect x="2.6" y="6" width="2.6" height="0.5" fill={WOOD_DK} />
        <rect x="6.7" y="5.8" width="2.6" height="1.9" fill={OUT} />
        <rect x="6.7" y="5.8" width="2.6" height="0.5" fill={WOOD_DK} />
        <rect x="10.8" y="6" width="2.6" height="1.6" fill={OUT} />
        <rect x="10.8" y="6" width="2.6" height="0.5" fill={WOOD_DK} />
        {/* crimp rail */}
        <rect x="3.2" y="8.8" width="4.2" height="1" fill={OUT} />
        <rect x="3.2" y="8.8" width="4.2" height="0.35" fill={WOOD_DK} />
        <rect x="8.6" y="8.8" width="4.2" height="1" fill={OUT} />
        <rect x="8.6" y="8.8" width="4.2" height="0.35" fill={WOOD_DK} />
        {/* mount screws */}
        <circle cx="1.9" cy="5.3" r="0.35" fill={GREY} />
        <circle cx="14.1" cy="5.3" r="0.35" fill={GREY} />
        <circle cx="1.9" cy="10.7" r="0.35" fill={GREY} />
        <circle cx="14.1" cy="10.7" r="0.35" fill={GREY} />
      </svg>
    );
  }

  // ── TACTICBOARD — green chalkboard on wooden A-stand ─────────────────────
  if (type === 'tacticboard') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <Shadow cx={8} cy={15.2} rx={6.2} ry={0.8} />
        {/* A-stand legs */}
        <path d="M4.4,10.4 L2.8,15 M11.6,10.4 L13.2,15" stroke={OUT} strokeWidth="1.8" />
        <path d="M4.4,10.4 L2.8,15 M11.6,10.4 L13.2,15" stroke={WOOD_DK} strokeWidth="1" />
        <rect x="4.2" y="12.6" width="7.6" height="0.8" fill={WOOD_DK} />
        {/* frame + slate */}
        <rect x="1.4" y="0.8" width="13.2" height="10" fill={OUT} />
        <rect x="1.9" y="1.3" width="12.2" height="9" fill={WOOD} />
        <rect x="1.9" y="1.3" width="12.2" height="0.6" fill={WOOD_LT} />
        <rect x="2.9" y="2.3" width="10.2" height="7" fill="#3b5a3e" />
        <rect x="1.9" y="9.6" width="12.2" height="0.7" fill={WOOD_LT} />
        {/* chalk pitch */}
        <rect x="3.6" y="3" width="8.8" height="5.6" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.45" />
        <path d="M8,3 L8,8.6" stroke="rgba(255,255,255,0.55)" strokeWidth="0.45" />
        <circle cx="8" cy="5.8" r="1.2" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.45" />
        {/* O's, X's, arrow */}
        <circle cx="5.2" cy="4.4" r="0.5" fill="none" stroke={CREAM} strokeWidth="0.5" />
        <circle cx="6.2" cy="6.8" r="0.5" fill="none" stroke={CREAM} strokeWidth="0.5" />
        <path d="M10.2,4.2 L11,5 M11,4.2 L10.2,5" stroke={GOLD} strokeWidth="0.5" />
        <path d="M10.8,6.6 L11.6,7.4 M11.6,6.6 L10.8,7.4" stroke={GOLD} strokeWidth="0.5" />
        <path d="M5.6,4.4 Q7.6,3.4 10,4.5" fill="none" stroke={CORAL_LT} strokeWidth="0.5" />
        <polygon points="10.2,4.6 9.4,4.2 9.7,5.1" fill={CORAL_LT} />
      </svg>
    );
  }

  // ── COMPUTER — wooden desk, dual monitors, soft teal code glow ───────────
  if (type === 'computerglowing') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <Shadow cx={8} cy={15.4} rx={7.2} ry={0.7} />
        {/* monitors */}
        <rect x="1.2" y="2.2" width="6.6" height="5.6" fill={OUT} />
        <rect x="1.7" y="2.7" width="5.6" height="4.6" fill={NIGHT} />
        <rect x="2.2" y="3.2" width="4.6" height="3.6" fill={SCREEN_BG} />
        <rect x="2.6" y="3.7" width="3.4" height="0.5" fill={SCREEN} />
        <rect x="2.6" y="4.6" width="2.2" height="0.5" fill={TEAL} />
        <rect x="3.4" y="5.5" width="2.6" height="0.5" fill={GOLD} opacity="0.8" />
        <rect x="2.6" y="6.3" width="1.6" height="0.4" fill={SCREEN} />
        <rect x="8.2" y="2.2" width="6.6" height="5.6" fill={OUT} />
        <rect x="8.7" y="2.7" width="5.6" height="4.6" fill={NIGHT} />
        <rect x="9.2" y="3.2" width="4.6" height="3.6" fill={SCREEN_BG} />
        <path d="M9.6,6.2 L10.8,5 L11.8,5.7 L13.4,3.9" fill="none" stroke={SCREEN} strokeWidth="0.5" />
        <rect x="9.6" y="3.6" width="1.8" height="0.4" fill={TEAL} />
        {/* stands */}
        <rect x="4" y="7.8" width="1.1" height="2.8" fill={GREY_DK} />
        <rect x="10.9" y="7.8" width="1.1" height="2.8" fill={GREY_DK} />
        <rect x="2.9" y="10.2" width="3.3" height="0.6" fill={OUT} />
        <rect x="9.8" y="10.2" width="3.3" height="0.6" fill={OUT} />
        {/* desk */}
        <rect x="0.4" y="10.8" width="15.2" height="4.6" fill={OUT} />
        <rect x="0.9" y="11.2" width="14.2" height="3.8" fill={WOOD} />
        <rect x="0.9" y="11.2" width="14.2" height="1" fill={WOOD_LT} />
        <rect x="0.9" y="14.2" width="14.2" height="0.8" fill={WOOD_DK} />
        {/* keyboard + mouse + mug */}
        <rect x="4.4" y="12.6" width="5.6" height="1.5" fill={OUT} />
        <rect x="4.8" y="12.9" width="4.8" height="0.9" fill={CREAM} />
        <rect x="5.2" y="13.1" width="4" height="0.3" fill={GREY} />
        <rect x="11" y="12.8" width="1.2" height="1" rx="0.4" fill={GREY_DK} />
        <rect x="2" y="12.3" width="1.6" height="1.6" fill={CORAL} />
        <rect x="3.6" y="12.6" width="0.5" height="0.9" fill={CORAL_DK} />
      </svg>
    );
  }

  // ── GOALPOSTS — white frame segments over transparent turf ───────────────
  if (type === 'goalpost-top') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <NetLines />
        <GoalPosts top />
      </svg>
    );
  }
  if (type === 'goalpost-mid') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <NetLines />
        <GoalPosts />
      </svg>
    );
  }
  if (type === 'goalpost-bottom') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <NetLines />
        <GoalPosts bottom />
      </svg>
    );
  }

  // ── BALL — white soccer ball with pentagon hints ─────────────────────────
  if (type === 'ball') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <Shadow cx={8} cy={14.2} rx={4.8} ry={1} />
        <circle cx="8" cy="7.8" r="5.9" fill={OUT} />
        <circle cx="8" cy="7.8" r="5.4" fill="#ffffff" />
        <path d="M3.4,10.4 A5.4,5.4 0 0 0 12.6,10.4 A7,7 0 0 1 3.4,10.4" fill={CREAM_DK} />
        <rect x="7" y="6.8" width="2" height="2" fill={NIGHT} />
        <rect x="4.2" y="4.4" width="1.6" height="1.2" fill={NIGHT} />
        <rect x="10.2" y="4.4" width="1.6" height="1.2" fill={NIGHT} />
        <rect x="4.6" y="9.8" width="1.6" height="1.2" fill={NIGHT} />
        <rect x="9.8" y="9.8" width="1.6" height="1.2" fill={NIGHT} />
        <rect x="7.4" y="2.6" width="1.2" height="1" fill={NIGHT} />
      </svg>
    );
  }

  // ── CHECKPOINT — checkered flag post with pulsing light ──────────────────
  if (type === 'checkpoint') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <Shadow cx={8} cy={15.3} rx={4} ry={0.8} />
        {/* post */}
        <rect x="6.7" y="2" width="2.6" height="12.4" fill={OUT} />
        <rect x="7.1" y="2.4" width="1.2" height="11.8" fill={GREY_DK} />
        <rect x="7.1" y="2.4" width="0.5" height="11.8" fill={GREY} />
        {/* base */}
        <rect x="4.8" y="13.8" width="6.4" height="1.7" fill={OUT} />
        <rect x="5.2" y="14.1" width="5.6" height="1" fill={GREY_DK} />
        {/* checkered flag */}
        <rect x="9.1" y="2.2" width="6.4" height="4.8" fill={OUT} />
        <rect x="9.5" y="2.6" width="5.6" height="4" fill="#ffffff" />
        <rect x="9.5" y="2.6" width="1.9" height="1.4" fill={NIGHT} />
        <rect x="13.2" y="2.6" width="1.9" height="1.4" fill={NIGHT} />
        <rect x="11.4" y="4" width="1.8" height="1.3" fill={NIGHT} />
        <rect x="9.5" y="5.3" width="1.9" height="1.3" fill={NIGHT} />
        <rect x="13.2" y="5.3" width="1.9" height="1.3" fill={NIGHT} />
        {/* pulsing lamp */}
        <circle cx="8" cy="1.3" r="1.3" fill={OUT} />
        <circle className="pp-cp-light" cx="8" cy="1.3" r="0.9" fill={GOLD} />
        <style>{`
          @keyframes pp-checkpoint-pulse {
            0% { fill: ${GOLD}; filter: drop-shadow(0 0 1px ${GOLD}); }
            100% { fill: ${CORAL}; filter: drop-shadow(0 0 2px ${CORAL}); }
          }
          .pp-cp-light { animation: pp-checkpoint-pulse 1s infinite alternate; }
        `}</style>
      </svg>
    );
  }

  // ── GOALIE — keeper in gold/sage jersey with big gloves ──────────────────
  if (type === 'goalie') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <Shadow cx={8} cy={14.9} rx={4.6} ry={0.9} />
        {/* head */}
        <rect x="4.6" y="1.1" width="6.8" height="5.2" fill={OUT} />
        <rect x="5" y="1.5" width="6" height="2" fill={WOOD_DK} />
        <rect x="5" y="3" width="6" height="2.9" fill={SKIN} />
        <rect x="6.2" y="3.9" width="0.9" height="0.9" fill={NIGHT} />
        <rect x="8.9" y="3.9" width="0.9" height="0.9" fill={NIGHT} />
        <rect x="7.2" y="5.2" width="1.6" height="0.4" fill={CORAL_DK} />
        {/* jersey */}
        <rect x="3.6" y="6.3" width="8.8" height="4.9" fill={OUT} />
        <rect x="4" y="6.7" width="8" height="4.2" fill={GOLD} />
        <rect x="6.8" y="6.7" width="2.4" height="4.2" fill={SAGE} />
        <rect x="4" y="6.7" width="8" height="0.6" fill="#f0cd7e" />
        {/* arms + big gloves */}
        <rect x="2.2" y="7" width="1.9" height="1.6" fill={GOLD} />
        <rect x="11.9" y="7" width="1.9" height="1.6" fill={GOLD} />
        <rect x="0.9" y="5.4" width="3" height="3.2" fill={OUT} />
        <rect x="1.3" y="5.8" width="2.2" height="2.4" fill={CREAM} />
        <rect x="1.3" y="5.8" width="2.2" height="0.6" fill={WHITE} />
        <rect x="12.1" y="5.4" width="3" height="3.2" fill={OUT} />
        <rect x="12.5" y="5.8" width="2.2" height="2.4" fill={CREAM} />
        <rect x="12.5" y="5.8" width="2.2" height="0.6" fill={WHITE} />
        {/* shorts, socks, boots */}
        <rect x="4.4" y="10.9" width="7.2" height="1.7" fill={NIGHT} />
        <rect x="5" y="12.6" width="2" height="1.4" fill={SAGE_DK} />
        <rect x="9" y="12.6" width="2" height="1.4" fill={SAGE_DK} />
        <rect x="4.6" y="13.9" width="2.6" height="1.1" fill={OUT} />
        <rect x="8.8" y="13.9" width="2.6" height="1.1" fill={OUT} />
      </svg>
    );
  }

  // ── MOTORBIKE SHINE — blue cruiser, side view ────────────────────────────
  if (type === 'motorbike-shine') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <Shadow cx={8} cy={14.2} rx={6.8} ry={1} />
        {/* wheels */}
        <circle cx="3.8" cy="10.8" r="3.2" fill={OUT} />
        <circle cx="3.8" cy="10.8" r="2.5" fill="#3b3b40" />
        <circle cx="3.8" cy="10.8" r="1.1" fill={GREY} />
        <circle cx="3.8" cy="10.8" r="0.4" fill={OUT} />
        <circle cx="12.2" cy="10.8" r="3.2" fill={OUT} />
        <circle cx="12.2" cy="10.8" r="2.5" fill="#3b3b40" />
        <circle cx="12.2" cy="10.8" r="1.1" fill={GREY} />
        <circle cx="12.2" cy="10.8" r="0.4" fill={OUT} />
        {/* exhaust */}
        <rect x="5.6" y="10.2" width="8" height="1.1" fill={OUT} />
        <rect x="6" y="10.4" width="7.2" height="0.6" fill={GREY} />
        {/* frame + tank */}
        <polygon points="4.2,9.4 5.4,6.2 10.6,6 12,8.6 11.4,9.8 5,9.8" fill={OUT} />
        <polygon points="4.8,9.2 5.8,6.6 10.2,6.4 11.4,8.6 10.9,9.4 5.4,9.4" fill={PAD_BLUE} />
        <rect x="6.4" y="6.6" width="3.4" height="0.8" fill={PAD_BLUE_LT} />
        {/* seat (rear) */}
        <rect x="4.4" y="5.4" width="3.2" height="1.3" rx="0.5" fill={OUT} />
        <rect x="4.7" y="5.7" width="2.6" height="0.7" rx="0.3" fill={NIGHT} />
        {/* fork + handlebars */}
        <path d="M11.4,8.6 L12.6,4.6" stroke={OUT} strokeWidth="1" />
        <rect x="11.9" y="3.9" width="2" height="0.9" rx="0.3" fill={OUT} />
        {/* headlight */}
        <circle cx="13.4" cy="6.6" r="1" fill={OUT} />
        <circle cx="13.4" cy="6.6" r="0.6" fill={GOLD} />
      </svg>
    );
  }

  // ── MOTORBIKE MT15 — dark sporty bike, subtle sage accents ───────────────
  if (type === 'motorbike-mt15') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <Shadow cx={8} cy={14.2} rx={6.8} ry={1} />
        {/* wheels */}
        <circle cx="3.8" cy="10.8" r="3.2" fill={OUT} />
        <circle cx="3.8" cy="10.8" r="2.5" fill="#3b3b40" />
        <circle cx="3.8" cy="10.8" r="1" fill={GREY_DK} />
        <circle cx="12.2" cy="10.8" r="3.2" fill={OUT} />
        <circle cx="12.2" cy="10.8" r="2.5" fill="#3b3b40" />
        <circle cx="12.2" cy="10.8" r="1" fill={GREY_DK} />
        {/* swingarm */}
        <rect x="3.8" y="10.2" width="5" height="0.9" fill={GREY_DK} />
        {/* sharp body */}
        <polygon points="4.6,5.6 11.6,5 12.4,7.4 10.6,9.6 5.6,9.2" fill={OUT} />
        <polygon points="5.2,6 11.2,5.5 11.8,7.4 10.2,9.1 6,8.7" fill={NIGHT} />
        {/* sage accents */}
        <polygon points="5.6,6.3 8.6,6 8.2,7 5.9,7.2" fill={SAGE} />
        <rect x="9.4" y="7.6" width="1.8" height="0.5" fill={SAGE_DK} />
        {/* tail + seat */}
        <polygon points="3.6,5 5.4,4.6 5.8,5.8 4,6.2" fill={OUT} />
        <rect x="5.4" y="4.7" width="3" height="0.9" rx="0.3" fill={OUT} />
        {/* fork + bars + light */}
        <path d="M11.8,7.4 L12.8,4.2" stroke={OUT} strokeWidth="1" />
        <rect x="11.9" y="3.6" width="2.1" height="0.8" rx="0.3" fill={OUT} />
        <rect x="12.6" y="5.4" width="1" height="0.7" fill={GOLD} />
      </svg>
    );
  }

  // ── FOOD: POPCORN — cream bucket, red stripes, gold kernels ──────────────
  if (type === 'dbt-popcorn') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <Shadow cx={8} cy={14} rx={3.8} ry={0.9} />
        {/* bucket */}
        <polygon points="4.4,5.6 11.6,5.6 10.6,13.6 5.4,13.6" fill={OUT} />
        <polygon points="5,6 11,6 10.2,13.2 5.8,13.2" fill={WHITE} />
        <polygon points="6.3,6 7.2,6 7,13.2 6.2,13.2" fill={RED} />
        <polygon points="8.8,6 9.7,6 9.8,13.2 9,13.2" fill={RED} />
        <polygon points="5,6 11,6 10.95,6.7 5.05,6.7" fill={CREAM_DK} />
        {/* kernels */}
        <circle cx="5.2" cy="4.8" r="1.2" fill={CREAM} />
        <circle cx="7" cy="3.8" r="1.4" fill={GOLD} />
        <circle cx="9" cy="3.6" r="1.4" fill={CREAM} />
        <circle cx="10.8" cy="4.8" r="1.2" fill={GOLD} />
        <circle cx="8" cy="5" r="1.3" fill={WHITE} />
        <circle cx="6.2" cy="5.4" r="1" fill={GOLD_DK} opacity="0.6" />
      </svg>
    );
  }

  // ── FOOD: SHWARMA — wrapped roll with fillings ───────────────────────────
  if (type === 'shwarma') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <Shadow cx={8} cy={14} rx={3.4} ry={0.8} />
        {/* foil */}
        <polygon points="5.6,9 10.4,9 9.9,13.6 6.1,13.6" fill={GREY} />
        <polygon points="5.6,9 10.4,9 10.3,10 5.7,10" fill="#b8bdc4" />
        <rect x="6.2" y="11.2" width="3.6" height="0.5" fill={GREY_DK} />
        {/* wrap bread */}
        <rect x="5" y="5.6" width="6" height="3.8" rx="1.2" fill={OUT} />
        <rect x="5.4" y="6" width="5.2" height="3" rx="0.9" fill={WOOD_LT} />
        <rect x="5.4" y="6" width="5.2" height="0.8" rx="0.4" fill={CREAM} />
        {/* fillings */}
        <rect x="5.9" y="3.6" width="1.3" height="2.6" fill={WOOD_DK} />
        <rect x="7.4" y="3.2" width="1.4" height="3" fill={CORAL_DK} />
        <rect x="9" y="3.8" width="1.2" height="2.4" fill={SAGE} />
        <circle cx="6.8" cy="3.4" r="0.7" fill={RED} />
      </svg>
    );
  }

  // ── FOOD: CHAAP — skewer with spicy chunks ───────────────────────────────
  if (type === 'chaap') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <Shadow cx={8} cy={14.2} rx={3} ry={0.8} />
        {/* skewer */}
        <rect x="7.4" y="1.6" width="1.2" height="12.6" fill={OUT} />
        <rect x="7.7" y="1.9" width="0.6" height="12" fill={WOOD_LT} />
        {/* chunks */}
        <rect x="4.2" y="3.2" width="7.6" height="2.5" rx="0.6" fill={OUT} />
        <rect x="4.6" y="3.5" width="6.8" height="1.9" rx="0.5" fill={CORAL} />
        <rect x="4.6" y="4.8" width="6.8" height="0.6" fill={CORAL_DK} />
        <rect x="3.8" y="6.4" width="8.4" height="2.5" rx="0.6" fill={OUT} />
        <rect x="4.2" y="6.7" width="7.6" height="1.9" rx="0.5" fill={CORAL_DK} />
        <rect x="4.2" y="6.7" width="7.6" height="0.6" fill={CORAL} />
        <rect x="4.2" y="9.6" width="7.6" height="2.5" rx="0.6" fill={OUT} />
        <rect x="4.6" y="9.9" width="6.8" height="1.9" rx="0.5" fill={CORAL} />
        <rect x="4.6" y="11.2" width="6.8" height="0.6" fill={RED} />
        {/* herbs */}
        <rect x="5.8" y="3.9" width="0.8" height="0.8" fill={SAGE} />
        <rect x="9.2" y="7.2" width="0.8" height="0.8" fill={SAGE} />
        <rect x="6.6" y="10.3" width="0.8" height="0.8" fill={SAGE} />
      </svg>
    );
  }

  // ── FOOD: GARLIC BREAD — buttery toasted slice ───────────────────────────
  if (type === 'garlic-bread') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <Shadow cx={8} cy={13} rx={5} ry={1} />
        <ellipse cx="8" cy="7.8" rx="6.2" ry="4.2" fill={OUT} />
        <ellipse cx="8" cy="7.8" rx="5.7" ry="3.7" fill={WOOD} />
        <ellipse cx="8" cy="7.6" rx="4.7" ry="2.8" fill={GOLD} />
        <ellipse cx="7.4" cy="7" rx="3.4" ry="1.8" fill={CREAM} />
        {/* herbs */}
        <rect x="5" y="6.6" width="0.9" height="0.9" fill={SAGE_DK} />
        <rect x="7.4" y="5.8" width="0.9" height="0.9" fill={SAGE_DK} />
        <rect x="9.2" y="7.8" width="0.9" height="0.9" fill={SAGE_DK} />
        <rect x="6.6" y="8.6" width="0.8" height="0.8" fill={SAGE_DK} />
        {/* butter glints */}
        <rect x="6" y="6.2" width="0.7" height="0.7" fill={WHITE} />
        <rect x="9.8" y="6.6" width="0.7" height="0.7" fill={GOLD} />
      </svg>
    );
  }

  // ── FOOD: THUMBS UP — cola bottle ────────────────────────────────────────
  if (type === 'thumbs-up') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <Shadow cx={8} cy={14.2} rx={2.8} ry={0.7} />
        {/* cap + neck */}
        <rect x="6.8" y="1.4" width="2.4" height="1.2" fill={OUT} />
        <rect x="7.1" y="1.7" width="1.8" height="0.6" fill={GREY} />
        <rect x="7" y="2.6" width="2" height="3" fill={OUT} />
        <rect x="7.4" y="2.9" width="1.2" height="2.7" fill="#5a3a22" />
        {/* bottle body */}
        <rect x="5.2" y="5.4" width="5.6" height="8.4" rx="1.4" fill={OUT} />
        <rect x="5.6" y="5.8" width="4.8" height="7.6" rx="1" fill="#4a2c18" />
        <rect x="6.1" y="6.2" width="0.8" height="6.6" fill="#6b4226" />
        {/* red label with thumb mark */}
        <rect x="5.6" y="7.6" width="4.8" height="3" fill={RED} />
        <rect x="5.6" y="7.6" width="4.8" height="0.5" fill={CORAL} />
        <circle cx="8" cy="9" r="0.8" fill={WHITE} />
        <rect x="7.7" y="7.9" width="0.6" height="0.8" fill={WHITE} />
      </svg>
    );
  }

  // ── FOOD: COFFEE — cream mug, warm steam ─────────────────────────────────
  if (type === 'coffee') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <Shadow cx={7.6} cy={13.6} rx={4} ry={0.9} />
        {/* handle */}
        <path d="M10.4,7.8 C13.2,7.8 13.2,11.4 10.4,11.4" fill="none" stroke={OUT} strokeWidth="2" />
        <path d="M10.4,7.8 C13.2,7.8 13.2,11.4 10.4,11.4" fill="none" stroke={CREAM} strokeWidth="1" />
        {/* mug */}
        <rect x="3.2" y="6" width="7.6" height="7.2" rx="0.9" fill={OUT} />
        <rect x="3.6" y="6.4" width="6.8" height="6.4" rx="0.6" fill={CREAM} />
        <rect x="3.6" y="6.4" width="0.9" height="6.4" fill={WHITE} />
        <rect x="4.2" y="6.9" width="5.6" height="1" fill="#5a3a22" />
        <rect x="3.6" y="11.6" width="6.8" height="1.2" fill={CREAM_DK} />
        <rect x="4.4" y="9.4" width="5.2" height="1.4" rx="0.4" fill={CORAL} />
        {/* steam */}
        <path d="M5.4,2 Q6.2,3 5.4,4 Q6.2,5 5.4,5.8" fill="none" stroke={GREY} strokeWidth="0.6" opacity="0.7" />
        <path d="M7.4,1.6 Q8.2,2.6 7.4,3.6 Q8.2,4.6 7.4,5.4" fill="none" stroke={GREY} strokeWidth="0.6" opacity="0.7" />
        <path d="M9.4,2.2 Q10.2,3.2 9.4,4.2 Q10.2,5.2 9.4,5.8" fill="none" stroke={GREY} strokeWidth="0.6" opacity="0.7" />
      </svg>
    );
  }

  // ── PHOTO FRAME — gilded gold frame, portrait silhouette (wall-hung) ─────
  if (type === 'photo-frame') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <rect x="0.8" y="1.6" width="14.4" height="12.8" fill={OUT} />
        <rect x="1.3" y="2.1" width="13.4" height="11.8" fill={GOLD} />
        <rect x="1.3" y="2.1" width="13.4" height="0.7" fill="#f0cd7e" />
        <rect x="1.3" y="13.2" width="13.4" height="0.7" fill={GOLD_DK} />
        <rect x="2.6" y="3.4" width="10.8" height="9.2" fill={GOLD_DK} />
        <rect x="3.1" y="3.9" width="9.8" height="8.2" fill={NIGHT} />
        {/* silhouette */}
        <circle cx="8" cy="6.8" r="2" fill={GREY_DK} />
        <path d="M4.6,12.1 C4.6,9.8 6.2,9.4 8,9.4 C9.8,9.4 11.4,9.8 11.4,12.1 Z" fill={GREY_DK} />
        {/* glass glint */}
        <path d="M4.2,11 L10.4,4.8" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
        {/* corner studs */}
        <rect x="1.8" y="2.6" width="0.9" height="0.9" fill={GOLD_DK} />
        <rect x="13.3" y="2.6" width="0.9" height="0.9" fill={GOLD_DK} />
        <rect x="1.8" y="12.5" width="0.9" height="0.9" fill={GOLD_DK} />
        <rect x="13.3" y="12.5" width="0.9" height="0.9" fill={GOLD_DK} />
      </svg>
    );
  }

  // ── FOOD: PIZZA — golden slice, coral pepperoni ──────────────────────────
  if (type === 'pizza') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <Shadow cx={8} cy={12.8} rx={4.4} ry={0.9} />
        <polygon points="8,2.2 2.6,11.8 13.4,11.8" fill={OUT} />
        <polygon points="8,3.2 3.4,11.2 12.6,11.2" fill={GOLD} />
        <polygon points="8,3.2 3.4,11.2 4.4,11.2 8,4.6" fill="#f0cd7e" />
        {/* crust */}
        <polygon points="3.4,11.2 12.6,11.2 12.2,12.2 3.8,12.2" fill={WOOD} />
        <polygon points="3.8,12.2 12.2,12.2 12,12.6 4,12.6" fill={WOOD_DK} />
        {/* pepperoni + herbs */}
        <circle cx="7" cy="8.2" r="1" fill={CORAL} />
        <circle cx="9.6" cy="9.4" r="1" fill={CORAL_DK} />
        <circle cx="8" cy="5.8" r="0.9" fill={CORAL} />
        <rect x="5.4" y="9.8" width="0.7" height="0.7" fill={SAGE_DK} />
        <rect x="10.6" y="7.4" width="0.7" height="0.7" fill={SAGE_DK} />
      </svg>
    );
  }

  // ── FOOD: CAN — little red soda can ──────────────────────────────────────
  if (type === 'can') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <Shadow cx={8} cy={13.4} rx={3} ry={0.7} />
        <rect x="4.8" y="2.8" width="6.4" height="10" rx="0.8" fill={OUT} />
        <rect x="5.2" y="3.2" width="5.6" height="9.2" rx="0.5" fill={RED} />
        <rect x="5.2" y="3.2" width="5.6" height="0.9" fill={GREY} />
        <rect x="5.2" y="11.6" width="5.6" height="0.8" fill={GREY_DK} />
        <rect x="5.7" y="4.4" width="0.9" height="6.8" fill={CORAL} />
        {/* swoosh + tab */}
        <path d="M6.4,10.2 L9.8,5.8" stroke={CREAM} strokeWidth="0.9" />
        <rect x="7.3" y="2.4" width="1.4" height="0.7" fill={GREY_DK} />
      </svg>
    );
  }

  // ── CAT — sitting orange tabby with cream chest, curled tail ─────────────
  if (type === 'cat') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <Shadow cx={8} cy={14.7} rx={4.8} ry={0.9} />
        {/* curled tail */}
        <rect x="10.6" y="12" width="4.4" height="2.2" rx="1" fill={OUT} />
        <rect x="11" y="12.4" width="3.6" height="1.4" rx="0.7" fill="#e08a3c" />
        <rect x="13.4" y="10.4" width="1.6" height="2.6" rx="0.7" fill={OUT} />
        <rect x="13.7" y="10.7" width="1" height="2" rx="0.5" fill="#e08a3c" />
        <rect x="13.7" y="11.4" width="1" height="0.5" fill="#b5662a" />
        {/* ears */}
        <polygon points="4.6,3.4 4.8,0.7 7.2,3" fill={OUT} />
        <polygon points="5.2,2.9 5.3,1.5 6.5,2.7" fill="#e08a3c" />
        <polygon points="11.4,3.4 11.2,0.7 8.8,3" fill={OUT} />
        <polygon points="10.8,2.9 10.7,1.5 9.5,2.7" fill="#e08a3c" />
        <polygon points="5.5,2.7 5.6,1.9 6.2,2.6" fill={CORAL_LT} />
        <polygon points="10.5,2.7 10.4,1.9 9.8,2.6" fill={CORAL_LT} />
        {/* body */}
        <rect x="3.7" y="6.8" width="8.6" height="7.6" rx="1.4" fill={OUT} />
        <rect x="4.1" y="7.2" width="7.8" height="6.8" rx="1.1" fill="#e08a3c" />
        {/* side stripes */}
        <rect x="4.5" y="8.2" width="1.1" height="0.7" fill="#b5662a" />
        <rect x="4.5" y="9.8" width="1.3" height="0.7" fill="#b5662a" />
        <rect x="10.4" y="8.2" width="1.1" height="0.7" fill="#b5662a" />
        <rect x="10.2" y="9.8" width="1.3" height="0.7" fill="#b5662a" />
        {/* cream chest */}
        <rect x="6.3" y="8.2" width="3.4" height="5.8" rx="1.2" fill={CREAM} />
        {/* head */}
        <rect x="4.4" y="2.2" width="7.2" height="5.4" rx="1.2" fill={OUT} />
        <rect x="4.8" y="2.6" width="6.4" height="4.6" rx="1" fill="#e08a3c" />
        {/* forehead stripes */}
        <rect x="6.7" y="2.7" width="0.6" height="1.1" fill="#b5662a" />
        <rect x="7.7" y="2.6" width="0.6" height="1.3" fill="#b5662a" />
        <rect x="8.7" y="2.7" width="0.6" height="1.1" fill="#b5662a" />
        {/* muzzle + face */}
        <rect x="6.6" y="5.2" width="2.8" height="1.7" rx="0.6" fill={CREAM} />
        <rect x="6.1" y="4.3" width="0.9" height="0.9" fill={NIGHT} />
        <rect x="9" y="4.3" width="0.9" height="0.9" fill={NIGHT} />
        <rect x="7.7" y="5.4" width="0.7" height="0.6" fill={CORAL} />
        <rect x="7.9" y="6" width="0.3" height="0.6" fill={OUT} />
        {/* front paws */}
        <rect x="5.2" y="13" width="1.8" height="1.1" rx="0.4" fill={CREAM} />
        <rect x="9" y="13" width="1.8" height="1.1" rx="0.4" fill={CREAM} />
      </svg>
    );
  }

  // ── MARSHMALLOW — stick with toasted marshmallow ─────────────────────────
  if (type === 'marshmallow') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <Shadow cx={7} cy={14.8} rx={3.2} ry={0.6} />
        {/* stick */}
        <path d="M2.6,14.6 L10.8,4.4" stroke={OUT} strokeWidth="1.7" />
        <path d="M2.8,14.4 L10.6,4.6" stroke={WOOD_DK} strokeWidth="0.9" />
        <path d="M2.9,14.2 L6.4,9.8" stroke={WOOD} strokeWidth="0.4" />
        {/* marshmallow */}
        <rect x="9.4" y="1.4" width="5.2" height="4.6" rx="1" fill={OUT} />
        <rect x="9.8" y="1.8" width="4.4" height="3.8" rx="0.8" fill={WHITE} />
        <rect x="9.8" y="1.8" width="4.4" height="0.8" rx="0.4" fill="#ffffff" />
        {/* toasted side */}
        <rect x="12.5" y="2.4" width="1.7" height="3" rx="0.6" fill={GOLD} />
        <rect x="13.2" y="3.6" width="0.9" height="1.6" rx="0.4" fill={GOLD_DK} />
        <rect x="13.6" y="4.6" width="0.5" height="0.6" fill={WOOD_DK} />
      </svg>
    );
  }

  // ── COUCH — warm brown 2-seater with cream cushions ──────────────────────
  if (type === 'couch') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <Shadow cx={8} cy={15} rx={7} ry={0.9} />
        <rect x="0.4" y="3.4" width="15.2" height="11" fill={OUT} />
        {/* backrest */}
        <rect x="0.9" y="3.9" width="14.2" height="4.4" fill={WOOD_DK} />
        <rect x="0.9" y="3.9" width="14.2" height="0.7" fill={WOOD} />
        {/* back cushions */}
        <rect x="2.2" y="4.7" width="5.5" height="3.2" rx="0.7" fill={CREAM} />
        <rect x="2.2" y="7.1" width="5.5" height="0.8" rx="0.4" fill={CREAM_DK} />
        <rect x="8.3" y="4.7" width="5.5" height="3.2" rx="0.7" fill={CREAM} />
        <rect x="8.3" y="7.1" width="5.5" height="0.8" rx="0.4" fill={CREAM_DK} />
        {/* armrests */}
        <rect x="0.9" y="6.6" width="2.1" height="6.6" fill={WOOD_DK} />
        <rect x="0.9" y="6.6" width="2.1" height="0.9" fill={WOOD} />
        <rect x="13" y="6.6" width="2.1" height="6.6" fill={WOOD_DK} />
        <rect x="13" y="6.6" width="2.1" height="0.9" fill={WOOD} />
        {/* seat cushions */}
        <rect x="3.1" y="8.6" width="4.9" height="3.4" rx="0.7" fill={CREAM} />
        <rect x="3.1" y="8.6" width="4.9" height="0.7" rx="0.35" fill={WHITE} />
        <rect x="8.1" y="8.6" width="4.9" height="3.4" rx="0.7" fill={CREAM} />
        <rect x="8.1" y="8.6" width="4.9" height="0.7" rx="0.35" fill={WHITE} />
        {/* base + feet */}
        <rect x="3.1" y="12" width="9.8" height="1.2" fill={WOOD_DK} />
        <rect x="1.6" y="13.2" width="1.4" height="1.2" fill={OUT} />
        <rect x="13" y="13.2" width="1.4" height="1.2" fill={OUT} />
      </svg>
    );
  }

  // ── FRAME LANDSCAPE — mountains + sky painting (wall-hung) ───────────────
  if (type === 'frame-landscape') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <rect x="0.8" y="3" width="14.4" height="10" fill={OUT} />
        <rect x="1.3" y="3.5" width="13.4" height="9" fill={WOOD} />
        <rect x="1.3" y="3.5" width="13.4" height="0.6" fill={WOOD_LT} />
        <rect x="1.3" y="11.9" width="13.4" height="0.6" fill={WOOD_DK} />
        <rect x="2.6" y="4.8" width="10.8" height="6.4" fill={OUT} />
        {/* sky + sun */}
        <rect x="3" y="5.2" width="10" height="5.6" fill={SCREEN} />
        <circle cx="11" cy="6.6" r="1" fill={GOLD} />
        {/* mountains */}
        <polygon points="3,10.8 6.4,6.2 9.4,10.8" fill={SAGE_DK} />
        <polygon points="6.8,10.8 10,7.2 13,10.8" fill={SAGE} />
        <polygon points="5.9,6.9 6.4,6.2 7,7 6.4,7.4" fill={WHITE} />
        {/* meadow */}
        <rect x="3" y="9.9" width="10" height="0.9" fill={SAGE} />
      </svg>
    );
  }

  // ── FRAME PHOTO — small wooden portrait frame (wall-hung) ────────────────
  if (type === 'frame-photo') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <rect x="3.6" y="1.6" width="8.8" height="12.8" fill={OUT} />
        <rect x="4.1" y="2.1" width="7.8" height="11.8" fill={WOOD} />
        <rect x="4.1" y="2.1" width="7.8" height="0.6" fill={WOOD_LT} />
        <rect x="4.1" y="13.3" width="7.8" height="0.6" fill={WOOD_DK} />
        {/* cream mat + sepia photo */}
        <rect x="5.2" y="3.2" width="5.6" height="9.6" fill={CREAM} />
        <rect x="5.8" y="3.8" width="4.4" height="8.4" fill="#d8c49a" />
        {/* portrait silhouette */}
        <circle cx="8" cy="6.6" r="1.4" fill={GREY_DK} />
        <path d="M6.2,12.2 C6.2,10.2 7,9.6 8,9.6 C9,9.6 9.8,10.2 9.8,12.2 Z" fill={GREY_DK} />
        <path d="M6.2,11.4 L9.6,4.6" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
      </svg>
    );
  }

  // ── POSTER ANIME — coral poster, spiky-hair silhouette (wall-hung) ───────
  if (type === 'poster-anime') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <rect x="2.8" y="1.2" width="10.4" height="13.6" fill={OUT} />
        <rect x="3.3" y="1.7" width="9.4" height="12.6" fill={WOOD_DK} />
        <rect x="4" y="2.4" width="8" height="11.2" fill={CORAL} />
        <rect x="4" y="2.4" width="8" height="2" fill={CORAL_LT} />
        {/* spiky hair silhouette */}
        <polygon points="5.4,7 6,4.6 6.9,6 7.6,3.8 8.4,6 9.4,4.4 10.6,7" fill={NIGHT} />
        <rect x="6.2" y="6.4" width="3.6" height="2.8" rx="0.6" fill={NIGHT} />
        <rect x="5.4" y="9" width="5.2" height="2.2" rx="0.5" fill={NIGHT} />
        {/* eye glints */}
        <rect x="7" y="7.4" width="0.8" height="0.4" fill={CORAL_LT} />
        <rect x="8.4" y="7.4" width="0.8" height="0.4" fill={CORAL_LT} />
        {/* title strokes */}
        <rect x="5" y="11.9" width="3.6" height="0.7" fill={CREAM} />
        <rect x="9" y="11.9" width="1.8" height="0.7" fill={GOLD} />
      </svg>
    );
  }

  // ── POSTER BAND — sunburst gig poster (wall-hung) ────────────────────────
  if (type === 'poster-band') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <rect x="2.8" y="1.2" width="10.4" height="13.6" fill={OUT} />
        <rect x="3.3" y="1.7" width="9.4" height="12.6" fill={WOOD_DK} />
        <rect x="4" y="2.4" width="8" height="11.2" fill={NIGHT} />
        {/* sunburst rays */}
        <polygon points="8,7 4,2.4 6.4,2.4" fill={GOLD} opacity="0.85" />
        <polygon points="8,7 9.6,2.4 12,2.4" fill={GOLD} opacity="0.85" />
        <polygon points="8,7 4,4.8 4,7.6" fill={GOLD_DK} opacity="0.8" />
        <polygon points="8,7 12,4.8 12,7.6" fill={GOLD_DK} opacity="0.8" />
        <polygon points="8,7 5,11 7,11" fill={GOLD} opacity="0.7" />
        <polygon points="8,7 9,11 11,11" fill={GOLD} opacity="0.7" />
        {/* center disc */}
        <circle cx="8" cy="7" r="1.8" fill={CORAL} />
        <circle cx="8" cy="7" r="1.1" fill={CREAM} />
        {/* title strokes */}
        <rect x="5" y="11.9" width="4.4" height="0.7" fill={GOLD} />
        <rect x="9.8" y="11.9" width="1.2" height="0.7" fill={CREAM} />
      </svg>
    );
  }

  // ── PLANT — small potted plant, terracotta pot, 3 leaves ─────────────────
  if (type === 'plant') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
        <Shadow cx={8} cy={14.8} rx={3.6} ry={0.7} />
        {/* leaves */}
        <polygon points="7.6,9.4 4.4,7 5,4.4 7.7,7.2" fill={SAGE} stroke={OUT} strokeWidth="0.5" />
        <polygon points="8.4,9.4 11.6,7 11,4.4 8.3,7.2" fill={SAGE_DK} stroke={OUT} strokeWidth="0.5" />
        <polygon points="7.3,9.4 7.2,3.6 8.8,3.6 8.7,9.4" fill={SAGE} stroke={OUT} strokeWidth="0.5" />
        <path d="M8,4.4 L8,8.8" stroke={SAGE_DK} strokeWidth="0.4" />
        <path d="M5.4,5.4 L7.2,7.6" stroke={SAGE_DK} strokeWidth="0.4" />
        {/* pot rim */}
        <rect x="4.3" y="9" width="7.4" height="1.8" fill={OUT} />
        <rect x="4.7" y="9.3" width="6.6" height="1.2" fill={TERRA_LT} />
        {/* pot body */}
        <polygon points="4.9,10.8 11.1,10.8 10.4,14.6 5.6,14.6" fill={OUT} />
        <polygon points="5.4,10.8 10.6,10.8 10,14.2 6,14.2" fill={TERRA} />
        <polygon points="5.4,10.8 6.6,10.8 6.4,14.2 6,14.2" fill={TERRA_LT} />
      </svg>
    );
  }

  // ── FALLBACK — small wooden crate so unknown types stay visible ──────────
  return (
    <svg width="100%" height="100%" viewBox="0 0 16 16" shapeRendering="crispEdges">
      <Shadow cx={8} cy={14.6} rx={5} ry={0.9} />
      <rect x="2.6" y="3.6" width="10.8" height="10.8" fill={OUT} />
      <rect x="3" y="4" width="10" height="10" fill={WOOD} />
      <rect x="3" y="4" width="10" height="0.8" fill={WOOD_LT} />
      <rect x="3" y="13.2" width="10" height="0.8" fill={WOOD_DK} />
      <rect x="3" y="4" width="0.8" height="10" fill={WOOD_LT} />
      <path d="M3.6,4.6 L12.4,13.4 M12.4,4.6 L3.6,13.4" stroke={WOOD_DK} strokeWidth="0.9" />
      <rect x="3" y="8.5" width="10" height="0.9" fill={WOOD_DK} />
    </svg>
  );
}
