'use strict';

/* ─── STATE ─── */
let soundEnabled = false;
let audioCtx = null;

/* ─── AUDIO CONTEXT ─── */
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(freq = 440, type = 'sine', duration = 0.08, gain = 0.06) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const vol = ctx.createGain();
    osc.connect(vol);
    vol.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.8, ctx.currentTime + duration);
    vol.gain.setValueAtTime(gain, ctx.currentTime);
    vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

function playClick()  { playTone(880, 'sine', 0.06, 0.08); }
function playHover()  { playTone(1200, 'sine', 0.04, 0.025); }
function playReveal() { playTone(660, 'triangle', 0.12, 0.04); }

/* ─── CURSOR GLOW ─── */
const cursorGlow = document.getElementById('cursorGlow');
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorGlow.style.left = e.clientX + 'px';
  cursorGlow.style.top  = e.clientY + 'px';
});

/* ─── NAV SCROLL ─── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ─── SOUND TOGGLE ─── */
const soundToggle = document.getElementById('soundToggle');
const soundIcon   = document.getElementById('soundIcon');
soundToggle.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundToggle.classList.toggle('active', soundEnabled);
  soundIcon.textContent = soundEnabled ? '♪' : '♩';
  if (soundEnabled) {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    playTone(880, 'sine', 0.1, 0.06);
  }
});

/* ─── SOUND ON ELEMENTS ─── */
document.querySelectorAll('[data-sound]').forEach(el => {
  const type = el.dataset.sound;
  if (type === 'hover') el.addEventListener('mouseenter', playHover);
  if (type === 'click') el.addEventListener('click', playClick);
});

/* ─── TYPEWRITER ─── */
const typeEl = document.getElementById('typewriter');
if (typeEl) {
const phrases = [
  'measurable impact.',
  'lasting culture.',
  'faster discovery.',
  'AI-powered UX.',
  'with clarity.',
];
let pi = 0, ci = 0, deleting = false;

function typeStep() {
  const phrase = phrases[pi];
  if (!deleting) {
    typeEl.textContent = phrase.slice(0, ++ci);
    if (ci === phrase.length) {
      setTimeout(() => { deleting = true; typeStep(); }, 2200);
      return;
    }
    setTimeout(typeStep, 55);
  } else {
    typeEl.textContent = phrase.slice(0, --ci);
    if (ci === 0) {
      deleting = false;
      pi = (pi + 1) % phrases.length;
      setTimeout(typeStep, 380);
      return;
    }
    setTimeout(typeStep, 32);
  }
}
setTimeout(typeStep, 1200);
}

/* ─── SCROLL REVEAL (IntersectionObserver) ─── */
const revealEls = document.querySelectorAll('.reveal-up, .reveal-fade, .reveal-scale');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const delay = parseFloat(el.dataset.delay || 0);
      const siblings = [...el.parentElement.children].filter(c => c.classList.contains(el.className.split(' ')[0]));
      const idx = siblings.indexOf(el);
      setTimeout(() => {
        el.classList.add('is-visible');
        playReveal();
        revealObs.unobserve(el);
      }, delay + idx * 80);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => revealObs.observe(el));

/* ─── STAT COUNTER ANIMATION ─── */
const statEls = document.querySelectorAll('.stat-number[data-count]');
const statObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.count);
      let current = 0;
      const step = Math.max(1, Math.round(target / 40));
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current;
        if (current >= target) clearInterval(timer);
      }, 30);
      statObs.unobserve(el);
    }
  });
}, { threshold: 0.5 });
statEls.forEach(el => statObs.observe(el));

/* ─── MAGNETIC EFFECT ─── */
document.querySelectorAll('.magnetic').forEach(el => {
  el.addEventListener('mousemove', e => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) * 0.28;
    const dy = (e.clientY - cy) * 0.28;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = '';
  });
});

/* ─── PARALLAX ORBS ─── */
const orb1 = document.querySelector('.orb-1');
const orb2 = document.querySelector('.orb-2');
const orb3 = document.querySelector('.orb-3');
if (orb1 && orb2 && orb3) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    orb1.style.transform = `translate(${y * 0.04}px, ${y * 0.06}px)`;
    orb2.style.transform = `translate(${-y * 0.03}px, ${y * 0.04}px)`;
    orb3.style.transform = `translate(${y * 0.02}px, ${-y * 0.03}px)`;
  }, { passive: true });
}

/* ─── 3D TILT ON CASE MOCKUPS ─── */
document.querySelectorAll('.case-mockup').forEach(el => {
  el.addEventListener('mousemove', e => {
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 12;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * -12;
    el.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) translateY(-8px)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = '';
  });
});

/* ─── SMOOTH ACTIVE NAV LINK ─── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
const sectionObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color = link.hash === '#' + entry.target.id ? 'var(--text)' : '';
      });
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => sectionObs.observe(s));
