// Map Configurations for 2D RPG Portfolio Game
export const MAP_COLS = 20;
export const MAP_ROWS = 15;

const SOLID_TILES = new Set();

// 1. Borders (Top, Bottom, Left, Right)
for (let c = 0; c < MAP_COLS; c++) {
  SOLID_TILES.add(`${c},0`);          
  SOLID_TILES.add(`${c},${MAP_ROWS - 1}`); 
}
for (let r = 0; r < MAP_ROWS; r++) {
  SOLID_TILES.add(`0,${r}`);          
  SOLID_TILES.add(`${MAP_COLS - 1},${r}`); 
}

// 2. Tatami Cozy corner bookshelf and bed (futon)
SOLID_TILES.add("2,2"); 
SOLID_TILES.add("3,2");
SOLID_TILES.add("1,1");
SOLID_TILES.add("2,1");

// 3. Bottom-Left Football corner props
SOLID_TILES.add("5,8");  // dumbbell-rack
SOLID_TILES.add("7,9");  // bicep mirror

// 4. Bottom-Right Bouldering Gym corner props
SOLID_TILES.add("15,8"); // dumbbell-rack
SOLID_TILES.add("17,9"); // bicep mirror

// 5. 🖼️ Gallery of Explorers Wall Frame
SOLID_TILES.add("10,1"); 

// Interactive NPC Objects (Single cell interaction points matching exact coordinates in the design image)
export const INTERACTABLE_OBJECTS = [
  {
    id: "profile",
    title: "Raghav NPC",
    desc: "The elite developer and highly lonely yearner candidate.",
    symbol: "🖥️",
    color: "#ff007f",
    cells: [
      { col: 5, row: 3 }
    ],
    dialogue: "Welcome to my overworld base! I am Raghav. Walk next to my desk or any styled corner to inspect my items!",
    inspectPrompt: "INSPECT DEVELOPER"
  },
  {
    id: "bouldering",
    title: "Bouldering Wall",
    desc: "A slanting wooden climbing structure with tiny colorful holds.",
    symbol: "🧗",
    color: "#ff8c00",
    cells: [
      { col: 12, row: 9 }
    ],
    dialogue: "🧗 [Bouldering Wall]: A slanting wooden climbing slab resting on a thick blue pad. Press E to climb!",
    inspectPrompt: "CLIMB WALL"
  },
  {
    id: "hangboard",
    title: "Pull-up Hangboard",
    desc: "A wooden fingerboard mounted above the wall for bicep pull-ups and finger grip conditioning.",
    symbol: "💪",
    color: "#ff8c00",
    cells: [
      { col: 12, row: 7 }
    ],
    dialogue: "💪 [Hangboard]: A wooden fingerboard. Press E to inspect Raghav's climbing and bicep stats!",
    inspectPrompt: "INSPECT STRENGTH"
  },
  {
    id: "anime",
    title: "Cozy Bookshelves",
    desc: "Towering wooden shelves overflowing with manga and developer lore.",
    symbol: "📚",
    color: "#8a2be2",
    cells: [
      { col: 2, row: 3 }
    ],
    dialogue: "📚 [Manga Corner]: Wooden bookshelves overflowing with ancient developer volumes. Press E to start manga trivia!",
    inspectPrompt: "INSPECT SHELF"
  },
  {
    id: "computerglowing",
    title: "Glowing Development PC",
    desc: "A premium dual-monitor command deck glowing in the dark, showing stock indices and web scraping terminals.",
    symbol: "🖥️",
    color: "#8a2be2",
    cells: [
      { col: 6, row: 2 }
    ],
    dialogue: "🖥️ [Command Deck]: Dual monitors displaying Jujutsu stock crawler codes. Press E to showcase Raghav's actual software projects!",
    inspectPrompt: "OPEN PC"
  },
  {
    id: "trekking",
    title: "Travel Diary Table",
    desc: "A wooden table holding an opened scrapbook detailing Raghav's travel diaries and photographs.",
    symbol: "📔",
    color: "#d2b48c",
    cells: [
      { col: 4, row: 12 }
    ],
    dialogue: "📔 [Travel Diary Table]: Raghav's personal scrapbook detailing high-friction boulder climbs, snowy summits, and global travel journals. Press E to open!",
    inspectPrompt: "READ DIARY"
  },
  {
    id: "kitchen",
    title: "Cyber Bistro Kitchen",
    desc: "A warm neon cooking stove and high-tech fridge counter.",
    symbol: "🍳",
    color: "#ffc107",
    cells: [
      { col: 8, row: 1 }
    ],
    dialogue: "🍳 [Cyber Bistro Kitchen]: The grill is sizzling hot! Press E to open the Kitchen Menu and cook delicious treats!",
    inspectPrompt: "COOK FOOD"
  },
  {
    id: "football",
    title: "Soccer Ball",
    desc: "A mini goal post with a black and white soccer ball parked inside.",
    symbol: "⚽",
    color: "#00ffff",
    cells: [
      { col: 5, row: 11 }
    ],
    dialogue: "⚽ [Soccer Field]: Tactical analysis board and mini ball. Ready to backtrack-tactics Champions League?",
    inspectPrompt: "INSPECT ORB OF CHAOS"
  },
  {
    id: "tacticboard",
    title: "Tactical Chalkboard",
    desc: "A chalkboard showing Champions League team formations and clean-architecture software design blueprints.",
    symbol: "📋",
    color: "#00ffff",
    cells: [
      { col: 2, row: 9 }
    ],
    dialogue: "📋 [Tactical Chalkboard]: Chalkboard covered in complex football tactics and software modular flow charts. Press E to inspect!",
    inspectPrompt: "READ BLUEPRINTS"
  },
  {
    id: "toolbox",
    title: "Red Rolling Toolbox",
    desc: "A sleek red rolling cabinet containing Raghav's software development stack.",
    symbol: "🧰",
    color: "#e53935",
    cells: [
      { col: 16, row: 2 }
    ],
    dialogue: "🧰 [Tech Toolbox]: A professional rolling tool cabinet. Press E to inspect Raghav's coding tech stack!",
    inspectPrompt: "OPEN TOOLBOX"
  }
];

