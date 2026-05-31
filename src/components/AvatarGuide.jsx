import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function AvatarGuide() {
  const { scrollYProgress } = useScroll();
  // Move down the screen as they scroll
  const yPos = useTransform(scrollYProgress, [0, 1], [0, 600]); 
  
  const [speech, setSpeech] = useState("Welcome traveler! Scroll down to explore.");

  useEffect(() => {
    return scrollYProgress.onChange((latest) => {
      if (latest < 0.2) setSpeech("Welcome traveler! Scroll down to explore my stats.");
      else if (latest < 0.5) setSpeech("Ah, my inventory... packed with hobbies.");
      else if (latest < 0.8) setSpeech("Feel free to inspect any item closer. Don't be shy!");
      else setSpeech("Quest complete! Slide into my DMs for the next level.");
    });
  }, [scrollYProgress]);

  return (
    <motion.div 
      style={{ 
        position: 'fixed', 
        right: '5%', 
        top: '15%',
        y: yPos,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pointerEvents: 'none' /* So it doesn't block clicks */
      }}
    >
      <div className="rpg-box" style={{ 
        marginBottom: '20px', 
        width: '200px', 
        fontSize: '1.2rem',
        position: 'relative',
        padding: '15px'
      }}>
        <p style={{ margin: 0, lineHeight: '1.4' }}>{speech}</p>
        <div style={{
          position: 'absolute',
          bottom: '-14px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '0',
          height: '0',
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderTop: '10px solid var(--rpg-text)'
        }}></div>
      </div>
      <img 
        src="/avatar.png" 
        alt="Avatar Guide" 
        className="animate-bob"
        style={{ width: '120px', height: '120px', objectFit: 'contain', imageRendering: 'pixelated' }} 
      />
    </motion.div>
  );
}
