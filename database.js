/**
 * TerraLoop - Carbon Footprint Multipliers & State Definitions
 */
const EMISSION_FACTORS = {
  travel: {
    "petrol-car": 0.18,      // per km
    "diesel-car": 0.17,      // per km
    "electric-car": 0.05,    // per km
    "motorbike": 0.08,       // per km
    "bus": 0.04,             // per km
    "metro": 0.015,          // per km
    "flight-short": 0.25,    // per km
    "flight-long": 0.18      // per km
  },
  energy: {
    "grid-electricity": 0.85, // per kWh
    "natural-gas": 2.0,       // per kg/unit
    "diesel-generator": 2.68  // per liter
  },
  food: {
    "high-meat": 3.3,         // per meal
    "medium-meat": 2.2,       // per meal
    "pescatarian": 1.5,       // per meal
    "vegetarian": 1.1,        // per meal
    "vegan": 0.4              // per meal
  },
  shopping: {
    "electronics": 80.0,      // per item
    "clothing": 10.0,         // per item
    "furniture": 45.0,        // per item
    "general-waste": 1.5      // per kg
  }
};

const BASELINES = {
  travel: 5.0,
  energy: 6.0,
  food: 4.5,
  shopping: 3.5
};

const DEFAULT_STATE = {
  xp: 0,
  level: 1,
  streak: 0,
  lastLoggedDate: null,
  totalSaved: 0,
  activities: [],
  quests: [
    { id: "eco-commuter", title: "Eco Commuter", desc: "Log a public transit (bus or metro) trip", target: 1, current: 0, xp: 100, completed: false, claimed: false },
    { id: "green-chef", title: "Green Chef", desc: "Log 3 vegan meals to promote plant-based eating", target: 3, current: 0, xp: 150, completed: false, claimed: false },
    { id: "power-saver", title: "Power Saver", desc: "Log an energy usage event", target: 1, current: 0, xp: 100, completed: false, claimed: false },
    { id: "waste-reducer", title: "Waste Reducer", desc: "Log recycling or general waste management", target: 1, current: 0, xp: 120, completed: false, claimed: false }
  ],
  badges: [
    { id: "first-step", title: "First Step", icon: "🌱", desc: "Log your first carbon activity", unlocked: false },
    { id: "transit-pro", title: "Transit Pro", icon: "🚇", desc: "Complete the Eco Commuter challenge", unlocked: false },
    { id: "plant-power", title: "Plant Power", icon: "🥗", desc: "Unlock Green Chef milestone", unlocked: false },
    { id: "solar-knight", title: "Solar Knight", icon: "☀️", desc: "Save more than 15kg of CO2 emissions", unlocked: false },
    { id: "sim-pioneer", title: "Sim Pioneer", icon: "📊", desc: "Run a simulator scenario with >30% savings", unlocked: false },
    { id: "eco-master", title: "Eco Master", icon: "👑", desc: "Reach User Level 3", unlocked: false }
  ]
};
