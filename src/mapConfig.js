// Map Configurations for 2D RPG Portfolio Game
export const MAP_COLS = 20;
export const MAP_ROWS = 15;

const SOLID_TILES = new Set();

// 1. Borders (Top, Bottom, Left, Right)
for (let c = 0; c < MAP_COLS; c++) {
  SOLID_TILES.add(`${c},0`);          // Top wall
  SOLID_TILES.add(`${c},${MAP_ROWS - 1}`); // Bottom wall baseboard
}
for (let r = 0; r < MAP_ROWS; r++) {
  SOLID_TILES.add(`0,${r}`);          // Left edge wall
  SOLID_TILES.add(`${MAP_COLS - 1},${r}`); // Right wall
}

// 2. Top wall furniture row (tiles 20 to 39: row 1 across the whole room)
for (let c = 0; c < MAP_COLS; c++) {
  SOLID_TILES.add(`${c},1`);
}

// 3. 🧗 Bouldering / Climbing wall along Column 1 (tiles 21, 61..281)
for (let r = 1; r < MAP_ROWS - 1; r++) {
  SOLID_TILES.add(`1,${r}`);
}

// 4. 🛏️ Spawning Bed (cols 1-2, rows 1-3)
SOLID_TILES.add("2,1");
SOLID_TILES.add("2,2");

// Explicit tile accessibility rules per user specifications:
// - Square 41 (col 1, row 2) and square 62 (col 2, row 3) must NOT be blocked
SOLID_TILES.delete("1,2"); // Square 41 accessible
SOLID_TILES.delete("2,3"); // Square 62 accessible

// 5. 🖥️ Command Deck Desk (center: cols 9-11, row 5)
// - Square 108 (col 8, row 5) must be ACCESSIBLE
// - Square 111 (col 11, row 5) must be INACCESSIBLE
SOLID_TILES.delete("8,5"); // Square 108 accessible
SOLID_TILES.add("9,5");    // Square 109 solid
SOLID_TILES.add("10,5");   // Square 110 solid
SOLID_TILES.add("11,5");   // Square 111 INACCESSIBLE

