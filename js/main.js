const Toast = {
  container: null,
  init() {
    this.container = document.getElementById('toastContainer');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },
  show(title, message, type = 'success', duration = 4000) {
    if (!this.container) this.init();
    const icons = {
      success: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>',
      error: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
      info: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>'
    };
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `
      ${icons[type] || icons.info}
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg></button>
    `;
    this.container.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
    if (duration > 0) setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, duration);
  }
};

// ============================================
// ANIMATION ENGINE
// ============================================
const AnimationEngine = {
  observer: null,
  counterObserver: null,
  lastScrollY: 0,
  ticking: false,

  init() {
    this.createObservers();
    this.setupNavbarScroll();
    this.setupHeroParallax();
    this.autoRevealSections();
  },

  createObservers() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          this.observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    this.counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounter(entry.target);
          this.counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
  },

  observe(el) {
    if (el) this.observer.observe(el);
  },

  observeAll(selector, parent) {
    (parent || document).querySelectorAll(selector).forEach(el => this.observer.observe(el));
  },

  autoRevealSections() {
    const selectors = [
      '.section-header',
      '.specs-hero-card',
      '.timeline-item',
      '.showroom-grid .model-card',
      '.model-grid .model-grid-card',
      '.pillars-grid .pillar-card',
      '.testimonials-grid .testimonial-card',
      '.brand-philosophy .philosophy-card',
      '.detail-specs-grid .detail-spec',
      '.detail-features-grid .detail-feature',
      '.design-grid .design-card',
      '.service-container .service-card',
      '.founder-metrics .metric',
      '.specs-hero-card',
      '.reveal-rotate',
    ];
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => this.observer.observe(el));
    });
  },

  stagger(gridSelector, delay = 0.08) {
    const grid = document.querySelector(gridSelector);
    if (!grid) return;
    const children = grid.children;
    for (let i = 0; i < children.length; i++) {
      this.observer.observe(children[i]);
    }
  },

  // --- Navbar scroll direction ---
  setupNavbarScroll() {
    const header = document.getElementById('siteHeader');
    if (!header) return;
    let lastScroll = 0;
    let ticking = false;

    window.addEventListener('scroll', () => {
      this.lastScrollY = window.scrollY;
      if (!ticking) {
        requestAnimationFrame(() => {
          const st = this.lastScrollY;
          if (st > 120) {
            if (st > lastScroll) {
              header.classList.add('header-hidden');
            } else {
              header.classList.remove('header-hidden');
            }
          } else {
            header.classList.remove('header-hidden');
          }
          header.classList.toggle('scrolled', st > 40);
          lastScroll = st;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  },

  // --- Hero Parallax ---
  setupHeroParallax() {
    const hero = document.querySelector('.hero');
    const bg = hero?.querySelector('.hero-bg-video');
    if (!bg) return;
    window.addEventListener('scroll', () => {
      const rect = hero.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const speed = 0.3;
        const y = rect.top * speed;
        bg.style.transform = `translateY(${y}px)`;
      }
    }, { passive: true });
  },

  // --- Counter animation ---
  animateCounter(el) {
    const isNum = el.classList.contains('stat-num');
    const text = el.textContent.trim();
    const match = text.match(/([\d.]+)\s*(.*)/);
    if (!match) { el.classList.add('counted'); return; }

    const target = parseFloat(match[1]);
    const suffix = match[2] || '';
    const isInt = Number.isInteger(target) || text.includes('+');
    const duration = 1500;
    const start = performance.now();

    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = isInt ? Math.floor(eased * target) : (eased * target).toFixed(1);
      el.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = text;
        el.classList.add('counted');
      }
    };
    requestAnimationFrame(update);
  },

  // --- Init counter observers on stats ---
  setupCounters() {
    document.querySelectorAll('.stat-num').forEach(el => {
      this.counterObserver.observe(el);
    });
  }
};

// ============================================
// LEGACY WRAPPER — keeps existing code working
// ============================================
const setupScrollAnimations = (selector) => {
  document.querySelectorAll(selector).forEach(el => {
    AnimationEngine.observe(el);
  });
};


document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('siteHeader');
  const handleScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
  const hamburger = document.getElementById('hamburger');
  const mainNav = document.getElementById('mainNav');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mainNav.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.header-inner')) {
      hamburger.classList.remove('active');
      mainNav.classList.remove('open');
    }
  });
  Toast.init();
  // Dropdown toggle for Modelos
  document.addEventListener('click', (e) => {
    const toggle = e.target.closest('.nav-dropdown-toggle');
    if (toggle) {
      e.preventDefault();
      const dropdown = toggle.closest('.nav-dropdown');
      if (dropdown) {
        const isOpen = dropdown.classList.contains('dropdown-open');
        document.querySelectorAll('.nav-dropdown.dropdown-open').forEach(d => d.classList.remove('dropdown-open'));
        if (!isOpen) dropdown.classList.add('dropdown-open');
      }
      return;
    }
    const ddItem = e.target.closest('.dropdown-item');
    if (ddItem) {
      document.querySelectorAll('.nav-dropdown.dropdown-open').forEach(d => d.classList.remove('dropdown-open'));
      return;
    }
    if (!e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown.dropdown-open').forEach(d => d.classList.remove('dropdown-open'));
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.nav-dropdown.dropdown-open').forEach(d => d.classList.remove('dropdown-open'));
    }
  });
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-whatsapp');
    if (btn) {
      e.preventDefault();
      const text = btn.dataset.msg || encodeURIComponent('Hola, me interesa un vehículo Honda. ¿Podrían darme más información?');
      window.open(`https://wa.me/584125697160?text=${text}`, '_blank');
    }
  });

  // Init Animation Engine
  AnimationEngine.init();
  AnimationEngine.setupCounters();

  // Init Premium Interactions
  initTiltCards();
  initCardGlow();
  initMagneticButtons();
  initButtonRipple();
  initPageHeroParallax();
});

