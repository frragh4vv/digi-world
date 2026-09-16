import React, { useEffect, useState, useRef } from 'react';
import Sprite from './Sprite';
import PixelProp from './PixelProp';
import { useGameState } from './GameStateContext';
import { 
  MAP_COLS, 
  MAP_ROWS, 
  isTileSolid,
  getTileType,
  getFloorType,
  INTERACTABLE_OBJECTS,
  getFurnitureDialogue
} from '../mapConfig';

// ── Raghav NPC "mini-AI" ────────────────────────────────────────────────────
// Walkable standing tiles next to each activity, the way Raghav should face once
// there, and what he "thinks"/does. He wanders between these, acting out his life.
const RAGHAV_STATIONS = [
  { col: 9,  row: 6,  dir: 'up',   thought: '⌨️ shipping code…' },
  { col: 3,  row: 6,  dir: 'left', thought: '🧗 sending a V5!' },
  { col: 7,  row: 2,  dir: 'up',   thought: '🍳 cooking shawarma' },
  { col: 16, row: 11, dir: 'down', thought: '⚽ top-corner finish!' },
  { col: 10, row: 12, dir: 'down', thought: '🚲 going for a ride' },
  { col: 17, row: 3,  dir: 'up',   thought: '📚 re-reading HxH' },
  { col: 3,  row: 11, dir: 'down', thought: '🗺️ planning a trek' },
  { col: 2,  row: 3,  dir: 'up',   thought: '😴 power nap…' },
];

// Breadth-first path over walkable tiles. Returns the list of step cells from
// just-after-start through goal, or null if unreachable.
function findPath(start, goal) {
  const k = (c, r) => `${c},${r}`;
  if (isTileSolid(goal.col, goal.row) || isTileSolid(start.col, start.row)) return null;
  const came = new Map([[k(start.col, start.row), null]]);
  const queue = [start];
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let found = false;
  while (queue.length) {
    const cur = queue.shift();
    if (cur.col === goal.col && cur.row === goal.row) { found = true; break; }
    for (const [dc, dr] of dirs) {
      const nc = cur.col + dc, nr = cur.row + dr;
      if (nc < 0 || nr < 0 || nc >= MAP_COLS || nr >= MAP_ROWS) continue;
      if (isTileSolid(nc, nr)) continue;
      const key = k(nc, nr);
      if (came.has(key)) continue;
      came.set(key, cur);
      queue.push({ col: nc, row: nr });
    }
  }
  if (!found) return null;
  const path = [];
  let cur = goal;
  while (cur) { path.unshift(cur); cur = came.get(k(cur.col, cur.row)); }
  path.shift(); // drop the start cell
  return path;
}

// ── Shared menu data (used by both the rendered UI and the D-pad navigator) ──
const FOCUS_RING = {
  outline: '3px solid #ffd166',
  outlineOffset: '2px',
  boxShadow: '0 0 12px rgba(255, 209, 102, 0.65)',
};

const KITCHEN_MENU = [
  { id: 'popcorn', type: 'dbt-popcorn', title: 'DBT Popcorn', desc: 'Warm, airy kernels puffed with tandoori butter!', effect: '+25 Stamina' },
  { id: 'shwarma', type: 'shwarma', title: 'Lebanese Shwarma', desc: 'Spicy wraps full of garlic-mustard goodness!', effect: '+25 Stamina' },
  { id: 'chaap', type: 'chaap', title: 'Soya Chaap Skewer', desc: 'Flame-grilled spicy protein pieces!', effect: '+25 Stamina' },
  { id: 'garlic-bread', type: 'garlic-bread', title: 'Garlic Bread', desc: 'Warm, toasted golden garlic butter slices!', effect: '+25 Stamina' },
  { id: 'thumbs-up', type: 'thumbs-up', title: 'Thumbs Up Bottle', desc: 'Cold glass bottle cola with fizzy tingle!', effect: '+25 Stamina' },
  { id: 'coffee', type: 'coffee', title: 'Hot Coffee Mug', desc: 'Espresso shot. Grants 15s CAFFEINE SPEED surge!', effect: '+25 Stamina & Speedup' }
];

// Character-creation option rows (navigated with the D-pad, row by row)
const GENDERS = ['male', 'female'];
const FACE_STYLES = [
  { id: 'classic', label: '😊 Classic' },
  { id: 'glasses', label: '👓 Specs' },
  { id: 'visor', label: '🕶️ Visor' },
  { id: 'cute', label: '🌸 Blush' }
];
const SKIN_COLORS = ['#ffdbac', '#ffb6c1', '#e0ac69', '#c68642', '#8d5524'];
const HAIR_COLORS = ['#8a2be2', '#000000', '#ffffff', '#e53935', '#ff8c00', '#ffd700', '#43a047', '#1e88e5', '#ff69b4'];
const SHIRT_COLORS = ['#1e88e5', '#e53935', '#43a047', '#ffd700', '#8a2be2', '#00e5ff', '#ff8c00', '#ffffff', '#222222'];
const PANTS_COLORS = ['#ffd700', '#1e88e5', '#777777', '#8b4513', '#222222', '#e53935'];
const STAT_KEYS = ['stamina', 'curiosity', 'reflexes', 'intellect'];
const STAT_INFO = {
  stamina:   { icon: '💪', label: 'Stamina',   perk: 'bigger energy tank, slower drain' },
  curiosity: { icon: '🔍', label: 'Curiosity', perk: 'inspect things from further away' },
  reflexes:  { icon: '⚡', label: 'Reflexes',  perk: 'walk & bike faster' },
  intellect: { icon: '🧠', label: 'Intellect', perk: 'trivia hints, faster cooking' },
};
// Creation-screen row map for the D-pad: 0 gender · 1 face · 2 skin · 3 hair
// · 4 shirt · 5 pants · 6-9 stat rows (◀ takes / ▶ gives a point) · 10 START
const CREATION_ROW_SIZES = [2, 4, 5, 9, 9, 6, 1, 1, 1, 1, 1];

// Background colour for each floor zone, so prop/obstacle tiles can paint the
// SAME floor as their surroundings instead of a dark box. Keep in sync with the
// floor-type branches in the tile renderer below.
const floorBgFor = (type, col, row) => {
  switch (type) {
    // Wood-plank base zones → transparent so the grid's wood-floor background shows
    // behind props instead of a flat box.
    case 'grass': return 'transparent';
    case 'path': return 'transparent';
    case 'restaurant-floor': return 'transparent';
    case 'rug': return 'rgba(27, 23, 51, 0.55)';
    // Textured zones → a representative colour (props mostly cover the tile).
    case 'forest-floor': return '#1f6b2e';
    case 'climbing-pad': return '#0d47a1';
    case 'garage-floor': return '#6f6f73';
    case 'soccer-turf': return '#2f7d33';
    case 'manga-lounge': return '#c8a96a';
    default: return 'transparent';
  }
};