// 6. Interactive Objects
export const INTERACTABLE_OBJECTS = [
  {
    id: "profile",
    title: "Raghav (Developer)",
    desc: "The creator and developer. Chaotic Co-Pilot, builder of this digital overworld.",
    symbol: "🖥️",
    color: "#ff007f",
    cells: [
      { col: 9, row: 6 },
      { col: 9, row: 7 }
    ],
    dialogue: "👋 [Raghav]: Welcome to my overworld base! Feel free to explore every corner, play mini-games, or test my weeb lore!",
    inspectPrompt: "TALK TO RAGHAV"
  },
  {
    id: "bouldering",
    title: "Bouldering & Hangboard Wall",
    desc: "10-foot climbing slab with technical holds and wooden pull-up hangboard for grip conditioning.",
    symbol: "🧗",
    color: "#ff8c00",
    cells: [
      { col: 1, row: 4 }, { col: 1, row: 5 }, { col: 1, row: 6 }, { col: 1, row: 7 },
      { col: 2, row: 4 }, { col: 2, row: 5 }, { col: 2, row: 6 }, { col: 2, row: 7 },
      { col: 3, row: 4 }, { col: 3, row: 5 }, { col: 3, row: 6 }, { col: 3, row: 7 }
    ],
    dialogue: "🧗 [Bouldering & Hangboard]: Technical climbing slab & grip conditioning board. Press E or Action [A] to view stats & climb!",
    inspectPrompt: "CLIMB & STATS"
  },
  {
    id: "kitchen",
    title: "Cyber Bistro Kitchen",
    desc: "Retro fridge, stainless sink, and sizzling stove cooking delicious street treats.",
    symbol: "🍳",
    color: "#ffc107",
    cells: [
      { col: 5, row: 2 }, { col: 6, row: 2 }, { col: 7, row: 2 }, { col: 8, row: 2 }, { col: 9, row: 2 },
      { col: 5, row: 3 }, { col: 6, row: 3 }, { col: 7, row: 3 }, { col: 8, row: 3 }, { col: 9, row: 3 }
    ],
    dialogue: "🍳 [Cyber Bistro Kitchen]: The grill is sizzling hot! Press E or Action [A] to cook food and restore stamina!",
    inspectPrompt: "COOK FOOD"
  },
  {
    id: "bulletin",
    title: "Hall of Fame Portraits",
    desc: "Four framed explorer portraits hanging on the wall celebrating visitors and guestbook reviews.",
    symbol: "🖼️",
    color: "#ffd700",
    cells: [
      { col: 10, row: 1 }, { col: 11, row: 1 }, { col: 12, row: 1 },
      { col: 10, row: 2 }, { col: 11, row: 2 }, { col: 12, row: 2 },
      { col: 10, row: 3 }, { col: 11, row: 3 }, { col: 12, row: 3 }
    ],
    dialogue: "🖼️ [Hall of Fame]: Gilded portrait gallery of overworld explorers. Press E to leave your review in the Guestbook!",
    inspectPrompt: "VIEW GUESTBOOK"
  },
  {
    id: "anime",
    title: "Manga & Anime Lounge",
    desc: "Cozy shelves packed with manga volumes, retro CRT monitor, and plush beanbags.",
    symbol: "📚",
    color: "#8a2be2",
    cells: [
      { col: 13, row: 2 }, { col: 14, row: 2 }, { col: 15, row: 2 }, { col: 16, row: 2 },
      { col: 13, row: 3 }, { col: 14, row: 3 }, { col: 15, row: 3 }, { col: 16, row: 3 },
      { col: 13, row: 4 }, { col: 14, row: 4 }, { col: 15, row: 4 }, { col: 16, row: 4 },
      { col: 14, row: 5 }, { col: 15, row: 5 }
    ],
    dialogue: "📚 [Manga Lounge]: Raghav's all-time favorites, current watchlist, and retro anime lore. Press E or Action [A] to enter!",
    inspectPrompt: "OPEN LOUNGE"
  },
  {
    id: "computerglowing",
    title: "Command Deck PC",
    desc: "Triple-monitor development command deck displaying live code, terminals, and charts.",
    symbol: "💻",
    color: "#00ffff",
    cells: [
      { col: 7, row: 4 }, { col: 8, row: 4 }, { col: 9, row: 4 }, { col: 10, row: 4 }, { col: 11, row: 4 },
      { col: 7, row: 5 }, { col: 8, row: 5 }, { col: 9, row: 5 }, { col: 10, row: 5 }, { col: 11, row: 5 },
      { col: 7, row: 6 }, { col: 8, row: 6 }, { col: 9, row: 6 }, { col: 10, row: 6 }, { col: 11, row: 6 },
      { col: 8, row: 7 }, { col: 9, row: 7 }, { col: 10, row: 7 }
    ],
    dialogue: "💻 [Command Deck]: Triple monitors running Vite, React, and Python crawlers. Press E to inspect developer project files!",
    inspectPrompt: "OPEN PC"
  },
  {
    id: "trekking",
    title: "Trek & Travel Campground",
    desc: "Cozy dome tent, campfire, sleeping bags, and travel scrapbook detailing alpine expeditions.",
    symbol: "⛺",
    color: "#2e7d32",
    cells: [
      { col: 1, row: 8 }, { col: 2, row: 8 }, { col: 3, row: 8 }, { col: 4, row: 8 }, { col: 5, row: 8 },
      { col: 1, row: 9 }, { col: 2, row: 9 }, { col: 3, row: 9 }, { col: 4, row: 9 }, { col: 5, row: 9 },
      { col: 1, row: 10 }, { col: 2, row: 10 }, { col: 3, row: 10 }, { col: 4, row: 10 }, { col: 5, row: 10 },
      { col: 1, row: 11 }, { col: 2, row: 11 }, { col: 3, row: 11 }, { col: 4, row: 11 }, { col: 5, row: 11 },
      { col: 2, row: 12 }, { col: 3, row: 12 }, { col: 4, row: 12 }
    ],
    dialogue: "⛺ [Trek Campground]: Raghav's travel scrapbook detailing Corsica GR20, Kyoto temple trails, and Hampi boulders. Press E to open!",
    inspectPrompt: "READ DIARY"
  },
  {
    id: "bike",
    title: "Red Motorcycle & Bike Garage",
    desc: "Sleek red cafe-racer motorcycle, rolling tool cabinet, and spare tyres.",
    symbol: "🏍️",
    color: "#e53935",
    cells: [
      { col: 8, row: 10 }, { col: 9, row: 10 }, { col: 10, row: 10 }, { col: 11, row: 10 },
      { col: 7, row: 11 }, { col: 8, row: 11 }, { col: 9, row: 11 }, { col: 10, row: 11 }, { col: 11, row: 11 },
      { col: 8, row: 12 }, { col: 9, row: 12 }, { col: 10, row: 12 }, { col: 11, row: 12 }
    ],
    dialogue: "🏍️ [Garage]: Red motorcycle tuned and ready! Press E or Action [A] to mount the vehicle and start the lap time trial!",
    inspectPrompt: "START TIME TRIAL"
  },
  {
    id: "tacticboard",
    title: "Soccer Stadium Pitch",
    desc: "Regulation turf pitch, tactical board, and full goal net celebrating FC Barcelona and Messi.",
    symbol: "⚽",
    color: "#00e676",
    cells: [
      { col: 14, row: 9 }, { col: 15, row: 9 }, { col: 16, row: 9 }, { col: 17, row: 9 },
      { col: 14, row: 10 }, { col: 15, row: 10 }, { col: 16, row: 10 }, { col: 17, row: 10 },
      { col: 14, row: 11 }, { col: 15, row: 11 }, { col: 16, row: 11 }, { col: 17, row: 11 },
      { col: 14, row: 12 }, { col: 15, row: 12 }, { col: 16, row: 12 }, { col: 17, row: 12 }
    ],
    dialogue: "⚽ [Soccer Pitch]: The turf is freshly cut! Press E or Action [A] to start the 1v1 Penalty Shootout Match!",
    inspectPrompt: "PLAY MATCH"
  },
  {
    id: "bed",
    title: "Cozy Spawning Bed",
    desc: "Warm honey-wood bed with gold diamond quilt. Fully restores energy and social battery.",
    symbol: "🛏️",
    color: "#fbc02d",
    cells: [
      { col: 1, row: 4 }, { col: 2, row: 4 },
      { col: 3, row: 1 }, { col: 3, row: 2 }, { col: 3, row: 3 }, { col: 3, row: 4 }
    ],
    dialogue: "🛏️ [Spawning Bed]: Cozy quilt bed. Restores 100% Social Battery and resets your spawn point.",
    inspectPrompt: "REST"
  }
];

