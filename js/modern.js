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
      if (el) el.textContent = value;
    });
  },
  
  renderPublications(publications) {
    const container = document.getElementById('publications-list');
    if (!container) return;
    
    // Group by year, keeping the order from the data file (newest first)
    const groups = [];
    publications.forEach(pub => {
      const year = pub.year || 'Other';
      const last = groups[groups.length - 1];
      if (last && last.year === year) {
        last.items.push(pub);
      } else {
        groups.push({ year, items: [pub] });
      }
    });
    
    container.innerHTML = groups.map(group => `
      <div class="pub-year-group">
        <h3 class="pub-year">${group.year}</h3>
        <ol class="pub-items">
          ${group.items.map(pub => this.createPublicationCard(pub)).join('')}
        </ol>
      </div>
    `).join('');
  },
  
  createPublicationCard(pub) {
    const authors = this.highlightAuthor(pub.authors, 'Lars');
    const venue = pub.venue || this.getBadgeType(pub.type);
    const citations = pub.citations > 0
      ? `<span class="publication-citations"><svg class="icon" aria-hidden="true" focusable="false"><use href="#i-quote"/></svg>${pub.citations}&nbsp;${pub.citations === 1 ? 'citation' : 'citations'}</span>`
      : '';
    
    return `
      <li class="publication-item">
        <h4 class="publication-title">
          ${pub.url ? `<a href="${pub.url}" target="_blank">${pub.title}</a>` : pub.title}
        </h4>
        <p class="publication-authors">${authors}</p>
        <p class="publication-meta">
          <span class="publication-venue">${venue}</span>${citations}
        </p>
      </li>
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
      <p>The publication list didn't load. The full list is on
        <a href="https://scholar.google.de/citations?user=MGBdtVsAAAAJ" target="_blank">Google Scholar</a>.
      </p>
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
        el.style.color = 'var(--accent)';
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
// Project cards: on touch screens (no hover), the card in the
// middle of the screen plays its scene
// ============================================

const ProjectScenes = {
  init() {
    const cards = document.querySelectorAll('.project-card');
    if (!cards.length || window.matchMedia('(hover: hover)').matches || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => entry.target.classList.toggle('is-active', entry.isIntersecting));
    }, { rootMargin: '-40% 0px -40% 0px' });

    cards.forEach(card => observer.observe(card));
  }
};

// ============================================
// Background star field: three depth layers that drift very slowly,
// shift a little with the cursor (parallax) and with scrolling, and
// brighten softly around the pointer. The stars inside the portrait's
// window read the same pointer position so they sit at their own depth.
// ============================================

const Starfield = {
  init() {
    const canvas = document.querySelector('.space-canvas');
    if (!canvas || !canvas.getContext) return;

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.portrait = document.querySelector('.portrait');
    this.lastPx = null;
    this.still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.pointer = { x: 0, y: 0, tx: 0, ty: 0, px: -1e4, py: -1e4 };
    this.meteor = null;
    this.nextMeteor = performance.now() + 6000 + Math.random() * 8000;

    this.readTheme();
    this.resize();

    window.addEventListener('resize', () => this.resize());
    new MutationObserver(() => { this.readTheme(); this.draw(performance.now()); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    if (this.still) {
      this.draw(0);
      return;
    }

    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      this.pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
      this.pointer.px = e.clientX;
      this.pointer.py = e.clientY;
    }, { passive: true });
    window.addEventListener('mouseout', (e) => {
      if (e.relatedTarget) return;
      this.pointer.tx = 0;
      this.pointer.ty = 0;
      this.pointer.px = -1e4;
      this.pointer.py = -1e4;
    });

    const loop = (t) => {
      if (!document.hidden) this.draw(t);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  },

  readTheme() {
    const css = getComputedStyle(document.documentElement);
    this.color = css.getPropertyValue('--sky-star').trim() || '#18213a';
    this.alpha = parseFloat(css.getPropertyValue('--sky-opacity')) || 0.3;
    this.dark = document.documentElement.getAttribute('data-theme') === 'dark';
  },

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = Math.round(this.w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Star count follows the screen area; most stars are small and far away
    const count = Math.round((this.w * this.h) / 2600);
    this.stars = Array.from({ length: count }, () => {
      const depth = Math.random() < 0.6 ? 0.25 : (Math.random() < 0.7 ? 0.55 : 1);
      const m = Math.random();
      return {
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        depth,
        r: (0.25 + 0.95 * m ** 3) * (0.65 + depth * 0.4),
        a: 0.25 + 0.75 * m,
        phase: Math.random() * Math.PI * 2,
        speed: 0.0004 + Math.random() * 0.0012,
        twinkles: Math.random() < 0.18
      };
    });

    this.draw(performance.now());
  },

  draw(t) {
    const { ctx, w, h, pointer } = this;
    if (!ctx) return;

    // Ease toward the cursor so the sky floats rather than jumps
    pointer.x += (pointer.tx - pointer.x) * 0.045;
    pointer.y += (pointer.ty - pointer.y) * 0.045;
    const px = `${pointer.x.toFixed(3)},${pointer.y.toFixed(3)}`;
    if (this.portrait && px !== this.lastPx) {
      this.portrait.style.setProperty('--px', pointer.x.toFixed(3));
      this.portrait.style.setProperty('--py', pointer.y.toFixed(3));
      this.lastPx = px;
    }

    const scroll = window.scrollY;
    const drift = this.still ? 0 : t * 0.004;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;

    for (const star of this.stars) {
      const shift = 14 * star.depth;
      let x = star.x - pointer.x * shift - drift * star.depth;
      let y = star.y - pointer.y * shift - scroll * 0.04 * star.depth;
      x = ((x % w) + w) % w;
      y = ((y % h) + h) % h;

      let a = star.a;
      if (star.twinkles && !this.still) a *= 0.55 + 0.45 * Math.sin(t * star.speed + star.phase);

      // Stars near the cursor glow a little brighter
      const d = Math.hypot(x - pointer.px, y - pointer.py);
      const near = d < 150 ? 1 - d / 150 : 0;

      ctx.globalAlpha = Math.min(1, (a + near * 0.6) * this.alpha);
      ctx.beginPath();
      ctx.arc(x, y, star.r * (1 + near * 0.6), 0, Math.PI * 2);
      ctx.fill();
    }

    // Every now and then, a faint shooting star
    if (!this.still) this.drawMeteor(t);
    ctx.globalAlpha = 1;
  },

  drawMeteor(t) {
    const { ctx, w, h } = this;
    if (!this.meteor && t > this.nextMeteor) {
      this.meteor = { x: w * (0.15 + Math.random() * 0.5), y: h * (0.05 + Math.random() * 0.3), start: t };
    }
    if (!this.meteor) return;

    const p = (t - this.meteor.start) / 900;
    if (p >= 1) {
      this.meteor = null;
      this.nextMeteor = t + 14000 + Math.random() * 12000;
      return;
    }
    const len = 120;
    const x = this.meteor.x + p * 260;
    const y = this.meteor.y + p * 90;
    const grad = ctx.createLinearGradient(x - len, y - len * 0.35, x, y);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, this.color);
    ctx.globalAlpha = Math.sin(p * Math.PI) * (this.dark ? 0.7 : 0.3);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(x - len, y - len * 0.35);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.strokeStyle = this.color;
  }
};

// ============================================
// Fly-by: every so often a small rocket or satellite crosses the sky.
// Clicking it opens the hidden space menu.
// ============================================

const Flyby = {
  kinds: ['rocket', 'satellite'],

  init() {
    this.el = document.querySelector('.flyby');
    if (!this.el || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !this.el.animate) return;

    this.el.addEventListener('click', () => EasterEgg.showModal());
    this.schedule(9000 + Math.random() * 6000);
  },

  schedule(ms) {
    setTimeout(() => this.fly(), ms);
  },

  fly() {
    if (document.hidden) {
      this.schedule(5000);
      return;
    }

    const kind = this.kinds[Math.floor(Math.random() * this.kinds.length)];
    this.el.innerHTML = `<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-${kind}"/></svg>`;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const leftToRight = Math.random() < 0.5;
    const x0 = leftToRight ? -40 : w + 40;
    const x1 = leftToRight ? w + 40 : -40;
    // Stay below the sticky top bar and above the bottom edge
    const y0 = h * (0.22 + Math.random() * 0.56);
    const y1 = Math.min(h * 0.85, Math.max(h * 0.22, y0 + (Math.random() - 0.5) * h * 0.4));
    const heading = Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI;
    const duration = kind === 'rocket' ? 13000 : 24000;

    const frames = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      const x = x0 + (x1 - x0) * t;
      const y = y0 + (y1 - y0) * t;
      // The rocket icon points up, so turn it to face its heading; the satellite tumbles slowly
      const rotate = kind === 'rocket' ? heading + 90 : t * 140;
      const opacity = t < 0.08 ? t / 0.08 : t > 0.92 ? (1 - t) / 0.08 : 1;
      frames.push({ transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${rotate.toFixed(1)}deg)`, opacity });
    }

    this.el.hidden = false;
    const run = this.el.animate(frames, { duration, easing: 'linear', fill: 'forwards' });
    run.onfinish = () => {
      this.el.hidden = true;
      this.schedule(25000 + Math.random() * 20000);
    };
  }
};

// ============================================
// Sticky top bar: show its bottom line once the page is scrolled
// ============================================

const TopBar = {
  init() {
    const bar = document.querySelector('.topbar');
    if (!bar) return;

    const update = () => bar.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', update, { passive: true });
    update();
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
  ProjectScenes.init();
  TopBar.init();
  Starfield.init();
  Flyby.init();
});
