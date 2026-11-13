/* ===== Easy-edit settings ===== */
const ROTATE_EVERY_MS = 2800;   // how long each animated line stays on screen

/* ---------- Mobile menu ---------- */
const toggle = document.querySelector('.nav-toggle');
const links = document.getElementById('nav-links');
toggle.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});
links.addEventListener('click', e => {
  if (e.target.tagName === 'A') { links.classList.remove('open'); toggle.setAttribute('aria-expanded', false); }
});

/* ---------- Animated text (cycles the <span>s) ---------- */
const lines = document.querySelectorAll('#animated-text span');
let current = 0;
lines[0].classList.add('active');
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  setInterval(() => {
    lines[current].classList.remove('active');
    current = (current + 1) % lines.length;
    lines[current].classList.add('active');
  }, ROTATE_EVERY_MS);
}

/* ---------- Sign-up popup ---------- */
const modal = document.getElementById('signup-modal');
const signupForm = document.getElementById('signup-form');

function openModal(plan) {
  signupForm.reset();
  signupForm.querySelector('.form-msg').textContent = '';
  signupForm.plan.value = plan || '';
  document.getElementById('modal-plan').textContent = plan ? 'Package: ' + plan : '';
  modal.hidden = false;
  signupForm.name.focus();
}
function closeModal() { modal.hidden = true; }

document.querySelectorAll('[data-plan-btn]').forEach(btn =>
  btn.addEventListener('click', () => openModal(btn.closest('.card').dataset.plan)));
document.querySelectorAll('[data-open-signup]').forEach(btn =>
  btn.addEventListener('click', e => { e.preventDefault(); openModal(''); }));
modal.querySelector('.modal-close').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

/* ---------- Forms ---------- */
/* Replace this function to send data to your own backend, e.g. fetch('/api/signup', {...}) or a Formspree URL. */
async function sendForm(type, data) {
  console.log('Form submitted:', type, data);
  return new Promise(resolve => setTimeout(resolve, 500));
}

function handleForm(form, type, successText) {
  const msg = form.querySelector('.form-msg');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    form.querySelectorAll('input, textarea').forEach(f => f.classList.add('touched'));
    if (!form.checkValidity()) {
      msg.className = 'form-msg err';
      msg.textContent = 'Please fill in every field with valid details.';
      return;
    }
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      await sendForm(type, Object.fromEntries(new FormData(form)));
      msg.className = 'form-msg ok';
      msg.textContent = successText;
      form.reset();
      form.querySelectorAll('.touched').forEach(f => f.classList.remove('touched'));
      if (type === 'signup') setTimeout(closeModal, 1800);
    } catch (err) {
      msg.className = 'form-msg err';
      msg.textContent = 'Something went wrong. Please try again.';
    }
    btn.disabled = false;
  });
}
handleForm(signupForm, 'signup', 'Thanks! We will be in touch shortly.');

/* ---------- Footer year ---------- */
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- How it works: line fills as you scroll, steps light up ---------- */
const journey = document.getElementById('journey');
const jFill = document.getElementById('j-fill');
const jSteps = [...journey.querySelectorAll('.j-step')];
function updateJourney() {
  const r = journey.getBoundingClientRect();
  const trigger = window.innerHeight * 0.6;               // change 0.6 to make steps light up earlier/later
  jFill.style.height = Math.min(Math.max(trigger - r.top, 0), r.height) + 'px';
  jSteps.forEach(s => {
    const n = s.querySelector('.j-node').getBoundingClientRect();
    s.classList.toggle('on', n.top + n.height / 2 < trigger);
  });
}
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  jSteps.forEach(s => s.classList.add('on'));
  jFill.style.height = '100%';
} else {
  window.addEventListener('scroll', updateJourney, { passive: true });
  window.addEventListener('resize', updateJourney);
  updateJourney();
}

/* ---------- Questionnaire (sliding form) ---------- */
const quiz = document.getElementById('quiz-form');
const qView = document.getElementById('q-view');
const qTrack = document.getElementById('q-track');
const qSlides = [...qTrack.children];
const qLast = qSlides.length - 2;                 // index of the contact-details slide
const qBack = document.getElementById('q-back');
const qNext = document.getElementById('q-next');
let qi = 0;

function qShow(i) {
  qi = i;
  const type = qSlides[i].dataset.type;
  const done = i > qLast;
  qTrack.style.transform = 'translateX(-' + i * 100 + '%)';
  qSlides.forEach((s, n) => { s.inert = n !== i; s.classList.toggle('active', n === i); });
  qBack.hidden = i === 0 || done;
  qNext.hidden = done || (type === 'single' && !qSlides[i].querySelector(':checked'));
  qNext.textContent = i === qLast ? 'Get my recommendation' : 'Next';
  document.getElementById('q-count').textContent = done ? 'All done' : 'Question ' + (i + 1) + ' of ' + (qLast + 1);
  document.getElementById('q-bar').style.width = Math.min((i + 1) / (qLast + 1), 1) * 100 + '%';
  qView.style.height = qSlides[i].offsetHeight + 'px';
}

