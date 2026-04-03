/**
 * Space Explorer - A 2D Space Exploration Game
 * Hidden easter egg with controllable rocket, planets, quests, and XP system
 */

class SpaceGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    
    // Game state
    this.gameLoop = null;
    this.paused = false;
    this.gameTime = 0;
    
    // Player (Rocket)
    this.rocket = {
      x: this.width / 2,
      y: this.height / 2,
      vx: 0,
      vy: 0,
      angle: -Math.PI / 2, // Pointing up
      thrust: 0,
      maxSpeed: 5,
      acceleration: 0.15,
      friction: 0.99,
      size: 20,
      fuel: 100,
      maxFuel: 100,
      fuelConsumption: 0.1
    };
    
    // XP and Level system
    this.xp = 0;
    this.level = 1;
    this.xpToNextLevel = 100;
    
    // Achievements
    this.achievements = [];
    this.unlockedAchievements = new Set();
    this.initAchievements();
    
    // Planets
    this.planets = [];
    this.initPlanets();
    
    // Quests
    this.quests = [];
    this.activeQuests = [];
    this.completedQuests = new Set();
    this.initQuests();
    
    // Collectibles (space gems)
    this.collectibles = [];
    this.initCollectibles();
    
    // Stars background
    this.stars = [];
    this.initStars();
    
    // Particles (thrust effect)
    this.particles = [];
    
    // Input
    this.keys = {};
    this.setupInput();
    
    // UI elements
    this.showQuestLog = false;
    this.notification = null;
    this.notificationTimer = 0;
    
    // Planet currently near
    this.nearPlanet = null;
    this.visitedPlanets = new Set();
    
    // Fuel stations
    this.fuelStations = [];
    this.initFuelStations();
  }
  
  initAchievements() {
    this.achievements = [
      { id: 'first_flight', name: 'First Flight', desc: 'Use your thrusters for the first time', xp: 10, icon: '🚀' },
      { id: 'explorer', name: 'Explorer', desc: 'Visit your first planet', xp: 25, icon: '🌍' },
      { id: 'tourist', name: 'Space Tourist', desc: 'Visit 4 different planets', xp: 50, icon: '✈️' },
      { id: 'grand_tour', name: 'Grand Tour', desc: 'Visit all 8 planets', xp: 200, icon: '🏆' },
      { id: 'collector', name: 'Gem Collector', desc: 'Collect 10 space gems', xp: 30, icon: '💎' },
      { id: 'hoarder', name: 'Space Hoarder', desc: 'Collect 50 space gems', xp: 100, icon: '🌟' },
      { id: 'speed_demon', name: 'Speed Demon', desc: 'Reach maximum velocity', xp: 25, icon: '⚡' },
      { id: 'fuel_efficient', name: 'Fuel Efficient', desc: 'Visit 3 planets without refueling', xp: 75, icon: '⛽' },
      { id: 'quest_master', name: 'Quest Master', desc: 'Complete 5 quests', xp: 100, icon: '📜' },
      { id: 'level_5', name: 'Space Cadet', desc: 'Reach level 5', xp: 50, icon: '🎖️' },
      { id: 'level_10', name: 'Space Captain', desc: 'Reach level 10', xp: 150, icon: '👨‍🚀' }
    ];
  }
  
  initPlanets() {
    const planetData = [
      { name: 'Mercury', color: '#a6a6a6', size: 15, distance: 80, speed: 0.02, facts: ['Closest to the Sun', 'No atmosphere', 'Temperature: -180°C to 430°C'] },
      { name: 'Venus', color: '#e6c87a', size: 22, distance: 130, speed: 0.015, facts: ['Hottest planet', 'Spins backwards', 'A day is longer than a year!'] },
      { name: 'Earth', color: '#6b93d6', size: 24, distance: 180, speed: 0.012, facts: ['Our home!', '71% water', 'Only known life'] },
      { name: 'Mars', color: '#c1440e', size: 18, distance: 240, speed: 0.01, facts: ['The Red Planet', 'Has the largest volcano', 'Elon wants to live here'] },
      { name: 'Jupiter', color: '#d8ca9d', size: 50, distance: 340, speed: 0.005, facts: ['Largest planet', 'Has 95 moons!', 'The Great Red Spot is a storm'] },
      { name: 'Saturn', color: '#f4d59e', size: 45, distance: 440, speed: 0.004, facts: ['Famous rings', 'Could float in water', '82 known moons'], hasRings: true },
      { name: 'Uranus', color: '#d1e7e7', size: 32, distance: 530, speed: 0.003, facts: ['Tilted on its side', 'Ice giant', 'Discovered in 1781'] },
      { name: 'Neptune', color: '#5b5ddf', size: 30, distance: 620, speed: 0.002, facts: ['Windiest planet', 'Has 14 moons', 'Takes 165 years to orbit'] }
    ];
    
    // Center of the solar system (Sun position)
    this.sunX = this.width / 2;
    this.sunY = this.height / 2;
    
    planetData.forEach((data, i) => {
      const angle = (Math.PI * 2 / planetData.length) * i + Math.random() * 0.5;
      this.planets.push({
        ...data,
        angle: angle,
        x: this.sunX + Math.cos(angle) * data.distance,
        y: this.sunY + Math.sin(angle) * data.distance
      });
    });
  }
  
  initQuests() {
    this.quests = [
      { id: 'visit_earth', name: 'Home Sweet Home', desc: 'Visit Earth', target: 'Earth', type: 'visit', xp: 20, completed: false },
      { id: 'visit_mars', name: 'Red Planet Explorer', desc: 'Visit Mars', target: 'Mars', type: 'visit', xp: 25, completed: false },
      { id: 'gas_giants', name: 'Gas Giant Tour', desc: 'Visit Jupiter and Saturn', targets: ['Jupiter', 'Saturn'], type: 'multi_visit', progress: [], xp: 60, completed: false },
      { id: 'inner_planets', name: 'Inner Circle', desc: 'Visit Mercury, Venus, Earth, Mars', targets: ['Mercury', 'Venus', 'Earth', 'Mars'], type: 'multi_visit', progress: [], xp: 80, completed: false },
      { id: 'outer_planets', name: 'Outer Reaches', desc: 'Visit Uranus and Neptune', targets: ['Uranus', 'Neptune'], type: 'multi_visit', progress: [], xp: 100, completed: false },
      { id: 'collect_5', name: 'Shiny Things', desc: 'Collect 5 space gems', target: 5, type: 'collect', progress: 0, xp: 30, completed: false },
      { id: 'collect_20', name: 'Gem Hunter', desc: 'Collect 20 space gems', target: 20, type: 'collect', progress: 0, xp: 75, completed: false },
      { id: 'full_tour', name: 'Complete Tour', desc: 'Visit all 8 planets', target: 8, type: 'visit_count', progress: 0, xp: 150, completed: false }
    ];
    
    // Start with 3 random quests
    this.activeQuests = this.quests.slice(0, 3);
  }
  
  initCollectibles() {
    // Scatter gems around the solar system
    for (let i = 0; i < 100; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 550;
      this.collectibles.push({
        x: this.width / 2 + Math.cos(angle) * distance,
        y: this.height / 2 + Math.sin(angle) * distance,
        size: 6 + Math.random() * 4,
        color: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181'][Math.floor(Math.random() * 5)],
        collected: false,
        pulse: Math.random() * Math.PI * 2
      });
    }
    this.gemsCollected = 0;
  }
  
  initFuelStations() {
    // Place fuel stations at strategic locations
    const angles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
    angles.forEach(angle => {
      const distance = 300 + Math.random() * 200;
      this.fuelStations.push({
        x: this.width / 2 + Math.cos(angle) * distance,
        y: this.height / 2 + Math.sin(angle) * distance,
        size: 15,
        pulse: Math.random() * Math.PI * 2
      });
    });
  }
  
  initStars() {
    for (let i = 0; i < 200; i++) {
      this.stars.push({
        x: Math.random() * this.width * 2 - this.width / 2,
        y: Math.random() * this.height * 2 - this.height / 2,
        size: Math.random() * 2 + 0.5,
        brightness: Math.random() * 0.5 + 0.5,
        twinkle: Math.random() * Math.PI * 2
      });
    }
  }
  
  setupInput() {
    document.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      if (e.key === 'q') this.showQuestLog = !this.showQuestLog;
      if (e.key === 'Escape') this.exitGame();
    });
    
    document.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }
  
  update(deltaTime) {
    if (this.paused) return;
    
    this.gameTime += deltaTime;
    
    // Update rocket
    this.updateRocket(deltaTime);
    
    // Update planets (orbit)
    this.updatePlanets(deltaTime);
    
    // Update particles
    this.updateParticles(deltaTime);
    
    // Check collisions
    this.checkCollisions();
    
    // Update UI elements
    this.updateUI(deltaTime);
    
    // Update collectibles
    this.updateCollectibles(deltaTime);
  }
  
  updateRocket(deltaTime) {
    const r = this.rocket;
    
    // Rotation
    if (this.keys['a'] || this.keys['arrowleft']) {
      r.angle -= 0.05;
    }
    if (this.keys['d'] || this.keys['arrowright']) {
      r.angle += 0.05;
    }
    
    // Thrust
    if ((this.keys['w'] || this.keys['arrowup']) && r.fuel > 0) {
      r.vx += Math.cos(r.angle) * r.acceleration;
      r.vy += Math.sin(r.angle) * r.acceleration;
      r.thrust = 1;
      r.fuel -= r.fuelConsumption;
      
      // Achievement check
      if (!this.unlockedAchievements.has('first_flight')) {
        this.unlockAchievement('first_flight');
      }
      
      // Add thrust particles
      this.addThrustParticle();
    } else {
      r.thrust = 0;
    }
    
    // Reverse thrust
    if ((this.keys['s'] || this.keys['arrowdown']) && r.fuel > 0) {
      r.vx -= Math.cos(r.angle) * r.acceleration * 0.5;
      r.vy -= Math.sin(r.angle) * r.acceleration * 0.5;
      r.fuel -= r.fuelConsumption * 0.5;
    }
    
    // Apply friction (space friction for gameplay)
    r.vx *= r.friction;
    r.vy *= r.friction;
    
    // Limit speed
    const speed = Math.sqrt(r.vx * r.vx + r.vy * r.vy);
    if (speed > r.maxSpeed) {
      r.vx = (r.vx / speed) * r.maxSpeed;
      r.vy = (r.vy / speed) * r.maxSpeed;
      
      // Speed demon achievement
      if (!this.unlockedAchievements.has('speed_demon')) {
        this.unlockAchievement('speed_demon');
      }
    }
    
    // Update position
    r.x += r.vx;
    r.y += r.vy;
    
    // Wrap around screen
    if (r.x < -50) r.x = this.width + 50;
    if (r.x > this.width + 50) r.x = -50;
    if (r.y < -50) r.y = this.height + 50;
    if (r.y > this.height + 50) r.y = -50;
  }
  
  updatePlanets(deltaTime) {
    this.planets.forEach(planet => {
      planet.angle += planet.speed;
      planet.x = this.sunX + Math.cos(planet.angle) * planet.distance;
      planet.y = this.sunY + Math.sin(planet.angle) * planet.distance;
    });
  }
  
  addThrustParticle() {
    const r = this.rocket;
    const angle = r.angle + Math.PI + (Math.random() - 0.5) * 0.5;
    this.particles.push({
      x: r.x - Math.cos(r.angle) * 15,
      y: r.y - Math.sin(r.angle) * 15,
      vx: Math.cos(angle) * (2 + Math.random() * 2),
      vy: Math.sin(angle) * (2 + Math.random() * 2),
      life: 1,
      decay: 0.02 + Math.random() * 0.02,
      size: 3 + Math.random() * 3,
      color: Math.random() > 0.5 ? '#ff6b35' : '#ffd700'
    });
  }
  
  updateParticles(deltaTime) {
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      p.size *= 0.95;
      return p.life > 0;
    });
  }
  
  updateCollectibles(deltaTime) {
    this.collectibles.forEach(c => {
      c.pulse += 0.05;
    });
  }
  
  checkCollisions() {
    const r = this.rocket;
    
    // Check planet proximity
    this.nearPlanet = null;
    this.planets.forEach(planet => {
      const dx = r.x - planet.x;
      const dy = r.y - planet.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < planet.size + 30) {
        this.nearPlanet = planet;
        
        // Visit planet
        if (!this.visitedPlanets.has(planet.name)) {
          this.visitPlanet(planet);
        }
      }
    });
    
    // Check collectible collisions
    this.collectibles.forEach(c => {
      if (c.collected) return;
      
      const dx = r.x - c.x;
      const dy = r.y - c.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < r.size + c.size) {
        c.collected = true;
        this.collectGem();
      }
    });
    
    // Check fuel station collisions
    this.fuelStations.forEach(station => {
      const dx = r.x - station.x;
      const dy = r.y - station.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < r.size + station.size && r.fuel < r.maxFuel) {
        r.fuel = Math.min(r.maxFuel, r.fuel + 0.5);
        if (r.fuel >= r.maxFuel) {
          this.showNotification('⛽ Fuel Tank Full!', 'success');
        }
      }
    });
  }
  
  visitPlanet(planet) {
    this.visitedPlanets.add(planet.name);
    this.addXP(15);
    this.showNotification(`🌍 Discovered ${planet.name}!`, 'planet');
    
    // Check achievements
    if (!this.unlockedAchievements.has('explorer')) {
      this.unlockAchievement('explorer');
    }
    
    if (this.visitedPlanets.size >= 4 && !this.unlockedAchievements.has('tourist')) {
      this.unlockAchievement('tourist');
    }
    
    if (this.visitedPlanets.size >= 8 && !this.unlockedAchievements.has('grand_tour')) {
      this.unlockAchievement('grand_tour');
    }
    
    // Update quests
    this.updateQuestProgress('visit', planet.name);
    this.updateQuestProgress('multi_visit', planet.name);
    this.updateQuestProgress('visit_count', this.visitedPlanets.size);
  }
  
  collectGem() {
    this.gemsCollected++;
    this.addXP(5);
    
    // Check achievements
    if (this.gemsCollected >= 10 && !this.unlockedAchievements.has('collector')) {
      this.unlockAchievement('collector');
    }
    if (this.gemsCollected >= 50 && !this.unlockedAchievements.has('hoarder')) {
      this.unlockAchievement('hoarder');
    }
    
    // Update quests
    this.updateQuestProgress('collect', this.gemsCollected);
  }
  
  updateQuestProgress(type, value) {
    this.activeQuests.forEach(quest => {
      if (quest.completed) return;
      
      if (quest.type === type) {
        if (type === 'visit' && quest.target === value) {
          this.completeQuest(quest);
        } else if (type === 'collect' && value >= quest.target) {
          this.completeQuest(quest);
        } else if (type === 'visit_count' && value >= quest.target) {
          this.completeQuest(quest);
        }
      } else if (quest.type === 'multi_visit' && type === 'multi_visit') {
        if (quest.targets.includes(value) && !quest.progress.includes(value)) {
          quest.progress.push(value);
          if (quest.progress.length >= quest.targets.length) {
            this.completeQuest(quest);
          }
        }
      }
    });
  }
  
  completeQuest(quest) {
    quest.completed = true;
    this.completedQuests.add(quest.id);
    this.addXP(quest.xp);
    this.showNotification(`📜 Quest Complete: ${quest.name}!`, 'quest');
    
    // Check quest master achievement
    if (this.completedQuests.size >= 5 && !this.unlockedAchievements.has('quest_master')) {
      this.unlockAchievement('quest_master');
    }
    
    // Add new quest if available
    const availableQuests = this.quests.filter(q => !q.completed && !this.activeQuests.includes(q));
    if (availableQuests.length > 0) {
      this.activeQuests.push(availableQuests[0]);
    }
  }
  
  addXP(amount) {
    this.xp += amount;
    
    // Level up check
    while (this.xp >= this.xpToNextLevel) {
      this.xp -= this.xpToNextLevel;
      this.level++;
      this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);
      this.showNotification(`🎉 Level Up! Now Level ${this.level}`, 'levelup');
      
      // Level achievements
      if (this.level >= 5 && !this.unlockedAchievements.has('level_5')) {
        this.unlockAchievement('level_5');
      }
      if (this.level >= 10 && !this.unlockedAchievements.has('level_10')) {
        this.unlockAchievement('level_10');
      }
    }
  }
  
  unlockAchievement(id) {
    const achievement = this.achievements.find(a => a.id === id);
    if (achievement && !this.unlockedAchievements.has(id)) {
      this.unlockedAchievements.add(id);
      this.addXP(achievement.xp);
      this.showNotification(`${achievement.icon} Achievement: ${achievement.name}!`, 'achievement');
    }
  }
  
  showNotification(text, type) {
    this.notification = { text, type };
    this.notificationTimer = 180; // 3 seconds at 60fps
  }
  
  updateUI(deltaTime) {
    if (this.notificationTimer > 0) {
      this.notificationTimer--;
      if (this.notificationTimer === 0) {
        this.notification = null;
      }
    }
  }
  
  draw() {
    const ctx = this.ctx;
    
    // Clear canvas
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw stars
    this.drawStars();
    
    // Draw orbit paths
    this.drawOrbits();
    
    // Draw sun
    this.drawSun();
    
    // Draw fuel stations
    this.drawFuelStations();
    
    // Draw collectibles
    this.drawCollectibles();
    
    // Draw planets
    this.drawPlanets();
    
    // Draw particles
    this.drawParticles();
    
    // Draw rocket
    this.drawRocket();
    
    // Draw UI
    this.drawUI();
    
    // Draw planet info if near
    if (this.nearPlanet) {
      this.drawPlanetInfo(this.nearPlanet);
    }
    
    // Draw quest log
    if (this.showQuestLog) {
      this.drawQuestLog();
    }
    
    // Draw notification
    if (this.notification) {
      this.drawNotification();
    }
  }
  
  drawStars() {
    const ctx = this.ctx;
    this.stars.forEach(star => {
      star.twinkle += 0.02;
      const brightness = star.brightness * (0.7 + 0.3 * Math.sin(star.twinkle));
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  
  drawOrbits() {
    const ctx = this.ctx;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    this.planets.forEach(planet => {
      ctx.beginPath();
      ctx.arc(this.sunX, this.sunY, planet.distance, 0, Math.PI * 2);
      ctx.stroke();
    });
  }
  
  drawSun() {
    const ctx = this.ctx;
    const pulse = 1 + 0.1 * Math.sin(this.gameTime * 0.05);
    
    // Glow
    const gradient = ctx.createRadialGradient(this.sunX, this.sunY, 0, this.sunX, this.sunY, 60 * pulse);
    gradient.addColorStop(0, 'rgba(255, 200, 50, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 150, 50, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.sunX, this.sunY, 60 * pulse, 0, Math.PI * 2);
    ctx.fill();
    
    // Core
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(this.sunX, this.sunY, 25, 0, Math.PI * 2);
    ctx.fill();
  }
  
  drawFuelStations() {
    const ctx = this.ctx;
    
    this.fuelStations.forEach(station => {
      station.pulse += 0.03;
      const scale = 1 + 0.1 * Math.sin(station.pulse);
      
      // Draw station
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(station.x, station.y, station.size * scale, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw icon
      ctx.fillStyle = '#fff';
      ctx.font = `${12 * scale}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⛽', station.x, station.y);
    });
  }
  
  drawCollectibles() {
    const ctx = this.ctx;
    
    this.collectibles.forEach(c => {
      if (c.collected) return;
      
      const scale = 1 + 0.2 * Math.sin(c.pulse);
      
      // Glow
      ctx.fillStyle = c.color + '40';
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.size * 2 * scale, 0, Math.PI * 2);
      ctx.fill();
      
      // Core
      ctx.fillStyle = c.color;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.size * scale, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  
  drawPlanets() {
    const ctx = this.ctx;
    
    this.planets.forEach(planet => {
      // Glow for visited planets
      if (this.visitedPlanets.has(planet.name)) {
        ctx.fillStyle = 'rgba(100, 255, 100, 0.2)';
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, planet.size + 10, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Planet body
      const gradient = ctx.createRadialGradient(
        planet.x - planet.size * 0.3, planet.y - planet.size * 0.3, 0,
        planet.x, planet.y, planet.size
      );
      gradient.addColorStop(0, planet.color);
      gradient.addColorStop(1, this.darkenColor(planet.color, 0.5));
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Saturn's rings
      if (planet.hasRings) {
        ctx.strokeStyle = 'rgba(244, 213, 158, 0.6)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(planet.x, planet.y, planet.size * 1.8, planet.size * 0.4, 0.3, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Planet name
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(planet.name, planet.x, planet.y + planet.size + 15);
    });
  }
  
  drawParticles() {
    const ctx = this.ctx;
    
    this.particles.forEach(p => {
      ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2, '0');
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  
  drawRocket() {
    const ctx = this.ctx;
    const r = this.rocket;
    
    ctx.save();
    ctx.translate(r.x, r.y);
    ctx.rotate(r.angle + Math.PI / 2);
    
    // Rocket body
    ctx.fillStyle = '#e0e0e0';
    ctx.beginPath();
    ctx.moveTo(0, -r.size);
    ctx.lineTo(-r.size * 0.4, r.size * 0.6);
    ctx.lineTo(r.size * 0.4, r.size * 0.6);
    ctx.closePath();
    ctx.fill();
    
    // Rocket window
    ctx.fillStyle = '#4fc3f7';
    ctx.beginPath();
    ctx.arc(0, -r.size * 0.3, r.size * 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Fins
    ctx.fillStyle = '#f44336';
    ctx.beginPath();
    ctx.moveTo(-r.size * 0.4, r.size * 0.3);
    ctx.lineTo(-r.size * 0.7, r.size * 0.7);
    ctx.lineTo(-r.size * 0.4, r.size * 0.6);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(r.size * 0.4, r.size * 0.3);
    ctx.lineTo(r.size * 0.7, r.size * 0.7);
    ctx.lineTo(r.size * 0.4, r.size * 0.6);
    ctx.closePath();
    ctx.fill();
    
    // Thrust flame
    if (r.thrust > 0) {
      const flameSize = r.size * (0.5 + Math.random() * 0.3);
      const gradient = ctx.createLinearGradient(0, r.size * 0.6, 0, r.size * 0.6 + flameSize);
      gradient.addColorStop(0, '#ffd700');
      gradient.addColorStop(0.5, '#ff6b35');
      gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(-r.size * 0.2, r.size * 0.6);
      ctx.lineTo(0, r.size * 0.6 + flameSize);
      ctx.lineTo(r.size * 0.2, r.size * 0.6);
      ctx.closePath();
      ctx.fill();
    }
    
    ctx.restore();
  }
  
  drawUI() {
    const ctx = this.ctx;
    
    // Top-left: Level and XP
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(10, 10, 200, 70);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Level ${this.level}`, 20, 35);
    
    // XP bar
    ctx.fillStyle = '#333';
    ctx.fillRect(20, 45, 180, 12);
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(20, 45, 180 * (this.xp / this.xpToNextLevel), 12);
    
    ctx.fillStyle = '#aaa';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText(`${this.xp}/${this.xpToNextLevel} XP`, 20, 68);
    
    // Top-right: Stats
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(this.width - 160, 10, 150, 90);
    
    ctx.fillStyle = '#fff';
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`💎 Gems: ${this.gemsCollected}`, this.width - 20, 35);
    ctx.fillText(`🌍 Planets: ${this.visitedPlanets.size}/8`, this.width - 20, 55);
    ctx.fillText(`🏆 Achievements: ${this.unlockedAchievements.size}`, this.width - 20, 75);
    ctx.fillText(`📜 Quests: ${this.completedQuests.size}`, this.width - 20, 95);
    
    // Bottom: Fuel gauge
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(10, this.height - 50, 200, 40);
    
    ctx.fillStyle = '#fff';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('⛽ Fuel', 20, this.height - 30);
    
    ctx.fillStyle = '#333';
    ctx.fillRect(70, this.height - 38, 130, 16);
    
    const fuelPercent = this.rocket.fuel / this.rocket.maxFuel;
    ctx.fillStyle = fuelPercent > 0.3 ? '#4ade80' : fuelPercent > 0.1 ? '#fbbf24' : '#ef4444';
    ctx.fillRect(70, this.height - 38, 130 * fuelPercent, 16);
    
    // Controls hint
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WASD or Arrows to fly | Q: Quests | ESC: Exit', this.width / 2, this.height - 15);
  }
  
  drawPlanetInfo(planet) {
    const ctx = this.ctx;
    const boxWidth = 250;
    const boxHeight = 120;
    const boxX = this.width / 2 - boxWidth / 2;
    const boxY = 100;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    
    ctx.strokeStyle = planet.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🪐 ${planet.name}`, this.width / 2, boxY + 25);
    
    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = '#ccc';
    
    planet.facts.forEach((fact, i) => {
      ctx.fillText(`• ${fact}`, this.width / 2, boxY + 50 + i * 20);
    });
  }
  
  drawQuestLog() {
    const ctx = this.ctx;
    const boxWidth = 300;
    const boxHeight = 200;
    const boxX = this.width / 2 - boxWidth / 2;
    const boxY = this.height / 2 - boxHeight / 2;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📜 Active Quests', this.width / 2, boxY + 30);
    
    ctx.font = '13px Inter, sans-serif';
    ctx.textAlign = 'left';
    
    this.activeQuests.slice(0, 5).forEach((quest, i) => {
      const y = boxY + 60 + i * 28;
      
      if (quest.completed) {
        ctx.fillStyle = '#4ade80';
        ctx.fillText(`✓ ${quest.name}`, boxX + 15, y);
      } else {
        ctx.fillStyle = '#fff';
        ctx.fillText(`○ ${quest.name}`, boxX + 15, y);
        ctx.fillStyle = '#888';
        ctx.font = '11px Inter, sans-serif';
        ctx.fillText(quest.desc, boxX + 25, y + 14);
        ctx.font = '13px Inter, sans-serif';
      }
    });
    
    ctx.fillStyle = '#888';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Press Q to close', this.width / 2, boxY + boxHeight - 15);
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
      success: '#4ade80'
    };
    
    ctx.fillStyle = `rgba(0, 0, 0, ${0.8 * alpha})`;
    ctx.fillRect(this.width / 2 - 180, 60, 360, 40);
    
    ctx.strokeStyle = colors[n.type] || '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.width / 2 - 180, 60, 360, 40);
    
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(n.text, this.width / 2, 85);
  }
  
  darkenColor(hex, factor) {
    const num = parseInt(hex.slice(1), 16);
    const r = Math.floor((num >> 16) * factor);
    const g = Math.floor(((num >> 8) & 0x00FF) * factor);
    const b = Math.floor((num & 0x0000FF) * factor);
    return `rgb(${r}, ${g}, ${b})`;
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
    this.stop();
    document.getElementById('space-game-container').style.display = 'none';
  }
}

// Initialize game when easter egg is triggered
function launchSpaceGame() {
  let container = document.getElementById('space-game-container');
  if (!container) {
    // Create container
    container = document.createElement('div');
    container.id = 'space-game-container';
    container.innerHTML = `
      <canvas id="space-game-canvas"></canvas>
      <button id="exit-game-btn" onclick="window.spaceGame.exitGame()">✕ Exit</button>
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
        background: #0a0a1a;
      }
      #space-game-canvas {
        width: 100%;
        height: 100%;
      }
      #exit-game-btn {
        position: absolute;
        top: 15px;
        right: 15px;
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.3);
        padding: 8px 16px;
        border-radius: 8px;
        cursor: pointer;
        font-family: Inter, sans-serif;
        font-size: 14px;
        z-index: 10001;
      }
      #exit-game-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    `;
    document.head.appendChild(style);
  }
  
  container.style.display = 'block';
  
  const canvas = document.getElementById('space-game-canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  window.spaceGame = new SpaceGame(canvas);
  window.spaceGame.start();
  
  // Show welcome notification
  setTimeout(() => {
    window.spaceGame.showNotification('🚀 Welcome, Space Explorer! Use WASD to fly!', 'success');
  }, 500);
}

// Export for use
window.launchSpaceGame = launchSpaceGame;
