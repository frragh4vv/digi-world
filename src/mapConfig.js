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

// 2. 🧗 Bouldering Gym Wall (Solid left wall block columns 1, rows 4 to 9)
for (let r = 4; r <= 9; r++) {
  SOLID_TILES.add(`1,${r}`);
}

// 3. 🍔 Raghav's Cyber Diner Counter — made walkable (was a solid block at 7,12)

// 4. 📚 Manga Lounge Obstacles (top-right bookshelf, pedestal, and arcade machine)
SOLID_TILES.add("13,1"); // Bookshelf (tall — body spans rows 1-2, base hangs to row 3)
SOLID_TILES.add("13,2"); // Bookshelf (lower half)
SOLID_TILES.add("16,1"); // 🕹️ Manga Arcade Trivia Cabinet!
SOLID_TILES.add("15,2"); // 📽️ Slide projector

// Camping / trekking corner + garage spare tyre
SOLID_TILES.add("2,11");  // Tent
SOLID_TILES.add("4,12");  // Campfire
SOLID_TILES.add("5,11");  // Travel suitcase
SOLID_TILES.add("12,13"); // Spare tyre

// 5. ⚽ Soccer corner — left as open, walkable grass turf (no goal / no collisions).
//    The soccer match is launched from the Tactical Chalkboard instead.

// 6. Bedroom Spawning Pad (Bed at top-left corner)
SOLID_TILES.add("1,1");
SOLID_TILES.add("2,1");
SOLID_TILES.add("1,2");
SOLID_TILES.add("2,2");

// 7. 🖼️ Hall of Fame Photo Frame Board
SOLID_TILES.add("10,1"); 

// 8. 🚲 Red Bicycle Rack
SOLID_TILES.add("9,12");

// 9. Manual solid coordinates for visual props that are not interactable
SOLID_TILES.add("6,1"); // Stove (left kitchen block)
SOLID_TILES.add("8,1"); // Fridge (right kitchen block)
SOLID_TILES.add("4,4"); // Desk (left profile block)
SOLID_TILES.add("2,6"); // Upper climbing wall hold block

