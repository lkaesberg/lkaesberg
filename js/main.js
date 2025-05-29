// Main entry point for the 3D Solar System Portfolio application
import { planets } from './planets.js';
import { Spaceship } from './spaceship.js';
import { UI } from './ui.js';

// Make THREE accessible to other modules
export const THREE = window.THREE;

class SolarSystem {
  constructor() {
    // Core properties
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    // Touch control properties
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchPreviousX = 0;
    this.touchPreviousY = 0;
    this.touchMoved = false;
    this.isPointerDown = false;
    this.isMobile = window.innerWidth < 768;
    
    // Objects and state
    this.planetObjects = {};
    this.labelObjects = {};
    this.sunObject = null;
    this.orbitLines = [];
    this.spaceship = null;
    
    // Camera animation properties
    this.originalCameraPosition = null;
    this.initialCameraPosition = null; // Permanent reference to initial position
    this.targetCameraPosition = new THREE.Vector3();
    this.cameraLookAt = new THREE.Vector3();
    this.animationProgress = 0;
    this.animationDuration = 2; // seconds
    this.followingSpaceship = false; // New property to track camera state
    
    // Initialize UI
    this.ui = new UI();
    this.ui.setPlanetSelectCallback(this.handlePlanetSelect.bind(this));
    this.ui.setReturnToMainCallback(this.returnToMain.bind(this));
    
    // Initialize the 3D scene
    this.init();
  }
  
  // Initialize the 3D scene and all objects
  init() {
    // Create scene
    this.scene = new THREE.Scene();
    
    // Set up camera
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 2000);
    
    // Change camera position from top-down to 45-degree angle
    // Original position was (0, 1000, 0)
    this.camera.position.set(500, 500, 500);
    
    // Set both the original and initial camera positions
    this.originalCameraPosition = this.camera.position.clone();
    this.initialCameraPosition = this.camera.position.clone(); // Never modify this after initialization
    
    this.camera.lookAt(this.scene.position);
    
    // Set up renderer with shadow support
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById("canvas-container").appendChild(this.renderer.domElement);
    
    // Add lights
    this.addLights();
    
    // Create scene objects with animations
    this.createStars();
    this.createSun();
    planets.forEach(this.createPlanet.bind(this));
    this.createOrbitLines();
    
    // Add event listeners
    window.addEventListener("resize", this.onWindowResize.bind(this));
    window.addEventListener("mousemove", this.onMouseMove.bind(this));
    window.addEventListener("click", this.onMouseClick.bind(this));
    
    // Add touch event listeners for mobile
    window.addEventListener("touchstart", this.onTouchStart.bind(this), { passive: false });
    window.addEventListener("touchmove", this.onTouchMove.bind(this), { passive: false });
    window.addEventListener("touchend", this.onTouchEnd.bind(this), { passive: false });
    
    // Add pointer events for unified mouse/touch handling
    window.addEventListener("pointerdown", this.onPointerDown.bind(this));
    window.addEventListener("pointerup", this.onPointerUp.bind(this));
    window.addEventListener("pointercancel", this.onPointerUp.bind(this));
    
    // Create spaceship
    this.spaceship = new Spaceship(this.scene, this.planetObjects);
    
    // Start animation loop
    this.animate();
    
    // Add fade-in animations to UI elements with staggered delays
    this.animateUIElements();
    
