import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HobbyCard({ hobby }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <motion.div 
        layoutId={`card-${hobby.id}`}
        onClick={() => setIsExpanded(true)}
        className="rpg-box rpg-interactable"
        data-dialogue={`Ah, the ${hobby.title}. ${hobby.desc.split('.')[0]}.`}
        style={{
          width: '100%',
          cursor: 'pointer',
          padding: '20px'
        }}
        whileHover={{ scale: 1.05, zIndex: 5 }}
      >
        <motion.h3 layoutId={`title-${hobby.id}`} className="pixel-header" style={{ textAlign: 'center', margin: '0 0 15px 0', fontSize: '1.2rem' }}>
          {hobby.title}
        </motion.h3>
        <motion.img 
          layoutId={`img-${hobby.id}`}
          src={hobby.mainImg} 
          alt={hobby.title} 
          style={{ width: '100%', height: '200px', objectFit: 'cover', border: '4px solid var(--rpg-text)', imageRendering: 'pixelated' }} 
        />
        <p className="pixel-text" style={{ textAlign: 'center', margin: '15px 0 0 0', fontSize: '1.4rem' }}>[ Inspect Item ]</p>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.85)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={() => setIsExpanded(false)}
          >
            <motion.div 
              layoutId={`card-${hobby.id}`}
              onClick={(e) => e.stopPropagation()}
              className="rpg-box"
              style={{
                width: '100%',
                maxWidth: '800px',
                maxHeight: '90vh',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}
            >
              <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                <motion.img 
                  layoutId={`img-${hobby.id}`}
                  src={hobby.mainImg} 
                  alt={hobby.title} 
                  style={{ width: '280px', height: '280px', objectFit: 'cover', border: '4px solid var(--rpg-text)' }} 
                />
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <motion.h2 layoutId={`title-${hobby.id}`} className="pixel-header" style={{ fontSize: '1.6rem', margin: '0 0 15px 0', color: 'var(--rpg-highlight)' }}>
                    {hobby.title}
                  </motion.h2>
                  <p className="pixel-text" style={{ fontSize: '1.6rem' }}>{hobby.desc}</p>
                </div>
              </div>

              {hobby.gallery && hobby.gallery.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <h3 className="pixel-header" style={{ fontSize: '1rem', marginBottom: '15px' }}>Item Evidence:</h3>
                  <div className="gallery-scroll" style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '15px', scrollSnapType: 'x mandatory' }}>
                    {hobby.gallery.map((img, idx) => (
                      <img key={idx} src={img} alt={`Gallery ${idx}`} style={{ width: '250px', height: '200px', objectFit: 'cover', border: '4px solid var(--rpg-text)', scrollSnapAlign: 'start', flexShrink: 0 }} />
                    ))}
                  </div>
                </motion.div>
              )}
              
              <button 
                onClick={() => setIsExpanded(false)}
                className="pixel-header"
                style={{ alignSelf: 'flex-end', padding: '15px 25px', background: 'var(--rpg-bg)', color: 'var(--rpg-text)', border: '4px solid var(--rpg-text)', cursor: 'pointer', fontSize: '1rem', marginTop: '10px' }}
              >
                CLOSE [X]
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
