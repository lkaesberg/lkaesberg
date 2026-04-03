/**
 * Modern Portfolio JavaScript
 * Handles theme switching, publications loading, and hidden space game easter egg
 */

// ============================================
// Theme Management
// ============================================

const ThemeManager = {
  init() {
    const toggle = document.getElementById('theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    
    // Set initial theme
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    // Toggle handler
    toggle?.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }
};

// ============================================
// Publications Loader
// ============================================

const PublicationsLoader = {
  async init() {
    try {
      const response = await fetch('data/publications.json');
      if (!response.ok) throw new Error('Failed to load publications');
      
      const data = await response.json();
      this.updateStats(data.stats);
      this.renderPublications(data.publications);
    } catch (error) {
      console.error('Error loading publications:', error);
      this.renderFallback();
    }
  },
  
  updateStats(stats) {
    const elements = {
      'stat-papers': stats.papers,
      'stat-citations': stats.citations,
      'stat-hindex': stats.hIndex,
      'stat-i10': stats.i10Index
    };
    
    Object.entries(elements).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) this.animateNumber(el, 0, value, 1000);
    });
  },
  
  animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    
    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      const current = Math.round(start + (end - start) * eased);
      
      element.textContent = current;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };
    
    requestAnimationFrame(update);
  },
  
  renderPublications(publications) {
    const container = document.getElementById('publications-list');
    if (!container) return;
    
    const html = publications.map(pub => this.createPublicationCard(pub)).join('');
    container.innerHTML = html;
  },
  
  createPublicationCard(pub) {
    const authors = this.highlightAuthor(pub.authors, 'Lars');
    const badgeType = this.getBadgeType(pub.type);
    
    return `
      <article class="publication-item">
        <div class="publication-venue">
          <span class="publication-badge">${badgeType}</span>
          <span class="publication-year">${pub.year || 'N/A'}</span>
        </div>
        <h3 class="publication-title">
          ${pub.url ? `<a href="${pub.url}" target="_blank">${pub.title}</a>` : pub.title}
        </h3>
        <p class="publication-authors">${authors}</p>
        <div class="publication-meta">
          ${pub.venue ? `<span>${pub.venue}</span>` : ''}
          ${pub.citations > 0 ? `<span class="publication-citations"><i class="fas fa-quote-right"></i> ${pub.citations} citations</span>` : ''}
        </div>
      </article>
    `;
  },
  
  highlightAuthor(authors, name) {
    if (!authors) return '';
    return authors.replace(
      new RegExp(`(${name}[^,]*)`, 'gi'),
      '<strong>$1</strong>'
    );
  },
  
  getBadgeType(type) {
    const badges = {
      conference: 'Conference',
      workshop: 'Workshop',
      journal: 'Journal',
      thesis: 'Thesis',
      preprint: 'Preprint'
    };
    return badges[type] || 'Paper';
  },
  
  renderFallback() {
    const container = document.getElementById('publications-list');
    if (!container) return;
    
    container.innerHTML = `
      <div class="publication-item">
        <p>Unable to load publications. Please visit 
          <a href="https://scholar.google.de/citations?user=MGBdtVsAAAAJ" target="_blank">
            Google Scholar
          </a> for the latest list.
        </p>
      </div>
    `;
  }
};

// ============================================
// Easter Egg: Hidden Space Game
// Click "Space & Astronomy" 3 times or use Konami code
// ============================================

const EasterEgg = {
  sequence: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
  current: 0,
  clickCount: 0,
  clickTimer: null,
  
  init() {
    // Keyboard listener for Konami code
    document.addEventListener('keydown', (e) => this.handleKey(e.key));
    
    // Hidden trigger: Click "Space & Astronomy" 3 times quickly
    const spaceInterest = document.getElementById('space-interest');
    spaceInterest?.addEventListener('click', () => this.handleSpaceClick());
    
    // Modal buttons
    const launchBtn = document.getElementById('launch-space-game');
    const solarBtn = document.getElementById('launch-solar-system');
    const closeBtn = document.getElementById('close-modal');
    
    launchBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      this.launchGame();
    });
    solarBtn?.addEventListener('click', () => this.hideModal());
    closeBtn?.addEventListener('click', () => this.hideModal());
    
    // Close modal on backdrop click
    const modal = document.getElementById('easter-modal');
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) this.hideModal();
    });
    
    // ESC key closes modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.hideModal();
    });
  },
  
  handleSpaceClick() {
    this.clickCount++;
    
    // Reset timer
    if (this.clickTimer) clearTimeout(this.clickTimer);
    
    // If 3 clicks within 2 seconds, trigger easter egg
    if (this.clickCount >= 3) {
      this.showModal();
      this.clickCount = 0;
    } else {
      // Add subtle hint after first click
      const el = document.getElementById('space-interest');
      if (el && this.clickCount === 1) {
        el.style.color = 'var(--accent-primary)';
        setTimeout(() => { el.style.color = ''; }, 300);
      } else if (el && this.clickCount === 2) {
        el.style.transform = 'scale(1.1)';
        setTimeout(() => { el.style.transform = ''; }, 300);
      }
      
      // Reset after 2 seconds of no clicks
      this.clickTimer = setTimeout(() => {
        this.clickCount = 0;
      }, 2000);
    }
  },
  
  handleKey(key) {
    if (key === this.sequence[this.current]) {
      this.current++;
      
      if (this.current === this.sequence.length) {
        this.showModal();
        this.current = 0;
      }
    } else {
      this.current = 0;
    }
  },
  
  showModal() {
    const modal = document.getElementById('easter-modal');
    modal?.classList.add('active');
  },
  
  hideModal() {
    const modal = document.getElementById('easter-modal');
    modal?.classList.remove('active');
  },
  
  launchGame() {
    this.hideModal();
    window.location.href = 'space-game.html';
  }
};

// ============================================
// Smooth Scroll
// ============================================

const SmoothScroll = {
  init() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }
};

// ============================================
// News list: show first 5 + toggle
// ============================================

const NewsList = {
  init() {
    const newsList = document.getElementById('news-list');
    const toggleBtn = document.getElementById('news-toggle-btn');
    if (!newsList || !toggleBtn) return;

    const items = Array.from(newsList.querySelectorAll('.news-item'));
    const initialVisible = 5;
    if (items.length <= initialVisible) return;

    let expanded = false;
    const applyState = () => {
      items.forEach((item, index) => {
        item.classList.toggle('is-hidden', !expanded && index >= initialVisible);
      });
      toggleBtn.textContent = expanded ? 'Show less' : 'Show more';
      toggleBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    };

    toggleBtn.hidden = false;
    applyState();

    toggleBtn.addEventListener('click', () => {
      expanded = !expanded;
      applyState();
    });
  }
};

// ============================================
// Initialize
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  NewsList.init();
  PublicationsLoader.init();
  EasterEgg.init();
  SmoothScroll.init();
});
