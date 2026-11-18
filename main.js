(() => {
  // Company WhatsApp number (India, country code 91).
  const WHATSAPP_NUMBER = '919943680611';
  // Optional: a form endpoint that emails each registration or enquiry to you. Leave '' until it is set up.
  const NOTIFY_URL = '';

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const waLink = (text) => `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;

  setTimeout(() => $('#intro').classList.add('done'), reduce ? 0 : 900);
  $('#yr').textContent = new Date().getFullYear();
  $('#wa').href = waLink('Hello Indhra Projects, I would like to know more about your services.');

  // header + mobile nav
  const header = $('#header'), nav = $('#nav'), menuBtn = $('#menuBtn');
  addEventListener('scroll', () => header.classList.toggle('solid', scrollY > 40), { passive: true });
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  $$('#nav a').forEach((a) => a.addEventListener('click', () => {
    nav.classList.remove('open');
    menuBtn.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }));

  // smooth in-page navigation; the course details section stays hidden until a course is opened
  const courseSec = $('#course');
  const scrollToId = (id) => {
    const el = id ? document.getElementById(id) : null;
    if (!id || !el) return scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    if (el.closest('#course') === null) courseSec.hidden = true;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    const id = decodeURIComponent(a.getAttribute('href').slice(1));
    scrollToId(id);
    if (history.replaceState) history.replaceState(null, '', id ? '#' + id : location.pathname);
  });

  $('.back').addEventListener('click', () => { courseSec.hidden = true; });

  // highlight the nav link of the section currently in view
  const spyIds = ['home', 'about', 'services', 'workshops', 'internships', 'courses', 'contact'];
  const links = new Map($$('#nav a[href^="#"]').map((a) => [a.getAttribute('href').slice(1), a]));
  const spy = () => {
    let active = 'home';
    const y = scrollY + 140;
    for (const id of spyIds) { const el = document.getElementById(id); if (el && el.offsetTop <= y) active = id; }
    if (innerHeight + scrollY >= document.body.scrollHeight - 4) active = 'contact';
    links.forEach((a, id) => a.classList.toggle('active', id === active));
  };
  addEventListener('scroll', spy, { passive: true });
  spy();

  // courses: each one opens its own page with an Enquiry and a Register option
  const COURSES = {
    workshops: { title: 'Workshops', eyebrow: 'Learn by doing', copy: 'Ask about upcoming digital marketing workshops, from social media to ads and analytics.' },
    internships: { title: 'Internships', eyebrow: 'Gain experience', copy: 'Enquire about internship opportunities and the skills you would like to develop.' },
    courses: { title: 'Professional courses', eyebrow: 'Build your next skill', copy: 'Tell us what you want to learn and ask about professional course options.' },
    'skill-development': { title: 'Technical skill development', eyebrow: 'Grow with confidence', copy: 'Explore skill-building support shaped around your learning and career goals.' },
  };
  const cEnq = $('#enquire-form'), cReg = $('#register-form'), cfb = $('#cfb');
  const flash = (msg, ok) => { cfb.className = 'fb ' + (ok ? 'ok' : 'err'); cfb.textContent = msg; };
  const setMode = (m) => {
    $$('.seg-btn').forEach((b) => b.classList.toggle('on', b.dataset.mode === m));
    cEnq.hidden = m !== 'enquire';
    cReg.hidden = m !== 'register';
    flash('', true);
    cfb.textContent = '';
  };
  $$('.seg-btn').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
  const openCourse = (key) => {
    const c = COURSES[key];
    if (!c) return;
    $('#course-title').textContent = c.title;
    $('#course-eyebrow').textContent = c.eyebrow;
    $('#course-copy').textContent = c.copy;
    cEnq.elements.course.value = c.title;
    setMode('enquire');
    courseSec.hidden = false;
    courseSec.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };
  $$('[data-course]').forEach((b) => b.addEventListener('click', () => openCourse(b.dataset.course)));
  const basics = (d) => {
    if (d.name.trim().length < 2) return 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) return 'Please enter a valid email address.';
    if (!/^[+()0-9. -]{7,30}$/.test(d.phone.trim())) return 'Please enter a valid phone number.';
    return '';
  };
  const hand = (text) => { const w = window.open(waLink(text), '_blank'); if (!w) return false; w.opener = null; return true; };
  const notify = (payload) => {
    if (NOTIFY_URL) fetch(NOTIFY_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {});
  };
  const blocked = 'Your browser blocked the WhatsApp window. Please allow pop-ups and try again.';
  cEnq.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(cEnq));
    const err = basics(d) || (d.message.trim().length < 10 ? 'Please add a little more detail to your question.' : '');
    if (err) return flash(err, false);
    const text = `Course enquiry - Indhra Projects\n\nCourse: ${d.course}\nName: ${d.name.trim()}\nEmail: ${d.email.trim()}\nPhone: ${d.phone.trim()}\n\n${d.message.trim()}`;
    if (!hand(text)) return flash(blocked, false);
    notify({ type: 'enquiry', ...d });
    cEnq.reset();
    cEnq.elements.course.value = d.course;
    flash('WhatsApp is open with your enquiry. Tap send there to reach the Indhra Projects team.', true);
  });
  cReg.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(cReg));
    const err = basics(d) || (!d.level ? 'Please choose your current status.' : !d.batch ? 'Please choose a preferred batch.' : !d.mode ? 'Please choose online or in person.' : !d.workshop ? 'Please choose a digital marketing workshop.' : !d.consent ? 'Please tick the box to confirm we can contact you.' : '');
    if (err) return flash(err, false);
    const text = `New registration - Indhra Projects\n\nName: ${d.name.trim()}\nEmail: ${d.email.trim()}\nPhone: ${d.phone.trim()}\nCity: ${(d.city || '-').trim()}\nStatus: ${d.level}\nPreferred batch: ${d.batch}\nMode: ${d.mode}\nWorkshop: ${d.workshop}`;
    if (!hand(text)) return flash(blocked, false);
    notify({ type: 'registration', ...d });
    cReg.reset();
    flash('Your registration is ready in WhatsApp. Tap send there to complete it.', true);
  });

  // scroll reveal
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.12 });
  $$('.rv').forEach((el) => io.observe(el));

  // enquiry buttons preselect the service
  const service = $('#service');
  $$('[data-service]').forEach((a) => a.addEventListener('click', () => { service.value = a.dataset.service; }));

  // enquiry form: validate, then open WhatsApp with the enquiry ready to send
  const form = $('#enquiry'), fb = $('#fb');
  const check = (d) => {
    if (d.name.trim().length < 2) return 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) return 'Please enter a valid email address.';
    if (!/^[+()0-9. -]{7,30}$/.test(d.phone.trim())) return 'Please enter a valid phone number.';
    if (!d.service) return 'Please select a service.';
    if (d.message.trim().length < 10) return 'Please add a little more detail to your message.';
    return '';
  };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const error = check(d);
    if (error) { fb.className = 'fb err'; fb.textContent = error; return; }
    const text = `Enquiry for Indhra Projects\n\nName: ${d.name.trim()}\nEmail: ${d.email.trim()}\nPhone: ${d.phone.trim()}\nService: ${d.service}\n\n${d.message.trim()}`;
    const win = window.open(waLink(text), '_blank');
    if (!win) { fb.className = 'fb err'; fb.textContent = 'Your browser blocked the WhatsApp window. Please allow pop-ups, or use the WhatsApp button.'; return; }
    win.opener = null;
    fb.className = 'fb ok';
    fb.textContent = 'WhatsApp is open with your enquiry. Tap send there to reach the Indhra Projects team.';
    form.reset();
  });
})();