/* Which package to recommend – edit the rules here */
function recommend() {
  const key = n => (quiz.querySelector('input[name="' + n + '"]:checked') || { dataset: {} }).dataset.key;
  const who = key('who'), vol = key('call_volume');
  if (who === 'dedicated' || vol === '400+') return 'Dedicated Receptionist';
  if (who === 'live') return 'Live Receptionist';
  if (who === 'ai') return 'AI Receptionist';
  return vol === 'lt40' ? 'AI Receptionist' : 'Live Receptionist';   // "not sure yet"
}

quiz.addEventListener('change', e => {
  if (e.target.type === 'radio') setTimeout(() => qShow(qi + 1), 260);   // single choice: slide on automatically
  else qShow(qi);
});
qBack.addEventListener('click', () => qShow(qi - 1));
qNext.addEventListener('click', async () => {
  if (qi < qLast) return qShow(qi + 1);
  const slide = qSlides[qi], msg = slide.querySelector('.form-msg');
  const fields = [...slide.querySelectorAll('input')];
  fields.forEach(f => f.classList.add('touched'));
  if (!fields.every(f => f.checkValidity())) {
    msg.className = 'form-msg err';
    msg.textContent = 'Please add your name, email and phone number.';
    return qShow(qi);
  }
  qNext.disabled = true;
  const fd = new FormData(quiz);
  const data = Object.fromEntries(fd);
  data.tasks = fd.getAll('tasks').join(', ');
  data.recommended = recommend();
  try {
    await sendForm('questionnaire', data);     // same placeholder as the other forms: connect it to your backend later
    document.getElementById('q-name').textContent = data.name ? ', ' + data.name.trim().split(' ')[0] : '';
    document.getElementById('q-rec').textContent = data.recommended;
    setDefaultPlan(data.recommended, 'Recommended for you');   // moves the highlighted border to the recommended package
    qShow(qi + 1);
  } catch (err) {
    msg.className = 'form-msg err';
    msg.textContent = 'Something went wrong. Please try again.';
    qShow(qi);
  }
  qNext.disabled = false;
});
quiz.addEventListener('submit', e => { e.preventDefault(); if (!qNext.hidden) qNext.click(); });
window.addEventListener('resize', () => qShow(qi));
window.addEventListener('load', () => qShow(qi));
qShow(0);

/* ---------- Pricing: the bordered highlight follows hover / swipe ---------- */
const plansBox = document.querySelector('.cards');
const planCards = [...plansBox.querySelectorAll('.card')];
const planDots = document.getElementById('plan-dots');
let defaultCard = plansBox.querySelector('[data-default]') || planCards[0];
const isSlider = () => plansBox.scrollWidth > plansBox.clientWidth + 4;   // true on phones / small tablets

function centerCard(card, smooth) {
  plansBox.scrollTo({ left: card.offsetLeft - (plansBox.clientWidth - card.offsetWidth) / 2, behavior: smooth ? 'smooth' : 'auto' });
}
planCards.forEach(card => {
  const badge = document.createElement('span');
  badge.className = 'badge'; badge.hidden = true;
  card.prepend(badge);
  const dot = document.createElement('button');
  dot.type = 'button'; dot.setAttribute('aria-label', 'Show ' + card.dataset.plan);
  dot.addEventListener('click', () => centerCard(card, true));
  planDots.appendChild(dot);
});
function setActive(card) {
  planCards.forEach((c, i) => { c.classList.toggle('featured', c === card); planDots.children[i].classList.toggle('on', c === card); });
}
/* Sets the "home" highlighted package + its badge. The quiz calls this with the recommended package. */
function setDefaultPlan(name, label) {
  const card = planCards.find(c => c.dataset.plan === name);
  if (!card) return;
  defaultCard = card;
  planCards.forEach(c => { const b = c.querySelector('.badge'); b.hidden = c !== card; b.textContent = label; });
  setActive(card);
  if (isSlider()) centerCard(card, true);
}
planCards.forEach(c => {
  c.addEventListener('mouseenter', () => { if (!isSlider()) setActive(c); });
  c.addEventListener('focusin', () => setActive(c));
});
plansBox.addEventListener('mouseleave', () => { if (!isSlider()) setActive(defaultCard); });
let planTick = null;
plansBox.addEventListener('scroll', () => {              // swiping: highlight whichever card is in the middle
  if (planTick) return;
  planTick = requestAnimationFrame(() => {
    planTick = null;
    if (!isSlider()) return;
    const box = plansBox.getBoundingClientRect(), mid = box.left + box.width / 2;
    let best = planCards[0], gap = Infinity;
    planCards.forEach(c => { const r = c.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - mid); if (d < gap) { gap = d; best = c; } });
    setActive(best);
  });
}, { passive: true });
setDefaultPlan(defaultCard.dataset.plan, 'Most popular');
if (isSlider()) centerCard(defaultCard, false);