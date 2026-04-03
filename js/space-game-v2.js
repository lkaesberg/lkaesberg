/**
 * Space Defender - An IO-Game Style Space Adventure
 * Features: Gravity, Asteroid Defense, Ship Hulls, Weapons, Abilities, Tutorial
 */

class SpaceGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    
    // Load saved progress
    this.loadProgress();
    
    // Game state
    this.gameLoop = null;
    this.paused = false;
    this.gameOver_ = false;
    this.gameOverReason = 'Hull integrity critical';
    this.gameTime = 0;
    this.screenShake = 0;
    this.screenShakeIntensity = 0;
    
    // Tutorial state
    this.showTutorial = !this.savedData.tutorialSeen;
    this.tutorialPage = 0;
    
    // Camera (for larger world)
    this.camera = { x: 0, y: 0 };
    this.worldSize = 3000;
    
    // Ship hulls definition
    this.shipHulls = [
      { id: 'starter', name: 'Scout', color: '#e8e8e8', accentColor: '#60a5fa', speedMod: 1, healthMod: 1, damageMod: 1, cost: 0, desc: 'Basic scout ship' },
      { id: 'racer', name: 'Racer', color: '#ff6b6b', accentColor: '#ffd93d', speedMod: 1.4, healthMod: 0.7, damageMod: 0.9, cost: 500, desc: '+40% Speed, -30% Health' },
      { id: 'tank', name: 'Fortress', color: '#4a5568', accentColor: '#48bb78', speedMod: 0.7, healthMod: 1.6, damageMod: 1.1, cost: 750, desc: '+60% Health, -30% Speed' },
      { id: 'stealth', name: 'Shadow', color: '#2d3748', accentColor: '#9f7aea', speedMod: 1.2, healthMod: 0.9, damageMod: 1.2, cost: 1000, desc: '+20% Speed & Damage' },
      { id: 'destroyer', name: 'Destroyer', color: '#c53030', accentColor: '#fc8181', speedMod: 0.9, healthMod: 1.2, damageMod: 1.5, cost: 1500, desc: '+50% Damage, +20% Health' },
      { id: 'cosmic', name: 'Cosmic', color: '#667eea', accentColor: '#f6e05e', speedMod: 1.15, healthMod: 1.15, damageMod: 1.15, cost: 2500, desc: '+15% All Stats' }
    ];
    
    // Weapons definition
    this.weapons = [
      { id: 'laser', name: 'Laser', color: '#60a5fa', damage: 1, speed: 1, rate: 1, spread: 0, cost: 0, desc: 'Standard laser', icon: '💠' },
      { id: 'plasma', name: 'Plasma', color: '#4ade80', damage: 1.3, speed: 0.9, rate: 0.8, spread: 0, cost: 400, desc: '+30% Damage', icon: '🟢' },
      { id: 'rapid', name: 'Rapid Fire', color: '#fbbf24', damage: 0.6, speed: 1.3, rate: 2.5, spread: 5, cost: 600, desc: 'Fast but weak', icon: '⚡' },
      { id: 'cannon', name: 'Cannon', color: '#ef4444', damage: 2.5, speed: 0.7, rate: 0.4, spread: 0, cost: 800, desc: 'Heavy damage', icon: '💥' },
      { id: 'spread', name: 'Spread Shot', color: '#f472b6', damage: 0.8, speed: 1, rate: 0.7, spread: 25, shots: 3, cost: 1200, desc: 'Triple shot', icon: '🔱' },
      { id: 'beam', name: 'Particle Beam', color: '#a78bfa', damage: 0.15, speed: 3, rate: 8, spread: 0, cost: 2000, desc: 'Continuous beam', icon: '🔮' }
    ];
    
    // Abilities definition
    this.abilities = [
      { id: 'none', name: 'None', cost: 0, cooldown: 0, desc: 'No ability', icon: '➖' },
      { id: 'boost', name: 'Turbo Boost', cost: 300, cooldown: 600, duration: 120, desc: '3x speed for 2s', icon: '🚀' },
      { id: 'shield_burst', name: 'Shield Burst', cost: 500, cooldown: 900, duration: 180, desc: 'Invincible 3s', icon: '🛡️' },
      { id: 'emp', name: 'EMP Blast', cost: 700, cooldown: 1200, radius: 200, desc: 'Stun nearby asteroids', icon: '⚡' },
      { id: 'repair', name: 'Emergency Repair', cost: 600, cooldown: 1500, heal: 50, desc: 'Restore 50 HP', icon: '🔧' },
      { id: 'magnet_burst', name: 'Energy Surge', cost: 800, cooldown: 900, duration: 300, desc: '5x magnet range', icon: '🧲' },
      { id: 'missile', name: 'Homing Missile', cost: 1000, cooldown: 600, damage: 80, desc: 'Auto-aim missile', icon: '🎯' }
    ];
    
    // Player (Rocket)
    this.initRocket();
    
    // Center sun position - must be set BEFORE initPlanets
    this.sunX = this.worldSize / 2;
    this.sunY = this.worldSize / 2;
    
    // Planets
    this.planets = [];
    this.initPlanets();
    
    // Game entities
    this.stars = [];
    this.particles = [];
    this.energyDots = [];
    this.asteroids = [];
    this.projectiles = [];
    this.explosions = [];
    this.powerUps = [];
    this.missiles = [];
    
    this.initStars();
    this.spawnEnergyDots(200);
    
    // Quests/Missions
    this.missions = [];
    this.activeMission = null;
    this.initMissions();
    
    // Wave system
    this.wave = 0;
    this.waveTimer = 0;
    this.waveDelay = 600; // 10 seconds between waves
    this.asteroidsDestroyed = 0;
    this.planetsDefended = 0;
    
    // Input
    this.keys = {};
    this.mouse = { x: 0, y: 0 };
    this.setupInput();
    
    // UI
    this.showUpgradeMenu = false;
    this.showMissionLog = false;
    this.showShipMenu = false;
    this.notification = null;
    this.notificationTimer = 0;
    this.notificationQueue = [];
    
    // Visited planets
    this.visitedPlanets = new Set(this.savedData.visitedPlanets || []);
    this.nearPlanet = null;
    
    // Start rocket at a safe distance from sun
    this.rocket.x = this.sunX + 400;
    this.rocket.y = this.sunY;
    
    // Gravity constant
    this.G = 50;
    
    // Ability state
    this.abilityCooldown = 0;
    this.abilityActive = false;
    this.abilityDuration = 0;
  }
  
  loadProgress() {
    const saved = localStorage.getItem('spaceDefenderSave');
    if (saved) {
      this.savedData = JSON.parse(saved);
      // Ensure new fields exist for backwards compatibility
      if (!this.savedData.unlockedHulls) this.savedData.unlockedHulls = ['starter'];
      if (!this.savedData.unlockedWeapons) this.savedData.unlockedWeapons = ['laser'];
      if (!this.savedData.unlockedAbilities) this.savedData.unlockedAbilities = ['none'];
      if (!this.savedData.currentHull) this.savedData.currentHull = 'starter';
      if (!this.savedData.currentWeapon) this.savedData.currentWeapon = 'laser';
      if (!this.savedData.currentAbility) this.savedData.currentAbility = 'none';
      if (!this.savedData.upgrades) this.savedData.upgrades = {};
      if (typeof this.savedData.upgrades.homingBullets !== 'number' && typeof this.savedData.upgrades.autoAim === 'number') {
        this.savedData.upgrades.homingBullets = this.savedData.upgrades.autoAim;
      }
      const upgradeDefaults = {
        thrust: 0,
        maxSpeed: 0,
        turnSpeed: 0,
        weaponPower: 0,
        weaponSpeed: 0,
        shield: 0,
        fuel: 0,
        energyMagnet: 0,
        homingBullets: 0
      };
      Object.keys(upgradeDefaults).forEach((key) => {
        if (typeof this.savedData.upgrades[key] !== 'number') {
          this.savedData.upgrades[key] = upgradeDefaults[key];
        }
      });
    } else {
      this.savedData = {
        level: 1,
        xp: 0,
        credits: 0,
        totalCredits: 0,
        highScore: 0,
        upgrades: {
          thrust: 0,
          maxSpeed: 0,
          turnSpeed: 0,
          weaponPower: 0,
          weaponSpeed: 0,
          shield: 0,
          fuel: 0,
          energyMagnet: 0,
          homingBullets: 0
        },
        achievements: [],
        visitedPlanets: [],
        totalAsteroidsDestroyed: 0,
        totalEnergyCollected: 0,
        gamesPlayed: 0,
        tutorialSeen: false,
        unlockedHulls: ['starter'],
        unlockedWeapons: ['laser'],
        unlockedAbilities: ['none'],
        currentHull: 'starter',
        currentWeapon: 'laser',
        currentAbility: 'none'
      };
    }
    this.savedData.gamesPlayed++;
  }
  
  saveProgress() {
    this.savedData.level = this.level;
    this.savedData.xp = this.xp;
    this.savedData.credits = this.credits;
    this.savedData.visitedPlanets = Array.from(this.visitedPlanets);
    localStorage.setItem('spaceDefenderSave', JSON.stringify(this.savedData));
  }
  
  getCurrentHull() {
    return this.shipHulls.find(h => h.id === this.savedData.currentHull) || this.shipHulls[0];
  }
  
  getCurrentWeapon() {
    return this.weapons.find(w => w.id === this.savedData.currentWeapon) || this.weapons[0];
  }
  
  getCurrentAbility() {
    return this.abilities.find(a => a.id === this.savedData.currentAbility) || this.abilities[0];
  }
  
  initRocket() {
    const u = this.savedData.upgrades;
    const hull = this.getCurrentHull();
    
    const baseMaxSpeed = 6 + u.maxSpeed * 0.8;
    const baseAccel = 0.12 + u.thrust * 0.02;
    const baseHealth = 100;
    
    this.rocket = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      angle: -Math.PI / 2,
      thrust: 0,
      baseSpeed: 6,
      maxSpeed: baseMaxSpeed * hull.speedMod,
      baseAcceleration: 0.12,
      acceleration: baseAccel * hull.speedMod,
      baseTurnSpeed: 0.04,
      turnSpeed: 0.04 + u.turnSpeed * 0.008,
      friction: 0.995,
      size: 22,
      fuel: 100 + u.fuel * 20,
      maxFuel: 100 + u.fuel * 20,
      fuelConsumption: 0.08,
      health: baseHealth * hull.healthMod,
      maxHealth: baseHealth * hull.healthMod,
      shield: u.shield * 15,
      maxShield: u.shield * 15,
      shieldRegen: 0.02 + u.shield * 0.01,
      weaponPower: (10 + u.weaponPower * 5) * hull.damageMod,
      weaponSpeed: 12 + u.weaponSpeed * 2,
      fireRate: 8,
      fireCooldown: 0,
      magnetRange: 50 + u.energyMagnet * 30,
      homingLevel: u.homingBullets || 0,
      invincible: 0
    };
    
    // XP and level system
    this.xp = this.savedData.xp;
    this.level = this.savedData.level;
    this.xpToNextLevel = this.calculateXPRequired(this.level);
    
    // Credits (for upgrades)
    this.credits = this.savedData.credits;
    
    // Stats tracking
    this.energyCollected = 0;
  }
  
  calculateXPRequired(level) {
    return Math.floor(100 * Math.pow(1.4, level - 1));
  }
  
  initPlanets() {
    const planetData = [
      { name: 'Mercury', color: '#b5b5b5', size: 18, distance: 200, speed: 0.003, health: 50, facts: ['Closest to the Sun', 'No atmosphere', 'Extreme temperatures'] },
      { name: 'Venus', color: '#e8c07a', size: 26, distance: 320, speed: 0.0025, health: 70, facts: ['Hottest planet', 'Rotates backwards', 'Volcanic surface'] },
      { name: 'Earth', color: '#6b93d6', size: 28, distance: 450, speed: 0.002, health: 100, facts: ['Our home!', '71% covered in water', 'Only planet with life'] },
      { name: 'Mars', color: '#c1440e', size: 22, distance: 580, speed: 0.0015, health: 60, facts: ['The Red Planet', 'Has the largest volcano', 'Future human colony?'] },
      { name: 'Jupiter', color: '#d8ca9d', size: 60, distance: 780, speed: 0.001, health: 200, facts: ['Largest planet', 'Has 95 moons!', 'Great Red Spot storm'], mass: 3 },
      { name: 'Saturn', color: '#f4d59e', size: 52, distance: 950, speed: 0.0008, health: 180, hasRings: true, facts: ['Famous rings', 'Less dense than water', '82 moons'], mass: 2.5 },
      { name: 'Uranus', color: '#d1e7e7', size: 38, distance: 1100, speed: 0.0005, health: 120, facts: ['Tilted 98 degrees!', 'Ice giant', 'Coldest atmosphere'] },
      { name: 'Neptune', color: '#5b5ddf', size: 36, distance: 1250, speed: 0.0004, health: 110, facts: ['Windiest planet', 'Dark blue color', 'Takes 165 years to orbit'] }
    ];
    
    planetData.forEach((data, i) => {
      const angle = (Math.PI * 2 / planetData.length) * i + Math.random();
      this.planets.push({
        ...data,
        angle: angle,
        x: this.sunX + Math.cos(angle) * data.distance,
        y: this.sunY + Math.sin(angle) * data.distance,
        currentHealth: data.health,
        mass: data.mass || 1,
        glowPulse: Math.random() * Math.PI * 2
      });
    });
  }
  
  initStars() {
    for (let i = 0; i < 500; i++) {
      this.stars.push({
        x: Math.random() * this.worldSize,
        y: Math.random() * this.worldSize,
        size: Math.random() * 2 + 0.5,
        brightness: Math.random() * 0.5 + 0.5,
        twinkle: Math.random() * Math.PI * 2,
        layer: Math.random() < 0.3 ? 0 : Math.random() < 0.6 ? 1 : 2 // Parallax layers
      });
    }
  }
  
  spawnEnergyDots(count) {
    for (let i = 0; i < count; i++) {
      this.spawnSingleEnergyDot();
    }
  }
  
  spawnSingleEnergyDot() {
    // Spawn in a ring around the sun (not too close, not too far)
    const angle = Math.random() * Math.PI * 2;
    const distance = 250 + Math.random() * 1100;
    const x = this.sunX + Math.cos(angle) * distance;
    const y = this.sunY + Math.sin(angle) * distance;
    
    // Different dot types
    const types = [
      { color: '#4ade80', value: 1, size: 4 },      // Common green
      { color: '#60a5fa', value: 2, size: 5 },      // Uncommon blue
      { color: '#f472b6', value: 5, size: 6 },      // Rare pink
      { color: '#fbbf24', value: 10, size: 8 }      // Epic gold
    ];
    
    const rand = Math.random();
    const type = rand < 0.6 ? types[0] : rand < 0.85 ? types[1] : rand < 0.97 ? types[2] : types[3];
    
    this.energyDots.push({
      x, y,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      ...type,
      pulse: Math.random() * Math.PI * 2,
      lifetime: 1200 + Math.random() * 600 // 20-30 seconds
    });
  }
  
  initMissions() {
    this.missions = [
      { id: 'visit_earth', name: 'Home Planet', desc: 'Visit Earth', type: 'visit', target: 'Earth', reward: 50, completed: false },
      { id: 'visit_mars', name: 'Red Explorer', desc: 'Visit Mars', type: 'visit', target: 'Mars', reward: 75, completed: false },
      { id: 'destroy_10', name: 'Asteroid Hunter', desc: 'Destroy 10 asteroids', type: 'destroy', target: 10, progress: 0, reward: 100, completed: false },
      { id: 'destroy_50', name: 'Space Defender', desc: 'Destroy 50 asteroids', type: 'destroy', target: 50, progress: 0, reward: 300, completed: false },
      { id: 'collect_100', name: 'Energy Collector', desc: 'Collect 100 energy', type: 'collect', target: 100, progress: 0, reward: 150, completed: false },
      { id: 'defend_planet', name: 'Guardian', desc: 'Defend a planet from 5 asteroids', type: 'defend', target: 5, progress: 0, reward: 200, completed: false },
      { id: 'visit_all', name: 'Grand Tourist', desc: 'Visit all 8 planets', type: 'visit_all', target: 8, progress: 0, reward: 500, completed: false },
      { id: 'survive_wave', name: 'Wave Survivor', desc: 'Survive wave 5', type: 'wave', target: 5, reward: 250, completed: false },
      { id: 'survive_wave_10', name: 'Elite Defender', desc: 'Survive wave 10', type: 'wave', target: 10, reward: 600, completed: false },
      { id: 'max_speed', name: 'Speed Demon', desc: 'Reach maximum velocity', type: 'speed', completed: false, reward: 50 }
    ];
    
    // Set active mission to first incomplete
    this.activeMission = this.missions.find(m => !m.completed);
  }
  
  setupInput() {
    window.addEventListener('keydown', (e) => {
      // Don't process input during tutorial (except to advance it)
      if (this.showTutorial) {
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
          this.tutorialPage++;
          if (this.tutorialPage >= 4) {
            this.showTutorial = false;
            this.savedData.tutorialSeen = true;
            this.saveProgress();
          }
        } else if (e.key === 'ArrowLeft' && this.tutorialPage > 0) {
          this.tutorialPage--;
        } else if (e.key === 'Escape') {
          this.showTutorial = false;
          this.savedData.tutorialSeen = true;
          this.saveProgress();
        }
        return;
      }
      
      // Don't process input during game over
      if (this.gameOver_) return;
      
      this.keys[e.key.toLowerCase()] = true;
      
      // Menus
      if (e.key === 'u' || e.key === 'U') {
        this.showUpgradeMenu = !this.showUpgradeMenu;
        this.showMissionLog = false;
        this.showShipMenu = false;
      }
      if (e.key === 'm' || e.key === 'M') {
        this.showMissionLog = !this.showMissionLog;
        this.showUpgradeMenu = false;
        this.showShipMenu = false;
      }
      if (e.key === 'h' || e.key === 'H') {
        this.showShipMenu = !this.showShipMenu;
        this.showUpgradeMenu = false;
        this.showMissionLog = false;
      }
      if (e.key === 'Escape') {
        if (this.showUpgradeMenu || this.showMissionLog || this.showShipMenu) {
          this.showUpgradeMenu = false;
          this.showMissionLog = false;
          this.showShipMenu = false;
        }
      }
      
      // Ability key
      if (e.key === 'e' || e.key === 'E') {
        this.useAbility();
      }
      
      // Tutorial toggle
      if (e.key === '?') {
        this.showTutorial = true;
        this.tutorialPage = 0;
      }
      
      // Upgrade hotkeys
      if (this.showUpgradeMenu && e.key >= '1' && e.key <= '9') {
        this.purchaseUpgrade(parseInt(e.key) - 1);
      }
      
      // Ship menu hotkeys
      if (this.showShipMenu) {
        if (e.key >= '1' && e.key <= '6') {
          this.selectHull(parseInt(e.key) - 1);
        }
        if (e.key === 'q') this.cycleWeapon(-1);
        if (e.key === 'w') this.cycleWeapon(1);
        if (e.key === 'a') this.cycleAbility(-1);
        if (e.key === 's') this.cycleAbility(1);
      }
    });
    
    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
    
    this.canvas.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    
    // Mouse click for ship menu purchases
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = rect.width > 0 ? this.canvas.width / rect.width : 1;
      const scaleY = rect.height > 0 ? this.canvas.height / rect.height : 1;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      if (this.showUpgradeMenu) {
        this.handleUpgradeMenuClick(clickX, clickY);
        return;
      }

      if (this.showShipMenu) {
        this.handleShipMenuClick(clickX, clickY);
      }
    });
  }
  
  // Ship/weapon/ability management
  selectHull(index) {
    const hull = this.shipHulls[index];
    if (!hull) return;
    
    if (this.savedData.unlockedHulls.includes(hull.id)) {
      this.savedData.currentHull = hull.id;
      this.initRocket();
      this.rocket.x = this.sunX + 400;
      this.rocket.y = this.sunY;
      this.queueNotification(`🚀 ${hull.name} equipped!`, 'success');
      this.saveProgress();
    } else if (this.credits >= hull.cost) {
      this.credits -= hull.cost;
      this.savedData.credits = this.credits;
      this.savedData.unlockedHulls.push(hull.id);
      this.savedData.currentHull = hull.id;
      this.initRocket();
      this.rocket.x = this.sunX + 400;
      this.rocket.y = this.sunY;
      this.queueNotification(`🎉 ${hull.name} unlocked!`, 'achievement');
      this.saveProgress();
    } else {
      this.queueNotification(`💰 Need ${hull.cost} credits!`, 'warning');
    }
  }
  
  cycleWeapon(dir) {
    const unlocked = this.weapons.filter(w => this.savedData.unlockedWeapons.includes(w.id));
    const currentIdx = unlocked.findIndex(w => w.id === this.savedData.currentWeapon);
    const newIdx = (currentIdx + dir + unlocked.length) % unlocked.length;
    this.savedData.currentWeapon = unlocked[newIdx].id;
    this.queueNotification(`${this.getCurrentWeapon().icon} ${this.getCurrentWeapon().name}`, 'success');
    this.saveProgress();
  }
  
  cycleAbility(dir) {
    const unlocked = this.abilities.filter(a => this.savedData.unlockedAbilities.includes(a.id));
    const currentIdx = unlocked.findIndex(a => a.id === this.savedData.currentAbility);
    const newIdx = (currentIdx + dir + unlocked.length) % unlocked.length;
    this.savedData.currentAbility = unlocked[newIdx].id;
    this.queueNotification(`${this.getCurrentAbility().icon} ${this.getCurrentAbility().name}`, 'success');
    this.saveProgress();
  }

  buildGridRects(count, cols, startX, startY, cardW, cardH, gapX, gapY) {
    const rects = [];
    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      rects.push({
        index: i,
        x: startX + col * (cardW + gapX),
        y: startY + row * (cardH + gapY),
        w: cardW,
        h: cardH
      });
    }
    return rects;
  }

  getHangarLayout() {
    const w = Math.min(760, this.width - 24);
    const h = Math.min(670, this.height - 24);
    const x = this.width / 2 - w / 2;
    const y = this.height / 2 - h / 2;
    const compact = w < 560;
    const veryCompact = h < 580;

    const contentX = x + 20;
    const contentW = w - 40;
    const gapX = compact ? 8 : 10;
    const gapY = compact ? 6 : 10;
    const sectionSpacing = veryCompact ? 8 : (compact ? 10 : 16);

    const hullCols = 3;
    const weaponCols = 3;
    const abilityCols = 4;

    const hullCardH = veryCompact ? 52 : (compact ? 62 : 70);
    const weaponCardH = veryCompact ? 48 : (compact ? 58 : 64);
    const abilityCardH = veryCompact ? 46 : (compact ? 54 : 60);

    const hullCardW = (contentW - gapX * (hullCols - 1)) / hullCols;
    const weaponCardW = (contentW - gapX * (weaponCols - 1)) / weaponCols;
    const abilityCardW = (contentW - gapX * (abilityCols - 1)) / abilityCols;

    const hullGridY = y + (veryCompact ? 84 : 96);
    const hullCards = this.buildGridRects(
      this.shipHulls.length,
      hullCols,
      contentX,
      hullGridY,
      hullCardW,
      hullCardH,
      gapX,
      gapY
    );
    const hullBottom = Math.max(...hullCards.map((card) => card.y + card.h));

    const weaponGridY = hullBottom + sectionSpacing + 16;
    const weaponCards = this.buildGridRects(
      this.weapons.length,
      weaponCols,
      contentX,
      weaponGridY,
      weaponCardW,
      weaponCardH,
      gapX,
      gapY
    );
    const weaponBottom = Math.max(...weaponCards.map((card) => card.y + card.h));

    const abilityGridY = weaponBottom + sectionSpacing + 16;
    const abilityCards = this.buildGridRects(
      this.abilities.length,
      abilityCols,
      contentX,
      abilityGridY,
      abilityCardW,
      abilityCardH,
      gapX,
      gapY
    );

    return {
      x, y, w, h,
      compact,
      veryCompact,
      titles: {
        hulls: hullGridY - 14,
        weapons: weaponGridY - 14,
        abilities: abilityGridY - 14
      },
      hullCards,
      weaponCards,
      abilityCards
    };
  }

  pointInRect(px, py, rect) {
    return px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h;
  }

  fitText(text, maxWidth) {
    if (this.ctx.measureText(text).width <= maxWidth) return text;
    let clipped = text;
    while (clipped.length > 0 && this.ctx.measureText(`${clipped}…`).width > maxWidth) {
      clipped = clipped.slice(0, -1);
    }
    return `${clipped}…`;
  }
  
  handleShipMenuClick(mx, my) {
    const layout = this.getHangarLayout();
    if (!this.pointInRect(mx, my, { x: layout.x, y: layout.y, w: layout.w, h: layout.h })) {
      return;
    }

    for (const card of layout.hullCards) {
      if (this.pointInRect(mx, my, card)) {
        this.selectHull(card.index);
        return;
      }
    }

    for (const card of layout.weaponCards) {
      if (this.pointInRect(mx, my, card)) {
        this.purchaseWeapon(this.weapons[card.index]);
        return;
      }
    }

    for (const card of layout.abilityCards) {
      if (this.pointInRect(mx, my, card)) {
        this.purchaseAbility(this.abilities[card.index]);
        return;
      }
    }
  }

  handleUpgradeMenuClick(mx, my) {
    const w = 500;
    const h = 455;
    const x = this.width / 2 - w / 2;
    const y = this.height / 2 - h / 2;
    const rowTop = y + 74;
    const rowHeight = 36;
    const rowBottom = y + h - 30;

    if (mx < x + 15 || mx > x + w - 15 || my < rowTop || my > rowBottom) {
      return;
    }

    const index = Math.floor((my - rowTop) / rowHeight);
    if (index >= 0 && index <= 8) {
      this.purchaseUpgrade(index);
    }
  }
  
  purchaseWeapon(weapon) {
    if (this.savedData.unlockedWeapons.includes(weapon.id)) {
      this.savedData.currentWeapon = weapon.id;
      this.queueNotification(`${weapon.icon} ${weapon.name} equipped!`, 'success');
    } else if (this.credits >= weapon.cost) {
      this.credits -= weapon.cost;
      this.savedData.credits = this.credits;
      this.savedData.unlockedWeapons.push(weapon.id);
      this.savedData.currentWeapon = weapon.id;
      this.queueNotification(`🎉 ${weapon.name} unlocked!`, 'achievement');
    } else {
      this.queueNotification(`💰 Need ${weapon.cost} credits!`, 'warning');
    }
    this.saveProgress();
  }
  
  purchaseAbility(ability) {
    if (this.savedData.unlockedAbilities.includes(ability.id)) {
      this.savedData.currentAbility = ability.id;
      this.queueNotification(`${ability.icon} ${ability.name} equipped!`, 'success');
    } else if (this.credits >= ability.cost) {
      this.credits -= ability.cost;
      this.savedData.credits = this.credits;
      this.savedData.unlockedAbilities.push(ability.id);
      this.savedData.currentAbility = ability.id;
      this.queueNotification(`🎉 ${ability.name} unlocked!`, 'achievement');
    } else {
      this.queueNotification(`💰 Need ${ability.cost} credits!`, 'warning');
    }
    this.saveProgress();
  }
  
  useAbility() {
    if (this.abilityCooldown > 0) return;
    
    const ability = this.getCurrentAbility();
    if (ability.id === 'none') return;
    
    this.abilityCooldown = ability.cooldown;
    
    switch (ability.id) {
      case 'boost':
        this.abilityActive = true;
        this.abilityDuration = ability.duration;
        this.rocket.maxSpeed *= 3;
        this.rocket.acceleration *= 2;
        this.queueNotification('🚀 TURBO BOOST!', 'success');
        break;
        
      case 'shield_burst':
        this.abilityActive = true;
        this.abilityDuration = ability.duration;
        this.rocket.invincible = ability.duration;
        this.queueNotification('🛡️ SHIELD ACTIVATED!', 'success');
        break;
        
      case 'emp':
        // Stun all nearby asteroids
        this.asteroids.forEach(a => {
          const dx = a.x - this.rocket.x;
          const dy = a.y - this.rocket.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < ability.radius) {
            a.vx *= 0.1;
            a.vy *= 0.1;
            a.stunned = 180; // 3 seconds
          }
        });
        this.addExplosion(this.rocket.x, this.rocket.y, ability.radius, '#60a5fa');
        this.queueNotification('⚡ EMP BLAST!', 'success');
        break;
        
      case 'repair':
        this.rocket.health = Math.min(this.rocket.maxHealth, this.rocket.health + ability.heal);
        this.queueNotification('🔧 REPAIRED +50 HP!', 'success');
        break;
        
      case 'magnet_burst':
        this.abilityActive = true;
        this.abilityDuration = ability.duration;
        this.rocket.magnetRange *= 5;
        this.queueNotification('🧲 ENERGY SURGE!', 'success');
        break;
        
      case 'missile':
        this.fireHomingMissile();
        this.queueNotification('🎯 MISSILE LAUNCHED!', 'success');
        break;
    }
  }
  
  fireHomingMissile() {
    // Find nearest asteroid
    let nearest = null;
    let nearestDist = Infinity;
    this.asteroids.forEach(a => {
      const dx = a.x - this.rocket.x;
      const dy = a.y - this.rocket.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = a;
      }
    });
    
    if (nearest) {
      this.missiles.push({
        x: this.rocket.x,
        y: this.rocket.y,
        target: nearest,
        speed: 8,
        damage: this.getCurrentAbility().damage || 80,
        size: 8,
        trail: []
      });
    }
  }
  
  update(deltaTime) {
    // Don't update during tutorial, menus, or game over
    if (this.showTutorial || this.gameOver_) return;
    if (this.paused || this.showUpgradeMenu || this.showShipMenu) return;
    
    this.gameTime += 1;
    
    // Update screen shake
    if (this.screenShake > 0) {
      this.screenShake -= 0.05;
    }
    
    // Update ability cooldown and duration
    if (this.abilityCooldown > 0) this.abilityCooldown--;
    if (this.abilityDuration > 0) {
      this.abilityDuration--;
      if (this.abilityDuration === 0 && this.abilityActive) {
        this.endAbility();
      }
    }
    
    // Wave system
    this.updateWaves();
    
    // Update entities
    this.updateRocket();
    this.updatePlanets();
    this.updateAsteroids();
    this.updateProjectiles();
    this.updateMissiles();
    this.updateEnergyDots();
    this.updateParticles();
    this.updateExplosions();
    this.updatePowerUps();
    
    // Check collisions
    this.checkCollisions();
    
    // Update camera
    this.updateCamera();
    
    // Spawn new energy dots periodically
    if (this.gameTime % 60 === 0 && this.energyDots.length < 300) {
      this.spawnSingleEnergyDot();
    }
    
    // Update notifications
    this.updateNotifications();
    
    // Auto-save every 30 seconds
    if (this.gameTime % 1800 === 0) {
      this.saveProgress();
    }
  }
  
  updateWaves() {
    this.waveTimer++;
    
    if (this.waveTimer >= this.waveDelay) {
      this.waveTimer = 0;
      this.wave++;
      this.spawnAsteroidWave();
      this.queueNotification(`⚠️ Wave ${this.wave} incoming!`, 'warning');
      
      // Check wave missions
      this.checkMissionProgress('wave', this.wave);
    }
  }
  
  spawnAsteroidWave() {
    const count = 3 + this.wave * 2;
    const hasBoss = this.wave % 5 === 0;
    
    for (let i = 0; i < count; i++) {
      this.spawnAsteroid(false);
    }
    
    if (hasBoss) {
      this.spawnAsteroid(true);
      this.queueNotification('💀 BOSS ASTEROID!', 'danger');
    }
    
    // Spawn power-up every 3 waves
    if (this.wave % 3 === 0) {
      this.spawnPowerUp();
    }
  }
  
  spawnAsteroid(isBoss = false) {
    // Spawn from edge, heading toward a random planet
    const targetPlanet = this.planets[Math.floor(Math.random() * this.planets.length)];
    
    const angle = Math.random() * Math.PI * 2;
    const distance = this.worldSize * 0.6;
    const x = this.sunX + Math.cos(angle) * distance;
    const y = this.sunY + Math.sin(angle) * distance;
    
    const dx = targetPlanet.x - x;
    const dy = targetPlanet.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const speed = (0.8 + Math.random() * 0.5) * (isBoss ? 0.6 : 1);
    
    const size = isBoss ? 50 + Math.random() * 20 : 15 + Math.random() * 25;
    
    this.asteroids.push({
      x, y,
      vx: (dx / dist) * speed,
      vy: (dy / dist) * speed,
      size,
      health: isBoss ? 100 + this.wave * 10 : 10 + this.wave * 2,
      maxHealth: isBoss ? 100 + this.wave * 10 : 10 + this.wave * 2,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05,
      targetPlanet,
      isBoss,
      color: isBoss ? '#ef4444' : '#8b7355',
      vertices: this.generateAsteroidVertices(size)
    });
  }
  
  generateAsteroidVertices(size) {
    const vertices = [];
    const points = 8 + Math.floor(Math.random() * 5);
    for (let i = 0; i < points; i++) {
      const angle = (Math.PI * 2 / points) * i;
      const radius = size * (0.7 + Math.random() * 0.4);
      vertices.push({ angle, radius });
    }
    return vertices;
  }
  
  spawnPowerUp() {
    const angle = Math.random() * Math.PI * 2;
    const distance = 300 + Math.random() * 800;
    
    const types = ['health', 'shield', 'fuel', 'rapid_fire', 'magnet'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const icons = { health: '❤️', shield: '🛡️', fuel: '⛽', rapid_fire: '🔥', magnet: '🧲' };
    
    this.powerUps.push({
      x: this.sunX + Math.cos(angle) * distance,
      y: this.sunY + Math.sin(angle) * distance,
      type,
      icon: icons[type],
      size: 20,
      pulse: 0,
      lifetime: 900 // 15 seconds
    });
  }
  
  updateRocket() {
    const r = this.rocket;
    
    // Rotation
    if (this.keys['a'] || this.keys['arrowleft']) {
      r.angle -= r.turnSpeed;
    }
    if (this.keys['d'] || this.keys['arrowright']) {
      r.angle += r.turnSpeed;
    }
    
    // Thrust
    if ((this.keys['w'] || this.keys['arrowup']) && r.fuel > 0) {
      r.vx += Math.cos(r.angle) * r.acceleration;
      r.vy += Math.sin(r.angle) * r.acceleration;
      r.thrust = 1;
      r.fuel = Math.max(0, r.fuel - r.fuelConsumption);
      this.addThrustParticles();
    } else {
      r.thrust *= 0.9;
    }
    
    // Reverse thrust
    if ((this.keys['s'] || this.keys['arrowdown']) && r.fuel > 0) {
      r.vx -= Math.cos(r.angle) * r.acceleration * 0.5;
      r.vy -= Math.sin(r.angle) * r.acceleration * 0.5;
      r.fuel = Math.max(0, r.fuel - r.fuelConsumption * 0.5);
    }

    if (r.fuel <= 0) {
      r.fuel = 0;
      this.gameOver('Out of fuel');
      return;
    }
    
    // GRAVITY - Sun pulls everything toward it
    const sunDx = this.sunX - r.x;
    const sunDy = this.sunY - r.y;
    const sunDist = Math.sqrt(sunDx * sunDx + sunDy * sunDy);
    
    if (sunDist > 80) { // Don't apply gravity too close to sun
      const sunGravity = this.G / (sunDist * 0.8);
      r.vx += (sunDx / sunDist) * sunGravity * 0.015;
      r.vy += (sunDy / sunDist) * sunGravity * 0.015;
    }
    
    // Planet gravity (weaker)
    this.planets.forEach(planet => {
      const dx = planet.x - r.x;
      const dy = planet.y - r.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > planet.size + 20 && dist < 200) {
        const gravity = (this.G * planet.mass * 0.3) / (dist * dist);
        r.vx += (dx / dist) * gravity;
        r.vy += (dy / dist) * gravity;
      }
    });
    
    // Apply friction
    r.vx *= r.friction;
    r.vy *= r.friction;
    
    // Limit speed and check achievement
    const speed = Math.sqrt(r.vx * r.vx + r.vy * r.vy);
    if (speed > r.maxSpeed) {
      r.vx = (r.vx / speed) * r.maxSpeed;
      r.vy = (r.vy / speed) * r.maxSpeed;
      this.checkMissionProgress('speed', true);
    }
    
    // Update position
    r.x += r.vx;
    r.y += r.vy;
    
    // Keep in world bounds
    r.x = Math.max(50, Math.min(this.worldSize - 50, r.x));
    r.y = Math.max(50, Math.min(this.worldSize - 50, r.y));
    
    // Sun damage
    if (sunDist < 70) {
      r.health -= 0.5;
      this.addExplosion(r.x, r.y, 5, '#ff6600');
    }
    
    // Fire weapon
    r.fireCooldown = Math.max(0, r.fireCooldown - 1);
    if (this.keys[' '] && r.fireCooldown === 0) {
      this.fireWeapon();
      r.fireCooldown = r.fireRate;
    }
    
    // Shield regen
    if (r.shield < r.maxShield) {
      r.shield = Math.min(r.maxShield, r.shield + r.shieldRegen);
    }
    
    // Invincibility frames
    if (r.invincible > 0) r.invincible--;
    
    // Slow fuel regen near sun (solar power!)
    if (sunDist < 300 && r.fuel < r.maxFuel) {
      r.fuel = Math.min(r.maxFuel, r.fuel + 0.02);
    }
    
    // Check if dead
    if (r.health <= 0) {
      this.gameOver('Hull integrity critical');
    }
  }
  
  fireWeapon() {
    const r = this.rocket;
    const weapon = this.getCurrentWeapon();
    
    // Calculate fire rate based on weapon
    r.fireCooldown = Math.floor(r.fireRate / weapon.rate);
    
    // Calculate spread and number of shots
    const shots = weapon.shots || 1;
    const spreadAngle = (weapon.spread || 0) * Math.PI / 180;
    
    for (let i = 0; i < shots; i++) {
      let angle = r.angle;
      const homingTarget = this.getHomingTarget();
      if (homingTarget && shots === 1) {
        const targetAngle = Math.atan2(homingTarget.y - r.y, homingTarget.x - r.x);
        const blend = Math.min(1, 0.08 + 0.05 * r.homingLevel);
        angle = this.interpolateAngle(r.angle, targetAngle, blend);
      }
      if (shots > 1) {
        // Spread shots evenly
        angle += spreadAngle * (i - (shots - 1) / 2);
      } else if (weapon.spread > 0) {
        // Random spread for single shot
        angle += (Math.random() - 0.5) * spreadAngle;
      }
      
      const speed = r.weaponSpeed * weapon.speed;
      const damage = r.weaponPower * weapon.damage;
      const hasHoming = r.homingLevel > 0 && weapon.id !== 'beam';
      
      this.projectiles.push({
        x: r.x + Math.cos(angle) * 25,
        y: r.y + Math.sin(angle) * 25,
        vx: Math.cos(angle) * speed + r.vx * 0.3,
        vy: Math.sin(angle) * speed + r.vy * 0.3,
        damage: damage,
        size: weapon.id === 'cannon' ? 6 : weapon.id === 'beam' ? 2 : 4,
        lifetime: weapon.id === 'beam' ? 30 : 120,
        color: weapon.color,
        homingStrength: hasHoming ? Math.min(1, 0.1 + r.homingLevel * 0.06) : 0,
        homingRange: hasHoming ? (240 + r.homingLevel * 85) : 0,
        homingMaxTurn: hasHoming ? ((2 + r.homingLevel * 1.4) * Math.PI / 180) : 0
      });
    }
    
    // Muzzle flash
    this.addExplosion(
      r.x + Math.cos(r.angle) * 25,
      r.y + Math.sin(r.angle) * 25,
      weapon.id === 'cannon' ? 15 : 8, weapon.color
    );
  }

  getHomingTarget(fromX = this.rocket.x, fromY = this.rocket.y, headingAngle = this.rocket.angle, range = null) {
    if (!this.rocket.homingLevel || this.rocket.homingLevel <= 0 || this.asteroids.length === 0) {
      return null;
    }

    const maxRange = range ?? (260 + this.rocket.homingLevel * 90);
    const maxAngle = (10 + this.rocket.homingLevel * 6) * Math.PI / 180;
    let best = null;
    let bestScore = Infinity;

    this.asteroids.forEach((asteroid) => {
      const dx = asteroid.x - fromX;
      const dy = asteroid.y - fromY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > maxRange) return;

      const targetAngle = Math.atan2(dy, dx);
      const diff = Math.abs(this.normalizeAngle(targetAngle - headingAngle));
      if (diff > maxAngle) return;

      const score = dist + diff * 200;
      if (score < bestScore) {
        bestScore = score;
        best = asteroid;
      }
    });

    return best;
  }

  normalizeAngle(angle) {
    let normalized = angle;
    while (normalized > Math.PI) normalized -= Math.PI * 2;
    while (normalized < -Math.PI) normalized += Math.PI * 2;
    return normalized;
  }

  interpolateAngle(from, to, factor) {
    return from + this.normalizeAngle(to - from) * factor;
  }
  
  endAbility() {
    this.abilityActive = false;
    const ability = this.getCurrentAbility();
    
    // Reset any modified stats
    if (ability.id === 'boost') {
      this.initRocket();
      // Restore position
      const oldX = this.rocket.x;
      const oldY = this.rocket.y;
      this.rocket.x = oldX || this.sunX + 400;
      this.rocket.y = oldY || this.sunY;
    } else if (ability.id === 'magnet_burst') {
      this.initRocket();
      const oldX = this.rocket.x;
      const oldY = this.rocket.y;
      this.rocket.x = oldX || this.sunX + 400;
      this.rocket.y = oldY || this.sunY;
    }
  }
  
  updateMissiles() {
    this.missiles = this.missiles.filter(m => {
      // Track trail
      m.trail.push({ x: m.x, y: m.y });
      if (m.trail.length > 15) m.trail.shift();
      
      // Home toward target
      if (m.target && this.asteroids.includes(m.target)) {
        const dx = m.target.x - m.x;
        const dy = m.target.y - m.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
          m.x += (dx / dist) * m.speed;
          m.y += (dy / dist) * m.speed;
        }
        
        // Hit detection
        if (dist < m.target.size + m.size) {
          m.target.health -= m.damage;
          this.addExplosion(m.x, m.y, 40, '#fbbf24');
          this.screenShake = 1;
          this.screenShakeIntensity = 8;
          
          if (m.target.health <= 0) {
            this.destroyAsteroid(m.target);
          }
          return false;
        }
      } else {
        // Target lost, just fly forward
        return false;
      }
      
      return true;
    });
  }
  
  addThrustParticles() {
    const r = this.rocket;
    for (let i = 0; i < 2; i++) {
      const angle = r.angle + Math.PI + (Math.random() - 0.5) * 0.5;
      this.particles.push({
        x: r.x - Math.cos(r.angle) * 18,
        y: r.y - Math.sin(r.angle) * 18,
        vx: Math.cos(angle) * (2 + Math.random() * 2),
        vy: Math.sin(angle) * (2 + Math.random() * 2),
        life: 1,
        decay: 0.03 + Math.random() * 0.02,
        size: 4 + Math.random() * 4,
        color: Math.random() > 0.5 ? '#ff6b35' : '#ffd700'
      });
    }
  }
  
  updatePlanets() {
    this.planets.forEach(planet => {
      // Orbit
      planet.angle += planet.speed;
      planet.x = this.sunX + Math.cos(planet.angle) * planet.distance;
      planet.y = this.sunY + Math.sin(planet.angle) * planet.distance;
      planet.glowPulse += 0.02;
      
      // Regenerate health slowly
      if (planet.currentHealth < planet.health) {
        planet.currentHealth = Math.min(planet.health, planet.currentHealth + 0.01);
      }
    });
  }
  
  updateAsteroids() {
    this.asteroids = this.asteroids.filter(asteroid => {
      asteroid.x += asteroid.vx;
      asteroid.y += asteroid.vy;
      asteroid.rotation += asteroid.rotationSpeed;
      
      // Sun gravity affects asteroids too
      const sunDx = this.sunX - asteroid.x;
      const sunDy = this.sunY - asteroid.y;
      const sunDist = Math.sqrt(sunDx * sunDx + sunDy * sunDy);
      if (sunDist > 80) {
        const sunGravity = this.G / (sunDist * 1.5);
        asteroid.vx += (sunDx / sunDist) * sunGravity * 0.005;
        asteroid.vy += (sunDy / sunDist) * sunGravity * 0.005;
      } else {
        // Destroyed by sun
        this.addExplosion(asteroid.x, asteroid.y, asteroid.size, '#ff6600');
        return false;
      }
      
      // Check planet collision
      for (const planet of this.planets) {
        const dx = planet.x - asteroid.x;
        const dy = planet.y - asteroid.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < planet.size + asteroid.size) {
          // Planet takes damage
          const damage = asteroid.isBoss ? 30 : 10;
          planet.currentHealth -= damage;
          
          this.addExplosion(asteroid.x, asteroid.y, asteroid.size * 1.5, '#ff4444');
          this.triggerScreenShake(asteroid.isBoss ? 15 : 8);
          
          if (planet.currentHealth <= 0) {
            this.queueNotification(`💥 ${planet.name} was destroyed!`, 'danger');
            planet.currentHealth = 0;
          }
          
          return false;
        }
      }
      
      // Remove if too far
      return asteroid.health > 0 && asteroid.x > -100 && asteroid.x < this.worldSize + 100 && 
             asteroid.y > -100 && asteroid.y < this.worldSize + 100;
    });
  }
  
  updateProjectiles() {
    this.projectiles = this.projectiles.filter(p => {
      if (p.homingStrength > 0) {
        const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy) || 1;
        const currentAngle = Math.atan2(p.vy, p.vx);
        const target = this.getHomingTarget(p.x, p.y, currentAngle, p.homingRange);
        if (target) {
          const desiredAngle = Math.atan2(target.y - p.y, target.x - p.x);
          const blendedAngle = this.interpolateAngle(currentAngle, desiredAngle, p.homingStrength);
          const delta = this.normalizeAngle(blendedAngle - currentAngle);
          const clampedDelta = Math.max(-p.homingMaxTurn, Math.min(p.homingMaxTurn, delta));
          const nextAngle = currentAngle + clampedDelta;
          p.vx = Math.cos(nextAngle) * currentSpeed;
          p.vy = Math.sin(nextAngle) * currentSpeed;
        }
      }

      p.x += p.vx;
      p.y += p.vy;
      p.lifetime--;
      
      // Check asteroid hits
      for (const asteroid of this.asteroids) {
        const dx = asteroid.x - p.x;
        const dy = asteroid.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < asteroid.size + p.size) {
          asteroid.health -= p.damage;
          this.addExplosion(p.x, p.y, 15, '#60a5fa');
          
          if (asteroid.health <= 0) {
            this.destroyAsteroid(asteroid);
          }
          
          return false;
        }
      }
      
      return p.lifetime > 0;
    });
  }
  
  destroyAsteroid(asteroid) {
    this.asteroidsDestroyed++;
    this.savedData.totalAsteroidsDestroyed++;
    
    // XP and credits
    const xp = asteroid.isBoss ? 50 : 10;
    const credits = asteroid.isBoss ? 25 : 5;
    this.addXP(xp);
    this.addCredits(credits);
    
    // Big explosion
    this.addExplosion(asteroid.x, asteroid.y, asteroid.size * 2, asteroid.isBoss ? '#ef4444' : '#fbbf24');
    this.triggerScreenShake(asteroid.isBoss ? 12 : 5);
    
    // Drop energy
    for (let i = 0; i < (asteroid.isBoss ? 10 : 3); i++) {
      this.energyDots.push({
        x: asteroid.x + (Math.random() - 0.5) * asteroid.size,
        y: asteroid.y + (Math.random() - 0.5) * asteroid.size,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        color: asteroid.isBoss ? '#fbbf24' : '#4ade80',
        value: asteroid.isBoss ? 5 : 1,
        size: asteroid.isBoss ? 7 : 4,
        pulse: 0,
        lifetime: 600
      });
    }
    
    // Check if defended a planet
    if (asteroid.targetPlanet && asteroid.targetPlanet.currentHealth > 0) {
      this.planetsDefended++;
      this.checkMissionProgress('defend', this.planetsDefended);
    }
    
    // Mission progress
    this.checkMissionProgress('destroy', this.asteroidsDestroyed);
    
    // Remove from array
    const idx = this.asteroids.indexOf(asteroid);
    if (idx > -1) this.asteroids.splice(idx, 1);
  }
  
  updateEnergyDots() {
    const r = this.rocket;
    
    this.energyDots = this.energyDots.filter(dot => {
      dot.pulse += 0.1;
      dot.lifetime--;
      
      // Apply slight drift
      dot.x += dot.vx;
      dot.y += dot.vy;
      dot.vx *= 0.98;
      dot.vy *= 0.98;
      
      // Magnet effect
      const dx = r.x - dot.x;
      const dy = r.y - dot.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < r.magnetRange) {
        const pull = 0.3 * (1 - dist / r.magnetRange);
        dot.vx += (dx / dist) * pull;
        dot.vy += (dy / dist) * pull;
      }
      
      // Collect
      if (dist < r.size + dot.size) {
        this.collectEnergy(dot.value);
        return false;
      }
      
      return dot.lifetime > 0;
    });
  }
  
  collectEnergy(value) {
    this.energyCollected += value;
    this.savedData.totalEnergyCollected += value;
    this.addXP(value);
    this.checkMissionProgress('collect', this.energyCollected);
  }
  
  updateParticles() {
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      p.size *= 0.96;
      return p.life > 0;
    });
  }
  
  updateExplosions() {
    this.explosions = this.explosions.filter(e => {
      e.radius += e.speed;
      e.alpha -= 0.04;
      return e.alpha > 0;
    });
  }
  
  updatePowerUps() {
    const r = this.rocket;
    
    this.powerUps = this.powerUps.filter(p => {
      p.pulse += 0.1;
      p.lifetime--;
      
      const dx = r.x - p.x;
      const dy = r.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < r.size + p.size) {
        this.applyPowerUp(p.type);
        return false;
      }
      
      return p.lifetime > 0;
    });
  }
  
  applyPowerUp(type) {
    const r = this.rocket;
    
    switch (type) {
      case 'health':
        r.health = Math.min(r.maxHealth, r.health + 30);
        this.queueNotification('❤️ +30 Health!', 'success');
        break;
      case 'shield':
        r.shield = r.maxShield;
        this.queueNotification('🛡️ Shield Restored!', 'success');
        break;
      case 'fuel':
        r.fuel = r.maxFuel;
        this.queueNotification('⛽ Fuel Tank Full!', 'success');
        break;
      case 'rapid_fire':
        r.fireRate = Math.max(2, r.fireRate - 3);
        setTimeout(() => { r.fireRate = 8; }, 10000);
        this.queueNotification('🔥 Rapid Fire! (10s)', 'success');
        break;
      case 'magnet':
        const oldRange = r.magnetRange;
        r.magnetRange *= 3;
        setTimeout(() => { r.magnetRange = oldRange; }, 15000);
        this.queueNotification('🧲 Super Magnet! (15s)', 'success');
        break;
    }
  }
  
  addExplosion(x, y, maxRadius, color) {
    this.explosions.push({
      x, y,
      radius: 5,
      maxRadius,
      speed: maxRadius / 15,
      color,
      alpha: 1
    });
    
    // Add particles
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i + Math.random() * 0.5;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * (2 + Math.random() * 3),
        vy: Math.sin(angle) * (2 + Math.random() * 3),
        life: 1,
        decay: 0.03,
        size: 3 + Math.random() * 4,
        color
      });
    }
  }
  
  triggerScreenShake(intensity) {
    this.screenShake = 1;
    this.screenShakeIntensity = intensity;
  }
  
  checkCollisions() {
    const r = this.rocket;
    
    // Planet proximity
    this.nearPlanet = null;
    for (const planet of this.planets) {
      const dx = r.x - planet.x;
      const dy = r.y - planet.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < planet.size + 50) {
        this.nearPlanet = planet;
        
        if (!this.visitedPlanets.has(planet.name)) {
          this.visitPlanet(planet);
        }
        break;
      }
    }
    
    // Asteroid collision with rocket
    if (r.invincible <= 0) {
      for (const asteroid of this.asteroids) {
        const dx = r.x - asteroid.x;
        const dy = r.y - asteroid.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < r.size + asteroid.size * 0.8) {
          const damage = asteroid.isBoss ? 40 : 15;
          
          if (r.shield > 0) {
            r.shield = Math.max(0, r.shield - damage);
            this.queueNotification('🛡️ Shield absorbed damage!', 'warning');
          } else {
            r.health -= damage;
          }
          
          r.invincible = 60;
          this.triggerScreenShake(10);
          this.addExplosion(r.x, r.y, 30, '#ff4444');
          
          // Bounce rocket away
          r.vx += dx / dist * 5;
          r.vy += dy / dist * 5;
          
          // Damage asteroid too
          asteroid.health -= 20;
          if (asteroid.health <= 0) {
            this.destroyAsteroid(asteroid);
          }
          break;
        }
      }
    }
  }
  
  visitPlanet(planet) {
    this.visitedPlanets.add(planet.name);
    this.addXP(25);
    this.addCredits(15);
    this.queueNotification(`🌍 Discovered ${planet.name}!`, 'planet');
    
    // Refuel at planets
    this.rocket.fuel = Math.min(this.rocket.maxFuel, this.rocket.fuel + 30);
    
    // Mission check
    this.checkMissionProgress('visit', planet.name);
    this.checkMissionProgress('visit_all', this.visitedPlanets.size);
  }
  
  checkMissionProgress(type, value) {
    this.missions.forEach(mission => {
      if (mission.completed) return;
      
      if (mission.type === type) {
        if (type === 'visit' && mission.target === value) {
          this.completeMission(mission);
        } else if (type === 'visit_all' && value >= mission.target) {
          this.completeMission(mission);
        } else if ((type === 'destroy' || type === 'collect' || type === 'defend') && mission.progress !== undefined) {
          mission.progress = value;
          if (value >= mission.target) {
            this.completeMission(mission);
          }
        } else if (type === 'wave' && value >= mission.target) {
          this.completeMission(mission);
        } else if (type === 'speed' && !mission.completed) {
          this.completeMission(mission);
        }
      }
    });
  }
  
  completeMission(mission) {
    mission.completed = true;
    this.addCredits(mission.reward);
    this.queueNotification(`📜 Mission Complete: ${mission.name}! +${mission.reward}💰`, 'quest');
    
    // Set next mission
    this.activeMission = this.missions.find(m => !m.completed) || null;
    
    this.saveProgress();
  }
  
  addXP(amount) {
    this.xp += amount;
    
    while (this.xp >= this.xpToNextLevel) {
      this.xp -= this.xpToNextLevel;
      this.level++;
      this.xpToNextLevel = this.calculateXPRequired(this.level);
      this.queueNotification(`🎉 Level Up! Now Level ${this.level}`, 'levelup');
      
      // Bonus credits on level up
      this.addCredits(this.level * 10);
    }
  }
  
  addCredits(amount) {
    this.credits += amount;
    this.savedData.totalCredits += amount;
  }
  
  getUpgradeCost(upgradeLevel) {
    return Math.floor(50 * Math.pow(1.5, upgradeLevel));
  }
  
  purchaseUpgrade(index) {
    const upgradeKeys = ['thrust', 'maxSpeed', 'turnSpeed', 'weaponPower', 'weaponSpeed', 'shield', 'fuel', 'energyMagnet', 'homingBullets'];
    const key = upgradeKeys[index];
    if (!key) return;
    
    const currentLevel = this.savedData.upgrades[key];
    if (currentLevel >= 10) {
      this.queueNotification('❌ Max level reached!', 'warning');
      return;
    }
    
    const cost = this.getUpgradeCost(currentLevel);
    if (this.credits < cost) {
      this.queueNotification('❌ Not enough credits!', 'warning');
      return;
    }
    
    this.credits -= cost;
    this.savedData.upgrades[key]++;
    
    // Apply upgrade immediately
    this.applyUpgrades();
    
    this.queueNotification(`✅ Upgraded ${this.getUpgradeName(key)}!`, 'success');
    this.saveProgress();
  }
  
  getUpgradeName(key) {
    const names = {
      thrust: 'Thrust Power',
      maxSpeed: 'Max Speed',
      turnSpeed: 'Turn Speed',
      weaponPower: 'Weapon Damage',
      weaponSpeed: 'Projectile Speed',
      shield: 'Shield Capacity',
      fuel: 'Fuel Tank',
      energyMagnet: 'Energy Magnet',
      homingBullets: 'Homing Bullets'
    };
    return names[key] || key;
  }
  
  applyUpgrades() {
    const u = this.savedData.upgrades;
    const r = this.rocket;
    
    r.acceleration = r.baseAcceleration + u.thrust * 0.02;
    r.maxSpeed = r.baseSpeed + u.maxSpeed * 0.8;
    r.turnSpeed = r.baseTurnSpeed + u.turnSpeed * 0.008;
    r.weaponPower = 10 + u.weaponPower * 5;
    r.weaponSpeed = 12 + u.weaponSpeed * 2;
    r.maxShield = u.shield * 15;
    r.shield = Math.min(r.shield, r.maxShield);
    r.maxFuel = 100 + u.fuel * 20;
    r.magnetRange = 50 + u.energyMagnet * 30;
    r.homingLevel = u.homingBullets || 0;
  }
  
  updateCamera() {
    // Center camera on rocket
    this.camera.x = this.rocket.x - this.width / 2;
    this.camera.y = this.rocket.y - this.height / 2;
    
    // Screen shake offset
    if (this.screenShake > 0) {
      this.camera.x += (Math.random() - 0.5) * this.screenShakeIntensity * this.screenShake;
      this.camera.y += (Math.random() - 0.5) * this.screenShakeIntensity * this.screenShake;
    }
    
    // Clamp camera to world bounds
    this.camera.x = Math.max(0, Math.min(this.worldSize - this.width, this.camera.x));
    this.camera.y = Math.max(0, Math.min(this.worldSize - this.height, this.camera.y));
  }
  
  updateNotifications() {
    if (this.notificationTimer > 0) {
      this.notificationTimer--;
      if (this.notificationTimer === 0) {
        this.notification = null;
        // Show next queued notification
        if (this.notificationQueue.length > 0) {
          const next = this.notificationQueue.shift();
          this.notification = next;
          this.notificationTimer = 180;
        }
      }
    }
  }
  
  queueNotification(text, type) {
    if (!this.notification) {
      this.notification = { text, type };
      this.notificationTimer = 180;
    } else {
      this.notificationQueue.push({ text, type });
    }
  }
  
  // ==================== RENDERING ====================
  
  draw() {
    const ctx = this.ctx;
    
    // Clear
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Save state for camera transform
    ctx.save();
    ctx.translate(-this.camera.x, -this.camera.y);
    
    // Draw game world
    this.drawStars();
    this.drawOrbits();
    this.drawSun();
    this.drawEnergyDots();
    this.drawPowerUps();
    this.drawPlanets();
    this.drawAsteroids();
    this.drawProjectiles();
    this.drawMissilesWorld();
    this.drawParticles();
    this.drawExplosions();
    this.drawRocket();
    
    // Restore for UI (screen-space)
    ctx.restore();
    
    // UI
    this.drawUI();
    
    if (this.nearPlanet && !this.showUpgradeMenu && !this.showMissionLog && !this.showShipMenu) {
      this.drawPlanetInfo(this.nearPlanet);
    }
    
    if (this.showUpgradeMenu) {
      this.drawUpgradeMenu();
    }
    
    if (this.showMissionLog) {
      this.drawMissionLog();
    }
    
    if (this.showShipMenu) {
      this.drawShipMenu();
    }
    
    if (this.showTutorial) {
      this.drawTutorial();
    }
    
    if (this.gameOver_) {
      this.drawGameOver();
    }
    
    if (this.notification && !this.showTutorial && !this.gameOver_) {
      this.drawNotification();
    }
  }
  
  drawShipMenu() {
    const ctx = this.ctx;
    const layout = this.getHangarLayout();
    const { x, y, w, h, compact, veryCompact } = layout;
    const titleSize = veryCompact ? 18 : 22;
    const sectionSize = veryCompact ? 12 : 13;
    const nameSize = veryCompact ? 11 : 12;
    const detailSize = veryCompact ? 9 : 10;
    const actionSize = veryCompact ? 10 : 11;
    
    // Overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, this.width, this.height);
    
    this.drawPanel(x, y, w, h);
    
    // Title
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${titleSize}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('🚀 Ship Hangar', this.width / 2, y + 36);
    
    // Credits
    ctx.fillStyle = '#fbbf24';
    ctx.font = `${veryCompact ? 12 : 14}px Inter, sans-serif`;
    ctx.fillText(`💰 Credits: ${this.credits}`, this.width / 2, y + (veryCompact ? 56 : 58));

    // Ship Hulls
    ctx.fillStyle = '#60a5fa';
    ctx.font = `bold ${sectionSize}px Inter, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('Ship Hulls', x + 20, layout.titles.hulls);

    layout.hullCards.forEach((card) => {
      const hull = this.shipHulls[card.index];
      const isUnlocked = this.savedData.unlockedHulls.includes(hull.id);
      const isSelected = this.savedData.currentHull === hull.id;

      ctx.fillStyle = isSelected ? 'rgba(99, 102, 241, 0.35)' : 'rgba(30, 30, 50, 0.82)';
      this.roundRect(card.x, card.y, card.w, card.h, 8);
      ctx.strokeStyle = isSelected ? '#818cf8' : 'rgba(129, 140, 248, 0.25)';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.stroke();

      const textX = card.x + 8;
      const maxWidth = card.w - 16;
      ctx.textAlign = 'left';

      ctx.fillStyle = isUnlocked ? '#fff' : '#9ca3af';
      ctx.font = `bold ${nameSize}px Inter, sans-serif`;
      ctx.fillText(this.fitText(hull.name, maxWidth), textX, card.y + (veryCompact ? 14 : 16));

      const stats = `SPD x${hull.speedMod.toFixed(2)}  HP x${hull.healthMod.toFixed(2)}  DMG x${hull.damageMod.toFixed(2)}`;
      ctx.fillStyle = '#94a3b8';
      ctx.font = `${detailSize}px Inter, sans-serif`;
      ctx.fillText(this.fitText(stats, maxWidth), textX, card.y + (veryCompact ? 27 : 31));

      const desc = this.fitText(hull.desc, maxWidth);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(desc, textX, card.y + (veryCompact ? 38 : 44));

      let action = '';
      if (isSelected) {
        action = 'EQUIPPED';
        ctx.fillStyle = '#4ade80';
      } else if (isUnlocked) {
        action = 'CLICK TO EQUIP';
        ctx.fillStyle = '#a5b4fc';
      } else {
        action = `BUY ${hull.cost} CREDITS`;
        ctx.fillStyle = '#fbbf24';
      }
      ctx.font = `bold ${actionSize}px Inter, sans-serif`;
      ctx.fillText(action, textX, card.y + card.h - (veryCompact ? 7 : 8));
    });
    
    // Weapons
    ctx.fillStyle = '#f472b6';
    ctx.font = `bold ${sectionSize}px Inter, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('Weapons', x + 20, layout.titles.weapons);

    layout.weaponCards.forEach((card) => {
      const weapon = this.weapons[card.index];
      const isUnlocked = this.savedData.unlockedWeapons.includes(weapon.id);
      const isSelected = this.savedData.currentWeapon === weapon.id;

      ctx.fillStyle = isSelected ? 'rgba(244, 114, 182, 0.35)' : 'rgba(30, 30, 50, 0.82)';
      this.roundRect(card.x, card.y, card.w, card.h, 8);
      ctx.strokeStyle = isSelected ? '#f9a8d4' : 'rgba(244, 114, 182, 0.28)';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.stroke();

      const textX = card.x + 8;
      const maxWidth = card.w - 16;
      ctx.textAlign = 'left';

      ctx.fillStyle = isUnlocked ? weapon.color : '#6b7280';
      ctx.font = `${veryCompact ? 13 : 15}px Inter, sans-serif`;
      ctx.fillText(weapon.icon, textX, card.y + (veryCompact ? 15 : 18));

      ctx.fillStyle = isUnlocked ? '#fff' : '#9ca3af';
      ctx.font = `bold ${nameSize}px Inter, sans-serif`;
      ctx.fillText(this.fitText(weapon.name, maxWidth - 20), textX + 20, card.y + (veryCompact ? 14 : 16));

      ctx.fillStyle = '#cbd5e1';
      ctx.font = `${detailSize}px Inter, sans-serif`;
      ctx.fillText(this.fitText(weapon.desc, maxWidth), textX, card.y + (veryCompact ? 27 : 31));

      let action = '';
      if (isSelected) {
        action = 'EQUIPPED';
        ctx.fillStyle = '#4ade80';
      } else if (isUnlocked) {
        action = 'CLICK TO EQUIP';
        ctx.fillStyle = '#f9a8d4';
      } else {
        action = `BUY ${weapon.cost} CREDITS`;
        ctx.fillStyle = '#fbbf24';
      }
      ctx.font = `bold ${actionSize}px Inter, sans-serif`;
      ctx.fillText(action, textX, card.y + card.h - (veryCompact ? 7 : 8));
    });
    
    // Abilities
    ctx.fillStyle = '#a78bfa';
    ctx.font = `bold ${sectionSize}px Inter, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('Abilities', x + 20, layout.titles.abilities);

    layout.abilityCards.forEach((card) => {
      const ability = this.abilities[card.index];
      const isUnlocked = this.savedData.unlockedAbilities.includes(ability.id);
      const isSelected = this.savedData.currentAbility === ability.id;

      ctx.fillStyle = isSelected ? 'rgba(167, 139, 250, 0.35)' : 'rgba(30, 30, 50, 0.82)';
      this.roundRect(card.x, card.y, card.w, card.h, 8);
      ctx.strokeStyle = isSelected ? '#c4b5fd' : 'rgba(167, 139, 250, 0.3)';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.stroke();

      const textX = card.x + 8;
      const maxWidth = card.w - 16;
      ctx.textAlign = 'left';

      ctx.fillStyle = isUnlocked ? '#fff' : '#9ca3af';
      ctx.font = `${veryCompact ? 12 : 14}px Inter, sans-serif`;
      ctx.fillText(ability.icon, textX, card.y + (veryCompact ? 14 : 16));

      ctx.font = `bold ${veryCompact ? 10 : 11}px Inter, sans-serif`;
      ctx.fillText(this.fitText(ability.name, maxWidth - 18), textX + 18, card.y + (veryCompact ? 14 : 16));

      ctx.fillStyle = '#cbd5e1';
      ctx.font = `${veryCompact ? 8 : 9}px Inter, sans-serif`;
      ctx.fillText(this.fitText(ability.desc, maxWidth), textX, card.y + (veryCompact ? 25 : 30));

      let action = '';
      if (isSelected) {
        action = 'EQUIPPED';
        ctx.fillStyle = '#4ade80';
      } else if (isUnlocked) {
        action = 'CLICK TO EQUIP';
        ctx.fillStyle = '#c4b5fd';
      } else {
        action = `BUY ${ability.cost} CREDITS`;
        ctx.fillStyle = '#fbbf24';
      }
      ctx.font = `bold ${veryCompact ? 9 : 10}px Inter, sans-serif`;
      ctx.fillText(action, textX, card.y + card.h - (veryCompact ? 6 : 7));
    });
    
    // Footer hint
    ctx.fillStyle = '#888';
    ctx.font = `${compact ? 10 : 12}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Click any card to buy or equip • Press H or ESC to close', this.width / 2, y + h - 12);
  }
  
  drawMissilesWorld() {
    const ctx = this.ctx;
    
    this.missiles.forEach(m => {
      // Trail
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      m.trail.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
      
      // Missile body
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Glow
      ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.size * 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  
  drawTutorial() {
    const ctx = this.ctx;
    const w = Math.min(550, this.width - 40);
    const h = Math.min(420, this.height - 40);
    const x = this.width / 2 - w / 2;
    const y = this.height / 2 - h / 2;
    
    // Overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, this.width, this.height);
    
    this.drawPanel(x, y, w, h);
    
    // Title
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚀 SPACE DEFENDER', this.width / 2, y + 45);
    
    // Page indicator
    ctx.fillStyle = '#888';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText(`Page ${this.tutorialPage + 1} / 4`, this.width / 2, y + h - 20);
    
    // Content based on page
    ctx.fillStyle = '#fff';
    ctx.font = '15px Inter, sans-serif';
    ctx.textAlign = 'left';
    const leftX = x + 30;
    let lineY = y + 90;
    const lineHeight = 32;
    
    if (this.tutorialPage === 0) {
      // Controls
      ctx.fillStyle = '#60a5fa';
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.fillText('⌨️ CONTROLS', leftX, lineY);
      lineY += lineHeight + 5;
      
      ctx.fillStyle = '#fff';
      ctx.font = '14px Inter, sans-serif';
      const controls = [
        ['W / ↑', 'Thrust forward'],
        ['A / ←', 'Rotate left'],
        ['D / →', 'Rotate right'],
        ['S / ↓', 'Brake'],
        ['SPACE', 'Fire weapon'],
        ['E', 'Use ability'],
        ['U', 'Upgrades menu'],
        ['H', 'Ship/Weapons menu'],
        ['M', 'Missions']
      ];
      
      controls.forEach(([key, desc]) => {
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(key, leftX + 10, lineY);
        ctx.fillStyle = '#ccc';
        ctx.fillText(desc, leftX + 100, lineY);
        lineY += 26;
      });
      
    } else if (this.tutorialPage === 1) {
      // Objectives
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.fillText('🎯 OBJECTIVES', leftX, lineY);
      lineY += lineHeight + 10;
      
      ctx.fillStyle = '#fff';
      ctx.font = '14px Inter, sans-serif';
      const objectives = [
        '• Defend planets from asteroid waves',
        '• Collect energy dots to level up',
        '• Destroy asteroids for credits',
        '• Visit all 8 planets',
        '• Complete missions for rewards',
        '• Survive as long as possible!'
      ];
      
      objectives.forEach(obj => {
        ctx.fillText(obj, leftX + 10, lineY);
        lineY += 30;
      });
      
    } else if (this.tutorialPage === 2) {
      // Ships & Weapons
      ctx.fillStyle = '#f472b6';
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.fillText('🚀 SHIPS & WEAPONS', leftX, lineY);
      lineY += lineHeight + 10;
      
      ctx.fillStyle = '#fff';
      ctx.font = '14px Inter, sans-serif';
      const info = [
        '• Unlock new ship hulls (H key)',
        '  - Racer: +40% speed',
        '  - Fortress: +60% health',
        '  - Destroyer: +50% damage',
        '',
        '• Unlock new weapons',
        '  - Plasma, Rapid Fire, Cannon, Spread',
        '',
        '• Unlock abilities (E to use)',
        '  - Turbo Boost, Shield, EMP, Missile'
      ];
      
      info.forEach(line => {
        if (line.startsWith('•')) {
          ctx.fillStyle = '#60a5fa';
        } else {
          ctx.fillStyle = '#ccc';
        }
        ctx.fillText(line, leftX + 10, lineY);
        lineY += line === '' ? 15 : 26;
      });
      
    } else if (this.tutorialPage === 3) {
      // Tips
      ctx.fillStyle = '#a78bfa';
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.fillText('💡 TIPS', leftX, lineY);
      lineY += lineHeight + 10;
      
      ctx.fillStyle = '#fff';
      ctx.font = '14px Inter, sans-serif';
      const tips = [
        '• Stay near the Sun to recharge fuel',
        '• Gravity pulls you toward the Sun',
        '• Planets also have weak gravity',
        '• Visit planets to discover them (+XP)',
        '• Gold energy dots are worth 10x!',
        '• Boss asteroids appear every 5 waves',
        '• Your progress is auto-saved',
        '',
        'Press ? anytime to show this tutorial'
      ];
      
      tips.forEach(tip => {
        if (tip.startsWith('Press')) {
          ctx.fillStyle = '#888';
          ctx.font = '12px Inter, sans-serif';
        }
        ctx.fillText(tip, leftX + 10, lineY);
        lineY += tip === '' ? 10 : 26;
      });
    }
    
    // Navigation hints
    ctx.fillStyle = '#4ade80';
    ctx.font = '13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Press SPACE or → to continue | ESC to skip', this.width / 2, y + h - 45);
  }
  
  drawStars() {
    const ctx = this.ctx;
    
    this.stars.forEach(star => {
      star.twinkle += 0.02;
      const brightness = star.brightness * (0.7 + 0.3 * Math.sin(star.twinkle));
      
      // Parallax effect
      const parallax = [0.2, 0.5, 1][star.layer];
      const x = star.x - this.camera.x * (1 - parallax);
      const y = star.y - this.camera.y * (1 - parallax);
      
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
      ctx.beginPath();
      ctx.arc(x, y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  
  drawOrbits() {
    const ctx = this.ctx;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    
    this.planets.forEach(planet => {
      ctx.beginPath();
      ctx.arc(this.sunX, this.sunY, planet.distance, 0, Math.PI * 2);
      ctx.stroke();
    });
  }
  
  drawSun() {
    const ctx = this.ctx;
    const pulse = 1 + 0.08 * Math.sin(this.gameTime * 0.03);
    
    // Outer glow
    const gradient = ctx.createRadialGradient(this.sunX, this.sunY, 0, this.sunX, this.sunY, 80 * pulse);
    gradient.addColorStop(0, 'rgba(255, 220, 100, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 150, 50, 0.8)');
    gradient.addColorStop(0.7, 'rgba(255, 100, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.sunX, this.sunY, 80 * pulse, 0, Math.PI * 2);
    ctx.fill();
    
    // Core
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(this.sunX, this.sunY, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // Corona flares
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i + this.gameTime * 0.01;
      const length = 45 + Math.sin(this.gameTime * 0.05 + i) * 15;
      
      ctx.strokeStyle = 'rgba(255, 200, 50, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(this.sunX + Math.cos(angle) * 35, this.sunY + Math.sin(angle) * 35);
      ctx.lineTo(this.sunX + Math.cos(angle) * length, this.sunY + Math.sin(angle) * length);
      ctx.stroke();
    }
  }
  
  drawPlanets() {
    const ctx = this.ctx;
    
    this.planets.forEach(planet => {
      // Health-based glow
      const healthPercent = planet.currentHealth / planet.health;
      const glowColor = healthPercent > 0.5 ? '100, 255, 100' : healthPercent > 0.25 ? '255, 200, 50' : '255, 100, 100';
      
      // Visited glow
      if (this.visitedPlanets.has(planet.name)) {
        ctx.fillStyle = `rgba(${glowColor}, ${0.15 + 0.05 * Math.sin(planet.glowPulse)})`;
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, planet.size + 15, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Planet body
      const gradient = ctx.createRadialGradient(
        planet.x - planet.size * 0.3, planet.y - planet.size * 0.3, 0,
        planet.x, planet.y, planet.size
      );
      gradient.addColorStop(0, this.lightenColor(planet.color, 1.3));
      gradient.addColorStop(0.5, planet.color);
      gradient.addColorStop(1, this.darkenColor(planet.color, 0.6));
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Saturn's rings
      if (planet.hasRings) {
        ctx.strokeStyle = 'rgba(244, 213, 158, 0.6)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(planet.x, planet.y, planet.size * 1.8, planet.size * 0.4, 0.3, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Health bar
      if (planet.currentHealth < planet.health) {
        const barWidth = planet.size * 2;
        const barHeight = 6;
        const barX = planet.x - barWidth / 2;
        const barY = planet.y - planet.size - 15;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        ctx.fillStyle = healthPercent > 0.5 ? '#4ade80' : healthPercent > 0.25 ? '#fbbf24' : '#ef4444';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
      }
      
      // Name
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(planet.name, planet.x, planet.y + planet.size + 18);
    });
  }
  
  drawAsteroids() {
    const ctx = this.ctx;
    
    this.asteroids.forEach(asteroid => {
      ctx.save();
      ctx.translate(asteroid.x, asteroid.y);
      ctx.rotate(asteroid.rotation);
      
      // Glow for boss
      if (asteroid.isBoss) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.beginPath();
        ctx.arc(0, 0, asteroid.size * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Body
      const gradient = ctx.createRadialGradient(
        -asteroid.size * 0.2, -asteroid.size * 0.2, 0,
        0, 0, asteroid.size
      );
      gradient.addColorStop(0, this.lightenColor(asteroid.color, 1.3));
      gradient.addColorStop(1, this.darkenColor(asteroid.color, 0.5));
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      asteroid.vertices.forEach((v, i) => {
        const x = Math.cos(v.angle) * v.radius;
        const y = Math.sin(v.angle) * v.radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fill();
      
      // Health bar for boss
      if (asteroid.isBoss) {
        const barWidth = asteroid.size * 2;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(-barWidth / 2, -asteroid.size - 12, barWidth, 6);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-barWidth / 2, -asteroid.size - 12, barWidth * (asteroid.health / asteroid.maxHealth), 6);
      }
      
      ctx.restore();
    });
  }
  
  drawProjectiles() {
    const ctx = this.ctx;
    
    this.projectiles.forEach(p => {
      // Trail
      const gradient = ctx.createLinearGradient(
        p.x - p.vx * 3, p.y - p.vy * 3,
        p.x, p.y
      );
      gradient.addColorStop(0, 'rgba(96, 165, 250, 0)');
      gradient.addColorStop(1, p.color);
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = p.size;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p.x - p.vx * 3, p.y - p.vy * 3);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      
      // Glow
      ctx.fillStyle = 'rgba(96, 165, 250, 0.5)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  
  drawEnergyDots() {
    const ctx = this.ctx;
    
    this.energyDots.forEach(dot => {
      const scale = 1 + 0.2 * Math.sin(dot.pulse);
      const alpha = Math.min(1, dot.lifetime / 60);
      
      // Glow
      ctx.fillStyle = dot.color + Math.floor(alpha * 64).toString(16).padStart(2, '0');
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.size * 2.5 * scale, 0, Math.PI * 2);
      ctx.fill();
      
      // Core
      ctx.fillStyle = dot.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.size * scale, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  
  drawPowerUps() {
    const ctx = this.ctx;
    
    this.powerUps.forEach(p => {
      const scale = 1 + 0.15 * Math.sin(p.pulse);
      const alpha = Math.min(1, p.lifetime / 60);
      
      // Glow ring
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 1.5 * scale, 0, Math.PI * 2);
      ctx.stroke();
      
      // Icon
      ctx.font = `${20 * scale}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillText(p.icon, p.x, p.y);
    });
  }
  
  drawParticles() {
    const ctx = this.ctx;
    
    this.particles.forEach(p => {
      const alpha = Math.floor(p.life * 255).toString(16).padStart(2, '0');
      ctx.fillStyle = p.color + alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  
  drawExplosions() {
    const ctx = this.ctx;
    
    this.explosions.forEach(e => {
      ctx.strokeStyle = e.color + Math.floor(e.alpha * 200).toString(16).padStart(2, '0');
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Inner fill
      ctx.fillStyle = e.color + Math.floor(e.alpha * 50).toString(16).padStart(2, '0');
      ctx.fill();
    });
  }
  
  drawRocket() {
    const ctx = this.ctx;
    const r = this.rocket;
    const hull = this.getCurrentHull();
    
    ctx.save();
    ctx.translate(r.x, r.y);
    ctx.rotate(r.angle + Math.PI / 2);
    
    // Invincibility flash
    if (r.invincible > 0 && Math.floor(r.invincible / 5) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }
    
    // Ability active glow
    if (this.abilityActive) {
      ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
      ctx.beginPath();
      ctx.arc(0, 0, r.size * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Shield bubble
    if (r.shield > 0) {
      ctx.fillStyle = `rgba(100, 200, 255, ${0.1 + 0.05 * Math.sin(this.gameTime * 0.1)})`;
      ctx.beginPath();
      ctx.arc(0, 0, r.size * 1.8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = `rgba(100, 200, 255, ${0.4 + 0.2 * Math.sin(this.gameTime * 0.1)})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Rocket body - use hull color
    ctx.fillStyle = hull.color;
    ctx.beginPath();
    ctx.moveTo(0, -r.size);
    ctx.lineTo(-r.size * 0.45, r.size * 0.6);
    ctx.lineTo(r.size * 0.45, r.size * 0.6);
    ctx.closePath();
    ctx.fill();
    
    // Dark side shading
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.moveTo(0, -r.size);
    ctx.lineTo(r.size * 0.45, r.size * 0.6);
    ctx.lineTo(0, r.size * 0.4);
    ctx.closePath();
    ctx.fill();
    
    // Window - use accent color
    const windowGradient = ctx.createRadialGradient(0, -r.size * 0.3, 0, 0, -r.size * 0.3, r.size * 0.25);
    windowGradient.addColorStop(0, hull.accentColor);
    windowGradient.addColorStop(1, this.darkenColor(hull.accentColor, 0.6));
    ctx.fillStyle = windowGradient;
    ctx.beginPath();
    ctx.arc(0, -r.size * 0.25, r.size * 0.22, 0, Math.PI * 2);
    ctx.fill();
    
    // Window reflection
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(-r.size * 0.08, -r.size * 0.35, r.size * 0.08, 0, Math.PI * 2);
    ctx.fill();
    
    // Fins - use accent color
    ctx.fillStyle = hull.accentColor;
    ctx.beginPath();
    ctx.moveTo(-r.size * 0.45, r.size * 0.3);
    ctx.lineTo(-r.size * 0.75, r.size * 0.75);
    ctx.lineTo(-r.size * 0.45, r.size * 0.6);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(r.size * 0.45, r.size * 0.3);
    ctx.lineTo(r.size * 0.75, r.size * 0.75);
    ctx.lineTo(r.size * 0.45, r.size * 0.6);
    ctx.closePath();
    ctx.fill();
    
    // Thrust flame
    if (r.thrust > 0.1) {
      const flameSize = r.size * (0.6 + Math.random() * 0.3) * r.thrust;
      const gradient = ctx.createLinearGradient(0, r.size * 0.6, 0, r.size * 0.6 + flameSize);
      gradient.addColorStop(0, '#ffd700');
      gradient.addColorStop(0.3, '#ff6b35');
      gradient.addColorStop(0.7, '#ff4500');
      gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(-r.size * 0.25, r.size * 0.6);
      ctx.quadraticCurveTo(0, r.size * 0.6 + flameSize * 1.2, r.size * 0.25, r.size * 0.6);
      ctx.closePath();
      ctx.fill();
    }
    
    ctx.restore();
  }
  
  drawUI() {
    const ctx = this.ctx;
    const r = this.rocket;
    
    // Don't draw normal UI during game over
    if (this.gameOver_) return;
    
    // Top-left panel: Level & XP
    this.drawPanel(10, 10, 200, 75);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Level ${this.level}`, 22, 35);
    
    // XP bar
    ctx.fillStyle = '#1a1a2e';
    this.roundRect(22, 43, 170, 12, 6);
    ctx.fillStyle = '#6366f1';
    this.roundRect(22, 43, 170 * Math.min(1, this.xp / this.xpToNextLevel), 12, 6);
    
    ctx.fillStyle = '#aaa';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText(`${this.xp}/${this.xpToNextLevel} XP`, 22, 70);
    
    // Credits
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`💰 ${this.credits}`, 195, 70);
    
    // Top-right panel: Stats
    this.drawPanel(this.width - 160, 10, 150, 85);
    
    ctx.fillStyle = '#fff';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'right';
    const statX = this.width - 22;
    ctx.fillText(`Wave: ${this.wave}`, statX, 32);
    ctx.fillText(`Destroyed: ${this.asteroidsDestroyed}`, statX, 50);
    ctx.fillText(`Energy: ${this.energyCollected}`, statX, 68);
    ctx.fillText(`Planets: ${this.visitedPlanets.size}/8`, statX, 86);
    
    // Ability indicator (top-center)
    const ability = this.getCurrentAbility();
    if (ability.id !== 'none') {
      const abX = this.width / 2;
      this.drawPanel(abX - 60, 10, 120, 45);
      
      ctx.fillStyle = this.abilityCooldown > 0 ? '#666' : '#4ade80';
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${ability.icon} [E]`, abX, 35);
      
      if (this.abilityCooldown > 0) {
        ctx.fillStyle = '#888';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(`${Math.ceil(this.abilityCooldown / 60)}s`, abX, 48);
      } else {
        ctx.fillStyle = '#4ade80';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText('Ready!', abX, 48);
      }
    }
    
    // Bottom-left: Health / Shield / Fuel
    const barWidth = 190;
    const panelHeight = r.maxShield > 0 ? 96 : 74;
    const bottomY = this.height - (panelHeight + 10);
    this.drawPanel(10, bottomY, barWidth + 26, panelHeight);

    const drawStatBar = (label, value, max, y, color, icon) => {
      const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
      const x = 24;
      const w = barWidth;
      const h = 12;

      ctx.fillStyle = '#dbe4ff';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${icon} ${label}`, x, y - 4);

      ctx.fillStyle = 'rgba(6, 10, 24, 0.9)';
      this.roundRect(x, y, w, h, 6);

      ctx.fillStyle = color;
      this.roundRect(x, y, w * ratio, h, 6);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${Math.ceil(value)} / ${Math.ceil(max)}`, x + w, y - 4);
    };

    const hpColor = r.health / r.maxHealth > 0.5 ? '#4ade80' : r.health / r.maxHealth > 0.25 ? '#f59e0b' : '#ef4444';
    drawStatBar('HP', r.health, r.maxHealth, bottomY + 20, hpColor, '❤️');

    let nextY = bottomY + 48;
    if (r.maxShield > 0) {
      drawStatBar('Shield', r.shield, r.maxShield, nextY, '#60a5fa', '🛡️');
      nextY += 28;
    }

    const fuelColor = r.fuel / r.maxFuel > 0.4 ? '#22d3ee' : r.fuel / r.maxFuel > 0.2 ? '#fbbf24' : '#ef4444';
    drawStatBar('Fuel', r.fuel, r.maxFuel, nextY, fuelColor, '⛽');
    
    // Current weapon indicator (above minimap)
    const weapon = this.getCurrentWeapon();
    const hull = this.getCurrentHull();
    this.drawPanel(this.width - 145, this.height - 210, 135, 35);
    ctx.fillStyle = weapon.color;
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${weapon.icon} ${weapon.name}`, this.width - 20, this.height - 190);
    
    // Controls hint (simplified, no overlap)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WASD: Move | SPACE: Fire | E: Ability | U/H/M: Menus', this.width / 2, this.height - 5);
    
    // Minimap (bottom-right)
    this.drawMinimap();
  }
  
  drawPanel(x, y, w, h) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(10, 10, 26, 0.85)';
    this.roundRect(x, y, w, h, 12);
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  
  roundRect(x, y, w, h, r) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }
  
  drawMinimap() {
    const ctx = this.ctx;
    const size = 120;
    const x = this.width - size - 15;
    const y = this.height - size - 55;
    const scale = size / this.worldSize;
    
    // Background
    ctx.fillStyle = 'rgba(10, 10, 26, 0.8)';
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Sun
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(x + this.sunX * scale, y + this.sunY * scale, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Planets
    this.planets.forEach(planet => {
      ctx.fillStyle = planet.color;
      ctx.beginPath();
      ctx.arc(x + planet.x * scale, y + planet.y * scale, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Asteroids
    ctx.fillStyle = '#ef4444';
    this.asteroids.forEach(asteroid => {
      ctx.beginPath();
      ctx.arc(x + asteroid.x * scale, y + asteroid.y * scale, asteroid.isBoss ? 3 : 1.5, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Player
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(x + this.rocket.x * scale, y + this.rocket.y * scale, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  
  drawPlanetInfo(planet) {
    const ctx = this.ctx;
    const boxWidth = 280;
    const boxHeight = 130;
    const boxX = this.width / 2 - boxWidth / 2;
    const boxY = 100;
    
    this.drawPanel(boxX, boxY, boxWidth, boxHeight);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🪐 ${planet.name}`, this.width / 2, boxY + 30);
    
    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = '#ccc';
    
    planet.facts.forEach((fact, i) => {
      ctx.fillText(`• ${fact}`, this.width / 2, boxY + 55 + i * 22);
    });
  }
  
  drawUpgradeMenu() {
    const ctx = this.ctx;
    const w = 500;
    const h = 455;
    const x = this.width / 2 - w / 2;
    const y = this.height / 2 - h / 2;
    
    // Overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, this.width, this.height);
    
    this.drawPanel(x, y, w, h);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚀 Ship Upgrades', this.width / 2, y + 40);
    
    ctx.font = '14px Inter, sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`Credits: ${this.credits} 💰`, this.width / 2, y + 65);
    
    const upgrades = [
      { key: 'thrust', name: 'Thrust Power', icon: '🔥', desc: 'Faster acceleration' },
      { key: 'maxSpeed', name: 'Max Speed', icon: '⚡', desc: 'Higher top speed' },
      { key: 'turnSpeed', name: 'Turn Speed', icon: '🔄', desc: 'Quicker turning' },
      { key: 'weaponPower', name: 'Weapon Damage', icon: '💥', desc: 'More damage per shot' },
      { key: 'weaponSpeed', name: 'Projectile Speed', icon: '🎯', desc: 'Faster projectiles' },
      { key: 'shield', name: 'Shield Capacity', icon: '🛡️', desc: 'Absorb more damage' },
      { key: 'fuel', name: 'Fuel Tank', icon: '⛽', desc: 'Larger fuel capacity' },
      { key: 'energyMagnet', name: 'Energy Magnet', icon: '🧲', desc: 'Attract energy from farther' },
      { key: 'homingBullets', name: 'Homing Bullets', icon: '🎯', desc: 'Shots steer toward nearby asteroids' }
    ];
    
    upgrades.forEach((upg, i) => {
      const uy = y + 86 + i * 36;
      const level = this.savedData.upgrades[upg.key];
      const cost = this.getUpgradeCost(level);
      const maxed = level >= 10;
      
      // Row background
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.03)' : 'transparent';
      ctx.fillRect(x + 15, uy - 12, w - 30, 35);
      
      // Number hotkey
      ctx.fillStyle = '#6366f1';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`[${i + 1}]`, x + 25, uy + 5);
      
      // Icon & name
      ctx.fillStyle = '#fff';
      ctx.font = '14px Inter, sans-serif';
      ctx.fillText(`${upg.icon} ${upg.name}`, x + 60, uy + 5);
      
      // Level bar
      const barX = x + 230;
      const barWidth = 100;
      ctx.fillStyle = '#1a1a2e';
      this.roundRect(barX, uy - 5, barWidth, 14, 4);
      ctx.fillStyle = '#6366f1';
      this.roundRect(barX, uy - 5, barWidth * (level / 10), 14, 4);
      
      ctx.fillStyle = '#fff';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${level}/10`, barX + barWidth / 2, uy + 5);
      
      // Cost
      ctx.textAlign = 'right';
      ctx.font = '13px Inter, sans-serif';
      if (maxed) {
        ctx.fillStyle = '#4ade80';
        ctx.fillText('MAX', x + w - 25, uy + 5);
      } else {
        ctx.fillStyle = this.credits >= cost ? '#fbbf24' : '#ef4444';
        ctx.fillText(`${cost} 💰`, x + w - 25, uy + 5);
      }
    });
    
    ctx.fillStyle = '#888';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Click upgrade rows or press 1-9 | U or ESC to close', this.width / 2, y + h - 18);
  }
  
  drawMissionLog() {
    const ctx = this.ctx;
    const w = 400;
    const h = 350;
    const x = this.width / 2 - w / 2;
    const y = this.height / 2 - h / 2;
    
    // Overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, this.width, this.height);
    
    this.drawPanel(x, y, w, h);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📜 Missions', this.width / 2, y + 35);
    
    ctx.font = '13px Inter, sans-serif';
    ctx.textAlign = 'left';
    
    this.missions.slice(0, 10).forEach((mission, i) => {
      const my = y + 65 + i * 28;
      
      if (mission.completed) {
        ctx.fillStyle = '#4ade80';
        ctx.fillText(`✓ ${mission.name}`, x + 25, my);
        ctx.fillStyle = '#888';
        ctx.textAlign = 'right';
        ctx.fillText(`+${mission.reward} 💰`, x + w - 25, my);
      } else {
        ctx.fillStyle = '#fff';
        ctx.fillText(`○ ${mission.name}`, x + 25, my);
        ctx.fillStyle = '#aaa';
        ctx.font = '11px Inter, sans-serif';
        
        let progress = '';
        if (mission.progress !== undefined) {
          progress = ` (${mission.progress}/${mission.target})`;
        }
        ctx.fillText(mission.desc + progress, x + 35, my + 14);
        
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fbbf24';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText(`+${mission.reward} 💰`, x + w - 25, my);
      }
      
      ctx.textAlign = 'left';
      ctx.font = '13px Inter, sans-serif';
    });
    
    ctx.fillStyle = '#888';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Press M or ESC to close', this.width / 2, y + h - 15);
  }
  
  drawNotification() {
    const ctx = this.ctx;
    const n = this.notification;
    
    const alpha = Math.min(1, this.notificationTimer / 30);
    const colors = {
      achievement: '#fbbf24',
      quest: '#6366f1',
      levelup: '#4ade80',
      planet: '#4fc3f7',
      success: '#4ade80',
      warning: '#f59e0b',
      danger: '#ef4444'
    };
    
    const boxWidth = Math.min(400, ctx.measureText(n.text).width + 60);
    const boxX = this.width / 2 - boxWidth / 2;
    
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(10, 10, 26, 0.9)';
    this.roundRect(boxX, 60, boxWidth, 45, 10);
    
    ctx.strokeStyle = colors[n.type] || '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(n.text, this.width / 2, 88);
    ctx.globalAlpha = 1;
  }
  
  // Utility functions
  lightenColor(hex, factor) {
    const num = parseInt(hex.slice(1), 16);
    let r = Math.min(255, Math.floor((num >> 16) * factor));
    let g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) * factor));
    let b = Math.min(255, Math.floor((num & 0x0000FF) * factor));
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  darkenColor(hex, factor) {
    const num = parseInt(hex.slice(1), 16);
    const r = Math.floor((num >> 16) * factor);
    const g = Math.floor(((num >> 8) & 0x00FF) * factor);
    const b = Math.floor((num & 0x0000FF) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  gameOver(reason = 'Hull integrity critical') {
    if (this.gameOver_) return;
    this.gameOverReason = reason;
    this.gameOver_ = true;
    this.paused = false; // Keep game loop running to draw game over screen
    this.saveProgress();
    
    // Update high score
    this.currentScore = this.asteroidsDestroyed * 10 + this.energyCollected + this.wave * 50;
    if (this.currentScore > this.savedData.highScore) {
      this.savedData.highScore = this.currentScore;
      this.saveProgress();
    }
    
    // Set up restart handler
    this.restartHandler = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        window.removeEventListener('keydown', this.restartHandler);
        this.restart();
      } else if (e.key === 'Escape') {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', this.restartHandler);
  }
  
  drawGameOver() {
    const ctx = this.ctx;
    
    // Overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, this.width, this.height);

    // Consolidated game-over panel that fits all text
    const panelW = Math.min(460, this.width - 40);
    const panelH = Math.min(260, this.height - 40);
    const panelX = this.width / 2 - panelW / 2;
    const panelY = this.height / 2 - panelH / 2;
    this.drawPanel(panelX, panelY, panelW, panelH);

    // Game Over text with animation (inside panel)
    const pulse = 1 + 0.05 * Math.sin(this.gameTime * 0.1);
    ctx.fillStyle = '#ef4444';
    const titleSize = Math.max(30, Math.min(44, panelW * 0.1)) * pulse;
    ctx.font = `bold ${titleSize}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', this.width / 2, panelY + 52);

    ctx.fillStyle = '#fff';
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText(`Cause: ${this.gameOverReason}`, this.width / 2, panelY + 84);
    ctx.fillText(`Wave Reached: ${this.wave}`, this.width / 2, panelY + 110);
    ctx.fillText(`Asteroids Destroyed: ${this.asteroidsDestroyed}`, this.width / 2, panelY + 136);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillText(`Score: ${this.currentScore}`, this.width / 2, panelY + 170);

    ctx.fillStyle = '#aaa';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText(`High Score: ${this.savedData.highScore}`, this.width / 2, panelY + 194);

    // Instructions kept inside panel
    ctx.fillStyle = '#4ade80';
    ctx.font = '15px Inter, sans-serif';
    ctx.fillText('Press SPACE to try again', this.width / 2, panelY + 222);
    ctx.fillStyle = '#888';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('Press ENTER or SPACE to restart', this.width / 2, panelY + 242);
  }
  
  restart() {
    this.gameOver_ = false;
    this.gameOverReason = 'Hull integrity critical';
    this.loadProgress();
    this.initRocket();
    this.planets.forEach(p => p.currentHealth = p.health);
    this.asteroids = [];
    this.projectiles = [];
    this.explosions = [];
    this.particles = [];
    this.energyDots = [];
    this.powerUps = [];
    this.missiles = [];
    
    this.abilityCooldown = 0;
    this.abilityActive = false;
    this.abilityDuration = 0;
    
    this.spawnEnergyDots(200);
    
    this.wave = 0;
    this.waveTimer = 0;
    this.asteroidsDestroyed = 0;
    this.planetsDefended = 0;
    this.energyCollected = 0;
    this.gameTime = 0;
    this.paused = false;
    
    this.rocket.x = this.sunX + 400;
    this.rocket.y = this.sunY;
    
    this.queueNotification('🚀 Welcome back, Space Defender!', 'success');
  }
  
  start() {
    let lastTime = 0;
    
    const loop = (timestamp) => {
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;
      
      this.update(deltaTime);
      this.draw();
      
      this.gameLoop = requestAnimationFrame(loop);
    };
    
    this.gameLoop = requestAnimationFrame(loop);
  }
  
  stop() {
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
      this.gameLoop = null;
    }
  }
  
  exitGame() {
    this.saveProgress();
    this.stop();
    const container = document.getElementById('space-game-container');
    if (container) {
      container.style.display = 'none';
    }
  }
}

// Launch function
function launchSpaceGame() {
  let container = document.getElementById('space-game-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'space-game-container';
    container.innerHTML = `
      <canvas id="space-game-canvas"></canvas>
      <a id="game-back-btn" href="index.html">← Main Site</a>
    `;
    document.body.appendChild(container);
    
    const style = document.createElement('style');
    style.textContent = `
      #space-game-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        background: #050510;
      }
      #space-game-canvas {
        width: 100%;
        height: 100%;
        display: block;
      }
      #game-back-btn {
        position: absolute;
        top: 15px;
        right: 220px;
        background: rgba(129, 140, 248, 0.2);
        color: #c7d2fe;
        border: 1px solid rgba(129, 140, 248, 0.5);
        padding: 10px 20px;
        border-radius: 8px;
        text-decoration: none;
        font-family: Inter, sans-serif;
        font-size: 14px;
        font-weight: 500;
        z-index: 10001;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        white-space: nowrap;
      }
      #game-back-btn:hover {
        background: rgba(129, 140, 248, 0.35);
        border-color: #a5b4fc;
        color: #eef2ff;
      }
      @media (max-width: 768px) {
        #game-back-btn {
          top: 12px;
          right: 12px;
          padding: 8px 12px;
          font-size: 12px;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  container.style.display = 'block';
  
  const canvas = document.getElementById('space-game-canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Handle resize
  window.addEventListener('resize', () => {
    if (window.spaceGame) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      window.spaceGame.width = canvas.width;
      window.spaceGame.height = canvas.height;
    }
  });
  
  window.spaceGame = new SpaceGame(canvas);
  window.spaceGame.start();
  
  setTimeout(() => {
    window.spaceGame.queueNotification('🚀 Welcome, Space Defender! Protect the planets!', 'success');
  }, 500);
}

window.launchSpaceGame = launchSpaceGame;