const setupFAQ = () => {
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
};

window.initHome = () => {
};

window.initModelos = () => {
  document.querySelectorAll('.model-grid-card').forEach(card => {
    card.onclick = (e) => {
      if (e.target.closest('.btn-whatsapp')) return;
      const target = card.dataset.href;
      if (target) location.hash = target;
    };
  });
};


window.initModelDetail = (model) => {
  const page = document.getElementById(`page-${model}`);
  if (!page) return;

  page.querySelectorAll('.detail-tab').forEach(tab => {
    tab.onclick = () => {
      page.querySelectorAll('.detail-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.detailTab;
      page.querySelectorAll('.detail-panel').forEach(p => p.classList.remove('active'));
      const targetPanel = page.querySelector(`#d${target}-${model}`);
      if (targetPanel) targetPanel.classList.add('active');
    };
  });

  page.querySelectorAll('.color-carousel').forEach(carousel => {
    const track = carousel.querySelector('.color-carousel-track');
    const dots = carousel.querySelectorAll('.color-dot');
    const nameEl = carousel.querySelector('.color-carousel-name');
    const prevBtn = carousel.querySelector('.color-arrow-prev');
    const nextBtn = carousel.querySelector('.color-arrow-next');
    if (!track || !dots.length) return;

    let current = 0;
    const total = dots.length;

    function goTo(index) {
      if (index < 0) index = total - 1;
      if (index >= total) index = 0;
      current = index;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
      if (nameEl && dots[current].dataset.color) {
        nameEl.textContent = dots[current].dataset.color;
      }
    }

    dots.forEach((dot, i) => {
      if (dot.dataset.index !== undefined) {
        dot.onclick = () => goTo(parseInt(dot.dataset.index));
      }
    });

    if (prevBtn) prevBtn.onclick = () => goTo(current - 1);
    if (nextBtn) nextBtn.onclick = () => goTo(current + 1);
  });
};



window.initTaller = () => {
  const monthEl = document.getElementById('tallerMonth');
  const gridEl = document.getElementById('tallerGrid');
  const prevBtn = document.getElementById('tallerPrev');
  const nextBtn = document.getElementById('tallerNext');
  const timeBtns = document.querySelectorAll('.taller-time-btn');
  const scheduleBtn = document.getElementById('tallerScheduleBtn');
  let today = new Date();
  let month = today.getMonth();
  let year = today.getFullYear();
  let selectedDay = null;
  let selectedTime = null;
  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const dayHeaders = ['Do','Lu','Ma','Mi','Ju','Vi','Sa'];
  const renderCal = () => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayDate = today.getDate(), todayMonth = today.getMonth(), todayYear = today.getFullYear();
    const unavailable = new Set();
    for (let d = 1; d <= daysInMonth; d++) { if (new Date(year, month, d).getDay() === 0) unavailable.add(d); }
    unavailable.add(15);
    for (let d = 1; d <= 7; d++) { if (new Date(year, month, d).getDay() === 1) { unavailable.add(d); break; } }
    if (monthEl) monthEl.textContent = monthNames[month] + ' ' + year;
    let html = dayHeaders.map(d => `<div class="cal-day-header">${d}</div>`).join('');
    for (let i = 0; i < firstDay; i++) html += '<div class="cal-day disabled"></div>';
    for (let d = 1; d <= daysInMonth; d++) {
      const isPast = new Date(year, month, d) < new Date(todayYear, todayMonth, todayDate);
      const isUnavailable = unavailable.has(d);
      const isToday = d === todayDate && month === todayMonth && year === todayYear;
      const isSelected = d === selectedDay;
      const isAvailable = !isPast && !isUnavailable;
      let cls = 'cal-day';
      if (isPast || isUnavailable) cls += ' disabled';
      if (isAvailable) cls += ' available';
      if (isToday) cls += ' today';
      if (isSelected) cls += ' selected';
      html += `<div class="${cls}" data-day="${d}">${d}</div>`;
    }
    if (gridEl) {
      gridEl.innerHTML = html;
      gridEl.querySelectorAll('.cal-day.available').forEach(el => {
        el.addEventListener('click', () => {
          gridEl.querySelectorAll('.cal-day.selected').forEach(e => e.classList.remove('selected'));
          el.classList.add('selected');
          selectedDay = parseInt(el.dataset.day);
        });
      });
    }
  };
  if (prevBtn) prevBtn.addEventListener('click', () => { month--; if (month < 0) { month = 11; year--; } selectedDay = null; renderCal(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { month++; if (month > 11) { month = 0; year++; } selectedDay = null; renderCal(); });
  timeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      timeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedTime = btn.dataset.time;
    });
  });
  if (scheduleBtn) {
    scheduleBtn.addEventListener('click', () => {
      const name = document.getElementById('tallerName');
      const email = document.getElementById('tallerEmail');
      const phone = document.getElementById('tallerPhone');
      const vin = document.getElementById('tallerVin');
      const model = document.getElementById('tallerModel');
      const km = document.getElementById('tallerKm');
      const stype = document.getElementById('tallerType');
      if (!name?.value?.trim()) { Toast.show('Campo requerido', 'Ingresa tu nombre completo.', 'error'); name?.focus(); return; }
      if (!email?.value?.trim() || !email.value.includes('@')) { Toast.show('Campo requerido', 'Ingresa un correo electrónico válido.', 'error'); email?.focus(); return; }
      if (!phone?.value?.trim()) { Toast.show('Campo requerido', 'Ingresa tu teléfono.', 'error'); phone?.focus(); return; }
      if (!model?.value) { Toast.show('Campo requerido', 'Selecciona un modelo.', 'error'); return; }
      if (!km?.value) { Toast.show('Campo requerido', 'Ingresa el kilometraje actual.', 'error'); km?.focus(); return; }
      if (!selectedDay) { Toast.show('Campo requerido', 'Selecciona una fecha disponible.', 'error'); return; }
      if (!selectedTime) { Toast.show('Campo requerido', 'Selecciona un horario.', 'error'); return; }
      const vinText = vin?.value?.trim() ? `, VIN: ${vin.value.trim().toUpperCase()}` : '';
      const msg = encodeURIComponent(`Hola, soy ${name.value.trim()}. Solicito cita en el taller para mi ${model.options[model.selectedIndex].text}.${vinText} Kilometraje: ${km.value} km. Servicio: ${stype.options[stype.selectedIndex].text}. Fecha: ${selectedDay}/${month + 1}/${year} - ${selectedTime}. Tel: ${phone.value.trim()}`);
      window.open(`https://wa.me/584125697160?text=${msg}`, '_blank');
      name.value = ''; email.value = ''; phone.value = ''; if (vin) vin.value = '';
      timeBtns.forEach(b => b.classList.remove('active'));
      if (gridEl) gridEl.querySelectorAll('.cal-day.selected').forEach(e => e.classList.remove('selected'));
      selectedDay = null; selectedTime = null;
    });
  }
  document.querySelectorAll('.service-package').forEach(pkg => {
    pkg.addEventListener('click', () => {
      document.querySelectorAll('.service-package').forEach(p => p.classList.remove('active'));
      pkg.classList.add('active');
    });
  });
  setupFAQ();
  if (gridEl) renderCal();
};

