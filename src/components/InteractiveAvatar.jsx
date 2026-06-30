import React, { useEffect, useState, useRef } from 'react';
import Sprite from './Sprite';
import PixelProp from './PixelProp';
import { useGameState } from './GameStateContext';
import { 
  MAP_COLS, 
  MAP_ROWS, 
  isTileSolid, 
  getTileType, 
  INTERACTABLE_OBJECTS,
  getFurnitureDialogue
} from '../mapConfig';

// Web Audio Synth Sound Engine
const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    if (type === 'thump') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'chime') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'square';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); 
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); 
      osc2.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); 
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc2.start(ctx.currentTime + 0.08);
      osc1.stop(ctx.currentTime + 0.35);
      osc2.stop(ctx.currentTime + 0.35);
    } else if (type === 'gulp') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.15);
      osc.frequency.setValueAtTime(150, ctx.currentTime + 0.18);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.33);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'stadium') {
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.35);
      });
    } else if (type === 'konami') {
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);
        gain.gain.setValueAtTime(0.06, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.2);
      });
    } else if (type === 'step') {
      const bufferSize = ctx.sampleRate * 0.04;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1000;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.025, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
      noise.stop(ctx.currentTime + 0.04);
    }
  } catch (e) {
    // blocked
  }
};

// Helper to convert RGB integer values to Hex colors for customizer
const rgbToHex = (r, g, b) => {
  const toHex = (c) => {
    const hex = Math.max(0, Math.min(255, c)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export default function InteractiveAvatar() {
  const {
    playerName, setPlayerName,
    playerClass, setPlayerClass,
    playerStats, setPlayerStats,
    playerColors, setPlayerColors,
    energyLevel, setEnergyLevel,
    inspectedItems, handleInspect,
    konamiUnlocked, setKonamiUnlocked,
    soccerScore, setSoccerScore,
    bikingBestLap, setBikingBestLap,
    triviaStreak, setTriviaStreak,
    equippedBadges, unlockBadge,
    guestbookEntries, addGuestbookEntry,
    caffeineTimer, setCaffeineTimer
  } = useGameState();

  // Spawning Customizer states
  const [customName, setCustomName] = useState("Heyy Visitor");
  const [selectedPresetClass, setSelectedPresetClass] = useState("Chaotic Explorer");
  const [customClass, setCustomClass] = useState("");
  const [isCustomClassMode, setIsCustomClassMode] = useState(false);
  const [raghavDirection, setRaghavDirection] = useState('down');
  const [gameStarted, setGameStarted] = useState(false);
  const [pointsPool, setPointsPool] = useState(20);
  const [statsAlloc, setStatsAlloc] = useState({ stamina: 5, curiosity: 5, reflexes: 5, intellect: 5 });

  // Hands-on Handheld Arcade Portal System states
  const [activeGameStation, setActiveGameStation] = useState(null);
  const [showFullscreenSoccer, setShowFullscreenSoccer] = useState(false);
  const [showFullscreenBiking, setShowFullscreenBiking] = useState(false);

  // 1v1 Soccer Game States & loading screens
  const [soccerLoading, setSoccerLoading] = useState(true);
  const [soccerProgress, setSoccerProgress] = useState(0);
  const [soccerPlayerScore, setSoccerPlayerScore] = useState(0);
  const [soccerAIScore, setSoccerAIScore] = useState(0);
  const [fsSoccerTimer, setFsSoccerTimer] = useState(90);
  const [soccerMatchEnd, setSoccerMatchEnd] = useState(false);
  const [soccerResult, setSoccerResult] = useState('');
  const [fsSoccerCountdown, setFsSoccerCountdown] = useState(null);
  const [fsAIPlayerPos, setFsAIPlayerPos] = useState({ col: 75, row: 50 });
  const [fsAIDirection, setFsAIDirection] = useState('left');
  const [fsAIFrame, setFsAIFrame] = useState(0);

  // 1v1 Motorbike Race States & vehicle selections
  const [bikeSelected, setBikeSelected] = useState(false);
  const [selectedMotorbike, setSelectedMotorbike] = useState('shine'); // 'shine' | 'mt15'
  const [fsAIBikePos, setFsAIBikePos] = useState({ col: 50, row: 20 });
  const [fsAIBikeCheckpoint, setFsAIBikeCheckpoint] = useState(1);
  const [playerLaps, setPlayerLaps] = useState(0);
  const [aiLaps, setAiLaps] = useState(0);
  const [motorbikeMatchEnd, setMotorbikeMatchEnd] = useState(false);
  const [motorbikeResult, setMotorbikeResult] = useState('');

  // Dedicated fullscreen game loops positions and states
  const [fsPlayerPos, setFsPlayerPos] = useState({ col: 20, row: 50 });
  const [fsBallPos, setFsBallPos] = useState({ col: 50, row: 50 });
  const [fsGoaliePos, setFsGoaliePos] = useState(50);
  const [fsDirection, setFsDirection] = useState('down');
  const [fsFrame, setFsFrame] = useState(0);

  const [fsBikingCheckpoint, setFsBikingCheckpoint] = useState(1);

  // Custom Colors (RGB Sliders!)
  // Custom Character Styling Options
  const [spriteGender, setSpriteGender] = useState('male');
  const [faceStyle, setFaceStyle] = useState('classic');
  const [selectedSkinColor, setSelectedSkinColor] = useState('#ffdbac');
  const [selectedHatColor, setSelectedHatColor] = useState('#8a2be2');
  const [selectedShirtColor, setSelectedShirtColor] = useState('#1e88e5');
  const [selectedPantsColor, setSelectedPantsColor] = useState('#ffd700');

  // Travel Diary Modal State
  const [showTravelDiary, setShowTravelDiary] = useState(false);
  const [diaryIdx, setDiaryIdx] = useState(0);

  // Dynamic Thematic Corner Modals & Climbing QTE states
  const [showClimbingQTE, setShowClimbingQTE] = useState(false);
  const [qteKey, setQteKey] = useState('');
  const [qteProgress, setQteProgress] = useState(0);
  const [qteStatus, setQteStatus] = useState('playing'); // 'playing' | 'success' | 'fail'
  
  const [showTechStack, setShowTechStack] = useState(false);
  const [activeStackDrawer, setActiveStackDrawer] = useState('engine'); // 'engine' | 'drivetrain' | 'suspension' | 'touring'
  
  const [showFitnessStats, setShowFitnessStats] = useState(false);
  const [showTacticalBlueprints, setShowTacticalBlueprints] = useState(false);
  const [showPCProjects, setShowPCProjects] = useState(false);
  const [pcActiveProject, setPcActiveProject] = useState('gr20'); // 'gr20' | 'hampi' | 'western_ghats'
  const [simulatedLogs, setSimulatedLogs] = useState([]);

  const travelSlides = [
    {
      src: '/trekking.png',
      title: "🏔️ GR20 Expedition, Corsica",
      desc: "Successfully traversed 180km of the most grueling alpine granite trails in Europe. High altitude ridge walking, heavy packing, and stormy summits."
    },
    {
      src: '/bouldering.png',
      title: "Conquered V5 Granite block, Hampi",
      desc: "High-friction sandstone block climbing under historical ruins. Slopers, technical toe hooks, and high-ball sends under the blazing sun."
    },
    {
      src: '/trekking_2.png',
      title: "🌲 Monsoon Valley Hikes, Western Ghats",
      desc: "Navigated deep tropical valleys, scaled misty peaks in peak rainstorms, and stood at the edge of glorious waterfall valleys."
    },
    {
      src: '/anime_2.png',
      title: "🏯 Kyoto & Akihabara Sanctuary, Japan",
      desc: "Explored retro game archives, historic temple trails, and vintage weeb libraries, absorbing the pure 16-bit creative soul."
    }
  ];

  // Player continuous coordinates and direction
  const [playerPos, setPlayerPos] = useState({ col: 11, row: 10 }); 
  const [direction, setDirection] = useState('down');
  const [frame, setFrame] = useState(0);
  const [dialogueText, setDialogueText] = useState("Welcome to my cozy overworld space! Walk up to items to inspect, or click tiles.");
  const [displayedText, setDisplayedText] = useState("");
  const [nearObject, setNearObject] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  // ⚽ Soccer Ball continuous physics state
  const [ballPos, setBallPos] = useState({ col: 15.0, row: 11.0 });
  const [showGoalFlash, setShowGoalFlash] = useState(false);
  
  // Goalie NPC Y-axis sliding FSM coordinates
  const [goalieRow, setGoalieRow] = useState(11.0);
  const goalieDir = useRef(1); // 1 = down, -1 = up

  // Biking loop racing states
  const [isRiding, setIsRiding] = useState(false);
  const [lapTimer, setLapTimer] = useState(0.0);
  const [showLapComplete, setShowLapComplete] = useState(false);
  const [lastLapTime, setLastLapTime] = useState(0.0);
  const activeCheckpoint = useRef(1); // 1, 2, 3
  const isLapActive = useRef(false);
  const lapStartTime = useRef(0);

  // Raghav's Cyber Diner Food counter item state coordinates (Cleared: moved into interactive Kitchen!)
  const [dinerFoods, setDinerFoods] = useState([]);
  const [showKitchen, setShowKitchen] = useState(false);
  const [cookingItem, setCookingItem] = useState(null);
  const [cookingProgress, setCookingProgress] = useState(0);

  // Wall-mounted Gilded Photo Frame Visitor Gallery states
  const [showVisitorGallery, setShowVisitorGallery] = useState(false);
  const [selectedGalleryProfile, setSelectedGalleryProfile] = useState(null);

  // Manga Trivia Cabinet Game States
  const [showTrivia, setShowTrivia] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [triviaResult, setTriviaResult] = useState(null); // 'correct' | 'wrong'

  // Books & Films Shelf / CD Shelf states
  const [showBookshelfPrompt, setShowBookshelfPrompt] = useState(false);
  const [showBookshelfModal, setShowBookshelfModal] = useState(false);
  const [bookshelfTab, setBookshelfTab] = useState('anime'); // 'anime' | 'movies'

  // Polaroid Projector Media Carousel states
  const [showCarousel, setShowCarousel] = useState(false);
  const [carouselIdx, setCarouselIdx] = useState(0);

  // Guestbook Bulletin submit states
  const [showGuestbookSubmit, setShowGuestbookSubmit] = useState(false);
  const [guestbookText, setGuestbookText] = useState("");
  const [selectedVisitorReview, setSelectedVisitorReview] = useState(null); // to read a past guest NPC review

  const keysPressed = useRef({});
  const playerCoords = useRef({ col: 11, row: 10 });
  const lastStepSound = useRef(0);
  const clickTarget = useRef(null);
  const konamiKeyHistory = useRef([]);

  // Soccer Ball Physics Refs
  const ballCoords = useRef({ col: 15.0, row: 11.0 });
  const ballVel = useRef({ col: 0, row: 0 });

  // Raghav signature colors for Raghav NPC
  const raghavColors = {
    hat: '#e53935', 
    skin: '#ffb6c1',
    shirt: '#000000',
    pants: '#1e88e5',
    shoes: '#ffffff'
  };

  // Convert custom specs back into custom color specs for Sprite
  const customColors = {
    hat: selectedHatColor,
    skin: selectedSkinColor,
    shirt: selectedShirtColor,
    pants: selectedPantsColor,
    shoes: '#ffffff',
    gender: spriteGender,
    faceStyle: faceStyle
  };

  // Coordinated loop references
  const isAudioEnabledRef = useRef(false);
  const nearObjectRef = useRef(null);
  const directionRef = useRef('down');
  const stepAccumulator = useRef(0);
  const energyLevelRef = useRef(100);

  useEffect(() => {
    isAudioEnabledRef.current = isAudioEnabled;
  }, [isAudioEnabled]);

  useEffect(() => {
    energyLevelRef.current = energyLevel;
  }, [energyLevel]);

  // Real-world photography images for projector carousel
  const polaroids = [
    { src: '/bouldering.png', caption: "Scaling local V5 block walls in high friction rubber." },
    { src: '/trekking.png', caption: "Surviving GR20 nature hikes with heavy packs." },
    { src: '/anime.png', caption: "Cataloging the ancient weeb archives." },
    { src: '/football.png', caption: "Champions League tactical backseat backseat driver boards." },
    { src: '/profile.png', caption: "Main Spawning Spooky Workspace command deck." }
  ];

  // Manga Multiple Choice questions
  const triviaQuestions = [
    {
      q: "Which pirate captain wears the legendary Straw Hat and is searching for the One Piece?",
      options: ["Roronoa Zoro", "Monkey D. Luffy", "Portgas D. Ace", "Marshall D. Teach"],
      ans: 1
    },
    {
      q: "What is the magical life energy system utilized by Hunters in Hunter x Hunter?",
      options: ["Chakra", "Ki", "Nen", "Haki"],
      ans: 2
    },
    {
      q: "In Attack on Titan, what wall protects the outer perimeter of the human territory?",
      options: ["Wall Rose", "Wall Sina", "Wall Maria", "Wall Outer"],
      ans: 2
    }
  ];

  // Attribute distributor adjustments
  const adjustStat = (statName, amount) => {
    if (amount > 0 && pointsPool > 0) {
      setStatsAlloc(prev => ({ ...prev, [statName]: prev[statName] + 1 }));
      setPointsPool(p => p - 1);
    } else if (amount < 0 && statsAlloc[statName] > 1) {
      setStatsAlloc(prev => ({ ...prev, [statName]: prev[statName] - 1 }));
      setPointsPool(p => p + 1);
    }
  };

  // Typewriter effect
  useEffect(() => {
    let index = 0;
    setDisplayedText("");
    const typingInterval = setInterval(() => {
      if (index < dialogueText.length) {
        setDisplayedText((prev) => prev + dialogueText.charAt(index));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 18);
    return () => clearInterval(typingInterval);
  }, [dialogueText]);

  // Proximity triggers and Raghav NPC AI
  const checkProximity = (col, row) => {
    let foundNearby = null;
    let minDistance = 2.0;

    // Check portfolio interactable objects
    INTERACTABLE_OBJECTS.forEach(obj => {
      obj.cells.forEach(cell => {
        const dx = cell.col - col;
        const dy = cell.row - row;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < minDistance) {
          foundNearby = obj;
          minDistance = distance;
        }
      });
    });

    // Check past visitor photo frame board
    const boardDx = 10 - col;
    const boardDy = 1 - row;
    if (Math.sqrt(boardDx*boardDx + boardDy*boardDy) < 1.8) {
      foundNearby = {
        id: 'gallery',
        title: "Gallery of Explorers",
        dialogue: "🖼️ [Photo Frame]: Gilded frame displaying custom personalized cards of past visitors. Press E to open the Gallery!",
        inspectPrompt: "OPEN GALLERY"
      };
    }

    // Check red bike
    const bikeDx = 10 - col;
    const bikeDy = 13 - row;
    if (Math.sqrt(bikeDx*bikeDx + bikeDy*bikeDy) < 1.8) {
      foundNearby = {
        id: 'bike',
        title: "Bicycle cruiser",
        dialogue: isRiding ? "🚲 [Cruiser]: Press E to dismount your bike and return to walking speed." : "🚲 [Cruiser]: Stand next to the bike and press E to ride! Doubles speed, drains stamina.",
        inspectPrompt: isRiding ? "DISMOUNT BIKE" : "RIDE BICYCLE"
      };
    }

    // Check manga cabinet
    const cabinetDx = 16 - col;
    const cabinetDy = 1 - row;
    if (Math.sqrt(cabinetDx*cabinetDx + cabinetDy*cabinetDy) < 1.8) {
      foundNearby = {
        id: 'arcade',
        title: "Manga Cabinet",
        dialogue: "🕹️ [Manga Trivia Arcade]: Multiple choice lore machine. Press E to start the cabinet game!",
        inspectPrompt: "PLAY ARCADE"
      };
    }

    // Obsolete projector check removed

    if (foundNearby) {
      if (nearObjectRef.current?.id !== foundNearby.id) {
        setDialogueText(foundNearby.dialogue);
        nearObjectRef.current = foundNearby;
        setNearObject(foundNearby);
        if (isAudioEnabledRef.current) playSound('chime');
      }
    } else {
      if (nearObjectRef.current !== null) {
        setDialogueText("Welcome to my cozy overworld space! Walk up to items to inspect, or click tiles.");
        nearObjectRef.current = null;
        setNearObject(null);
      }
    }
  };

  // Keyboard controls listener
  useEffect(() => {
    if (!gameStarted) return;

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      
      if (e.key === 'ArrowUp') keysPressed.current['w'] = true;
      if (e.key === 'ArrowDown') keysPressed.current['s'] = true;
      if (e.key === 'ArrowLeft') keysPressed.current['a'] = true;
      if (e.key === 'ArrowRight') keysPressed.current['d'] = true;
      
      if (['w', 'a', 's', 'd', 'e', ' ', 'b'].includes(key)) {
        keysPressed.current[key] = true;
        clickTarget.current = null;
      }

      // Konami wwssadadba
      konamiKeyHistory.current.push(key);
      if (konamiKeyHistory.current.length > 10) {
        konamiKeyHistory.current.shift();
      }
      const seq = konamiKeyHistory.current.join('');
      if (seq === 'wwssadadba') {
        playSound('konami');
        setDialogueText("✨ SECRET KONAMI CODE UNLOCKED! Cheats Activated: +99 Charisma. Side Quest Complete!");
        setKonamiUnlocked(true);
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (e.key === 'ArrowUp') keysPressed.current['w'] = false;
      if (e.key === 'ArrowDown') keysPressed.current['s'] = false;
      if (e.key === 'ArrowLeft') keysPressed.current['a'] = false;
      if (e.key === 'ArrowRight') keysPressed.current['d'] = false;
      if (['w', 'a', 's', 'd', 'e', ' ', 'b'].includes(key)) {
        keysPressed.current[key] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted]);

  // Continuous game loop
  useEffect(() => {
    if (!gameStarted) return;
    let animId;

    const gameLoop = () => {
      // Ignore overworld updates when any modal overlay is active to prevent input leak
      if (showFullscreenSoccer || showFullscreenBiking || showTravelDiary || showCarousel || showVisitorGallery || showKitchen || showTrivia || showGuestbookSubmit || showClimbingQTE || showTechStack || showFitnessStats || showTacticalBlueprints || showBookshelfPrompt || showBookshelfModal) {
        keysPressed.current = {};
        clickTarget.current = null;
        animId = requestAnimationFrame(gameLoop);
        return;
      }

      // 1. Calculate dynamic player speed (caffeine speed boost & riding bike speed)
      let baseSpeed = 0.08; 
      if (caffeineTimer > 0) {
        baseSpeed = 0.12; // 1.5x speed boost from Caffeine Surge!
      }
      
      if (isRiding) {
        baseSpeed = caffeineTimer > 0 ? 0.20 : 0.16; // Even faster if caffeinated!
        // Drains energyLevel faster when biking!
        if (Math.random() < 0.008) {
          setEnergyLevel(prev => {
            const next = Math.max(0, prev - 1);
            if (next === 0) {
              setIsRiding(false); // dismount bike if out of energy!
              setDialogueText("💤 [Exhausted]: You ran out of Stamina/Energy! Dismounted bike.");
              playSound('thump');
            }
            return next;
          });
        }
      } else {
        // slow normal walking energyLevel drain
        if (Math.random() < 0.002) {
          setEnergyLevel(prev => Math.max(0, prev - 1));
        }
      }

      let dx = 0;
      let dy = 0;
      let newDir = directionRef.current;
      let isMoving = false;

      // WASD / Arrow
      if (keysPressed.current['w']) { dy = -baseSpeed; newDir = 'up'; isMoving = true; }
      else if (keysPressed.current['s']) { dy = baseSpeed; newDir = 'down'; isMoving = true; }
      
      if (keysPressed.current['a']) { dx = -baseSpeed; newDir = 'left'; isMoving = true; }
      else if (keysPressed.current['d']) { dx = baseSpeed; newDir = 'right'; isMoving = true; }

      // Interact inspect (Intercept Bike, Soccer Net, Arcade Cabinet for choice selections)
      if (keysPressed.current['e'] || keysPressed.current[' ']) {
        if (nearObjectRef.current) {
          const type = nearObjectRef.current.id;
          
          if (type === 'bike') {
            setActiveGameStation('bike');
            keysPressed.current['e'] = false;
            keysPressed.current[' '] = false;
          }
          else if (type === 'football') {
            setActiveGameStation('football');
            keysPressed.current['e'] = false;
            keysPressed.current[' '] = false;
          }
          else if (type === 'arcade') {
            setActiveGameStation('arcade');
            keysPressed.current['e'] = false;
            keysPressed.current[' '] = false;
          }
          else if (type === 'gallery') {
            // Open Photo Frame Wall Gallery
            setShowVisitorGallery(true);
            keysPressed.current['e'] = false;
            keysPressed.current[' '] = false;
          }
          else if (type === 'trekking') {
            // Open Travel Diary scrapbook modal!
            setShowTravelDiary(true);
            setDiaryIdx(0);
            keysPressed.current['e'] = false;
            keysPressed.current[' '] = false;
          }
          else if (type === 'kitchen') {
            // Open Cyber Bistro Kitchen Menu!
            setShowKitchen(true);
            keysPressed.current['e'] = false;
            keysPressed.current[' '] = false;
          }
          else if (type === 'bouldering') {
            // Start QTE Climbing minigame!
            setQteProgress(0);
            setQteStatus('playing');
            const keysList = ['w', 'a', 's', 'd', 'e', 'space'];
            const initialRandom = keysList[Math.floor(Math.random() * keysList.length)];
            setQteKey(initialRandom);
            setShowClimbingQTE(true);
            keysPressed.current['e'] = false;
            keysPressed.current[' '] = false;
          }
          else if (type === 'hangboard') {
            // Open Fitness stats panel!
            setShowFitnessStats(true);
            keysPressed.current['e'] = false;
            keysPressed.current[' '] = false;
          }
          else if (type === 'tacticboard') {
            // Open Tactical chalk board!
            setShowTacticalBlueprints(true);
            keysPressed.current['e'] = false;
            keysPressed.current[' '] = false;
          }
          else if (type === 'bookshelf' || type === 'cd_shelf') {
            // Open Books & Films Choice Prompt!
            setShowBookshelfPrompt(true);
            keysPressed.current['e'] = false;
            keysPressed.current[' '] = false;
          }
          else if (type === 'toolbox') {
            // Open Tech stack drawers!
            setShowTechStack(true);
            setActiveStackDrawer('frontend');
            keysPressed.current['e'] = false;
            keysPressed.current[' '] = false;
          }
          else {
            handleInspect(nearObjectRef.current.id);
            keysPressed.current['e'] = false;
            keysPressed.current[' '] = false;
          }
        }
      }

      // Click pathing
      if (clickTarget.current && !isMoving) {
        const destC = clickTarget.current.col;
        const destR = clickTarget.current.row;
        const diffX = destC - playerCoords.current.col;
        const diffY = destR - playerCoords.current.row;
        const dist = Math.sqrt(diffX * diffX + diffY * diffY);

        if (dist > 0.1) {
          isMoving = true;
          if (Math.abs(diffX) > Math.abs(diffY)) {
            dx = Math.sign(diffX) * Math.min(baseSpeed, Math.abs(diffX));
            newDir = dx > 0 ? 'right' : 'left';
          } else {
            dy = Math.sign(diffY) * Math.min(baseSpeed, Math.abs(diffY));
            newDir = dy > 0 ? 'down' : 'up';
          }
        } else {
          clickTarget.current = null;
        }
      }

      if (isMoving) {
        if (newDir !== directionRef.current) {
          directionRef.current = newDir;
          setDirection(newDir);
        }
        
        let targetC = playerCoords.current.col + dx;
        let targetR = playerCoords.current.row + dy;
        const radius = 0.35; 
        
        // X Collision
        let collidesX = false;
        const checkPointsX = [
          { col: targetC + (dx > 0 ? radius : -radius), row: playerCoords.current.row - radius + 0.05 },
          { col: targetC + (dx > 0 ? radius : -radius), row: playerCoords.current.row + radius - 0.05 }
        ];
        
        for (let pt of checkPointsX) {
          if (isTileSolid(Math.floor(pt.col), Math.floor(pt.row))) {
            collidesX = true;
            const text = getFurnitureDialogue(Math.floor(pt.col), Math.floor(pt.row));
            if (text) setDialogueText(text);
            break;
          }
        }

        if (!collidesX) {
          playerCoords.current.col = targetC;
        } else {
          if (isAudioEnabledRef.current && Math.abs(dx) > 0.01) playSound('thump');
          if (clickTarget.current) clickTarget.current = null;
        }

        // Y Collision
        let collidesY = false;
        const checkPointsY = [
          { col: playerCoords.current.col - radius + 0.05, row: targetR + (dy > 0 ? radius : -radius) },
          { col: playerCoords.current.col + radius - 0.05, row: targetR + (dy > 0 ? radius : -radius) }
        ];

        for (let pt of checkPointsY) {
          if (isTileSolid(Math.floor(pt.col), Math.floor(pt.row))) {
            collidesY = true;
            const text = getFurnitureDialogue(Math.floor(pt.col), Math.floor(pt.row));
            if (text) setDialogueText(text);
            break;
          }
        }

        if (!collidesY) {
          playerCoords.current.row = targetR;
        } else {
          if (isAudioEnabledRef.current && Math.abs(dy) > 0.01) playSound('thump');
          if (clickTarget.current) clickTarget.current = null;
        }

        stepAccumulator.current += baseSpeed;
        setFrame(Math.floor(stepAccumulator.current / 0.25) % 4);

        const now = Date.now();
        if (isAudioEnabledRef.current && now - lastStepSound.current > 350) {
          playSound('step');
          lastStepSound.current = now;
        }

        setPlayerPos({ col: playerCoords.current.col, row: playerCoords.current.row });
        checkProximity(playerCoords.current.col, playerCoords.current.row);
      } else {
        setFrame(0);
      }

      // --- ⚽ DYNAMIC OVERWORLD LOBBY SOCCER BALL PHYSICS WITH MOMENTUM & FRICTION ---
      // 1. Decelerating roll friction for overworld ball
      ballVel.current.col *= 0.93;
      ballVel.current.row *= 0.93;

      let nextBallC = ballCoords.current.col + ballVel.current.col;
      let nextBallR = ballCoords.current.row + ballVel.current.row;

      // 2. Bounded specifically to the lobby green turf carpet boundary guard with elastic bounces
      if (nextBallC < 13.6 || nextBallC > 18.5) {
        ballVel.current.col = -ballVel.current.col * 0.72; // bounce!
        nextBallC = Math.max(13.6, Math.min(18.5, ballCoords.current.col + ballVel.current.col));
      }
      if (nextBallR < 9.6 || nextBallR > 13.5) {
        ballVel.current.row = -ballVel.current.row * 0.72; // bounce!
        nextBallR = Math.max(9.6, Math.min(13.5, ballCoords.current.row + ballVel.current.row));
      }

      ballCoords.current.col = nextBallC;
      ballCoords.current.row = nextBallR;

      // 3. Player approach collision kick momentum transfer
      const dxBall = ballCoords.current.col - playerCoords.current.col;
      const dyBall = ballCoords.current.row - playerCoords.current.row;
      const distBall = Math.sqrt(dxBall * dxBall + dyBall * dyBall);

      if (distBall < 0.78) {
        // dynamic kick force based on player movement
        let pushForce = 0.12;
        if (keysPressed.current['w'] || keysPressed.current['s'] || keysPressed.current['a'] || keysPressed.current['d']) {
          pushForce = caffeineTimer > 0 ? 0.32 : 0.22;
        }
        ballVel.current.col = (dxBall / (distBall || 1)) * pushForce;
        ballVel.current.row = (dyBall / (distBall || 1)) * pushForce;
        if (isAudioEnabledRef.current) playSound('step');
      }

      // Update state for rendering
      setBallPos({ col: ballCoords.current.col, row: ballCoords.current.row });

      // --- 🍔 CYBER DINER FOOD COUNTER PICKUPS ---
      setDinerFoods(prevFoods => {
        return prevFoods.filter(food => {
          const fDx = food.col - playerCoords.current.col;
          const fDy = food.row - playerCoords.current.row;
          const fDist = Math.sqrt(fDx*fDx + fDy*fDy);
          
          if (fDist < 0.68) {
            playSound('gulp');
            setEnergyLevel(e => Math.min(100, e + 25)); // restore 25 energy!
            
            if (food.id === 'coffee') {
              setCaffeineTimer(15); // 15 seconds of Caffeine speed surge!
              setDialogueText(`☕ Drank Hot Coffee! Restored +25 Stamina and gained CAFFEINE SURGE speed boost!`);
            } else if (food.id === 'popcorn') {
              setDialogueText(`🍿 Ate DBT Popcorn! Restored +25 Stamina. Smells absolutely buttery delicious!`);
            } else if (food.id === 'shwarma') {
              setDialogueText(`🌯 Ate Spicy Lebanese Shwarma! Restored +25 Stamina. Full of garlic flavor!`);
            } else if (food.id === 'chaap') {
              setDialogueText(`🍢 Ate Hot Soya Chaap! Restored +25 Stamina. Classic tandoori protein!`);
            } else if (food.id === 'garlic-bread') {
              setDialogueText(`🧄 Ate crispy Garlic Bread! Restored +25 Stamina. Warm, toasted, and buttery!`);
            } else if (food.id === 'thumbs-up') {
              setDialogueText(`🍾 Drank Thumbs Up! Restored +25 Stamina. Gained the ultimate glass bottle cola fizz!`);
            }
            return false; // remove from counter
          }
          return true;
        });
      });

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameStarted, isRiding, caffeineTimer]);
  // --- standalone ⚽ 1V1 SOCCER DUEL ARCADE PORTAL SYSTEM ---
  useEffect(() => {
    if (!showFullscreenSoccer) return;
    let animId;
    let timerInterval;
    let isLoaded = false;
    let isMatchEnded = false;
    let kickoffCountdown = 3;
    let inKickoff = true;
    let countdownTimer = null;

    // Grid percentage metrics
    let pCol = 9; 
    let pRow = 50;
    let aiCol = 89;
    let aiRow = 50;
    let bCol = 50; 
    let bRow = 50;
    let bVelCol = 0; 
    let bVelRow = 0;
    let fsFrameAccumulator = 0;
    let aiFrameAccumulator = 0;
    let aiThinkFrames = 0;
    let decidedAiDx = 0;
    let decidedAiDy = 0;
    let decidedAiDir = 'left';
    let decidedAiMoving = false;

    const resetPlayersAndBall = () => {
      pCol = 9;
      pRow = 50;
      aiCol = 89;
      aiRow = 50;
      bCol = 50;
      bRow = 50;
      bVelCol = 0;
      bVelRow = 0;
      aiThinkFrames = 0;
      decidedAiDx = 0;
      decidedAiDy = 0;
      decidedAiDir = 'left';
      decidedAiMoving = false;
      setFsPlayerPos({ col: 9, row: 50 });
      setFsAIPlayerPos({ col: 89, row: 50 });
      setFsBallPos({ col: 50, row: 50 });
    };

    const runKickoff = () => {
      inKickoff = true;
      kickoffCountdown = 3;
      resetPlayersAndBall();
      setFsSoccerCountdown(3);
      setDialogueText("🚦 READY... 3");
      
      if (countdownTimer) clearInterval(countdownTimer);
      
      countdownTimer = setInterval(() => {
        kickoffCountdown -= 1;
        if (kickoffCountdown === 2) {
          setFsSoccerCountdown(2);
          setDialogueText("🚦 READY... 2");
        } else if (kickoffCountdown === 1) {
          setFsSoccerCountdown(1);
          setDialogueText("🚦 READY... 1");
        } else if (kickoffCountdown <= 0) {
          clearInterval(countdownTimer);
          setFsSoccerCountdown("GO!");
          inKickoff = false;
          setDialogueText("⚽ PLAY! Match in action!");
          setTimeout(() => setFsSoccerCountdown(null), 850);
        }
      }, 1000);
    };

    // Loading screen progression timer
    setSoccerLoading(true);
    setSoccerProgress(0);
    setSoccerMatchEnd(false);
    setSoccerPlayerScore(0);
    setSoccerAIScore(0);
    setFsSoccerTimer(90);
    resetPlayersAndBall();

    const loadInterval = setInterval(() => {
      setSoccerProgress(p => {
        if (p >= 100) {
          clearInterval(loadInterval);
          setSoccerLoading(false);
          isLoaded = true;
          runKickoff(); // Start initial kickoff countdown!
          
          // Match timer ticks down every second
          timerInterval = setInterval(() => {
            if (!inKickoff && !isMatchEnded) {
              setFsSoccerTimer(t => {
                if (t <= 1) {
                  clearInterval(timerInterval);
                  setSoccerMatchEnd(true);
                  isMatchEnded = true;
                  // Calculate match result
                  setSoccerPlayerScore(currPlayer => {
                    setSoccerAIScore(currAI => {
                      if (currPlayer > currAI) setSoccerResult('VICTORY');
                      else if (currPlayer < currAI) setSoccerResult('DEFEAT');
                      else setSoccerResult('DRAW');
                      return currAI;
                    });
                    return currPlayer;
                  });
                  return 0;
                }
                return t - 1;
              });
            }
          }, 1000);
          
          return 100;
        }
        return p + 10;
      });
    }, 150);

    const keys = {};
    const handleDown = (e) => {
      const k = e.key.toLowerCase();
      if (['w','a','s','d','arrowup','arrowleft','arrowdown','arrowright'].includes(k)) {
        keys[k] = true;
      }
      if (e.key === 'Escape' || k === 'b') {
        setShowFullscreenSoccer(false);
        setShowTravelDiary(false);
      }
    };
    const handleUp = (e) => {
      keys[e.key.toLowerCase()] = false;
    };
    
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    
    const tick = () => {
      // Check if loading or game ended or in kickoff countdown
      if (!isLoaded || isMatchEnded || inKickoff) {
        animId = requestAnimationFrame(tick);
        return;
      }

      // 1. Dynamic player speed (slower deliberately as requested)
      let speed = caffeineTimer > 0 ? 0.95 : 0.65;
      let dx = 0;
      let dy = 0;
      let moving = false;
      let dir = fsDirection;
      
      if (keys['w'] || keys['arrowup']) { dy = -speed; dir = 'up'; moving = true; }
      else if (keys['s'] || keys['arrowdown']) { dy = speed; dir = 'down'; moving = true; }
      if (keys['a'] || keys['arrowleft']) { dx = -speed; dir = 'left'; moving = true; }
      else if (keys['d'] || keys['arrowright']) { dx = speed; dir = 'right'; moving = true; }
      
      if (moving) {
        fsFrameAccumulator += 0.25;
        setFsFrame(Math.floor(fsFrameAccumulator / 0.55) % 4);
        setFsDirection(dir);
      } else {
        setFsFrame(0);
      }
      
      // Move player and keep bounded in fullscreen field coordinates
      pCol = Math.max(7, Math.min(88, pCol + dx));
      pRow = Math.max(12, Math.min(88, pRow + dy));

      // 2. Opponent Sprite (Raghav in red/black jersey) chases ball (slower deliberately & with decision latency)
      let aiSpeed = 0.43; // reduced from 0.48 to make his movement less aggressive

      aiThinkFrames += 1;
      // recalculate target only every 20 frames (~333ms) to simulate human reaction delay
      if (aiThinkFrames >= 20) {
        aiThinkFrames = 0;
        decidedAiDx = 0;
        decidedAiDy = 0;
        decidedAiMoving = false;

        if (bCol > aiCol + 1.5) { decidedAiDx = aiSpeed; decidedAiDir = 'right'; decidedAiMoving = true; }
        else if (bCol < aiCol - 1.5) { decidedAiDx = -aiSpeed; decidedAiDir = 'left'; decidedAiMoving = true; }
        if (bRow > aiRow + 1.5) { decidedAiDy = aiSpeed; decidedAiDir = 'down'; decidedAiMoving = true; }
        else if (bRow < aiRow - 1.5) { decidedAiDy = -aiSpeed; decidedAiDir = 'up'; decidedAiMoving = true; }
      }

      aiCol = Math.max(7, Math.min(88, aiCol + decidedAiDx));
      aiRow = Math.max(12, Math.min(88, aiRow + decidedAiDy));

      if (decidedAiMoving) {
        aiFrameAccumulator += 0.25;
        setFsAIFrame(Math.floor(aiFrameAccumulator / 0.55) % 4);
        setFsAIDirection(decidedAiDir);
      } else {
        setFsAIFrame(0);
      }
      
      // 3. Ball Decelerating roll friction (increased dampening friction to 0.915 for "heavy/harder" rolling feel)
      bVelCol *= 0.915;
      bVelRow *= 0.915;
      
      let nextBallC = bCol + bVelCol;
      let nextBallR = bRow + bVelRow;
      
      // 4. Soccer Ball wall bounces and BOTH Goal Nets check
      // Player Goal: Left (col <= 6), AI Goal: Right (col >= 94)
      if (nextBallC <= 6) {
        // Left Goal (Player Goal Net Y: 35% to 65%)
        if (nextBallR >= 35 && nextBallR <= 65) {
          playSound('thump');
          setSoccerAIScore(prev => {
            const next = prev + 1;
            if (next >= 3) {
              setSoccerMatchEnd(true);
              isMatchEnded = true;
              setSoccerResult('DEFEAT');
              clearInterval(timerInterval);
            }
            return next;
          });
          setDialogueText("🥅 Raghav scored in your Left Goal! Resetting kickoff...");
          runKickoff();
          nextBallC = 50;
          nextBallR = 50;
        } else {
          bVelCol = -bVelCol * 0.72;
          nextBallC = bCol + bVelCol;
        }
      }
      else if (nextBallC >= 94) {
        // Right Goal (AI Goal Net Y: 35% to 65%)
        if (nextBallR >= 35 && nextBallR <= 65) {
          playSound('stadium');
          setShowGoalFlash(true);
          setSoccerPlayerScore(prev => {
            const next = prev + 1;
            if (next >= 3) {
              setSoccerMatchEnd(true);
              isMatchEnded = true;
              setSoccerResult('VICTORY');
              unlockBadge("Goal King");
              clearInterval(timerInterval);
            }
            return next;
          });
          setDialogueText("⚽ GOAL!!! You scored in Raghav's Right Goal!");
          setTimeout(() => setShowGoalFlash(false), 1600);
          
          runKickoff();
          nextBallC = 50;
          nextBallR = 50;
        } else {
          bVelCol = -bVelCol * 0.72;
          nextBallC = bCol + bVelCol;
        }
      }
      
      if (nextBallR < 12 || nextBallR > 88) {
        bVelRow = -bVelRow * 0.72;
        nextBallR = bRow + bVelRow;
      }
      
      bCol = nextBallC;
      bRow = nextBallR;
      
      // 5. Conserves Momentum transfer on Player approach collisions
      const distCol = bCol - pCol;
      const distRow = bRow - pRow;
      const dist = Math.sqrt(distCol*distCol + distRow*distRow);
      
      if (dist < 6.2) {
        const approach = Math.sqrt(dx*dx + dy*dy);
        // Slightly higher force to overcome higher friction, giving a satisfying "hard" kick response
        const force = 1.05 + approach * 1.15;
        bVelCol = (distCol / (dist || 1)) * force;
        bVelRow = (distRow / (dist || 1)) * force;
        playSound('step');
      }

      // 6. Conserves Momentum transfer on Raghav approach collisions
      const aiDistCol = bCol - aiCol;
      const aiDistRow = bRow - aiRow;
      const aiDist = Math.sqrt(aiDistCol*aiDistCol + aiDistRow*aiDistRow);

      if (aiDist < 6.2) {
        // Raghav kicks ball towards Left Goal (Player Goal at 5, 50)
        const targetGoalC = 5;
        const targetGoalR = 50;
        const kickDirC = targetGoalC - bCol;
        const kickDirR = targetGoalR - bRow;
        const kickDist = Math.sqrt(kickDirC*kickDirC + kickDirR*kickDirR);

        // Slightly reduced Raghav kick force to make him less dominant
        bVelCol = (kickDirC / (kickDist || 1)) * 1.15;
        bVelRow = (kickDirR / (kickDist || 1)) * 1.15;
        playSound('step');
        setDialogueText("🧠 Raghav kicks the ball back!");
      }
      
      setFsPlayerPos({ col: pCol, row: pRow });
      setFsAIPlayerPos({ col: aiCol, row: aiRow });
      setFsBallPos({ col: bCol, row: bRow });
      
      animId = requestAnimationFrame(tick);
    };
    
    tick();
    
    return () => {
      cancelAnimationFrame(animId);
      clearInterval(loadInterval);
      clearInterval(timerInterval);
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, [showFullscreenSoccer]);

  // --- standalone 🏍️ 1V1 MOTORBIKE CHAMPIONSHIP LOOP ---
  useEffect(() => {
    if (!showFullscreenBiking || !bikeSelected) return;
    let animId;
    let lapStart = Date.now();
    let timerInterval;
    let isRaceEnded = false;

    // Reset race states
    setPlayerLaps(0);
    setAiLaps(0);
    setLapTimer(0.0);
    setMotorbikeMatchEnd(false);
    
    let pCol = 50; 
    let pRow = 20; 
    let aiCol = 50;
    let aiRow = 23; // side by side start!
    
    let pVelC = 0;
    let pVelR = 0;
    let aiVelC = 0;
    let aiVelR = 0;
    
    let cpActive = 1; 
    let aiCpActive = 1;
    let fsFrameAccumulator = 0;
    let aiFrameAccumulator = 0;
    
    // AI Waypoint node indexes
    const waypoints = [
      { col: 15, row: 20 },
      { col: 15, row: 80 },
      { col: 85, row: 80 },
      { col: 85, row: 20 }
    ];
    let aiNodeIdx = 0;

    const keys = {};
    const handleDown = (e) => {
      const k = e.key.toLowerCase();
      if (['w','a','s','d','arrowup','arrowleft','arrowdown','arrowright'].includes(k)) {
        keys[k] = true;
      }
      if (e.key === 'Escape' || k === 'b') setShowFullscreenBiking(false);
    };
    const handleUp = (e) => {
      keys[e.key.toLowerCase()] = false;
    };
    
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);

    // Countdown before race begins
    let countdownSec = 3;
    setDialogueText(`🚦 RACE STARTING IN: ${countdownSec}...`);
    const countdownInterval = setInterval(() => {
      countdownSec -= 1;
      if (countdownSec <= 0) {
        clearInterval(countdownInterval);
        setDialogueText("🟢 GO!!! GO!!! RACE STARTED!");
        lapStart = Date.now();
        
        // Start stopwatch ticking
        timerInterval = setInterval(() => {
          setLapTimer(t => Number((t + 0.1).toFixed(1)));
        }, 100);
      } else {
        setDialogueText(`🚦 READY... ${countdownSec}...`);
      }
    }, 1000);

    const tick = () => {
      if (isRaceEnded) {
        animId = requestAnimationFrame(tick);
        return;
      }

      // Check if race has started
      const raceHasBegun = (countdownSec <= 0);

      // --- PLAYER PHYSICS AND DRIFT CONTROLS ---
      let maxSpeed = selectedMotorbike === 'mt15' ? 1.75 : 1.4;
      // apply hot coffee speedup surge buff
      if (caffeineTimer > 0) {
        maxSpeed = selectedMotorbike === 'mt15' ? 2.1 : 1.9;
      }

      let dx = 0;
      let dy = 0;
      let moving = false;
      let dir = fsDirection;

      if (raceHasBegun) {
        if (keys['w'] || keys['arrowup']) { dy = -maxSpeed; dir = 'up'; moving = true; }
        else if (keys['s'] || keys['arrowdown']) { dy = maxSpeed; dir = 'down'; moving = true; }
        if (keys['a'] || keys['arrowleft']) { dx = -maxSpeed; dir = 'left'; moving = true; }
        else if (keys['d'] || keys['arrowright']) { dx = maxSpeed; dir = 'right'; moving = true; }
      }

      // Dirt Outside Slowdown Check
      const onDirt = (pCol < 10 || pCol > 90 || pRow < 15 || pRow > 85);
      if (onDirt) {
        dx *= 0.50;
        dy *= 0.50;
        maxSpeed *= 0.50;
      }

      // Inertia slide adjustment (MT15 is drifty, Shine is responsive)
      const slideFactor = selectedMotorbike === 'mt15' ? 0.12 : 0.85; 
      pVelC += (dx - pVelC) * slideFactor;
      pVelR += (dy - pVelR) * slideFactor;

      let nextPlayerC = pCol + pVelC;
      let nextPlayerR = pRow + pVelR;

      // Tire Center Island Collision boundary check (Blocked X: 28 to 72, Y: 32 to 68)
      if (nextPlayerC >= 28 && nextPlayerC <= 72 && nextPlayerR >= 32 && nextPlayerR <= 68) {
        pVelC = -pVelC * 0.4;
        pVelR = -pVelR * 0.4;
        nextPlayerC = pCol + pVelC;
        nextPlayerR = pRow + pVelR;
        playSound('thump');
        setDialogueText("💥 Collided with central Safety Tyres!");
      }

      pCol = Math.max(5, Math.min(95, nextPlayerC));
      pRow = Math.max(10, Math.min(90, nextPlayerR));

      if (moving) {
        fsFrameAccumulator += 0.28;
        setFsFrame(Math.floor(fsFrameAccumulator / 0.5) % 4);
        setFsDirection(dir);
      } else {
        setFsFrame(0);
      }

      // --- AI RACER WAYPOINT PATHING ---
      let aiBikeType = selectedMotorbike === 'shine' ? 'mt15' : 'shine';
      let aiMaxSpeed = aiBikeType === 'mt15' ? 1.45 : 0.95; // AI speed settings
      
      let aiDx = 0;
      let aiDy = 0;
      let aiMoving = false;
      let aiDir = 'left';

      if (raceHasBegun) {
        const targetNode = waypoints[aiNodeIdx];
        const angleC = targetNode.col - aiCol;
        const angleR = targetNode.row - aiRow;
        const distToNode = Math.sqrt(angleC*angleC + angleR*angleR);

        if (distToNode > 6.0) {
          aiDx = (angleC / distToNode) * aiMaxSpeed;
          aiDy = (angleR / distToNode) * aiMaxSpeed;
          aiMoving = true;
          
          if (Math.abs(aiDx) > Math.abs(aiDy)) {
            aiDir = aiDx > 0 ? 'right' : 'left';
          } else {
            aiDir = aiDy > 0 ? 'down' : 'up';
          }
        } else {
          // arrived at node, pick next target node sequential
          aiNodeIdx = (aiNodeIdx + 1) % 4;
        }
      }

      aiVelC += (aiDx - aiVelC) * 0.2;
      aiVelR += (aiDy - aiVelR) * 0.2;

      let nextAIC = aiCol + aiVelC;
      let nextAIR = aiRow + aiVelR;

      // AI center tire island collision prevent
      if (nextAIC >= 28 && nextAIC <= 72 && nextAIR >= 32 && nextAIR <= 68) {
        nextAIC = aiCol - aiVelC;
        nextAIR = aiRow - aiVelR;
        aiNodeIdx = (aiNodeIdx + 1) % 4; // recalculate node
      }

      aiCol = Math.max(5, Math.min(95, nextAIC));
      aiRow = Math.max(10, Math.min(90, nextAIR));

      if (aiMoving) {
        aiFrameAccumulator += 0.28;
        setFsAIFrame(Math.floor(aiFrameAccumulator / 0.5) % 4);
        setFsAIDirection(aiDir);
      }

      // --- PLAYER CHECKPOINTS AND LAP COUNTING ---
      if (cpActive === 1) {
        const d1 = Math.sqrt(Math.pow(15 - pCol, 2) + Math.pow(50 - pRow, 2));
        if (d1 < 16.0) {
          playSound('chime');
          cpActive = 2;
        }
      } else if (cpActive === 2) {
        const d2 = Math.sqrt(Math.pow(50 - pCol, 2) + Math.pow(85 - pRow, 2));
        if (d2 < 16.0) {
          playSound('chime');
          cpActive = 3;
        }
      } else if (cpActive === 3) {
        const d3 = Math.sqrt(Math.pow(85 - pCol, 2) + Math.pow(50 - pRow, 2));
        if (d3 < 16.0) {
          playSound('stadium');
          cpActive = 1;
          const lapTime = (Date.now() - lapStart) / 1000;
          lapStart = Date.now();
          setLastLapTime(lapTime);
          setShowLapComplete(true);
          
          if (bikingBestLap === 0 || lapTime < bikingBestLap) {
            setBikingBestLap(lapTime);
            unlockBadge("Speed Demon");
          }
          
          setPlayerLaps(l => {
            const nextL = l + 1;
            if (nextL >= 5) {
              setMotorbikeMatchEnd(true);
              isRaceEnded = true;
              setMotorbikeResult('VICTORY');
              clearInterval(timerInterval);
            }
            return nextL;
          });
          
          setDialogueText(`🏁 Lap Completed in ${lapTime.toFixed(1)}s! New Quest record!`);
          setTimeout(() => setShowLapComplete(false), 2000);
        }
      }

      // --- AI CHECKPOINTS AND LAP COUNTING ---
      if (aiCpActive === 1) {
        const d1 = Math.sqrt(Math.pow(15 - aiCol, 2) + Math.pow(50 - aiRow, 2));
        if (d1 < 10.0) aiCpActive = 2;
      } else if (aiCpActive === 2) {
        const d2 = Math.sqrt(Math.pow(50 - aiCol, 2) + Math.pow(85 - aiRow, 2));
        if (d2 < 10.0) aiCpActive = 3;
      } else if (aiCpActive === 3) {
        const d3 = Math.sqrt(Math.pow(85 - aiCol, 2) + Math.pow(50 - aiRow, 2));
        if (d3 < 10.0) {
          aiCpActive = 1;
          setAiLaps(l => {
            const nextL = l + 1;
            if (nextL >= 5) {
              setMotorbikeMatchEnd(true);
              isRaceEnded = true;
              setMotorbikeResult('DEFEAT');
              clearInterval(timerInterval);
            }
            return nextL;
          });
        }
      }
      
      setFsPlayerPos({ col: pCol, row: pRow });
      setFsAIBikePos({ col: aiCol, row: aiRow });
      setFsBikingCheckpoint(cpActive);
      
      animId = requestAnimationFrame(tick);
    };
    
    tick();
    
    return () => {
      cancelAnimationFrame(animId);
      clearInterval(countdownInterval);
      clearInterval(timerInterval);
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, [showFullscreenBiking, bikeSelected]);

  // Climbing QTE Game keydown input listener
  useEffect(() => {
    if (!showClimbingQTE || qteStatus !== 'playing') return;

    const handleQTEKeyDown = (e) => {
      const pressed = e.key.toLowerCase();
      // Map arrow keys as well for seamless accessibility
      let keyToCheck = pressed;
      if (e.key === 'ArrowUp') keyToCheck = 'w';
      else if (e.key === 'ArrowDown') keyToCheck = 's';
      else if (e.key === 'ArrowLeft') keyToCheck = 'a';
      else if (e.key === 'ArrowRight') keyToCheck = 'd';
      else if (e.key === ' ') keyToCheck = 'space';

      const target = qteKey.toLowerCase();
      
      if (keyToCheck === target) {
        // Success hit!
        playSound('chime');
        const nextProgress = qteProgress + 1;
        setQteProgress(nextProgress);
        
        if (nextProgress >= 5) {
          setQteStatus('success');
          unlockBadge("Climber Elite");
          setDialogueText("🧗 [Bouldering]: You scaled the entire V5 Bouldering Wall! Climber Elite badge unlocked!");
        } else {
          // select next random hold key
          const keysList = ['w', 'a', 's', 'd', 'e', 'space'];
          const nextRandom = keysList[Math.floor(Math.random() * keysList.length)];
          setQteKey(nextRandom);
        }
      } else {
        // Fail hit / penalty
        playSound('thump');
        setQteProgress(0);
        setQteStatus('fail');
        setTimeout(() => {
          setQteStatus('playing');
          // reset key
          const keysList = ['w', 'a', 's', 'd', 'e', 'space'];
          const nextRandom = keysList[Math.floor(Math.random() * keysList.length)];
          setQteKey(nextRandom);
        }, 1200);
      }
    };

    window.addEventListener('keydown', handleQTEKeyDown);
    return () => window.removeEventListener('keydown', handleQTEKeyDown);
  }, [showClimbingQTE, qteKey, qteProgress, qteStatus]);



  const handleCookFood = (item) => {
    playSound('chime');
    setCookingItem(item);
    setCookingProgress(0);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setCookingProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        
        // Consume food!
        playSound('gulp');
        setEnergyLevel(e => Math.min(100, e + 25)); // restore 25 energy!
        
        if (item.id === 'coffee') {
          setCaffeineTimer(15); // 15 seconds of Caffeine speed surge!
          setDialogueText("☕ Drank Hot Coffee! Restored +25 Stamina and gained CAFFEINE SURGE speed boost!");
        } else if (item.id === 'popcorn') {
          setDialogueText("🍿 Ate DBT Popcorn! Restored +25 Stamina. Smells absolutely buttery delicious!");
        } else if (item.id === 'shwarma') {
          setDialogueText("🌯 Ate Spicy Lebanese Shwarma! Restored +25 Stamina. Full of garlic flavor!");
        } else if (item.id === 'chaap') {
          setDialogueText("🍢 Ate Hot Soya Chaap! Restored +25 Stamina. Classic tandoori protein!");
        } else if (item.id === 'garlic-bread') {
          setDialogueText("🧄 Ate crispy Garlic Bread! Restored +25 Stamina. Warm, toasted, and buttery!");
        } else if (item.id === 'thumbs-up') {
          setDialogueText("🍾 Drank Thumbs Up! Restored +25 Stamina. Gained the ultimate glass bottle cola fizz!");
        }
        
        setCookingItem(null);
        setCookingProgress(0);
        setShowKitchen(false);
      }
    }, 80); // 800ms cooking time
  };

  const handleStartGame = () => {
    if (!customName.trim()) return;

    playSound('chime');
    
    // Set GameState contexts
    setPlayerName(customName);
    setPlayerClass(isCustomClassMode ? (customClass.trim() || "Adventurer") : selectedPresetClass);
    setPlayerStats(statsAlloc);
    setPlayerColors(customColors);

    setGameStarted(true);
    setTimeout(() => {
      window.focus();
    }, 50);
  };

  const submitGuestbookReview = () => {
    if (!guestbookText.trim()) return;
    addGuestbookEntry(playerName, playerClass, playerStats, playerColors, guestbookText);
    playSound('stadium');
    setDialogueText(`🪧 Guestbook Submitted! Pinned review to the Wall of Users!`);
    setGuestbookText("");
    setShowGuestbookSubmit(false);
  };

  const handleTriviaAnswer = (optionIdx) => {
    const currentQ = triviaQuestions[currentQuestionIdx];
    if (optionIdx === currentQ.ans) {
      playSound('chime');
      setTriviaResult('correct');
      const nextStreak = correctStreak + 1;
      setCorrectStreak(nextStreak);
      
      if (nextStreak >= 3) {
        unlockBadge("Manga Lore Master");
      }

      setTimeout(() => {
        if (currentQuestionIdx < triviaQuestions.length - 1) {
          setCurrentQuestionIdx(p => p + 1);
          setTriviaResult(null);
        } else {
          // Finished all trivia questions!
          setDialogueText("🕹️ Trivia Cabinet Defeated! You are a Manga Lore Master!");
          setShowTrivia(false);
        }
      }, 1000);
    } else {
      playSound('thump');
      setTriviaResult('wrong');
      setCorrectStreak(0);
      setTimeout(() => {
        setTriviaResult(null);
        setCurrentQuestionIdx(0); // reset
      }, 1200);
    }
  };

  const handleTileClick = (col, row) => {
    if (!gameStarted) return;
    if (isTileSolid(col, row)) {
      const adjacents = [
        { col: col - 1, row },
        { col: col + 1, row },
        { col, row: row - 1 },
        { col, row: row + 1 }
      ];
      const valid = adjacents.filter(a => !isTileSolid(a.col, a.row));
      if (valid.length > 0) {
        let best = valid[0];
        let bestDist = Infinity;
        valid.forEach(v => {
          const d = Math.sqrt(Math.pow(v.col - playerCoords.current.col, 2) + Math.pow(v.row - playerCoords.current.row, 2));
          if (d < bestDist) {
            bestDist = d;
            best = v;
          }
        });
        clickTarget.current = best;
      }
    } else {
      clickTarget.current = { col, row };
    }
  };

  const tiles = [];
  for (let r = 0; r < MAP_ROWS; r++) {
    for (let c = 0; c < MAP_COLS; c++) {
      const type = getTileType(c, r);
      tiles.push({ col: c, row: r, type });
    }
  }

  // --- RENDERING COZY CHARACTER CUSTOMIZER STARTUP SCREEN ---
  if (!gameStarted) {
    const skinColors = ['#ffdbac', '#ffb6c1', '#e0ac69', '#c68642', '#8d5524'];
    const hairColors = ['#8a2be2', '#000000', '#ffffff', '#e53935', '#ff8c00', '#ffd700', '#43a047', '#1e88e5', '#ff69b4'];
    const shirtColors = ['#1e88e5', '#e53935', '#43a047', '#ffd700', '#8a2be2', '#00e5ff', '#ff8c00', '#ffffff', '#222222'];
    const pantsColors = ['#ffd700', '#1e88e5', '#777777', '#8b4513', '#222222', '#e53935'];
    const faceStyles = [
      { id: 'classic', label: '😊 Classic' },
      { id: 'glasses', label: '👓 Specs' },
      { id: 'visor', label: '🕶️ Visor' },
      { id: 'cute', label: '🌸 Blush' }
    ];
    const presetClasses = ['Avid Backpacker', 'Rookie Climber', 'Chaotic Explorer'];

    // Dynamic dynamic class based on stats in Customizer
    const getCustomizerClass = () => {
      if (isCustomClassMode) return customClass.trim() || "Adventurer";
      return selectedPresetClass;
    };

    return (
      <div 
        style={{
          width: '100%',
          minHeight: '100%',
          background: '#040408',
          backgroundImage: 'radial-gradient(circle at 50% 50%, #15152a 0%, #040408 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '30px 15px',
          boxSizing: 'border-box',
          position: 'relative',
          overflowY: 'auto'
        }}
      >
        <div className="crt-scanline" style={{ pointerEvents: 'none' }} />

        {/* Top Header Title */}
        <header style={{ textAlign: 'center', marginBottom: '25px', zIndex: 10 }}>
          <h2 className="pixel-header" style={{ fontSize: '1.25rem', color: 'var(--rpg-highlight)', margin: '0 0 8px 0', textShadow: '0 0 12px rgba(0,255,255,0.6)' }}>
            🎮 JOIN RAGHAV'S COZY WORLD
          </h2>
          <p className="pixel-text" style={{ fontSize: '1.25rem', color: '#888', margin: 0, letterSpacing: '0.5px' }}>
            Welcome to my internet room! Customize your retro avatar to enter my personal diary space.
          </p>
        </header>

        {/* Double Column Main Layout (Highly Mobile-Responsive with flexWrap) */}
        <div style={{ 
          display: 'flex', 
          gap: '24px', 
          width: '100%', 
          maxWidth: '920px', 
          flexWrap: 'wrap', 
          justifyContent: 'center', 
          zIndex: 10 
        }}>
          
          {/* COLUMN 1: Live Avatar Preview & Identity Card */}
          <div style={{ 
            flex: '1 1 340px', 
            maxWidth: '430px', 
            background: 'rgba(15, 15, 28, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '3px solid rgba(0, 255, 255, 0.25)',
            borderRadius: '16px',
            boxShadow: '0 0 25px rgba(0, 255, 255, 0.15)',
            padding: '20px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            
            {/* Live 8-Bit CRT Preview Screen */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div 
                style={{ 
                  width: '120px', 
                  height: '120px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  background: '#020205', 
                  border: '3px solid var(--rpg-highlight)', 
                  borderRadius: '12px',
                  boxShadow: '0 0 15px rgba(0, 255, 255, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div className="crt-scanline" style={{ pointerEvents: 'none' }} />
                <div style={{ width: '72px', height: '72px', imageRendering: 'pixelated' }}>
                  <Sprite direction="down" frame={Math.floor(Date.now() / 250) % 4} customColors={customColors} />
                </div>
              </div>
              <span className="pixel-header" style={{ fontSize: '0.62rem', color: '#ffb700' }}>
                CLASS: {getCustomizerClass().toUpperCase()}
              </span>
            </div>

            {/* Explorer Name Field */}
            <div>
              <label className="pixel-header" style={{ fontSize: '0.68rem', color: 'var(--rpg-text)', display: 'block', marginBottom: '6px' }}>
                ✍️ EXPLORER NAME:
              </label>
              <input 
                type="text" 
                value={customName} 
                onChange={(e) => setCustomName(e.target.value.slice(0, 14))}
                className="pixel-text"
                placeholder="Enter Name..."
                style={{
                  background: '#020205',
                  border: '3px solid var(--rpg-text)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '1.4rem',
                  padding: '6px 12px',
                  width: '100%',
                  textAlign: 'center',
                  outline: 'none',
                  boxSizing: 'border-box',
                  boxShadow: 'inset 0 0 6px rgba(0,255,102,0.1)'
                }}
              />
            </div>

            {/* Explorer Class & Custom option */}
            <div>
              <label className="pixel-header" style={{ fontSize: '0.68rem', color: 'var(--rpg-text)', display: 'block', marginBottom: '6px' }}>
                🛡️ CHOOSE YOUR ADVENTURE CLASS:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  {presetClasses.map(cls => (
                    <button 
                      key={cls}
                      onClick={() => {
                        playSound('chime');
                        setSelectedPresetClass(cls);
                        setIsCustomClassMode(false);
                      }}
                      className="pixel-header"
                      style={{
                        background: (!isCustomClassMode && selectedPresetClass === cls) ? 'var(--rpg-text)' : '#05050a',
                        color: (!isCustomClassMode && selectedPresetClass === cls) ? '#000' : '#888',
                        border: '2px solid var(--rpg-text)',
                        borderRadius: '4px',
                        padding: '8px 2px',
                        cursor: 'pointer',
                        fontSize: '0.52rem',
                        transition: 'all 0.15s'
                      }}
                    >
                      {cls.split(' ')[1] || cls}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => {
                    playSound('chime');
                    setIsCustomClassMode(true);
                  }}
                  className="pixel-header"
                  style={{
                    background: isCustomClassMode ? 'var(--rpg-accent)' : '#05050a',
                    color: '#fff',
                    border: '2px solid var(--rpg-accent)',
                    borderRadius: '4px',
                    padding: '8px 0',
                    cursor: 'pointer',
                    fontSize: '0.6rem'
                  }}
                >
                  ✏️ WRITE CUSTOM CLASS
                </button>

                {isCustomClassMode && (
                  <input
                    type="text"
                    value={customClass}
                    onChange={(e) => setCustomClass(e.target.value.slice(0, 16))}
                    className="pixel-text"
                    placeholder="Enter custom class title..."
                    style={{
                      background: '#020205',
                      border: '2px solid var(--rpg-accent)',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '1.25rem',
                      padding: '5px 10px',
                      width: '100%',
                      boxSizing: 'border-box',
                      outline: 'none',
                      textAlign: 'center',
                      animation: 'pulse-glow 0.8s infinite alternate'
                    }}
                  />
                )}
              </div>
            </div>

          </div>

          {/* COLUMN 2: Visual presets and Attributes allocations */}
          <div style={{ 
            flex: '1.2 1 400px', 
            maxWidth: '520px',
            background: 'rgba(15, 15, 28, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '3px solid rgba(0, 255, 255, 0.25)',
            borderRadius: '16px',
            boxShadow: '0 0 25px rgba(0, 255, 255, 0.15)',
            padding: '20px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            
            {/* Visual presets row (gender & face accessories grouped) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              
              {/* Gender choices */}
              <div className="rpg-box" style={{ padding: '8px', background: '#020205', borderRadius: '8px', borderColor: '#333' }}>
                <span className="pixel-header" style={{ fontSize: '0.52rem', display: 'block', marginBottom: '5px', color: 'var(--rpg-highlight)' }}>🙋 HAIR / GENDER:</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    onClick={() => setSpriteGender('male')}
                    className="pixel-header"
                    style={{
                      flex: 1,
                      background: spriteGender === 'male' ? 'var(--rpg-text)' : '#111',
                      color: spriteGender === 'male' ? '#000' : '#fff',
                      border: '2.5px solid var(--rpg-text)',
                      padding: '4px 0',
                      cursor: 'pointer',
                      fontSize: '0.52rem',
                      borderRadius: '4px'
                    }}
                  >
                    ♂️ Spike
                  </button>
                  <button 
                    onClick={() => setSpriteGender('female')}
                    className="pixel-header"
                    style={{
                      flex: 1,
                      background: spriteGender === 'female' ? 'var(--rpg-text)' : '#111',
                      color: spriteGender === 'female' ? '#000' : '#fff',
                      border: '2.5px solid var(--rpg-text)',
                      padding: '4px 0',
                      cursor: 'pointer',
                      fontSize: '0.52rem',
                      borderRadius: '4px'
                    }}
                  >
                    ♀️ Locks
                  </button>
                </div>
              </div>

              {/* Face Accessories */}
              <div className="rpg-box" style={{ padding: '8px', background: '#020205', borderRadius: '8px', borderColor: '#333' }}>
                <span className="pixel-header" style={{ fontSize: '0.52rem', display: 'block', marginBottom: '5px', color: 'var(--rpg-highlight)' }}>🕶️ FACE STYLE:</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
                  {faceStyles.map(style => (
                    <button 
                      key={style.id}
                      onClick={() => setFaceStyle(style.id)}
                      className="pixel-header"
                      style={{
                        background: faceStyle === style.id ? 'var(--rpg-accent)' : '#111',
                        color: '#fff',
                        border: `1.5px solid ${faceStyle === style.id ? 'var(--rpg-accent)' : '#444'}`,
                        padding: '3px 0',
                        cursor: 'pointer',
                        fontSize: '0.5rem',
                        borderRadius: '3px'
                      }}
                    >
                      {style.label.split(' ')[1] || style.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Colors customizers (Skin, shirt, pants presets) */}
            <div className="rpg-box" style={{ padding: '10px', background: '#020205', borderRadius: '8px', borderColor: '#333', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="pixel-header" style={{ fontSize: '0.52rem', color: 'var(--rpg-highlight)' }}>👗 APPAREL PALETTE CUSTOMIZER:</span>
              
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <span className="pixel-header" style={{ fontSize: '0.45rem', color: '#888', width: '60px' }}>🤚 SKIN:</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {skinColors.map(color => (
                    <div 
                      key={color}
                      onClick={() => setSelectedSkinColor(color)}
                      style={{
                        width: '20px', height: '20px', background: color, borderRadius: '50%', cursor: 'pointer',
                        border: `2px solid ${selectedSkinColor === color ? '#ffffff' : '#000'}`
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <span className="pixel-header" style={{ fontSize: '0.45rem', color: '#888', width: '60px' }}>🧢 HAT/HAIR:</span>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  {hairColors.map(color => (
                    <div 
                      key={color} 
                      onClick={() => setSelectedHatColor(color)}
                      style={{ width: '13px', height: '13px', background: color, border: selectedHatColor === color ? '1.5px solid #fff' : '1px solid #000', cursor: 'pointer' }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <span className="pixel-header" style={{ fontSize: '0.45rem', color: '#888', width: '60px' }}>👕 SHIRT:</span>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  {shirtColors.map(color => (
                    <div 
                      key={color} 
                      onClick={() => setSelectedShirtColor(color)}
                      style={{ width: '13px', height: '13px', background: color, border: selectedShirtColor === color ? '1.5px solid #fff' : '1px solid #000', cursor: 'pointer' }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <span className="pixel-header" style={{ fontSize: '0.45rem', color: '#888', width: '60px' }}>👖 PANTS:</span>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  {pantsColors.map(color => (
                    <div 
                      key={color} 
                      onClick={() => setSelectedPantsColor(color)}
                      style={{ width: '13px', height: '13px', background: color, border: selectedPantsColor === color ? '1.5px solid #fff' : '1px solid #000', cursor: 'pointer' }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Attributes stats allocations (Willpower replacing Intellect) */}
            <div className="rpg-box" style={{ padding: '12px', background: '#020205', borderRadius: '8px', borderColor: 'var(--rpg-text)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #222', paddingBottom: '4px', marginBottom: '8px' }}>
                <span className="pixel-header" style={{ fontSize: '0.52rem', color: 'var(--rpg-text)' }}>⚔️ DISTRIBUTE STAT POINTS:</span>
                <span className="pixel-header animate-bob" style={{ fontSize: '0.52rem', color: 'var(--rpg-highlight)' }}>POOL: {pointsPool} PTS LEFT</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '1.25rem' }}>
                {[
                  { id: 'stamina', title: '💪 STAMINA', color: '#ff3d00' },
                  { id: 'curiosity', title: '🔍 CURIOSITY', color: '#8a2be2' },
                  { id: 'reflexes', title: '⚡ REFLEXES', color: '#00ff66' },
                  { id: 'intellect', title: '🧠 WILLPOWER', color: '#00ffff' }
                ].map(stat => (
                  <div key={stat.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="pixel-header" style={{ fontSize: '0.48rem', width: '85px', color: '#aaa' }}>{stat.title}:</span>
                    <button 
                      onClick={() => adjustStat(stat.id, -1)}
                      style={{ width: '22px', height: '22px', background: '#222', border: '1.5px solid #555', color: '#fff', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      -
                    </button>
                    <div style={{ flex: 1, height: '8px', background: '#111', position: 'relative' }}>
                      <div style={{ width: `${(statsAlloc[stat.id] / 15) * 100}%`, height: '100%', background: stat.color }} />
                    </div>
                    <span style={{ width: '25px', textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>{statsAlloc[stat.id]}</span>
                    <button 
                      onClick={() => adjustStat(stat.id, 1)}
                      style={{ width: '22px', height: '22px', background: '#222', border: '1.5px solid #555', color: '#fff', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Start Game Action Button */}
        <button
          onClick={handleStartGame}
          className="pixel-header animate-bob"
          style={{
            marginTop: '25px',
            background: 'var(--rpg-accent)',
            color: '#fff',
            border: '4px solid #000',
            borderRadius: '8px',
            padding: '12px 36px',
            fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: '3px 3px 0 #000',
            outline: 'none',
            zIndex: 10
          }}
        >
          🎮 ENTER COZY ROOM [A]
        </button>

      </div>
    );
  }

  // --- RENDERING FULL GAME BOARD PLAY SCREEN ---
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', position: 'relative' }}>
      
      {/* Audio toggle button top-right in game area */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsAudioEnabled(!isAudioEnabled);
          playSound('chime');
        }}
        className="pixel-text"
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 15,
          background: 'var(--rpg-box-bg)',
          color: isAudioEnabled ? 'var(--rpg-text)' : '#777',
          border: '2px solid var(--rpg-text)',
          padding: '4px 8px',
          fontSize: '1.2rem',
          cursor: 'pointer'
        }}
      >
        🔊 {isAudioEnabled ? "SOUND: ON" : "SOUND: MUTED"}
      </button>

      {/* Flashing GOAL!!! Retro Overlay */}
      {showGoalFlash && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 100,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 99,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <h1 className="pixel-header" style={{
            fontSize: '3rem',
            color: 'var(--rpg-highlight)',
            textShadow: '0 0 15px var(--rpg-accent), 0 0 30px var(--rpg-highlight)',
            margin: 0,
            animation: 'scale-up-goal 0.15s infinite alternate'
          }}>
            ⚽ GOAL!!!
          </h1>
          <p className="pixel-header" style={{ fontSize: '1.1rem', color: '#00ff66', marginTop: '10px' }}>
            +1 STADIUM CHEERS GAINED!
          </p>
        </div>
      )}

      {/* Flashing Biking LAP COMPLETE!!! Retro Overlay */}
      {showLapComplete && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 100,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 99,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <h1 className="pixel-header" style={{
            fontSize: '2.5rem',
            color: 'var(--rpg-highlight)',
            textShadow: '0 0 15px var(--rpg-highlight)',
            margin: 0
          }}>
            🚲 LAP COMPLETED!
          </h1>
          <p className="pixel-header" style={{ fontSize: '1.2rem', color: '#fff', marginTop: '10px' }}>
            Time: {lastLapTime.toFixed(1)} seconds
          </p>
        </div>
      )}

      {/* Grid Canvas */}
      <div 
        className="map-grid"
        style={{
          gridTemplateColumns: `repeat(${MAP_COLS}, 1fr)`,
          gridTemplateRows: `repeat(${MAP_ROWS}, 1fr)`,
          flex: 1
        }}
      >
        {tiles.map((t, idx) => {
          let bg = 'var(--rpg-box-bg)';
          let content = null;
          let glow = 'none';
          const borderStyle = {};

          if (t.type === 'grass') bg = '#100d0a'; // Warm dark mahogany floor
          else if (t.type === 'forest-floor') {
            bg = '#0d130f'; // Dark forest moss
            borderStyle.boxShadow = 'inset 0 0 8px rgba(0, 255, 102, 0.03)';
            if ((t.col + t.row) % 7 === 0) content = <span style={{ fontSize: '0.85rem', opacity: 0.2 }}>🍄</span>;
            else if ((t.col + t.row) % 5 === 0) content = <span style={{ fontSize: '0.9rem', opacity: 0.15 }}>🌿</span>;
            else if ((t.col + t.row) % 9 === 0) content = <span style={{ fontSize: '0.8rem', opacity: 0.1 }}>🌸</span>;
          }
          else if (t.type === 'climbing-pad') {
            bg = '#2b2a2e'; // Premium graphite/charcoal climbing pad (no more out-of-place blue!)
            borderStyle.border = '1.5px solid rgba(255,255,255,0.05)';
            if ((t.col + t.row) % 4 === 0) content = <span style={{ fontSize: '0.65rem', opacity: 0.12 }}>🧗</span>;
          }
          else if (t.type === 'garage-floor') {
            bg = (t.col + t.row) % 2 === 0 ? '#262629' : '#1e1e21'; // Checker metallic mat
            borderStyle.border = '1px solid rgba(255, 235, 59, 0.04)';
            borderStyle.boxShadow = 'inset 0 0 5px rgba(255, 235, 59, 0.05)';
            if ((t.col === 10 || t.col === 12) && t.row === 12) {
              borderStyle.borderTop = '2px solid rgba(255, 235, 59, 0.3)';
            }
          }
          else if (t.type === 'path') bg = '#332722'; // Warm sandy gravel path
          else if (t.type === 'dirt') bg = '#21170f'; 
          else if (t.type === 'rug') bg = '#421d22'; // Cozy burgundy crimson velvet rug 
          
          // Outer Boundary Walls (Purple Steel Brick with bold gold trim stripes!)
          else if (t.type === 'wall-top') {
            bg = '#4e3344'; 
            borderStyle.borderBottom = '4px solid #ffd700'; 
            borderStyle.boxShadow = 'inset 0 -3px 8px rgba(0,0,0,0.8)';
          }
          else if (t.type === 'wall-bottom') {
            bg = '#2a1a24';
            borderStyle.borderTop = '4px solid #ffd700';
            borderStyle.boxShadow = 'inset 0 3px 8px rgba(0,0,0,0.8)';
            if (t.col === 11) {
              // Glowing Neon wall sign for Bike Garage!
              content = (
                <div style={{
                  color: '#ff1744',
                  textShadow: '0 0 8px #ff1744, 0 0 15px #ff1744',
                  fontSize: '0.48rem',
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                  animation: 'pulse-glow 1.2s infinite alternate',
                  background: '#111',
                  padding: '2px 4px',
                  border: '1.5px solid #ff1744',
                  borderRadius: '2px',
                  boxShadow: '0 0 5px #ff1744'
                }}>
                  GARAGE
                </div>
              );
            }
          }
          else if (t.type === 'wall-side') {
            bg = '#2d1f2b';
            if (t.col === 0) borderStyle.borderRight = '4px solid #ffd700';
            else borderStyle.borderLeft = '4px solid #gold';
            borderStyle.boxShadow = t.col === 0 ? 'inset -3px 0 8px rgba(0,0,0,0.8)' : 'inset 3px 0 8px rgba(0,0,0,0.8)';
            if (t.col === MAP_COLS - 1) {
              borderStyle.borderLeft = '4px solid #ffd700';
            }
          }
          
          // ⚽ Soccer turf field with chalk lines
          else if (t.type === 'soccer-turf') {
            bg = '#143618';
            if (t.col === 14) borderStyle.borderLeft = '2px solid rgba(255,255,255,0.4)';
            if (t.col === 18) borderStyle.borderRight = '2px solid rgba(255,255,255,0.4)';
            if (t.row === 10) borderStyle.borderTop = '2px solid rgba(255,255,255,0.4)';
            if (t.row === 13) borderStyle.borderBottom = '2px solid rgba(255,255,255,0.4)';
          }
          // 📚 Manga tatami lounge floor
          else if (t.type === 'manga-lounge') {
            bg = '#5e4d37'; // Authentic cozy straw-gold tatami mat
            borderStyle.borderRight = '1px solid rgba(212,175,55,0.2)';
            borderStyle.borderBottom = '1px solid rgba(212,175,55,0.2)';
            if (t.col === 16 && t.row === 3) {
              // Plop a cozy giant plush bean bag onto the tatami mat!
              content = <div style={{ width: '40px', height: '40px', zIndex: 3 }}><PixelProp type="beanbag" /></div>;
            }
          }
          // 3. 🍔 "Raghav's Diner" cyber bistro (warm terracotta checkers!)
          else if (t.type === 'restaurant-floor') {
            bg = (t.col + t.row) % 2 === 0 ? '#381e1d' : '#1f0e0d';
            borderStyle.border = '1px solid rgba(255, 235, 59, 0.04)';
          }
          // Solid diner table counter table
          else if (t.type === 'diner-table') {
            bg = '#5c3a21'; // rich mahogany wood counter
            borderStyle.border = '2px solid #8d6e63';
            borderStyle.boxShadow = '0 3px 6px rgba(0,0,0,0.6)';
            content = <span style={{ fontSize: '1.2rem' }}>🪵</span>;
          }
          // 🧗 Bouldering Rock Wall
          else if (t.type === 'bouldering-wall') {
            bg = '#4a4a52';
          }

          // 16-Bit Pixel Props Vector Rendering!
          else if (t.type === 'bed') {
            if (t.col === 1 && t.row === 1) content = <div style={{ width: '80px', height: '80px', position: 'absolute', top: 0, left: 0, zIndex: 5 }}><PixelProp type="bed" /></div>;
          }
          else if (t.type === 'bookshelf') {
            if (t.col === 17 && t.row === 1) content = <div style={{ width: '80px', height: '40px', position: 'absolute', top: 0, left: 0, zIndex: 5 }}><PixelProp type="bookshelf" /></div>;
          }
          
          else if (t.type === 'suitcase') {
            content = <div style={{ width: '40px', height: '40px', zIndex: 5 }}><PixelProp type="suitcase" /></div>;
          }
          else if (t.type === 'campfire') {
            content = <div style={{ width: '40px', height: '40px', zIndex: 5 }}><PixelProp type="campfire" /></div>;
          }
          
          else if (t.type === 'goalpost') {
            let subtype = 'goalpost-mid';
            if (t.row === 10) subtype = 'goalpost-top';
            if (t.row === 12) subtype = 'goalpost-bottom';
            content = <div style={{ width: '40px', height: '40px', zIndex: 5 }}><PixelProp type={subtype} /></div>;
          }
          else if (t.type === 'cone') {
            content = <div style={{ width: '30px', height: '30px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🚩</div>;
          }
          
          else if (t.type === 'bulletin') {
            content = <div style={{ width: '40px', height: '40px' }}><PixelProp type="bulletin" /></div>;
          }
          else if (t.type === 'bike') {
            content = <div style={{ width: '40px', height: '40px' }}><PixelProp type="bike" /></div>;
          }
          else if (t.type === 'projector') {
            content = <div style={{ width: '40px', height: '40px' }}><PixelProp type="projector" /></div>;
          }

          else if (t.type === 'bouldering-wall') {
            content = <PixelProp type="bouldering-wall" />;
          }

          else if (t.type.startsWith('obstacle-')) {
            const objId = t.type.split('-')[1];
            const obj = INTERACTABLE_OBJECTS.find(o => o.id === objId);
            bg = t.type.includes('profile') ? '#1c1c28' : t.type.includes('football') ? '#143618' : (t.type.includes('bookshelf') || t.type.includes('cd_shelf')) ? '#5e4d37' : t.type.includes('trekking') ? '#0d130f' : t.type.includes('kitchen') ? '#19131c' : '#1c1c28';
            glow = 'none';
            
            if (objId === 'kitchen') {
              if (t.col === 6) content = <div style={{ width: '40px', height: '40px' }}><PixelProp type="stove" /></div>;
              else if (t.col === 7) content = <div style={{ width: '40px', height: '40px' }}><PixelProp type="kitchen-counter" /></div>;
              else if (t.col === 8) content = <div style={{ width: '40px', height: '40px' }}><PixelProp type="fridge" /></div>;
            }
            else if (objId === 'trekking') {
              content = <div style={{ width: '40px', height: '40px' }}><PixelProp type="travel-table" /></div>;
            }
            else if (objId === 'toolbox') {
              content = <div style={{ width: '40px', height: '40px' }}><PixelProp type="toolbox" /></div>;
            }
            else if (objId === 'hangboard') {
              content = <div style={{ width: '40px', height: '40px' }}><PixelProp type="hangboard" /></div>;
            }
            else if (objId === 'tacticboard') {
              content = <div style={{ width: '40px', height: '40px' }}><PixelProp type="tacticboard" /></div>;
            }
            else if (objId === 'bookshelf') {
              content = <div style={{ width: '40px', height: '40px', zIndex: 5 }}><PixelProp type="bookshelf" /></div>;
            }
            else if (objId === 'cd_shelf') {
              content = <div style={{ width: '40px', height: '40px', zIndex: 5 }}><PixelProp type="cd_shelf" /></div>;
            }
            else if (objId === 'bouldering') {
              content = <div style={{ width: '40px', height: '40px' }}><PixelProp type="bouldering-wall" /></div>;
            }
            else {
              const centerCell = obj?.cells[0];
              if (centerCell && centerCell.col === t.col && centerCell.row === t.row) {
                content = (
                  <div style={{ fontSize: '1.8rem', zIndex: 2, filter: 'drop-shadow(0 0 4px #000)' }}>
                    {obj.id === 'profile' ? null : 
                     obj.id === 'football' ? null : 
                     obj.symbol}
                  </div>
                );
              }
            }
          }

          const isInteractableNearby = nearObject && t.type === `obstacle-${nearObject.id}`;
          
          // Y-SORTING DEPTH ENGINE: Dynamic Stacking Contexts
          const isSolidObstacle = isTileSolid(t.col, t.row);
          const tileZIndex = isSolidObstacle ? (Math.floor(t.row * 10) + 5) : 1;

          return (
            <div 
              key={idx}
              onClick={() => handleTileClick(t.col, t.row)}
              style={{
                backgroundColor: bg,
                border: t.type.includes('wall') ? '1px solid #111' : '1px solid rgba(255,255,255,0.02)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                zIndex: tileZIndex,
                boxShadow: glow,
                animation: isInteractableNearby ? 'pulse-glow 1.5s infinite alternate' : 'none',
                ...borderStyle
              }}
            >
              {content}

              {/* Central Rug custom border design */}
              {t.type === 'rug' && (t.col === 5 || t.col === 13 || t.row === 5 || t.row === 9) && (
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, border: '2px solid #ffd700', opacity: 0.5, boxShadow: '0 0 10px rgba(255, 215, 0, 0.4)' }} />
              )}

              {/* Render Biking Checkpoint Loop post flags */}
              {isRiding && activeCheckpoint.current === 1 && t.col === 2 && t.row === 10 && (
                <div style={{ width: '32px', height: '32px', position: 'absolute', zIndex: 6 }}><PixelProp type="checkpoint" /></div>
              )}
              {isRiding && activeCheckpoint.current === 2 && t.col === 11 && t.row === 11 && (
                <div style={{ width: '32px', height: '32px', position: 'absolute', zIndex: 6 }}><PixelProp type="checkpoint" /></div>
              )}
              {isRiding && activeCheckpoint.current === 3 && t.col === 17 && t.row === 9 && (
                <div style={{ width: '32px', height: '32px', position: 'absolute', zIndex: 6 }}><PixelProp type="checkpoint" /></div>
              )}
            </div>
          );
        })}

        {/* Raghav's Cyber Diner counter food pickups */}
        {dinerFoods.map((food, idx) => (
          <div 
            key={idx}
            style={{
              position: 'absolute',
              left: `${(food.col / MAP_COLS) * 100}%`,
              top: `${(food.row / MAP_ROWS) * 100}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 8,
              width: '28px',
              height: '28px'
            }}
          >
            <PixelProp type={food.type} />
          </div>
        ))}

        {/* Kickable overworld lobby soccer ball */}
        <div 
          style={{
            position: 'absolute',
            left: `${(ballPos.col / MAP_COLS) * 100}%`,
            top: `${(ballPos.row / MAP_ROWS) * 100}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: Math.floor(ballPos.row * 10) + 4,
            width: '24px',
            height: '24px',
            pointerEvents: 'none'
          }}
        >
          <PixelProp type="ball" />
        </div>



        {/* Raghav Animated NPC (Signature developer candidate standing at col 5, row 5) */}
        <div 
          style={{
            position: 'absolute',
            left: `${(5 / MAP_COLS) * 100}%`,
            top: `${(5 / MAP_ROWS) * 100}%`,
            transform: 'translate(-50%, -60%)',
            zIndex: Math.floor(5 * 10) + 5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '45px',
            height: '45px'
          }}
        >
          <Sprite 
            direction={raghavDirection} 
            frame={Math.floor(Date.now() / 250) % 4} 
            customColors={raghavColors} 
          />
        </div>



        {/* Custom Player Avatar Sprite */}
        <div 
          style={{
            position: 'absolute',
            left: `${(playerPos.col / MAP_COLS) * 100}%`,
            top: `${(playerPos.row / MAP_ROWS) * 100}%`,
            transform: 'translate(-50%, -60%)',
            zIndex: Math.floor(playerPos.row * 10) + 5,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '45px',
            height: '45px',
            transition: 'none'
          }}
        >
          {nearObject && (
            <div 
              className="pixel-header animate-bob"
              style={{
                position: 'absolute',
                top: '-45px',
                background: 'var(--rpg-accent)',
                color: '#fff',
                border: '2px solid #000',
                padding: '3px 8px',
                fontSize: '0.7rem',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 0 #000',
                zIndex: 15
              }}
            >
              [E] {nearObject.inspectPrompt || "INSPECT"}
            </div>
          )}

          {/* Glowing coffee cup power-up overlay if speed buff is active! */}
          {caffeineTimer > 0 && (
            <div 
              className="pixel-header"
              style={{
                position: 'absolute',
                top: '-20px',
                background: 'var(--rpg-highlight)',
                color: '#000',
                border: '1.5px solid #000',
                padding: '2px 4px',
                fontSize: '0.55rem',
                borderRadius: '2px',
                whiteSpace: 'nowrap',
                zIndex: 14
              }}
            >
              ☕ BUFF: {caffeineTimer}s
            </div>
          )}

          {/* Render small bike beneath player if isRiding is true! */}
          {isRiding && (
            <div style={{ width: '40px', height: '40px', position: 'absolute', bottom: '-8px', zIndex: 9 }}>
              <PixelProp type="bike" />
            </div>
          )}
          
          <Sprite direction={direction} frame={frame} customColors={customColors} />
        </div>

      </div>

      {/* Classic Retro RPG Dialogue Box (always visible to prevent layout shifts) */}
      <div 
        style={{
          height: '100px',
          background: '#000',
          borderTop: '6px solid var(--rpg-text)',
          boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.8)',
          padding: '12px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 12
        }}
      >
        <span 
          className="pixel-header" 
          style={{ 
            fontSize: '0.8rem', 
            color: nearObject ? nearObject.color : 'var(--rpg-highlight)', 
            marginBottom: '6px',
            textTransform: 'uppercase'
          }}
        >
          {nearObject ? `📍 ${nearObject.title}` : `🏡 Cozy Space`}
        </span>
        <p 
          className="pixel-text typing-cursor" 
          style={{ 
            margin: 0, 
            fontSize: '1.4rem', 
            lineHeight: '1.4', 
            color: '#fff',
            whiteSpace: 'normal',
            wordWrap: 'break-word'
          }}
        >
          {displayedText}
        </p>

        {nearObject && (
          <button
            onClick={() => {
              keysPressed.current['e'] = true;
            }}
            className="pixel-header"
            style={{
              position: 'absolute',
              right: '20px',
              bottom: '15px',
              background: 'var(--rpg-accent)',
              color: '#fff',
              border: '3px solid #000',
              padding: '6px 12px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              boxShadow: '2px 2px 0 #000'
            }}
          >
            ACTION [A]
          </button>
        )}
      </div>

      {/* --- POPUP MODAL OVERLAYS --- */}

      {/* A. 🕹️ Manga Trivia Cabinet Arcade Multiple-Choice Game */}
      {showTrivia && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.9)',
          zIndex: 150,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="rpg-box" style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '15px', borderColor: 'var(--rpg-highlight)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid var(--rpg-highlight)', paddingBottom: '8px' }}>
              <span className="pixel-header" style={{ fontSize: '0.9rem', color: 'var(--rpg-highlight)' }}>🕹️ MANGA ARCADE CABINET</span>
              <span className="pixel-header" style={{ fontSize: '0.9rem' }}>Streak: {correctStreak}</span>
            </div>

            <p className="pixel-text" style={{ fontSize: '1.4rem', color: '#888', margin: 0 }}>
              Question {currentQuestionIdx + 1} of 3:
            </p>
            <p className="pixel-header" style={{ fontSize: '0.9rem', color: '#fff', margin: 0, lineHeight: '1.4' }}>
              {triviaQuestions[currentQuestionIdx].q}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              {triviaQuestions[currentQuestionIdx].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTriviaAnswer(idx)}
                  className="pixel-text"
                  style={{
                    background: '#000',
                    color: 'var(--rpg-text)',
                    border: '2px solid var(--rpg-text)',
                    padding: '10px',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  {idx + 1}. {opt}
                </button>
              ))}
            </div>

            {/* Answer Result Banner */}
            {triviaResult === 'correct' && (
              <div style={{ background: '#1b3c1a', color: '#00ff66', padding: '8px', textAlign: 'center', fontSize: '1.2rem' }}>
                🎉 CORRECT!
              </div>
            )}
            {triviaResult === 'wrong' && (
              <div style={{ background: '#4a1515', color: '#ff0000', padding: '8px', textAlign: 'center', fontSize: '1.2rem' }}>
                ❌ WRONG! Resetting streak.
              </div>
            )}

            <button 
              onClick={() => setShowTrivia(false)} 
              className="pixel-header"
              style={{ alignSelf: 'flex-end', background: 'var(--rpg-accent)', color: '#fff', border: '2px solid #000', padding: '5px 15px', cursor: 'pointer', fontSize: '0.75rem' }}
            >
              QUIT GAME [B]
            </button>
          </div>
        </div>
      )}

      {/* B. 📽️ Polaroid Projector Full-screen Media Carousel */}
      {showCarousel && (
        <div 
          onClick={() => setShowCarousel(false)}
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.92)',
            zIndex: 150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="rpg-box"
            style={{ 
              width: '100%', 
              maxWidth: '600px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '15px', 
              borderColor: 'var(--rpg-highlight)',
              position: 'relative'
            }}
          >
            {/* Projector Lens light reflection overlay shader */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 80%)',
              pointerEvents: 'none'
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid var(--rpg-highlight)', paddingBottom: '8px' }}>
              <span className="pixel-header" style={{ fontSize: '0.9rem', color: 'var(--rpg-highlight)' }}>📽️ PHOTO PROJECTOR CAROUSEL</span>
              <button 
                onClick={() => setShowCarousel(false)}
                className="pixel-header" 
                style={{ background: 'var(--rpg-accent)', color: '#fff', border: '2px solid #000', padding: '3px 8px', fontSize: '0.7rem', cursor: 'pointer' }}
              >
                CLOSE [B]
              </button>
            </div>

            {/* Slider image with high resolution and vintage scanline filter */}
            <div style={{ position: 'relative', width: '100%', height: '280px', border: '4px solid #111', background: '#000', overflow: 'hidden' }}>
              <img 
                src={polaroids[carouselIdx].src} 
                alt="Projected slide" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(1.1) contrast(1.05)' }}
              />
              {/* Scanline shader overlay inside picture */}
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)',
                backgroundSize: '100% 4px',
                pointerEvents: 'none'
              }} />
            </div>

            <p className="pixel-text" style={{ fontSize: '1.4rem', color: '#fff', margin: 0, textAlign: 'center', minHeight: '40px' }}>
              {polaroids[carouselIdx].caption}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button 
                onClick={() => setCarouselIdx(p => (p === 0 ? polaroids.length - 1 : p - 1))}
                className="pixel-header"
                style={{ background: '#000', color: 'var(--rpg-text)', border: '2px solid var(--rpg-text)', padding: '8px 15px', cursor: 'pointer', fontSize: '0.75rem' }}
              >
                ◀ PREV
              </button>
              <button 
                onClick={() => setCarouselIdx(p => (p === polaroids.length - 1 ? 0 : p + 1))}
                className="pixel-header"
                style={{ background: '#000', color: 'var(--rpg-text)', border: '2px solid var(--rpg-text)', padding: '8px 15px', cursor: 'pointer', fontSize: '0.75rem' }}
              >
                NEXT ▶
              </button>
            </div>
          </div>
        </div>
      )}

      {/* C. 🪧 Guestbook Bulletin Submit review Modal */}
      {showGuestbookSubmit && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.9)',
          zIndex: 150,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="rpg-box" style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '15px', borderColor: 'var(--rpg-highlight)' }}>
            <h3 className="pixel-header" style={{ fontSize: '1rem', color: 'var(--rpg-highlight)', borderBottom: '3px solid var(--rpg-highlight)', paddingBottom: '8px', margin: 0 }}>
              🪧 SIGN THE WALL OF USERS
            </h3>

            <p className="pixel-text" style={{ fontSize: '1.4rem', color: '#fff', margin: 0 }}>
              Welcome, {playerName} ({playerClass}). Submit your review to spawn your custom sprite permanently on our multiplayer bulletin overworld!
            </p>

            <textarea
              value={guestbookText}
              onChange={(e) => setGuestbookText(e.target.value.slice(0, 100))}
              className="pixel-text"
              placeholder="Leave a short retro review... (max 100 chars)"
              style={{
                background: '#000',
                border: '3px solid var(--rpg-text)',
                color: '#fff',
                fontSize: '1.4rem',
                padding: '10px',
                width: '100%',
                height: '80px',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'none'
              }}
            />

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowGuestbookSubmit(false)}
                className="pixel-header"
                style={{ background: '#000', color: '#888', border: '2px solid #555', padding: '8px 15px', cursor: 'pointer', fontSize: '0.75rem' }}
              >
                CANCEL
              </button>
              <button 
                onClick={submitGuestbookReview}
                className="pixel-header"
                style={{ background: 'var(--rpg-text)', color: '#000', border: '2px solid #000', padding: '8px 15px', cursor: 'pointer', fontSize: '0.75rem' }}
              >
                SUBMIT PIN [A]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* E. 🖼️ Gilded Wall Photo Frame: Visitor Gallery Modal */}
      {showVisitorGallery && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 5, 10, 0.95)',
          zIndex: 150,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          padding: '20px',
          border: '4px solid var(--rpg-highlight)',
          boxSizing: 'border-box'
        }}>
          <div className="crt-scanline" style={{ pointerEvents: 'none' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid var(--rpg-highlight)', paddingBottom: '10px', marginBottom: '20px' }}>
            <span className="pixel-header" style={{ fontSize: '0.9rem', color: 'var(--rpg-highlight)', textShadow: '0 0 10px rgba(0,255,255,0.4)' }}>🖼️ GALLERY OF EXPLORERS</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => {
                  setShowGuestbookSubmit(true);
                }}
                className="pixel-header"
                style={{ background: 'var(--rpg-text)', color: '#000', border: '2px solid #000', padding: '5px 12px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 'bold' }}
              >
                + SIGN THE WALL
              </button>
              <button 
                onClick={() => setShowVisitorGallery(false)}
                className="pixel-header" 
                style={{ background: 'var(--rpg-accent)', color: '#fff', border: '2px solid #000', padding: '5px 12px', fontSize: '0.7rem', cursor: 'pointer' }}
              >
                CLOSE [B]
              </button>
            </div>
          </div>

          {/* Grid of Polaroid Cards */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', flex: 1, overflowY: 'auto', paddingBottom: '30px' }}>
            {guestbookEntries.map((visitor, idx) => (
              <div 
                key={idx}
                onClick={() => setSelectedGalleryProfile(visitor)}
                className="rpg-box"
                style={{
                  width: '180px',
                  background: '#fff', // Classic Polaroid white paper look!
                  color: '#111',
                  border: '1px solid #ddd',
                  borderRadius: '2px',
                  padding: '10px 10px 18px 10px',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'transform 0.2s',
                  transformOrigin: 'bottom center'
                }}
              >
                {/* Photo cutout containing animated sprite */}
                <div style={{ width: '100%', height: '110px', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #222', position: 'relative' }}>
                  <div style={{ width: '64px', height: '64px' }}>
                    <Sprite direction="down" frame={Math.floor(Date.now() / 250) % 4} customColors={visitor.colors} />
                  </div>
                  <div style={{ position: 'absolute', top: '5px', left: '5px', background: 'rgba(255,255,255,0.15)', width: '3px', height: '3px', borderRadius: '50%' }} />
                </div>
                
                {/* Written text style */}
                <div style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: '1.2' }}>
                  <div style={{ fontWeight: 'bold', color: '#000', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{visitor.name}</div>
                  <div style={{ color: '#666', fontSize: '0.65rem', marginBottom: '4px' }}>{visitor.class}</div>
                  <div style={{
                    fontStyle: 'italic',
                    color: '#333',
                    fontSize: '0.72rem',
                    minHeight: '32px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    borderTop: '1px dotted #ccc',
                    paddingTop: '4px'
                  }}>
                    "{visitor.review}"
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* F. Deep Profile Cardflip Detail View Modal */}
      {selectedGalleryProfile && (
        <div 
          onClick={() => setSelectedGalleryProfile(null)}
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.92)',
            zIndex: 160,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="rpg-box"
            style={{ 
              width: '100%', 
              maxWidth: '480px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '15px', 
              borderColor: 'var(--rpg-highlight)',
              boxShadow: '0 0 25px var(--rpg-highlight)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid var(--rpg-highlight)', paddingBottom: '8px' }}>
              <span className="pixel-header" style={{ fontSize: '0.85rem', color: 'var(--rpg-highlight)' }}>🔍 DETAILED PROFILE SHEET</span>
              <button 
                onClick={() => setSelectedGalleryProfile(null)}
                className="pixel-header"
                style={{ background: 'var(--rpg-accent)', color: '#fff', border: '2px solid #000', padding: '3px 8px', fontSize: '0.65rem', cursor: 'pointer' }}
              >
                BACK [B]
              </button>
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              {/* Large Sprite preview frame */}
              <div className="rpg-box" style={{ width: '110px', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', border: '3px solid var(--rpg-highlight)' }}>
                <div style={{ width: '72px', height: '72px' }}>
                  <Sprite direction="down" frame={Math.floor(Date.now() / 250) % 4} customColors={selectedGalleryProfile.colors} />
                </div>
              </div>

              {/* Header profile data */}
              <div style={{ flex: 1 }}>
                <h3 className="pixel-header" style={{ fontSize: '0.95rem', color: '#fff', margin: '0 0 5px 0' }}>{selectedGalleryProfile.name}</h3>
                <span className="pixel-header" style={{ fontSize: '0.65rem', color: 'var(--rpg-text)' }}>{selectedGalleryProfile.class}</span>
                <div style={{ fontSize: '1.1rem', color: '#888', marginTop: '10px' }}>Pinned: {selectedGalleryProfile.date || "Ancient Era"}</div>
              </div>
            </div>

            {/* RPG Stats allocator breakdown */}
            <div style={{ border: '2px dashed #444', padding: '10px', background: '#07070c', fontSize: '1.3rem' }}>
              <h4 className="pixel-header" style={{ fontSize: '0.65rem', margin: '0 0 6px 0', color: 'var(--rpg-highlight)' }}>STATS BREAKDOWN:</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}><span>💪 Stamina:</span> <span style={{ color: 'var(--rpg-text)' }}>{selectedGalleryProfile.stats.stamina} pts</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}><span>🔍 Curiosity:</span> <span style={{ color: 'var(--rpg-text)' }}>{selectedGalleryProfile.stats.curiosity} pts</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}><span>⚡ Reflexes:</span> <span style={{ color: 'var(--rpg-text)' }}>{selectedGalleryProfile.stats.reflexes} pts</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>🧠 Intellect:</span> <span style={{ color: 'var(--rpg-text)' }}>{selectedGalleryProfile.stats.intellect} pts</span></div>
            </div>

            {/* Full Guestbook review Pinned comment */}
            <div className="rpg-box" style={{ background: '#111', fontSize: '1.4rem', color: '#fff', padding: '12px', borderColor: 'var(--rpg-text)' }}>
              <div className="pixel-header" style={{ fontSize: '0.55rem', color: 'var(--rpg-text)', marginBottom: '5px' }}>PINNED REVIEW:</div>
              "{selectedGalleryProfile.review}"
            </div>
          </div>
        </div>
      )}

      {/* G. Premium Travel Scrapbook Diary Modal Overlay */}
      {showTravelDiary && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.92)',
          zIndex: 155,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="rpg-box" style={{ width: '100%', maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '15px', borderColor: 'var(--rpg-highlight)', boxShadow: '0 0 25px rgba(0, 255, 255, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid var(--rpg-highlight)', paddingBottom: '8px' }}>
              <span className="pixel-header" style={{ fontSize: '0.85rem', color: 'var(--rpg-highlight)' }}>📔 RAGHAV'S TRAVEL DIARY</span>
              <button 
                onClick={() => setShowTravelDiary(false)}
                className="pixel-header"
                style={{ background: 'var(--rpg-accent)', color: '#fff', border: '2px solid #000', padding: '3px 8px', fontSize: '0.65rem', cursor: 'pointer' }}
              >
                CLOSE [ESC]
              </button>
            </div>

            {/* Scrapbook page content */}
            <div style={{ background: '#fff9c4', color: '#333', padding: '15px', borderRadius: '4px', border: '2px solid #e0c270', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)' }}>
              {/* Photo Polaroid Frame */}
              <div style={{ background: '#fff', padding: '8px 8px 16px 8px', border: '1px solid #ccc', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
                <img 
                  src={travelSlides[diaryIdx].src} 
                  alt={travelSlides[diaryIdx].title} 
                  style={{ width: '100%', height: '220px', objectFit: 'cover', border: '1px solid #eee' }} 
                />
                <span style={{ fontSize: '0.9rem', fontFamily: 'monospace', fontWeight: 'bold', marginTop: '10px', color: '#111', textTransform: 'uppercase', textAlign: 'center' }}>
                  {travelSlides[diaryIdx].title}
                </span>
              </div>

              {/* Travel diary description */}
              <p style={{ margin: '5px 0 0 0', fontFamily: 'monospace', fontSize: '1rem', lineHeight: '1.4', color: '#222', textAlign: 'center', fontStyle: 'italic', borderTop: '1px dashed #c0b080', paddingTop: '8px' }}>
                "{travelSlides[diaryIdx].desc}"
              </p>
            </div>

            {/* Navigation buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
              <button 
                onClick={() => setDiaryIdx(prev => (prev - 1 + travelSlides.length) % travelSlides.length)}
                className="pixel-header"
                style={{ background: '#000', color: 'var(--rpg-highlight)', border: '2px solid var(--rpg-highlight)', padding: '5px 12px', cursor: 'pointer', fontSize: '0.75rem' }}
              >
                ◀ PREV
              </button>
              <span className="pixel-header" style={{ fontSize: '0.75rem', color: '#888' }}>
                PAGE {diaryIdx + 1} / {travelSlides.length}
              </span>
              <button 
                onClick={() => setDiaryIdx(prev => (prev + 1) % travelSlides.length)}
                className="pixel-header"
                style={{ background: '#000', color: 'var(--rpg-highlight)', border: '2px solid var(--rpg-highlight)', padding: '5px 12px', cursor: 'pointer', fontSize: '0.75rem' }}
              >
                NEXT ▶
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Choice Menu Selection Overlay */}
      {activeGameStation && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          zIndex: 140,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="rpg-box" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '15px', borderColor: 'var(--rpg-highlight)' }}>
            <h3 className="pixel-header" style={{ fontSize: '1rem', color: 'var(--rpg-highlight)', borderBottom: '3px solid var(--rpg-highlight)', paddingBottom: '8px', margin: 0, textTransform: 'uppercase' }}>
              🕹️ {activeGameStation === 'football' ? 'Soccer Stadium' : activeGameStation === 'bike' ? 'Bicycle Speedway' : 'Manga Arcade'}
            </h3>
            <p className="pixel-text" style={{ fontSize: '1.4rem', color: '#fff', margin: 0, lineHeight: '1.4' }}>
              Choose your interaction:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => {
                  const station = activeGameStation;
                  setActiveGameStation(null);
                  if (station === 'football') handleInspect('football');
                  if (station === 'bike') handleInspect('trekking');
                  if (station === 'arcade') handleInspect('anime');
                }}
                className="pixel-text"
                style={{ background: '#000', color: 'var(--rpg-text)', border: '2px solid var(--rpg-text)', padding: '10px', fontSize: '1.3rem', cursor: 'pointer', textAlign: 'left' }}
              >
                [1] Inspect Landmark Spec (Read Lore)
              </button>
              <button
                onClick={() => {
                  const station = activeGameStation;
                  setActiveGameStation(null);
                  if (station === 'football') setShowFullscreenSoccer(true);
                  if (station === 'bike') setShowFullscreenBiking(true);
                  if (station === 'arcade') {
                    setShowTrivia(true);
                    setCurrentQuestionIdx(0);
                    setCorrectStreak(0);
                    setTriviaResult(null);
                  }
                }}
                className="pixel-text"
                style={{ background: 'var(--rpg-highlight)', color: '#000', border: '2px solid #000', padding: '10px', fontSize: '1.3rem', cursor: 'pointer', fontWeight: 'bold', textAlign: 'left' }}
              >
                [2] Play Minigame (Launch Fullscreen)
              </button>
            </div>
            <button
              onClick={() => setActiveGameStation(null)}
              className="pixel-header"
              style={{ alignSelf: 'flex-end', background: 'var(--rpg-accent)', color: '#fff', border: '2px solid #000', padding: '5px 12px', cursor: 'pointer', fontSize: '0.75rem' }}
            >
              CANCEL [B]
            </button>
          </div>
        </div>
      )}

      {/* ⚽ Fullscreen Soccer Stadium Modal Overlay */}
      {showFullscreenSoccer && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: '#143618',
          zIndex: 150,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '4px solid var(--rpg-highlight)',
          boxSizing: 'border-box'
        }}>
          <div className="crt-scanline" style={{ pointerEvents: 'none' }} />
          
          {/* Mini Loading Screen Overlay */}
          {soccerLoading && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: '#09090e', zIndex: 200,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '20px'
            }}>
              <h2 className="pixel-header" style={{ color: 'var(--rpg-highlight)', fontSize: '1.2rem', marginBottom: '8px', animation: 'pulse-glow 1s infinite alternate' }}>
                ⚽ SOCCER 1V1 STADIUM
              </h2>
              <h3 className="pixel-header" style={{ color: '#fff', fontSize: '0.8rem', marginBottom: '20px' }}>
                Raghav warming up...
              </h3>
              
              {/* Retro progress bar */}
              <div style={{ width: '80%', maxWidth: '400px', height: '24px', border: '3px solid var(--rpg-text)', background: '#000', padding: '2px', boxSizing: 'border-box', marginBottom: '30px' }}>
                <div style={{ width: `${soccerProgress}%`, height: '100%', background: 'var(--rpg-text)', transition: 'width 0.15s' }} />
              </div>

              {/* Game play tips */}
              <div className="rpg-box" style={{ width: '80%', maxWidth: '400px', background: '#000', borderColor: '#444', textAlign: 'center' }}>
                <div className="pixel-header" style={{ fontSize: '0.6rem', color: 'var(--rpg-highlight)', marginBottom: '5px' }}>GAMEPLAY TIPS:</div>
                <p className="pixel-text" style={{ fontSize: '1.1rem', color: '#888', margin: 0 }}>
                  {soccerProgress < 40 ? "💡 Drive into the ball to kick it towards Raghav's Right Goal!" : 
                   soccerProgress < 80 ? "💡 Raghav will actively chase the ball and boot it back!" :
                   "💡 Drink Coffee in the Cyber Diner for a caffeine speed buff inside the match!"}
                </p>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#000', padding: '10px 15px', borderBottom: '3px solid var(--rpg-highlight)' }}>
            <span className="pixel-header" style={{ fontSize: '0.75rem', color: 'var(--rpg-highlight)' }}>⚽ 1V1 SOCCER DUEL</span>
            <span className="pixel-header" style={{ fontSize: '0.75rem', color: '#fff' }}>MATCH TIMER: {fsSoccerTimer}s</span>
            <span className="pixel-header" style={{ fontSize: '0.75rem', color: 'var(--rpg-accent)' }}>YOU: {soccerPlayerScore} - RAGHAV: {soccerAIScore}</span>
            <button 
              onClick={() => setShowFullscreenSoccer(false)}
              className="pixel-header" 
              style={{ background: 'var(--rpg-accent)', color: '#fff', border: '2px solid #000', padding: '2px 8px', fontSize: '0.6rem', cursor: 'pointer' }}
            >
              QUIT [B]
            </button>
          </div>

          <div style={{ flex: 1, position: 'relative', background: '#123015', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '10%', bottom: '10%', left: '5%', right: '5%', border: '2.5px solid rgba(255,255,255,0.2)' }} />
            <div style={{ position: 'absolute', top: '10%', bottom: '10%', left: '50%', borderLeft: '2px dashed rgba(255,255,255,0.2)' }} />
            <div style={{ position: 'absolute', top: '40%', left: '44%', width: '12%', height: '20%', border: '2.5px solid rgba(255,255,255,0.2)', borderRadius: '50%' }} />
            
            <div style={{ position: 'absolute', top: '30%', bottom: '30%', left: '5%', width: '12%', border: '2.5px solid rgba(255,255,255,0.2)', borderLeft: 'none' }} />
            <div style={{ position: 'absolute', top: '30%', bottom: '30%', right: '5%', width: '12%', border: '2.5px solid rgba(255,255,255,0.2)', borderRight: 'none' }} />
            
            {/* LEFT GOAL Net (PLAYER GOAL) */}
            <div style={{ position: 'absolute', top: '35%', bottom: '35%', left: '0.5%', width: '5%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1 }}><PixelProp type="goalpost-top" /></div>
              <div style={{ flex: 1 }}><PixelProp type="goalpost-mid" /></div>
              <div style={{ flex: 1 }}><PixelProp type="goalpost-bottom" /></div>
            </div>

            {/* RIGHT GOAL Net (AI GOAL) */}
            <div style={{ position: 'absolute', top: '35%', bottom: '35%', right: '0.5%', width: '5%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1 }}><PixelProp type="goalpost-top" /></div>
              <div style={{ flex: 1 }}><PixelProp type="goalpost-mid" /></div>
              <div style={{ flex: 1 }}><PixelProp type="goalpost-bottom" /></div>
            </div>

            {/* Giant Retro Kickoff Countdown Overlay */}
            {fsSoccerCountdown && (
              <div style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '4.5rem',
                color: fsSoccerCountdown === 'GO!' ? 'var(--rpg-text)' : 'var(--rpg-highlight)',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                textShadow: '0 0 15px currentColor, 4px 4px 0 #000',
                zIndex: 100,
                pointerEvents: 'none',
                animation: 'scale-up-goal 0.5s infinite alternate'
              }}>
                {fsSoccerCountdown}
              </div>
            )}

            {/* Soccer Ball */}
            <div style={{
              position: 'absolute',
              left: `${fsBallPos.col}%`,
              top: `${fsBallPos.row}%`,
              transform: 'translate(-50%, -50%)',
              width: '24px',
              height: '24px',
              zIndex: 9
            }}>
              <PixelProp type="ball" />
            </div>

            {/* Player Sprite */}
            <div style={{
              position: 'absolute',
              left: `${fsPlayerPos.col}%`,
              top: `${fsPlayerPos.row}%`,
              transform: 'translate(-50%, -50%)',
              width: '45px',
              height: '45px',
              zIndex: 11
            }}>
              <Sprite direction={fsDirection} frame={fsFrame} customColors={customColors} />
              <div style={{ position: 'absolute', bottom: '-15px', background: '#000', color: '#00ffff', fontSize: '0.45rem', padding: '1px 3px', border: '1px solid #777', whiteSpace: 'nowrap' }}>YOU</div>
            </div>

            {/* Opponent Sprite (Raghav in red/black jersey) */}
            <div style={{
              position: 'absolute',
              left: `${fsAIPlayerPos.col}%`,
              top: `${fsAIPlayerPos.row}%`,
              transform: 'translate(-50%, -50%)',
              width: '45px',
              height: '45px',
              zIndex: 11
            }}>
              <Sprite direction={fsAIDirection} frame={fsAIFrame} customColors={{ hat: '#e53935', skin: '#ffb6c1', shirt: '#111111', pants: '#111111', shoes: '#ffffff' }} />
              <div style={{ position: 'absolute', bottom: '-15px', background: '#000', color: '#ff007f', fontSize: '0.45rem', padding: '1px 3px', border: '1px solid #777', whiteSpace: 'nowrap' }}>RAGHAV</div>
            </div>

            {/* Match Over Banner popup */}
            {soccerMatchEnd && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.85)', zIndex: 100,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
              }}>
                <div className="rpg-box" style={{ width: '320px', textAlign: 'center', borderColor: 'var(--rpg-highlight)', boxShadow: '0 0 20px var(--rpg-accent)' }}>
                  <h2 className="pixel-header" style={{ fontSize: '1.2rem', color: soccerResult === 'VICTORY' ? 'var(--rpg-text)' : soccerResult === 'DEFEAT' ? 'var(--hp-bar)' : 'var(--rpg-highlight)', marginBottom: '10px' }}>
                    {soccerResult === 'VICTORY' ? "🎉 VICTORY!" : soccerResult === 'DEFEAT' ? "💀 DEFEAT!" : "🤝 MATCH DRAW!"}
                  </h2>
                  <p className="pixel-text" style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '20px' }}>
                    {soccerResult === 'VICTORY' ? "You outplayed Developer Raghav in the 1v1!" : 
                     soccerResult === 'DEFEAT' ? "Raghav out-dribbled you. Git gud!" :
                     "A tightly contested match ends in a tie!"}
                  </p>
                  <p className="pixel-header" style={{ fontSize: '0.8rem', color: 'var(--rpg-highlight)', marginBottom: '25px' }}>
                    FINAL SCORE:<br/> YOU: {soccerPlayerScore} - RAGHAV: {soccerAIScore}
                  </p>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button 
                      onClick={() => {
                        setShowFullscreenSoccer(false);
                        setTimeout(() => setShowFullscreenSoccer(true), 50);
                      }}
                      className="pixel-header"
                      style={{ background: 'var(--rpg-text)', color: '#000', border: '2px solid #000', padding: '6px 12px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      REPLAY
                    </button>
                    <button 
                      onClick={() => setShowFullscreenSoccer(false)}
                      className="pixel-header"
                      style={{ background: 'var(--rpg-accent)', color: '#fff', border: '2px solid #000', padding: '6px 12px', fontSize: '0.7rem', cursor: 'pointer' }}
                    >
                      EXIT
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🚲 Fullscreen Biking Time-Trial Modal Speedway */}
      {showFullscreenBiking && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: '#1b2612',
          zIndex: 150,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '4px solid var(--rpg-highlight)',
          boxSizing: 'border-box'
        }}>
          <div className="crt-scanline" style={{ pointerEvents: 'none' }} />
          
          {/* VEHICLE SELECTION GARAGE PANEL */}
          {!bikeSelected && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: '#09090e', zIndex: 180,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '20px'
            }}>
              <h2 className="pixel-header" style={{ color: 'var(--rpg-highlight)', fontSize: '1.2rem', marginBottom: '25px', textShadow: '0 0 10px rgba(0,255,255,0.4)', textAlign: 'center' }}>
                🏍️ RAGHAV'S MOTORBIKE GARAGE
              </h2>
              
              <div style={{ display: 'flex', gap: '20px', width: '100%', maxWidth: '640px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '30px' }}>
                
                {/* 1. Shine Cruiser Card */}
                <div 
                  onClick={() => setSelectedMotorbike('shine')}
                  className="rpg-box"
                  style={{
                    width: '260px', cursor: 'pointer',
                    background: '#05050c',
                    borderColor: selectedMotorbike === 'shine' ? 'var(--rpg-text)' : '#333',
                    transform: selectedMotorbike === 'shine' ? 'scale(1.02)' : 'none',
                    boxShadow: selectedMotorbike === 'shine' ? '0 0 15px var(--rpg-text)' : 'none'
                  }}
                >
                  <div style={{ width: '80px', height: '80px', margin: '0 auto 10px auto' }}>
                    <PixelProp type="motorbike-shine" />
                  </div>
                  <h3 className="pixel-header" style={{ fontSize: '0.85rem', color: '#fff', textAlign: 'center', margin: '0 0 10px 0' }}>SHINE CRUISER</h3>
                  <div style={{ fontSize: '1.1rem', color: '#888', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>🚀 Speed: <span style={{ color: '#ffb300' }}>Comfortable (50mph)</span></div>
                    <div>⚡ Control: <span style={{ color: 'var(--rpg-text)' }}>Excellent (Instant)</span></div>
                    <div style={{ fontSize: '0.9rem', color: '#666', borderTop: '1px dotted #333', paddingTop: '6px', marginTop: '6px', textAlign: 'center' }}>
                      Easy to steer. Perfect for clean lines!
                    </div>
                  </div>
                </div>

                {/* 2. MT15 Sports Card */}
                <div 
                  onClick={() => setSelectedMotorbike('mt15')}
                  className="rpg-box"
                  style={{
                    width: '260px', cursor: 'pointer',
                    background: '#05050c',
                    borderColor: selectedMotorbike === 'mt15' ? 'var(--rpg-highlight)' : '#333',
                    transform: selectedMotorbike === 'mt15' ? 'scale(1.02)' : 'none',
                    boxShadow: selectedMotorbike === 'mt15' ? '0 0 15px var(--rpg-highlight)' : 'none'
                  }}
                >
                  <div style={{ width: '80px', height: '80px', margin: '0 auto 10px auto' }}>
                    <PixelProp type="motorbike-mt15" />
                  </div>
                  <h3 className="pixel-header" style={{ fontSize: '0.85rem', color: '#fff', textAlign: 'center', margin: '0 0 10px 0' }}>MT15 SPORT</h3>
                  <div style={{ fontSize: '1.1rem', color: '#888', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>🚀 Speed: <span style={{ color: 'var(--rpg-accent)' }}>Blazing (95mph)</span></div>
                    <div>⚡ Control: <span style={{ color: 'var(--hp-bar)' }}>Drifty (Inertia Slide)</span></div>
                    <div style={{ fontSize: '0.9rem', color: '#666', borderTop: '1px dotted #333', paddingTop: '6px', marginTop: '6px', textAlign: 'center' }}>
                      Aggressive speeds with slide physics!
                    </div>
                  </div>
                </div>

              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <button 
                  onClick={() => setBikeSelected(true)}
                  className="pixel-header"
                  style={{ background: 'var(--rpg-text)', color: '#000', border: '3px solid #000', padding: '10px 20px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold', boxShadow: '2px 2px 0 #000' }}
                >
                  START RACE [A]
                </button>
                <button 
                  onClick={() => setShowFullscreenBiking(false)}
                  className="pixel-header"
                  style={{ background: '#000', color: '#888', border: '2px solid #555', padding: '10px 20px', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  CANCEL [B]
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#000', padding: '10px 15px', borderBottom: '3px solid var(--rpg-highlight)' }}>
            <span className="pixel-header" style={{ fontSize: '0.75rem', color: 'var(--rpg-highlight)' }}>🏍️ 1V1 MOTORBIKE CHAMPIONSHIP</span>
            <span className="pixel-header" style={{ fontSize: '0.75rem', color: '#fff' }}>LAP TIMER: {lapTimer}s</span>
            <span className="pixel-header" style={{ fontSize: '0.75rem', color: 'var(--rpg-text)' }}>YOU LAP: {playerLaps}/5 - AI LAP: {aiLaps}/5</span>
            <button 
              onClick={() => setShowFullscreenBiking(false)}
              className="pixel-header" 
              style={{ background: 'var(--rpg-accent)', color: '#fff', border: '2px solid #000', padding: '2px 8px', fontSize: '0.6rem', cursor: 'pointer' }}
            >
              QUIT [B]
            </button>
          </div>

          <div style={{ flex: 1, position: 'relative', background: '#1b2612', overflow: 'hidden' }}>
            {/* Dirt Outside Flashing Slowdown Warning */}
            {(fsPlayerPos.col < 10 || fsPlayerPos.col > 90 || fsPlayerPos.row < 15 || fsPlayerPos.row > 85) && (
              <div style={{
                position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(229,57,53,0.85)', border: '2px solid #000', color: '#fff',
                padding: '4px 10px', fontSize: '1.2rem', fontFamily: 'monospace', zIndex: 90,
                borderRadius: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.4)', animation: 'pulse-glow 0.8s infinite alternate'
              }}>
                ⚠️ DIRT PENALTY -50% SPEED
              </div>
            )}

            {/* Asphalt Loop Track (Large Grey Donut oval) */}
            <div style={{
              position: 'absolute',
              top: '12%', bottom: '12%', left: '8%', right: '8%',
              background: '#333',
              borderRadius: '80px',
              border: '6px double #ffd700'
            }} />
            
            {/* Center island block of Safety Tyres (X: 28 to 72, Y: 32 to 68) */}
            <div style={{
              position: 'absolute',
              top: '32%', bottom: '32%', left: '28%', right: '28%',
              background: '#1b2612',
              borderRadius: '50px',
              border: '10px solid #111', // represent solid tyre ring walls
              boxShadow: 'inset 0 0 15px rgba(0,0,0,0.8)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px'
            }}>
              {/* Visual stack of tires for increased width */}
              <div style={{ position: 'absolute', top: '-14px', left: '5%', right: '5%', display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', pointerEvents: 'none' }}>🛞🛞🛞🛞🛞</div>
              <div style={{ position: 'absolute', bottom: '-14px', left: '5%', right: '5%', display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', pointerEvents: 'none' }}>🛞🛞🛞🛞🛞</div>

              <div className="pixel-header" style={{ fontSize: '0.55rem', textAlign: 'center', color: '#fff', zIndex: 5 }}>
                🏆 BEST LAP RECORD:<br/>
                <span style={{ color: 'var(--rpg-highlight)', fontSize: '0.8rem' }}>
                  {bikingBestLap > 0 ? `${bikingBestLap.toFixed(1)}s` : 'No record'}
                </span>
              </div>
            </div>

            {/* Checkpoint Gate 1 */}
            <div style={{ position: 'absolute', left: '15%', top: '50%', transform: 'translate(-50%, -50%)', width: '32px', height: '32px', zIndex: 12, opacity: fsBikingCheckpoint === 1 ? 1 : 0.4 }}>
              <PixelProp type="checkpoint" />
              <div className="pixel-header" style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.45rem', background: '#000', padding: '1px 2px', whiteSpace: 'nowrap' }}>CP 1</div>
            </div>

            {/* Checkpoint Gate 2 */}
            <div style={{ position: 'absolute', left: '50%', top: '85%', transform: 'translate(-50%, -50%)', width: '32px', height: '32px', zIndex: 12, opacity: fsBikingCheckpoint === 2 ? 1 : 0.4 }}>
              <PixelProp type="checkpoint" />
              <div className="pixel-header" style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.45rem', background: '#000', padding: '1px 2px', whiteSpace: 'nowrap' }}>CP 2</div>
            </div>

            {/* Checkpoint Gate 3 / Finish */}
            <div style={{ position: 'absolute', left: '85%', top: '50%', transform: 'translate(-50%, -50%)', width: '32px', height: '32px', zIndex: 12, opacity: fsBikingCheckpoint === 3 ? 1 : 0.4 }}>
              <PixelProp type="checkpoint" />
              <div className="pixel-header" style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.45rem', background: '#000', padding: '1px 2px', whiteSpace: 'nowrap' }}>FINISH</div>
            </div>

            {/* Player Motorbike Sprite */}
            <div style={{
              position: 'absolute',
              left: `${fsPlayerPos.col}%`,
              top: `${fsPlayerPos.row}%`,
              transform: 'translate(-50%, -50%)',
              width: '45px',
              height: '45px',
              zIndex: 15
            }}>
              <div style={{ width: '42px', height: '42px', position: 'absolute', bottom: '-8px', zIndex: 9 }}>
                <PixelProp type={selectedMotorbike === 'shine' ? 'motorbike-shine' : 'motorbike-mt15'} />
              </div>
              <Sprite direction={fsDirection} frame={fsFrame} customColors={customColors} />
              <div style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)', background: '#000', color: 'var(--rpg-highlight)', fontSize: '0.45rem', padding: '1px 3px', border: '1px solid #777', whiteSpace: 'nowrap', zIndex: 16 }}>YOU</div>
            </div>

            {/* AI Opponent Motorbike Sprite */}
            <div style={{
              position: 'absolute',
              left: `${fsAIBikePos.col}%`,
              top: `${fsAIBikePos.row}%`,
              transform: 'translate(-50%, -50%)',
              width: '45px',
              height: '45px',
              zIndex: 14
            }}>
              <div style={{ width: '42px', height: '42px', position: 'absolute', bottom: '-8px', zIndex: 9 }}>
                <PixelProp type={selectedMotorbike === 'shine' ? 'motorbike-mt15' : 'motorbike-shine'} />
              </div>
              <Sprite direction={fsAIDirection} frame={fsAIFrame} customColors={{ hat: '#e53935', skin: '#ffb6c1', shirt: '#111', pants: '#111', shoes: '#fff' }} />
              <div style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)', background: '#000', color: 'var(--rpg-accent)', fontSize: '0.45rem', padding: '1px 3px', border: '1px solid #777', whiteSpace: 'nowrap', zIndex: 16 }}>AI RAGHAV</div>
            </div>

            {/* Championship Finish Overlay Banner */}
            {motorbikeMatchEnd && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.85)', zIndex: 200,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
              }}>
                <div className="rpg-box" style={{ width: '320px', textAlign: 'center', borderColor: 'var(--rpg-highlight)', boxShadow: '0 0 20px var(--rpg-accent)' }}>
                  <h2 className="pixel-header" style={{ fontSize: '1.2rem', color: motorbikeResult === 'VICTORY' ? 'var(--rpg-text)' : 'var(--hp-bar)', marginBottom: '10px' }}>
                    {motorbikeResult === 'VICTORY' ? "🏆 GOLD MEDAL!" : "💀 SILVER MEDAL!"}
                  </h2>
                  <p className="pixel-text" style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '20px' }}>
                    {motorbikeResult === 'VICTORY' ? "Superb riding! You out-raced Raghav's AI!" : 
                     "AI Raghav crossed the finish line first! Try again!"}
                  </p>
                  <p className="pixel-header" style={{ fontSize: '0.75rem', color: 'var(--rpg-highlight)', marginBottom: '25px' }}>
                    FINAL RESULTS:<br/> YOU LAPS: {playerLaps} - AI LAPS: {aiLaps}
                  </p>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button 
                      onClick={() => {
                        setBikeSelected(false);
                        setMotorbikeMatchEnd(false);
                      }}
                      className="pixel-header"
                      style={{ background: 'var(--rpg-text)', color: '#000', border: '2px solid #000', padding: '6px 12px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      GARAGE
                    </button>
                    <button 
                      onClick={() => setShowFullscreenBiking(false)}
                      className="pixel-header"
                      style={{ background: 'var(--rpg-accent)', color: '#fff', border: '2px solid #000', padding: '6px 12px', fontSize: '0.7rem', cursor: 'pointer' }}
                    >
                      EXIT
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🍳 Cyber Bistro Kitchen Modal Overlay */}
      {showKitchen && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(9, 9, 14, 0.95)',
          zIndex: 220,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '4px solid var(--rpg-highlight)',
          boxSizing: 'border-box',
          padding: '20px'
        }}>
          <div className="crt-scanline" style={{ pointerEvents: 'none' }} />
          
          <div className="rpg-box" style={{ width: '95%', maxWidth: '620px', display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative', background: '#05050a', borderColor: 'var(--rpg-highlight)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid var(--rpg-highlight)', paddingBottom: '8px' }}>
              <h2 className="pixel-header" style={{ fontSize: '1.1rem', color: 'var(--rpg-highlight)', margin: 0 }}>
                🍳 CYBER BISTRO KITCHEN
              </h2>
              <button 
                onClick={() => {
                  setShowKitchen(false);
                  setCookingItem(null);
                  setCookingProgress(0);
                }}
                className="pixel-header"
                style={{ background: 'var(--rpg-accent)', color: '#fff', border: '2px solid #000', padding: '2px 8px', fontSize: '0.65rem', cursor: 'pointer' }}
              >
                CLOSE [B]
              </button>
            </div>

            {cookingItem ? (
              /* Cooking Progress Screen */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px 10px' }}>
                <h3 className="pixel-header" style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '15px', animation: 'pulse-glow 0.8s infinite alternate' }}>
                  ⚡ Preparing {cookingItem.title}...
                </h3>
                <div style={{ width: '80px', height: '80px', marginBottom: '20px' }}>
                  <PixelProp type={cookingItem.type} />
                </div>
                {/* Cooking progress bar */}
                <div style={{ width: '80%', height: '16px', border: '2px solid var(--rpg-text)', background: '#000', padding: '2px', boxSizing: 'border-box', marginBottom: '20px' }}>
                  <div style={{ width: `${cookingProgress}%`, height: '100%', background: 'var(--rpg-text)', transition: 'width 0.08s' }} />
                </div>
                <span className="pixel-header" style={{ fontSize: '0.65rem', color: 'var(--rpg-highlight)' }}>SIZZLING IN ACTION...</span>
              </div>
            ) : (
              /* Kitchen Menu List */
              <>
                <p className="pixel-text" style={{ fontSize: '1.2rem', color: '#aaa', margin: '0 0 10px 0', textAlign: 'center' }}>
                  Select a classic retro street treat to cook and consume instantly! Restores energy and unlocks boosts.
                </p>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '12px',
                  maxHeight: '320px',
                  overflowY: 'auto',
                  paddingRight: '4px'
                }}>
                  {[
                    { id: 'popcorn', type: 'dbt-popcorn', title: 'DBT Popcorn', desc: 'Warm, airy kernels puffed with tandoori butter!', effect: '+25 Stamina' },
                    { id: 'shwarma', type: 'shwarma', title: 'Lebanese Shwarma', desc: 'Spicy wraps full of garlic-mustard goodness!', effect: '+25 Stamina' },
                    { id: 'chaap', type: 'chaap', title: 'Soya Chaap Skewer', desc: 'Flame-grilled spicy protein pieces!', effect: '+25 Stamina' },
                    { id: 'garlic-bread', type: 'garlic-bread', title: 'Garlic Bread', desc: 'Warm, toasted golden garlic butter slices!', effect: '+25 Stamina' },
                    { id: 'thumbs-up', type: 'thumbs-up', title: 'Thumbs Up Bottle', desc: 'Cold glass bottle cola with fizzy tingle!', effect: '+25 Stamina' },
                    { id: 'coffee', type: 'coffee', title: 'Hot Coffee Mug', desc: 'Espresso shot. Grants 15s CAFFEINE SPEED surge!', effect: '+25 Stamina & Speedup' }
                  ].map((item, idx) => (
                    <div 
                      key={idx}
                      className="rpg-box"
                      style={{
                        background: '#040409',
                        padding: '10px',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                        borderColor: '#222'
                      }}
                    >
                      <div style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                        <PixelProp type={item.type} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 className="pixel-header" style={{ fontSize: '0.75rem', color: '#fff', margin: '0 0 3px 0' }}>{item.title}</h4>
                        <p className="pixel-text" style={{ fontSize: '1.0rem', color: '#888', margin: '0 0 5px 0', lineHeight: '1.2', whiteSpace: 'normal' }}>{item.desc}</p>
                        <span className="pixel-header" style={{ fontSize: '0.55rem', color: 'var(--rpg-highlight)' }}>EFFECT: {item.effect}</span>
                      </div>
                      <button
                        onClick={() => handleCookFood(item)}
                        className="pixel-header"
                        style={{
                          background: 'var(--rpg-text)',
                          color: '#000',
                          border: '2px solid #000',
                          padding: '4px 8px',
                          fontSize: '0.6rem',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          flexShrink: 0
                        }}
                      >
                        PREPARE
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 1. 🧗 QTE Bouldering Wall Minigame */}
      {showClimbingQTE && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 5, 12, 0.95)',
          zIndex: 220,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="crt-scanline" style={{ pointerEvents: 'none' }} />
          <div className="rpg-box" style={{ width: '90%', maxWidth: '480px', background: '#08080f', borderColor: 'var(--rpg-highlight)', boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid var(--rpg-highlight)', paddingBottom: '8px', marginBottom: '15px' }}>
              <span className="pixel-header" style={{ fontSize: '0.85rem', color: 'var(--rpg-highlight)' }}>🧗 BOULDERING QTE CLIMB</span>
              <button 
                onClick={() => setShowClimbingQTE(false)}
                className="pixel-header"
                style={{ background: 'var(--rpg-accent)', color: '#fff', border: '2px solid #000', padding: '2px 8px', fontSize: '0.65rem', cursor: 'pointer' }}
              >
                ABANDON [B]
              </button>
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'stretch' }}>
              {/* Vertical Wall Climbing Progress Bar (Left side) */}
              <div style={{ width: '60px', background: '#1c1917', border: '3px solid #78716c', position: 'relative', display: 'flex', flexDirection: 'column-reverse', padding: '4px' }}>
                {[...Array(5)].map((_, i) => {
                  const filled = qteProgress > i;
                  return (
                    <div 
                      key={i} 
                      style={{ 
                        height: '35px', 
                        margin: '2px 0', 
                        background: filled ? '#00e5ff' : '#444', 
                        border: '1.5px solid #222',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.9rem',
                        transition: 'background 0.2s'
                      }}
                    >
                      {filled ? '🧗' : '◽'}
                    </div>
                  );
                })}
              </div>

              {/* Action instructions and prompts (Right side) */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifySelf: 'center', justifyContent: 'center', gap: '15px' }}>
                <p className="pixel-text" style={{ fontSize: '1.3rem', color: '#ccc', margin: 0 }}>
                  Conquer the V5 overhang! Press the matching key hold highlighted below when prompted. Hit 5 in a row!
                </p>

                {qteStatus === 'playing' && (
                  <div style={{ textAlign: 'center', background: '#000', padding: '15px', border: '3px solid var(--rpg-text)', borderRadius: '4px' }}>
                    <div className="pixel-header" style={{ fontSize: '0.62rem', color: '#ffb700', marginBottom: '8px' }}>NEXT HOLD TO GRAB:</div>
                    <div className="pixel-header animate-bob" style={{ fontSize: '2.0rem', color: 'var(--rpg-highlight)', textShadow: '0 0 10px var(--rpg-highlight)' }}>
                      {qteKey.toUpperCase()}
                    </div>
                  </div>
                )}

                {qteStatus === 'success' && (
                  <div style={{ background: '#1b3c1a', border: '3px solid #00ff66', color: '#00ff66', padding: '15px', textAlign: 'center', borderRadius: '4px' }}>
                    <h4 className="pixel-header" style={{ fontSize: '0.85rem', margin: '0 0 5px 0' }}>🏆 WALL CLIMBED!</h4>
                    <p className="pixel-text" style={{ fontSize: '1.25rem', margin: 0 }}>
                      Scaled the slab. Gained +15 Grip Power. Climber Elite badge active!
                    </p>
                  </div>
                )}

                {qteStatus === 'fail' && (
                  <div style={{ background: '#4a1515', border: '3px solid #ff1744', color: '#ff1744', padding: '15px', textAlign: 'center', borderRadius: '4px', animation: 'shake 0.2s 3' }}>
                    <h4 className="pixel-header" style={{ fontSize: '0.85rem', margin: '0 0 5px 0' }}>❌ FALLEN!</h4>
                    <p className="pixel-text" style={{ fontSize: '1.25rem', margin: 0 }}>
                      Slipped off the sloper. Re-chalking hands...
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #333', marginTop: '15px', paddingTop: '10px' }}>
              <span className="pixel-header" style={{ fontSize: '0.55rem', color: '#888' }}>Hold streak: {qteProgress} / 5</span>
              {qteStatus !== 'playing' && (
                <button
                  onClick={() => {
                    setQteProgress(0);
                    setQteStatus('playing');
                  }}
                  className="pixel-header"
                  style={{ background: 'var(--rpg-text)', color: '#000', border: '2px solid #000', padding: '4px 10px', fontSize: '0.62rem', cursor: 'pointer' }}
                >
                  RETRY
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 2. 🧰 Motorbike Tuning Workbench Drawer Modal */}
      {showTechStack && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 5, 12, 0.95)',
          zIndex: 220,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="crt-scanline" style={{ pointerEvents: 'none' }} />
          <div className="rpg-box" style={{ width: '95%', maxWidth: '640px', background: '#0a0505', borderColor: '#ffb700', boxShadow: '0 0 25px rgba(255, 183, 0, 0.3)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid #ffb700', paddingBottom: '8px', marginBottom: '15px' }}>
              <span className="pixel-header" style={{ fontSize: '0.85rem', color: '#ffb700' }}>🧰 MOTORBIKE TUNING WORKBENCH</span>
              <button 
                onClick={() => setShowTechStack(false)}
                className="pixel-header"
                style={{ background: 'var(--rpg-accent)', color: '#fff', border: '2px solid #000', padding: '2px 8px', fontSize: '0.65rem', cursor: 'pointer' }}
              >
                CLOSE [B]
              </button>
            </div>

            <p className="pixel-text" style={{ fontSize: '1.25rem', color: '#aaa', margin: '0 0 15px 0', textAlign: 'center' }}>
              Slide open the workbench drawers to inspect how I maintain and tune my MT15 Sport and Shine Cruiser motorbikes!
            </p>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {/* Left Column: Drawers Buttons (Workbench shape) */}
              <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '8px', background: '#1c1c1c', padding: '8px', borderRadius: '4px', border: '2px solid #333' }}>
                {[
                  { id: 'engine', title: '🟥 Engine Specs', color: '#e53935' },
                  { id: 'drivetrain', title: '🟨 Tires & Chain', color: '#ffd700' },
                  { id: 'suspension', title: '🟩 Handling Tuning', color: '#43a047' },
                  { id: 'touring', title: '🟪 Adventure Kits', color: '#8a2be2' }
                ].map(drawer => (
                  <button
                    key={drawer.id}
                    onClick={() => {
                      playSound('chime');
                      setActiveStackDrawer(drawer.id);
                    }}
                    className="pixel-header"
                    style={{
                      background: activeStackDrawer === drawer.id ? drawer.color : '#0a0a0f',
                      color: activeStackDrawer === drawer.id ? '#000' : '#fff',
                      border: `2px solid ${drawer.color}`,
                      padding: '10px 8px',
                      fontSize: '0.68rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      boxShadow: activeStackDrawer === drawer.id ? 'inset 0 0 8px rgba(0,0,0,0.5)' : 'none',
                      transition: 'all 0.15s'
                    }}
                  >
                    {drawer.title}
                  </button>
                ))}
              </div>

              {/* Right Column: Open Drawer Tray Contents */}
              <div className="rpg-box" style={{ flex: '2 1 320px', minHeight: '220px', background: '#050508', border: '2px solid #444', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 className="pixel-header" style={{ fontSize: '0.72rem', color: '#fff', borderBottom: '1px dotted #444', paddingBottom: '4px', margin: 0, textTransform: 'uppercase' }}>
                  📂 Workbench Tray: {activeStackDrawer}
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '1.25rem', overflowY: 'auto', maxHeight: '200px' }}>
                  {activeStackDrawer === 'engine' && (
                    <>
                      <div>⚙️ <strong style={{ color: '#00e5ff' }}>MT15 Liquid-Cooled Engine:</strong> 155cc, single-cylinder, 4-valve powerhouse. Variable Valve Actuation (VVA) provides amazing high-rev torque.</div>
                      <div>🔥 <strong style={{ color: '#ffb700' }}>Spark Plug & Compression:</strong> High performance iridium spark plugs ensuring immediate engine ignition.</div>
                      <div>⛽ <strong style={{ color: '#ff007f' }}>Fuel Delivery:</strong> Electronic fuel injection mapped for responsive throttle action.</div>
                      <div>🔧 <strong style={{ color: '#00ff66' }}>Engine Oil:</strong> Premium synthetic 10W-40 oil swapped every 3,000km to keep standard friction low.</div>
                    </>
                  )}
                  {activeStackDrawer === 'drivetrain' && (
                    <>
                      <div>🏍️ <strong style={{ color: '#00ff66' }}>Chain tensioning:</strong> Adjusted regularly to maintain a clean 30mm play. Cleared, lubed, and protected every weekend.</div>
                      <div>🛞 <strong style={{ color: '#ff007f' }}>Radial Tires:</strong> High-grip tubeless tires. Front: 100/80-17, Rear: 140/70-17 for perfect corner leaning.</div>
                      <div>⚙️ <strong style={{ color: '#00e5ff' }}>Sprocket Ratio:</strong> Custom steel rear sprockets mapping quick off-the-line pickup speeds.</div>
                      <div>🛑 <strong style={{ color: '#ffd700' }}>Brake System:</strong> Dual-channel ABS with sintered brake pads for emergency stops.</div>
                    </>
                  )}
                  {activeStackDrawer === 'suspension' && (
                    <>
                      <div>🏍️ <strong style={{ color: '#00e5ff' }}>Upside Down (USD) Forks:</strong> Rigid front fork suspension absorbing shocks and improving high speed corner stability.</div>
                      <div>🌀 <strong style={{ color: '#ff7043' }}>Link Monoshock:</strong> Rear suspension adjusted with custom preload settings for adventure backpacking weight.</div>
                      <div>🏗️ <strong style={{ color: '#ffd700' }}>Deltabox Frame:</strong> Superb frame rigidity and chassis balance. Zero layout shifts in gravity!</div>
                      <div>🛡️ <strong style={{ color: '#eeeeee' }}>Engine Guards:</strong> Heavy-duty crash sliders shielding engine cases from rough off-road terrain.</div>
                    </>
                  )}
                  {activeStackDrawer === 'touring' && (
                    <>
                      <div>🎒 <strong style={{ color: '#ff007f' }}>Waterproof Saddlebags:</strong> Decoupled, heavy-duty side bags to pack gear for multi-day adventure tours.</div>
                      <div>🖥️ <strong style={{ color: '#00e5ff' }}>GPS Cockpit Mount:</strong> Vibration-dampened mobile handlebar holder plotting active maps.</div>
                      <div>🔋 <strong style={{ color: '#ffd700' }}>Chassis USB Charger:</strong> Connected directly to the main battery for keeping telemetry devices charged.</div>
                      <div>💨 <strong style={{ color: '#00ff66' }}>Touring Visor:</strong> High wind-shield visor reducing rider fatigue during peak highway runs.</div>
                    </>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 3. 🧗 Fitness Stats Gym Card Modal */}
      {showFitnessStats && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 5, 12, 0.95)',
          zIndex: 220,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="crt-scanline" style={{ pointerEvents: 'none' }} />
          <div className="rpg-box" style={{ width: '90%', maxWidth: '440px', background: '#08080f', borderColor: '#2196f3', boxShadow: '0 0 25px rgba(33, 150, 243, 0.3)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid #2196f3', paddingBottom: '8px', marginBottom: '15px' }}>
              <span className="pixel-header" style={{ fontSize: '0.85rem', color: '#2196f3' }}>💪 GYM MEMBERSHIP ID SHEET</span>
              <button 
                onClick={() => setShowFitnessStats(false)}
                className="pixel-header"
                style={{ background: 'var(--rpg-accent)', color: '#fff', border: '2px solid #000', padding: '2px 8px', fontSize: '0.65rem', cursor: 'pointer' }}
              >
                CLOSE [B]
              </button>
            </div>

            {/* Gym card layout */}
            <div style={{ background: '#1565c0', color: '#fff', borderRadius: '4px', border: '2px solid #ffd700', padding: '15px', position: 'relative', overflow: 'hidden' }}>
              {/* Diagonal stamp overlay */}
              <div style={{
                position: 'absolute',
                top: '20px', right: '-15px',
                transform: 'rotate(25deg)',
                background: 'rgba(255, 215, 0, 0.15)',
                border: '2px dashed #ffd700',
                color: '#ffd700',
                fontSize: '0.62rem',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                padding: '4px 10px',
                letterSpacing: '1px',
                borderRadius: '3px',
                zIndex: 1
              }}>
                CERTIFIED ATHLETE
              </div>

              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px', zIndex: 2, position: 'relative' }}>
                <div style={{ width: '56px', height: '56px', background: '#000', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '2.2rem' }}>🧗</span>
                </div>
                <div>
                  <h3 className="pixel-header" style={{ fontSize: '0.9rem', color: '#ffd700', margin: '0 0 4px 0' }}>RAGHAV CLIMBER</h3>
                  <span className="pixel-header" style={{ fontSize: '0.52rem', color: '#cfd8dc' }}>Class: Granite Slab Hyperfixator</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '12px', zIndex: 2, position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>🏅 climbing Level:</span> <span style={{ color: '#ffd700', fontWeight: 'bold' }}>V5 (Sandstone redpoint)</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>💪 Pull-up Rep Max:</span> <span style={{ color: '#ffd700' }}>22 Repetitions</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>✊ Crimp Dead-Hang:</span> <span style={{ color: '#ffd700' }}>8 / 10 (Extreme holds)</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>🔋 Core Stability:</span> <span style={{ color: '#cfd8dc' }}>Gold Tier (Plank Max: 4m)</span></div>
              </div>

              <div style={{ marginTop: '12px', borderTop: '1.5px dashed rgba(255,255,255,0.2)', paddingTop: '10px', fontSize: '1.15rem', color: '#eceff1', fontFamily: 'monospace' }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.62rem', color: '#ffd700', marginBottom: '4px', textTransform: 'uppercase' }}>Current Training Regimen:</div>
                • Dead-hang crimps (7s hold, 3s rest) on 15mm edges.<br/>
                • Weekly volume board sessions focusing on high-tension core tension.
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 4. 📋 Tactical chalk Board Blueprint Modal */}
      {/* 4. 📋 Soccer Tactics Chalkboard Playbook Modal */}
      {showTacticalBlueprints && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 5, 12, 0.95)',
          zIndex: 220,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="crt-scanline" style={{ pointerEvents: 'none' }} />
          <div className="rpg-box" style={{ width: '95%', maxWidth: '580px', background: '#0a100a', borderColor: '#4caf50', boxShadow: '0 0 25px rgba(76, 175, 80, 0.3)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid #4caf50', paddingBottom: '8px', marginBottom: '15px' }}>
              <span className="pixel-header" style={{ fontSize: '0.85rem', color: '#4caf50' }}>📋 CHAMPIONS LEAGUE PLAYBOOK</span>
              <button 
                onClick={() => setShowTacticalBlueprints(false)}
                className="pixel-header"
                style={{ background: 'var(--rpg-accent)', color: '#fff', border: '2px solid #000', padding: '2px 8px', fontSize: '0.65rem', cursor: 'pointer' }}
              >
                CLOSE [B]
              </button>
            </div>

            {/* Chalkboard styling */}
            <div style={{ background: '#1c361e', border: '5px solid #8d6e63', padding: '15px', color: '#eceff1', borderRadius: '4px', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)' }}>
              
              <div style={{ borderBottom: '2px dashed rgba(255,255,255,0.2)', paddingBottom: '8px', marginBottom: '12px', textAlign: 'center' }}>
                <h3 className="pixel-header" style={{ fontSize: '0.8rem', color: '#ffeb3b', margin: 0 }}>
                  CHAMPIONS LEAGUE 4-3-3 TACTICAL SCHEME
                </h3>
                <span style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: '#81c784' }}>My Personal Playbook & Tactical Dribble Formations</span>
              </div>

              {/* Diagrams columns */}
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                {/* Chalkboard Drawing */}
                <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '220px', height: '140px' }}>
                    <PixelProp type="tacticboard" />
                  </div>
                </div>

                {/* Tactical mapping details */}
                <div style={{ flex: '1.2 1 240px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '1.2rem', fontFamily: 'monospace' }}>
                  <div>
                    <span style={{ color: '#ffeb3b', fontWeight: 'bold' }}>🛡️ DEFENSIVE UNIT (Low Block 4-4-2):</span><br/>
                    The solid backline foundation. Compact defensive blocks. Highly disciplined, blocking central channels, absorbing direct striker runs, and shielding the goalie.
                  </div>
                  <div>
                    <span style={{ color: '#4fc3f7', fontWeight: 'bold' }}>🏃 THE ENGINE ROOM (Double Pivot Midfield):</span><br/>
                    The heartbeat. Dictates match tempo, switches channels with deep long balls, and acts as the quick transition valve between defense and attacking runs.
                  </div>
                  <div>
                    <span style={{ color: '#ffd54f', fontWeight: 'bold' }}>⚡ ATTACKING UNIT (Inverted 4-3-3 Wingers):</span><br/>
                    The playmakers. High pressing defensive lines, quick short passes, overlapping fullbacks exploiting half-spaces, and taking decisive shots on target.
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 5. 📚 Books & Films Trigger Choice Menu */}
      {showBookshelfPrompt && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 10, 8, 0.85)',
          zIndex: 220,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="rpg-box" style={{ 
            width: '90%', 
            maxWidth: '450px', 
            background: 'rgba(30, 20, 15, 0.98)', 
            borderColor: '#ffd700', 
            boxShadow: '0 0 25px rgba(255, 215, 0, 0.3)',
            color: '#eae0d5',
            padding: '25px',
            textAlign: 'center',
            borderRadius: '12px',
            border: '3px solid #ffd700',
            backdropFilter: 'blur(8px)'
          }}>
            <h3 className="pixel-header" style={{ color: '#ffd700', fontSize: '1.4rem', margin: '0 0 15px 0' }}>
              📚 BOOKS & FILMS CORNER 🎬
            </h3>
            <p className="pixel-text" style={{ fontSize: '1.15rem', color: '#c9bda7', marginBottom: '25px', lineHeight: '1.5' }}>
              Welcome to my cozy internet corner! What would you like to do?
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={() => {
                  playSound('chime');
                  setShowBookshelfPrompt(false);
                  setShowBookshelfModal(true);
                  setBookshelfTab('anime');
                }}
                className="pixel-button"
                style={{ 
                  background: '#d4af37', 
                  color: '#1a100a', 
                  border: '3px solid #ffd700', 
                  padding: '12px', 
                  fontSize: '1.1rem', 
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                  transition: 'transform 0.1s'
                }}
              >
                📖 KNOW MORE
              </button>
              
              <button 
                onClick={() => {
                  playSound('chime');
                  setShowBookshelfPrompt(false);
                  setShowTrivia(true);
                  setCurrentQuestionIdx(0);
                  setCorrectStreak(0);
                  setTriviaResult(null);
                }}
                className="pixel-button"
                style={{ 
                  background: '#8a2be2', 
                  color: '#fff', 
                  border: '3px solid #a855f7', 
                  padding: '12px', 
                  fontSize: '1.1rem', 
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                  transition: 'transform 0.1s'
                }}
              >
                🕹️ TEST YOUR KNOWLEDGE
              </button>
              
              <button 
                onClick={() => {
                  playSound('chime');
                  setShowBookshelfPrompt(false);
                }}
                className="pixel-button"
                style={{ 
                  background: 'transparent', 
                  color: '#8e7f72', 
                  border: '2px solid #5c4d3c', 
                  padding: '8px', 
                  fontSize: '0.95rem', 
                  cursor: 'pointer',
                  marginTop: '10px',
                  borderRadius: '4px'
                }}
              >
                NEVERMIND
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. 📖 Books & Films Info Modal Panel */}
      {showBookshelfModal && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(10, 6, 4, 0.9)',
          zIndex: 220,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10px'
        }}>
          <div className="rpg-box" style={{ 
            width: '95%', 
            maxWidth: '650px', 
            background: 'rgba(26, 18, 13, 0.98)', 
            borderColor: '#ffd700', 
            boxShadow: '0 0 30px rgba(255, 215, 0, 0.25)',
            color: '#eae0d5',
            padding: '20px',
            borderRadius: '12px',
            border: '3px solid #ffd700',
            maxHeight: '90%',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            backdropFilter: 'blur(8px)'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #ffd700', paddingBottom: '10px', marginBottom: '15px' }}>
              <span className="pixel-header" style={{ fontSize: '1.2rem', color: '#ffd700', textShadow: '0 0 5px rgba(255, 215, 0, 0.3)' }}>
                📖 BOOKS, ANIME & FILMS
              </span>
              <button 
                onClick={() => setShowBookshelfModal(false)}
                className="pixel-header"
                style={{ 
                  background: '#e53935', 
                  color: '#fff', 
                  border: '2px solid #000', 
                  padding: '4px 10px', 
                  fontSize: '0.75rem', 
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
              >
                CLOSE [X]
              </button>
            </div>

            {/* Tabs Row */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
              <button
                onClick={() => { playSound('chime'); setBookshelfTab('anime'); }}
                style={{
                  flex: 1,
                  padding: '10px 5px',
                  background: bookshelfTab === 'anime' ? '#ffd700' : 'rgba(255, 255, 255, 0.05)',
                  color: bookshelfTab === 'anime' ? '#100d0a' : '#c9bda7',
                  border: `2px solid ${bookshelfTab === 'anime' ? '#ffd700' : '#5c4d3c'}`,
                  fontSize: '1.05rem',
                  fontFamily: 'inherit',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  transition: 'all 0.2s'
                }}
              >
                📚 ANIME & MANGA
              </button>
              <button
                onClick={() => { playSound('chime'); setBookshelfTab('movies'); }}
                style={{
                  flex: 1,
                  padding: '10px 5px',
                  background: bookshelfTab === 'movies' ? '#ffd700' : 'rgba(255, 255, 255, 0.05)',
                  color: bookshelfTab === 'movies' ? '#100d0a' : '#c9bda7',
                  border: `2px solid ${bookshelfTab === 'movies' ? '#ffd700' : '#5c4d3c'}`,
                  fontSize: '1.05rem',
                  fontFamily: 'inherit',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  transition: 'all 0.2s'
                }}
              >
                🎬 MOVIES & FILMS
              </button>
            </div>

            {/* Tab Contents */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
              {bookshelfTab === 'anime' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ borderBottom: '1px solid rgba(255, 215, 0, 0.15)', paddingBottom: '10px' }}>
                    <p style={{ margin: '0 0 10px 0', fontStyle: 'italic', color: '#c9bda7', fontSize: '1rem' }}>
                      "My absolute fixations in the manga & anime realm—masterpieces that redefined visual storytelling for me."
                    </p>
                  </div>
                  
                  {[
                    {
                      title: "Hunter x Hunter",
                      type: "Anime / Manga",
                      status: "All-Time Favorite",
                      desc: "Togashi's masterclass in subverting battle shonen expectations. The Chimera Ant arc is a philosophical essay disguised as an action sequence. Pure narrative genius.",
                      rating: "⭐⭐⭐⭐⭐"
                    },
                    {
                      title: "Jujutsu Kaisen",
                      type: "Manga & Anime",
                      status: "Current Obsession",
                      desc: "Incredibly high-octane battles with a highly mathematical magic system. Gege Akutami writes with merciless pacing, and MAPPA's animation is simply breathtaking.",
                      rating: "⭐⭐⭐⭐⭐"
                    },
                    {
                      title: "Monster (Naoki Urasawa)",
                      type: "Manga & Anime",
                      status: "Masterpiece Mystery",
                      desc: "A chilling psychological thriller set in post-Cold War Germany. Johan Liebert is arguably the greatest antagonist in fiction. A deep dive into morality and human nature.",
                      rating: "⭐⭐⭐⭐⭐"
                    },
                    {
                      title: "Chainsaw Man",
                      type: "Manga",
                      status: "Highly Recommended",
                      desc: "Fujimoto's chaotic, cinematic, and profoundly emotional ride. It blends grindhouse gore with subtle, heart-wrenching slice-of-life storytelling. Completely unpredictable.",
                      rating: "⭐⭐⭐⭐½"
                    },
                    {
                      title: "Vagabond",
                      type: "Manga",
                      status: "Artistic Peak",
                      desc: "Takehiko Inoue's retelling of Musashi Miyamoto's life. The hand-drawn brush art is gallery-worthy. A profound story about strength, ego, and inner peace.",
                      rating: "⭐⭐⭐⭐⭐"
                    }
                  ].map((item, index) => (
                    <div key={index} style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1.5px solid rgba(255, 215, 0, 0.15)',
                      padding: '12px',
                      borderRadius: '8px',
                      boxShadow: 'inset 0 0 5px rgba(255, 255, 255, 0.02)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#ffd700' }}>{item.title}</span>
                        <span style={{ fontSize: '0.8rem', background: '#3a2010', color: '#ffd700', padding: '2px 6px', borderRadius: '4px', border: '1px solid #ffd700' }}>{item.status}</span>
                      </div>
                      <p style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: '#eae0d5', lineHeight: '1.4' }}>{item.desc}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#c9bda7' }}>
                        <span>Type: {item.type}</span>
                        <span>Rating: {item.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ borderBottom: '1px solid rgba(255, 215, 0, 0.15)', paddingBottom: '10px' }}>
                    <p style={{ margin: '0 0 10px 0', fontStyle: 'italic', color: '#c9bda7', fontSize: '1rem' }}>
                      "My film escapes—ranging from whimsical, hand-painted worlds to mind-bending sci-fi masterpieces."
                    </p>
                  </div>
                  
                  {[
                    {
                      title: "Studio Ghibli Favorites",
                      director: "Hayao Miyazaki",
                      highlights: "Spirited Away, Princess Mononoke, Howl's Moving Castle",
                      desc: "Miyazaki's works are pure magic. The hand-painted backgrounds, Joe Hisaishi's swelling nostalgic scores, and themes of environmentalism and pacifism always warm my soul.",
                      rating: "⭐⭐⭐⭐⭐"
                    },
                    {
                      title: "Interstellar",
                      director: "Christopher Nolan",
                      highlights: "No-compromise cosmic sci-fi with Hans Zimmer's epic organ score",
                      desc: "The ultimate journey into space, time, and human connection. Visually spectacular and scientifically sound. Cooper's library scenes never fail to give me goosebumps.",
                      rating: "⭐⭐⭐⭐⭐"
                    },
                    {
                      title: "The Dark Knight Trilogy",
                      director: "Christopher Nolan",
                      highlights: "Batman Begins, The Dark Knight, The Dark Knight Rises",
                      desc: "The definitive cinematic take on superhero folklore. Gritty, realistic, perfectly paced, and featuring Heath Ledger's legendary performance that changed movie history forever.",
                      rating: "⭐⭐⭐⭐⭐"
                    },
                    {
                      title: "Inception",
                      director: "Christopher Nolan",
                      highlights: "A mechanical dream-heist thriller",
                      desc: "A masterfully constructed clockwork puzzle of a movie. The world-bending dream physics, deep lore, and absolute thriller pacing make this a movie I can rewatch endless times.",
                      rating: "⭐⭐⭐⭐½"
                    }
                  ].map((item, index) => (
                    <div key={index} style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1.5px solid rgba(255, 215, 0, 0.15)',
                      padding: '12px',
                      borderRadius: '8px',
                      boxShadow: 'inset 0 0 5px rgba(255, 255, 255, 0.02)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#ffd700' }}>{item.title}</span>
                        <span style={{ fontSize: '0.8rem', background: '#251b2a', color: '#c084fc', padding: '2px 6px', borderRadius: '4px', border: '1px solid #c084fc' }}>{item.director}</span>
                      </div>
                      <p style={{ margin: '0 0 6px 0', fontSize: '0.85rem', color: '#ffd54f', fontWeight: '500' }}>⭐ Highlights: {item.highlights}</p>
                      <p style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: '#eae0d5', lineHeight: '1.4' }}>{item.desc}</p>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.8rem', color: '#c9bda7' }}>
                        <span>Rating: {item.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`

        @keyframes scale-up-goal {
          0% { transform: scale(1); }
          100% { transform: scale(1.15); }
        }
        @keyframes pulse-glow {
          0% { filter: brightness(1); }
          100% { filter: brightness(1.4); }
        }
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
