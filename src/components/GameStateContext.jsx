import React, { createContext, useContext, useState, useEffect } from 'react';

const GameStateContext = createContext();

const DEFAULT_GUESTBOOK = [
  { 
    name: "Cozy Explorer", 
    class: "Pixel Archaeologist", 
    stats: { stamina: 7, curiosity: 8, reflexes: 2, intellect: 3 }, 
    colors: { hat: '#43a047', shirt: '#ff8c00', pants: '#8b4513', skin: '#ffb6c1' }, 
    review: "The secret Konami code egg was awesome! Love the retro graphics!" 
  },
  { 
    name: "Code Buddy", 
    class: "Caffeine Knight", 
    stats: { stamina: 9, curiosity: 3, reflexes: 6, intellect: 2 }, 
    colors: { hat: '#ffd700', shirt: '#eeeeee', pants: '#777777', skin: '#ffb6c1' }, 
    review: "Slick Physics Football mini-game. That Goalie NPC blocked three of my shots!" 
  }
];

export function GameStateProvider({ children }) {
  const [playerName, setPlayerName] = useState("Heyy Visitor");
  const [playerClass, setPlayerClass] = useState("Cozy Explorer");
  const [playerStats, setPlayerStats] = useState({ stamina: 5, curiosity: 5, reflexes: 5, intellect: 5 });
  const [playerColors, setPlayerColors] = useState({ hat: '#8a2be2', shirt: '#1e88e5', pants: '#ffd700', skin: '#ffb6c1' });
  
  const [energyLevel, setEnergyLevel] = useState(100);
  const [inspectedItems, setInspectedItems] = useState([]);
  const [konamiUnlocked, setKonamiUnlocked] = useState(false);
  
  // Game metrics scoreboard
  const [soccerScore, setSoccerScore] = useState(0);
  const [bikingBestLap, setBikingBestLap] = useState(0.0);
  const [triviaStreak, setTriviaStreak] = useState(0);
  const [equippedBadges, setEquippedBadges] = useState([]);

  // Database Guestbook logs
  const [guestbookEntries, setGuestbookEntries] = useState([]);

  // UI state overlays & active speed boosts
  const [activeItemId, setActiveItemId] = useState(null);
  const [caffeineTimer, setCaffeineTimer] = useState(0);

  // Load guestbook logs on start
  useEffect(() => {
    const saved = localStorage.getItem('raghav_rpg_guestbook');
    if (saved) {
      setGuestbookEntries(JSON.parse(saved));
    } else {
      setGuestbookEntries(DEFAULT_GUESTBOOK);
      localStorage.setItem('raghav_rpg_guestbook', JSON.stringify(DEFAULT_GUESTBOOK));
    }
  }, []);

  // Countdown timer for Caffeine Surge speed buff
  useEffect(() => {
    let timer;
    if (caffeineTimer > 0) {
      timer = setInterval(() => {
        setCaffeineTimer(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [caffeineTimer]);

  const addGuestbookEntry = (name, cls, stats, colors, review) => {
    const newEntry = {
      name,
      class: cls,
      stats,
      colors,
      review,
      date: new Date().toLocaleDateString()
    };
    const updated = [...guestbookEntries, newEntry];
    setGuestbookEntries(updated);
    localStorage.setItem('raghav_rpg_guestbook', JSON.stringify(updated));
  };

  const unlockBadge = (badgeName) => {
    if (!equippedBadges.includes(badgeName)) {
      setEquippedBadges(prev => [...prev, badgeName]);
    }
  };

  const handleInspect = (itemId) => {
    setActiveItemId(itemId);
    if (!inspectedItems.includes(itemId)) {
      setInspectedItems(prev => [...prev, itemId]);
    }
  };

  const resetGameState = () => {
    setEnergyLevel(100);
    setSoccerScore(0);
    setTriviaStreak(0);
    setCaffeineTimer(0);
  };

  return (
    <GameStateContext.Provider value={{
      playerName, setPlayerName,
      playerClass, setPlayerClass,
      playerStats, setPlayerStats,
      playerColors, setPlayerColors,
      energyLevel, setEnergyLevel,
      inspectedItems, setInspectedItems, handleInspect,
      konamiUnlocked, setKonamiUnlocked,
      soccerScore, setSoccerScore,
      bikingBestLap, setBikingBestLap,
      triviaStreak, setTriviaStreak,
      equippedBadges, setEquippedBadges, unlockBadge,
      guestbookEntries, addGuestbookEntry,
      resetGameState,
      activeItemId, setActiveItemId,
      caffeineTimer, setCaffeineTimer
    }}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error("useGameState must be used within a GameStateProvider");
  }
  return context;
}
