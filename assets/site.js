document.documentElement.classList.add("js");

// Motion v2 (2026-10-20). Csökkentett mozgásnál semmi nem animál (a CSS is kikapcsol).
const csendes = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Főcím: szavanként úszik be (a szöveg olvasható marad, a <em> kiemelés megmarad).
(() => {
  const h1 = document.querySelector(".hero h1");
  if (!h1 || csendes) return;
  h1.classList.remove("reveal");
  let i = 0;
  const bont = (el) => {
    [...el.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(t => {
          if (!t) return;
          if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(t)); return; }
          const s = document.createElement("span");
          s.className = "szo"; s.style.setProperty("--i", i++); s.textContent = t;
          frag.appendChild(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) bont(n);
    });
  };
  bont(h1);
})();

// Láthatóvá váláskor egyszer lefutó elemek: táblázat, pipák, lépések, számláló.
(() => {
  const elemek = document.querySelectorAll("[data-anim], [data-count]");
  const indit = (el) => {
    el.classList.add("fut");
    if (el.dataset.count && !csendes) {
      const cel = +el.dataset.count, t0 = performance.now(), hossz = 900;
      const lep = (t) => {
        const x = Math.min(1, (t - t0) / hossz);
        el.textContent = Math.round(cel * (1 - Math.pow(1 - x, 3)));
        if (x < 1) requestAnimationFrame(lep);
      };
      requestAnimationFrame(lep);
    }
  };
  if (!("IntersectionObserver" in window)) { elemek.forEach(indit); return; }
  const io = new IntersectionObserver((es) => es.forEach(e => {
    if (e.isIntersecting) { indit(e.target); io.unobserve(e.target); }
  }), { threshold: 0.35 });
  elemek.forEach(e => io.observe(e));
})();

// Menüsor: görgetés után halvány árnyék (őrszem-elemmel, scroll-figyelő nélkül).
(() => {
  const nav = document.querySelector(".nav");
  if (!nav || !("IntersectionObserver" in window)) return;
  const or = document.createElement("div");
  or.style.cssText = "position:absolute;top:0;left:0;width:1px;height:8px;pointer-events:none";
  document.body.prepend(or);
  new IntersectionObserver(([e]) => nav.classList.toggle("lent", !e.isIntersecting)).observe(or);
})();


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

// A fordítva tárolt postai cím képernyőolvasóknak is helyes sorrendben (a forrásban nincs olvasható alakban).
document.querySelectorAll(".cim").forEach(e => e.setAttribute("aria-label", [...e.textContent].reverse().join("")));

document.querySelectorAll("[data-year]").forEach(e => { e.textContent = new Date().getFullYear(); });