// Add interactable object cells into solid cells set
INTERACTABLE_OBJECTS.forEach(obj => {
  obj.cells.forEach(cell => {
    SOLID_TILES.add(`${cell.col},${cell.row}`);
  });
});

// Helper check to see if a cell is solid
export function isTileSolid(col, row) {
  if (col < 0 || col >= MAP_COLS || row < 0 || row >= MAP_ROWS) return true;
  return SOLID_TILES.has(`${col},${row}`);
}

// Furniture dialogue helper for collision hits
export function getFurnitureDialogue(col, row) {
  if (col === 1 && row === 1 || col === 2 && row === 1) {
    return "🛏️ [Spawning Pad]: Cozy tatami futon bed. Restores 100% Social Battery.";
  }
  if (col === 2 && row === 2 || col === 3 && row === 2) {
    return "📚 [Manga Shelf]: Packed with volumes of Hunter-X-Hunter and ancient game developer magazines.";
  }
  if (col === 12 && row === 9) {
    return "🧗 [Bouldering Wall]: Volumetric climbing wall slanting backwards on a thick blue pad. Press E to climb!";
  }
  if (col === 12 && row === 7) {
    return "💪 [Hangboard]: Wooden fingerboard deadhang trainer. Press E to inspect fitness achievements!";
  }
  if (col === 10 && row === 1) {
    return "🖼️ [Gallery of Explorers]: A gilded golden photo frame hanging on the wall. Walk up and press E to view the retro visitor reviews!";
  }
  if (col === 16 && row === 2) {
    return "🧰 [Tech Stack Cabinet]: Raghav's red rolling toolbox. Press E to slide open stack drawers!";
  }
  if (col === 4 && row === 12) {
    return "📔 [Travel Diary Table]: Raghav\'s personal scrapbook detailing high-friction boulder climbs, GR20 alpine trekking, and travel photography. Press E to open the scrapbook!";
  }
  if (col === 8 && row === 1) {
    return "🍳 [Bistro Kitchen]: Multi-burner cooking stoves and high-tech refrigeration units. Walk up and press E to cook delicious street eats!";
  }
  if (col === 5 && row === 11) {
    return "⚽ [Soccer Ball]: Alternating green turf field ball. Walk up and push it to test lobby overworld soccer physics!";
  }
  if (col === 2 && row === 9) {
    return "📋 [Tactical Chalkboard]: Green chalkboard displaying Champions League formations and Clean Architecture maps. Press E to inspect!";
  }
  return null;
}

// Generate the full grid tilemap representation (quadrant layouts based on the reference design image)
export function getTileType(col, row) {
  if (SOLID_TILES.has(`${col},${row}`)) {
    const match = INTERACTABLE_OBJECTS.find(obj => 
      obj.cells.some(cell => cell.col === col && cell.row === row)
    );
    if (match) return `obstacle-${match.id}`;
    
    // Check specific furniture types
    if (col === 1 && row === 1 || col === 2 && row === 1) return "bed";
    if (col === 2 && row === 2 || col === 3 && row === 2) return "bookshelf";
    
    if (col === 10 && row === 1) return "bulletin";

    // Borders
    if (row === 0) return "wall-top";
    if (row === MAP_ROWS - 1) return "wall-bottom";
    if (col === 0 || col === MAP_COLS - 1) return "wall-side";
    return "solid-prop";
  }
  
  // Quadrant 1. 📚 Top-Left: Manga Cozy Reading Lounge & PC Desk (cols 1-9, rows 1-6)
  if (col >= 1 && col <= 9 && row >= 1 && row <= 6) {
    return "manga-lounge";
  }
  
  // Quadrant 2. 🏍️ Top-Right: Metallic Garage Workshop (cols 10-18, rows 1-6)
  if (col >= 10 && col <= 18 && row >= 1 && row <= 6) {
    return "garage-floor";
  }

  // Quadrant 3. ⚽ Bottom-Left: Striated Soccer Turf field (cols 1-9, rows 7-13)
  if (col >= 1 && col <= 9 && row >= 7 && row <= 13) {
    return "soccer-turf";
  }

  // Quadrant 4. 🧗 Bottom-Right: Dark Grey Gym Tiles & Climbing pad (cols 10-18, rows 7-13)
  if (col >= 10 && col <= 18 && row >= 7 && row <= 13) {
    return "climbing-floor";
  }

  return "grass";
}
