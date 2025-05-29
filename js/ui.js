// UI handling functionality for the 3D solar system portfolio
class UI {
  constructor() {
    // DOM Elements
    this.contentPanel = document.querySelector(".content-panel");
    this.contentTitle = document.querySelector(".content-title");
    this.contentBody = document.querySelector(".content-body");
    this.backButton = document.querySelector(".back-button");
    this.closeButton = document.querySelector(".close-button");
    this.header = document.querySelector(".header");
    this.planetTooltip = document.querySelector(".planet-tooltip");
    this.zoomLine = document.querySelector(".zoom-line line");
    this.spaceshipAlert = document.getElementById("spaceship-alert");
    this.navItems = document.querySelectorAll('.nav-item');
    
    // State
    this.isZoomed = false;
    this.targetPlanet = null;
    
    // Initialize UI event listeners
    this.initEventListeners();
  }
  
  // Initialize all event listeners
  initEventListeners() {
    // Close button and back button functionality
    this.closeButton.addEventListener("click", (e) => {
      e.stopPropagation();
      if (this.onReturnToMain) this.onReturnToMain();
    });
    
    this.backButton.addEventListener("click", () => {
      if (this.onReturnToMain) this.onReturnToMain();
    });
    
    // Navigation menu items
    this.navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const planetName = e.target.getAttribute('data-planet');
        if (planetName && this.onPlanetSelect) {
          this.onPlanetSelect(planetName);
        }
      });
      
      // Enhanced hover effects
      item.addEventListener('mouseenter', (e) => {
        e.target.style.transform = 'translateY(-3px) scale(1.05)';
        e.target.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2), 0 0 15px rgba(108, 99, 255, 0.3)';
      });
      
      item.addEventListener('mouseleave', (e) => {
        e.target.style.transform = '';
        e.target.style.boxShadow = '';
      });
    });
  }
  
  // Set callback for when a planet is selected from the menu
  setPlanetSelectCallback(callback) {
    this.onPlanetSelect = callback;
  }
  
  // Set callback for when user wants to return to main view
  setReturnToMainCallback(callback) {
    this.onReturnToMain = callback;
  }
  
  // Show the spaceship alert message
  showSpaceshipAlert(message) {
    this.spaceshipAlert.innerHTML = `
      <div class="alert-icon">🚀</div>
      <div class="alert-message">${message}</div>
    `;
    this.spaceshipAlert.classList.add('visible');
    
    // Add animation class
    this.spaceshipAlert.classList.add('pulse');
    
    // Hide after 3 seconds
    setTimeout(() => {
      this.spaceshipAlert.classList.remove('visible');
      setTimeout(() => {
        this.spaceshipAlert.classList.remove('pulse');
      }, 500);
    }, 3000);
  }
  
  // Show the tooltip for a planet
  showPlanetTooltip(planetName, x, y) {
    // Simplified tooltip with just the planet name
    this.planetTooltip.textContent = planetName;
    this.planetTooltip.style.left = x + 15 + "px";
    this.planetTooltip.style.top = y + "px";
    this.planetTooltip.style.opacity = "1";
    this.planetTooltip.classList.add('visible');
  }
  
  // Hide the planet tooltip
  hidePlanetTooltip() {
    this.planetTooltip.style.opacity = "0";
    this.planetTooltip.classList.remove('visible');
  }
  
  // Show planet detail content
  showPlanetContent(planetName, planetData) {
    this.targetPlanet = planetName;
    this.isZoomed = true;
    
    // Update content and show panel
    this.contentTitle.textContent = planetData.title;
    this.contentBody.innerHTML = planetData.content;
    
    // Show panel and hide header
    this.contentPanel.classList.add("active");
    
    // Show back button and hide header
    this.backButton.classList.add("visible");
    this.backButton.innerHTML = `<span class="back-icon">←</span> Return to Solar System`;
    this.header.style.opacity = "0";
    
    // Hide the planet label and line if they exist
    const label = document.querySelector(`[data-label="${planetName}"]`);
    if (label) label.style.visibility = "hidden";
  }
  
  // Update the content panel position relative to the planet
  updateContentPanelPosition(planetScreenPosition, planetScreenRadius) {
    // Position panel in a fixed location on the right side of the screen
    // This makes it more stable and readable
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Position on the right side of the screen
    this.contentPanel.style.left = "auto";
    this.contentPanel.style.right = "40px";
    this.contentPanel.style.top = "50%";
    this.contentPanel.style.transform = "translateY(-50%)";
    
    // Hide the connecting line since we're using a fixed position
    this.zoomLine.setAttribute("stroke-width", "0");
  }
  
  // Return to main view
  returnToMain() {
    // Show planet label if it was hidden
    if (this.targetPlanet) {
      const label = document.querySelector(`[data-label="${this.targetPlanet}"]`);
      if (label) label.style.visibility = "visible";
    }
    
    // Hide panel and show header with animation
    this.contentPanel.classList.remove("active");
    this.header.style.opacity = "1";
    this.backButton.classList.remove("visible");
    
    // Reset connecting line
    this.zoomLine.setAttribute("x1", 0);
    this.zoomLine.setAttribute("y1", 0);
    this.zoomLine.setAttribute("x2", 0);
    this.zoomLine.setAttribute("y2", 0);
    
    // Reset state
    this.isZoomed = false;
    this.targetPlanet = null;
  }
  
  // Check if we're currently in zoomed mode
  getIsZoomed() {
    return this.isZoomed;
  }
  
  // Get the currently targeted planet
  getTargetPlanet() {
    return this.targetPlanet;
  }
}

export { UI }; 