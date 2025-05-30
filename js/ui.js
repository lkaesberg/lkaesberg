// UI handling functionality for the 3D solar system portfolio
class UI {
  constructor() {
    // DOM Elements
    this.contentPanel = document.querySelector(".content-panel");
    this.contentTitle = document.querySelector(".content-title");
    this.contentBody = document.querySelector(".content-body");
    this.panelContent = document.querySelector(".panel-content");
    this.panelHeader = document.querySelector(".panel-header");
    this.backButton = document.querySelector(".back-button");
    this.closeButton = document.querySelector(".close-button");
    this.header = document.querySelector(".header");
    this.planetTooltip = document.querySelector(".planet-tooltip");
    this.zoomLine = document.querySelector(".zoom-line line");
    this.spaceshipAlert = document.getElementById("spaceship-alert");
    this.navItems = document.querySelectorAll('.nav-item');
    this.controlsInfo = document.querySelector('.controls-info');
    this.menuToggle = document.querySelector('.menu-toggle');
    this.navMenu = document.querySelector('.nav-menu');
    
    // State
    this.isZoomed = false;
    this.targetPlanet = null;
    this.isMobile = window.innerWidth < 768;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.menuOpen = false;
    
    // Initialize UI event listeners
    this.initEventListeners();
    
    // Update mobile state on resize
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 768;
      this.updateMobileUI();
    });
    
    // Initial mobile UI update
    this.updateMobileUI();
    
    // Debug info
    console.log('Menu toggle button:', this.menuToggle);
    console.log('Nav menu:', this.navMenu);
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
    
    // Add keyboard support for ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isZoomed) {
        if (this.onReturnToMain) this.onReturnToMain();
      }
    });
    
    // Navigation menu items
    this.navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const planetName = e.currentTarget.getAttribute('data-planet');
        if (planetName && this.onPlanetSelect) {
          this.onPlanetSelect(planetName);
          
          // Close mobile menu after selection
          if (this.isMobile && this.menuOpen) {
            this.toggleMobileMenu(false);
          }
        }
      });
      
      // Enhanced hover effects for non-touch devices
      item.addEventListener('mouseenter', (e) => {
        if (!this.isMobile) {
          e.target.style.transform = 'translateY(-3px) scale(1.05)';
          e.target.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2), 0 0 15px rgba(108, 99, 255, 0.3)';
        }
      });
      
      item.addEventListener('mouseleave', (e) => {
        if (!this.isMobile) {
          e.target.style.transform = '';
          e.target.style.boxShadow = '';
        }
      });
    });
    
    // Add touch events for mobile interaction with 3D scene
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    
    // Mobile menu toggle - add multiple event types to ensure it works on all devices
    this.setupMenuToggle();
  }
  
  // Set up menu toggle with multiple event types for better mobile responsiveness
  setupMenuToggle() {
    if (!this.menuToggle) {
      console.error('Menu toggle button not found!');
      return;
    }
    
    // Remove any existing event listeners
    this.menuToggle.replaceWith(this.menuToggle.cloneNode(true));
    
    // Get the fresh reference
    this.menuToggle = document.querySelector('.menu-toggle');
    
    // Add multiple event types for better mobile support
    const handleMenuClick = (e) => {
      // Prevent any default actions and stop propagation
      e.preventDefault();
      e.stopPropagation();
      
      // Toggle the menu
      this.toggleMobileMenu();
      console.log('Menu toggled via', e.type, 'state:', this.menuOpen);
    };
    
    // Add click event
    this.menuToggle.addEventListener('click', handleMenuClick, { passive: false });
    
    // Add touchstart/touchend events specifically for mobile
    this.menuToggle.addEventListener('touchstart', (e) => {
      // Mark this element as being interacted with
      this.menuToggleTouched = true;
    }, { passive: true });
    
    this.menuToggle.addEventListener('touchend', (e) => {
      if (this.menuToggleTouched) {
        e.preventDefault();
        handleMenuClick(e);
        this.menuToggleTouched = false;
      }
    }, { passive: false });
  }
  
  // Toggle mobile menu
  toggleMobileMenu(forceState) {
    // If forceState is provided, set to that state, otherwise toggle
    this.menuOpen = forceState !== undefined ? forceState : !this.menuOpen;
    
    if (this.menuOpen) {
      this.navMenu.classList.add('active');
      this.menuToggle.classList.add('active');
    } else {
      this.navMenu.classList.remove('active');
      this.menuToggle.classList.remove('active');
    }
  }
  
  // Handle touch start event
  handleTouchStart(event) {
    // Skip if touching the menu toggle
    if (event.target.closest('.menu-toggle')) {
      return;
    }
    
    // Store the initial touch position
    if (event.touches.length === 1) {
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;
    }
  }
  
  // Handle touch move event
  handleTouchMove(event) {
    // Skip if touching the menu toggle
    if (event.target.closest('.menu-toggle')) {
      return;
    }
    
    // Always allow scrolling in content panel
    if (event.target.closest('.panel-content') || event.target.closest('.content-body')) {
      // Let the browser handle the scroll naturally
      return;
    }
    
    // Prevent default only if we're not in a scrollable area
    if (!this.isElementScrollable(event.target)) {
      event.preventDefault();
    }
  }
  
  // Handle touch end event
  handleTouchEnd(event) {
    // Skip if touching the menu toggle
    if (event.target.closest('.menu-toggle')) {
      return;
    }
    
    // If we're not interacting with a UI element, it could be a planet selection
    if (event.changedTouches.length === 1) {
      const touch = event.changedTouches[0];
      
      // Calculate the distance moved
      const deltaX = Math.abs(touch.clientX - this.touchStartX);
      const deltaY = Math.abs(touch.clientY - this.touchStartY);
      
      // If the touch was mostly stationary (not a swipe), treat it as a tap
      if (deltaX < 10 && deltaY < 10) {
        // Create a synthetic mouse event at the touch position
        const clickEvent = new MouseEvent('click', {
          clientX: touch.clientX,
          clientY: touch.clientY,
          bubbles: true,
          cancelable: true
        });
        
        // Dispatch at the touch position
        document.elementFromPoint(touch.clientX, touch.clientY)?.dispatchEvent(clickEvent);
      }
    }
  }
  
  // Check if an element is scrollable and currently needs scroll
  isElementScrollable(element) {
    while (element && element !== document.body) {
      const style = window.getComputedStyle(element);
      const overflowY = style.getPropertyValue('overflow-y');
      
      if (
        (overflowY === 'scroll' || overflowY === 'auto') && 
        element.scrollHeight > element.clientHeight
      ) {
        const atTop = element.scrollTop === 0;
        const atBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 10; // Add tolerance
        
        // Allow default scrolling behavior only if not at the boundaries
        // or if scrolling in the direction away from the boundary
        if (atTop && this.touchStartY < event.touches[0].clientY) {
          // At top and trying to pull down further - prevent default
          return false;
        } else if (atBottom && this.touchStartY > event.touches[0].clientY) {
          // At bottom and trying to pull up further - prevent default
          return false;
        }
        
        // Otherwise allow scrolling
        return true;
      }
      
      element = element.parentElement;
    }
    
    return false;
  }
  
  // Update UI for mobile devices
  updateMobileUI() {
    if (this.isMobile) {
      // Update controls info for touch devices
      if (this.controlsInfo) {
        this.controlsInfo.innerHTML = `
          <div class="control-item">
            <span class="key">Tap</span>
            <span class="action">Select Planet</span>
          </div>
          <div class="control-item">
            <span class="key">Drag</span>
            <span class="action">Navigate</span>
          </div>
        `;
      }
      
      // Ensure menu is initially closed on mobile
      this.toggleMobileMenu(false);
      
      // Make sure menu toggle is visible
      if (this.menuToggle) {
        this.menuToggle.style.display = 'flex';
      }
    } else {
      // Restore desktop controls
      if (this.controlsInfo) {
        this.controlsInfo.innerHTML = `
          <div class="control-item">
            <span class="key">Mouse</span>
            <span class="action">Navigate</span>
          </div>
          <div class="control-item">
            <span class="key">Click</span>
            <span class="action">Select Planet</span>
          </div>
          <div class="control-item">
            <span class="key">ESC</span>
            <span class="action">Return</span>
          </div>
        `;
      }
      
      // Ensure menu is always open on desktop
      if (this.navMenu) {
        this.navMenu.classList.add('active');
      }
      
      // Hide menu toggle on desktop
      if (this.menuToggle) {
        this.menuToggle.style.display = 'none';
      }
    }
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
    
    // Adjust position for mobile to prevent offscreen tooltips
    if (this.isMobile) {
      // Ensure tooltip stays on screen
      const tooltipWidth = 100; // Approximate width
      if (x + tooltipWidth + 15 > window.innerWidth) {
        x = window.innerWidth - tooltipWidth - 15;
      }
    }
    
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
    
    // Scroll to top of content
    if (this.panelContent) {
      this.panelContent.scrollTop = 0;
    }
    
    // Show panel and hide header
    this.contentPanel.classList.add("active");
    
    // Show back button and hide header
    this.backButton.classList.add("visible");
    this.backButton.innerHTML = `Return to Solar System`;
    this.header.style.opacity = "0";
    
    // Hide the planet label and line if they exist
    const label = document.querySelector(`[data-label="${planetName}"]`);
    if (label) label.style.visibility = "hidden";
  }
  
  // Update the content panel position relative to the planet
  updateContentPanelPosition(planetScreenPosition, planetScreenRadius) {
    // Position panel based on device type
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    if (this.isMobile) {
      // On mobile, position the panel at the bottom of the screen
      this.contentPanel.style.left = "50%";
      this.contentPanel.style.right = "auto";
      this.contentPanel.style.top = "auto";
      this.contentPanel.style.bottom = "20px";
      this.contentPanel.style.transform = "translateX(-50%)";
      
      // For mobile, ensure the content is scrollable
      if (this.panelContent) {
        this.panelContent.style.maxHeight = "calc(75vh - 100px)"; // Account for header height
        this.panelContent.style.overflowY = "auto";
        this.panelContent.style.webkitOverflowScrolling = "touch";
      }
    } else {
      // On desktop, position on the right side of the screen
      this.contentPanel.style.left = "auto";
      this.contentPanel.style.right = "40px";
      this.contentPanel.style.top = "50%";
      this.contentPanel.style.bottom = "auto";
      this.contentPanel.style.transform = "translateY(-50%)";
      
      // Different scroll handling for desktop
      if (this.panelContent) {
        this.panelContent.style.maxHeight = "calc(80vh - 120px)"; // Account for header height
      }
    }
    
    // Hide the connecting line
    this.zoomLine.setAttribute("stroke-width", "0");
  }
  
  // Hide the content panel (explicitly called from main)
  hideContentPanel() {
    // Hide panel and show header with animation
    this.contentPanel.classList.remove("active");
    this.header.style.opacity = "1";
    this.backButton.classList.remove("visible");
    
    // Reset connecting line
    this.zoomLine.setAttribute("x1", 0);
    this.zoomLine.setAttribute("y1", 0);
    this.zoomLine.setAttribute("x2", 0);
    this.zoomLine.setAttribute("y2", 0);
  }
  
  // Return to main view
  returnToMain() {
    // Show planet label if it was hidden
    if (this.targetPlanet) {
      const label = document.querySelector(`[data-label="${this.targetPlanet}"]`);
      if (label) label.style.visibility = "visible";
    }
    
    // Hide content panel
    this.hideContentPanel();
    
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