// Helper check to see if a cell is solid
export function isTileSolid(col, row) {
  if (col < 0 || col >= MAP_COLS || row < 0 || row >= MAP_ROWS) return true;
  return SOLID_TILES.has(`${col},${row}`);
}

// Furniture dialogue helper for collision hits
export function getFurnitureDialogue(col, row) {
  if (col >= 1 && col <= 2 && row >= 1 && row <= 3) {
    return "🛏️ [Spawning Bed]: Cozy gold diamond quilt bed. Restores 100% Social Battery.";
  }
  // Climbing wall is the solid column 1 (column 0 is the outer border); checked
  // before the campground so bumping the wall at rows 8-13 names the wall
  if ((col === 0 || col === 1) && row >= 1 && row <= 13) {
    return "🧗 [Bouldering Wall]: 10-foot climbing slab covered in colorful grip holds. Finger strength required!";
  }
  if (col >= 6 && col <= 8 && row === 1) {
    return "🍳 [Bistro Kitchen]: Multi-burner cooking stove, sink, and retro fridge. Press E to cook street eats!";
  }
  if (col >= 13 && col <= 17 && row >= 1 && row <= 4) {
    return "📚 [Manga Lounge]: Cozy anime books, retro CRT, and soft beanbags. Press E to test your trivia lore!";
  }
  if (col >= 9 && col <= 11 && row === 5) { // the solid desk tiles (8,5 is walkable)
    return "💻 [Command Deck]: Triple-monitor terminal running code. Talk to Raghav or press E to inspect projects!";
  }
  if (col >= 1 && col <= 5 && row >= 8 && row <= 13) {
    return "⛺ [Trek Campground]: Alpine tent, campfire, and travel scrapbook detailing mountain expeditions.";
  }
  if (col >= 8 && col <= 12 && row >= 10 && row <= 12) {
    return "🏍️ [Garage]: Red motorcycle and rolling tool chest. Press E to start the lap trial or inspect tech stack!";
  }
  if (col >= 14 && col <= 18 && row >= 8 && row <= 13) {
    return "⚽ [Soccer Pitch]: Fresh grass turf and goal net. Press E to play a 1v1 penalty match!";
  }
  return null;
}

// Floor zone getter
export function getFloorType(col, row) {
  if (col >= 1 && col <= 5 && row >= 8 && row <= 13) {
    return "forest-floor"; // Camping
  }
  if (col >= 8 && col <= 12 && row >= 10 && row <= 13) {
    return "garage-floor"; // Concrete garage
  }
  if (col >= 14 && col <= 18 && row >= 8 && row <= 13) {
    return "soccer-turf";  // Green soccer turf
  }
  if (col >= 13 && col <= 18 && row >= 1 && row <= 4) {
    return "manga-lounge"; // Tatami / rug lounge
  }
  if (col >= 7 && col <= 11 && row >= 5 && row <= 7) {
    return "rug";          // Persian rug under desk
  }
  return "wood";           // Base wood plank floor
}

export function getTileType(col, row) {
  // 1. Boundary Walls
  if (row === 0) return "wall-top";
  if (row === MAP_ROWS - 1) return "wall-bottom";
  if (col === 0 || col === MAP_COLS - 1) return "wall-side";

  // 2. Fixed Major Furniture Props
  if ((col === 1 || col === 2) && (row === 1 || row === 2)) return "bed";
  if (col === 1 && row >= 3 && row <= 9) return "bouldering-wall";
  if (col === 17 && row === 1) return "bookshelf";
  if (col === 11 && row === 1) return "bulletin";
  if (col === 6 && row === 1) return "stove";
  if (col === 7 && row === 1) return "kitchen-counter";
  if (col === 8 && row === 1) return "fridge";
  if (col === 18 && (row === 10 || row === 11 || row === 12)) return "goalpost";

  // 3. Zone Floors
  if (isTileSolid(col, row)) return "solid";
  return getFloorType(col, row);
}
