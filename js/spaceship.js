// Spaceship functionality for solar system navigation
import { THREE } from './main.js';

class Spaceship {
  constructor(scene, planetObjects) {
    this.scene = scene;
    this.planetObjects = planetObjects;
    this.spaceship = null;
    this.transition = null;
    this.takeoff = null;
    this.landing = null;
    this.homePlanet = "Earth";
    this.trailPoints = [];
    this.maxTrailPoints = 100;
    
    // Create the spaceship and its trail
    this.init();
  }
  
  // Initialize the spaceship and trail
  init() {
    this.spaceship = new THREE.Group();
    
    // Create the rocket trail (plume)
    const trailGeometry = new THREE.BufferGeometry();
    const trailPositions = new Float32Array(this.maxTrailPoints * 3);
    trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    
    // Use an emissive-like color with additive blending for a hot plume effect
    const trailMaterial = new THREE.LineBasicMaterial({ 
      color: 0xffaa00, 
      transparent: true, 
      opacity: 0.8, 
      blending: THREE.AdditiveBlending 
    });
    
    const trailLine = new THREE.Line(trailGeometry, trailMaterial);
    this.spaceship.userData.trail = trailLine;
    this.scene.add(trailLine);
    
    // Place spaceship on the home planet (Earth)
    const earthObj = this.planetObjects["Earth"];
    if (earthObj) {
      this.spaceship.position.copy(earthObj.mesh.position);
    }
    
    this.scene.add(this.spaceship);
    
    // Load the 3D model
    this.loadModel();
  }
  
  // Load the 3D spaceship model
  loadModel() {
    const loader = new THREE.GLTFLoader();
    loader.load('/rocket.glb', (gltf) => {
      let rocketModel = gltf.scene;
      
      // Adjust scale and orientation
      rocketModel.scale.set(5, 5, 5);
      rocketModel.rotation.x = 0.4;
      
      // Make the rocket emissive
      rocketModel.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.emissive = new THREE.Color(0x111111);
          child.material.emissiveIntensity = 0.5;
          child.material.needsUpdate = true;
        }
      });
      
