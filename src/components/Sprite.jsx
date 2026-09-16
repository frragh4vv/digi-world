import React from 'react';

// Helper to convert RGB integer values to Hex colors for customizer
const rgbToHex = (r, g, b) => {
  const toHex = (c) => {
    const hex = Math.max(0, Math.min(255, c)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export default function Sprite({ direction, frame, customColors }) {
  const defaultColors = {
    hat: '#8a2be2',
    skin: '#ffb6c1',
    shirt: '#1e88e5',
    pants: '#ffd700',
    shoes: '#ffffff',
    gender: 'male',
    faceStyle: 'classic'
  };

  const colors = { ...defaultColors, ...customColors };
  const gender = colors.gender || 'male';
  const faceStyle = colors.faceStyle || 'classic';

  const isWalking = frame === 1 || frame === 3;
  const leftLegUp = frame === 3;
  const rightLegUp = frame === 1;

  return (
    <svg width="100%" height="100%" viewBox="0 0 32 32" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      {/* 1. Global Shadow Beneath Character */}
      <ellipse cx="16" cy="30" rx="9" ry="2" fill="rgba(0,0,0,0.35)" />

      {/* 2. DIRECTION DOWN (FACING FRONT) */}
      {direction === 'down' && (
        <>
          {/* Back hair for female sprite */}
          {gender === 'female' && (
            <>
              <rect x="8" y="10" width="16" height="13" fill={colors.hat} />
              <rect x="7" y="12" width="2" height="9" fill={colors.hat} />
              <rect x="23" y="12" width="2" height="9" fill={colors.hat} />
            </>
          )}

          {/* Skin Face base */}
          <rect x="10" y="10" width="12" height="7" fill={colors.skin} />
          
          {/* Hair Front Lock details */}
          {gender === 'male' ? (
            <>
              {/* Short spiked hair */}
              <rect x="9" y="6" width="14" height="4" fill={colors.hat} />
              <rect x="10" y="5" width="2" height="1" fill={colors.hat} />
              <rect x="15" y="5" width="2" height="1" fill={colors.hat} />
              <rect x="20" y="5" width="2" height="1" fill={colors.hat} />
              {/* Short sideburns */}
              <rect x="9" y="10" width="1.5" height="3" fill={colors.hat} />
              <rect x="21.5" y="10" width="1.5" height="3" fill={colors.hat} />
            </>
          ) : (
            <>
              {/* Female bangs */}
              <rect x="8" y="7" width="16" height="3" fill={colors.hat} />
              <rect x="9" y="10" width="2" height="2" fill={colors.hat} />
              <rect x="21" y="10" width="2" height="2" fill={colors.hat} />
            </>
          )}

          {/* Face Elements based on Style */}
          {faceStyle === 'glasses' && (
            <>
              {/* Specs outline */}
              <rect x="11" y="11" width="4" height="3" fill="none" stroke="#111" strokeWidth="0.8" />
              <rect x="17" y="11" width="4" height="3" fill="none" stroke="#111" strokeWidth="0.8" />
              <line x1="15" y1="12" x2="17" y2="12" stroke="#111" strokeWidth="0.8" />
              {/* Eyes inside specs */}
              <rect x="12" y="12" width="1.2" height="1.2" fill="#000" />
              <rect x="18" y="12" width="1.2" height="1.2" fill="#000" />
            </>
          )}

          {faceStyle === 'visor' && (
            <>
              {/* Cyberpunk Visor */}
              <rect x="9.5" y="11" width="13" height="3" fill="rgba(0, 255, 255, 0.85)" stroke="#000" strokeWidth="0.8" />
              <rect x="12" y="12" width="8" height="1" fill="#ffffff" />
            </>
          )}

          {faceStyle === 'cute' && (
            <>
              {/* Blushing Cheeks */}
              <rect x="10" y="14" width="2" height="1" fill="#ff69b4" opacity="0.8" />
              <rect x="20" y="14" width="2" height="1" fill="#ff69b4" opacity="0.8" />
              {/* Cute Eyes */}
              <rect x="12" y="12" width="1.5" height="1.8" fill="#111" />
              <rect x="18" y="12" width="1.5" height="1.8" fill="#111" />
            </>
          )}

          {faceStyle === 'classic' && (
            <>
              {/* Classic Eyes */}
              <rect x="12" y="12" width="1.5" height="2" fill="#111" />
              <rect x="18" y="12" width="1.5" height="2" fill="#111" />
              {/* Small smile */}
              <rect x="15" y="15" width="2" height="0.8" fill="#e57373" />
            </>
          )}

          {/* Neck */}
          <rect x="14" y="17" width="4" height="1.2" fill={colors.skin} />

          {/* Shirt / Torso */}
          <rect x="9" y="18" width="14" height="7" fill={colors.shirt} rx="0.5" />
          <polygon points="14,18 18,18 16,21" fill={colors.skin} /> {/* V-neck collar */}
          <rect x="15.5" y="21" width="1" height="3" fill={colors.pants} opacity="0.8" /> {/* Tie/Emblem detail */}

          {/* Arms & Hands */}
          <rect x="7" y="18" width="2" height="5" fill={colors.shirt} rx="0.5" />
          <rect x="7" y="23" width="2" height="1.2" fill={colors.skin} />
          
          <rect x="23" y="18" width="2" height="5" fill={colors.shirt} rx="0.5" />
          <rect x="23" y="23" width="2" height="1.2" fill={colors.skin} />

          {/* Pants */}
          <rect x="9.5" y="25" width="13" height="4" fill={colors.pants} />
          <rect x="15.5" y="26" width="1" height="3" fill="#000" opacity="0.2" /> {/* leg divider */}

          {/* Shoes (Walk frames) */}
          <rect x="9.5" y={leftLegUp ? 28.2 : 29} width="3" height="2" fill={colors.shoes} rx="0.5" />
          <rect x="19.5" y={rightLegUp ? 28.2 : 29} width="3" height="2" fill={colors.shoes} rx="0.5" />
        </>
      )}

      {/* 3. DIRECTION UP (FACING BACK) */}
      {direction === 'up' && (
        <>
          {/* Back of Head Hair */}
          {gender === 'female' ? (
            <>
              {/* Long back hair covering neck completely */}
              <rect x="8" y="6" width="16" height="18" fill={colors.hat} rx="1" />
            </>
          ) : (
            <>
              {/* Short back hair showing neck */}
              <rect x="9" y="6" width="14" height="11" fill={colors.hat} rx="1" />
              <rect x="14" y="17" width="4" height="1.2" fill={colors.skin} />
            </>
          )}

          {/* Shirt / Torso */}
          <rect x="9" y="18" width="14" height="7" fill={colors.shirt} rx="0.5" />

          {/* Arms */}
          <rect x="7" y="18" width="2" height="5" fill={colors.shirt} rx="0.5" />
          <rect x="23" y="18" width="2" height="5" fill={colors.shirt} rx="0.5" />

          {/* Pants */}
          <rect x="9.5" y="25" width="13" height="4" fill={colors.pants} />
          <rect x="15.5" y="25" width="1" height="4" fill="#000" opacity="0.25" />

          {/* Shoes */}
          <rect x="9.5" y={leftLegUp ? 28.2 : 29} width="3" height="2" fill={colors.shoes} rx="0.5" />
          <rect x="19.5" y={rightLegUp ? 28.2 : 29} width="3" height="2" fill={colors.shoes} rx="0.5" />
        </>
      )}

      {/* 4. DIRECTION LEFT (FACING LEFT PROFILE) */}
      {direction === 'left' && (
        <>
          {/* Long Hair Back lock for female */}
          {gender === 'female' && (
            <rect x="17" y="9" width="4.5" height="13" fill={colors.hat} rx="1" />
          )}

          {/* Skin Face profile left */}
          <rect x="11.5" y="10" width="7.5" height="7" fill={colors.skin} />
          
          {/* Hair left locks */}
          {gender === 'male' ? (
            <>
              <rect x="13.5" y="6" width="7.5" height="4" fill={colors.hat} />
              <rect x="17" y="10" width="3" height="3" fill={colors.hat} />
            </>
          ) : (
            <>
              <rect x="12.5" y="7" width="8.5" height="3.5" fill={colors.hat} />
            </>
          )}

          {/* Eye side profile indicator */}
          {faceStyle === 'visor' ? (
            <rect x="10.5" y="11" width="4" height="2.5" fill="#00ffff" stroke="#111" strokeWidth="0.5" />
          ) : faceStyle === 'glasses' ? (
            <rect x="11" y="11" width="3" height="2.5" fill="none" stroke="#111" strokeWidth="0.8" />
          ) : (
            <rect x="12.5" y="12" width="1.2" height="1.8" fill="#111" />
          )}

          {/* Body Shirt profile */}
          <rect x="12" y="18" width="8.5" height="7" fill={colors.shirt} rx="0.5" />

          {/* Arm swinging */}
          <rect 
            x="14" y="18" width="2.2" height="5.5" 
            fill={colors.shirt} 
            rx="0.5" 
            transform={isWalking ? "rotate(15, 15, 18)" : undefined}
          />
          <rect x="14" y="23.5" width="2.2" height="1" fill={colors.skin} />

          {/* Pants */}
          <rect x="12.5" y="25" width="7" height="4" fill={colors.pants} />

          {/* Shoes side-stride walking */}
          {isWalking ? (
            <>
              <rect x="10" y="28.5" width="3.5" height="1.8" fill={colors.shoes} rx="0.5" />
              <rect x="17.5" y="29" width="3.5" height="1.8" fill={colors.shoes} rx="0.5" />
            </>
          ) : (
            <>
              <rect x="13.5" y="29" width="5.5" height="1.8" fill={colors.shoes} rx="0.5" />
            </>
          )}
        </>
      )}

      {/* 5. DIRECTION RIGHT (FACING RIGHT PROFILE) */}
      {direction === 'right' && (
        <>
          {/* Long Hair Back lock for female */}
          {gender === 'female' && (
            <rect x="10.5" y="9" width="4.5" height="13" fill={colors.hat} rx="1" />
          )}

          {/* Skin Face profile right */}
          <rect x="13" y="10" width="7.5" height="7" fill={colors.skin} />
          
          {/* Hair right locks */}
          {gender === 'male' ? (
            <>
              <rect x="11" y="6" width="7.5" height="4" fill={colors.hat} />
              <rect x="12" y="10" width="3" height="3" fill={colors.hat} />
            </>
          ) : (
            <>
              <rect x="11" y="7" width="8.5" height="3.5" fill={colors.hat} />
            </>
          )}

          {/* Eye side profile indicator */}
          {faceStyle === 'visor' ? (
            <rect x="17.5" y="11" width="4" height="2.5" fill="#00ffff" stroke="#111" strokeWidth="0.5" />
          ) : faceStyle === 'glasses' ? (
            <rect x="18" y="11" width="3" height="2.5" fill="none" stroke="#111" strokeWidth="0.8" />
          ) : (
            <rect x="18.3" y="12" width="1.2" height="1.8" fill="#111" />
          )}

          {/* Body Shirt profile */}
          <rect x="11.5" y="18" width="8.5" height="7" fill={colors.shirt} rx="0.5" />

          {/* Arm swinging */}
          <rect 
            x="15.8" y="18" width="2.2" height="5.5" 
            fill={colors.shirt} 
            rx="0.5" 
            transform={isWalking ? "rotate(-15, 17, 18)" : undefined}
          />
          <rect x="15.8" y="23.5" width="2.2" height="1" fill={colors.skin} />

          {/* Pants */}
          <rect x="12.5" y="25" width="7" height="4" fill={colors.pants} />

          {/* Shoes side-stride walking */}
          {isWalking ? (
            <>
              <rect x="11" y="29" width="3.5" height="1.8" fill={colors.shoes} rx="0.5" />
              <rect x="18.5" y="28.5" width="3.5" height="1.8" fill={colors.shoes} rx="0.5" />
            </>
          ) : (
            <>
              <rect x="13" y="29" width="5.5" height="1.8" fill={colors.shoes} rx="0.5" />
            </>
          )}
        </>
      )}
    </svg>
  );
}