    // Update mobile state on resize
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 768;
      this.onWindowResize();
    });
  }
  
  // Add scene lighting
  addLights() {
    const ambientLight = new THREE.AmbientLight(0x333333);
    this.scene.add(ambientLight);
    
    // Sun directional light (main shadow caster)
    this.sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    this.sunLight.position.set(0, 0, 0); // Position at the sun
    this.sunLight.castShadow = true;
    
    // Create a target for the sun light
    this.sunLightTarget = new THREE.Object3D();
    this.sunLightTarget.position.set(0, 0, -1); // Light pointing in -z direction initially
    this.scene.add(this.sunLightTarget);
    this.sunLight.target = this.sunLightTarget;
    
    // Configure shadow properties
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 1000;
    this.sunLight.shadow.camera.left = -500;
    this.sunLight.shadow.camera.right = 500;
    this.sunLight.shadow.camera.top = 500;
    this.sunLight.shadow.camera.bottom = -500;
    
    this.scene.add(this.sunLight);
    
    // Soft point light at sun position (for general illumination)
    const sunPointLight = new THREE.PointLight(0xffcc00, 1.5, 1000);
    this.scene.add(sunPointLight);
  }
  
  // Create starfield background
  createStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 2000;
      positions[i3 + 1] = (Math.random() - 0.5) * 2000;
      positions[i3 + 2] = (Math.random() - 0.5) * 2000;
    }
    
    starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1,
      transparent: true,
      opacity: 0, // Start with opacity 0
      sizeAttenuation: true,
    });
    
    const stars = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(stars);
    
    // Animate stars appearance
    this.animateStarsEntrance(stars, starMaterial);
  }
  
  // Animate stars appearance
  animateStarsEntrance(stars, material) {
    const duration = 3000; // milliseconds
    const startTime = performance.now();
    
    const animate = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Fade in the stars
      material.opacity = progress;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  // Create the sun
  createSun() {
    const sunGeometry = new THREE.SphereGeometry(36, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({
      color: 0xffcc00,
      transparent: true,
      opacity: 0,
    });
    
    this.sunObject = new THREE.Mesh(sunGeometry, sunMaterial);
    this.scene.add(this.sunObject);
    
    // Add sun glow
    const sunGlowGeometry = new THREE.SphereGeometry(50, 32, 32);
    const sunGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffcc00,
      transparent: true,
      opacity: 0,
    });
    
    const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
    this.scene.add(sunGlow);
    
    // Create shader-based night side shader for planets
    this.createPlanetShaders();
    
    // Animate sun appearance
    this.animateSunEntrance(this.sunObject, sunMaterial, sunGlow, sunGlowMaterial);
  }
  
  // Animate sun appearance
  animateSunEntrance(sun, sunMaterial, glow, glowMaterial) {
    const duration = 2000; // milliseconds
    const startTime = performance.now();
    
    const animate = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease in-out function for smooth animation
      const easeProgress = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      // Gradually increase opacity
      sunMaterial.opacity = easeProgress * 0.9; // max opacity 0.9
      glowMaterial.opacity = easeProgress * 0.3; // max opacity 0.3
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  // Create custom shaders for planet day/night sides
  createPlanetShaders() {
    // Planet shader to create a dark side based on sun direction
    this.planetShader = {
      uniforms: {
        lightDirection: { value: new THREE.Vector3(1, 0, 0) }, // Direction from planet to sun
        dayTexture: { value: null },
        nightIntensity: { value: 0.15 } // How dark the night side is
      },
      vertexShader: `
        uniform vec3 lightDirection;
        varying vec3 vNormal;
        varying vec2 vUv;
        varying float vDiffuse;
        
        void main() {
          // Transform the normal to view space
          vNormal = normalize(normalMatrix * normal);
          
          // Pass UV coordinates
          vUv = uv;
          
          // Pre-calculate diffuse lighting in vertex shader
          // Transform light direction to view space
          vec3 viewLightDirection = normalize(normalMatrix * lightDirection);
          
          // Calculate diffuse lighting term
          vDiffuse = max(0.0, dot(vNormal, viewLightDirection));
          
          // Standard vertex transformation
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D dayTexture;
        uniform float nightIntensity;
        
        varying vec3 vNormal;
        varying vec2 vUv;
        varying float vDiffuse;
        
        void main() {
          // Sample the day texture
          vec4 dayColor = texture2D(dayTexture, vUv);
          
          // Create darker version for night side
          vec4 nightColor = dayColor * nightIntensity;
          
          // Smooth transition between day and night sides
          float transition = 0.2; // Width of twilight zone
          float dayWeight = smoothstep(0.0, transition, vDiffuse);
          
          // Final color is blend between night and day based on diffuse term
          gl_FragColor = mix(nightColor, dayColor, dayWeight);
        }
      `
    };
  }
  
  // Create a planet from planet data
  createPlanet(planetData) {
    const planetGeometry = new THREE.SphereGeometry(planetData.size, 32, 32);
    
    // Create texture or use provided one
    const texture = planetData.textureUrl ? 
      new THREE.TextureLoader().load(planetData.textureUrl) :
      this.createPlanetTexture(planetData.name);
    
    let planetMaterial;
    
    if (planetData.name !== "Sun") {
      // Use custom shader material for planets to implement day-night shading
      planetMaterial = new THREE.ShaderMaterial({
        uniforms: {
          lightDirection: { value: new THREE.Vector3(1, 0, 0) }, // Default light direction
          dayTexture: { value: texture },
          nightIntensity: { value: 0.15 }
        },
        vertexShader: this.planetShader.vertexShader,
        fragmentShader: this.planetShader.fragmentShader
      });
    } else {
      // Regular material for Sun
      planetMaterial = new THREE.MeshLambertMaterial({ map: texture });
    }
    
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    
    // Enable shadow casting and receiving
    planet.castShadow = true;
    planet.receiveShadow = true;
    
    // Add atmospheric glow if defined and planet should have an atmosphere
    if (planetData.atmosphereColor && planetData.name === "Earth") {
      const atmosphereSize = planetData.size * 1.2;
      const atmosphereGeometry = new THREE.SphereGeometry(atmosphereSize, 32, 32);
      const atmosphereMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(planetData.atmosphereColor),
        transparent: true,
        opacity: 0.3,
        side: THREE.BackSide,
      });
      
      const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
      planet.add(atmosphere);
    }
    
    // Add invisible hit area for better interaction
    // Scale based on planet size to ensure proper clickability
    const hitSize = Math.max(planetData.size * 2, 20); // Minimum hit size of 20 units
    const hitGeometry = new THREE.SphereGeometry(hitSize, 16, 16);
    const hitMaterial = new THREE.MeshBasicMaterial({
      transparent: true, 
      opacity: 0,
      depthWrite: false, // Prevent writing to depth buffer
      alphaTest: 0.01 // Discard pixels with very low alpha
    });
    
    const hitMesh = new THREE.Mesh(hitGeometry, hitMaterial);
    hitMesh.visible = true;
    planet.add(hitMesh);
    
    // Set initial position at a random angle around the orbit
    // Using a more distributed approach to avoid planets clustering
    const angleOffset = Object.keys(this.planetObjects).length * (Math.PI * 0.25);
    const angle = angleOffset + (Math.random() * Math.PI * 0.5);
    const x = Math.cos(angle) * planetData.distance;
    const z = Math.sin(angle) * planetData.distance;
    planet.position.set(x, 0, z);
    
    // Set initial scale to 0 for animation
    planet.scale.set(0.01, 0.01, 0.01);
    
    this.scene.add(planet);
    
    // Store planet data for reference
    this.planetObjects[planetData.name] = {
      mesh: planet,
      data: planetData,
      angle: angle,
      hitMesh: hitMesh,
    };
    
    // Add Saturn-style rings if specified
    if (planetData.hasRing) {
      const ringSize = planetData.ringSize || 1.5;
      const ringGeometry = new THREE.RingGeometry(
        planetData.size + 2, // Inner radius
        planetData.size * ringSize, // Outer radius
        64 // Segments
      );
      
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      planet.add(ring);
    }
    
    // Create label for the planet
    this.createPlanetLabel(planetData);
    
    // Animate the planet appearance with a delay based on its distance
    const animationDelay = 500 + planetData.distance * 1.5;
    setTimeout(() => {
      // Animate scale from 0 to 1
      this.animatePlanetEntrance(planet);
    }, animationDelay);
  }
  
  // Animate planet appearance
  animatePlanetEntrance(planet) {
    const duration = 1500; // milliseconds
    const startTime = performance.now();
    
    const animate = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease in-out function for smooth animation
      const easeProgress = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      // Scale from 0.01 to 1
      const scale = 0.01 + easeProgress * 0.99;
      planet.scale.set(scale, scale, scale);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  // Create visual label for planet
  createPlanetLabel(planetData) {
    // Create UI planet label
    const labelDiv = document.createElement('div');
    labelDiv.className = 'planet-label';
    labelDiv.textContent = planetData.name;
    labelDiv.dataset.planet = planetData.name;
    labelDiv.dataset.label = planetData.name;
    document.body.appendChild(labelDiv);
    
    // Store the DOM element reference
    this.labelObjects[planetData.name + "DOM"] = labelDiv;
  }
  
  // Create orbit lines for planets
  createOrbitLines() {
    planets.forEach((planetData, index) => {
      const orbitGeometry = new THREE.BufferGeometry();
      const vertices = [];
      const segments = 100;
      
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = Math.cos(angle) * planetData.distance;
        const z = Math.sin(angle) * planetData.distance;
        vertices.push(new THREE.Vector3(x, 0, z));
      }
      
      orbitGeometry.setFromPoints(vertices);
      
      const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0, // Start with opacity 0
        linewidth: 1.5,
      });
      
      const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
      this.scene.add(orbit);
      this.orbitLines.push(orbit);
      
      // Animate orbit line appearance with staggered delay
      const delay = 300 + index * 150;
      setTimeout(() => {
        this.animateOrbitEntrance(orbit, orbitMaterial);
      }, delay);
    });
  }
  
  // Animate orbit line appearance
  animateOrbitEntrance(orbit, material) {
    const duration = 1000; // milliseconds
    const startTime = performance.now();
    
    const animate = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Fade in the orbit line
      material.opacity = progress * 0.18; // max opacity 0.18
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  // Create a unique texture for each planet
  createPlanetTexture(planetName) {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    
    if (planetName === "Mercury") {
      let gradient = ctx.createRadialGradient(size/2, size/2, 30, size/2, size/2, size/2);
      gradient.addColorStop(0, "#AAAAAA");
      gradient.addColorStop(1, "#555555");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      
      for (let i = 0; i < 120; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = Math.random() * 8;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fill();
      }
    } else if (planetName === "Venus") {
      let gradient = ctx.createRadialGradient(size/2, size/2, 20, size/2, size/2, size/2);
      gradient.addColorStop(0, "#E6D2AF");
      gradient.addColorStop(1, "#D19E70");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      
      for (let i = 0; i < 90; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = Math.random() * 15;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.fill();
      }
    } else if (planetName === "Earth") {
      let gradient = ctx.createRadialGradient(size/2, size/2, 20, size/2, size/2, size/2);
      gradient.addColorStop(0, "#2A5D9F");
      gradient.addColorStop(1, "#1A3D6E");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      
      ctx.fillStyle = "rgba(34,139,34,0.8)";
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        const startX = Math.random() * size;
        const startY = Math.random() * size;
        ctx.moveTo(startX, startY);
        
        for (let j = 0; j < 8; j++) {
          const x = startX + (Math.random()-0.5) * 80;
          const y = startY + (Math.random()-0.5) * 80;
          ctx.lineTo(x, y);
        }
        
        ctx.closePath();
        ctx.fill();
      }
    } else if (planetName === "Mars") {
      let gradient = ctx.createRadialGradient(size/2, size/2, 20, size/2, size/2, size/2);
      gradient.addColorStop(0, "#D26E3E");
      gradient.addColorStop(1, "#8B3A1C");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      
      for (let i = 0; i < 120; i++){
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = Math.random() * 4;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.15)";
        ctx.fill();
      }
    } else if (planetName === "Jupiter") {
      ctx.fillStyle = "#D8A77D";
      ctx.fillRect(0, 0, size, size);
      
      for (let i = 0; i < 10; i++){
        const bandY = i * size/10;
        ctx.fillStyle = (i % 2 === 0) ? "rgba(210,150,100,0.55)" : "rgba(160,110,70,0.55)";
        ctx.fillRect(0, bandY, size, size/10);
      }
      
      ctx.beginPath();
      ctx.ellipse(180, 140, 30, 20, 0.3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(200,80,50,0.8)";
      ctx.fill();
    } else if (planetName === "Saturn") {
      let gradient = ctx.createRadialGradient(size/2, size/2, 20, size/2, size/2, size/2);
      gradient.addColorStop(0, "#F0E4B4");
      gradient.addColorStop(1, "#C2A969");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      
      for (let i = 0; i < 6; i++){
        ctx.fillStyle = "rgba(0,0,0,0.15)";
        ctx.fillRect(0, i*size/6, size, size/12);
      }
    } else if (planetName === "Uranus") {
      let gradient = ctx.createRadialGradient(size/2, size/2, 20, size/2, size/2, size/2);
      gradient.addColorStop(0, "#99DFF0");
      gradient.addColorStop(1, "#66B8D0");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      for (let i = 0; i < 10; i++){
        ctx.beginPath();
        let startX = 0;
        let startY = Math.random() * size;
        ctx.moveTo(startX, startY);
        
        for (let j = 0; j < 5; j++){
          const x = (j+1) * 50;
          const y = startY + Math.sin(j + Math.random()) * 10;
          ctx.lineTo(x, y);
        }
        
        ctx.stroke();
      }
    } else if (planetName === "Neptune") {
      let gradient = ctx.createRadialGradient(size/2, size/2, 20, size/2, size/2, size/2);
      gradient.addColorStop(0, "#2E66A6");
      gradient.addColorStop(1, "#1A3E70");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      
      for (let i = 0; i < 60; i++){
        ctx.beginPath();
        const startX = Math.random() * size;
        const startY = Math.random() * size;
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(startX+20, startY-20, startX+40, startY);
        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
    
    return new THREE.CanvasTexture(canvas);
  }
  
  // Update planet positions in orbit
  updatePlanetPositions() {
    Object.keys(this.planetObjects).forEach((planetName) => {
      const planetObj = this.planetObjects[planetName];
      
      // Update planet angle based on speed
      planetObj.angle += planetObj.data.speed * (this.ui.getIsZoomed() ? 0.2 : 1);
      if (planetObj.angle > Math.PI * 2) planetObj.angle -= Math.PI * 2;
      
      // Calculate new position
      const x = Math.cos(planetObj.angle) * planetObj.data.distance;
      const z = Math.sin(planetObj.angle) * planetObj.data.distance;
      planetObj.mesh.position.set(x, 0, z);
      
      // Rotate the planet on its axis (around Y-axis)
      planetObj.mesh.rotation.y += 0.005 * planetObj.data.speed;
      
      // Update light direction for shader to create day/night effect
      if (planetObj.mesh.material.type === "ShaderMaterial") {
        // Calculate vector from planet to sun (at origin)
        const planetToSun = new THREE.Vector3(0, 0, 0).sub(planetObj.mesh.position).normalize();
        
        // Update shader uniform with this direction
        planetObj.mesh.material.uniforms.lightDirection.value.copy(planetToSun);
      }
      
      // Handle glow effect based on material type
      if (planetObj.mesh.material.type === "MeshLambertMaterial" && planetObj.mesh.material.emissive) {
        // Remove any glow effect from all planets
        planetObj.mesh.material.emissive.setHex(0x000000);
        planetObj.mesh.material.emissiveIntensity = 0;
      }
      
      // If we're zoomed to this planet, update camera target
      if (this.ui.getIsZoomed() && planetName === this.ui.getTargetPlanet()) {
        this.targetCameraPosition.set(x * 0.8, planetObj.data.size * 8, z * 0.8);
        this.cameraLookAt.set(x, 0, z);
        
        // Update content panel position
        const worldPos = planetObj.mesh.position.clone();
        const projected = worldPos.clone().project(this.camera);
        const sx = (projected.x * 0.5 + 0.5) * window.innerWidth;
        const sy = (-projected.y * 0.5 + 0.5) * window.innerHeight;
        const planetScreenRadius = (planetObj.data.size / worldPos.distanceTo(this.camera.position)) * 300;
        
        this.ui.updateContentPanelPosition({ x: sx, y: sy }, planetScreenRadius);
      }
    });
  }
  
  // Handle planet selection from UI
  handlePlanetSelect(planetName) {
    // Store the active planet
    this.activePlanet = planetName;
    
    // If we're already zoomed in and selecting a different planet
    if (this.ui.getIsZoomed() && planetName !== this.ui.getTargetPlanet()) {
      // First return to main view temporarily
      this.returnToMainWithoutAnimation();
      
      // Then launch the spaceship to the new planet after a short delay
      setTimeout(() => {
        if (planetName !== this.spaceship.getHomePlanet()) {
          // Launch the spaceship to the target planet
          this.ui.showSpaceshipAlert(`Launching to ${planetName}...`);
          this.spaceship.flyTo(planetName);
          // Set camera to follow spaceship
          this.followingSpaceship = true;
          // Store original camera position for returning later
          this.originalCameraPosition = this.camera.position.clone();
          this.originalCameraTarget = this.scene.position.clone();
          // Reset animation progress
          this.animationProgress = 0;
        } else {
          // We're already at this planet, just zoom in
          this.zoomToPlanet(planetName);
        }
      }, 50);
      return;
    }
    
    // If we're not already at the selected planet, fly there
    if (planetName !== this.spaceship.getHomePlanet() && !this.spaceship.isFlying()) {
      // Launch the spaceship to the target planet
      this.ui.showSpaceshipAlert(`Launching to ${planetName}...`);
      this.spaceship.flyTo(planetName);
      // Set camera to follow spaceship
      this.followingSpaceship = true;
      // Store original camera position for returning later
      this.originalCameraPosition = this.camera.position.clone();
      this.originalCameraTarget = this.scene.position.clone();
      // Reset animation progress
      this.animationProgress = 0;
    } else if (planetName === this.spaceship.getHomePlanet()) {
      // We're already at this planet, just zoom in
      this.zoomToPlanet(planetName);
    }
  }
  
  // Special version of returnToMain that doesn't animate the camera
  // Used for quickly switching between planets
  returnToMainWithoutAnimation() {
    const targetPlanet = this.ui.getTargetPlanet();
    
    if (targetPlanet) {
      // Show label again
      const label = this.labelObjects[targetPlanet];
      if (label) label.visible = true;
      
      const labelLine = this.labelObjects[targetPlanet + "Line"];
      if (labelLine) labelLine.visible = true;
    }
    
    // Clean up planetary effects
    if (this.planetaryEffects) {
      this.scene.remove(this.planetaryEffects);
      this.planetaryEffects = null;
    }
    
    // Reset UI state without animation
    this.ui.returnToMain();
    
    // No camera animation here, as this is just for temporary state
    // We don't move the camera back to the initial position
  }
  
  // Zoom camera to a specific planet
  zoomToPlanet(planetName) {
    // Remove the check that prevents zooming when already zoomed
    // This allows switching between planets directly
    
    const planetObj = this.planetObjects[planetName];
    if (!planetObj) return;
    
    // Get planet data and position
    const planetData = planetObj.data;
    const planetPosition = planetObj.mesh.position.clone();
    
    // Show content panel
    this.ui.showPlanetContent(planetName, planetData);
    
    // Hide all planet labels when zoomed in
    Object.keys(this.labelObjects).forEach(key => {
      if (key.endsWith("DOM")) {
        const labelDiv = this.labelObjects[key];
        if (labelDiv) {
          labelDiv.style.display = 'none';
        }
      }
    });
    
    // Store original camera position for returning later
    // Use current position, NOT the initialCameraPosition
    this.originalCameraPosition = this.camera.position.clone();
    this.originalCameraTarget = this.scene.position.clone();
    
    // Reset animation progress
    this.animationProgress = 0;
    
    // SIMPLIFIED APPROACH: Fixed offset from planet position
    // This ensures we're looking at the planet from a consistent angle
    
    // Calculate distance based on planet size (much larger than before)
    const baseDistance = 250;
    const planetSizeFactor = Math.max(1, planetData.size / 10); // Ensure minimum factor of 1
    
    // For planets with rings, position farther out
    const ringFactor = planetData.hasRing ? 1.5 : 1;
    
    // Target camera position: top-right-back of planet
    this.targetCameraPosition = new THREE.Vector3(
      planetPosition.x + baseDistance * planetSizeFactor * ringFactor,
      planetPosition.y + baseDistance * 0.7,
      planetPosition.z + baseDistance * planetSizeFactor * ringFactor
    );
    
    // Target to look at (the planet)
    this.cameraLookAt = planetPosition;
    
    // Store planet reference for particle tracking
    this.zoomTargetPlanet = planetName;
    this.zoomTargetPosition = planetPosition.clone();
    
    // Add particles around the planet
    this.addPlanetaryEnvironment(planetName, planetPosition, planetData);
  }
  
  // Add environmental effects around a planet
  addPlanetaryEnvironment(planetName, position, planetData) {
    // Clean up any existing effects
    if (this.planetaryEffects) {
      this.scene.remove(this.planetaryEffects);
    }
    
    // Create a group for all effects
    this.planetaryEffects = new THREE.Group();
    this.scene.add(this.planetaryEffects);
    
    // Use planet-specific parameters
    const size = planetData.size;
    const planetColor = new THREE.Color(planetData.color);
    
    // Add simple particles around the planet
    const particleCount = 100;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    
    // Create simple orbital distribution
    const distributionRadius = size * 3;
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Simple orbital particles
      const angle = Math.random() * Math.PI * 2;
      const radius = distributionRadius * (0.8 + Math.random() * 0.5);
      const height = (Math.random() - 0.5) * size;
      
      // Store the local position (relative to planet center)
      // This way we can update them to follow the planet
      particlePositions[i3] = Math.cos(angle) * radius;
      particlePositions[i3 + 1] = height;
      particlePositions[i3 + 2] = Math.sin(angle) * radius;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 1.0,
      transparent: true,
      opacity: 0.5,
      color: planetColor,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    
    // Instead of setting the global position, make the particles a child of the planet group
    // This will make them automatically follow the planet
    this.planetaryEffects.add(particles);
    
    // Store reference to the planet for positioning
    this.planetaryEffects.userData = {
      targetPlanet: planetName,
      localPositions: particlePositions.slice(),
      rotationSpeed: 0.001
    };
  }
  
  // Return to main solar system view
  returnToMain() {
    // Clear the active planet
    this.activePlanet = null;
    
    // Hide content panel
    this.ui.hideContentPanel();
    
    const targetPlanet = this.ui.getTargetPlanet();
    
    // Restore all planet labels
    Object.keys(this.labelObjects).forEach(key => {
      if (key.endsWith("DOM")) {
        const labelDiv = this.labelObjects[key];
        if (labelDiv) {
          labelDiv.style.display = 'block';
        }
      }
    });
    
    // Clean up planetary effects
    if (this.planetaryEffects) {
      this.scene.remove(this.planetaryEffects);
      this.planetaryEffects = null;
    }
    
    // Stop following spaceship if we were
    this.followingSpaceship = false;
    
    // Start camera return animation
    this.animationProgress = 0;
    this.ui.returnToMain();
    
    // IMPORTANT: Always use the initialCameraPosition when returning to main view
    // This ensures we go back to the same fixed position every time
    const currentPosition = this.camera.position.clone();
    const animateReturn = () => {
      if (this.animationProgress < this.animationDuration) {
        this.animationProgress += 0.02;
        const t = Math.min(this.animationProgress / this.animationDuration, 1);
        // Use initialCameraPosition instead of originalCameraPosition
        this.camera.position.lerpVectors(currentPosition, this.initialCameraPosition, t);
        this.camera.lookAt(this.scene.position);
        requestAnimationFrame(animateReturn);
      } else {
        // Use initialCameraPosition instead of originalCameraPosition
        this.camera.position.copy(this.initialCameraPosition);
        this.camera.lookAt(this.scene.position);
      }
    };
    
    animateReturn();
  }
  
  // Window resize handler
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Update planet labels positions
    this.updateLabelsPosition();
  }
  
  // Mouse move handler for hover effects
  onMouseMove(event) {
    // Skip if we're in touch mode
    if (this.isPointerDown && this.isMobile) {
      return;
    }
    
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    const allHitMeshes = Object.values(this.planetObjects).map(obj => obj.hitMesh);
    const intersects = this.raycaster.intersectObjects(allHitMeshes, true);
    
    if (intersects.length > 0) {
      document.body.style.cursor = "pointer";
      const hoveredPlanetMesh = intersects[0].object.parent;
      const hoveredPlanetObj = Object.values(this.planetObjects)
        .find(p => p.mesh === hoveredPlanetMesh);
      
      if (hoveredPlanetObj) {
        this.ui.showPlanetTooltip(
          hoveredPlanetObj.data.title, 
          event.clientX, 
          event.clientY
        );
      }
    } else {
      document.body.style.cursor = "auto";
      this.ui.hidePlanetTooltip();
    }
  }
  
  // Mouse click handler
  onMouseClick(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    const allHitMeshes = Object.values(this.planetObjects).map(obj => obj.hitMesh);
    const intersects = this.raycaster.intersectObjects(allHitMeshes, true);
    
    if (intersects.length > 0) {
      const clickedPlanetMesh = intersects[0].object.parent;
      const clickedPlanet = Object.values(this.planetObjects)
        .find(obj => obj.mesh === clickedPlanetMesh);
      
      if (clickedPlanet) {
        const planetName = clickedPlanet.data.name;
        
        // If the clicked planet is not the current home planet and we're not already flying
        if (planetName !== this.spaceship.getHomePlanet() && !this.spaceship.isFlying()) {
          // Launch the spaceship directly
          this.ui.showSpaceshipAlert(`Launching to ${planetName}...`);
          this.spaceship.flyTo(planetName);
          
          // Set camera to follow spaceship
          this.followingSpaceship = true;
          this.originalCameraPosition = this.camera.position.clone();
          this.originalCameraTarget = this.scene.position.clone();
          this.animationProgress = 0;
        } 
        // If we're already at this planet, zoom in to view details
        else if (planetName === this.spaceship.getHomePlanet() && !this.ui.getIsZoomed()) {
          this.zoomToPlanet(planetName);
        }
        // If we're already zoomed in and click a different planet, navigate between planets
        else if (this.ui.getIsZoomed() && planetName !== this.ui.getTargetPlanet()) {
          // Clear current view
          this.returnToMainWithoutAnimation();
          
          // If it's the current home planet, just zoom to it
          if (planetName === this.spaceship.getHomePlanet()) {
            setTimeout(() => {
              this.zoomToPlanet(planetName);
            }, 50);
          } 
          // Otherwise, fly to the new planet
          else {
            setTimeout(() => {
              this.ui.showSpaceshipAlert(`Launching to ${planetName}...`);
              this.spaceship.flyTo(planetName);
              this.followingSpaceship = true;
              this.originalCameraPosition = this.camera.position.clone();
              this.originalCameraTarget = this.scene.position.clone();
              this.animationProgress = 0;
            }, 50);
          }
        }
      }
    }
  }
  
  // Main animation loop
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    // Rotate sun
    if (this.sunObject) {
      this.sunObject.rotation.y += 0.002;
    }
    
    // Update sun light position and direction for all planets
    if (this.sunLight && this.sunLightTarget) {
      // Set light to cast from directly above the orbital plane
      // This gives a clear shadow direction consistent with expectations
      this.sunLight.position.set(0, 200, 0);
      this.sunLightTarget.position.set(0, 0, 0);
      
      // Update the target's world matrix to ensure light direction is updated
      this.sunLightTarget.updateMatrixWorld();
      
      // Update shadow camera for better coverage
      const shadowSize = 500;
      this.sunLight.shadow.camera.left = -shadowSize;
      this.sunLight.shadow.camera.right = shadowSize;
      this.sunLight.shadow.camera.top = shadowSize;
      this.sunLight.shadow.camera.bottom = -shadowSize;
      
      // If zoomed to a planet, adjust shadow camera for that planet
      if (this.ui.getIsZoomed() && this.ui.getTargetPlanet()) {
        const targetPlanet = this.planetObjects[this.ui.getTargetPlanet()];
        if (targetPlanet) {
          // Focus shadows on the zoomed planet
          const planetPos = targetPlanet.mesh.position;
          const size = targetPlanet.data.size * 8;
          
          // Position the light above the planet
          this.sunLight.position.set(
            planetPos.x, 
            100, 
            planetPos.z
          );
          
          // Point the light at the planet
          this.sunLightTarget.position.copy(planetPos);
          
          // Update shadow camera size for this planet
          this.sunLight.shadow.camera.left = -size;
          this.sunLight.shadow.camera.right = size;
          this.sunLight.shadow.camera.top = size;
          this.sunLight.shadow.camera.bottom = -size;
        }
      }
      
      // Always update projection after changing camera properties
      this.sunLight.shadow.camera.updateProjectionMatrix();
    }
    
    // Update planet positions
    this.updatePlanetPositions();
    
    // Update planet labels
    this.updateLabelsPosition();
    
    // Update camera during zoom animation
    if (this.ui.getIsZoomed() && this.ui.getTargetPlanet()) {
      // Get current planet position (it may have moved since zoom started)
      const planetObj = this.planetObjects[this.ui.getTargetPlanet()];
      if (planetObj) {
        const currentPlanetPos = planetObj.mesh.position;
        
        // Update target to look at (follow the planet)
        this.cameraLookAt.copy(currentPlanetPos);
        
        // Progress the animation
        this.animationProgress += 0.01;
        const t = Math.min(this.animationProgress / this.animationDuration, 1);
        
        if (this.animationProgress < this.animationDuration) {
          // Initial zoom animation
          this.camera.position.lerpVectors(this.originalCameraPosition, this.targetCameraPosition, t);
        }
        
        // Always look at the current planet position
        this.camera.lookAt(this.cameraLookAt);
        
        // Update particle effects to follow the planet
        if (this.planetaryEffects) {
          // Update the entire particle system position to match the planet
          this.planetaryEffects.position.copy(currentPlanetPos);
          
          // Rotate the particles around the planet
          const particles = this.planetaryEffects.children[0];
          if (particles && particles instanceof THREE.Points) {
            particles.rotation.y += 0.001;
          }
        }
      }
    }
    
    // Update spaceship
    const shipStatus = this.spaceship.update();
    
    // Camera follows spaceship during flight
    if (this.followingSpaceship && this.spaceship.isFlying()) {
      const trackingInfo = this.spaceship.getCameraTrackingInfo();
      
      if (trackingInfo) {
        // Get target planet information
        const targetPlanetName = trackingInfo.targetPlanet;
        const targetPlanetObj = this.planetObjects[targetPlanetName];
        const shipPosition = trackingInfo.shipPosition;
        
        if (targetPlanetObj) {
          const planetPosition = targetPlanetObj.mesh.position.clone();
          const planetSize = targetPlanetObj.data.size;
          
          // Calculate vector from ship to planet
          const shipToPlanet = new THREE.Vector3().subVectors(planetPosition, shipPosition);
          const distanceToPlanet = shipToPlanet.length();
          const normalizedDirection = shipToPlanet.clone().normalize();
          
          // Progress affects how we position the camera
          const flightProgress = trackingInfo.flightProgress;
          
          // Simplified camera position calculation:
          // Position the camera to show both ship and target planet
          let cameraOffset;
          
          if (flightProgress < 0.85) {
            // During most of the flight: position to see both ship and planet
            // Calculate a position above and behind the ship, facing the planet
            cameraOffset = new THREE.Vector3();
            cameraOffset.copy(normalizedDirection).multiplyScalar(-30); // Behind ship
            cameraOffset.y += 20; // Above ship
            
            // Add some side offset for a better view
            const up = new THREE.Vector3(0, 1, 0);
            const side = new THREE.Vector3().crossVectors(normalizedDirection, up).normalize();
            cameraOffset.add(side.multiplyScalar(20));
            
            // Camera position = ship position + offset
            this.camera.position.copy(shipPosition).add(cameraOffset);
            
            // IMPORTANT: Always look directly at the target planet (not the sun)
            this.camera.lookAt(planetPosition);
          } else {
            // Near end of flight: transition to planet view
            const planetViewingDistance = planetSize * 5;
            const ringFactor = targetPlanetObj.data.hasRing ? 1.5 : 1;
            
            // Calculate a good position for viewing the planet
            const idealPosition = new THREE.Vector3(
              planetPosition.x + planetSize * 2 * ringFactor,
              planetPosition.y + planetSize * 2,
              planetPosition.z + planetSize * 2 * ringFactor
            );
            
            // Blend factor increases as we approach the planet
            const blendFactor = (flightProgress - 0.85) / 0.15;
            
            // Blend between ship-relative camera and planet-viewing camera
            this.camera.position.lerp(idealPosition, blendFactor);
            
            // Always keep looking at the planet
            this.camera.lookAt(planetPosition);
          }
        } else {
          // Fallback if planet not found
          this.camera.position.copy(shipPosition).add(new THREE.Vector3(0, 20, -30));
          this.camera.lookAt(shipPosition);
        }
      }
    }
    
    // If spaceship arrived at a planet, zoom to it and stop following
    if (shipStatus.arrived) {
      this.followingSpaceship = false;
      this.zoomToPlanet(shipStatus.planet);
    }
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
  }
  
  // Animate UI elements with staggered delays
  animateUIElements() {
    // Find all UI elements with the fade-in-element class
    const fadeElements = document.querySelectorAll('.fade-in-element');
    
    // Animate each element with a staggered delay
    fadeElements.forEach((element, index) => {
      element.style.animationDelay = `${300 + index * 200}ms`;
    });
    
    // Add staggered animation to nav items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((item, index) => {
      item.style.animationDelay = `${1000 + index * 100}ms`;
    });
  }
  
  // Add a new method to update label positions
  updateLabelsPosition() {
    planets.forEach(planetData => {
      const planet = this.planetObjects[planetData.name];
      const labelDiv = this.labelObjects[planetData.name + "DOM"];
      
      if (planet && labelDiv) {
        // Get screen position for the planet
        const planetPos = planet.mesh.position.clone();
        planetPos.project(this.camera);
        
        // Convert to screen coordinates
        const x = (planetPos.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-planetPos.y * 0.5 + 0.5) * window.innerHeight - 40; // Offset above planet
        
        // Update DOM label position
        labelDiv.style.left = `${x}px`;
        labelDiv.style.top = `${y}px`;
        
        // Show label only if planet is in front of camera (z < 1)
        if (planetPos.z < 1) {
          labelDiv.style.display = 'block';
          
          // Calculate distance to determine opacity
          const distance = this.camera.position.distanceTo(planet.mesh.position);
          const maxDistance = 1500; // Increased from 700 to 1500 for visibility from further away
          const opacity = Math.max(0, 1 - (distance / maxDistance));
          
          // Only hide labels when very far away
          if (opacity < 0.05) {
            labelDiv.style.display = 'none';
          } else {
            labelDiv.style.display = 'block';
            labelDiv.style.opacity = opacity.toString();
          }
          
          // Highlight the active planet
          if (this.activePlanet === planetData.name) {
            labelDiv.classList.add('active');
          } else {
            labelDiv.classList.remove('active');
          }
        } else {
          labelDiv.style.display = 'none';
        }
      }
    });
  }
  
  // Handle touch start event
  onTouchStart(event) {
    // Prevent default to avoid unwanted scrolling
    if (event.target === this.renderer.domElement) {
      event.preventDefault();
    }
    
    if (event.touches.length === 1) {
      // Single touch - store the position
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;
      this.touchPreviousX = event.touches[0].clientX;
      this.touchPreviousY = event.touches[0].clientY;
      this.touchMoved = false;
      
      // Update mouse position for raycasting
      this.mouse.x = (this.touchStartX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(this.touchStartY / window.innerHeight) * 2 + 1;
      
      // Check for planet hover
      this.checkPlanetHover();
    }
  }
  
  // Handle touch move event
  onTouchMove(event) {
    if (event.target === this.renderer.domElement) {
      event.preventDefault();
    }
    
    if (event.touches.length === 1 && !this.ui.getIsZoomed()) {
      // Calculate how much the touch moved
      const touchX = event.touches[0].clientX;
      const touchY = event.touches[0].clientY;
      
      // Calculate delta from previous position
      const deltaX = touchX - this.touchPreviousX;
      const deltaY = touchY - this.touchPreviousY;
      
      // Update previous position
      this.touchPreviousX = touchX;
      this.touchPreviousY = touchY;
      
      // Check if we've moved enough to consider it a drag (not a tap)
      if (Math.abs(touchX - this.touchStartX) > 10 || Math.abs(touchY - this.touchStartY) > 10) {
        this.touchMoved = true;
      }
      
      // If we're not in a zoomed state, rotate the camera
      if (!this.isAnimating && !this.followingSpaceship) {
        this.rotateCamera(deltaX * 0.005, deltaY * 0.005);
      }
    }
  }
  
  // Handle touch end event
  onTouchEnd(event) {
    // If the touch didn't move much, treat it as a tap (for selecting planets)
    if (!this.touchMoved && event.target === this.renderer.domElement) {
      this.onMouseClick({
        clientX: this.touchStartX,
        clientY: this.touchStartY
      });
    }
  }
  
  // Handle pointer down event (unifies mouse and touch)
  onPointerDown(event) {
    this.isPointerDown = true;
  }
  
  // Handle pointer up event
  onPointerUp(event) {
    this.isPointerDown = false;
  }
  
  // Rotate camera based on movement
  rotateCamera(deltaX, deltaY) {
    // Get current camera position
    const camPos = this.camera.position.clone();
    
    // Orbit around the origin
    const radius = camPos.length();
    
    // Calculate spherical coordinates
    const theta = Math.atan2(camPos.x, camPos.z);
    const phi = Math.acos(camPos.y / radius);
    
    // Apply the rotations
    const newTheta = theta - deltaX;
    const newPhi = Math.max(0.1, Math.min(Math.PI - 0.1, phi - deltaY));
    
    // Convert back to Cartesian coordinates
    const sinPhiRadius = radius * Math.sin(newPhi);
    camPos.x = sinPhiRadius * Math.sin(newTheta);
    camPos.y = radius * Math.cos(newPhi);
    camPos.z = sinPhiRadius * Math.cos(newTheta);
    
    // Update camera position
    this.camera.position.copy(camPos);
    this.camera.lookAt(this.scene.position);
    
    // Update the original camera position (for returning to main view)
    this.originalCameraPosition.copy(camPos);
  }
}

// Initialize on DOM content loaded
document.addEventListener("DOMContentLoaded", () => {
  // Add Google Font
  const fontLink = document.createElement('link');
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap';
  fontLink.rel = 'stylesheet';
  document.head.appendChild(fontLink);
  
  // Initialize application
  new SolarSystem();
}); 