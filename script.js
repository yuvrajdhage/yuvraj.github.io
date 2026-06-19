// =========================================================
// Respect reduced-motion preference
// =========================================================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

// =========================================================
// Typewriter effect for hero role line
// =========================================================
const roles = ['Data Analyst', 'IoT Developer', 'AI Enthusiast', 'Problem Solver'];
const typewriterEl = document.getElementById('typewriter');

function startTypewriter(){
  if (!typewriterEl) return;

  if (prefersReducedMotion) {
    typewriterEl.textContent = roles[0];
    return;
  }

  let roleIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const TYPE_SPEED = 65;
  const DELETE_SPEED = 35;
  const HOLD_TIME = 1600;

  function tick(){
    const current = roles[roleIndex];

    if (!deleting) {
      charIndex++;
      typewriterEl.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, HOLD_TIME);
        return;
      }
      setTimeout(tick, TYPE_SPEED);
    } else {
      charIndex--;
      typewriterEl.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        setTimeout(tick, 300);
        return;
      }
      setTimeout(tick, DELETE_SPEED);
    }
  }

  tick();
}

// =========================================================
// Scroll reveal via IntersectionObserver
// =========================================================
function initScrollReveal(){
  const targets = document.querySelectorAll('.fade-up');

  if (prefersReducedMotion) {
    targets.forEach(el => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
}

// =========================================================
// Mobile nav toggle
// =========================================================
function initMobileNav(){
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('is-open');
    toggle.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// =========================================================
// Active nav link highlighting on scroll (also drives the
// trace-rail dots so the two systems agree on "where you are")
// =========================================================
function initActiveNav(){
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('[data-nav]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
        document.querySelectorAll('.trace-dot').forEach(dot => {
          dot.classList.toggle('active', dot.dataset.target === id);
        });
      }
    });
  }, { threshold: 0.3, rootMargin: '-30% 0px -50% 0px' });

  sections.forEach(section => observer.observe(section));
}

// =========================================================
// Nav background intensifies on scroll (subtle)
// =========================================================
function initNavScrollState(){
  const nav = document.getElementById('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 8 ? '0 8px 24px -16px rgba(0,0,0,0.5)' : 'none';
  }, { passive: true });
}

// =========================================================
// Trace rail — fixed scroll-progress instrument. Builds one
// dot per primary section, fills a phosphor line as you scroll.
// =========================================================
function initTraceRail(){
  const rail = document.getElementById('traceRail');
  const fill = document.getElementById('traceFill');
  const dotsHost = document.getElementById('traceDots');
  if (!rail || !fill || !dotsHost) return;

  const labels = {
    about: 'ABOUT', skills: 'SKILLS', experience: 'EXPERIENCE',
    projects: 'PROJECTS', certifications: 'CERTS', contact: 'CONTACT'
  };
  const ids = Object.keys(labels);
  const sections = ids.map(id => document.getElementById(id)).filter(Boolean);
  if (!sections.length) return;

  dotsHost.innerHTML = '';
  const dots = sections.map(section => {
    const dot = document.createElement('span');
    dot.className = 'trace-dot';
    dot.dataset.target = section.id;
    dot.setAttribute('data-label', labels[section.id] || section.id.toUpperCase());
    dotsHost.appendChild(dot);
    return dot;
  });

  let min = 0, max = 1;

  function measure(){
    const first = sections[0];
    const last = sections[sections.length - 1];
    min = first.offsetTop;
    max = last.offsetTop + last.offsetHeight;
    const range = Math.max(max - min, 1);
    sections.forEach((section, i) => {
      const pct = Math.min(100, Math.max(0, ((section.offsetTop - min) / range) * 100));
      dots[i].style.top = pct + '%';
    });
  }

  function update(){
    const range = Math.max(max - min, 1);
    const pct = Math.min(100, Math.max(0, ((window.scrollY - min) / range) * 100));
    fill.style.height = pct + '%';
  }

  measure();
  update();
  window.addEventListener('resize', () => { measure(); update(); });
  window.addEventListener('scroll', update, { passive: true });
}

