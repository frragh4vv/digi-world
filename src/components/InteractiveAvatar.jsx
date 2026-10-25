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
  { col: 9,  row: 6,  dir: 'up',    thought: '⌨️ shipping code…' },
  { col: 2,  row: 6,  dir: 'left',  thought: '🧗 sending a V5!' },
  { col: 7,  row: 2,  dir: 'up',    thought: '🍳 cooking street eats' },
  { col: 15, row: 11, dir: 'right', thought: '⚽ top-corner finish!' },
  { col: 9,  row: 12, dir: 'up',    thought: '🏍️ tuning the motorcycle' },
  { col: 14, row: 2,  dir: 'up',    thought: '📚 re-reading HxH' },
  { col: 4,  row: 10, dir: 'down',  thought: '🗺️ planning a trek' },
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

// Character-creation option rows (Option A: Layered Procedural Customizer)
export const HAIR_STYLES = [
  { id: 'spiky', label: '⚡ Spiky' },
  { id: 'afro', label: '☁️ Afro' },
  { id: 'messy', label: '🌊 Curtains' },
  { id: 'cap', label: '🧢 Cap/Beanie' },
  { id: 'long', label: '✨ Long' }
];

export const OUTFIT_TYPES = [
  { id: 'hoodie', label: '🧥 Hoodie' },
  { id: 'tshirt', label: '👕 Graphic Tee' },
  { id: 'jersey', label: '⚽ Sport Jersey' },
  { id: 'jacket', label: '🕶️ Cyber Jacket' }
];

export const PANTS_TYPES = [
  { id: 'jeans', label: '👖 Denim Jeans' },
  { id: 'cargo', label: '🪖 Cargo Pants' },
  { id: 'trackpants', label: '🏃 Joggers' },
  { id: 'shorts', label: '🩳 Shorts' }
];

export const FACE_STYLES = [
  { id: 'classic', label: '😊 Classic' },
  { id: 'glasses', label: '👓 Specs' },
  { id: 'visor', label: '🕶️ Visor' },
  { id: 'cute', label: '🌸 Blush' }
];

// Curated high-contrast aesthetic colors (4-5 distinct tones)
export const SKIN_COLORS = ['#ffd8b8', '#e8a87c', '#a56336', '#5c3826'];
export const HAIR_COLORS = ['#181820', '#f4c542', '#7c3f1d', '#00f0ff', '#ff4d8d'];
export const SHIRT_COLORS = ['#e63946', '#06d6a0', '#2a6fdb', '#22223b', '#fca311'];
export const PANTS_COLORS = ['#2b4162', '#6c584c', '#1a1a24', '#dcd6cd', '#4f5d2f'];

export const STAT_KEYS = ['stamina', 'curiosity', 'reflexes', 'intellect'];
export const STAT_INFO = {
  stamina:   { icon: '💪', label: 'Stamina',   perk: 'bigger energy tank, slower drain' },
  curiosity: { icon: '🔍', label: 'Curiosity', perk: 'inspect things from 1 tile away' },
  reflexes:  { icon: '⚡', label: 'Reflexes',  perk: 'walk & bike faster' },
  intellect: { icon: '🧠', label: 'Intellect', perk: 'trivia hints, faster cooking' },
};

// D-pad row map: 
// 0: hairStyle (5) · 1: outfitType (4) · 2: pantsType (4) · 3: faceStyle (4) · 4: skin (4) 
// · 5: hairCol (5) · 6: shirtCol (5) · 7: pantsCol (5) · 8-11: stats · 12: START
const CREATION_ROW_SIZES = [5, 4, 4, 4, 4, 5, 5, 5, 1, 1, 1, 1, 1];

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
const SHOW_TILE_NUMBERS = false;

// Touch-first device (phone/tablet): prompts name the on-screen A button, not E
const IS_TOUCH = typeof window !== 'undefined' && window.matchMedia?.('(hover: none) and (pointer: coarse)').matches;

// Climbing QTE holds. Touch screens have no Space key, so skip it there and
// label holds with the on-screen D-pad / A button the player actually taps.
const QTE_KEYS = IS_TOUCH ? ['w', 'a', 's', 'd', 'e'] : ['w', 'a', 's', 'd', 'e', 'space'];
const QTE_TOUCH_LABELS = { w: '▲', a: '◀', s: '▼', d: '▶', e: 'A' };
const qteLabel = (k) => (IS_TOUCH ? QTE_TOUCH_LABELS[k] : k.toUpperCase());

// Web Audio Synth Sound Engine
let globalAudioEnabled = false;
let audioCtxInstance = null;
const getAudioCtx = () => {
  if (!audioCtxInstance) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) audioCtxInstance = new AudioCtx();
  }
  if (audioCtxInstance && audioCtxInstance.state === 'suspended') {
    audioCtxInstance.resume().catch(() => {});
  }
  return audioCtxInstance;
};