window.initRespuestos = () => {
};

// ============================================
// PREMIUM INTERACTION EFFECTS
// ============================================

function initTiltCards() {
  const cards = document.querySelectorAll('.tilt-card');
  if (!cards.length) return;
  cards.forEach(card => {
    let animFrame = null;
    card.addEventListener('mousemove', (e) => {
      if (animFrame) cancelAnimationFrame(animFrame);
      animFrame = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const tiltX = (y - 0.5) * -12;
        const tiltY = (x - 0.5) * 12;
        card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(6px)`;
      });
    });
    card.addEventListener('mouseleave', () => {
      if (animFrame) cancelAnimationFrame(animFrame);
      card.style.transform = '';
    });
  });
}

function initCardGlow() {
  const cards = document.querySelectorAll('.card-glow');
  if (!cards.length) return;
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', `${x}%`);
      card.style.setProperty('--my', `${y}%`);
    });
  });
}

function initMagneticButtons() {
  const buttons = document.querySelectorAll('.btn-magnetic');
  if (!buttons.length) return;
  buttons.forEach(btn => {
    let animFrame = null;
    btn.addEventListener('mousemove', (e) => {
      if (animFrame) cancelAnimationFrame(animFrame);
      animFrame = requestAnimationFrame(() => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        btn.style.transform = `translate(${x * 8}px, ${y * 8}px)`;
      });
    });
    btn.addEventListener('mouseleave', () => {
      if (animFrame) cancelAnimationFrame(animFrame);
      btn.style.transform = '';
    });
  });
}

function initButtonRipple() {
  document.querySelectorAll('.btn-ripple').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      ripple.style.left = `${x * 100}%`;
      ripple.style.top = `${y * 100}%`;
      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
}

function initPageHeroParallax() {
  document.querySelectorAll('.hero-parallax').forEach(section => {
    const layers = section.querySelectorAll('.parallax-layer');
    if (!layers.length) return;
    window.addEventListener('scroll', () => {
      const rect = section.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const progress = rect.top / window.innerHeight;
        layers.forEach(layer => {
          const speed = parseFloat(layer.dataset.speed || 0.2);
          const y = progress * speed * 100;
          layer.style.transform = `translateY(${y}px)`;
        });
      }
    }, { passive: true });
  });
}

window.initNosotros = () => {
  document.getElementById('contactSendBtn')?.addEventListener('click', () => {
    const name = document.getElementById('contactName');
    const email = document.getElementById('contactEmail');
    const phone = document.getElementById('contactPhone');
    const msg = document.getElementById('contactMsg');
    if (!name?.value?.trim()) { Toast.show('Campo requerido', 'Ingresa tu nombre completo.', 'error'); name?.focus(); return; }
    if (!email?.value?.trim() || !email.value.includes('@')) { Toast.show('Campo requerido', 'Ingresa un correo electrónico válido.', 'error'); email?.focus(); return; }
    if (!phone?.value?.trim()) { Toast.show('Campo requerido', 'Ingresa tu teléfono.', 'error'); phone?.focus(); return; }
    const text = encodeURIComponent(`Hola, soy ${name.value.trim()}. ${msg?.value?.trim() ? 'Mensaje: ' + msg.value.trim() : 'Quiero más información.'} Tel: ${phone.value.trim()}, Correo: ${email.value.trim()}`);
    window.open(`https://wa.me/584125697160?text=${text}`, '_blank');
    name.value = ''; email.value = ''; phone.value = ''; if (msg) msg.value = '';
  });
};
