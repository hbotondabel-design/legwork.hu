document.documentElement.classList.add("js");

// Reveal on scroll (IntersectionObserver, no scroll listeners).
(() => {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  els.forEach(e => io.observe(e));
})();

// Sample variant switcher.
(() => {
  const view = document.querySelector("[data-sample-view]");
  if (!view) return;
  const tabs = document.querySelectorAll("[data-variant]");
  const desk = view.querySelector("[data-desk]");
  const phone = view.querySelector("[data-phone]");
  const cap = document.querySelector("[data-sample-cap]");
  const select = (t) => {
    if (t.getAttribute("aria-selected") === "true") return;
    tabs.forEach(x => {
      const on = x === t;
      x.setAttribute("aria-selected", on ? "true" : "false");
      x.tabIndex = on ? 0 : -1;
    });
    view.setAttribute("aria-labelledby", t.id);
    view.classList.add("swap");
    setTimeout(() => {
      desk.srcset = `${t.dataset.desk640} 640w, ${t.dataset.desk} 1280w`;
      desk.src = t.dataset.desk; desk.alt = t.dataset.alt;
      phone.src = t.dataset.phone;
      cap.innerHTML = t.dataset.cap;
      view.classList.remove("swap");
    }, 180);
  };
  tabs.forEach((t, i) => {
    const pre = new Image(); pre.src = t.dataset.desk;
    t.addEventListener("click", () => select(t));
    t.addEventListener("keydown", (e) => {
      const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      const n = tabs[(i + d + tabs.length) % tabs.length];
      n.focus(); select(n);
    });
  });
})();

// Copy e-mail address.
(() => {
  document.querySelectorAll("[data-copy]").forEach(b => {
    const label = b.textContent;
    b.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(b.dataset.copy); }
      catch (e) { window.prompt("", b.dataset.copy); return; }
      b.textContent = b.dataset.ok; b.setAttribute("data-done", "");
      setTimeout(() => { b.textContent = label; b.removeAttribute("data-done"); }, 2200);
    });
  });
})();

// Highlight the nav link of the section in view.
(() => {
  const links = new Map([...document.querySelectorAll(".nav-links a[href^='#']")].map(a => [a.getAttribute("href").slice(1), a]));
  if (!links.size || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(x => x.removeAttribute("aria-current"));
      links.get(e.target.id)?.setAttribute("aria-current", "true");
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("main > section[id], main > section.hero").forEach(el => io.observe(el));
})();

document.querySelectorAll("[data-year]").forEach(e => { e.textContent = new Date().getFullYear(); });
