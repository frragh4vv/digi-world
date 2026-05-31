import React, { useState, useEffect } from 'react';
import { useGameState } from './GameStateContext';

export default function RPGStats() {
  const {
    playerName,
    playerClass,
    playerStats,
    energyLevel,
    inspectedItems,
    konamiUnlocked,
    soccerScore,
    bikingBestLap,
    triviaStreak,
    equippedBadges,
    handleInspect
  } = useGameState();

  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'quests' | 'equips'
  const [displayedEnergy, setDisplayedEnergy] = useState(0);

  useEffect(() => {
    // Smooth progress bar load
    setDisplayedEnergy(energyLevel);
  }, [energyLevel]);

  // Calculate dynamic character class based on highest allocated attribute!
  const getDynamicClass = () => {
    const { stamina, curiosity, reflexes, intellect } = playerStats;
    const maxVal = Math.max(stamina, curiosity, reflexes, intellect);
    
    if (stamina === maxVal) return "Endurance Knight";
    if (curiosity === maxVal) return "Curious Wanderer";
    if (reflexes === maxVal) return "Reflex Dribbler";
    return "Caffeine Alchemist"; // default if Intellect is highest
  };

  const currentClassTitle = getDynamicClass();

  // Side Quests log mapping
  const quests = [
    { name: 'Climb Bouldering Gym Wall', done: inspectedItems.includes('bouldering'), icon: '🧗' },
    { name: 'Absorb Manga Spell Tome', done: inspectedItems.includes('anime'), icon: '📚' },
    { name: 'Pack Travel Suitcase', done: inspectedItems.includes('trekking'), icon: '🧳' },
    { name: 'Inspect Soccer Ball', done: inspectedItems.includes('football'), icon: '⚽' },
    { name: 'Meet Raghav NPC (Developer)', done: inspectedItems.includes('profile'), icon: '🖥️' },
    { name: `Score Soccer Goals: [${soccerScore} scored]`, done: soccerScore > 0, icon: '🥅' },
    { name: `Bicycle Biking Lap: [${bikingBestLap > 0 ? `${bikingBestLap.toFixed(1)}s record` : 'No record'}]`, done: bikingBestLap > 0, icon: '🚲' },
    { name: `Manga Arcade Streak: [Streak: ${triviaStreak}]`, done: equippedBadges.includes("Manga Lore Master"), icon: '🕹️' },
    { name: 'Secret: Master Code wwssadadba', done: konamiUnlocked, icon: '🤫' }
  ];

  // Main quest calculations (inspect all 5 landmarks)
  const mainQuestCount = quests.filter((_, idx) => idx < 5 && quests[idx].done).length;
  const mainQuestPercent = Math.round((mainQuestCount / 5) * 100);

  return (
    <div className="rpg-box" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column' }}>
      
      {/* 8-Bit Glowing Tabs */}
      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', borderBottom: '4px solid var(--rpg-text)' }}>
        {['stats', 'quests', 'equips'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="pixel-header"
            style={{
              flex: 1,
              padding: '8px 4px',
              fontSize: '0.75rem',
              background: activeTab === tab ? 'var(--rpg-text)' : 'transparent',
              color: activeTab === tab ? '#000' : 'var(--rpg-text)',
              border: 'none',
              cursor: 'pointer',
              textTransform: 'uppercase',
              outline: 'none',
              transform: activeTab === tab ? 'translateY(4px)' : 'none',
              transition: 'all 0.1s ease'
            }}
          >
            [{tab}]
          </button>
        ))}
      </div>

      {/* Tab Contents: [STATS] */}
      {activeTab === 'stats' && (
        <div>
          {/* Character Card Header */}
          <div style={{ marginBottom: '20px', borderBottom: '2px dashed #444', paddingBottom: '10px' }}>
            <p style={{ margin: '8px 0', fontSize: '1.6rem', textShadow: '0 0 5px rgba(0,255,102,0.2)' }}>
              <strong>Hero:</strong> {playerName}
            </p>
            <p style={{ margin: '8px 0', fontSize: '1.6rem' }}>
              <strong>Class:</strong> {currentClassTitle}
            </p>
            <p style={{ margin: '8px 0', fontSize: '1.2rem', color: '#888' }}>
              Level: Age 20+ • Archetype: overworld challenger
            </p>
          </div>

          {/* Energy Bar */}
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontSize: '1.4rem' }}>Energy level (Stamina)</span>
              <span style={{ fontSize: '1.4rem' }}>{energyLevel}/100</span>
            </div>
            <div style={{ width: '100%', height: '20px', border: '3px solid var(--rpg-text)', backgroundColor: '#000', position: 'relative' }}>
              <div 
                style={{ 
                  width: `${displayedEnergy}%`, 
                  height: '100%', 
                  backgroundColor: energyLevel < 30 ? 'var(--hp-bar)' : 'var(--exp-bar)', 
                  transition: 'width 0.3s ease' 
                }} 
              />
            </div>
          </div>

          {/* Attributes Stats Allocations */}
          <div style={{ border: '2px dashed var(--rpg-text)', padding: '10px', background: '#0a0a0f', fontSize: '1.3rem', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <h3 className="pixel-header" style={{ fontSize: '0.8rem', margin: '0 0 5px 0', color: 'var(--rpg-highlight)' }}>Allocated Attributes:</h3>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span>💪 Stamina:</span> <span>{playerStats.stamina} points</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#222' }}>
                <div style={{ width: `${(playerStats.stamina / 15) * 100}%`, height: '100%', background: '#ff3d00' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span>🔍 Curiosity:</span> <span>{playerStats.curiosity} points</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#222' }}>
                <div style={{ width: `${(playerStats.curiosity / 15) * 100}%`, height: '100%', background: '#8a2be2' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span>⚡ Reflexes:</span> <span>{playerStats.reflexes} points</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#222' }}>
                <div style={{ width: `${(playerStats.reflexes / 15) * 100}%`, height: '100%', background: '#00ff66' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span>🧠 Intellect:</span> <span>{playerStats.intellect} points</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#222' }}>
                <div style={{ width: `${(playerStats.intellect / 15) * 100}%`, height: '100%', background: '#00ffff' }} />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Tab Contents: [QUESTS] */}
      {activeTab === 'quests' && (
        <div>
          {/* Main Quest */}
          <div style={{ marginBottom: '15px', padding: '10px', border: '2px solid var(--rpg-highlight)', background: '#0a0a0f' }}>
            <h3 className="pixel-header" style={{ fontSize: '0.8rem', margin: '0 0 5px 0', color: 'var(--rpg-highlight)' }}>🏆 Main Quest:</h3>
            <p style={{ margin: '3px 0', fontSize: '1.3rem' }}>Explore Raghav's Bedroom and inspect 5 landmarks.</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '1.2rem' }}>
              <span>Progress: {mainQuestPercent}%</span>
              <span>[{mainQuestCount}/5 landmarks]</span>
            </div>
            <div style={{ width: '100%', height: '10px', background: '#000', border: '2px solid var(--rpg-highlight)', marginTop: '4px' }}>
              <div style={{ width: `${mainQuestPercent}%`, height: '100%', background: 'var(--rpg-highlight)' }} />
            </div>
          </div>

          {/* Side Quests */}
          <div>
            <h3 className="pixel-header" style={{ fontSize: '0.8rem', margin: '0 0 10px 0', color: 'var(--rpg-text)' }}>⚔️ Active Side Quests:</h3>
            <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {quests.map((q, idx) => (
                <li 
                  key={idx} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    fontSize: '1.3rem',
                    color: q.done ? '#666' : 'var(--rpg-text)',
                    textDecoration: q.done ? 'line-through' : 'none'
                  }}
                >
                  <span>{q.icon}</span>
                  <span style={{ flex: 1 }}>{q.name}</span>
                  <span className="pixel-header" style={{ fontSize: '0.7rem', color: q.done ? 'var(--rpg-text)' : 'var(--rpg-accent)' }}>
                    {q.done ? '[DONE]' : '[TODO]'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab Contents: [EQUIPS] */}
      {activeTab === 'equips' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* Portfolio Equip Slots */}
          <div>
            <h3 className="pixel-header" style={{ fontSize: '0.8rem', color: 'var(--rpg-highlight)', marginBottom: '8px' }}>
              🎒 Equipped Loot:
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {['profile', 'bouldering', 'anime', 'trekking', 'football'].map(id => {
                const isEquipped = inspectedItems.includes(id);
                const symbolMap = { profile: '🖥️', bouldering: '🧗', anime: '📚', trekking: '🧳', football: '⚽' };
                return (
                  <div 
                    key={id}
                    style={{
                      border: isEquipped ? '2px solid var(--rpg-text)' : '2px dashed #333',
                      aspectRatio: '1',
                      background: isEquipped ? '#0d1a0d' : '#050508',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.4rem'
                    }}
                  >
                    <span style={{ opacity: isEquipped ? 1 : 0.2 }}>{symbolMap[id]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Achievement Badges */}
          <div>
            <h3 className="pixel-header" style={{ fontSize: '0.8rem', color: 'var(--rpg-highlight)', marginBottom: '8px' }}>
              🏅 Achievement Badges:
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {equippedBadges.length === 0 ? (
                <p className="pixel-text" style={{ fontSize: '1.3rem', color: '#666', fontStyle: 'italic', margin: 0 }}>
                  No badges earned yet. Conquer side-quests to unlock retro trophies!
                </p>
              ) : (
                equippedBadges.map((badge, idx) => (
                  <div 
                    key={idx}
                    style={{
                      border: '2px solid var(--rpg-highlight)',
                      background: '#09090f',
                      padding: '5px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '1.3rem',
                      color: 'var(--rpg-highlight)'
                    }}
                  >
                    <span>🎖️</span>
                    <span className="pixel-header" style={{ fontSize: '0.7rem' }}>{badge}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
