import React, { useState } from 'react';
import { useGameState } from './GameStateContext';

export default function RPGStats() {
  const {
    playerName,
    inspectedItems,
    konamiUnlocked,
    soccerScore,
    bikingBestLap,
    triviaStreak,
    equippedBadges
  } = useGameState();

  const [activeTab, setActiveTab] = useState('log'); // 'log' | 'records' | 'badges'

  // The 8 key interactive room zones matching the reference design
  const LANDMARKS = [
    { id: 'profile', name: 'Command Deck (Raghav)', icon: '💻', zone: 'Center' },
    { id: 'bouldering', name: 'Bouldering Climbing Wall', icon: '🧗', zone: 'Left Wall' },
    { id: 'kitchen', name: 'Cyber Bistro Kitchen', icon: '🍳', zone: 'Top' },
    { id: 'anime', name: 'Manga & Arcade Lounge', icon: '📚', zone: 'Top-Right' },
    { id: 'trekking', name: 'Trek & Travel Basecamp', icon: '⛺', zone: 'Bottom-Left' },
    { id: 'bike', name: 'Garage & Motorcycle', icon: '🏍️', zone: 'Bottom-Center' },
    { id: 'tacticboard', name: 'Soccer Pitch Stadium', icon: '⚽', zone: 'Bottom-Right' },
    { id: 'bulletin', name: 'Hall of Fame Guestbook', icon: '🖼️', zone: 'Top-Center' },
  ];

  const discoveredCount = LANDMARKS.filter(l => inspectedItems.includes(l.id)).length;
  const progressPercent = Math.round((discoveredCount / LANDMARKS.length) * 100);

  return (
    <div 
      className="rpg-box" 
      style={{ 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderColor: '#a894c2',
        background: 'rgba(22, 18, 32, 0.94)'
      }}
    >
      {/* Explorer ID Header Card */}
      <div style={{ marginBottom: '16px', borderBottom: '2px dashed #4b415e', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="pixel-header" style={{ fontSize: '0.9rem', color: '#ffd166', margin: 0 }}>
            🧭 EXPLORER LOG
          </h3>
          <span className="pixel-header" style={{ fontSize: '0.65rem', color: '#9de2c8' }}>
            ONLINE
          </span>
        </div>
        <p className="pixel-text" style={{ margin: '8px 0 2px 0', fontSize: '1.45rem', color: '#fff' }}>
          <strong>Explorer:</strong> {playerName || 'Wanderer'}
        </p>
        <p className="pixel-text" style={{ margin: 0, fontSize: '1.15rem', color: '#a094b8' }}>
          World Discovery: <strong>{discoveredCount}/{LANDMARKS.length} Zones</strong> ({progressPercent}%)
        </p>
        <div style={{ width: '100%', height: '8px', background: '#0a0812', borderRadius: '999px', marginTop: '6px', overflow: 'hidden', border: '1px solid #4b415e' }}>
          <div 
            style={{ 
              width: `${progressPercent}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, #9de2c8, #ffd166)',
              borderRadius: '999px',
              transition: 'width 0.5s ease'
            }} 
          />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '14px', borderBottom: '2px solid #4b415e' }}>
        {[
          { id: 'log', label: 'Landmarks' },
          { id: 'records', label: 'Records' },
          { id: 'badges', label: 'Badges' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="pixel-header"
            style={{
              flex: 1,
              minWidth: 0, // let the pixel-font labels shrink on phones
              padding: '6px 2px',
              fontSize: 'clamp(0.45rem, 2vw, 0.65rem)',
              background: activeTab === tab.id ? '#9de2c8' : 'transparent',
              color: activeTab === tab.id ? '#152520' : '#c8bedc',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '4px 4px 0 0',
              fontWeight: 'bold',
              transition: 'all 0.1s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: [LOG] Landmarks Checklist */}
      {activeTab === 'log' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px', overflowY: 'auto' }}>
          {LANDMARKS.map(l => {
            const isDone = inspectedItems.includes(l.id);
            return (
              <div 
                key={l.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '6px 10px',
                  background: isDone ? 'rgba(157, 226, 200, 0.08)' : 'rgba(0, 0, 0, 0.3)',
                  border: isDone ? '1px solid #9de2c8' : '1px dashed #3a3248',
                  borderRadius: '6px'
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>{l.icon}</span>
                <div style={{ flex: 1 }}>
                  <div className="pixel-text" style={{ fontSize: '1.25rem', color: isDone ? '#9de2c8' : '#e0d8ee', lineHeight: 1.2 }}>
                    {l.name}
                  </div>
                  <div className="pixel-header" style={{ fontSize: '0.5rem', color: '#82759c' }}>
                    ZONE: {l.zone}
                  </div>
                </div>
                <span className="pixel-header" style={{ fontSize: '0.65rem', color: isDone ? '#ffd166' : '#655a7a' }}>
                  {isDone ? '✓ FOUND' : '???'}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: [RECORDS] Mini-Game High Scores */}
      {activeTab === 'records' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ background: '#0e0b17', border: '1px solid #3d3450', borderRadius: '6px', padding: '10px' }}>
            <div className="pixel-header" style={{ fontSize: '0.65rem', color: '#9de2c8', marginBottom: '4px' }}>
              ⚽ SOCCER 1v1 MATCH
            </div>
            <div className="pixel-text" style={{ fontSize: '1.35rem', color: '#fff' }}>
              Goals Scored: <strong style={{ color: '#ffd166' }}>{soccerScore}</strong>
            </div>
          </div>

          <div style={{ background: '#0e0b17', border: '1px solid #3d3450', borderRadius: '6px', padding: '10px' }}>
            <div className="pixel-header" style={{ fontSize: '0.65rem', color: '#9de2c8', marginBottom: '4px' }}>
              🚲 BIKE TIME TRIAL
            </div>
            <div className="pixel-text" style={{ fontSize: '1.35rem', color: '#fff' }}>
              Best Lap: <strong style={{ color: '#ffd166' }}>{bikingBestLap > 0 ? `${bikingBestLap.toFixed(1)}s` : 'No record yet'}</strong>
            </div>
          </div>

          <div style={{ background: '#0e0b17', border: '1px solid #3d3450', borderRadius: '6px', padding: '10px' }}>
            <div className="pixel-header" style={{ fontSize: '0.65rem', color: '#9de2c8', marginBottom: '4px' }}>
              🕹️ MANGA ARCADE TRIVIA
            </div>
            <div className="pixel-text" style={{ fontSize: '1.35rem', color: '#fff' }}>
              Highest Lore Streak: <strong style={{ color: '#ffd166' }}>{triviaStreak}</strong>
            </div>
          </div>

          <div style={{ background: '#0e0b17', border: '1px solid #3d3450', borderRadius: '6px', padding: '10px' }}>
            <div className="pixel-header" style={{ fontSize: '0.65rem', color: '#9de2c8', marginBottom: '4px' }}>
              🤫 SECRET CHEAT CODE
            </div>
            <div className="pixel-text" style={{ fontSize: '1.25rem', color: konamiUnlocked ? '#ffd166' : '#776c8e' }}>
              {konamiUnlocked ? '✓ Master Code Unlocked!' : 'Locked: type code in overworld'}
            </div>
          </div>
        </div>
      )}

      {/* Tab: [BADGES] Achievements */}
      {activeTab === 'badges' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {[
            { id: 'V5 Climber', icon: '🧗', desc: 'Climb Wall' },
            { id: 'Manga Lore Master', icon: '🕹️', desc: 'Trivia Champ' },
            { id: 'Speed Racer', icon: '🚲', desc: 'Bike Lap' },
            { id: 'Top Scorer', icon: '⚽', desc: 'Score Goal' },
            { id: 'Trekker', icon: '⛺', desc: 'Read Diary' },
            { id: 'Chef de Cuisine', icon: '🍳', desc: 'Cook Food' },
            { id: 'Guestbook Signer', icon: '🖼️', desc: 'Leave Note' },
            { id: 'Secret Master', icon: '🤫', desc: 'Cheat Code' }
          ].map(b => {
            const unlocked = equippedBadges.includes(b.id) || (b.id === 'Secret Master' && konamiUnlocked);
            return (
              <div
                key={b.id}
                title={b.id}
                style={{
                  background: unlocked ? 'rgba(255, 209, 102, 0.12)' : 'rgba(0,0,0,0.3)',
                  border: unlocked ? '2px solid #ffd166' : '1px dashed #3a3248',
                  borderRadius: '6px',
                  padding: '8px 4px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  opacity: unlocked ? 1 : 0.4
                }}
              >
                <span style={{ fontSize: '1.4rem' }}>{b.icon}</span>
                <span className="pixel-header" style={{ fontSize: '0.45rem', textAlign: 'center', color: unlocked ? '#ffd166' : '#776c8e', lineHeight: 1.1 }}>
                  {b.desc}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
