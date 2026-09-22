/**
 * HARSHIKHA & AYUSH — CINEMATIC ENGAGEMENT INVITATION v2
 * Animation Engine · Indian · Scroll-Driven · 2026
 */

(function () {
  "use strict";

  /* ─── Constants ─────────────────────────────────────────── */
  const TARGET_DATE = new Date("2026-12-02T18:00:00+05:30").getTime();

  const PETAL_COLORS = [
    "rgba(228,168,157,0.85)",
    "rgba(212,140,138,0.75)",
    "rgba(225,186,167,0.75)",
    "rgba(200,140,150,0.65)",
    "rgba(245,200,190,0.7)",
    "rgba(184,138,74,0.45)",
  ];

  /* ─── DOM refs ───────────────────────────────────────────── */
  const preloader = document.getElementById("preloader");
  const preloaderFill = document.getElementById("preloaderFill");
  const preloaderPercent = document.getElementById("preloaderPercent");
  const openButton = document.getElementById("openInvitation");
  const opening = document.getElementById("opening");
  const openingBg = document.querySelector(".opening-bg");
  const invitation = document.getElementById("invitation");
  const replayBtn = document.getElementById("replay");
  const scrollBar = document.getElementById("scroll-progress");
  const statusEl = document.getElementById("countdownStatus");
  const venueSlideshow = document.getElementById("venueSlideshow");
  const dots = document.querySelectorAll(".slideshow-dots .dot");

  /* ─── State ──────────────────────────────────────────────── */
  let opened = false;
  let slideshowIdx = 0;
  let slideshowTimer = null;
  let revealObserver = null;
  let countdownTimer = null;

  /* ════════════════════════════════════════════════════════════
     1. PRELOADER
     Real progress: waits for the actual hero images to arrive
     (capped, so a slow connection never hangs forever), keeps
     the curtain up for a minimum time so it never "flashes",
     then parts the curtains instead of a flat fade — and only
     THEN kicks off the camera-zoom / seal-reveal sequence, so
     it always lands in sync regardless of how long loading took.
  ════════════════════════════════════════════════════════════ */
  const CRITICAL_IMAGES = [
    "assets/envelope-closed.png",
    "assets/envelope-open.png",
    "assets/couple-4.png",
  ];
  const MIN_VISIBLE_MS = 1400; // never dismiss faster than this — avoids a jarring flash
  const MAX_WAIT_MS = 6000; // never make anyone wait longer than this, even on slow data
  const reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const startedAt = Date.now();
  let loadedCount = 0;

  function setProgress(pct) {
    var clamped = Math.max(0, Math.min(100, pct));
    if (preloaderFill) preloaderFill.style.width = clamped + "%";
    if (preloaderPercent)
      preloaderPercent.textContent = Math.round(clamped) + "%";
  }

  function preloadImage(src) {
    return new Promise(function (resolve) {
      var img = new Image();
      var settle = function () {
        loadedCount++;
        setProgress((loadedCount / CRITICAL_IMAGES.length) * 92);
        resolve();
      };
      img.onload = settle;
      img.onerror = settle; // a missing/broken image should never block the whole site
      img.src = src;
    });
  }

  function startZoomSequence() {
    // Keep a deterministic reveal sequence even when Safari throttles or defers
    // asset loads. The key is to start the zoom and reveal reliably, not to wait
    // on a fragile image-load gate.
    setTimeout(
      function () {
        if (openingBg) openingBg.classList.add("zoom-ready");
        setTimeout(
          function () {
            if (openButton) openButton.classList.add("revealed");
          },
          reduceMotion ? 0 : 4500,
        );
      },
      reduceMotion ? 0 : 1000,
    );
  }

  function dismissPreloader() {
    if (!preloader) return;
    setProgress(100);
    preloader.classList.add("is-done");
    var curtainDuration = reduceMotion ? 400 : 1100;
    setTimeout(function () {
      preloader.style.display = "none";
    }, curtainDuration);
    startZoomSequence();
  }

  function beginLoaderSequence() {
    var elapsed = Date.now() - startedAt;
    var remaining = Math.max(MIN_VISIBLE_MS - elapsed, 0);
    setTimeout(dismissPreloader, remaining);
  }

  var loadPromise = Promise.all(CRITICAL_IMAGES.map(preloadImage));
  var timeoutPromise = new Promise(function (resolve) {
    setTimeout(resolve, MAX_WAIT_MS);
  });

  Promise.race([loadPromise, timeoutPromise]).then(function () {
    beginLoaderSequence();
  }).catch(function () {
    beginLoaderSequence();
  });

  // Fallback for browsers that never settle the image gate reliably (notably some
  // iOS Safari cases with local file access or deferred image timing).
  setTimeout(function () {
    if (preloader && preloader.style.display !== "none") {
      dismissPreloader();
    }
  }, MAX_WAIT_MS + 200);

  /* ════════════════════════════════════════════════════════════
     2. FLOATING PETALS (opening screen)
  ════════════════════════════════════════════════════════════ */
  function createPetals() {
    var field = document.querySelector(".petal-field");
    if (!field) return;

    var count = window.innerWidth > 640 ? 26 : 16;

    for (var i = 0; i < count; i++) {
      var petal = document.createElement("span");
      petal.className = "petal";

      var size = Math.random() * 9 + 5;
      var color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
      var left = Math.random() * 100;
      var delay = Math.random() * 14;
      var dur = Math.random() * 9 + 11;
      var rot = Math.random() > 0.5 ? "50% 0 50% 0" : "0 50% 0 50%";

      petal.style.cssText =
        "width:" +
        size +
        "px;" +
        "height:" +
        size * 1.35 +
        "px;" +
        "left:" +
        left +
        "%;" +
        "background:" +
        color +
        ";" +
        "border-radius:" +
        rot +
        ";" +
        "animation-duration:" +
        dur +
        "s;" +
        "animation-delay:" +
        delay +
        "s;";

      field.appendChild(petal);
    }
  }

  createPetals();

  /* ════════════════════════════════════════════════════════════
     3. SCROLL PROGRESS BAR
  ════════════════════════════════════════════════════════════ */
  function updateScrollBar() {
    if (!scrollBar) return;
    var scrolled = window.scrollY || document.documentElement.scrollTop;
    var total =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    scrollBar.style.width =
      total > 0 ? Math.min(100, (scrolled / total) * 100) + "%" : "0%";
  }

  /* ════════════════════════════════════════════════════════════
     4. COUNTDOWN with digit pop
  ════════════════════════════════════════════════════════════ */
  function pad(n) {
    return String(Math.max(0, n)).padStart(2, "0");
  }

  function setDigit(id, value) {
    var el = document.getElementById(id);
    if (!el || el.textContent === value) return;
    el.textContent = value;
    el.style.transition = "none";
    el.style.transform = "scale(1.3)";
    el.style.color = "var(--gold-light, #d4a85c)";
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.style.transition = "transform 0.3s ease, color 0.3s ease";
        el.style.transform = "scale(1)";
        el.style.color = "var(--wine, #7a2136)";
      });
    });
  }

  function updateCountdown() {
    var rem = TARGET_DATE - Date.now();
    if (rem <= 0) {
      ["days", "hours", "minutes", "seconds"].forEach(function (id) {
        setDigit(id, "00");
      });
      if (statusEl) statusEl.textContent = "The celebration has begun! ✨";
      return;
    }
    setDigit("days", pad(Math.floor(rem / 86400000)));
    setDigit("hours", pad(Math.floor((rem % 86400000) / 3600000)));
    setDigit("minutes", pad(Math.floor((rem % 3600000) / 60000)));
    setDigit("seconds", pad(Math.floor((rem % 60000) / 1000)));
    if (statusEl) statusEl.textContent = "Counting down to our big day";
  }

  function startCountdown() {
    if (countdownTimer) return;
    updateCountdown();
    countdownTimer = setInterval(updateCountdown, 1000);
  }

  function stopCountdown() {
    if (!countdownTimer) return;
    clearInterval(countdownTimer);
    countdownTimer = null;
  }

  /* ════════════════════════════════════════════════════════════
     5. SPLIT TEXT — names character by character
  ════════════════════════════════════════════════════════════ */
  function buildSplitText() {
    document.querySelectorAll(".split-text").forEach(function (el) {
      var text = el.getAttribute("data-text") || el.textContent;
      el.textContent = text;
    });
  }

  function revealSplitText(container) {
    if (!container) return;
    container.querySelectorAll(".char-span").forEach(function (span) {
      span.classList.add("revealed");
    });
  }

  /* ════════════════════════════════════════════════════════════
     6. WORD REVEAL — detail card strong tags
  ════════════════════════════════════════════════════════════ */
  function buildWordReveals() {
    document.querySelectorAll(".word-reveal").forEach(function (el) {
      // Preserve HTML (with <br/>) — split only text nodes
      var lines = el.innerHTML.split(/<br\s*\/?>/i);
      el.innerHTML = lines
        .map(function (line) {
          return line
            .trim()
            .split(" ")
            .map(function (w) {
              return '<span class="word">' + w + "</span>";
            })
            .join(" ");
        })
        .join("<br />");
    });
  }

  function revealWords(container) {
    container.querySelectorAll(".word").forEach(function (span, i) {
      setTimeout(
        function () {
          span.classList.add("revealed");
        },
        i * 80 + 100,
      );
    });
  }

  /* ════════════════════════════════════════════════════════════
     7. ENVELOPE — open animation + background crossfade
  ════════════════════════════════════════════════════════════ */
  function showInvitation() {
    if (opened || !openButton || !opening || !invitation) return;
    opened = true;

    openButton.classList.add("open");

    // Skip the open-envelope art entirely so the reveal never shows the second
    // image. The invitation is shown directly after a quick fade.
    opening.classList.add("is-closing");

    setTimeout(function () {
      opening.style.display = "none";
      invitation.classList.add("visible");
      invitation.setAttribute("aria-hidden", "false");
      window.scrollTo({ top: 0, behavior: "auto" });

      setupRevealObserver();
      window.addEventListener("scroll", updateScrollBar, { passive: true });
      startCountdown();
      startSlideshow();
      setupParallax();
      setupCardTilt();
    }, 300);
  }

  function resetInvitation() {
    if (!opening || !invitation || !openButton) return;

    invitation.classList.remove("visible");
    invitation.setAttribute("aria-hidden", "true");
    opening.style.display = "";
    opening.classList.remove("is-closing", "env-opened");
    openButton.classList.remove("open");
    opened = false;

    window.scrollTo({ top: 0, behavior: "auto" });

    // Reset all animated elements
    document.querySelectorAll("[data-anim]").forEach(function (el) {
      el.classList.remove("is-visible");
    });
    document.querySelectorAll(".char-span").forEach(function (s) {
      s.classList.remove("revealed");
    });
    document.querySelectorAll(".word").forEach(function (w) {
      w.classList.remove("revealed");
    });

    if (revealObserver) {
      revealObserver.disconnect();
      revealObserver = null;
    }
    stopCountdown();
    stopSlideshow();
  }

  /* ════════════════════════════════════════════════════════════
     8. SCROLL REVEAL OBSERVER
  ════════════════════════════════════════════════════════════ */
  function setupRevealObserver() {
    var items = document.querySelectorAll("[data-anim]");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("is-visible");
        triggerSpecials(el);
      });
      return;
    }

    revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          var el = entry.target;
          var delay = parseInt(el.getAttribute("data-delay") || "0", 10);

          setTimeout(function () {
            el.classList.add("is-visible");
            triggerSpecials(el);
          }, delay);

          revealObserver.unobserve(el);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );

    items.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  // After an element is revealed, trigger sub-animations
  function triggerSpecials(el) {
    // Split text chars in names
    var splits = el.querySelectorAll(".split-text");
    splits.forEach(function (s) {
      revealSplitText(s);
    });
    if (el.classList.contains("split-text")) revealSplitText(el);

    // Word reveals in detail cards
    var words = el.querySelectorAll(".word-reveal");
    words.forEach(function (w) {
      revealWords(w);
    });
    if (el.classList.contains("word-reveal")) revealWords(el);

    // Char reveals in family section
    var chars = el.querySelectorAll(".char-reveal");
    chars.forEach(function (c) {
      animateChars(c);
    });
    if (el.classList.contains("char-reveal")) animateChars(el);
  }

  // Animate chars in a paragraph (Indian family names)
  // Uses a temp div to decode HTML entities before splitting
  function animateChars(el) {
    // Get lines by splitting on <br> tags while preserving them as markers
    var rawHtml = el.innerHTML;
    var parts = rawHtml.split(/(<br\s*\/?>\s*)/i);
    var charIdx = 0;

    el.innerHTML = parts
      .map(function (part) {
        // Pass through <br> tags unchanged
        if (/^<br/i.test(part.trim())) return "<br />";
        if (!part.trim()) return "";

        // Decode HTML entities in the text segment using a temporary element
        var tmp = document.createElement("span");
        tmp.innerHTML = part;
        var text = tmp.textContent || tmp.innerText || part;

        return text
          .split("")
          .map(function (ch) {
            var delay = charIdx++ * 20;
            // Re-encode only the characters that need it
            var safe = ch === "<" ? "&lt;" : ch === ">" ? "&gt;" : ch;
            return (
              '<span class="char-span" style="transition-delay:' +
              delay +
              'ms">' +
              safe +
              "</span>"
            );
          })
          .join("");
      })
      .join("");

    // Trigger after a single paint cycle
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.querySelectorAll(".char-span").forEach(function (s) {
          s.classList.add("revealed");
        });
      });
    });
  }

  /* ════════════════════════════════════════════════════════════
     9. VENUE SLIDESHOW
  ════════════════════════════════════════════════════════════ */
  function goToSlide(idx) {
    if (!venueSlideshow) return;
    var slides = venueSlideshow.querySelectorAll("img");
    if (!slides.length) return;
    idx = ((idx % slides.length) + slides.length) % slides.length;
    slideshowIdx = idx;
    slides.forEach(function (s, i) {
      s.classList.toggle("active", i === idx);
    });
    dots.forEach(function (d, i) {
      d.classList.toggle("active", i === idx);
    });
  }

  function startSlideshow() {
    if (slideshowTimer) return;
    slideshowTimer = setInterval(function () {
      goToSlide(slideshowIdx + 1);
    }, 4200);
  }

  function stopSlideshow() {
    clearInterval(slideshowTimer);
    slideshowTimer = null;
  }

  /* ════════════════════════════════════════════════════════════
     10. PARALLAX — hero photo + background
  ════════════════════════════════════════════════════════════ */
  function setupParallax() {
    var heroImg = document.querySelector(".photo-frame img");

    function onScroll() {
      var s = window.scrollY;
      if (heroImg)
        heroImg.style.transform = "scale(1.03) translateY(" + s * 0.04 + "px)";
    }

    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ════════════════════════════════════════════════════════════
     11. CARD TILT — 3D on desktop
  ════════════════════════════════════════════════════════════ */
  function setupCardTilt() {
    if (window.matchMedia("(hover: none)").matches) return;

    document.querySelectorAll(".indian-card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
        var dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
        card.style.transition = "transform 0.1s ease";
        card.style.transform =
          "translateY(-6px) perspective(700px) rotateX(" +
          dy * -5 +
          "deg) rotateY(" +
          dx * 5 +
          "deg)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transition = "transform 0.5s var(--ease-luxury)";
        card.style.transform = "";
      });
    });
  }

  /* ════════════════════════════════════════════════════════════
     12. INIT
  ════════════════════════════════════════════════════════════ */
  // Build DOM structures before display
  buildSplitText();
  buildWordReveals();

  // Countdown starts immediately (visible from beginning)
  startCountdown();

  // Event listeners
  if (openButton) {
    openButton.addEventListener("click", showInvitation);
    openButton.addEventListener(
      "touchend",
      function (e) {
        e.preventDefault();
        showInvitation();
      },
      { passive: false },
    );
    openButton.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        showInvitation();
      }
    });
  }

  if (replayBtn) {
    replayBtn.addEventListener("click", resetInvitation);
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var idx = parseInt(dot.getAttribute("data-slide"), 10);
      if (!isNaN(idx)) {
        stopSlideshow();
        goToSlide(idx);
        startSlideshow();
      }
    });
  });
})();
