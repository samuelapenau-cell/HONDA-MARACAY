// ============================================
// HONDA PREMIUM — SPA Router
// ============================================

const Router = {
  currentPage: null,
  pages: {},

  register(name, config) {
    this.pages[name] = config;
  },

  async navigate(hash) {
    const pageName = hash.replace('#', '') || 'home';
    if (pageName === this.currentPage) return;

    const loader = document.getElementById('pageLoader');
    if (loader) loader.classList.add('active');

    const prev = this.currentPage;
    this.currentPage = pageName;

    // Update nav
    document.querySelectorAll('.header-nav a, .footer-col a[data-page]').forEach(a => {
      const linkPage = a.getAttribute('href').replace('#', '');
      a.classList.toggle('active', linkPage === pageName);
    });

    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('page--active'));

    // Brief delay for loader to show
    await new Promise(r => setTimeout(r, 200));

    // Show target page
    const target = document.getElementById(`page-${pageName}`);
    if (target) {
      target.classList.add('page--active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Apply animations to the new page content
    setTimeout(() => {
      if (window.AnimationEngine) {
        AnimationEngine.autoRevealSections();
        AnimationEngine.setupCounters();
      }
    }, 100);

    // Scroll header
    const header = document.getElementById('siteHeader');
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    }

    // Fire page-specific init
    if (this.pages[pageName]?.init) {
      this.pages[pageName].init();
      // Re-apply animations after page init in case init changes DOM
      setTimeout(() => {
        if (window.AnimationEngine) {
          AnimationEngine.autoRevealSections();
        }
      }, 50);
    }

    // Hide loader
    if (loader) {
      setTimeout(() => loader.classList.remove('active'), 300);
    }
  },

  init() {
    window.addEventListener('hashchange', () => this.navigate(location.hash));

    // Intercept nav clicks for smooth SPA
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (href === '#') return;
      const pageName = href.replace('#', '');
      if (this.pages[pageName] || pageName === 'home') {
        e.preventDefault();
        if (location.hash !== href) {
          location.hash = href;
        } else {
          this.navigate(href);
        }
      }
    });

    // Initial load
    const hash = location.hash || '#home';
    if (hash !== '#home') {
      location.hash = 'home';
      setTimeout(() => { location.hash = hash.replace('#', ''); }, 50);
    } else {
      this.navigate('home');
    }
  }
};

// ============================================
// Register page inits
// ============================================

Router.register('home', {
  init() {
    if (window.initHome) window.initHome();
  }
});

Router.register('modelos', {
  init() {
    if (window.initModelos) window.initModelos();
  }
});

Router.register('hrv', {
  init() {
    if (window.initModelDetail) window.initModelDetail('hrv');
  }
});

Router.register('city', {
  init() {
    if (window.initModelDetail) window.initModelDetail('city');
  }
});

Router.register('wrv', {
  init() {
    if (window.initModelDetail) window.initModelDetail('wrv');
  }
});

Router.register('taller', {
  init() {
    if (window.initTaller) window.initTaller();
  }
});

Router.register('respuestos', {
  init() {
    if (window.initRespuestos) window.initRespuestos();
  }
});

Router.register('nosotros', {
  init() {
    if (window.initNosotros) window.initNosotros();
  }
});

document.addEventListener('DOMContentLoaded', () => Router.init());