      this.spaceship.add(rocketModel);
    });
  }
  
  // Initiate flight to target planet
  flyTo(targetPlanetName) {
    // Don't allow new flight if we're already in a transition
    if (this.transition || this.takeoff || this.landing) {
      return;
    }
    
    // Start a takeoff sequence first
    this.takeoff = {
      startTime: performance.now(),
      duration: 1500, // 1.5 seconds for takeoff
      startPosition: this.spaceship.position.clone(),
      startScale: 1,
      targetScale: 10,
      currentPlanet: this.homePlanet,
      targetPlanet: targetPlanetName
    };
  }
  
  // Check if spaceship is currently in transition
  isFlying() {
    return this.transition !== null || this.takeoff !== null || this.landing !== null;
  }
  
  // Get current home planet
  getHomePlanet() {
    return this.homePlanet;
  }
  
  // Get spaceship camera tracking information
  getCameraTrackingInfo() {
    if (!this.spaceship) return null;
    
    const position = this.spaceship.position.clone();
    let lookAt = position.clone();
    
    // If in flight, add a point slightly ahead in the direction of travel
    if (this.transition) {
      const targetPlanetPos = this.planetObjects[this.transition.targetPlanet].mesh.position.clone();
      lookAt.lerpVectors(position, targetPlanetPos, 0.2);
    } else if (this.takeoff) {
      const planetObj = this.planetObjects[this.takeoff.currentPlanet];
      const planetPos = planetObj.mesh.position.clone();
      lookAt = new THREE.Vector3(planetPos.x, planetPos.y + planetObj.data.size * 20, planetPos.z);
    }
    
    // Calculate an ideal camera position based on the ship's position and flight state
    // Position slightly behind and above the ship
    const cameraOffset = new THREE.Vector3(-20, 10, -20);
    
    // If in transition, rotate the offset to match the ship's direction
    if (this.transition) {
      const targetPlanetPos = this.planetObjects[this.transition.targetPlanet].mesh.position.clone();
      const direction = new THREE.Vector3().subVectors(targetPlanetPos, position).normalize();
      
      // Calculate perpendicular vector for camera positioning
      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(direction, up).normalize();
      
      // Adjust offset based on direction
      cameraOffset.set(
        -direction.x * 20 + right.x * 10,
        10, // Keep height offset
        -direction.z * 20 + right.z * 10
      );
    }
    
    const idealCameraPosition = position.clone().add(cameraOffset);
    
    return {
      shipPosition: position,
      shipLookAt: lookAt,
      cameraPosition: idealCameraPosition,
      targetPlanet: this.transition ? this.transition.targetPlanet : this.homePlanet,
      flightProgress: this.transition ? 
        (performance.now() - this.transition.startTime) / this.transition.duration : 
        (this.takeoff ? 
          (performance.now() - this.takeoff.startTime) / this.takeoff.duration : 
          0)
    };
  }
  
  // Update spaceship position and trail
  update() {
    if (this.takeoff) {
      // Takeoff sequence
      const currentTime = performance.now();
      const t = (currentTime - this.takeoff.startTime) / this.takeoff.duration;
      
      if (t >= 1) {
        // Takeoff complete, start flight
        const startPlanet = this.planetObjects[this.takeoff.currentPlanet].mesh.position.clone();
        const targetPlanet = this.planetObjects[this.takeoff.targetPlanet].mesh.position.clone();
        
        // Start actual flight
        this.transition = {
          start: this.spaceship.position.clone(),
          startTime: performance.now(),
          duration: 4500 * (startPlanet.distanceTo(targetPlanet) / 200), // Reduced from 8000 to 4500 for faster flight
          targetPlanet: this.takeoff.targetPlanet,
          currentPlanet: this.takeoff.currentPlanet,
          hoverPosition: null // Will be calculated during flight
        };
        
        this.takeoff = null;
        return { arrived: false };
      }
      
      // Get the current planet data
      const planetObj = this.planetObjects[this.takeoff.currentPlanet];
      const planetPos = planetObj.mesh.position.clone();
      const planetSize = planetObj.data.size;
      
      // Calculate takeoff position (moving upward from the planet)
      const liftHeight = planetSize * 1.2 * t; // Reduced height multiplier from 3 to 1.2
      const takeoffPos = new THREE.Vector3(
        planetPos.x,
        planetPos.y + planetSize + 0.5 + liftHeight,
        planetPos.z
      );
      
      // Smoothly move to takeoff position
      this.spaceship.position.copy(takeoffPos);
      
      // Smoothly scale up
      const currentScale = this.takeoff.startScale + (this.takeoff.targetScale - this.takeoff.startScale) * t;
      this.spaceship.scale.set(currentScale, currentScale, currentScale);
      
      // Show and intensify trail
      this.spaceship.userData.trail.visible = true;
      this.spaceship.userData.trail.material.opacity = 0.8 * t;
      
      // Orient spaceship upward
      this.spaceship.up.set(0, 1, 0);
      this.spaceship.lookAt(new THREE.Vector3(planetPos.x, planetPos.y + planetSize * 20, planetPos.z));
      
      // Update the trail
      this.updateTrail();
      
      return { arrived: false };
    } else if (this.transition) {
      // Flight mode
      this.spaceship.scale.set(10, 10, 10);
      this.spaceship.userData.trail.visible = true;
      
      const currentTime = performance.now();
      const t = (currentTime - this.transition.startTime) / this.transition.duration;
      const start = this.transition.start; // Use the original start position for consistent path
      const targetPlanetPos = this.planetObjects[this.transition.targetPlanet].mesh.position.clone();
      const targetPlanetSize = this.planetObjects[this.transition.targetPlanet].data.size;
      
      // Always recalculate the hover position based on current planet position
      this.transition.hoverPosition = new THREE.Vector3(
        targetPlanetPos.x,
        targetPlanetPos.y + targetPlanetSize * 1.2,
        targetPlanetPos.z
      );
      
      // Use the hover position as the end point
      const end = this.transition.hoverPosition;
      
      // Clamp t to avoid overflowing
      const clampedT = Math.min(t, 1);
      
      // Apply easing to create a more natural motion - faster acceleration, steady cruising speed
      const easedT = this.easeOutQuad(clampedT);
      
      // Detect when we're approaching the destination (85% of the way there)
      if (clampedT >= 0.85) {
        // Calculate blend factor for landing transition (0 at 85%, 1 at 100%)
        const landingBlend = (clampedT - 0.85) / 0.15;
        
        // If we're at the end of the journey, complete the transition
        if (clampedT >= 1) {
          this.homePlanet = this.transition.targetPlanet;
          this.transition = null;
          
          // Instead of starting a separate landing sequence, just complete the landing
          this.spaceship.position.copy(targetPlanetPos.clone().add(new THREE.Vector3(0, targetPlanetSize + 0.5, 0)));
          this.spaceship.scale.set(1, 1, 1);
          this.spaceship.userData.trail.visible = false;
          this.trailPoints = [];
          
          // Orient the spaceship to stand upright
          this.spaceship.up.set(0, 1, 0);
          this.spaceship.lookAt(new THREE.Vector3(targetPlanetPos.x, targetPlanetPos.y + targetPlanetSize * 10, targetPlanetPos.z));
          
          return { arrived: true, planet: this.homePlanet };
        }
        
        // Gradually transition to landing position and downscale during approach
        const flightPos = new THREE.Vector3();
        flightPos.lerpVectors(start, end, easedT);
        
        const landingPos = new THREE.Vector3(
          targetPlanetPos.x,
          targetPlanetPos.y + targetPlanetSize + 0.5,
          targetPlanetPos.z
        );
        
        // Blend between flight path and landing position
        this.spaceship.position.lerpVectors(flightPos, landingPos, landingBlend);
        
        // Gradually scale down as we approach
        const scale = 10 - (landingBlend * 9); // 10 at start of landing phase, 1 at end
        this.spaceship.scale.set(scale, scale, scale);
        
        // Gradually reduce trail opacity during landing
        this.spaceship.userData.trail.material.opacity = 0.8 * (1 - landingBlend);
        
        // Gradually orient spaceship to stand upright on the planet
        const upVector = new THREE.Vector3(0, 1, 0);
        this.spaceship.up.copy(upVector);
        this.spaceship.lookAt(new THREE.Vector3(targetPlanetPos.x, targetPlanetPos.y + targetPlanetSize * 10, targetPlanetPos.z));
      } else {
        // Normal flight - update position using direct linear interpolation with easing
        this.spaceship.position.lerpVectors(start, end, easedT);
        
        // Update rotation to point in the direction of travel
        const lookTarget = new THREE.Vector3();
        lookTarget.lerpVectors(start, end, Math.min(easedT + 0.1, 1));
        this.spaceship.lookAt(lookTarget);
      }
      
      // Update the trail
      this.updateTrail();
      
      return { arrived: false };
    } else if (this.landing) {
      // This separate landing sequence is no longer used, but kept for compatibility
      // Landing is now integrated into the transition phase above
      this.landing = null;
      return { arrived: false };
    } else {
      // Idle animation when landed on a planet
      this.spaceship.scale.set(1, 1, 1);
      this.spaceship.userData.trail.visible = false;
      this.trailPoints = [];
      
      // Get the home planet position and size
      const planetObj = this.planetObjects[this.homePlanet];
      const planetPos = planetObj.mesh.position.clone();
      const planetSize = planetObj.data.size;
      
      // Position the spaceship directly on top of the planet
      this.spaceship.position.set(
        planetPos.x,
        planetPos.y + planetSize + 0.5, // Just above the surface at the top
        planetPos.z
      );
      
      // Orient the spaceship to stand upright
      this.spaceship.up.set(0, 1, 0);
      this.spaceship.lookAt(new THREE.Vector3(planetPos.x, planetPos.y + planetSize * 10, planetPos.z));
      
      return { arrived: false };
    }
  }
  
  // Update the visual trail behind the spaceship
  updateTrail() {
    // Add current position to trail points
    this.trailPoints.push(this.spaceship.position.clone());
    
    // Remove oldest points if exceeding maximum
    if (this.trailPoints.length > this.maxTrailPoints) {
      this.trailPoints.shift();
    }
    
    // Update trail geometry
    const positions = this.spaceship.userData.trail.geometry.attributes.position.array;
    for (let i = 0; i < this.trailPoints.length; i++) {
      positions[i * 3] = this.trailPoints[i].x;
      positions[i * 3 + 1] = this.trailPoints[i].y;
      positions[i * 3 + 2] = this.trailPoints[i].z;
    }
    
    this.spaceship.userData.trail.geometry.setDrawRange(0, this.trailPoints.length);
    this.spaceship.userData.trail.geometry.attributes.position.needsUpdate = true;
  }
  
  // Modified easing function for faster initial acceleration
  easeOutQuad(t) {
    return 1 - (1 - t) * (1 - t);
  }
}

export { Spaceship }; 