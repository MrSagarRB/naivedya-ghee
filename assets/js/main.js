/* Naivedya Pure Gavran Ghee — site behaviour (no dependencies) */

/* ============================================================
   EDIT THESE: your real business details.
   whatsapp / phone: digits only with country code (India = 91), e.g. "919876543210"
   ============================================================ */
const SITE = {
  whatsapp: "918669406563",
  phone: "918669406563",
  phoneDisplay: "+91 86694 06563",
  email: "",          // optional, e.g. "hello@naivedya.in"
  address: "",        // optional, e.g. "Village, Taluka, District, Maharashtra 4XXXXX"
  fssai: "",          // optional, e.g. "12345678901234" — shown in the footer when set
};

(() => {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const fmt = n => n.toLocaleString("en-IN");
  const configured = !/X/i.test(SITE.whatsapp);

  const waLink = text => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
  const DEFAULT_MSG = "Hello Naivedya! I'd like to order Pure Gavran Ghee. Please share the details.";

  /* ---------- Contact details ---------- */
  $$("[data-wa]").forEach(a => {
    a.href = waLink(DEFAULT_MSG);
    a.target = "_blank";
    a.rel = "noopener";
  });
  $$("[data-call]").forEach(a => { a.href = `tel:+${SITE.phone}`; });
  if (configured) $$("[data-phone-text]").forEach(el => { el.textContent = SITE.phoneDisplay; });
  if (SITE.address) $$("[data-address]").forEach(el => { el.textContent = SITE.address; });
  if (SITE.email) {
    const card = $("[data-email-card]"), link = $("[data-email-link]");
    link.href = `mailto:${SITE.email}`; link.textContent = SITE.email; card.hidden = false;
  }
  if (SITE.fssai) { const f = $("[data-fssai]"); f.textContent = `FSSAI Lic. No: ${SITE.fssai}`; f.hidden = false; }
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Header: shadow on scroll + mobile menu ---------- */
  const header = $(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const menuBtn = $("#menuBtn"), nav = $("#nav");
  const setMenu = open => {
    nav.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  menuBtn.addEventListener("click", () => setMenu(menuBtn.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") { setMenu(false); menuBtn.focus(); } });
  document.addEventListener("click", e => { if (!e.target.closest(".site-header")) setMenu(false); });

  /* ---------- Reveal on scroll ---------- */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); obs.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add("in"));
  }

  /* ---------- Active nav link ---------- */
  const links = $$('.nav ul a[href^="#"]');
  const targets = links.map(a => $(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${en.target.id}`));
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    targets.forEach(t => spy.observe(t));
  }

  /* ---------- Product quantity + order ---------- */
  $$(".product-card").forEach(card => {
    const size = card.dataset.size, price = +card.dataset.price;
    const out = $(".qty-val", card), total = $(".line-total span", card), order = $("[data-order]", card);
    let qty = 1;
    const sync = () => {
      out.textContent = qty;
      total.textContent = fmt(qty * price);
      total.classList.remove("bump"); void total.offsetWidth; total.classList.add("bump");
      const msg = `Hello Naivedya! I'd like to order ${qty} × ${size} Pure Gavran Ghee (₹${fmt(qty * price)}). Please share the delivery details.`;
      order.href = waLink(msg);
    };
    order.target = "_blank"; order.rel = "noopener";
    $$(".qty-btn", card).forEach(btn => btn.addEventListener("click", () => {
      qty = Math.min(20, Math.max(1, qty + +btn.dataset.qty));
      sync();
    }));
    sync();
  });

  /* ---------- Reviews carousel ---------- */
  const track = $("#reviewTrack");
  const step = () => Math.max(track.clientWidth * 0.8, 280);
  $("#revPrev").addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
  $("#revNext").addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
  track.addEventListener("keydown", e => {
    if (e.key === "ArrowRight") track.scrollBy({ left: step(), behavior: "smooth" });
    if (e.key === "ArrowLeft") track.scrollBy({ left: -step(), behavior: "smooth" });
  });

  /* ---------- Enquiry form → WhatsApp ---------- */
  const form = $("#enquiryForm");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const name = form.name.value.trim();
    form.name.classList.toggle("invalid", !name);
    if (!name) { form.name.focus(); return; }
    const parts = [`Hello Naivedya! My name is ${name}.`];
    if (form.size.value) parts.push(`I'm interested in ${form.size.value}.`);
    if (form.msg.value.trim()) parts.push(form.msg.value.trim());
    window.open(waLink(parts.join(" ")), "_blank", "noopener");
  });
  form.name.addEventListener("input", () => form.name.classList.remove("invalid"));

  /* ============================================================
     Motion layer
     ============================================================ */
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Split headings into words for a masked reveal ---------- */
  const splitWords = el => {
    let i = 0;
    const walk = node => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(part); return; }
            const w = document.createElement("span"), inner = document.createElement("span");
            w.className = "w"; inner.className = "w-i"; inner.style.setProperty("--i", i++);
            inner.textContent = part; w.append(inner); frag.append(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.classList.contains("gold-text")) {
          // keep gradient text intact: animate it as one unit
          const w = document.createElement("span"), inner = document.createElement("span");
          w.className = "w"; inner.className = "w-i"; inner.style.setProperty("--i", i++);
          child.replaceWith(w); inner.append(child); w.append(inner);
        } else if (child.nodeType === 1 && child.tagName !== "BR") {
          walk(child);
        }
      });
    };
    walk(el);
    el.classList.add("split");
  };
  if (!calm) $$(".hero-title, h2.reveal").forEach(splitWords);

  /* ---------- Rising ghee particles in the hero ---------- */
  const particles = $(".particles");
  if (particles && !calm) {
    const count = window.innerWidth < 600 ? 10 : 18;
    for (let n = 0; n < count; n++) {
      const p = document.createElement("i");
      const r = (a, b) => (a + Math.random() * (b - a)).toFixed(2);
      p.style.cssText = `--x:${r(0, 100)}%;--s:${r(4, 12)}px;--t:${r(9, 18)}s;--delay:${r(-18, 0)}s;--drift:${r(-60, 60)}px`;
      particles.append(p);
    }
  }

  /* ---------- Scroll-linked effects (one rAF loop) ---------- */
  const bar = $(".scroll-progress span");
  const heroFrame = $(".hero-frame");
  const seal = $(".seal");
  const steps = $(".steps");
  let ticking = false;
  const onScrollFx = () => {
    ticking = false;
    const y = window.scrollY, vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    bar.style.setProperty("--progress", max > 0 ? (y / max).toFixed(4) : 0);
    if (calm) return;
    if (y < vh * 1.2) {
      heroFrame.style.setProperty("--py", `${(y * -0.08).toFixed(1)}px`);
      seal.style.setProperty("--seal-rot", `${(y * 0.25).toFixed(1)}deg`);
    }
    const r = steps.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (vh * 0.8 - r.top) / (r.height * 0.6)));
    steps.style.setProperty("--line", t.toFixed(3));
  };
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScrollFx); } }, { passive: true });
  window.addEventListener("resize", onScrollFx, { passive: true });
  onScrollFx();

  /* ---------- 3D tilt + spotlight (mouse only) ---------- */
  if (finePointer && !calm) {
    $$("[data-tilt]").forEach(el => {
      const isHero = el.classList.contains("hero-frame");
      const max = isHero ? 8 : 6;
      el.addEventListener("pointermove", e => {
        const b = el.getBoundingClientRect();
        const px = (e.clientX - b.left) / b.width, py = (e.clientY - b.top) / b.height;
        const rx = ((0.5 - py) * max).toFixed(2), ry = ((px - 0.5) * max).toFixed(2);
        el.classList.add("tilting");
        el.style.setProperty("--sx", `${(px * 100).toFixed(1)}%`);
        el.style.setProperty("--sy", `${(py * 100).toFixed(1)}%`);
        if (isHero) { el.style.setProperty("--rx", `${rx}deg`); el.style.setProperty("--ry", `${ry}deg`); }
        else el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-8px)`;
      });
      el.addEventListener("pointerleave", () => {
        el.classList.remove("tilting");
        if (isHero) { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); }
        else el.style.transform = "";
      });
    });
    $$("[data-spot]").forEach(el => el.addEventListener("pointermove", e => {
      const b = el.getBoundingClientRect();
      el.style.setProperty("--sx", `${e.clientX - b.left}px`);
      el.style.setProperty("--sy", `${e.clientY - b.top}px`);
    }));

    /* Magnetic buttons */
    $$(".btn-lg, .nav-cta .btn, .order-btn").forEach(btn => {
      btn.addEventListener("pointermove", e => {
        const b = btn.getBoundingClientRect();
        btn.style.setProperty("--mx", `${((e.clientX - b.left - b.width / 2) * 0.18).toFixed(1)}px`);
        btn.style.setProperty("--my", `${((e.clientY - b.top - b.height / 2) * 0.3).toFixed(1)}px`);
      });
      btn.addEventListener("pointerleave", () => { btn.style.setProperty("--mx", "0px"); btn.style.setProperty("--my", "0px"); });
    });
  }

  /* ---------- Ripple on press ---------- */
  if (!calm) {
    document.addEventListener("pointerdown", e => {
      const btn = e.target.closest(".btn");
      if (!btn) return;
      const b = btn.getBoundingClientRect(), size = Math.max(b.width, b.height) * 2.2;
      const r = document.createElement("span");
      r.className = "ripple";
      r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - b.left - size / 2}px;top:${e.clientY - b.top - size / 2}px`;
      btn.append(r);
      r.addEventListener("animationend", () => r.remove());
    });
  }

  /* ---------- Count-up stats ---------- */
  const counters = $$("[data-count]");
  const runCount = el => {
    const to = +el.dataset.count, from = +(el.dataset.from || 0), suffix = el.dataset.suffix || "";
    if (calm) { el.textContent = to + suffix; return; }
    const dur = 1600, start = performance.now();
    const tick = now => {
      const k = Math.min(1, (now - start) / dur), eased = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(from + (to - from) * eased) + suffix;
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window) {
    const co = new IntersectionObserver((entries, obs) => entries.forEach(en => {
      if (en.isIntersecting) { runCount(en.target); obs.unobserve(en.target); }
    }), { threshold: 0.6 });
    counters.forEach(c => { if (!calm) c.textContent = (c.dataset.from || 0) + (c.dataset.suffix || ""); co.observe(c); });
  }

  /* ---------- Reviews autoplay (pauses on interaction) ---------- */
  if (!calm) {
    let paused = false, visible = false;
    ["pointerenter", "focusin", "touchstart"].forEach(ev => track.addEventListener(ev, () => { paused = true; }, { passive: true }));
    ["pointerleave", "focusout"].forEach(ev => track.addEventListener(ev, () => { paused = false; }));
    if ("IntersectionObserver" in window) new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(track);
    setInterval(() => {
      if (paused || !visible || document.hidden) return;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
      track.scrollTo({ left: atEnd ? 0 : track.scrollLeft + step(), behavior: "smooth" });
    }, 4500);
  }
})();