const playSound = (type, force = false) => {
  if (!globalAudioEnabled && !force) return;
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    
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

// Exact standing targets for interactables (only triggers when standing directly on target)
const ACTIVITY_TARGETS = [
  { id: 'bouldering', target: { col: 2, row: 5 }, title: 'Bouldering & Hangboard Wall', dialogue: "🧗 [Bouldering & Hangboard]: Technical climbing slab & grip conditioning board. Press E or Action [A] to view stats & climb!", inspectPrompt: 'CLIMB & STATS', symbol: '🧗' },
  { id: 'kitchen', target: { col: 7, row: 2 }, title: 'Cyber Bistro Kitchen', dialogue: "🍳 [Cyber Bistro Kitchen]: The grill is sizzling hot! Press E or Action [A] to cook food and restore stamina!", inspectPrompt: 'COOK FOOD', symbol: '🍳' },
  { id: 'bulletin', target: { col: 11, row: 2 }, title: 'Hall of Fame Portraits', dialogue: "🖼️ [Hall of Fame]: Gilded portrait gallery of overworld explorers. Press E to view the Explorer Log & Guestbook!", inspectPrompt: 'EXPLORER LOG', symbol: '🖼️' },
  { id: 'anime', target: { col: 14, row: 2 }, title: 'Manga & Anime Lounge', dialogue: "📚 [Manga Lounge]: Volumes of Hunter x Hunter & anime lore. Press E or Action [A] to test your trivia lore!", inspectPrompt: 'MANGA TRIVIA', symbol: '📚' },
  { id: 'computerglowing', target: { col: 8, row: 5 }, title: 'Command Deck PC', dialogue: "💻 [Command Deck]: Triple monitors running code. Press E to inspect developer project files!", inspectPrompt: 'OPEN PC', symbol: '💻' },
  { id: 'trekking', target: { col: 3, row: 9 }, title: 'Trek & Travel Campground', dialogue: "⛺ [Trek Campground]: Raghav's travel scrapbook detailing Corsica GR20 and Hampi boulders. Press E to open!", inspectPrompt: 'READ DIARY', symbol: '⛺' },
  { id: 'bike', target: { col: 9, row: 10 }, title: 'Red Motorcycle & Bike Garage', dialogue: "🏍️ [Garage]: Red motorcycle tuned and ready! Press E or Action [A] to mount the vehicle and start the lap time trial!", inspectPrompt: 'START TIME TRIAL', symbol: '🏍️' },
  { id: 'tacticboard', target: { col: 16, row: 10 }, title: 'Soccer Pitch & Tactical Board', dialogue: "⚽ [Soccer Field]: Tactical analysis board and mini ball. Press E or Action [A] to start the 1v1 match!", inspectPrompt: 'PLAY SOCCER', symbol: '⚽' },
  { id: 'bed', target: { col: 2, row: 2 }, title: 'Cozy Spawning Bed', dialogue: "🛏️ [Spawning Bed]: Cozy gold quilt bed. Press E to rest and restore 100% Social Battery.", inspectPrompt: 'REST IN BED', symbol: '🛏️' }
];

// Room Sections for the 3-second entrance popup with 10-second re-entry cooldown
const ROOM_SECTIONS = [
  { id: 'garage', name: 'MOTORCYCLE GARAGE', icon: '🏍️', inZone: (c, r) => c >= 8 && c <= 12 && r >= 9 && r <= 13 },
  { id: 'pitch', name: 'SOCCER PITCH & FIELD', icon: '⚽', inZone: (c, r) => c >= 13 && c <= 18 && r >= 8 && r <= 13 },
  { id: 'camp', name: 'TREK & CAMPGROUND', icon: '⛺', inZone: (c, r) => c >= 1 && c <= 6 && r >= 8 && r <= 13 },
  { id: 'climb', name: 'BOULDERING & HANGWALL', icon: '🧗', inZone: (c, r) => c >= 1 && c <= 4 && r >= 3 && r <= 7 },
  { id: 'kitchen', name: 'CYBER BISTRO KITCHEN', icon: '🍳', inZone: (c, r) => c >= 5 && c <= 9 && r >= 1 && r <= 3 },
  { id: 'deck', name: 'COMMAND DECK & LOUNGE', icon: '💻', inZone: (c, r) => c >= 7 && c <= 12 && r >= 4 && r <= 7 },
  { id: 'manga', name: 'MANGA & RETRO LOUNGE', icon: '📚', inZone: (c, r) => c >= 13 && c <= 18 && r >= 1 && r <= 4 }
];

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
    activeItemId, setActiveItemId,
    isPaused
  } = useGameState();

  // Spawning Customizer states
  const [customName, setCustomName] = useState("Wanderer");
  const [raghavDirection, setRaghavDirection] = useState('down');
  // Raghav NPC "mini-AI" — autonomous position + current thought bubble
  const [raghavPos, setRaghavPos] = useState({ col: 9, row: 6 });
  const [raghavThought, setRaghavThought] = useState(null);
  const raghavBrain = useRef({ pos: { col: 9, row: 6 }, path: [], mode: 'idle', actUntil: 0, stationIdx: 0 });
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

  // Option A: Layered Character Styling Options
  const [hairStyle, setHairStyle] = useState('spiky');
  const [outfitType, setOutfitType] = useState('hoodie');
  const [pantsType, setPantsType] = useState('jeans');
  const [faceStyle, setFaceStyle] = useState('classic');
  const [selectedSkinColor, setSelectedSkinColor] = useState('#ffd8b8');
  const [selectedHatColor, setSelectedHatColor] = useState('#181820');
  const [selectedShirtColor, setSelectedShirtColor] = useState('#e63946');
  const [selectedPantsColor, setSelectedPantsColor] = useState('#2b4162');

  // Travel Diary Modal State
  const [showTravelDiary, setShowTravelDiary] = useState(false);
  const [diaryIdx, setDiaryIdx] = useState(0);

  // Dynamic Thematic Corner Modals & Climbing QTE states
  const [showClimbingQTE, setShowClimbingQTE] = useState(false);
  const [boulderingTab, setBoulderingTab] = useState('climb'); // 'climb' | 'hangboard'
  const [qteKey, setQteKey] = useState('');
  const [qteProgress, setQteProgress] = useState(0);
  const [qteStatus, setQteStatus] = useState('playing'); // 'playing' | 'success' | 'fail'
  
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
  const [playerPos, setPlayerPos] = useState({ col: 3, row: 4 }); 
  const [direction, setDirection] = useState('down');
  const [frame, setFrame] = useState(0);
  const [dialogueText, setDialogueText] = useState("Welcome to my cozy overworld space! Walk up to items to inspect, or click tiles.");
  const [displayedText, setDisplayedText] = useState("");
  const [nearObject, setNearObject] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  // 📍 Section discovery popup states (3s show, 10s re-entry cooldown)
  const [activeSectionBanner, setActiveSectionBanner] = useState(null);
  const sectionBannerTimerRef = useRef(null);
  const currentSectionIdRef = useRef(null);
  const lastSectionTimesRef = useRef({});

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

  // Manga Lounge & Trivia Cabinet Game States
  const [showMangaLounge, setShowMangaLounge] = useState(false);
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
  const playerCoords = useRef({ col: 3, row: 4 });
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

  // Convert custom specs back into custom color & style specs for Sprite
  const customColors = {
    hat: selectedHatColor,
    skin: selectedSkinColor,
    shirt: selectedShirtColor,
    pants: selectedPantsColor,
    shoes: '#ffffff',
    hairStyle,
    outfitType,
    pantsType,
    faceStyle
  };

  // Coordinated loop references
  const isAudioEnabledRef = useRef(false);
  const nearObjectRef = useRef(null);
  const directionRef = useRef('down');
  const stepAccumulator = useRef(0);
  const energyLevelRef = useRef(100);

  useEffect(() => {
    isAudioEnabledRef.current = isAudioEnabled;
    globalAudioEnabled = isAudioEnabled;
  }, [isAudioEnabled]);

  // START menu pause, readable from the soccer / bike race loops and timers
  // (they live in long-running effects, so they can't read state directly)
  const isPausedRef = useRef(false);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Drive idle sprite-preview animation (creation screen + gallery cards)
  useEffect(() => {
    const tick = setInterval(() => setPreviewFrame(f => (f + 1) % 4), 220);
    return () => clearInterval(tick);
  }, []);

  // Reset the menu highlight whenever a selection screen opens / changes page
  useEffect(() => {
    setMenuRow(0);
    setMenuCol(0);
  }, [activeGameStation, showTrivia, showKitchen, showVisitorGallery, showPCProjects, currentQuestionIdx, gameStarted]);

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
      if (station === 'bike') {
        setIsRiding(r => !r);
        playSound('chime');
      }
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
    if (row === 0) setHairStyle(HAIR_STYLES[col].id);
    else if (row === 1) setOutfitType(OUTFIT_TYPES[col].id);
    else if (row === 2) setPantsType(PANTS_TYPES[col].id);
    else if (row === 3) setFaceStyle(FACE_STYLES[col].id);
    else if (row === 4) setSelectedSkinColor(SKIN_COLORS[col]);
    else if (row === 5) setSelectedHatColor(HAIR_COLORS[col]);
    else if (row === 6) setSelectedShirtColor(SHIRT_COLORS[col]);
    else if (row === 7) setSelectedPantsColor(PANTS_COLORS[col]);
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
        keysPressed.current = {};
        clickTarget.current = null;
        if (showGuestbookSubmit) setShowGuestbookSubmit(false);
        else if (selectedGalleryProfile) setSelectedGalleryProfile(null);
        else if (selectedVisitorReview) setSelectedVisitorReview(null);
        else if (showVisitorGallery) setShowVisitorGallery(false);
        else if (showTravelDiary) setShowTravelDiary(false);
        else if (showCarousel) setShowCarousel(false);
        else if (showKitchen) { setShowKitchen(false); setCookingItem(null); setCookingProgress(0); }
        else if (showTrivia) setShowTrivia(false);
        else if (showMangaLounge) setShowMangaLounge(false);
        else if (showClimbingQTE) setShowClimbingQTE(false);
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

      if (showMangaLounge) {
        if (isConfirm) {
          e.preventDefault();
          playSound('chime');
          setShowMangaLounge(false);
          setShowTrivia(true);
          setCurrentQuestionIdx(0);
          setCorrectStreak(0);
          setTriviaResult(null);
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
            if (menuRow >= 8 && menuRow <= 11) {
              // stat rows: ◀ takes a point back, ▶ spends one
              adjustStat(STAT_KEYS[menuRow - 8], dir);
              playSound(dir > 0 ? 'chime' : 'thump');
            } else if (menuRow <= 7) {
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
          if (menuRow === 12 || e.key === 'Enter') handleStartGame();
          else if (menuRow <= 7) applyCreationChoice(menuRow, menuCol);
        }
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameStarted, menuRow, menuCol, activeGameStation, showTrivia, triviaResult, triviaHidden, triviaHintUsed,
      showKitchen, cookingItem, showCarousel, showTravelDiary, showVisitorGallery, selectedGalleryProfile,
      selectedVisitorReview, showGuestbookSubmit, showPCProjects, pcActiveProject,
      showTacticalBlueprints, showMangaLounge, showClimbingQTE, showFullscreenSoccer, showFullscreenBiking,
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

  // Typewriter effect (deterministic slice so first character 'W' is never dropped)
  useEffect(() => {
    let currentLen = 0;
    setDisplayedText("");
    const typingInterval = setInterval(() => {
      currentLen++;
      setDisplayedText(dialogueText.slice(0, currentLen));
      if (currentLen >= dialogueText.length) {
        clearInterval(typingInterval);
      }
    }, 18);
    return () => clearInterval(typingInterval);
  }, [dialogueText]);

  // Proximity triggers and Raghav NPC AI
  const checkProximity = (col, row) => {
    let foundNearby = null;
    // Strictly standing on target per user request ("make it so that when standing on target only then it shows the popup")
    let minDistance = 0.65;

    // Check specific activity targets
    ACTIVITY_TARGETS.forEach(item => {
      const dist = Math.hypot(item.target.col - col, item.target.row - row);
      if (dist <= minDistance) {
        foundNearby = item;
        minDistance = dist;
      }
    });

    // 🐈 Easter egg: the wandering cat (standing on cat tile)
    const cat = CAT_SPOTS[catSpot];
    const catDist = Math.hypot(cat.col - col, cat.row - row);
    if (catDist <= minDistance) {
      foundNearby = {
        id: 'cat',
        title: '??? · A Cat',
        symbol: '🐈',
        dialogue: "🐈 A soft orange cat is loafing here, slowly blinking at you. It seems to own this room. Press E to pet.",
        inspectPrompt: 'PET THE CAT'
      };
      minDistance = catDist;
    }

    // 🥪 Easter egg: midnight fridge raid (standing in front of fridge at 6, 2)
    const frDist = Math.hypot(6 - col, 2 - row);
    if (frDist <= minDistance) {
      foundNearby = {
        id: 'fridge-raid',
        title: 'Suspicious Fridge',
        symbol: '🧊',
        dialogue: "🧊 [Fridge]: A faint glow comes from inside. Raghav labelled everything 'DO NOT EAT'. Press E anyway.",
        inspectPrompt: 'RAID FRIDGE'
      };
      minDistance = frDist;
    }

    // Inspect the roaming developer himself (standing adjacent/touching Raghav)
    const rp = raghavBrain.current.pos;
    const rDist = Math.hypot(rp.col - col, rp.row - row);
    if (rDist <= 0.85 && rDist < minDistance) {
      foundNearby = {
        id: 'profile',
        title: 'Raghav · The Developer',
        symbol: '🧑‍💻',
        dialogue: "🧑‍💻 [Raghav]: Oh hey — you caught me! Press E to inspect the developer (stats, story & projects).",
        inspectPrompt: 'INSPECT DEVELOPER'
      };
      minDistance = rDist;
    }

    if (foundNearby) {
      if (nearObjectRef.current?.id !== foundNearby.id) {
        setDialogueText(foundNearby.dialogue);
        nearObjectRef.current = foundNearby;
        setNearObject(foundNearby);
      }
    } else {
      if (nearObjectRef.current !== null) {
        setDialogueText("Welcome to my cozy overworld space! Walk up to items to inspect, or click tiles.");
        nearObjectRef.current = null;
        setNearObject(null);
      }
    }

    // 📍 Section discovery notification: shows for 3s, reappears only after 10s cooldown upon re-entering
    const roundedCol = Math.round(col);
    const roundedRow = Math.round(row);
    const currentSection = ROOM_SECTIONS.find(s => s.inZone(roundedCol, roundedRow));
    const newSectionId = currentSection ? currentSection.id : null;

    if (newSectionId !== currentSectionIdRef.current) {
      currentSectionIdRef.current = newSectionId;
      if (currentSection) {
        const lastTime = lastSectionTimesRef.current[currentSection.id] || 0;
        const now = Date.now();
        if (now - lastTime >= 10000) {
          lastSectionTimesRef.current[currentSection.id] = now;
          setActiveSectionBanner(currentSection);
          if (sectionBannerTimerRef.current) clearTimeout(sectionBannerTimerRef.current);
          sectionBannerTimerRef.current = setTimeout(() => {
            setActiveSectionBanner(null);
          }, 3000);
        }
      }
    }
  };

  const isModalOpen = !gameStarted || isPaused || showFullscreenSoccer || showFullscreenBiking || showTravelDiary || showCarousel || showVisitorGallery || showKitchen || showTrivia || showMangaLounge || showGuestbookSubmit || showClimbingQTE || showTacticalBlueprints || showPCProjects || Boolean(activeGameStation) || Boolean(selectedGalleryProfile) || Boolean(selectedVisitorReview) || Boolean(activeItemId);

  // Tell the page when an in-game popup (trivia, kitchen, diary, minigames…)
  // is open. On phones, index.css then expands the game screen to fill the
  // display — popups are positioned inside it and were cramped into ~300px.
  // (the item-inspect card is App's own fixed overlay, so it doesn't count)
  const popupOpen = gameStarted && isModalOpen && !isPaused && !activeItemId;
  useEffect(() => {
    document.body.classList.toggle('game-popup-open', popupOpen);
    return () => document.body.classList.remove('game-popup-open');
  }, [popupOpen]);

  // Clear any stuck inputs when modal opens or closes
  useEffect(() => {
    keysPressed.current = {};
    clickTarget.current = null;
    setFrame(0);
  }, [isModalOpen]);

  // Keyboard controls listener
  useEffect(() => {
    if (!gameStarted) return;

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      
      if (isModalOpen) {
        // Paused: arrows & WASD navigate selection menus, never move character
        keysPressed.current = {};
        clickTarget.current = null;
        return;
      }

      // Walking keys must not scroll the page underneath the console
      // (leave Space alone on focused controls so it can still press a button)
      const onControl = ['BUTTON', 'INPUT', 'TEXTAREA', 'SELECT'].includes(e.target && e.target.tagName);
      if (e.key.startsWith('Arrow') || (e.key === ' ' && !onControl)) e.preventDefault();

      if (e.key === 'ArrowUp') keysPressed.current['w'] = true;
      if (e.key === 'ArrowDown') keysPressed.current['s'] = true;
      if (e.key === 'ArrowLeft') keysPressed.current['a'] = true;
      if (e.key === 'ArrowRight') keysPressed.current['d'] = true;
      
      if (['w', 'a', 's', 'd'].includes(key)) {
        keysPressed.current[key] = true;
        clickTarget.current = null;
      }
      
      if (['e', ' ', 'b'].includes(key)) {
        keysPressed.current[key] = true;
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

    // Alt-tab / switching tabs while holding a key never delivers its keyup —
    // drop all held keys so the avatar doesn't keep walking on return.
    const handleBlur = () => {
      keysPressed.current = {};
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [gameStarted, isModalOpen]);

  // Continuous game loop
  useEffect(() => {
    if (!gameStarted) return;
    let animId;

    const gameLoop = () => {
      // Pause character when reading or in any modal
      if (isModalOpen) {
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
          else if (type === 'football' || type === 'tacticboard') {
            setShowTacticalBlueprints(true);
            keysPressed.current['e'] = false;
            keysPressed.current[' '] = false;
          }
          else if (type === 'arcade' || type === 'anime') {
            setShowMangaLounge(true);
            keysPressed.current['e'] = false;
            keysPressed.current[' '] = false;
          }
          else if (type === 'gallery' || type === 'bulletin') {
            // Open Photo Frame Wall Gallery & Guestbook
            setShowVisitorGallery(true);
            keysPressed.current['e'] = false;
            keysPressed.current[' '] = false;
          }
          else if (type === 'bed') {
            // Spawning bed: restore energy & stamina
            playSound('chime');
            setEnergyLevel(100);
            setDialogueText("🛏️ [Spawning Bed]: Fully rested! Social battery & energy restored to 100%.");
            pushToast("🛏️ Rested: 100% Energy restored!", "#ffd166");
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
            // Start QTE Climbing minigame / Hangboard stats
            setQteProgress(0);
            setQteStatus('playing');
            const keysList = QTE_KEYS;
            const initialRandom = keysList[Math.floor(Math.random() * keysList.length)];
            setQteKey(initialRandom);
            setBoulderingTab('climb');
            setShowClimbingQTE(true);
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
          else if (type === 'profile') {
            handleInspect('profile');
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
        if (isPausedRef.current) return;
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
            if (!inKickoff && !isMatchEnded && !isPausedRef.current) {
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
      // Check if loading or game ended or in kickoff countdown (or START-paused)
      if (!isLoaded || isMatchEnded || inKickoff || isPausedRef.current) {
        if (isPausedRef.current) for (const k in keys) keys[k] = false;
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

      // 2. Opponent Sprite (Raghav in red/black jersey) chases ball (slower & relaxed reaction latency)
      let aiSpeed = 0.25; // Reduced AI speed per user request

      aiThinkFrames += 1;
      // recalculate target only every 38 frames (~630ms) to simulate slower reaction delay
      if (aiThinkFrames >= 38) {
        aiThinkFrames = 0;
        decidedAiDx = 0;
        decidedAiDy = 0;
        decidedAiMoving = false;

        if (bCol > aiCol + 2.5) { decidedAiDx = aiSpeed; decidedAiDir = 'right'; decidedAiMoving = true; }
        else if (bCol < aiCol - 2.5) { decidedAiDx = -aiSpeed; decidedAiDir = 'left'; decidedAiMoving = true; }
        if (bRow > aiRow + 2.5) { decidedAiDy = aiSpeed; decidedAiDir = 'down'; decidedAiMoving = true; }
        else if (bRow < aiRow - 2.5) { decidedAiDy = -aiSpeed; decidedAiDir = 'up'; decidedAiMoving = true; }
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
      
      if (dist < 6.5) {
        const approach = Math.sqrt(dx*dx + dy*dy);
        // Boosted player kick power to make scoring satisfying and accessible
        const force = 1.30 + approach * 1.30;
        bVelCol = (distCol / (dist || 1)) * force;
        bVelRow = (distRow / (dist || 1)) * force;
        playSound('step');
      }

      // 6. Conserves Momentum transfer on Raghav approach collisions
      const aiDistCol = bCol - aiCol;
      const aiDistRow = bRow - aiRow;
      const aiDist = Math.sqrt(aiDistCol*aiDistCol + aiDistRow*aiDistRow);

      if (aiDist < 6.0) {
        // Raghav kicks ball towards Left Goal, but with human inaccuracy & spread!
        const aimSpread = (Math.random() - 0.5) * 65; // Wide spread makes many kicks miss wide or hit side walls
        const targetGoalC = 5;
        const targetGoalR = 50 + aimSpread;
        const kickDirC = targetGoalC - bCol;
        const kickDirR = targetGoalR - bRow;
        const kickDist = Math.sqrt(kickDirC*kickDirC + kickDirR*kickDirR);

        // 35% chance of miskick / soft touch
        const miskick = Math.random() < 0.35;
        const kickPower = miskick ? 0.38 : 0.56;

        bVelCol = (kickDirC / (kickDist || 1)) * kickPower;
        bVelRow = (kickDirR / (kickDist || 1)) * kickPower;
        playSound('step');
        setDialogueText(miskick ? "🧠 Raghav scuffs the kick!" : "🧠 Raghav takes a shot!");
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
      if (isPausedRef.current) return;
      countdownSec -= 1;
      if (countdownSec <= 0) {
        clearInterval(countdownInterval);
        setDialogueText("🟢 GO!!! GO!!! RACE STARTED!");
        lapStart = Date.now();
        
        // Start stopwatch ticking
        timerInterval = setInterval(() => {
          if (isPausedRef.current) return;
          setLapTimer(t => Number((t + 0.1).toFixed(1)));
        }, 100);
      } else {
        setDialogueText(`🚦 READY... ${countdownSec}...`);
      }
    }, 1000);

    let pausedAt = 0;
    const tick = () => {
      if (isRaceEnded) {
        animId = requestAnimationFrame(tick);
        return;
      }

      // START-paused: freeze the race, and on resume shift the lap start
      // forward so the paused time doesn't count toward the lap
      if (isPausedRef.current) {
        if (!pausedAt) pausedAt = Date.now();
        for (const k in keys) keys[k] = false;
        animId = requestAnimationFrame(tick);
        return;
      }
      if (pausedAt) {
        lapStart += Date.now() - pausedAt;
        pausedAt = 0;
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
          const keysList = QTE_KEYS;
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
          const keysList = QTE_KEYS;
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
    if (!gameStarted || isModalOpen) return;
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
          justifyContent: 'flex-start',
          padding: '16px 14px 28px',
          boxSizing: 'border-box',
          position: 'relative',
          overflowY: 'auto'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
          <h2 className="pixel-header" style={{ fontSize: '1.15rem', color: 'var(--rpg-highlight)', margin: '0 0 6px 0', textShadow: '0 0 12px rgba(0,255,255,0.45)' }}>
            🏠 DESIGN YOUR EXPLORER
          </h2>
          <p className="pixel-text" style={{ fontSize: '1.15rem', color: '#7a7a8a', margin: 0 }}>
            Create an avatar, then step into Raghav's pixel world.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '20px', width: '100%', maxWidth: '780px', flexWrap: 'wrap', justifyContent: 'center' }}>
          
          {/* Left panel: Live Sprite Preview, Name & Quick Enter Button */}
          <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <div className="rpg-box" style={{ width: '150px', height: '150px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 50% 40%, #11241a 0%, #000 75%)', border: '3px solid var(--rpg-text)', boxShadow: '0 0 18px rgba(0,255,102,0.45)' }}>
              <div style={{ width: '92px', height: '92px' }}>
                <Sprite direction="down" frame={previewFrame} customColors={customColors} />
              </div>
            </div>

            <p className="pixel-text" style={{ fontSize: '1.3rem', color: 'var(--rpg-highlight)', textAlign: 'center', margin: 0, fontWeight: 'bold' }}>
              {customName.trim() || 'Wanderer'}
            </p>
            <p className="pixel-text" style={{ fontSize: '0.95rem', color: '#888', textAlign: 'center', margin: 0 }}>
              Live preview · animates as you walk
            </p>

            {/* Explorer Name Input */}
            <div style={{ width: '100%' }}>
              <label className="pixel-header" style={{ fontSize: '0.68rem', color: 'var(--rpg-text)', display: 'block', marginBottom: '4px', textAlign: 'center' }}>
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
                  border: '2px solid var(--rpg-text)',
                  color: '#fff',
                  fontSize: '1.3rem',
                  padding: '5px 8px',
                  width: '100%',
                  textAlign: 'center',
                  outline: 'none',
                  boxSizing: 'border-box',
                  borderRadius: '4px'
                }}
              />
            </div>

            {/* Quick Action Start Button */}
            <button
              onClick={handleStartGame}
              className="pixel-header animate-bob"
              style={{
                width: '100%',
                marginTop: '4px',
                background: 'var(--rpg-accent)',
                color: '#fff',
                border: '3px solid #000',
                padding: '10px 14px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 3px 0 #000',
                outline: 'none',
                ...(menuRow === 12 ? FOCUS_RING : {})
              }}
            >
              🎮 ENTER ROOM [A]
            </button>
          </div>

          {/* Right panel: Customization Presets */}
          <div style={{ flex: 1, minWidth: '290px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* 1. Hairstyle choices (Row 0) */}
            <div className="rpg-box" style={{ padding: '8px 12px', background: '#050508' }}>
              <span className="pixel-header" style={{ fontSize: '0.62rem', display: 'block', marginBottom: '6px', color: 'var(--rpg-highlight)' }}>✂️ HAIRSTYLE & CUT:</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(88px, 1fr))', gap: '6px' }}>
                {HAIR_STYLES.map((h, idx) => (
                  <button
                    key={h.id}
                    onClick={() => setHairStyle(h.id)}
                    className="pixel-header"
                    style={{
                      background: hairStyle === h.id ? 'var(--rpg-text)' : '#111',
                      color: hairStyle === h.id ? '#000' : '#fff',
                      border: '2px solid var(--rpg-text)',
                      padding: '5px 2px',
                      cursor: 'pointer',
                      fontSize: '0.6rem',
                      ...ring(0, idx)
                    }}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Outfit / Top choices (Row 1) */}
            <div className="rpg-box" style={{ padding: '8px 12px', background: '#050508' }}>
              <span className="pixel-header" style={{ fontSize: '0.62rem', display: 'block', marginBottom: '6px', color: 'var(--rpg-highlight)' }}>🧥 TOP / OUTFIT TYPE:</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                {OUTFIT_TYPES.map((o, idx) => (
                  <button
                    key={o.id}
                    onClick={() => setOutfitType(o.id)}
                    className="pixel-header"
                    style={{
                      background: outfitType === o.id ? 'var(--rpg-text)' : '#111',
                      color: outfitType === o.id ? '#000' : '#fff',
                      border: '2px solid var(--rpg-text)',
                      padding: '5px 0',
                      cursor: 'pointer',
                      fontSize: '0.6rem',
                      ...ring(1, idx)
                    }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Pants / Jeans choices (Row 2) */}
            <div className="rpg-box" style={{ padding: '8px 12px', background: '#050508' }}>
              <span className="pixel-header" style={{ fontSize: '0.62rem', display: 'block', marginBottom: '6px', color: 'var(--rpg-highlight)' }}>👖 PANTS / BOTTOMS TYPE:</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                {PANTS_TYPES.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => setPantsType(p.id)}
                    className="pixel-header"
                    style={{
                      background: pantsType === p.id ? 'var(--rpg-text)' : '#111',
                      color: pantsType === p.id ? '#000' : '#fff',
                      border: '2px solid var(--rpg-text)',
                      padding: '5px 0',
                      cursor: 'pointer',
                      fontSize: '0.6rem',
                      ...ring(2, idx)
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Face Styles / Accessories (Row 3) */}
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
                      ...ring(3, idx)
                    }}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Skin Colors grid (Row 4) */}
            <div className="rpg-box" style={{ padding: '8px 12px', background: '#050508' }}>
              <span className="pixel-header" style={{ fontSize: '0.62rem', display: 'block', marginBottom: '6px', color: 'var(--rpg-highlight)' }}>🤚 SKIN COMPLEXION TONE:</span>
              <div style={{ display: 'flex', gap: '12px' }}>
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
                      ...ring(4, idx)
                    }}
                  />
                ))}
              </div>
            </div>

            {/* 6. Curated Color Presets (Rows 5, 6, 7) */}
            <div className="rpg-box" style={{ padding: '8px 12px', background: '#050508', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="pixel-header" style={{ fontSize: '0.62rem', display: 'block', color: 'var(--rpg-highlight)' }}>🎨 CURATED COLOR PALETTES:</span>
              
              <div>
                <span className="pixel-header" style={{ fontSize: '0.52rem', color: '#888', display: 'block', marginBottom: '4px' }}>• Hair & Cap Color:</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {HAIR_COLORS.map((color, idx) => (
                    <div
                      key={color}
                      onClick={() => setSelectedHatColor(color)}
                      style={{ width: '22px', height: '22px', borderRadius: '4px', background: color, border: selectedHatColor === color ? '2px solid #fff' : '1px solid #000', cursor: 'pointer', ...ring(5, idx) }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <span className="pixel-header" style={{ fontSize: '0.52rem', color: '#888', display: 'block', marginBottom: '4px' }}>• Shirt & Jacket Color:</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {SHIRT_COLORS.map((color, idx) => (
                    <div
                      key={color}
                      onClick={() => setSelectedShirtColor(color)}
                      style={{ width: '22px', height: '22px', borderRadius: '4px', background: color, border: selectedShirtColor === color ? '2px solid #fff' : '1px solid #000', cursor: 'pointer', ...ring(6, idx) }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <span className="pixel-header" style={{ fontSize: '0.52rem', color: '#888', display: 'block', marginBottom: '4px' }}>• Pants & Jeans Color:</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {PANTS_COLORS.map((color, idx) => (
                    <div
                      key={color}
                      onClick={() => setSelectedPantsColor(color)}
                      style={{ width: '22px', height: '22px', borderRadius: '4px', background: color, border: selectedPantsColor === color ? '2px solid #fff' : '1px solid #000', cursor: 'pointer', ...ring(7, idx) }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* ⚔️ Attribute Point Allocator (Rows 8..11) */}
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
                      ...(menuRow === 8 + idx ? FOCUS_RING : {})
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
                {menuRow >= 8 && menuRow <= 11
                  ? `▶ ${STAT_INFO[STAT_KEYS[menuRow - 8]].perk}`
                  : '💡 These change how the game plays: speed, energy, inspect range, hints.'}
              </p>
            </div>

          </div>

        </div>

        {/* Start Game Action Button (Row 12) */}
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
            ...(menuRow === 12 ? FOCUS_RING : {})
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
          const next = !isAudioEnabled;
          setIsAudioEnabled(next);
          globalAudioEnabled = next;
          isAudioEnabledRef.current = next;
          const ctx = getAudioCtx();
          if (next) {
            if (ctx && ctx.state === 'suspended') {
              ctx.resume().then(() => playSound('chime', true)).catch(() => playSound('chime', true));
            } else {
              playSound('chime', true);
            }
            pushToast("🔊 Sound Unmuted", "#4caf50");
          } else {
            pushToast("🔇 Sound Muted", "#f44336");
          }
        }}
        className="pixel-header sound-toggle"
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 500,
          background: isAudioEnabled ? 'rgba(0, 40, 20, 0.95)' : 'rgba(20, 20, 30, 0.95)',
          color: isAudioEnabled ? '#4caf50' : '#888',
          border: `2px solid ${isAudioEnabled ? '#4caf50' : '#555'}`,
          padding: '4px 8px',
          fontSize: '0.68rem',
          cursor: 'pointer',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.6)'
        }}
      >
        {isAudioEnabled ? "🔊 SOUND: ON" : "🔇 SOUND: MUTED"}
      </button>

      {/* 🍞 Quest / badge toast stack (top-center popups) — starts below the
          SOUND button and wraps, so long toasts aren't hidden or cut off */}
      <div style={{ position: 'absolute', top: '44px', left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 24px)', zIndex: 300, display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center', pointerEvents: 'none' }}>
        {toasts.map(t => (
          <div
            key={t.id}
            className="pixel-header animate-bob game-toast"
            style={{
              background: 'rgba(10, 10, 18, 0.92)',
              color: t.color,
              border: `2px solid ${t.color}`,
              padding: '6px 14px',
              fontSize: '0.7rem',
              borderRadius: '4px',
              boxShadow: '0 4px 0 rgba(0,0,0,0.6)',
              maxWidth: '100%',
              textAlign: 'center',
              lineHeight: 1.5
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
          gridTemplateRows: `repeat(${MAP_ROWS}, 1fr)`
        }}
      >
        {/* Floating 3-second Section Discovery Banner */}
        {activeSectionBanner && (
          <div
            className="pixel-header animate-bob section-banner"
            style={{
              position: 'absolute',
              top: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 35,
              background: 'rgba(10, 10, 16, 0.94)',
              border: '2px solid var(--rpg-highlight)',
              borderRadius: '20px',
              padding: '5px 16px',
              color: '#fff',
              fontSize: '0.74rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(0, 255, 255, 0.4)',
              pointerEvents: 'none'
            }}
          >
            <span style={{ fontSize: '1rem' }}>{activeSectionBanner.icon}</span>
            <span style={{ color: 'var(--rpg-highlight)', letterSpacing: '1px' }}>
              {activeSectionBanner.name}
            </span>
          </div>
        )}

        {/* Glowing floor rings on each activity spot — interactions only trigger
            when standing on one, so visitors need to see where they are */}
        {ACTIVITY_TARGETS.map(item => (
          <div
            key={`marker-${item.id}`}
            className={`activity-marker${nearObject?.id === item.id ? ' active' : ''}`}
            style={{
              left: `${(item.target.col / MAP_COLS) * 100}%`,
              top: `${(item.target.row / MAP_ROWS) * 100}%`
            }}
            aria-hidden="true"
          />
        ))}

        {tiles.map((t, idx) => {
          const isSolidObstacle = isTileSolid(t.col, t.row);
          const tileZIndex = isSolidObstacle ? (Math.floor(t.row * 10) + 5) : 1;

          return (
            <div 
              key={idx}
              onClick={() => handleTileClick(t.col, t.row)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                zIndex: tileZIndex,
                background: 'transparent',
                boxSizing: 'border-box'
              }}
            >
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

              {/* Dev tile number overlay if enabled */}
              {SHOW_TILE_NUMBERS && (
                <div style={{
                  position: 'absolute',
                  top: 1,
                  left: 1,
                  fontSize: '8px',
                  lineHeight: 1,
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  color: '#00ffff',
                  background: 'rgba(0,0,0,0.75)',
                  padding: '1px 3px',
                  borderRadius: '2px',
                  zIndex: 9999,
                  pointerEvents: 'none',
                  border: '1px solid rgba(0,255,255,0.4)'
                }}>
                  {idx}
                </div>
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

        {/* Raghav Animated NPC — increased by 15% to 37px x 44px */}
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
            width: '37px',
            height: '44px'
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
            isRaghav={true}
          />
        </div>



        {/* Custom Player Avatar Sprite — increased by 15% to 52px x 52px */}
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
            width: '52px',
            height: '52px',
            transition: 'none'
          }}
        >
          {nearObject && (
            <div
              className="pixel-header animate-bob"
              style={{
                position: 'absolute',
                top: '-45px',
                // Centered over the player, but near a side wall grow inward
                // instead — the room clips anything past its edge
                ...(playerPos.col < 4 ? { left: 0 } : playerPos.col > MAP_COLS - 4 ? { right: 0 } : {}),
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
              {IS_TOUCH ? '[A]' : '[E]'} {nearObject.inspectPrompt || "INSPECT"}
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
          
          <Sprite direction={direction} frame={frame} customColors={customColors} isRaghav={false} />
        </div>

      </div>

      {/* Parchment-scroll RPG dialogue box matching reference design */}
      {/* Box size, padding and font sizes live in index.css (.dialogue-*) so
          phones can shrink the scroll's wide decorative margins */}
      <div className="dialogue-parchment">
        <span className="pixel-header dialogue-title">
          {nearObject ? `${nearObject.symbol} ${nearObject.title.toUpperCase()} -` : `⛺ COZY SPACE -`}
        </span>
        <p className="pixel-text typing-cursor dialogue-text">
          {displayedText}
        </p>

        {nearObject && (
          <button
            onClick={() => {
              keysPressed.current['e'] = true;
            }}
            className="pixel-header dialogue-action"
            style={{
              background: '#b83226',
              color: '#fdf3dd',
              border: '2px solid #3a150c',
              padding: '5px 12px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              boxShadow: '2px 2px 0 #3a150c',
              borderRadius: '3px',
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

      {/* 🪧 Guestbook Bulletin Submit review Modal — renders above the gallery modal with zIndex 350 */}
      {showGuestbookSubmit && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.92)',
          zIndex: 350,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="rpg-box" style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '15px', borderColor: 'var(--rpg-highlight)', boxShadow: '0 0 30px rgba(0,255,255,0.4)' }}>
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

          <div style={{
            flex: 1,
            position: 'relative',
            background: 'repeating-linear-gradient(90deg, #1b4b22 0px, #1b4b22 36px, #235c2b 36px, #235c2b 72px)',
            imageRendering: 'pixelated',
            overflow: 'hidden'
          }}>
            {/* Field outline */}
            <div style={{ position: 'absolute', top: '10%', bottom: '10%', left: '5%', right: '5%', border: '3px solid rgba(255,255,255,0.85)', boxShadow: '0 0 4px rgba(0,0,0,0.5)' }} />
            {/* Halfway line */}
            <div style={{ position: 'absolute', top: '10%', bottom: '10%', left: '50%', borderLeft: '3px solid rgba(255,255,255,0.85)' }} />
            {/* Centre circle */}
            <div style={{ position: 'absolute', top: '40%', left: '44%', width: '12%', height: '20%', border: '3px solid rgba(255,255,255,0.85)', borderRadius: '50%' }} />
            {/* Centre spot */}
            <div style={{ position: 'absolute', top: '49.2%', left: '49.6%', width: '0.8%', height: '1.4%', background: 'rgba(255,255,255,0.9)', borderRadius: '50%' }} />

            {/* Penalty boxes */}
            <div style={{ position: 'absolute', top: '28%', bottom: '28%', left: '5%', width: '12%', border: '3px solid rgba(255,255,255,0.85)', borderLeft: 'none' }} />
            <div style={{ position: 'absolute', top: '28%', bottom: '28%', right: '5%', width: '12%', border: '3px solid rgba(255,255,255,0.85)', borderRight: 'none' }} />
            
            {/* LEFT GOAL Net (PLAYER GOAL) */}
            <div style={{
              position: 'absolute',
              top: '28%',
              bottom: '28%',
              left: '0.6%',
              width: '6.5%',
              border: '3px solid #ffffff',
              borderLeft: '4px solid #fff',
              background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.22) 0px, rgba(255,255,255,0.22) 1.5px, transparent 1.5px, transparent 8px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.22) 0px, rgba(255,255,255,0.22) 1.5px, transparent 1.5px, transparent 8px), rgba(0,0,0,0.3)',
              boxShadow: 'inset 4px 0 10px rgba(0,0,0,0.6)',
              borderRadius: '2px 0 0 2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 8
            }}>
              <span className="pixel-header" style={{ transform: 'rotate(-90deg)', fontSize: '0.48rem', color: 'rgba(255,255,255,0.75)', letterSpacing: '1px' }}>YOUR GOAL</span>
            </div>

            {/* RIGHT GOAL Net (AI GOAL) */}
            <div style={{
              position: 'absolute',
              top: '28%',
              bottom: '28%',
              right: '0.6%',
              width: '6.5%',
              border: '3px solid #ffffff',
              borderRight: '4px solid #fff',
              background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.22) 0px, rgba(255,255,255,0.22) 1.5px, transparent 1.5px, transparent 8px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.22) 0px, rgba(255,255,255,0.22) 1.5px, transparent 1.5px, transparent 8px), rgba(0,0,0,0.3)',
              boxShadow: 'inset -4px 0 10px rgba(0,0,0,0.6)',
              borderRadius: '0 2px 2px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 8
            }}>
              <span className="pixel-header" style={{ transform: 'rotate(90deg)', fontSize: '0.48rem', color: 'rgba(255,255,255,0.75)', letterSpacing: '1px' }}>RAGHAV GOAL</span>
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
          <div className="rpg-box" style={{ width: '92%', maxWidth: '520px', maxHeight: '85%', overflowY: 'auto', background: '#08080f', borderColor: 'var(--rpg-highlight)', boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)', padding: '14px 16px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--rpg-highlight)', paddingBottom: '8px', marginBottom: '12px' }}>
              <span className="pixel-header" style={{ fontSize: '0.78rem', color: 'var(--rpg-highlight)' }}>🧗 BOULDERING & HANGBOARD</span>
              <button 
                onClick={() => setShowClimbingQTE(false)}
                className="pixel-header"
                style={{ background: 'var(--rpg-accent)', color: '#fff', border: '2px solid #000', padding: '2px 8px', fontSize: '0.62rem', cursor: 'pointer' }}
              >
                CLOSE [B]
              </button>
            </div>

            {/* Segmented tab buttons: Climb Wall vs Grip Stats */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button
                onClick={() => { playSound('blip'); setBoulderingTab('climb'); }}
                className="pixel-header"
                style={{
                  flex: 1,
                  background: boulderingTab === 'climb' ? 'var(--rpg-highlight)' : '#1a1a24',
                  color: boulderingTab === 'climb' ? '#000' : '#aaa',
                  border: '2px solid ' + (boulderingTab === 'climb' ? 'var(--rpg-highlight)' : '#333'),
                  padding: '6px 0',
                  fontSize: '0.68rem',
                  cursor: 'pointer'
                }}
              >
                🧗 CLIMB WALL
              </button>
              <button
                onClick={() => { playSound('blip'); setBoulderingTab('hangboard'); }}
                className="pixel-header"
                style={{
                  flex: 1,
                  background: boulderingTab === 'hangboard' ? '#2196f3' : '#1a1a24',
                  color: boulderingTab === 'hangboard' ? '#fff' : '#aaa',
                  border: '2px solid ' + (boulderingTab === 'hangboard' ? '#2196f3' : '#333'),
                  padding: '6px 0',
                  fontSize: '0.68rem',
                  cursor: 'pointer'
                }}
              >
                💪 GRIP & STATS
              </button>
            </div>

            {boulderingTab === 'climb' ? (
              <>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'stretch' }}>
                  {/* Vertical Wall Climbing Progress Bar (Left side) */}
                  <div style={{ width: '50px', background: '#1c1917', border: '2px solid #78716c', position: 'relative', display: 'flex', flexDirection: 'column-reverse', padding: '3px' }}>
                    {[...Array(5)].map((_, i) => {
                      const filled = qteProgress > i;
                      return (
                        <div 
                          key={i} 
                          style={{ 
                            height: '28px', 
                            margin: '2px 0', 
                            background: filled ? '#00e5ff' : '#333', 
                            border: '1px solid #111',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            transition: 'background 0.2s'
                          }}
                        >
                          {filled ? '🧗' : '◽'}
                        </div>
                      );
                    })}
                  </div>

                  {/* Action instructions and prompts (Right side) */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '10px' }}>
                    <p className="pixel-text" style={{ fontSize: '1.15rem', color: '#ccc', margin: 0, lineHeight: 1.35 }}>
                      Conquer the V5 overhang! Press the matching key hold highlighted below when prompted. Hit 5 in a row!
                    </p>

                    {qteStatus === 'playing' && (
                      <div style={{ textAlign: 'center', background: '#000', padding: '10px', border: '2px solid var(--rpg-text)', borderRadius: '4px' }}>
                        <div className="pixel-header" style={{ fontSize: '0.58rem', color: '#ffb700', marginBottom: '4px' }}>NEXT HOLD TO GRAB:</div>
                        <div className="pixel-header animate-bob" style={{ fontSize: '1.6rem', color: 'var(--rpg-highlight)', textShadow: '0 0 10px var(--rpg-highlight)' }}>
                          {qteLabel(qteKey)}
                        </div>
                      </div>
                    )}

                    {qteStatus === 'success' && (
                      <div style={{ background: '#1b3c1a', border: '2px solid #00ff66', color: '#00ff66', padding: '10px', textAlign: 'center', borderRadius: '4px' }}>
                        <h4 className="pixel-header" style={{ fontSize: '0.75rem', margin: '0 0 4px 0' }}>🏆 WALL CLIMBED!</h4>
                        <p className="pixel-text" style={{ fontSize: '1.1rem', margin: 0 }}>
                          Scaled the slab. Gained +15 Grip Power. Climber Elite active!
                        </p>
                      </div>
                    )}

                    {qteStatus === 'fail' && (
                      <div style={{ background: '#4a1515', border: '2px solid #ff1744', color: '#ff1744', padding: '10px', textAlign: 'center', borderRadius: '4px' }}>
                        <h4 className="pixel-header" style={{ fontSize: '0.75rem', margin: '0 0 4px 0' }}>❌ FALLEN!</h4>
                        <p className="pixel-text" style={{ fontSize: '1.1rem', margin: 0 }}>
                          Slipped off the sloper. Re-chalking hands...
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #333', marginTop: '12px', paddingTop: '8px' }}>
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
              </>
            ) : (
              /* Hangboard & Grip stats view */
              <div style={{ background: '#12243d', color: '#fff', borderRadius: '4px', border: '2px solid #2196f3', padding: '12px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ width: '44px', height: '44px', background: '#000', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>
                    🧗
                  </div>
                  <div>
                    <h3 className="pixel-header" style={{ fontSize: '0.8rem', color: '#ffd700', margin: '0 0 2px 0' }}>RAGHAV CLIMBER</h3>
                    <span className="pixel-header" style={{ fontSize: '0.5rem', color: '#90caf9' }}>Class: Granite Slab Hyperfixator</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.72rem', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>🏅 Climbing Level:</span> <span style={{ color: '#ffd700', fontWeight: 'bold' }}>V5 (Sandstone redpoint)</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>💪 Pull-up Rep Max:</span> <span style={{ color: '#ffd700' }}>22 Repetitions</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>✊ Crimp Dead-Hang:</span> <span style={{ color: '#ffd700' }}>8 / 10 (15mm micro-edges)</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>🔋 Core Stability:</span> <span style={{ color: '#90caf9' }}>Gold Tier (Plank Max: 4m)</span></div>
                </div>

                <div style={{ marginTop: '10px', borderTop: '1px dashed rgba(255,255,255,0.15)', paddingTop: '8px', fontSize: '0.65rem', color: '#cfd8dc', lineHeight: 1.35 }}>
                  <strong style={{ color: '#ffd700' }}>Current Training Regimen:</strong><br/>
                  • Dead-hang crimps (7s hold, 3s rest) on 15mm edges.<br/>
                  • Weekly volume board sessions focusing on high-tension body positioning.
                </div>
              </div>
            )}

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
          <div className="rpg-box" style={{ width: '95%', maxWidth: '540px', maxHeight: '85%', overflowY: 'auto', background: '#0a100a', borderColor: '#4caf50', boxShadow: '0 0 25px rgba(76, 175, 80, 0.3)', padding: '14px 16px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #4caf50', paddingBottom: '6px', marginBottom: '10px' }}>
              <span className="pixel-header" style={{ fontSize: '0.75rem', color: '#4caf50' }}>📋 RAGHAV'S FOOTBALL CHALKBOARD</span>
              <button 
                onClick={() => setShowTacticalBlueprints(false)}
                className="pixel-header"
                style={{ background: 'var(--rpg-accent)', color: '#fff', border: '2px solid #000', padding: '2px 8px', fontSize: '0.62rem', cursor: 'pointer' }}
              >
                CLOSE [B]
              </button>
            </div>

            {/* Chalkboard styling */}
            <div style={{ background: '#1c361e', border: '3px solid #8d6e63', padding: '10px 12px', color: '#eceff1', borderRadius: '4px', boxShadow: 'inset 0 0 16px rgba(0,0,0,0.8)' }}>

              <div style={{ borderBottom: '1px dashed rgba(255,255,255,0.25)', paddingBottom: '6px', marginBottom: '8px', textAlign: 'center' }}>
                <h3 className="pixel-header" style={{ fontSize: '0.72rem', color: '#ffeb3b', margin: 0 }}>
                  FC BARCELONA — MÉS QUE UN CLUB
                </h3>
                <span style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: '#81c784' }}>Raghav's one and only football religion</span>
              </div>

              {/* Fandom columns */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {/* Chalkboard Drawing */}
                <div style={{ flex: '0 0 120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '120px', height: '80px' }}>
                    <PixelProp type="tacticboard" />
                  </div>
                </div>

                {/* Club / Player / Loyalty details */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.7rem', lineHeight: '1.3', fontFamily: 'monospace' }}>
                  <div>
                    <span style={{ color: '#4fc3f7', fontWeight: 'bold' }}>🔵🔴 CLUB — FC Barcelona:</span>
                    <span style={{ color: '#ccc', marginLeft: '4px' }}>The Blaugrana. Tiki-taka purists, La Masia philosophy — style over everything.</span>
                  </div>
                  <div>
                    <span style={{ color: '#ffeb3b', fontWeight: 'bold' }}>🐐 PLAYER — Lionel Messi:</span>
                    <span style={{ color: '#ccc', marginLeft: '4px' }}>The GOAT. Pure inspiration from the #10 whose left foot rewrote football history.</span>
                  </div>
                  <div>
                    <span style={{ color: '#ffd54f', fontWeight: 'bold' }}>💛 LOYALTY — Visca Barça:</span>
                    <span style={{ color: '#ccc', marginLeft: '4px' }}>Through trebles & heartbreak, a culer for life. One club, forever.</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Play Match call-to-action */}
            <button
              onClick={() => { setShowTacticalBlueprints(false); setShowFullscreenSoccer(true); }}
              className="pixel-header"
              style={{ marginTop: '10px', width: '100%', background: 'var(--rpg-highlight)', color: '#000', border: '2px solid #000', padding: '8px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '2px 2px 0 #000' }}
            >
              ⚽ PLAY A MATCH — 1V1 SOCCER DUEL
            </button>

          </div>
        </div>
      )}

      {/* 4B. 📚 Manga & Anime Lounge Overview Modal (Matches Football Chalkboard Layout) */}
      {showMangaLounge && (
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
          <div className="rpg-box" style={{
            width: '95%',
            maxWidth: '560px',
            maxHeight: '85%',
            overflowY: 'auto',
            background: '#0d0914',
            borderColor: '#9c27b0',
            boxShadow: '0 0 25px rgba(156, 39, 176, 0.35)',
            padding: '14px 16px'
          }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #9c27b0', paddingBottom: '6px', marginBottom: '10px' }}>
              <span className="pixel-header" style={{ fontSize: '0.75rem', color: '#ba68c8' }}>📚 RAGHAV'S MANGA & ANIME LOUNGE</span>
              <button 
                onClick={() => setShowMangaLounge(false)}
                className="pixel-header"
                style={{ background: 'var(--rpg-accent)', color: '#fff', border: '2px solid #000', padding: '2px 8px', fontSize: '0.62rem', cursor: 'pointer' }}
              >
                CLOSE [B]
              </button>
            </div>

            {/* Aesthetic Lounge Card styling */}
            <div style={{ background: '#181124', border: '3px solid #6a1b9a', padding: '10px 12px', color: '#eceff1', borderRadius: '4px', boxShadow: 'inset 0 0 16px rgba(0,0,0,0.8)' }}>

              <div style={{ borderBottom: '1px dashed rgba(255,255,255,0.2)', paddingBottom: '6px', marginBottom: '8px', textAlign: 'center' }}>
                <h3 className="pixel-header" style={{ fontSize: '0.75rem', color: '#e1bee7', margin: 0 }}>
                  RAGHAV'S ANIME & MANGA SANCTUARY
                </h3>
                <span style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: '#ce93d8' }}>Curated archive of peak storytelling, worldbuilding, and retro shonen lore</span>
              </div>

              {/* Watchlist & Favorites Grid */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                {/* Prop icon / illustration on the left */}
                <div style={{ flex: '0 0 110px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <div style={{ width: '80px', height: '90px' }}>
                    <PixelProp type="arcade" />
                  </div>
                  <span style={{ fontSize: '0.52rem', fontFamily: 'monospace', color: '#ab47bc', textAlign: 'center' }}>Retro Weeb Terminal</span>
                </div>

                {/* Categories */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.68rem', lineHeight: '1.35', fontFamily: 'monospace' }}>
                  <div>
                    <span style={{ color: '#ffd54f', fontWeight: 'bold' }}>⭐ ALL-TIME PEAK:</span>
                    <div style={{ color: '#ccc', marginLeft: '6px' }}>• <strong style={{ color: '#fff' }}>Hunter × Hunter</strong> (Chimera Ant arc, peak power system)</div>
                    <div style={{ color: '#ccc', marginLeft: '6px' }}>• <strong style={{ color: '#fff' }}>Attack on Titan</strong> (Masterclass narrative pacing & Erwin hype)</div>
                    <div style={{ color: '#ccc', marginLeft: '6px' }}>• <strong style={{ color: '#fff' }}>Cyberpunk: Edgerunners</strong> (Trigger art & emotional damage)</div>
                  </div>
                  <div>
                    <span style={{ color: '#4fc3f7', fontWeight: 'bold' }}>📺 CURRENT WATCHLIST:</span>
                    <div style={{ color: '#ccc', marginLeft: '6px' }}>• <strong style={{ color: '#fff' }}>Dandadan</strong> (Turbo Granny chaos & kinetic animation)</div>
                    <div style={{ color: '#ccc', marginLeft: '6px' }}>• <strong style={{ color: '#fff' }}>Bleach: TYBW</strong> (Studio Pierrot cinema-grade Bankai)</div>
                    <div style={{ color: '#ccc', marginLeft: '6px' }}>• <strong style={{ color: '#fff' }}>Jujutsu Kaisen</strong> (Shibuya incident & Domain expansions)</div>
                  </div>
                  <div>
                    <span style={{ color: '#81c784', fontWeight: 'bold' }}>⏳ PLAN TO WATCH / READING:</span>
                    <div style={{ color: '#ccc', marginLeft: '6px' }}>• <strong style={{ color: '#fff' }}>Frieren</strong>, <strong style={{ color: '#fff' }}>Vinland Saga S2</strong>, <strong style={{ color: '#fff' }}>Monster</strong></div>
                  </div>
                </div>
              </div>

            </div>

            {/* Play Trivia Arcade call-to-action button */}
            <button
              onClick={() => {
                setShowMangaLounge(false);
                setShowTrivia(true);
                setCurrentQuestionIdx(0);
                setCorrectStreak(0);
                setTriviaResult(null);
              }}
              className="pixel-header"
              style={{
                marginTop: '10px',
                width: '100%',
                background: 'var(--rpg-highlight)',
                color: '#000',
                border: '2px solid #000',
                padding: '8px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '2px 2px 0 #000'
              }}
            >
              🕹️ PLAY MANGA LORE TRIVIA ARCADE
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
          <div className="rpg-box" style={{
            width: '95%',
            maxWidth: '680px',
            maxHeight: '85%',
            overflowY: 'auto',
            background: '#050508',
            borderColor: '#00e5ff',
            boxShadow: '0 0 25px rgba(0, 229, 255, 0.3)',
            padding: '14px 16px'
          }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid #00e5ff', paddingBottom: '8px', marginBottom: '12px' }}>
              <span className="pixel-header" style={{ fontSize: '0.85rem', color: '#00e5ff' }}>🖥️ RAGHAV'S GLOWING COMMAND DECK</span>
              <button 
                onClick={() => setShowPCProjects(false)}
                className="pixel-header"
                style={{ background: 'var(--rpg-accent)', color: '#fff', border: '2px solid #000', padding: '2px 8px', fontSize: '0.65rem', cursor: 'pointer' }}
              >
                CLOSE [B]
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(200px, 240px) 1fr',
              gap: '12px',
              alignItems: 'stretch'
            }}>
              {/* Left Column: Project Selection Terminal */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#111', padding: '10px', borderRadius: '4px', border: '2px solid #333' }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', background: '#000', border: '3px solid #333', padding: '10px', borderRadius: '4px', height: '280px', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '4px', marginBottom: '8px', fontSize: '0.52rem', fontFamily: 'monospace', color: '#ff007f' }}>
                  <span>TERMINAL: stdout</span>
                  <span>STATUS: RUNNING</span>
                </div>

                {/* CRT Glowing terminal text logs box */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'monospace', fontSize: '0.92rem', color: '#39ff14', textShadow: '0 0 4px rgba(57,255,20,0.5)', paddingRight: '4px' }}>
                  {simulatedLogs.map((log, idx) => (
                    <div key={idx} style={{ wordBreak: 'break-all', whiteSpace: 'normal', lineHeight: '1.3' }}>
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