// 🔧 DEV-ONLY TILE NUMBERS ───────────────────────────────────────────────────
// Overlays a tiny index number on every tile so issues can be reported by number
// ("tile 152 looks wrong"). idx → grid position: col = idx % MAP_COLS, row = Math.floor(idx / MAP_COLS).
// TO REMOVE BEFORE GOING LIVE: set this to false (or delete this const + the
// `{SHOW_TILE_NUMBERS && (...)}` block in the tile render below).
const SHOW_TILE_NUMBERS = false;

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
    } else if (type === 'meow') {
      // Two quick rising sine chirps — close enough to a pixel cat
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.09);
      osc.frequency.exponentialRampToValueAtTime(540, ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
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
    caffeineTimer, setCaffeineTimer,
    activeItemId, setActiveItemId
  } = useGameState();

  // Spawning Customizer states
  const [customName, setCustomName] = useState("Wanderer");
  const [raghavDirection, setRaghavDirection] = useState('down');
  // Raghav NPC "mini-AI" — autonomous position + current thought bubble
  const [raghavPos, setRaghavPos] = useState({ col: 5, row: 6 });
  const [raghavThought, setRaghavThought] = useState(null);
  const raghavBrain = useRef({ pos: { col: 5, row: 6 }, path: [], mode: 'idle', actUntil: 0, stationIdx: -1 });
  const [gameStarted, setGameStarted] = useState(false);
  const [pointsPool, setPointsPool] = useState(20);
  const [statsAlloc, setStatsAlloc] = useState({ stamina: 5, curiosity: 5, reflexes: 5, intellect: 5 });
  // Always-ticking frame for static sprite previews (creation screen, gallery, guestbook)
  const [previewFrame, setPreviewFrame] = useState(0);

  // ── Game Boy-style menu navigation ─────────────────────────────────────
  // Arrow keys / D-pad move a gold highlight across the options of whichever
  // selection screen is open; A (E / Enter) confirms it; B / Esc backs out.
  const [menuRow, setMenuRow] = useState(0);
  const [menuCol, setMenuCol] = useState(0);

  // ── Quest toast notifications (top-center popups) ───────────────────────
  const [toasts, setToasts] = useState([]);
  const toastSeq = useRef(0);
  const pushToast = (text, color = 'var(--rpg-highlight)') => {
    const id = ++toastSeq.current;
    setToasts(t => [...t.slice(-2), { id, text, color }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };

  // ── Easter eggs: wandering cat, marshmallow roasting, fridge raids ──────
  const CAT_SPOTS = [
    { col: 12, row: 8 }, { col: 6, row: 8 }, { col: 13, row: 6 },
    { col: 5, row: 13 }, { col: 16, row: 4 },
  ];
  const [catSpot, setCatSpot] = useState(0);
  const [petCount, setPetCount] = useState(0);
  const [roastCount, setRoastCount] = useState(0);
  const [raidCount, setRaidCount] = useState(0);
  const [isRoasting, setIsRoasting] = useState(false);

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
  const [activeStackDrawer, setActiveStackDrawer] = useState('frontend'); // 'frontend' | 'backend' | 'devops' | 'core'
  
  const [showFitnessStats, setShowFitnessStats] = useState(false);
  const [showTacticalBlueprints, setShowTacticalBlueprints] = useState(false);
  const [showPCProjects, setShowPCProjects] = useState(false);
  const [pcActiveProject, setPcActiveProject] = useState('scraper'); // 'scraper' | 'rpg' | 'tactics'
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
  // 🧠 Intellect perk: a once-per-question hint that greys out two wrong answers
  const [triviaHidden, setTriviaHidden] = useState([]);
  const [triviaHintUsed, setTriviaHintUsed] = useState(false);

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

  // Drive idle sprite-preview animation (creation screen + gallery cards)
  useEffect(() => {
    const tick = setInterval(() => setPreviewFrame(f => (f + 1) % 4), 220);
    return () => clearInterval(tick);
  }, []);

  // Reset the menu highlight whenever a selection screen opens / changes page
  useEffect(() => {
    setMenuRow(0);
    setMenuCol(0);
  }, [activeGameStation, showTrivia, showKitchen, showVisitorGallery, showTechStack, showPCProjects, currentQuestionIdx, gameStarted]);

  // New trivia question → fresh hint
  useEffect(() => {
    setTriviaHidden([]);
    setTriviaHintUsed(false);
  }, [currentQuestionIdx, showTrivia]);

  // 🧠 Intellect perk — grey out two wrong answers (once per question)
  const useTriviaHint = () => {
    if (triviaHintUsed || triviaResult) return;
    const ans = triviaQuestions[currentQuestionIdx].ans;
    const wrong = [0, 1, 2, 3].filter(i => i !== ans);
    // deterministic-ish pick: hide the first two wrong options
    setTriviaHidden(wrong.slice(0, 2));
    setTriviaHintUsed(true);
    playSound('chime');
    setDialogueText('🧠 [Intellect]: Two suspicious options fade away…');
  };

  // Shared handler for the game-station choice menu (mouse + D-pad)
  const stationChoose = (idx) => {
    const station = activeGameStation;
    if (!station) return;
    setActiveGameStation(null);
    if (idx === 0) {
      if (station === 'football') handleInspect('football');
      if (station === 'bike') handleInspect('trekking');
      if (station === 'arcade') handleInspect('anime');
    } else if (idx === 1) {
      if (station === 'football') setShowFullscreenSoccer(true);
      if (station === 'bike') setShowFullscreenBiking(true);
      if (station === 'arcade') {
        setShowTrivia(true);
        setCurrentQuestionIdx(0);
        setCorrectStreak(0);
        setTriviaResult(null);
      }
    }
  };

  // Shared handler for PC project selection (mouse + D-pad)
  const PC_PROJECTS = [
    { id: 'scraper', title: '🔮 Jujutsu Stock Scraper', desc: 'Node.js web scraper indexing fandom stock prices.' },
    { id: 'rpg', title: '🏡 Cozy RPG Room Engine', desc: 'React single page game engine. Layout shifts: 0!' },
    { id: 'tactics', title: '⚽ UEFA Tactics Backtracker', desc: 'Graph algorithm mapping Champions League formations.' }
  ];
  const selectPcProject = (projectId) => {
    playSound('chime');
    setPcActiveProject(projectId);
    if (projectId === 'scraper') {
      setSimulatedLogs([
        "🚀 Initiating Jujutsu Stock Tracker Scraper Daemon v1.0.4...",
        "📡 Spawning cluster workers at Kyoto School and Tokyo School endpoints...",
        "🔑 Authentication handshake: SUCCESS. Node cluster active.",
        "📊 Fetching baseline Cursed Energy Indexes...",
        "⚡ Cursed Energy Index: 2,450.40 (+1.25%) | Gojo Satoru Market Cap: ∞"
      ]);
    } else if (projectId === 'rpg') {
      setSimulatedLogs([
        "🏡 Cozy RPG Space Engine Bootstrapping...",
        "🧱 Bounding collision maps (SOLID_TILES loaded: 36 nodes)...",
        "🎭 Character sprite custom colors injected successfully.",
        "🔊 Audio Web Synths: READY (Triangle & Square waves bound).",
        "🚀 Dev Server status: RUNNING. Layout shift counts: 0."
      ]);
    } else if (projectId === 'tactics') {
      setSimulatedLogs([
        "⚽ Loading UEFA Backtrack Tactics matrix...",
        "🧬 Parsing Graph vertex configurations (4-3-3 inverted)...",
        "📐 Core defense entities layered: decoupled from UI viewports.",
        "🏃 Midfield dispatchers compiled. Attack routines: bound.",
        "🔥 Tactical analysis optimal: System decoupled."
      ]);
    }
  };

  // Apply a creation-screen choice for (row, col) — used by clicks AND the D-pad
  const applyCreationChoice = (row, col) => {
    if (row === 0) setSpriteGender(GENDERS[col]);
    else if (row === 1) setFaceStyle(FACE_STYLES[col].id);
    else if (row === 2) setSelectedSkinColor(SKIN_COLORS[col]);
    else if (row === 3) setSelectedHatColor(HAIR_COLORS[col]);
    else if (row === 4) setSelectedShirtColor(SHIRT_COLORS[col]);
    else if (row === 5) setSelectedPantsColor(PANTS_COLORS[col]);
  };

  // ── GLOBAL GAME BOY CONTROLS ──────────────────────────────────────────────
  // One window-level listener makes the whole site console-playable:
  //  · B / Esc      → close the topmost open screen (no modal can trap you)
  //  · Arrow D-pad  → move the gold focus highlight on whichever menu is open
  //  · A (E/Enter)  → confirm the focused option
  useEffect(() => {
    const handler = (e) => {
      const tag = e.target && e.target.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA';
      const k = (e.key || '').toLowerCase();
      const isBack = k === 'b' || e.key === 'Escape';
      const isConfirm = k === 'e' || e.key === 'Enter';
      const isArrow = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k);
      if (typing && e.key !== 'Escape' && e.key !== 'Enter') return;

      // Fullscreen minigames own their keys (incl. B/Esc to quit)…
      if (showFullscreenSoccer) return;
      if (showFullscreenBiking) {
        // …except the garage vehicle-select screen, which the D-pad drives here
        // (the race's own key handler only mounts once a bike is selected).
        if (!bikeSelected) {
          if (k === 'arrowleft' || k === 'arrowright') {
            e.preventDefault();
            playSound('step');
            setSelectedMotorbike(m => (m === 'shine' ? 'mt15' : 'shine'));
          } else if (isConfirm) {
            e.preventDefault();
            playSound('chime');
            setBikeSelected(true);
          } else if (isBack) {
            e.preventDefault();
            playSound('thump');
            setShowFullscreenBiking(false);
          }
        }
        return;
      }

      // B / Esc — close the topmost overlay, strictly one per press
      if (isBack) {
        let closed = true;
        if (showGuestbookSubmit) setShowGuestbookSubmit(false);
        else if (selectedGalleryProfile) setSelectedGalleryProfile(null);
        else if (selectedVisitorReview) setSelectedVisitorReview(null);
        else if (showVisitorGallery) setShowVisitorGallery(false);
        else if (showTravelDiary) setShowTravelDiary(false);
        else if (showCarousel) setShowCarousel(false);
        else if (showKitchen) { setShowKitchen(false); setCookingItem(null); setCookingProgress(0); }
        else if (showTrivia) setShowTrivia(false);
        else if (showClimbingQTE) setShowClimbingQTE(false);
        else if (showTechStack) setShowTechStack(false);
        else if (showFitnessStats) setShowFitnessStats(false);
        else if (showTacticalBlueprints) setShowTacticalBlueprints(false);
        else if (showPCProjects) setShowPCProjects(false);
        else if (activeGameStation) setActiveGameStation(null);
        else if (activeItemId) setActiveItemId(null);
        else closed = false;
        if (closed) {
          e.preventDefault();
          playSound('thump');
        }
        return;
      }

      // During the climbing QTE, letters/arrows are game inputs — leave them be
      if (showClimbingQTE) return;

      // ── D-pad + A on each selection screen ──
      if (activeGameStation) {
        if (k === 'arrowup' || k === 'arrowdown') {
          e.preventDefault();
          playSound('step');
          setMenuRow(r => (r + (k === 'arrowdown' ? 1 : 2)) % 3);
        } else if (isConfirm) {
          e.preventDefault();
          playSound('chime');
          stationChoose(menuRow);
        }
        return;
      }

      if (showTrivia) {
        if (k === 'arrowup' || k === 'arrowdown') {
          e.preventDefault();
          playSound('step');
          setMenuRow(r => {
            let n = r;
            for (let i = 0; i < 4; i++) {
              n = (n + (k === 'arrowdown' ? 1 : 3)) % 4;
              if (!triviaHidden.includes(n)) break;
            }
            return n;
          });
        } else if (isConfirm && !triviaResult) {
          e.preventDefault();
          if (!triviaHidden.includes(menuRow)) handleTriviaAnswer(menuRow);
        } else if (k === 'h' && playerStats.intellect >= 7) {
          e.preventDefault();
          useTriviaHint();
        }
        return;
      }

      if (showKitchen && !cookingItem) {
        if (isArrow) {
          e.preventDefault();
          playSound('step');
          const d = k === 'arrowleft' ? -1 : k === 'arrowright' ? 1 : k === 'arrowup' ? -2 : 2;
          setMenuRow(i => (i + d + KITCHEN_MENU.length) % KITCHEN_MENU.length);
        } else if (isConfirm) {
          e.preventDefault();
          handleCookFood(KITCHEN_MENU[menuRow]);
        }
        return;
      }

      if (showTechStack) {
        if (k === 'arrowup' || k === 'arrowdown') {
          e.preventDefault();
          const ids = ['frontend', 'backend', 'devops', 'core'];
          const cur = ids.indexOf(activeStackDrawer);
          playSound('chime');
          setActiveStackDrawer(ids[(cur + (k === 'arrowdown' ? 1 : 3)) % 4]);
        }
        return;
      }

      if (showPCProjects) {
        if (k === 'arrowup' || k === 'arrowdown') {
          e.preventDefault();
          const cur = PC_PROJECTS.findIndex(p => p.id === pcActiveProject);
          selectPcProject(PC_PROJECTS[(cur + (k === 'arrowdown' ? 1 : 2)) % 3].id);
        }
        return;
      }

      if (showTacticalBlueprints) {
        if (isConfirm) {
          e.preventDefault();
          playSound('chime');
          setShowTacticalBlueprints(false);
          setShowFullscreenSoccer(true);
        }
        return;
      }

      if (showCarousel) {
        if (k === 'arrowleft' || k === 'arrowright') {
          e.preventDefault();
          playSound('step');
          setCarouselIdx(p => (k === 'arrowleft' ? (p === 0 ? polaroids.length - 1 : p - 1) : (p === polaroids.length - 1 ? 0 : p + 1)));
        }
        return;
      }

      if (showTravelDiary) {
        if (k === 'arrowleft' || k === 'arrowright') {
          e.preventDefault();
          playSound('step');
          setDiaryIdx(p => (k === 'arrowleft' ? (p - 1 + travelSlides.length) % travelSlides.length : (p + 1) % travelSlides.length));
        }
        return;
      }

      if (showVisitorGallery && !selectedGalleryProfile && !showGuestbookSubmit) {
        if (k === 'arrowleft' || k === 'arrowright') {
          e.preventDefault();
          playSound('step');
          setMenuRow(i => (i + (k === 'arrowright' ? 1 : guestbookEntries.length - 1)) % Math.max(1, guestbookEntries.length));
        } else if (isConfirm && guestbookEntries[menuRow]) {
          e.preventDefault();
          playSound('chime');
          setSelectedGalleryProfile(guestbookEntries[menuRow]);
        }
        return;
      }

      // ── Character-creation screen: full D-pad walkthrough ──
      if (!gameStarted) {
        const rows = CREATION_ROW_SIZES.length;
        if (isArrow) {
          e.preventDefault();
          if (k === 'arrowup' || k === 'arrowdown') {
            playSound('step');
            setMenuRow(r => {
              const n = (r + (k === 'arrowdown' ? 1 : rows - 1)) % rows;
              setMenuCol(c => Math.min(c, CREATION_ROW_SIZES[n] - 1));
              return n;
            });
          } else {
            const dir = k === 'arrowright' ? 1 : -1;
            if (menuRow >= 6 && menuRow <= 9) {
              // stat rows: ◀ takes a point back, ▶ spends one
              adjustStat(STAT_KEYS[menuRow - 6], dir);
              playSound(dir > 0 ? 'chime' : 'thump');
            } else if (menuRow <= 5) {
              playSound('step');
              const size = CREATION_ROW_SIZES[menuRow];
              const next = (menuCol + dir + size) % size;
              setMenuCol(next);
              applyCreationChoice(menuRow, next);
            }
          }
        } else if (isConfirm) {
          if (typing && e.key !== 'Enter') return;
          e.preventDefault();
          if (menuRow === 10 || e.key === 'Enter') handleStartGame();
          else if (menuRow <= 5) applyCreationChoice(menuRow, menuCol);
        }
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameStarted, menuRow, menuCol, activeGameStation, showTrivia, triviaResult, triviaHidden, triviaHintUsed,
      showKitchen, cookingItem, showCarousel, showTravelDiary, showVisitorGallery, selectedGalleryProfile,
      selectedVisitorReview, showGuestbookSubmit, showTechStack, activeStackDrawer, showPCProjects, pcActiveProject,
      showFitnessStats, showTacticalBlueprints, showClimbingQTE, showFullscreenSoccer, showFullscreenBiking,
      bikeSelected, activeItemId, guestbookEntries, currentQuestionIdx, playerStats, statsAlloc, pointsPool]);

  // ── Raghav NPC brain: wander → act → repeat ──────────────────────────────
  // Picks a random activity station, paths there avoiding walls, faces it, shows
  // a thought bubble for a few seconds, then heads to the next one.
  useEffect(() => {
    if (!gameStarted) return;
    const SPEED = 0.07; // cells per tick
    let lastDir = 'down';
    const id = setInterval(() => {
      const s = raghavBrain.current;

      if (s.mode === 'acting') {
        if (Date.now() >= s.actUntil) { s.mode = 'idle'; setRaghavThought(null); }
        return;
      }

      if (s.mode === 'idle' || s.path.length === 0) {
        let idx;
        do { idx = Math.floor(Math.random() * RAGHAV_STATIONS.length); }
        while (idx === s.stationIdx && RAGHAV_STATIONS.length > 1);
        const goal = RAGHAV_STATIONS[idx];
        const start = { col: Math.round(s.pos.col), row: Math.round(s.pos.row) };
        const path = findPath(start, { col: goal.col, row: goal.row });
        if (!path) { s.mode = 'idle'; return; }
        s.stationIdx = idx;
        s.path = path;
        s.mode = 'walking';
        return;
      }

      // walking toward the next waypoint
      const next = s.path[0];
      const dc = next.col - s.pos.col;
      const dr = next.row - s.pos.row;
      const dist = Math.hypot(dc, dr) || 1;
      let dir = lastDir;
      if (Math.abs(dc) > Math.abs(dr)) dir = dc > 0 ? 'right' : 'left';
      else dir = dr > 0 ? 'down' : 'up';
      if (dir !== lastDir) { lastDir = dir; setRaghavDirection(dir); }

      if (dist < SPEED) {
        s.pos = { col: next.col, row: next.row };
        s.path.shift();
        if (s.path.length === 0) {
          const st = RAGHAV_STATIONS[s.stationIdx];
          setRaghavDirection(st.dir);
          lastDir = st.dir;
          setRaghavThought(st.thought);
          s.mode = 'acting';
          s.actUntil = Date.now() + 3500 + Math.random() * 2500;
        }
      } else {
        s.pos = { col: s.pos.col + (dc / dist) * SPEED, row: s.pos.row + (dr / dist) * SPEED };
      }
      setRaghavPos({ col: s.pos.col, row: s.pos.row });
    }, 33);
    return () => clearInterval(id);
  }, [gameStarted]);

  useEffect(() => {
    energyLevelRef.current = energyLevel;
  }, [energyLevel]);

  // ── Quest toasts: celebrate progress the moment it happens ───────────────
  const prevInspectedCount = useRef(0);
  useEffect(() => {
    const MAIN_LANDMARKS = ['profile', 'bouldering', 'anime', 'trekking', 'football'];
    if (inspectedItems.length > prevInspectedCount.current) {
      const newest = inspectedItems[inspectedItems.length - 1];
      if (MAIN_LANDMARKS.includes(newest)) {
        const done = MAIN_LANDMARKS.filter(m => inspectedItems.includes(m)).length;
        if (done === MAIN_LANDMARKS.length) {
          pushToast('🏆 MAIN QUEST COMPLETE — all 5 landmarks explored!', '#ffd166');
          playSound('stadium');
          unlockBadge('Overworld Explorer');
        } else {
          pushToast(`📜 Main quest: landmark inspected (${done}/5)`);
          playSound('chime');
        }
      }
    }
    prevInspectedCount.current = inspectedItems.length;
  }, [inspectedItems]);

  const prevBadgeCount = useRef(0);
  useEffect(() => {
    if (equippedBadges.length > prevBadgeCount.current) {
      pushToast(`🏅 Badge unlocked: ${equippedBadges[equippedBadges.length - 1]}`, '#ffd166');
      playSound('stadium');
    }
    prevBadgeCount.current = equippedBadges.length;
  }, [equippedBadges]);

  // 🐈 The cat occasionally relocates on its own (cats answer to no one)
  useEffect(() => {
    if (!gameStarted) return;
    const wander = setInterval(() => {
      if (Math.random() < 0.5) setCatSpot(s => (s + 1) % CAT_SPOTS.length);
    }, 14000);
    return () => clearInterval(wander);
  }, [gameStarted]);

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
    // 🔍 Curiosity perk: each point above 5 widens the inspect radius.
    let minDistance = 2.0 + (playerStats.curiosity - 5) * 0.1;

    // Check portfolio interactable objects.
    // 'profile' (Raghav himself) is NOT pinned to a tile — he roams, so we attach
    // his inspect to his live NPC position further below instead.
    INTERACTABLE_OBJECTS.forEach(obj => {
      if (obj.id === 'profile') return;
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
    const bikeDx = 9 - col;
    const bikeDy = 12 - row;
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

    // 🐈 Easter egg: the wandering cat
    const cat = CAT_SPOTS[catSpot];
    const catDx = cat.col - col, catDy = cat.row - row;
    if (Math.sqrt(catDx * catDx + catDy * catDy) < 1.4) {
      foundNearby = {
        id: 'cat',
        title: '??? · A Cat',
        dialogue: "🐈 A soft orange cat is loafing here, slowly blinking at you. It seems to own this room. Press E to pet.",
        inspectPrompt: 'PET THE CAT'
      };
    }

    // 🔥 Easter egg: roast a marshmallow at the campfire (4,12)
    const cfDx = 4 - col, cfDy = 12 - row;
    if (Math.sqrt(cfDx * cfDx + cfDy * cfDy) < 1.7) {
      foundNearby = {
        id: 'campfire-roast',
        title: 'Cozy Campfire',
        dialogue: isRoasting
          ? "🔥 [Campfire]: The marshmallow is browning nicely… don't drop it!"
          : "🔥 [Campfire]: The flames crackle invitingly. Press E to roast a marshmallow (+10 energy).",
        inspectPrompt: 'ROAST MARSHMALLOW'
      };
    }

    // 🥪 Easter egg: midnight fridge raid (left fridge at 6,1)
    const frDx = 6 - col, frDy = 1 - row;
    if (Math.sqrt(frDx * frDx + frDy * frDy) < 1.4) {
      foundNearby = {
        id: 'fridge-raid',
        title: 'Suspicious Fridge',
        dialogue: "🧊 [Fridge]: A faint glow comes from inside. Raghav labelled everything 'DO NOT EAT'. Press E anyway.",
        inspectPrompt: 'RAID FRIDGE'
      };
    }

    // Inspect the roaming developer himself — follows Raghav's live NPC position.
    const rp = raghavBrain.current.pos;
    const rdx = rp.col - col, rdy = rp.row - row;
    if (Math.sqrt(rdx * rdx + rdy * rdy) < 1.6) {
      foundNearby = {
        id: 'profile',
        title: 'Raghav · The Developer',
        dialogue: "🧑‍💻 [Raghav]: Oh hey — you caught me! Press E to inspect the developer (stats, story & projects).",
        inspectPrompt: 'INSPECT DEVELOPER'
      };
    }

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
      if (showFullscreenSoccer || showFullscreenBiking || showTravelDiary || showCarousel || showVisitorGallery || showKitchen || showTrivia || showGuestbookSubmit || showClimbingQTE || showTechStack || showFitnessStats || showTacticalBlueprints || showPCProjects) {
        keysPressed.current = {};
        clickTarget.current = null;
        animId = requestAnimationFrame(gameLoop);
        return;
      }

      // 1. Calculate dynamic player speed (caffeine boost, bike, ⚡ Reflexes stat)
      // Reflexes perk: each point above 5 = +2% move speed (15 pts → +20%).
      const reflexMult = 1 + (playerStats.reflexes - 5) * 0.02;
      // Stamina perk: each point above 5 drains the energy bar 6% slower.
      const drainMult = Math.max(0.4, 1 - (playerStats.stamina - 5) * 0.06);
      let baseSpeed = 0.08 * reflexMult;
      if (caffeineTimer > 0) {
        baseSpeed = 0.12 * reflexMult; // 1.5x speed boost from Caffeine Surge!
      }

      if (isRiding) {
        baseSpeed = (caffeineTimer > 0 ? 0.20 : 0.16) * reflexMult; // Even faster if caffeinated!
        // Drains energyLevel faster when biking!
        if (Math.random() < 0.008 * drainMult) {
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
        // slow normal walking energyLevel drain (💪 Stamina makes it slower)
        if (Math.random() < 0.002 * drainMult) {
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
          else if (type === 'computerglowing') {
            // Open PC live showcase!
            setShowPCProjects(true);
            selectPcProject('scraper');
            keysPressed.current['e'] = false;
            keysPressed.current[' '] = false;
          }
          else if (type === 'cat') {
            // 🐈 Pet the cat — it has opinions, then relocates.
            playSound('meow');
            const catLines = [
              "🐈 Mrrrp! The cat headbutts your hand approvingly.",
              "🐈 Purrrrrr… the cat kneads the floor like dough.",
              "🐈 The cat flops over and shows its belly. It's a trap.",
              "🐈 The cat slow-blinks at you. In cat, that means 'I love you'.",
              "🐈 The cat bites you gently, then licks the same spot. Cats.",
            ];
            setDialogueText(catLines[petCount % catLines.length]);
            const nextPets = petCount + 1;
            setPetCount(nextPets);
            if (nextPets === 5) {
              unlockBadge('Cat Whisperer');
            }
            // After a couple of pets the cat saunters off to a new spot
            if (nextPets % 2 === 0) {
              setCatSpot(s => (s + 1) % CAT_SPOTS.length);
            }
            keysPressed.current['e'] = false;
            keysPressed.current[' '] = false;
          }
          else if (type === 'campfire-roast') {
            // 🔥 Roast a marshmallow: short cozy ritual, +10 energy
            if (!isRoasting) {
              setIsRoasting(true);
              setDialogueText("🔥 Roasting a marshmallow… hold it steady… almost golden…");
              setTimeout(() => {
                setIsRoasting(false);
                playSound('gulp');
                setEnergyLevel(en => Math.min(100, en + 10));
                const nextRoast = roastCount + 1;
                setRoastCount(nextRoast);
                setDialogueText(nextRoast >= 3
                  ? "🍡 Perfectly toasted! You've mastered the campfire arts. (+10 energy)"
                  : "🍡 Crispy outside, molten inside. Heavenly. (+10 energy)");
                if (nextRoast === 3) unlockBadge('Fireside Chef');
              }, 1800);
            }
            keysPressed.current['e'] = false;
            keysPressed.current[' '] = false;
          }
          else if (type === 'fridge-raid') {
            // 🥪 Fridge raid: random loot, mild guilt
            playSound('gulp');
            const loot = [
              "🥪 You found half a sandwich labelled 'RAGHAV'S — DO NOT'. You ate it. (+5 energy)",
              "🧃 One suspicious mango juice box, expiry date smudged. Delicious. (+5 energy)",
              "🍮 A hidden caramel pudding behind the vegetables. Crime pays. (+5 energy)",
              "🧀 A single heroic cheese cube. It did not survive. (+5 energy)",
            ];
            setDialogueText(loot[raidCount % loot.length]);
            setEnergyLevel(en => Math.min(100, en + 5));
            const nextRaid = raidCount + 1;
            setRaidCount(nextRaid);
            if (nextRaid === 3) unlockBadge('Midnight Snacker');
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
  }, [gameStarted, isRiding, caffeineTimer, playerStats, catSpot, petCount, roastCount, raidCount, isRoasting]);
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

  // PC Stock market scraper simulated logs stream
  useEffect(() => {
    if (!showPCProjects || pcActiveProject !== 'scraper') return;

    const logPhrases = [
      "📡 Pulling cursed index from Jujutsu High data nodes...",
      "📈 Ryomen Sukuna stock surged +12.4% after finger ingestion!",
      "⚡ Fushiguro Megumi stock halted: Ten Shadows summon threat detected.",
      "🔒 Executing sandbox backtest on Cursed Speech API rates...",
      "💾 Web scraper successfully compiled 420 stock market listings.",
      "🟢 GCP cloud compute cluster running: Status Optimal.",
      "📊 Okkotsu Yuta stock cap reaches 9.4 Trillion Yen.",
      "🔍 Deep crawling Jujutsu Kaisen fandom wiki for cursed inventory databases...",
      "🕷️ Scraping completed in 420ms. Restructuring data buffers..."
    ];

    const logInterval = setInterval(() => {
      setSimulatedLogs(prev => {
        const next = [...prev, logPhrases[Math.floor(Math.random() * logPhrases.length)]];
        if (next.length > 7) next.shift(); // keep screen compact
        return next;
      });
    }, 1800);

    return () => clearInterval(logInterval);
  }, [showPCProjects, pcActiveProject]);

  const handleCookFood = (item) => {
    playSound('chime');
    setCookingItem(item);
    setCookingProgress(0);

    let progress = 0;
    // 🧠 Intellect perk: efficient chefs cook faster (80ms/tick at 5 → 40ms at 15)
    const tickMs = Math.max(40, 80 - (playerStats.intellect - 5) * 4);
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
    }, tickMs); // ~800ms cook at 5 INT, down to ~400ms at 15 INT
  };

  const handleStartGame = () => {
    if (!customName.trim()) return;

    playSound('chime');

    // Set GameState contexts — the allocated attribute build is now REAL:
    // ⚡ reflexes → speed · 💪 stamina → energy drain · 🔍 curiosity → inspect
    // range · 🧠 intellect → trivia hints + cook speed (see the game loop).
    setPlayerName(customName);
    setPlayerStats({ ...statsAlloc });
    setPlayerColors(customColors);

    setGameStarted(true);
    setTimeout(() => {
      window.focus();
      pushToast('🎒 Build locked in — your stats shape the run!');
    }, 400);
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
    // Gold ring marking the D-pad focus position (see CREATION_ROW_SIZES map)
    const ring = (r, c) => (menuRow === r && menuCol === c ? FOCUS_RING : {});

    return (
      <div 
        style={{
          width: '100%',
          height: '100%',
          background: '#0a0a10',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          boxSizing: 'border-box',
          position: 'relative',
          overflowY: 'auto'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <h2 className="pixel-header" style={{ fontSize: '1.15rem', color: 'var(--rpg-highlight)', margin: '0 0 8px 0', textShadow: '0 0 12px rgba(0,255,255,0.45)' }}>
            🏠 DESIGN YOUR EXPLORER
          </h2>
          <p className="pixel-text" style={{ fontSize: '1.2rem', color: '#7a7a8a', margin: 0 }}>
            Create an avatar, then step into Raghav's pixel world.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '20px', width: '100%', maxWidth: '780px', flexWrap: 'wrap', justifyContent: 'center' }}>
          
          {/* Left panel: Live Sprite Preview */}
          <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
            <div className="rpg-box" style={{ width: '160px', height: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 50% 40%, #11241a 0%, #000 75%)', border: '3px solid var(--rpg-text)', boxShadow: '0 0 18px rgba(0,255,102,0.45)' }}>
              <div style={{ width: '96px', height: '96px' }}>
                <Sprite direction="down" frame={previewFrame} customColors={customColors} />
              </div>
            </div>

            <p className="pixel-text" style={{ fontSize: '1.35rem', color: 'var(--rpg-highlight)', textAlign: 'center', margin: 0, fontWeight: 'bold' }}>
              {customName.trim() || 'Wanderer'}
            </p>
            <p className="pixel-text" style={{ fontSize: '1.05rem', color: '#888', textAlign: 'center', margin: 0 }}>
              Live preview · animates as you walk
            </p>
          </div>

          {/* Right panel: Name, Gender, Face, Skin, Clothes Presets */}
          <div style={{ flex: 1, minWidth: '290px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Explorer Name */}
            <div>
              <label className="pixel-header" style={{ fontSize: '0.72rem', color: 'var(--rpg-text)', display: 'block', marginBottom: '6px' }}>
                ✍️ EXPLORER NAME:
              </label>
              <input 
                type="text" 
                value={customName} 
                onChange={(e) => setCustomName(e.target.value.slice(0, 14))}
                className="pixel-text"
                placeholder="Enter Name..."
                style={{
                  background: '#000',
                  border: '3px solid var(--rpg-text)',
                  color: '#fff',
                  fontSize: '1.4rem',
                  padding: '5px 10px',
                  width: '100%',
                  textAlign: 'center',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Gender choices */}
            <div className="rpg-box" style={{ padding: '8px 12px', background: '#050508' }}>
              <span className="pixel-header" style={{ fontSize: '0.62rem', display: 'block', marginBottom: '6px', color: 'var(--rpg-highlight)' }}>🙋 SELECT SPRITE GENDER / HAIR:</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                {GENDERS.map((g, idx) => (
                  <button
                    key={g}
                    onClick={() => setSpriteGender(g)}
                    className="pixel-header"
                    style={{
                      flex: 1,
                      background: spriteGender === g ? 'var(--rpg-text)' : '#111',
                      color: spriteGender === g ? '#000' : '#fff',
                      border: '2px solid var(--rpg-text)',
                      padding: '6px 0',
                      cursor: 'pointer',
                      fontSize: '0.65rem',
                      ...ring(0, idx)
                    }}
                  >
                    {g === 'male' ? '♂️ Male (Short Spikes)' : '♀️ Female (Long locks)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Face Styles / Accessories */}
            <div className="rpg-box" style={{ padding: '8px 12px', background: '#050508' }}>
              <span className="pixel-header" style={{ fontSize: '0.62rem', display: 'block', marginBottom: '6px', color: 'var(--rpg-highlight)' }}>🕶️ FACE STYLE / ACCESSORY:</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                {FACE_STYLES.map((style, idx) => (
                  <button
                    key={style.id}
                    onClick={() => setFaceStyle(style.id)}
                    className="pixel-header"
                    style={{
                      background: faceStyle === style.id ? 'var(--rpg-accent)' : '#111',
                      color: '#fff',
                      border: `2px solid ${faceStyle === style.id ? 'var(--rpg-accent)' : '#444'}`,
                      padding: '4px 0',
                      cursor: 'pointer',
                      fontSize: '0.62rem',
                      ...ring(1, idx)
                    }}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Skin Colors grid */}
            <div className="rpg-box" style={{ padding: '8px 12px', background: '#050508' }}>
              <span className="pixel-header" style={{ fontSize: '0.62rem', display: 'block', marginBottom: '6px', color: 'var(--rpg-highlight)' }}>🤚 SKIN COMPLEXION TONE:</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                {SKIN_COLORS.map((color, idx) => (
                  <div
                    key={color}
                    onClick={() => setSelectedSkinColor(color)}
                    style={{
                      width: '28px',
                      height: '28px',
                      background: color,
                      border: `3px solid ${selectedSkinColor === color ? '#ffffff' : '#000000'}`,
                      cursor: 'pointer',
                      borderRadius: '50%',
                      boxShadow: selectedSkinColor === color ? '0 0 8px #fff' : 'none',
                      ...ring(2, idx)
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Apparel Colors presets */}
            <div className="rpg-box" style={{ padding: '8px 12px', background: '#050508', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="pixel-header" style={{ fontSize: '0.62rem', display: 'block', color: 'var(--rpg-highlight)' }}>👗 APPAREL COLOR PRESETS:</span>
              
              <div>
                <span className="pixel-header" style={{ fontSize: '0.52rem', color: '#888', display: 'block', marginBottom: '4px' }}>• Hair & Cap Color:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {HAIR_COLORS.map((color, idx) => (
                    <div
                      key={color}
                      onClick={() => setSelectedHatColor(color)}
                      style={{ width: '16px', height: '16px', background: color, border: selectedHatColor === color ? '2px solid #fff' : '1px solid #000', cursor: 'pointer', ...ring(3, idx) }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <span className="pixel-header" style={{ fontSize: '0.52rem', color: '#888', display: 'block', marginBottom: '4px' }}>• Shirt & Coat Color:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {SHIRT_COLORS.map((color, idx) => (
                    <div
                      key={color}
                      onClick={() => setSelectedShirtColor(color)}
                      style={{ width: '16px', height: '16px', background: color, border: selectedShirtColor === color ? '2px solid #fff' : '1px solid #000', cursor: 'pointer', ...ring(4, idx) }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <span className="pixel-header" style={{ fontSize: '0.52rem', color: '#888', display: 'block', marginBottom: '4px' }}>• Pants & Skirt Color:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {PANTS_COLORS.map((color, idx) => (
                    <div
                      key={color}
                      onClick={() => setSelectedPantsColor(color)}
                      style={{ width: '16px', height: '16px', background: color, border: selectedPantsColor === color ? '2px solid #fff' : '1px solid #000', cursor: 'pointer', ...ring(5, idx) }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* ⚔️ Attribute Point Allocator — these stats have REAL in-game effects */}
            <div className="rpg-box" style={{ padding: '8px 12px', background: '#050508' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span className="pixel-header" style={{ fontSize: '0.62rem', color: 'var(--rpg-highlight)' }}>⚔️ ALLOCATE ATTRIBUTES:</span>
                <span className="pixel-header" style={{ fontSize: '0.62rem', color: pointsPool > 0 ? '#ffd166' : '#666' }}>
                  POINTS LEFT: {pointsPool}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {STAT_KEYS.map((key, idx) => (
                  <div
                    key={key}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '3px 6px',
                      background: '#0a0a12', border: '1px solid #222',
                      ...(menuRow === 6 + idx ? FOCUS_RING : {})
                    }}
                  >
                    <span className="pixel-text" style={{ fontSize: '1.15rem', width: '110px', color: '#fff' }}>
                      {STAT_INFO[key].icon} {STAT_INFO[key].label}
                    </span>
                    <button
                      onClick={() => adjustStat(key, -1)}
                      className="pixel-header"
                      style={{ background: '#222', color: '#fff', border: '1px solid #555', width: '22px', cursor: 'pointer', fontSize: '0.7rem' }}
                    >–</button>
                    <div style={{ flex: 1, height: '10px', background: '#000', border: '1px solid #333', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: `${(statsAlloc[key] / 15) * 100}%`, height: '100%', background: 'var(--rpg-text)', transition: 'width 0.15s' }} />
                    </div>
                    <span className="pixel-text" style={{ fontSize: '1.15rem', width: '22px', textAlign: 'center', color: 'var(--rpg-highlight)' }}>{statsAlloc[key]}</span>
                    <button
                      onClick={() => adjustStat(key, 1)}
                      className="pixel-header"
                      style={{ background: '#222', color: '#fff', border: '1px solid #555', width: '22px', cursor: 'pointer', fontSize: '0.7rem' }}
                    >+</button>
                  </div>
                ))}
              </div>
              <p className="pixel-text" style={{ fontSize: '0.95rem', color: '#777', margin: '8px 0 0 0', lineHeight: 1.4 }}>
                {menuRow >= 6 && menuRow <= 9
                  ? `▶ ${STAT_INFO[STAT_KEYS[menuRow - 6]].perk}`
                  : '💡 These change how the game plays: speed, energy, inspect range, hints.'}
              </p>
            </div>

          </div>

        </div>

        {/* Start Game Action Button */}
        <button
          onClick={handleStartGame}
          className="pixel-header animate-bob"
          style={{
            marginTop: '20px',
            background: 'var(--rpg-accent)',
            color: '#fff',
            border: '4px solid #000',
            padding: '12px 30px',
            fontSize: '0.95rem',
            cursor: 'pointer',
            boxShadow: '3px 3px 0 #000',
            outline: 'none',
            ...(menuRow === 10 ? FOCUS_RING : {})
          }}
        >
          🎮 ENTER COZY ROOM [A]
        </button>

        <p className="pixel-text" style={{ fontSize: '1.05rem', color: '#666', marginTop: '12px', textAlign: 'center' }}>
          🎮 D-pad / arrows: move the gold highlight · A / Enter: select · Enter anywhere: start
        </p>

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

      {/* 🍞 Quest / badge toast stack (top-center popups) */}
      <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', zIndex: 300, display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center', pointerEvents: 'none' }}>
        {toasts.map(t => (
          <div
            key={t.id}
            className="pixel-header animate-bob"
            style={{
              background: 'rgba(10, 10, 18, 0.92)',
              color: t.color,
              border: `2px solid ${t.color}`,
              padding: '6px 14px',
              fontSize: '0.7rem',
              borderRadius: '4px',
              boxShadow: '0 4px 0 rgba(0,0,0,0.6)',
              whiteSpace: 'nowrap'
            }}
          >
            {t.text}
          </div>
        ))}
      </div>

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
          // Default every tile to the floor of its zone, so prop / obstacle tiles
          // blend into the floor instead of showing a dark box.
          let bg = floorBgFor(getFloorType(t.col, t.row), t.col, t.row);
          let content = null;
          let glow = 'none';
          let tileZOverride = null;
          const borderStyle = {};

          // Base indoor floor → transparent so the wood-plank grid background shows through.
          if (t.type === 'grass') bg = 'transparent';
          else if (t.type === 'path') bg = 'transparent';
          else if (t.type === 'dirt') bg = 'transparent';
          // Cozy central rug — a translucent tint over the wood so it reads as a rug
          // laid on the floor, plus the dotted border further below.
          else if (t.type === 'rug') bg = 'rgba(27, 23, 51, 0.55)';
          // 🌲 Camping corner — green grass (cols 1-5, rows 10-13) stitched from grassturf.
          else if (t.type === 'forest-floor') {
            const localCol = t.col - 1; // 0..4
            const localRow = t.row - 10; // 0..3
            borderStyle.backgroundImage = 'url(/grassturf.png)';
            borderStyle.backgroundSize = '500% 400%';
            borderStyle.backgroundPosition = `${(localCol / 4) * 100}% ${(localRow / 3) * 100}%`;
            borderStyle.imageRendering = 'pixelated';
          }
          else if (t.type === 'climbing-pad') {
            // Col 2 sits under the wall sprite's overflow — keep it transparent so the
            // sprite isn't cut by the blue floor painting on top of it (higher z).
            if (t.col === 2) {
              bg = 'transparent';
              borderStyle.border = 'none';
            } else {
              bg = '#0d47a1'; // Deep gym blue crash pad floor
              borderStyle.border = '1.5px solid rgba(255,255,255,0.06)';
            }
          }
          // 🔧 Garage — concrete floor (cols 10-12, rows 12-13) stitched from garagefloor.png.
          else if (t.type === 'garage-floor') {
            const localCol = t.col - 10; // 0..2
            const localRow = t.row - 12; // 0..1
            borderStyle.backgroundImage = 'url(/garagefloor.png)';
            borderStyle.backgroundSize = '300% 200%';
            borderStyle.backgroundPosition = `${(localCol / 2) * 100}% ${localRow * 100}%`;
            borderStyle.imageRendering = 'pixelated';
          }
          
          // Outer boundary walls — warm dark-wood panelling with honey trim,
          // matching the cozy reference (framed art hangs along the top wall).
          else if (t.type === 'wall-top') {
            bg = '#503a2e';
            borderStyle.borderBottom = '4px solid #c89b4a';
            borderStyle.boxShadow = 'inset 0 -3px 8px rgba(0,0,0,0.8)';
            const WALL_ART = { 3: 'frame-landscape', 4: 'frame-photo', 9: 'poster-band', 12: 'frame-landscape', 14: 'poster-anime', 17: 'poster-anime' };
            if (WALL_ART[t.col]) {
              content = <div style={{ width: '78%', height: '82%', zIndex: 6 }}><PixelProp type={WALL_ART[t.col]} /></div>;
            }
          }
          else if (t.type === 'wall-bottom') {
            bg = '#2e2118';
            borderStyle.borderTop = '4px solid #c89b4a';
            borderStyle.boxShadow = 'inset 0 3px 8px rgba(0,0,0,0.8)';
            if (t.col === 11) {
              // Warm wooden hanging sign for the bike garage
              content = (
                <div style={{
                  color: '#f3e6c8',
                  fontSize: '0.48rem',
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                  background: '#6e4a28',
                  padding: '2px 5px',
                  border: '1.5px solid #3a2419',
                  borderRadius: '2px',
                  boxShadow: '0 2px 0 #3a2419'
                }}>
                  GARAGE
                </div>
              );
            }
          }
          else if (t.type === 'wall-side') {
            bg = '#3a2a20';
            if (t.col === 0) borderStyle.borderRight = '4px solid #c89b4a';
            borderStyle.boxShadow = t.col === 0 ? 'inset -3px 0 8px rgba(0,0,0,0.8)' : 'inset 3px 0 8px rgba(0,0,0,0.8)';
            if (t.col === MAP_COLS - 1) {
              borderStyle.borderLeft = '4px solid #c89b4a';
            }
          }
          
          // ⚽ Soccer turf field — grassturf.png stitched across the 5×5 corner (cols 14-18,
          // rows 9-13), each tile showing its slice of the single image, plus chalk lines.
          else if (t.type === 'soccer-turf') {
            const localCol = t.col - 14; // 0..4
            const localRow = t.row - 9;  // 0..4
            borderStyle.backgroundImage = 'url(/grassturf.png)';
            borderStyle.backgroundSize = '500% 500%';
            borderStyle.backgroundPosition = `${(localCol / 4) * 100}% ${(localRow / 4) * 100}%`;
            borderStyle.imageRendering = 'pixelated';
            if (t.col === 14) borderStyle.borderLeft = '2px solid rgba(255,255,255,0.4)';
            if (t.col === 18) borderStyle.borderRight = '2px solid rgba(255,255,255,0.4)';
            if (t.row === 9) borderStyle.borderTop = '2px solid rgba(255,255,255,0.4)';
            if (t.row === 13) borderStyle.borderBottom = '2px solid rgba(255,255,255,0.4)';
          }
          // 📚 Manga tatami lounge floor — tatami mat (cols 15-18, rows 1-3) stitched from tatamifloor.png.
          else if (t.type === 'manga-lounge') {
            const localCol = t.col - 15; // 0..3
            const localRow = t.row - 1;  // 0..2
            borderStyle.backgroundImage = 'url(/tatamifloor.png)';
            borderStyle.backgroundSize = '400% 300%';
            borderStyle.backgroundPosition = `${(localCol / 3) * 100}% ${(localRow / 2) * 100}%`;
            borderStyle.imageRendering = 'pixelated';
            if (t.col === 16 && t.row === 3) {
              // Plop a cozy giant plush bean bag onto the tatami mat!
              content = <div style={{ width: '52px', height: '52px', position: 'absolute', left: '50%', bottom: '-4px', transform: 'translateX(-50%)', zIndex: 3 }}><PixelProp type="beanbag" /></div>;
            }
          }
          // 3. 🍔 Old diner zone — now plain wooden floor (show the wood-plank base).
          else if (t.type === 'restaurant-floor') {
            bg = 'transparent';
          }
          // Solid diner table counter table
          else if (t.type === 'diner-table') {
            bg = '#5c3a21'; // rich mahogany wood counter
            borderStyle.border = '2px solid #8d6e63';
            borderStyle.boxShadow = '0 3px 6px rgba(0,0,0,0.6)';
          }
          // 🧗 Bouldering Rock Wall — one continuous tall sprite over the 1×6 column.
          // Draw the full wall once at the TOP cell; keep the rest of the column
          // transparent so the lower rows' backgrounds (which Y-sort gives a higher
          // z-index) don't paint over the sprite. The wall sits behind the hangboard /
          // climb obstacles in col 2, so they read as "mounted on the wall".
          else if (t.type === 'bouldering-wall') {
            if (t.col === 1 && t.row === 4) {
              bg = '#0c1320';
              borderStyle.border = 'none';
              content = <div style={{ width: '88px', height: '240px', position: 'absolute', top: 0, left: 0, zIndex: 5 }}><PixelProp type="bouldering-wall" /></div>;
            } else {
              bg = 'transparent';
              borderStyle.border = 'none'; // avoid per-cell border lines painting over the sprite
            }
          }

          // 16-Bit Pixel Props Vector Rendering!
          else if (t.type === 'bed') {
            // Keep the other 3 bed cells transparent so their floor bg doesn't paint
            // over the (lower-z) bed sprite anchored at the top-left cell.
            bg = 'transparent';
            borderStyle.border = 'none';
            if (t.col === 1 && t.row === 1) content = <div style={{ width: '116px', height: '116px', position: 'absolute', top: 0, left: 0, zIndex: 5 }}><PixelProp type="bed" /></div>;
          }
          else if (t.type === 'bookshelf') {
            // Relocated to col 13 (rows 1-2 body). Top cell stays transparent + holds the
            // sprite, drawn one row higher (top:-100%) so the tall shelf stands flush to
            // the ceiling and its base lands at row 3 (tile 73).
            borderStyle.border = 'none';
            if (t.col === 13 && t.row === 1) {
              bg = 'transparent';
              content = <div style={{ width: '78px', height: '118px', position: 'absolute', top: '-100%', left: 0, zIndex: 5 }}><PixelProp type="bookshelf" /></div>;
            } else {
              // Lower body cell: paint the grass floor (col 13 isn't tatami) and drop it
              // BELOW the sprite so the bookshelf art still shows over it.
              bg = '#122012';
              tileZOverride = 1;
            }
          }
          
          else if (t.type === 'suitcase') {
            content = <div style={{ width: '56px', height: '56px', position: 'absolute', left: '50%', bottom: '-6px', transform: 'translateX(-50%)', zIndex: 5 }}><PixelProp type="suitcase" /></div>;
          }
          else if (t.type === 'campfire') {
            content = <div style={{ width: '56px', height: '56px', position: 'absolute', left: '50%', bottom: '-6px', transform: 'translateX(-50%)', zIndex: 5 }}><PixelProp type="campfire" /></div>;
          }
          else if (t.type === 'tent') {
            content = <div style={{ width: '64px', height: '64px', position: 'absolute', left: '50%', bottom: '-6px', transform: 'translateX(-50%)', zIndex: 5 }}><PixelProp type="tent" /></div>;
          }
          else if (t.type === 'tyre') {
            content = <div style={{ width: '48px', height: '48px', position: 'absolute', left: '50%', bottom: '-4px', transform: 'translateX(-50%)', zIndex: 5 }}><PixelProp type="tyre" /></div>;
          }
          else if (t.type === 'projector') {
            content = <div style={{ width: '52px', height: '52px', position: 'absolute', left: '50%', bottom: '-4px', transform: 'translateX(-50%)', zIndex: 5 }}><PixelProp type="projector" /></div>;
          }
          
          else if (t.type === 'goalpost') {
            let subtype = 'goalpost-mid';
            if (t.row === 10) subtype = 'goalpost-top';
            if (t.row === 12) subtype = 'goalpost-bottom';
            // Grass behind the net so the goal column matches the rest of the turf corner.
            borderStyle.backgroundImage = 'url(/grassturf.png)';
            borderStyle.backgroundSize = '400% 300%';
            borderStyle.backgroundPosition = `100% ${((t.row - 10) / 2) * 100}%`;
            borderStyle.imageRendering = 'pixelated';
            content = <div style={{ width: '56px', height: '56px', position: 'absolute', left: '50%', bottom: '-6px', transform: 'translateX(-50%)', zIndex: 5 }}><PixelProp type={subtype} /></div>;
          }
          else if (t.type === 'cone') {
            content = <div style={{ width: '30px', height: '30px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🚩</div>;
          }
          
          else if (t.type === 'bulletin') {
            content = <div style={{ width: '74px', height: '74px', position: 'absolute', left: '50%', bottom: '-8px', transform: 'translateX(-50%)', zIndex: 5 }}><PixelProp type="bulletin" /></div>;
          }
          else if (t.type === 'bike') {
            content = <div style={{ width: '74px', height: '74px', position: 'absolute', left: '50%', bottom: '-8px', transform: 'translateX(-50%)', zIndex: 5 }}><PixelProp type="bike" /></div>;
          }

          else if (t.type.startsWith('obstacle-')) {
            const objId = t.type.split('-')[1];
            const obj = INTERACTABLE_OBJECTS.find(o => o.id === objId);
            // Props sit directly on the zone floor (set as the default bg above) — no
            // dark box, no glow border, so the art doesn't look boxed-in / out of place.
            // The pulse-glow when the player is nearby still signals interactivity.
            borderStyle.border = 'none';
            
            if (objId === 'kitchen') {
              if (t.col === 6) content = <div style={{ width: '56px', height: '56px', position: 'absolute', left: '50%', bottom: '-6px', transform: 'translateX(-50%)', zIndex: 5 }}><PixelProp type="stove" /></div>;
              else if (t.col === 7) content = <div style={{ width: '56px', height: '56px', position: 'absolute', left: '50%', bottom: '-6px', transform: 'translateX(-50%)', zIndex: 5 }}><PixelProp type="kitchen-counter" /></div>;
              else if (t.col === 8) content = <div style={{ width: '56px', height: '56px', position: 'absolute', left: '50%', bottom: '-6px', transform: 'translateX(-50%)', zIndex: 5 }}><PixelProp type="fridge" /></div>;
            }
            else if (objId === 'trekking') {
              content = <div style={{ width: '56px', height: '56px', position: 'absolute', left: '50%', bottom: '-6px', transform: 'translateX(-50%)', zIndex: 5 }}><PixelProp type="travel-table" /></div>;
            }
            else if (objId === 'toolbox') {
              content = <div style={{ width: '56px', height: '56px', position: 'absolute', left: '50%', bottom: '-6px', transform: 'translateX(-50%)', zIndex: 5 }}><PixelProp type="toolbox" /></div>;
            }
            else if (objId === 'hangboard') {
              content = <div style={{ width: '56px', height: '56px', position: 'absolute', left: '50%', bottom: '-6px', transform: 'translateX(-50%)', zIndex: 5 }}><PixelProp type="hangboard" /></div>;
            }
            else if (objId === 'tacticboard') {
              content = <div style={{ width: '56px', height: '56px', position: 'absolute', left: '50%', bottom: '-6px', transform: 'translateX(-50%)', zIndex: 5 }}><PixelProp type="tacticboard" /></div>;
            }
            else if (objId === 'computerglowing') {
              content = <div style={{ width: '78px', height: '78px', position: 'absolute', left: '50%', bottom: '-8px', transform: 'translateX(-50%)', zIndex: 5 }}><PixelProp type="computerglowing" /></div>;
            }
            else if (objId === 'bouldering') {
              // This tile sits under the wall sprite (col 2) — keep it transparent and
              // empty; the wall is the visual and the proximity pulse signals interaction.
              bg = 'transparent';
              content = null;
            }
            else {
              const centerCell = obj?.cells[0];
              if (centerCell && centerCell.col === t.col && centerCell.row === t.row) {
                content = (
                  <div style={{ fontSize: '1.8rem', zIndex: 2, filter: 'drop-shadow(0 0 4px #000)' }}>
                    {obj.id === 'profile' || obj.id === 'football' || obj.id === 'anime' ? null :
                     obj.symbol}
                  </div>
                );
              }
            }
          }

          // Render Manga Cabinet in Lounge corner
          if (t.col === 16 && t.row === 1) {
            content = <div style={{ width: '76px', height: '76px', position: 'absolute', left: '50%', bottom: '-8px', transform: 'translateX(-50%)', zIndex: 5 }}><PixelProp type="arcade" /></div>;
          }

          // Kitchen appliances flanking the interactive counter (7,1). These two tiles
          // are solid (see mapConfig) but their sprites were never drawn, so they read
          // as invisible walls — render them here.
          if (t.col === 6 && t.row === 1) {
            content = <div style={{ width: '56px', height: '56px', position: 'absolute', left: '50%', bottom: '-6px', transform: 'translateX(-50%)', zIndex: 5 }}><PixelProp type="fridge" /></div>;
          }
          if (t.col === 8 && t.row === 1) {
            content = <div style={{ width: '56px', height: '56px', position: 'absolute', left: '50%', bottom: '-6px', transform: 'translateX(-50%)', zIndex: 5 }}><PixelProp type="stove" /></div>;
          }

          // Decorative mini goal at the right edge of the soccer turf (col 18, rows 10-12).
          // Non-solid, so the player can walk right up to / through it.
          if (t.col === 18 && t.row >= 10 && t.row <= 12) {
            const goalSub = t.row === 10 ? 'goalpost-top' : t.row === 12 ? 'goalpost-bottom' : 'goalpost-mid';
            content = <div style={{ width: '54px', height: '54px', position: 'absolute', left: '50%', bottom: '-4px', transform: 'translateX(-50%)', zIndex: 5 }}><PixelProp type={goalSub} /></div>;
          }

          // Climbing-pad column 2 sits under the wall sprite's overflow (the wall is drawn
          // once at col 1, row 4 and is wider than one tile). Keep this whole column
          // transparent so no floor / solid-prop box paints over the wall art.
          if (t.col === 2 && t.row >= 4 && t.row <= 9) {
            bg = 'transparent';
            borderStyle.border = 'none';
            borderStyle.backgroundImage = 'none';
          }

          const isInteractableNearby = nearObject && t.type === `obstacle-${nearObject.id}`;

          // Y-SORTING DEPTH ENGINE: Dynamic Stacking Contexts
          const isSolidObstacle = isTileSolid(t.col, t.row);
          const tileZIndex = tileZOverride != null
            ? tileZOverride
            : (isSolidObstacle ? (Math.floor(t.row * 10) + 5) : 1);

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

              {/* 🔧 DEV-ONLY tile number overlay — remove via SHOW_TILE_NUMBERS flag before going live */}
              {SHOW_TILE_NUMBERS && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 1,
                  fontSize: '7px',
                  lineHeight: 1,
                  fontFamily: 'monospace',
                  color: 'rgba(255,255,255,0.9)',
                  background: 'rgba(0,0,0,0.55)',
                  padding: '1px 2px',
                  borderRadius: '2px',
                  zIndex: 9999,
                  pointerEvents: 'none'
                }}>
                  {idx}
                </div>
              )}

              {/* Central Rug custom border design */}
              {t.type === 'rug' && (t.col === 5 || t.col === 13 || t.row === 5 || t.row === 9) && (
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, border: '2px dotted var(--rpg-highlight)', opacity: 0.3 }} />
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



        {/* 🐈 Easter-egg cat — loafs around, relocates when it pleases */}
        <div
          style={{
            position: 'absolute',
            left: `${((CAT_SPOTS[catSpot].col + 0.5) / MAP_COLS) * 100}%`,
            top: `${((CAT_SPOTS[catSpot].row + 0.5) / MAP_ROWS) * 100}%`,
            transform: 'translate(-50%, -60%)',
            zIndex: Math.floor(CAT_SPOTS[catSpot].row * 10) + 4,
            width: '30px',
            height: '30px',
            transition: 'left 1.4s ease-in-out, top 1.4s ease-in-out',
            pointerEvents: 'none'
          }}
        >
          <PixelProp type="cat" />
        </div>

        {/* Raghav Animated NPC — autonomous "mini-AI" that roams + acts out his hobbies */}
        <div
          style={{
            position: 'absolute',
            left: `${(raghavPos.col / MAP_COLS) * 100}%`,
            top: `${(raghavPos.row / MAP_ROWS) * 100}%`,
            transform: 'translate(-50%, -60%)',
            zIndex: Math.floor(raghavPos.row * 10) + 5,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            width: '32px',
            height: '38px'
          }}
        >
          {/* Thought bubble while acting at a station */}
          {raghavThought && (
            <div
              className="pixel-header animate-bob"
              style={{
                position: 'absolute',
                top: '-34px',
                background: '#fff',
                color: '#111',
                border: '2px solid #000',
                padding: '3px 7px',
                fontSize: '0.62rem',
                borderRadius: '6px',
                whiteSpace: 'nowrap',
                boxShadow: '0 3px 0 #000',
                zIndex: 16
              }}
            >
              {raghavThought}
              <span style={{ position: 'absolute', bottom: '-6px', left: '10px', width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '6px solid #000' }} />
            </div>
          )}
          <Sprite
            direction={raghavDirection}
            frame={raghavThought ? 0 : previewFrame}
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

          {/* 🍡 Marshmallow on a stick while roasting at the campfire */}
          {isRoasting && (
            <div className="animate-bob" style={{ position: 'absolute', top: '-16px', right: '-16px', width: '24px', height: '24px', zIndex: 14 }}>
              <PixelProp type="marshmallow" />
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

      {/* Parchment-scroll RPG dialogue box (always visible to prevent layout shifts) */}
      <div
        style={{
          height: '100px',
          background: 'linear-gradient(180deg, #f6e7bd 0%, #eed9a0 100%)',
          borderTop: '3px solid #8a5a2b',
          boxShadow: 'inset 0 0 18px rgba(138, 90, 43, 0.28), 0 -2px 10px rgba(0,0,0,0.35)',
          padding: '12px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 12
        }}
      >
        {/* stitched inner border for the scroll look */}
        <div style={{ position: 'absolute', top: '5px', left: '8px', right: '8px', bottom: '5px', border: '2px dashed rgba(138, 90, 43, 0.35)', borderRadius: '4px', pointerEvents: 'none' }} />
        <span
          className="pixel-header"
          style={{
            fontSize: '0.8rem',
            color: '#8a3a2a',
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
            color: '#2e2013',
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
              background: '#c0392b',
              color: '#f6e7bd',
              border: '3px solid #3a2419',
              padding: '6px 12px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              boxShadow: '2px 2px 0 #3a2419',
              zIndex: 1
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
              {triviaQuestions[currentQuestionIdx].options.map((opt, idx) => {
                const hidden = triviaHidden.includes(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => !hidden && handleTriviaAnswer(idx)}
                    className="pixel-text"
                    disabled={hidden}
                    style={{
                      background: '#000',
                      color: hidden ? '#333' : 'var(--rpg-text)',
                      border: `2px solid ${hidden ? '#222' : 'var(--rpg-text)'}`,
                      padding: '10px',
                      fontSize: '1.2rem',
                      cursor: hidden ? 'default' : 'pointer',
                      textAlign: 'left',
                      textDecoration: hidden ? 'line-through' : 'none',
                      ...(menuRow === idx && !hidden ? FOCUS_RING : {})
                    }}
                  >
                    {idx + 1}. {opt}
                  </button>
                );
              })}
            </div>

            {/* 🧠 Intellect ≥ 7 perk: one hint per question */}
            {playerStats.intellect >= 7 && (
              <button
                onClick={useTriviaHint}
                disabled={triviaHintUsed || !!triviaResult}
                className="pixel-header"
                style={{
                  alignSelf: 'flex-start',
                  background: triviaHintUsed ? '#222' : '#1a233a',
                  color: triviaHintUsed ? '#555' : '#ffd166',
                  border: `2px solid ${triviaHintUsed ? '#333' : '#ffd166'}`,
                  padding: '5px 12px',
                  cursor: triviaHintUsed ? 'default' : 'pointer',
                  fontSize: '0.65rem'
                }}
              >
                🧠 {triviaHintUsed ? 'HINT USED' : 'USE INTELLECT HINT [H]'}
              </button>
            )}

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
                  transformOrigin: 'bottom center',
                  ...(menuRow === idx ? FOCUS_RING : {})
                }}
              >
                {/* Photo cutout containing animated sprite */}
                <div style={{ width: '100%', height: '110px', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #222', position: 'relative' }}>
                  <div style={{ width: '64px', height: '64px' }}>
                    <Sprite direction="down" frame={previewFrame} customColors={visitor.colors} />
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
                  <Sprite direction="down" frame={previewFrame} customColors={selectedGalleryProfile.colors} />
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
                onClick={() => stationChoose(0)}
                className="pixel-text"
                style={{ background: '#000', color: 'var(--rpg-text)', border: '2px solid var(--rpg-text)', padding: '10px', fontSize: '1.3rem', cursor: 'pointer', textAlign: 'left', ...(menuRow === 0 ? FOCUS_RING : {}) }}
              >
                [1] Inspect Landmark Spec (Read Lore)
              </button>
              <button
                onClick={() => stationChoose(1)}
                className="pixel-text"
                style={{ background: 'var(--rpg-highlight)', color: '#000', border: '2px solid #000', padding: '10px', fontSize: '1.3rem', cursor: 'pointer', fontWeight: 'bold', textAlign: 'left', ...(menuRow === 1 ? FOCUS_RING : {}) }}
              >
                [2] Play Minigame (Launch Fullscreen)
              </button>
            </div>
            <button
              onClick={() => setActiveGameStation(null)}
              className="pixel-header"
              style={{ alignSelf: 'flex-end', background: 'var(--rpg-accent)', color: '#fff', border: '2px solid #000', padding: '5px 12px', cursor: 'pointer', fontSize: '0.75rem', ...(menuRow === 2 ? FOCUS_RING : {}) }}
            >
              CANCEL [B]
            </button>
            <p className="pixel-text" style={{ fontSize: '0.95rem', color: '#666', margin: 0, textAlign: 'center' }}>
              ▲▼ navigate · A select · B back
            </p>
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

          <div style={{ flex: 1, position: 'relative', background: '#123015 url(/grassturf.png) center/cover', imageRendering: 'pixelated', overflow: 'hidden' }}>
            {/* Field outline */}
            <div style={{ position: 'absolute', top: '10%', bottom: '10%', left: '5%', right: '5%', border: '3px solid rgba(255,255,255,0.85)', boxShadow: '0 0 4px rgba(0,0,0,0.5)' }} />
            {/* Halfway line */}
            <div style={{ position: 'absolute', top: '10%', bottom: '10%', left: '50%', borderLeft: '3px solid rgba(255,255,255,0.85)' }} />
            {/* Centre circle */}
            <div style={{ position: 'absolute', top: '40%', left: '44%', width: '12%', height: '20%', border: '3px solid rgba(255,255,255,0.85)', borderRadius: '50%' }} />
            {/* Centre spot */}
            <div style={{ position: 'absolute', top: '49.2%', left: '49.6%', width: '0.8%', height: '1.4%', background: 'rgba(255,255,255,0.9)', borderRadius: '50%' }} />

            {/* Penalty boxes */}
            <div style={{ position: 'absolute', top: '30%', bottom: '30%', left: '5%', width: '12%', border: '3px solid rgba(255,255,255,0.85)', borderLeft: 'none' }} />
            <div style={{ position: 'absolute', top: '30%', bottom: '30%', right: '5%', width: '12%', border: '3px solid rgba(255,255,255,0.85)', borderRight: 'none' }} />
            
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
                  {KITCHEN_MENU.map((item, idx) => (
                    <div
                      key={idx}
                      className="rpg-box"
                      style={{
                        background: '#040409',
                        padding: '10px',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                        borderColor: '#222',
                        ...(menuRow === idx ? FOCUS_RING : {})
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

      {/* 2. 🧰 Tech Stack Toolbox drawer modal */}
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
          <div className="rpg-box" style={{ width: '95%', maxWidth: '640px', background: '#0a0505', borderColor: '#c62828', boxShadow: '0 0 25px rgba(198, 40, 40, 0.3)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid #c62828', paddingBottom: '8px', marginBottom: '15px' }}>
              <span className="pixel-header" style={{ fontSize: '0.85rem', color: '#c62828' }}>🧰 RAGHAV'S DEVELOPMENT TOOLBOX</span>
              <button 
                onClick={() => setShowTechStack(false)}
                className="pixel-header"
                style={{ background: 'var(--rpg-accent)', color: '#fff', border: '2px solid #000', padding: '2px 8px', fontSize: '0.65rem', cursor: 'pointer' }}
              >
                CLOSE [B]
              </button>
            </div>

            <p className="pixel-text" style={{ fontSize: '1.25rem', color: '#aaa', margin: '0 0 15px 0', textAlign: 'center' }}>
              Slide open the toolbox drawers to inspect the specific software tools I use to build things!
            </p>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {/* Left Column: Drawers Buttons (Toolbox shape) */}
              <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '8px', background: '#1c1c1c', padding: '8px', borderRadius: '4px', border: '2px solid #333' }}>
                {[
                  { id: 'frontend', title: '🟥 Frontend UI', color: '#e53935' },
                  { id: 'backend', title: '🟨 Backend API', color: '#ffd700' },
                  { id: 'devops', title: '🟩 Cloud & DB', color: '#43a047' },
                  { id: 'core', title: '🟪 Core Architecture', color: '#8a2be2' }
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
                  📂 Cabinet Tray: {activeStackDrawer}
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '1.25rem', overflowY: 'auto', maxHeight: '200px' }}>
                  {activeStackDrawer === 'frontend' && (
                    <>
                      <div>⚡ <strong style={{ color: '#00e5ff' }}>React.js & Vite:</strong> Framework of choice for lightning-fast modern Single Page Apps.</div>
                      <div>🎨 <strong style={{ color: '#ffb700' }}>Vanilla CSS:</strong> Maximum style customisation with harmonious curated HSL palettes.</div>
                      <div>📽️ <strong style={{ color: '#ff007f' }}>Framer Motion:</strong> Immersive, spring-based micro-animations and route transitions.</div>
                      <div>🕹️ <strong style={{ color: '#00ff66' }}>Web Audio Synths:</strong> Custom synth sound generators for absolute browser immersion.</div>
                    </>
                  )}
                  {activeStackDrawer === 'backend' && (
                    <>
                      <div>🟢 <strong style={{ color: '#00ff66' }}>Node.js & Express:</strong> High performance RESTful APIs and real-time backend structures.</div>
                      <div>🔌 <strong style={{ color: '#ff007f' }}>WebSockets:</strong> Secure real-time client-server communication channels.</div>
                      <div>🕷️ <strong style={{ color: '#00e5ff' }}>Python Scrapers:</strong> Advanced scraping bots (e.g. tracking simulated stock charts).</div>
                      <div>📦 <strong style={{ color: '#ffd700' }}>REST Client APIs:</strong> Fully rate-limited resilient external API integrations.</div>
                    </>
                  )}
                  {activeStackDrawer === 'devops' && (
                    <>
                      <div>🐘 <strong style={{ color: '#00e5ff' }}>PostgreSQL:</strong> Highly structured database schemas, optimized query indices.</div>
                      <div>🔥 <strong style={{ color: '#ff7043' }}>Firestore & NoSQL:</strong> Document-driven real-time database storage solutions.</div>
                      <div>☁️ <strong style={{ color: '#ffd700' }}>GCP & Cloud Run:</strong> Secure virtual instances, containerized application hosting.</div>
                      <div>🐙 <strong style={{ color: '#eeeeee' }}>Git & CI/CD:</strong> Strict code audits, merge control, and deployment pipes.</div>
                    </>
                  )}
                  {activeStackDrawer === 'core' && (
                    <>
                      <div>🏗️ <strong style={{ color: '#ff007f' }}>Clean Architecture:</strong> Domain-driven, modular design structures for easy scale.</div>
                      <div>⚡ <strong style={{ color: '#00e5ff' }}>Performance Profiling:</strong> Layout shift elimination, minimal asset footprints.</div>
                      <div>🧠 <strong style={{ color: '#ffd700' }}>Algorithmic Logic:</strong> Data structures and optimization calculations.</div>
                      <div>🛡️ <strong style={{ color: '#00ff66' }}>Code Integrity:</strong> Secure state handling, zero external pollution.</div>
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
              <span className="pixel-header" style={{ fontSize: '0.85rem', color: '#4caf50' }}>📋 RAGHAV'S FOOTBALL CHALKBOARD</span>
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
                  FC BARCELONA — MÉS QUE UN CLUB
                </h3>
                <span style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: '#81c784' }}>Raghav's one and only football religion</span>
              </div>

              {/* Fandom columns */}
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                {/* Chalkboard Drawing */}
                <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '220px', height: '140px' }}>
                    <PixelProp type="tacticboard" />
                  </div>
                </div>

                {/* Club / Player / Loyalty details */}
                <div style={{ flex: '1.2 1 240px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '1.2rem', fontFamily: 'monospace' }}>
                  <div>
                    <span style={{ color: '#4fc3f7', fontWeight: 'bold' }}>🔵🔴 CLUB — FC Barcelona (FCB):</span><br/>
                    The Blaugrana. Tiki-taka purists raised on the La Masia academy and the Camp Nou faithful. Possession is the philosophy — style over everything.
                  </div>
                  <div>
                    <span style={{ color: '#ffeb3b', fontWeight: 'bold' }}>🐐 PLAYER — Lionel Messi:</span><br/>
                    The GOAT. The number 10 whose left foot rewrote football. Every dribble, free-kick and impossible angle is pure inspiration.
                  </div>
                  <div>
                    <span style={{ color: '#ffd54f', fontWeight: 'bold' }}>💛 LOYALTY — Visca Barça, sempre:</span><br/>
                    Through trebles and heartbreaks, Champions League nights and El Clásico wars — a culer for life. No glory-hunting, no switching sides. One club, forever.
                  </div>
                </div>
              </div>

            </div>

            {/* Play Match call-to-action — launches the 1v1 soccer minigame */}
            <button
              onClick={() => { setShowTacticalBlueprints(false); setShowFullscreenSoccer(true); }}
              className="pixel-header"
              style={{ marginTop: '15px', width: '100%', background: 'var(--rpg-highlight)', color: '#000', border: '3px solid #000', padding: '12px', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '3px 3px 0 #000' }}
            >
              ⚽ PLAY A MATCH — 1V1 SOCCER DUEL
            </button>

          </div>
        </div>
      )}

      {/* 5. 🖥️ PC Projects Monitor Terminal Modal */}
      {showPCProjects && (
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
          <div className="rpg-box" style={{ width: '95%', maxWidth: '680px', background: '#050508', borderColor: '#00e5ff', boxShadow: '0 0 25px rgba(0, 229, 255, 0.3)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid #00e5ff', paddingBottom: '8px', marginBottom: '15px' }}>
              <span className="pixel-header" style={{ fontSize: '0.85rem', color: '#00e5ff' }}>🖥️ RAGHAV'S GLOWING COMMAND DECK</span>
              <button 
                onClick={() => setShowPCProjects(false)}
                className="pixel-header"
                style={{ background: 'var(--rpg-accent)', color: '#fff', border: '2px solid #000', padding: '2px 8px', fontSize: '0.65rem', cursor: 'pointer' }}
              >
                CLOSE [B]
              </button>
            </div>

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {/* Left Column: Project Selection Terminal */}
              <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: '8px', background: '#111', padding: '10px', borderRadius: '4px', border: '2px solid #333' }}>
                <span className="pixel-header" style={{ fontSize: '0.52rem', color: '#888', marginBottom: '4px', display: 'block' }}>📁 ACTIVE PROJECTS DICTIONARY:</span>
                {PC_PROJECTS.map(project => (
                  <button
                    key={project.id}
                    onClick={() => selectPcProject(project.id)}
                    className="pixel-text"
                    style={{
                      background: pcActiveProject === project.id ? '#1a233a' : '#050508',
                      color: pcActiveProject === project.id ? '#00e5ff' : '#aaa',
                      border: `2px solid ${pcActiveProject === project.id ? '#00e5ff' : '#444'}`,
                      padding: '8px',
                      fontSize: '1.15rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s'
                    }}
                  >
                    <strong style={{ display: 'block', fontSize: '0.62rem', fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: '2px' }}>{project.title}</strong>
                    {project.desc}
                  </button>
                ))}
              </div>

              {/* Right Column: Simulated Live stdout console */}
              <div style={{ flex: '1.5 1 300px', display: 'flex', flexDirection: 'column', background: '#000', border: '3px solid #333', padding: '10px', borderRadius: '4px', height: '260px', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '4px', marginBottom: '8px', fontSize: '0.52rem', fontFamily: 'monospace', color: '#ff007f' }}>
                  <span>TERMINAL: stdout</span>
                  <span>STATUS: RUNNING</span>
                </div>

                {/* CRT Glowing terminal text logs box */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'monospace', fontSize: '0.98rem', color: '#39ff14', textShadow: '0 0 4px rgba(57,255,20,0.5)', paddingRight: '4px' }}>
                  {simulatedLogs.map((log, idx) => (
                    <div key={idx} style={{ wordBreak: 'break-all', whiteSpace: 'normal' }}>
                      {log}
                    </div>
                  ))}
                  <div className="typing-cursor" style={{ height: '10px', width: '6px', background: '#39ff14', display: 'inline-block' }} />
                </div>
              </div>
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
