import React, { useState } from 'react';

// Helper to convert RGB integer values to Hex colors for customizer
export const rgbToHex = (r, g, b) => {
  const toHex = (c) => {
    const hex = Math.max(0, Math.min(255, c)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export default function Sprite({ direction = 'down', frame = 0, customColors, isRaghav = false }) {
  const [imgError, setImgError] = useState(false);
  
  // Strictly map Raghav NPC frames so he never flashes front frames or spins sideways
  let r = 0;
  let c = 0;
  let flipX = false;

  if (direction === 'down') {
    r = 0;
    c = (frame || 0) % 4;
  } else if (direction === 'up') {
    r = 1;
    c = ((frame || 0) % 3) + 1;
  } else if (direction === 'right') {
    r = 2;
    c = ((frame || 0) % 3) + 1;
  } else if (direction === 'left') {
    r = 2;
    c = ((frame || 0) % 3) + 1;
    flipX = true;
  }

  const pngPath = `/sprites/raghav_r${r}_c${c}.png`;

  // Only Raghav NPC uses the pre-rendered Raghav sprite sheet
  if (isRaghav && !imgError) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <img
          src={pngPath}
          alt={`raghav_${direction}_${frame}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            imageRendering: 'pixelated',
            transform: flipX ? 'scaleX(-1)' : 'none'
          }}
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // --- Option A: Customizer High-Res Layered Procedural Avatar ---
  const defaultColors = {
    hat: '#181820',          // Hair / Cap color
    skin: '#ffd8b8',         // Skin complexion
    shirt: '#e63946',        // Outfit / Top color
    pants: '#2b4162',        // Jeans / Bottom color
    shoes: '#ffffff',        // Sneakers
    hairStyle: 'spiky',      // spiky | afro | messy | cap | long
    outfitType: 'hoodie',    // hoodie | tshirt | jersey | jacket
    pantsType: 'jeans',      // jeans | cargo | trackpants | shorts
    faceStyle: 'classic'     // classic | glasses | visor | cute
  };

  const colors = { ...defaultColors, ...customColors };
  
  // Backward compatibility: map old gender setting if hairStyle not set
  let hairStyle = colors.hairStyle;
  if (!hairStyle) {
    hairStyle = colors.gender === 'female' ? 'long' : 'spiky';
  }
  const outfitType = colors.outfitType || 'hoodie';
  const pantsType = colors.pantsType || 'jeans';
  const faceStyle = colors.faceStyle || 'classic';

  const isWalking = frame === 1 || frame === 3;
  const strideA = frame === 1;
  const strideB = frame === 3;
  const leftLegUp = strideB;
  const rightLegUp = strideA;

  const hairCol = colors.hat || '#181820';
  const skinCol = colors.skin || '#ffd8b8';
  const shirtCol = colors.shirt || '#e63946';
  const pantsCol = colors.pants || '#2b4162';
  const shoeCol = colors.shoes || '#ffffff';

  // Secondary accents
  const shirtDark = '#101016';
  const denimFade = '#3e5880';
  const seamStitch = '#d4a373';

  return (
    <svg width="100%" height="100%" viewBox="0 0 32 32" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      {/* 1. Ground Shadow Beneath Feet */}
      <ellipse cx="16" cy="30" rx="9" ry="2.2" fill="rgba(0,0,0,0.38)" />

      {/* ═════════════════════════════════════════════════════════════════════
          2. DIRECTION DOWN (FACING FORWARD)
         ═════════════════════════════════════════════════════════════════════ */}
      {direction === 'down' && (
        <>
          {/* Long Hair Back Tresses */}
          {hairStyle === 'long' && (
            <>
              <rect x="7" y="10" width="18" height="13" fill={hairCol} rx="1" />
              <rect x="6" y="12" width="2" height="10" fill={hairCol} />
              <rect x="24" y="12" width="2" height="10" fill={hairCol} />
            </>
          )}

          {/* Afro Rear Volume */}
          {hairStyle === 'afro' && (
            <rect x="6" y="4" width="20" height="12" fill={hairCol} rx="3" />
          )}

          {/* Head & Face Skin Base */}
          <rect x="10" y="10" width="12" height="7" fill={skinCol} />

          {/* Hair Styles (Front) */}
          {hairStyle === 'spiky' && (
            <>
              {/* Spiky crown */}
              <rect x="9" y="6" width="14" height="4" fill={hairCol} />
              <rect x="9" y="4" width="3" height="2" fill={hairCol} />
              <rect x="14" y="3" width="4" height="3" fill={hairCol} />
              <rect x="20" y="4" width="3" height="2" fill={hairCol} />
              {/* Forehead spikes & sideburns */}
              <polygon points="10,10 12,13 14,10" fill={hairCol} />
              <polygon points="15,10 17,13 19,10" fill={hairCol} />
              <rect x="9" y="10" width="1.5" height="3" fill={hairCol} />
              <rect x="21.5" y="10" width="1.5" height="3" fill={hairCol} />
            </>
          )}

          {hairStyle === 'messy' && (
            <>
              {/* Trendy Curtains / Messy fringe */}
              <rect x="8.5" y="6" width="15" height="4.5" fill={hairCol} rx="1" />
              {/* Left curtain fringe */}
              <rect x="8.5" y="10" width="3.5" height="3.5" fill={hairCol} />
              <polygon points="12,10 13.5,12 12,13.5" fill={hairCol} />
              {/* Right curtain fringe */}
              <rect x="20" y="10" width="3.5" height="3.5" fill={hairCol} />
              <polygon points="20,10 18.5,12 20,13.5" fill={hairCol} />
              {/* Center parted gap */}
              <rect x="14.5" y="8" width="3" height="2" fill={hairCol} opacity="0.3" />
            </>
          )}

          {hairStyle === 'cap' && (
            <>
              {/* Baseball cap / Beanie dome */}
              <rect x="9" y="5" width="14" height="5" fill={hairCol} rx="2" />
              <rect x="8" y="9" width="16" height="2" fill={hairCol} />
              {/* Visor brim projecting forward */}
              <rect x="7" y="10" width="18" height="1.5" fill="#111" />
              {/* Small logo emblem */}
              <rect x="15" y="6.5" width="2" height="1.8" fill="#fff" />
              {/* Hair peeking below sides */}
              <rect x="9" y="11" width="1.5" height="2" fill="#181820" />
              <rect x="21.5" y="11" width="1.5" height="2" fill="#181820" />
            </>
          )}

          {hairStyle === 'afro' && (
            <>
              {/* Afro forehead line */}
              <rect x="9" y="8" width="14" height="2" fill={hairCol} />
              <rect x="8" y="9" width="2" height="3" fill={hairCol} />
              <rect x="22" y="9" width="2" height="3" fill={hairCol} />
            </>
          )}

          {hairStyle === 'long' && (
            <>
              {/* Sleek bangs */}
              <rect x="8.5" y="6" width="15" height="4" fill={hairCol} />
              <rect x="8.5" y="10" width="2.5" height="3" fill={hairCol} />
              <rect x="21" y="10" width="2.5" height="3" fill={hairCol} />
            </>
          )}

          {/* Facial Accessories */}
          {faceStyle === 'glasses' && (
            <>
              <rect x="11" y="11" width="4" height="3" fill="none" stroke="#111" strokeWidth="0.8" />
              <rect x="17" y="11" width="4" height="3" fill="none" stroke="#111" strokeWidth="0.8" />
              <line x1="15" y1="12" x2="17" y2="12" stroke="#111" strokeWidth="0.8" />
              <rect x="12.2" y="12" width="1.3" height="1.3" fill="#111" />
              <rect x="18.2" y="12" width="1.3" height="1.3" fill="#111" />
            </>
          )}

          {faceStyle === 'visor' && (
            <>
              <rect x="9.5" y="11" width="13" height="3" fill="rgba(0, 240, 255, 0.9)" stroke="#111" strokeWidth="0.8" />
              <rect x="12" y="12" width="8" height="1" fill="#ffffff" />
            </>
          )}

          {faceStyle === 'cute' && (
            <>
              <rect x="10" y="14" width="2" height="1" fill="#ff69b4" opacity="0.85" />
              <rect x="20" y="14" width="2" height="1" fill="#ff69b4" opacity="0.85" />
              <rect x="12" y="12" width="1.5" height="2" fill="#111" />
              <rect x="18" y="12" width="1.5" height="2" fill="#111" />
              <rect x="15" y="14.8" width="2" height="0.8" fill="#e57373" />
            </>
          )}

          {faceStyle === 'classic' && (
            <>
              <rect x="12" y="12" width="1.5" height="2" fill="#111" />
              <rect x="18" y="12" width="1.5" height="2" fill="#111" />
              <rect x="15" y="14.8" width="2" height="0.8" fill="#d9534f" />
            </>
          )}

          {/* Neck */}
          <rect x="14" y="17" width="4" height="1.2" fill={skinCol} />

          {/* ─── TOPS / OUTFITS ─── */}
          {outfitType === 'hoodie' && (
            <>
              {/* Hoodie Torso */}
              <rect x="9" y="18" width="14" height="7" fill={shirtCol} rx="0.5" />
              {/* Kangaroo front pocket */}
              <rect x="11.5" y="21.5" width="9" height="3" fill={shirtCol} stroke="rgba(0,0,0,0.25)" strokeWidth="0.5" />
              {/* White drawstrings */}
              <rect x="13.5" y="18" width="0.8" height="3" fill="#ffffff" />
              <rect x="17.5" y="18" width="0.8" height="3" fill="#ffffff" />
              {/* Long sleeves */}
              <rect x="7" y="18" width="2.2" height="5.5" fill={shirtCol} rx="0.5" />
              <rect x="7" y="23.5" width="2.2" height="1.2" fill={skinCol} />
              <rect x="22.8" y="18" width="2.2" height="5.5" fill={shirtCol} rx="0.5" />
              <rect x="22.8" y="23.5" width="2.2" height="1.2" fill={skinCol} />
            </>
          )}

          {outfitType === 'tshirt' && (
            <>
              {/* Graphic T-shirt */}
              <rect x="9" y="18" width="14" height="7" fill={shirtCol} rx="0.5" />
              <polygon points="14,18 18,18 16,20" fill={skinCol} />
              {/* Front graphic print box */}
              <rect x="13" y="20.5" width="6" height="2.8" fill="#111" />
              <rect x="14" y="21.2" width="4" height="1.4" fill="#00f0ff" />
              {/* Short sleeves with exposed arms */}
              <rect x="7" y="18" width="2.2" height="2.5" fill={shirtCol} rx="0.5" />
              <rect x="7" y="20.5" width="2.2" height="4.2" fill={skinCol} />
              <rect x="22.8" y="18" width="2.2" height="2.5" fill={shirtCol} rx="0.5" />
              <rect x="22.8" y="20.5" width="2.2" height="4.2" fill={skinCol} />
            </>
          )}

          {outfitType === 'jersey' && (
            <>
              {/* Athletic Football / Sport Jersey */}
              <rect x="9" y="18" width="14" height="7" fill={shirtCol} rx="0.5" />
              <polygon points="13.5,18 18.5,18 16,20.5" fill="#fff" />
              {/* Athletic chest stripes */}
              <rect x="9" y="19" width="14" height="1" fill="#ffffff" opacity="0.8" />
              {/* Chest number 7 */}
              <rect x="15" y="21" width="2" height="3" fill="#ffffff" />
              {/* Short sport sleeves */}
              <rect x="7" y="18" width="2.2" height="2.8" fill={shirtCol} rx="0.5" />
              <rect x="7" y="20" width="2.2" height="0.8" fill="#ffffff" />
              <rect x="7" y="20.8" width="2.2" height="3.9" fill={skinCol} />
              <rect x="22.8" y="18" width="2.2" height="2.8" fill={shirtCol} rx="0.5" />
              <rect x="22.8" y="20" width="2.2" height="0.8" fill="#ffffff" />
              <rect x="22.8" y="20.8" width="2.2" height="3.9" fill={skinCol} />
            </>
          )}

          {outfitType === 'jacket' && (
            <>
              {/* Open Cyber/Biker Jacket over inner tee */}
              <rect x="13" y="18" width="6" height="7" fill="#ffffff" />
              <rect x="9" y="18" width="4.5" height="7" fill={shirtDark} rx="0.5" />
              <rect x="18.5" y="18" width="4.5" height="7" fill={shirtDark} rx="0.5" />
              {/* Neon trim collar lapels */}
              <line x1="9" y1="18" x2="13" y2="22" stroke={shirtCol} strokeWidth="1" />
              <line x1="23" y1="18" x2="19" y2="22" stroke={shirtCol} strokeWidth="1" />
              {/* Jacket sleeves */}
              <rect x="7" y="18" width="2.2" height="5.5" fill={shirtDark} rx="0.5" />
              <rect x="7" y="23.5" width="2.2" height="1.2" fill={skinCol} />
              <rect x="22.8" y="18" width="2.2" height="5.5" fill={shirtDark} rx="0.5" />
              <rect x="22.8" y="23.5" width="2.2" height="1.2" fill={skinCol} />
            </>
          )}

          {/* ─── BOTTOMS / PANTS ─── */}
          {pantsType === 'jeans' && (
            <>
              {/* Indigo Denim Jeans with seam fade */}
              <rect x="9.5" y="25" width="13" height="4" fill={pantsCol} />
              {/* Knee wash fade */}
              <rect x="10.5" y="26.5" width="3" height="1.5" fill={denimFade} opacity="0.65" />
              <rect x="18.5" y="26.5" width="3" height="1.5" fill={denimFade} opacity="0.65" />
              {/* Gold stitch rivets & center fly */}
              <rect x="10" y="25.2" width="1" height="0.8" fill={seamStitch} />
              <rect x="21" y="25.2" width="1" height="0.8" fill={seamStitch} />
              <rect x="15.5" y="25" width="1" height="4" fill="#000" opacity="0.35" />
            </>
          )}

          {pantsType === 'cargo' && (
            <>
              {/* Cargo pants with flap pockets */}
              <rect x="9.5" y="25" width="13" height="4" fill={pantsCol} />
              {/* Outer cargo pockets */}
              <rect x="8.5" y="25.5" width="1.5" height="2.5" fill={pantsCol} stroke="#111" strokeWidth="0.5" />
              <rect x="22" y="25.5" width="1.5" height="2.5" fill={pantsCol} stroke="#111" strokeWidth="0.5" />
              <rect x="15.5" y="25" width="1" height="4" fill="#000" opacity="0.3" />
            </>
          )}

          {pantsType === 'trackpants' && (
            <>
              {/* Athletic joggers with racing stripes */}
              <rect x="9.5" y="25" width="13" height="4" fill={pantsCol} />
              {/* White side stripes */}
              <rect x="9.5" y="25" width="1" height="4" fill="#ffffff" />
              <rect x="21.5" y="25" width="1" height="4" fill="#ffffff" />
              <rect x="15.5" y="25" width="1" height="4" fill="#000" opacity="0.3" />
            </>
          )}

          {pantsType === 'shorts' && (
            <>
              {/* Casual shorts */}
              <rect x="9.5" y="25" width="13" height="2.2" fill={pantsCol} />
              <rect x="15.5" y="25" width="1" height="2.2" fill="#000" opacity="0.3" />
              {/* Exposed bare knees/calves */}
              <rect x="9.5" y="27.2" width="4.5" height="1.8" fill={skinCol} />
              <rect x="18" y="27.2" width="4.5" height="1.8" fill={skinCol} />
            </>
          )}

          {/* Shoes (Walk frames lift) */}
          <rect x="9.5" y={leftLegUp ? 28.2 : 29} width="3.5" height="2" fill={shoeCol} rx="0.5" />
          <rect x="19" y={rightLegUp ? 28.2 : 29} width="3.5" height="2" fill={shoeCol} rx="0.5" />
        </>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          3. DIRECTION UP (FACING REAR)
         ═════════════════════════════════════════════════════════════════════ */}
      {direction === 'up' && (
        <>
          {/* Hair rear view */}
          {hairStyle === 'long' && (
            <rect x="8" y="6" width="16" height="18" fill={hairCol} rx="1" />
          )}

          {hairStyle === 'afro' && (
            <rect x="6" y="4" width="20" height="14" fill={hairCol} rx="3" />
          )}

          {hairStyle === 'cap' && (
            <>
              <rect x="9" y="5" width="14" height="10" fill={hairCol} rx="2" />
              {/* Cap adjustment snapback strap */}
              <rect x="14" y="12" width="4" height="1.5" fill="#111" />
              <rect x="14" y="15" width="4" height="2.5" fill={skinCol} />
            </>
          )}

          {(hairStyle === 'spiky' || hairStyle === 'messy') && (
            <>
              <rect x="9" y="5" width="14" height="12" fill={hairCol} rx="1" />
              <rect x="14" y="17" width="4" height="1.2" fill={skinCol} />
            </>
          )}

          {/* Upper Body Rear */}
          {outfitType === 'jacket' ? (
            <>
              <rect x="9" y="18" width="14" height="7" fill={shirtDark} rx="0.5" />
              <rect x="15.5" y="18" width="1" height="7" fill={shirtCol} opacity="0.6" />
              <rect x="7" y="18" width="2.2" height="5.5" fill={shirtDark} rx="0.5" />
              <rect x="22.8" y="18" width="2.2" height="5.5" fill={shirtDark} rx="0.5" />
            </>
          ) : (
            <>
              <rect x="9" y="18" width="14" height="7" fill={shirtCol} rx="0.5" />
              {outfitType === 'hoodie' && (
                /* Folded rear hood */
                <rect x="11.5" y="18" width="9" height="3" fill={shirtCol} stroke="rgba(0,0,0,0.3)" strokeWidth="0.6" rx="1" />
              )}
              {outfitType === 'jersey' && (
                /* Rear jersey player number 7 */
                <rect x="14" y="20" width="4" height="4" fill="#ffffff" />
              )}
              <rect x="7" y="18" width="2.2" height="5.5" fill={shirtCol} rx="0.5" />
              <rect x="22.8" y="18" width="2.2" height="5.5" fill={shirtCol} rx="0.5" />
            </>
          )}

          {/* Pants Rear */}
          {pantsType === 'shorts' ? (
            <>
              <rect x="9.5" y="25" width="13" height="2.2" fill={pantsCol} />
              <rect x="9.5" y="27.2" width="4.5" height="1.8" fill={skinCol} />
              <rect x="18" y="27.2" width="4.5" height="1.8" fill={skinCol} />
            </>
          ) : (
            <>
              <rect x="9.5" y="25" width="13" height="4" fill={pantsCol} />
              {pantsType === 'trackpants' && (
                <>
                  <rect x="9.5" y="25" width="1" height="4" fill="#ffffff" />
                  <rect x="21.5" y="25" width="1" height="4" fill="#ffffff" />
                </>
              )}
              {/* Back pockets */}
              <rect x="10.5" y="25.8" width="3" height="2" fill="#000" opacity="0.18" />
              <rect x="18.5" y="25.8" width="3" height="2" fill="#000" opacity="0.18" />
              <rect x="15.5" y="25" width="1" height="4" fill="#000" opacity="0.25" />
            </>
          )}

          {/* Shoes */}
          <rect x="9.5" y={leftLegUp ? 28.2 : 29} width="3.5" height="2" fill={shoeCol} rx="0.5" />
          <rect x="19" y={rightLegUp ? 28.2 : 29} width="3.5" height="2" fill={shoeCol} rx="0.5" />
        </>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          4. DIRECTION LEFT (PROFILE FACING LEFT)
         ═════════════════════════════════════════════════════════════════════ */}
      {direction === 'left' && (
        <>
          {hairStyle === 'long' && (
            <rect x="17" y="9" width="4.5" height="13" fill={hairCol} rx="1" />
          )}

          {/* Head & Face profile */}
          <rect x="11.5" y="10" width="7.5" height="7" fill={skinCol} />

          {/* Hair left locks */}
          {hairStyle === 'cap' ? (
            <>
              <rect x="11" y="6" width="9" height="5" fill={hairCol} rx="2" />
              <rect x="9" y="10" width="5" height="1.5" fill="#111" />
            </>
          ) : hairStyle === 'afro' ? (
            <rect x="10" y="5" width="11" height="11" fill={hairCol} rx="3" />
          ) : (
            <>
              <rect x="13.5" y="6" width="7.5" height="4.5" fill={hairCol} />
              <rect x="17" y="10" width="3.5" height="3" fill={hairCol} />
            </>
          )}

          {/* Eye side profile */}
          {faceStyle === 'visor' ? (
            <rect x="10.5" y="11" width="4" height="2.5" fill="#00ffff" stroke="#111" strokeWidth="0.5" />
          ) : faceStyle === 'glasses' ? (
            <rect x="11" y="11" width="3" height="2.5" fill="none" stroke="#111" strokeWidth="0.8" />
          ) : (
            <rect x="12.5" y="12" width="1.2" height="1.8" fill="#111" />
          )}

          {/* Torso profile */}
          <rect x="12" y="18" width="8.5" height="7" fill={outfitType === 'jacket' ? shirtDark : shirtCol} rx="0.5" />

          {/* Arm swinging */}
          <rect 
            x="14" y="18" width="2.4" height="5.5" 
            fill={outfitType === 'jacket' ? shirtDark : shirtCol} 
            rx="0.5" 
            transform={isWalking ? (strideA ? "rotate(18, 15, 18)" : "rotate(-18, 15, 18)") : undefined}
          />
          <rect x="14" y="23.5" width="2.4" height="1" fill={skinCol} />

          {/* Pants profile */}
          {pantsType === 'shorts' ? (
            <>
              <rect x="12.5" y="25" width="7" height="2.2" fill={pantsCol} />
              <rect x="13" y="27.2" width="6" height="1.8" fill={skinCol} />
            </>
          ) : (
            <rect x="12.5" y="25" width="7" height="4" fill={pantsCol} />
          )}

          {/* Shoes walking stride */}
          {isWalking ? (
            strideA ? (
              <>
                <rect x="10" y="28.5" width="3.5" height="1.8" fill={shoeCol} rx="0.5" />
                <rect x="17.5" y="29.2" width="3.5" height="1.8" fill={shoeCol} rx="0.5" />
              </>
            ) : (
              <>
                <rect x="11.5" y="29.2" width="3.5" height="1.8" fill={shoeCol} rx="0.5" />
                <rect x="16" y="28.5" width="3.5" height="1.8" fill={shoeCol} rx="0.5" />
              </>
            )
          ) : (
            <rect x="13.5" y="29" width="5.5" height="1.8" fill={shoeCol} rx="0.5" />
          )}
        </>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          5. DIRECTION RIGHT (PROFILE FACING RIGHT)
         ═════════════════════════════════════════════════════════════════════ */}
      {direction === 'right' && (
        <>
          {hairStyle === 'long' && (
            <rect x="10.5" y="9" width="4.5" height="13" fill={hairCol} rx="1" />
          )}

          {/* Head & Face profile */}
          <rect x="13" y="10" width="7.5" height="7" fill={skinCol} />

          {/* Hair right locks */}
          {hairStyle === 'cap' ? (
            <>
              <rect x="12" y="6" width="9" height="5" fill={hairCol} rx="2" />
              <rect x="18" y="10" width="5" height="1.5" fill="#111" />
            </>
          ) : hairStyle === 'afro' ? (
            <rect x="11" y="5" width="11" height="11" fill={hairCol} rx="3" />
          ) : (
            <>
              <rect x="11" y="6" width="7.5" height="4.5" fill={hairCol} />
              <rect x="11.5" y="10" width="3.5" height="3" fill={hairCol} />
            </>
          )}

          {/* Eye side profile */}
          {faceStyle === 'visor' ? (
            <rect x="17.5" y="11" width="4" height="2.5" fill="#00ffff" stroke="#111" strokeWidth="0.5" />
          ) : faceStyle === 'glasses' ? (
            <rect x="18" y="11" width="3" height="2.5" fill="none" stroke="#111" strokeWidth="0.8" />
          ) : (
            <rect x="18.3" y="12" width="1.2" height="1.8" fill="#111" />
          )}

          {/* Torso profile */}
          <rect x="11.5" y="18" width="8.5" height="7" fill={outfitType === 'jacket' ? shirtDark : shirtCol} rx="0.5" />

          {/* Arm swinging */}
          <rect 
            x="15.8" y="18" width="2.4" height="5.5" 
            fill={outfitType === 'jacket' ? shirtDark : shirtCol} 
            rx="0.5" 
            transform={isWalking ? (strideA ? "rotate(-18, 17, 18)" : "rotate(18, 17, 18)") : undefined}
          />
          <rect x="15.8" y="23.5" width="2.4" height="1" fill={skinCol} />

          {/* Pants profile */}
          {pantsType === 'shorts' ? (
            <>
              <rect x="12.5" y="25" width="7" height="2.2" fill={pantsCol} />
              <rect x="13" y="27.2" width="6" height="1.8" fill={skinCol} />
            </>
          ) : (
            <rect x="12.5" y="25" width="7" height="4" fill={pantsCol} />
          )}

          {/* Shoes walking stride */}
          {isWalking ? (
            strideA ? (
              <>
                <rect x="11" y="29.2" width="3.5" height="1.8" fill={shoeCol} rx="0.5" />
                <rect x="18.5" y="28.5" width="3.5" height="1.8" fill={shoeCol} rx="0.5" />
              </>
            ) : (
              <>
                <rect x="12.5" y="28.5" width="3.5" height="1.8" fill={shoeCol} rx="0.5" />
                <rect x="17" y="29.2" width="3.5" height="1.8" fill={shoeCol} rx="0.5" />
              </>
            )
          ) : (
            <rect x="13" y="29" width="5.5" height="1.8" fill={shoeCol} rx="0.5" />
          )}
        </>
      )}
    </svg>
  );
}