// 10. Interactive NPC Objects (Single cell interaction points)
export const INTERACTABLE_OBJECTS = [
  {
    id: "profile",
    title: "Raghav NPC",
    desc: "The elite developer and highly lonely yearner candidate.",
    symbol: "🖥️",
    color: "#ff007f",
    cells: [
      { col: 5, row: 4 }
    ],
    dialogue: "Welcome to my overworld base! I am Raghav. Walk next to my desk or any styled corner to inspect my items!",
    inspectPrompt: "INSPECT DEVELOPER"
  },
  {
    id: "bouldering",
    title: "Bouldering Wall",
    desc: "A vertical pixelated climbing structure with tiny holds.",
    symbol: "🧗",
    color: "#ff8c00",
    cells: [
      { col: 2, row: 7 }
    ],
    dialogue: "🧗 [Bouldering Wall]: A 10-foot climbing slab covered in colorful grip holds. Press E to start the retro QTE climbing game!",
    inspectPrompt: "CLIMB WALL"
  },
  {
    id: "hangboard",
    title: "Pull-up Hangboard",
    desc: "A wooden fingerboard mounted above the wall for bicep pull-ups and finger grip conditioning.",
    symbol: "💪",
    color: "#ff8c00",
    cells: [
      { col: 3, row: 5 }
    ],
    dialogue: "💪 [Hangboard]: A wooden fingerboard. Press E to inspect Raghav's climbing and bicep stats!",
    inspectPrompt: "INSPECT STRENGTH"
  },
  {
    id: "anime",
    title: "Ancient Pedestal",
    desc: "An ornate stone stand glowing with magical energy, holding a manga volume.",
    symbol: "📚",
    color: "#8a2be2",
    cells: [
      { col: 16, row: 2 }
    ],
    dialogue: "📚 [Manga Corner]: Pedestal glowing with magical energy. Prepare to learn about retro weeb lore!",
    inspectPrompt: "INSPECT TOME"
  },
  {
    id: "computerglowing",
    title: "Glowing Development PC",
    desc: "A premium dual-monitor command deck glowing in the dark, showing stock indices and web scraping terminals.",
    symbol: "🖥️",
    color: "#8a2be2",
    cells: [
      { col: 9, row: 5 }
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
      { col: 3, row: 12 }
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
      { col: 7, row: 1 }
    ],
    dialogue: "🍳 [Cyber Bistro Kitchen]: The grill is sizzling hot! Press E to open the Kitchen Menu and cook delicious treats!",
    inspectPrompt: "COOK FOOD"
  },
  {
    id: "tacticboard",
    title: "Football Chalkboard",
    desc: "A chalkboard celebrating FC Barcelona and Messi, with the line-up ready to kick off a match.",
    symbol: "📋",
    color: "#00ffff",
    cells: [
      { col: 15, row: 10 }
    ],
    dialogue: "📋 [Football Chalkboard]: FC Barcelona tactics, Messi tributes, and a ⚽ Play Match button. Press E to open!",
    inspectPrompt: "OPEN CHALKBOARD"
  },
  {
    id: "toolbox",
    title: "Red Rolling Toolbox",
    desc: "A sleek red rolling cabinet containing Raghav's software development stack.",
    symbol: "🧰",
    color: "#e53935",
    cells: [
      { col: 11, row: 13 }
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
  if (col === 1 && row === 1 || col === 2 && row === 1 || col === 1 && row === 2 || col === 2 && row === 2) {
    return "🛏️ [Spawning Pad]: Cozy red velvet bed. Restores 100% Social Battery.";
  }
  if (col === 1 && row >= 4 && row <= 9) {
    return "🧗 [Bouldering Wall]: 10-foot climbing wall covered in tiny colorful holds. Finger grip required!";
  }
  if (col === 13 && row === 1) {
    return "📚 [Manga Shelf]: Packed with volumes of Hunter-X-Hunter and ancient game developer magazines.";
  }
  if (col === 16 && row === 1) {
    return "🕹️ [Manga Trivia Arcade]: A glowing retro arcade cabinet! Stand in front of it and press E to test your Manga Lore.";
  }
  if (col === 10 && row === 1) {
    return "🖼️ [Gallery of Explorers]: A gilded golden photo frame hanging on the wall. Walk up and press E to view the retro visitor reviews!";
  }
  if (col === 9 && row === 12) {
    return "🚲 [Bicycle Rack]: Raghav\'s red pixel cruiser. Stand next to it and press E to mount the bike and double your speed!";
  }
  if (col === 3 && row === 12) {
    return "📔 [Travel Diary Table]: Raghav\'s personal scrapbook detailing high-friction boulder climbs, GR20 alpine trekking, and travel photography. Press E to open the scrapbook!";
  }
  if ((col === 6 || col === 7 || col === 8) && row === 1) {
    return "🍳 [Bistro Kitchen]: Multi-burner cooking stoves and high-tech refrigeration units. Walk up and press E to cook delicious street eats!";
  }
  if (col === 7 && row === 12) {
    return "🍽️ [Bistro Dining Table]: A wood diner counter in the Cyber Diner bistro. Restores tranquility and serves hot street eats!";
  }
  return null;
}

// Generate the full grid tilemap representation (pathways, grass, decorative elements)
export function getTileType(col, row) {
  if (SOLID_TILES.has(`${col},${row}`)) {
    const match = INTERACTABLE_OBJECTS.find(obj => 
      obj.cells.some(cell => cell.col === col && cell.row === row)
    );
    if (match) return `obstacle-${match.id}`;
    
    // Check specific furniture types
    if (col === 1 && row === 1 || col === 2 && row === 1 || col === 1 && row === 2 || col === 2 && row === 2) return "bed";
    if (col === 1 && row >= 4 && row <= 9) return "bouldering-wall";
    if (col === 13 && (row === 1 || row === 2)) return "bookshelf";

    // Camping / trekking corner props (bottom-left forest)
    if (col === 2 && row === 11) return "tent";
    if (col === 4 && row === 12) return "campfire";
    if (col === 5 && row === 11) return "suitcase";
    // Garage spare tyre + manga-lounge slide projector
    if (col === 12 && row === 13) return "tyre";
    if (col === 15 && row === 2) return "projector";

    if (col === 7 && row === 12) return "diner-table";

    if (col === 10 && row === 1) return "bulletin";
    if (col === 9 && row === 12) return "bike";

    // Borders
    if (row === 0) return "wall-top";
    if (row === MAP_ROWS - 1) return "wall-bottom";
    if (col === 0 || col === MAP_COLS - 1) return "wall-side";
    return "solid-prop";
  }
  
  return getFloorType(col, row);
}

// Returns the floor zone a cell belongs to, ignoring whether it's solid.
// Used so that prop / obstacle tiles can paint the SAME floor as their
// surroundings instead of a dark box, letting the art sit on the floor.
export function getFloorType(col, row) {
  // New Floor Mats: Climbing Crash Pad (cols 1-3, rows 4-9) & Garage Mat (cols 10-12, rows 12-13)
  if (col >= 1 && col <= 3 && row >= 4 && row <= 9) {
    return "climbing-pad";
  }
  if (col >= 10 && col <= 12 && row >= 12 && row <= 13) {
    return "garage-floor";
  }

  // 1. 🌲 Bottom-left Forest Corner (cols 1-5, rows 10-13)
  if (col >= 1 && col <= 5 && row >= 10 && row <= 13) {
    return "forest-floor";
  }

  // 2. ⚽ Soccer Field Zone (Bottom-right turf: expanded to cols 14-18, rows 9-13)
  if (col >= 14 && col <= 18 && row >= 9 && row <= 13) {
    return "soccer-turf";
  }

  // 3. 📚 Manga Lounge floor (Top-right Tatami: cols 15-18, rows 1-3)
  if (col >= 15 && col <= 18 && row >= 1 && row <= 3) {
    return "manga-lounge";
  }

  // 4. 🍔 "Raghav's Diner" cyber bistro (bottom-left checkered floor: cols 6-9, rows 11-13)
  if (col >= 6 && col <= 9 && row >= 11 && row <= 13) {
    return "restaurant-floor";
  }

  // 5. Cozy Bedroom central rug carpet
  if (col >= 5 && col <= 13 && row >= 5 && row <= 9) {
    return "rug";
  }

  // Gravel pathway
  if (row === 10 || col === 11) {
    return "path";
  }

  return "grass";
}