// =========================================================
// Custom cursor — a "probe" that trails the pointer and
// flares when it crosses anything interactive.
// =========================================================
function initProbeCursor(){
  const probe = document.getElementById('probe');
  if (!probe || !hasFinePointer) return;

  document.documentElement.classList.add('has-cursor');
  probe.classList.remove('is-hidden');

  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let probeX = mouseX, probeY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function loop(){
    probeX += (mouseX - probeX) * 0.22;
    probeY += (mouseY - probeY) * 0.22;
    probe.style.transform = `translate(${probeX}px, ${probeY}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  }
  loop();

  const interactive = document.querySelectorAll('a, button, .tilt');
  interactive.forEach(el => {
    el.addEventListener('mouseenter', () => probe.classList.add('is-active'));
    el.addEventListener('mouseleave', () => probe.classList.remove('is-active'));
  });

  document.addEventListener('mouseleave', () => probe.classList.add('is-hidden'));
  document.addEventListener('mouseenter', () => probe.classList.remove('is-hidden'));
}

// =========================================================
// Tilt — subtle 3D response on cards, reading the brief's
// own dashboards as "things that watch other things."
// =========================================================
function initTilt(){
  if (prefersReducedMotion || !hasFinePointer) return;
  const els = document.querySelectorAll('.tilt');

  els.forEach(el => {
    let raf = null;
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(900px) rotateX(${(-py * 7).toFixed(2)}deg) rotateY(${(px * 7).toFixed(2)}deg) translateZ(0)`;
      });
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
    });
  });
}

// =========================================================
// Hero mesh — a small live sensor-network simulation.
// Nodes drift, link when close, and lean toward the cursor —
// the same shape of system this page is a portfolio for.
// =========================================================
function initMesh(){
  const canvas = document.getElementById('meshCanvas');
  const hero = document.getElementById('hero');
  if (!canvas || !hero) return;
  const ctx = canvas.getContext('2d');

  if (prefersReducedMotion) return; // leave canvas blank, vignette carries the mood

  let width, height, dpr;
  let nodes = [];
  let pointer = { x: -9999, y: -9999, active: false };

  function size(){
    const rect = hero.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(85, Math.max(42, Math.floor((width * height) / 16000)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35
    }));
  }

  function step(){
    ctx.clearRect(0, 0, width, height);

    nodes.forEach(n => {
      if (pointer.active) {
        const dx = pointer.x - n.x, dy = pointer.y - n.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 160 && dist > 0.01) {
          n.vx += (dx / dist) * 0.012;
          n.vy += (dy / dist) * 0.012;
        }
      }
      n.vx *= 0.985;
      n.vy *= 0.985;
      n.x += n.vx;
      n.y += n.vy;

      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
      n.x = Math.max(0, Math.min(width, n.x));
      n.y = Math.max(0, Math.min(height, n.y));
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 130) {
          const alpha = (1 - dist / 130) * 0.5;
          ctx.strokeStyle = `rgba(60,255,176,${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    nodes.forEach(n => {
      ctx.fillStyle = 'rgba(60,255,176,0.85)';
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(step);
  }

  size();
  window.addEventListener('resize', size);
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    pointer.active = true;
  });
  hero.addEventListener('mouseleave', () => { pointer.active = false; });

  requestAnimationFrame(step);
}

// =========================================================
// Live HUD — a real clock (Asia/Kolkata) and a real session
// uptime counter. Not simulated: genuinely live values.
// =========================================================
function initHud(){
  const timeEl = document.getElementById('hudTime');
  const uptimeEl = document.getElementById('hudUptime');
  if (!timeEl && !uptimeEl) return;

  const start = Date.now();

  function update(){
    if (timeEl) {
      timeEl.textContent = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      }).format(new Date());
    }
    if (uptimeEl) {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const ss = String(elapsed % 60).padStart(2, '0');
      uptimeEl.textContent = `${mm}:${ss}`;
    }
  }

  update();
  setInterval(update, 1000);
}

// =========================================================
// Init
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  startTypewriter();
  initScrollReveal();
  initMobileNav();
  initActiveNav();
  initNavScrollState();
  initTraceRail();
  initProbeCursor();
  initTilt();
  initMesh();
  initHud();
});
