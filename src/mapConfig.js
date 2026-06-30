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

// 3. 🍔 Raghav's Cyber Diner Counter (solid counter at cols 7, row 12)
SOLID_TILES.add("7,12"); 

// 4. 📚 Manga & CD Corner Obstacles (L-shaped bookshelf and CD shelf)
SOLID_TILES.add("16,1"); // CD & Film Shelf Col 16, Row 1
SOLID_TILES.add("17,1"); // Bookshelf Col 17, Row 1
SOLID_TILES.add("18,1"); // Bookshelf Col 18, Row 1
SOLID_TILES.add("18,2"); // Bookshelf Col 18, Row 2
SOLID_TILES.add("18,3"); // Bookshelf Col 18, Row 3

// 5. ⚽ Soccer Goal Obstacles (Goalpost at bottom-right col 18, row 11)
SOLID_TILES.add("18,11"); // Soccer Net Landmark

// 6. Bedroom Spawning Pad (Bed at top-left corner)
SOLID_TILES.add("1,1");
SOLID_TILES.add("2,1");
SOLID_TILES.add("1,2");
SOLID_TILES.add("2,2");

// 7. 🖼️ Hall of Fame Photo Frame Board
SOLID_TILES.add("10,1"); 

// 8. 🚲 Red Bicycle Rack
SOLID_TILES.add("10,13"); 

// 9. Manual solid coordinates for visual props that are not interactable
SOLID_TILES.add("6,1"); // Stove (left kitchen block)
SOLID_TILES.add("8,1"); // Fridge (right kitchen block)
SOLID_TILES.add("4,4"); // Desk (left profile block)
SOLID_TILES.add("2,6"); // Upper climbing wall hold block

// 10. Interactive NPC Objects (Single cell interaction points)
export const INTERACTABLE_OBJECTS = [
  {
    id: "profile",
    title: "Raghav (Room Host)",
    desc: "The room host, bouldering enthusiast, and campfire cook.",
    symbol: "🧑",
    color: "#ff007f",
    cells: [
      { col: 5, row: 4 }
    ],
    dialogue: "Welcome to my digital room overworld! I am Raghav. Stand next to my desk or any styled corner and press E to check out my items!",
    inspectPrompt: "TALK TO HOST"
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
      { col: 2, row: 5 }
    ],
    dialogue: "💪 [Hangboard]: A wooden fingerboard. Press E to inspect Raghav's climbing and bicep stats!",
    inspectPrompt: "INSPECT STRENGTH"
  },
  {
    id: "bookshelf",
    title: "Books & Films Shelf",
    desc: "A cozy four-tile mahogany bookshelf loaded with anime, manga volumes, and film directories.",
    symbol: "📚",
    color: "#8a2be2",
    cells: [
      { col: 17, row: 1 },
      { col: 18, row: 1 },
      { col: 18, row: 2 },
      { col: 18, row: 3 }
    ],
    dialogue: "📚 [Books & Films Corner]: A massive mahogany bookshelf corner. Stand near it and press E to check out my fixations or test your trivia knowledge!",
    inspectPrompt: "INSPECT CORNER"
  },
  {
    id: "cd_shelf",
    title: "CD & Film Shelf",
    desc: "A rustic wood shelf displaying vintage anime soundtrack CDs, Ghibli scores, and retro movies.",
    symbol: "💿",
    color: "#8a2be2",
    cells: [
      { col: 16, row: 1 }
    ],
    dialogue: "💿 [CD & Film Shelf]: A rustic shelf loaded with classic soundtrack CDs and movies. Stand near it and press E to check out my fixations or test your trivia knowledge!",
    inspectPrompt: "BROWSE CD SHELF"
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
    id: "football",
    title: "Soccer Ball",
    desc: "A mini goal post with a black and white soccer ball parked inside.",
    symbol: "⚽",
    color: "#00ffff",
    cells: [
      { col: 17, row: 11 }
    ],
    dialogue: "⚽ [Soccer Field]: Tactical analysis board and mini ball. Ready to play 1v1 soccer duel?",
    inspectPrompt: "PLAY SOCCER MATCH"
  },
  {
    id: "tacticboard",
    title: "Soccer tactics chalkboard",
    desc: "A chalkboard showing Champions League team formations, defensive high-lines, and counter-attack transitions.",
    symbol: "📋",
    color: "#00ffff",
    cells: [
      { col: 15, row: 10 }
    ],
    dialogue: "📋 [Tactical Playbook]: Chalkboard covered in Champions League 4-3-3 counter-pressing strategies. Press E to open playbook!",
    inspectPrompt: "READ PLAYBOOK"
  },
  {
    id: "toolbox",
    title: "Motorbike repair cabinet",
    desc: "A professional tool chest loaded with wrenches, chain tensioners, and grease for bike tuning.",
    symbol: "🧰",
    color: "#e53935",
    cells: [
      { col: 11, row: 13 }
    ],
    dialogue: "🧰 [Tuning Workbench]: Toolbox loaded with mechanical tools to tune and upgrade your motorbike. Press E to inspect!",
    inspectPrompt: "OPEN TUNING CABINET"
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
  if ((col === 17 || col === 18) && row === 1 || col === 18 && (row === 2 || row === 3)) {
    return "📚 [Books & Films Corner]: A massive mahogany bookshelf corner. Stand near it and press E to check out my fixations or test your trivia knowledge!";
  }
  if (col === 16 && row === 1) {
    return "💿 [CD & Film Shelf]: A rustic wood shelf displaying vintage anime soundtrack CDs, Ghibli scores, and retro movies. Press E to browse!";
  }
  if (col === 10 && row === 1) {
    return "🖼️ [Gallery of Explorers]: A gilded golden photo frame hanging on the wall. Walk up and press E to view the retro visitor reviews!";
  }
  if (col === 10 && row === 13) {
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
  if (col === 18 && row === 11) {
    return "🥅 [Soccer Net]: Decorative goalpost net. Stand next to it and press E to open the Fullscreen Soccer Arcade!";
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
    if (col === 17 && row === 1) return "bookshelf";
    
    if (col === 7 && row === 12) return "diner-table";

    if (col === 18 && row === 11) return "goalpost";

    if (col === 10 && row === 1) return "bulletin";
    if (col === 10 && row === 13) return "bike";

    // Borders
    if (row === 0) return "wall-top";
    if (row === MAP_ROWS - 1) return "wall-bottom";
    if (col === 0 || col === MAP_COLS - 1) return "wall-side";
    return "solid-prop";
  }
  
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

  // 2. ⚽ Soccer Field Zone (Bottom-right turf: cols 15-18, rows 10-12)
  if (col >= 15 && col <= 18 && row >= 10 && row <= 12) {
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
