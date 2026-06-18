// Mobile Menu Toggle
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');

// Toggle menu
menuBtn.addEventListener('click', () => {
  menuBtn.classList.toggle('active');
  navLinks.classList.toggle('active');
});

// Close menu when link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    menuBtn.classList.remove('active');
    navLinks.classList.remove('active');
  });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav')) {
    menuBtn.classList.remove('active');
    navLinks.classList.remove('active');
  }
});

// Loading Screen Script
window.addEventListener('load', function() {
    setTimeout(function() {
        document.getElementById('loadingScreen').classList.add('hidden');
        document.body.style.overflow = 'auto';
    }, 2000); // Adjust delay (2000ms = 2 seconds)
});

/* utilities */
const qs = s => document.querySelector(s);
const qsa = s => Array.from(document.querySelectorAll(s));

/* -------------------------
   PARTICLE SYSTEM (canvas)
   ------------------------- */
(function particles() {
  const canvas = document.createElement('canvas');
  canvas.id = 'particles-canvas';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let w = innerWidth, h = innerHeight;
  const DPR = Math.max(1, window.devicePixelRatio || 1);

  function setSize() {
    w = innerWidth; h = innerHeight;
    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  setSize();

  let particles = [];
  function rand(min, max){ return Math.random()*(max-min)+min; }

  function initParticles() {
    particles = [];
    const count = Math.max(30, Math.round((w * h) / 120000)); // tuned density
    for (let i=0; i<count; i++){
      particles.push({
        x: rand(0, w),
        y: rand(0, h),
        vx: rand(-0.05, 0.05),
        vy: rand(-0.01, 0.02),
        r: rand(0.6, 2.2),
        alpha: rand(0.06, 0.25)
      });
    }
  }
  initParticles();

  window.addEventListener('resize', () => { setSize(); initParticles(); });

  function draw() {
    ctx.clearRect(0,0,w,h);
    for (let p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;

      // radial glow
      ctx.beginPath();
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, Math.max(6, p.r * 8));
      grad.addColorStop(0, `rgba(58,160,255,${p.alpha * 0.9})`);
      grad.addColorStop(0.4, `rgba(58,160,255,${p.alpha * 0.28})`);
      grad.addColorStop(1, `rgba(20,30,40,0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(p.x - p.r*8, p.y - p.r*8, Math.max(12, p.r*16), Math.max(12, p.r*16));
      ctx.closePath();
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

/* -------------------------
   LIGHTING SWEEP & FOG DOM
   ------------------------- */
(function addVisualLayers(){
  if (!qs('.sweep')) {
    const sweep = document.createElement('div');
    sweep.className = 'sweep';
    document.body.appendChild(sweep);
  }
  if (!qs('.fog-1')) {
    const f1 = document.createElement('div');
    f1.className = 'fog-layer fog-1';
    document.body.appendChild(f1);
  }
  if (!qs('.fog-2')) {
    const f2 = document.createElement('div');
    f2.className = 'fog-layer fog-2';
    document.body.appendChild(f2);
  }
})();

/* -------------------------
   SMOOTH SCROLL LINKS (custom easing)
   ------------------------- */
(function smoothLinks(){
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e){
      const id = this.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const start = window.scrollY;
      const end = target.getBoundingClientRect().top + start - 16;
      const duration = 720;
      let startTime = null;
      const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
      function step(ts){
        if (!startTime) startTime = ts;
        const elapsed = ts - startTime;
        const t = Math.min(1, elapsed / duration);
        window.scrollTo(0, Math.round(start + (end - start) * easeOutCubic(t)));
        if (elapsed < duration) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  });
})();

/* -------------------------
   PARALLAX BACKGROUND (mouse + scroll)
   ------------------------- */
(function parallax(){
  let mouseX = 0, mouseY = 0, px = 0, py = 0;
  let scrollY = window.scrollY || 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / innerWidth - 0.5) * 6;
    mouseY = (e.clientY / innerHeight - 0.5) * 4;
  });
  window.addEventListener('scroll', () => { scrollY = window.scrollY; });

  function update(){
    px += (mouseX - px) * 0.08;
    py += (mouseY - py) * 0.08;
    const scrollOffset = (scrollY / Math.max(document.body.scrollHeight - innerHeight, 1)) * 6;
    const posX = 50 + px * 1.2;
    const posY = 50 + py * 0.9 + scrollOffset;
    document.body.style.backgroundPosition = `${posX}% ${posY}%`;
    requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
})();

/* -------------------------
   HOVER DEPTH + MOTION BLUR interactions
   ------------------------- */
(function hoverDepthMotion(){
  const interactive = qsa('.video-card, .logo, .cta, .about-image img, .video-card img');
  // pointer velocity tracking
  let last = {x:0,y:0,t: performance.now()};
  let vel = 0;

  window.addEventListener('pointermove', e => {
    const now = performance.now();
    const dx = e.clientX - last.x;
    const dy = e.clientY - last.y;
    const dt = Math.max(8, now - last.t);
    vel = Math.min(80, Math.sqrt(dx*dx + dy*dy) / dt * 2500);
    last.x = e.clientX; last.y = e.clientY; last.t = now;
  });

  let hoverEl = null;

  function applyBlur(el){
    const blur = Math.min(8, Math.max(0, vel * 0.03));
    el.style.filter = `blur(${blur}px) saturate(${1 + Math.min(0.25, vel*0.002)})`;
  }
  function clearBlur(el){ el.style.filter = ''; }

  interactive.forEach(el => {
    el.classList.add('motion-blur');
    el.addEventListener('pointerenter', () => hoverEl = el);
    el.addEventListener('pointerleave', () => { clearBlur(el); hoverEl = null; });
  });

  // tilt effect for .video-card
  qsa('.video-card').forEach(card => {
    let rect = null;
    card.addEventListener('pointermove', e => {
      rect = rect || card.getBoundingClientRect();
      const px = (e.clientX - (rect.left + rect.width/2)) / rect.width;
      const py = (e.clientY - (rect.top + rect.height/2)) / rect.height;
      const rx = -py * 6;
      const ry = px * 8;
      card.style.transform = `translateY(-6px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.01)`;
      card.style.boxShadow = `0 30px 80px rgba(0,0,0,0.65)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
      rect = null;
    });
  });

  // continuous loop to apply blur while hovering
  (function loop(){
    if (hoverEl) applyBlur(hoverEl);
    vel *= 0.92; // decay
    requestAnimationFrame(loop);
  })();
})();



/* -------------------------
   finishing touches
   ------------------------- */
(function finishing(){
  const yEl = qs('#year'); if (yEl) yEl.textContent = new Date().getFullYear();
  // nav hide on scroll
  let lastY = window.scrollY;
  const nav = qs('.nav');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > lastY && y > 100) { nav.style.transform = 'translateY(-100%)'; }
    else { nav.style.transform = 'translateY(0)'; }
    lastY = y;
  });
})();

// CV Modal Functionality
const cvModal = document.getElementById('cvModal');
const openCvBtn = document.getElementById('openCvBtn');
const closeCvBtn = document.getElementById('closeCvBtn');

// Open Modal
openCvBtn.addEventListener('click', function() {
  cvModal.classList.add('active');
  document.body.style.overflow = 'hidden'; // Prevent scrolling
});

// Close Modal
closeCvBtn.addEventListener('click', function() {
  cvModal.classList.remove('active');
  document.body.style.overflow = 'auto'; // Allow scrolling
});

// Close modal when clicking outside the content
cvModal.addEventListener('click', function(event) {
  if (event.target === cvModal) {
    cvModal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    cvModal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
});

