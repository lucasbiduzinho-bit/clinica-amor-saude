// ===== Amor Saúde Franca — Dark Premium LP =====
const WHATSAPP_NUMBER = "5516999999999"; // Substitua pelo número real
const WHATSAPP_MESSAGE = "Olá! Vim pela página da Amor Saúde Franca e gostaria de agendar uma avaliação.";

const buildLink = (n, m) => `https://wa.me/${n}?text=${encodeURIComponent(m)}`;

document.addEventListener("DOMContentLoaded", () => {
  // WhatsApp links
  const wa = buildLink(WHATSAPP_NUMBER, WHATSAPP_MESSAGE);
  document.querySelectorAll("[data-whatsapp]").forEach(el => {
    el.href = wa;
    el.target = "_blank";
    el.rel = "noopener noreferrer";
  });

  // Year
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // FAQ — single open
  const items = document.querySelectorAll(".faq-item");
  items.forEach(it => {
    it.addEventListener("toggle", () => {
      if (it.open) items.forEach(o => { if (o !== it) o.open = false });
    });
  });

  // ===== HERO CAROUSEL =====
  initHeroCarousel();

  // ===== BLUR FADE — sections on scroll =====
  const blurObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        blurObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll(".blur-fade").forEach(el => blurObserver.observe(el));

  // Legacy card reveal (kept for backwards compat)
  const cardObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = "1";
        e.target.style.transform = "translateY(0)";
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll(".spec-card, .testi, .odonto-card, .humanized-item").forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    el.style.transition = "opacity .6s ease, transform .6s ease";
    cardObserver.observe(el);
  });

  // ===== NUMBER TICKER =====
  const tickerObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      tickerObserver.unobserve(e.target);
      const el = e.target;
      const suffix = el.dataset.suffix || "";
      // Use data-target if set, else parse textContent
      // Handle PT-BR format: "4.000" = 4000, "4,9" = 4.9
      const rawTarget = el.dataset.target || el.textContent.trim();
      // Detect if it has a comma decimal (4,9) vs dot thousands (4.000)
      const isDecimalComma = /^\d+,\d{1,2}$/.test(rawTarget);
      const normalized = isDecimalComma
        ? rawTarget.replace(",", ".")                    // "4,9" → "4.9"
        : rawTarget.replace(/\./g, "");                  // "4.000" → "4000"
      const target = parseFloat(normalized);
      const decimals = isDecimalComma ? rawTarget.split(",")[1].length : 0;
      const duration = 1800;
      const start = performance.now();
      const tick = now => {
        const t = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        const val = target * ease;
        // Format back to PT-BR style
        let display;
        if (isDecimalComma) {
          display = val.toFixed(decimals).replace(".", ",");
        } else {
          display = Math.floor(val).toLocaleString("pt-BR");
        }
        el.textContent = display + suffix;
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = rawTarget + suffix;
      };
      el.textContent = "0" + suffix;
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll("[data-ticker]").forEach(el => tickerObserver.observe(el));

  // ===== FLOATING PILL NAV =====
  const topbar = document.querySelector(".topbar");
  if (topbar) {
    const onScroll = () => topbar.classList.toggle("is-floating", window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ===== SHADER BACKGROUND (Aceternity port) =====
  initShaderBackgrounds();
});

// ===== WebGL Shader Background — warm champagne palette =====
function initShaderBackgrounds() {
  const sections = document.querySelectorAll(".light-section");
  if (!sections.length) return;

  sections.forEach(section => {
    const canvas = document.createElement("canvas");
    canvas.className = "shader-bg";
    canvas.setAttribute("aria-hidden", "true");
    section.insertBefore(canvas, section.firstChild);

    const renderer = createShaderRenderer(canvas);
    if (!renderer) { canvas.remove(); return; }

    // Pause/resume on visibility
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => e.isIntersecting ? renderer.start() : renderer.stop());
    }, { threshold: 0, rootMargin: "100px" });
    io.observe(section);

    // Resize handler
    const ro = new ResizeObserver(() => renderer.resize());
    ro.observe(section);
    renderer.resize();
  });
}

function createShaderRenderer(canvas) {
  const gl = canvas.getContext("webgl", { antialias: false, alpha: true, premultipliedAlpha: false });
  if (!gl) return null;

  const vsSource = `attribute vec4 aVertexPosition; void main() { gl_Position = aVertexPosition; }`;
  const fsSource = `
    precision highp float;
    uniform vec2 iResolution;
    uniform float iTime;

    const float overallSpeed = 0.12;
    const float gridSmoothWidth = 0.015;
    const float scale = 5.0;
    const vec4 lineColor = vec4(0.52, 0.38, 0.14, 1.0);
    const float minLineWidth = 0.01;
    const float maxLineWidth = 0.14;
    const float lineSpeed = 1.0 * overallSpeed;
    const float lineAmplitude = 0.82;
    const float lineFrequency = 0.2;
    const float warpSpeed = 0.2 * overallSpeed;
    const float warpFrequency = 0.5;
    const float warpAmplitude = 0.72;
    const float offsetFrequency = 0.5;
    const float offsetSpeed = 1.33 * overallSpeed;
    const float minOffsetSpread = 0.6;
    const float maxOffsetSpread = 2.0;
    const int linesPerGroup = 16;

    #define drawCircle(pos, radius, coord) smoothstep(radius + gridSmoothWidth, radius, length(coord - (pos)))
    #define drawSmoothLine(pos, halfWidth, t) smoothstep(halfWidth, 0.0, abs(pos - (t)))
    #define drawCrispLine(pos, halfWidth, t) smoothstep(halfWidth + gridSmoothWidth, halfWidth, abs(pos - (t)))

    float random(float t) {
      return (cos(t) + cos(t * 1.3 + 1.3) + cos(t * 1.4 + 1.4)) / 3.0;
    }
    float getPlasmaY(float x, float horizontalFade, float offset) {
      return random(x * lineFrequency + iTime * lineSpeed) * horizontalFade * lineAmplitude + offset;
    }

    void main() {
      vec2 fragCoord = gl_FragCoord.xy;
      vec4 fragColor;
      vec2 uv = fragCoord.xy / iResolution.xy;
      vec2 space = (fragCoord - iResolution.xy / 2.0) / iResolution.x * 2.0 * scale;

      float horizontalFade = 1.0 - (cos(uv.x * 6.28) * 0.5 + 0.5);
      float verticalFade = 1.0 - (cos(uv.y * 6.28) * 0.5 + 0.5);

      space.y += random(space.x * warpFrequency + iTime * warpSpeed) * warpAmplitude * (0.5 + horizontalFade);
      space.x += random(space.y * warpFrequency + iTime * warpSpeed + 2.0) * warpAmplitude * horizontalFade;

      vec4 lines = vec4(0.0);
      vec4 bgColor1 = vec4(0.957, 0.925, 0.858, 1.0);
      vec4 bgColor2 = vec4(0.929, 0.879, 0.772, 1.0);

      for(int l = 0; l < linesPerGroup; l++) {
        float normalizedLineIndex = float(l) / float(linesPerGroup);
        float offsetTime = iTime * offsetSpeed;
        float offsetPosition = float(l) + space.x * offsetFrequency;
        float rand = random(offsetPosition + offsetTime) * 0.5 + 0.5;
        float halfWidth = mix(minLineWidth, maxLineWidth, rand * horizontalFade) / 2.0;
        float offset = random(offsetPosition + offsetTime * (1.0 + normalizedLineIndex)) * mix(minOffsetSpread, maxOffsetSpread, horizontalFade);
        float linePosition = getPlasmaY(space.x, horizontalFade, offset);
        float line = drawSmoothLine(linePosition, halfWidth, space.y) / 2.0 + drawCrispLine(linePosition, halfWidth * 0.15, space.y);

        float circleX = mod(float(l) + iTime * lineSpeed, 25.0) - 12.0;
        vec2 circlePosition = vec2(circleX, getPlasmaY(circleX, horizontalFade, offset));
        float circle = drawCircle(circlePosition, 0.01, space) * 4.0;

        line = line + circle;
        lines += line * lineColor * rand;
      }

      fragColor = mix(bgColor1, bgColor2, uv.x);
      fragColor *= verticalFade * 0.4 + 0.6;
      fragColor.a = 1.0;
      fragColor += lines * 0.24;

      gl_FragColor = fragColor;
    }
  `;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error("Shader compile error:", gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  const vs = compile(gl.VERTEX_SHADER, vsSource);
  const fs = compile(gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
    return null;
  }

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  const aPos = gl.getAttribLocation(program, "aVertexPosition");
  const uRes = gl.getUniformLocation(program, "iResolution");
  const uTime = gl.getUniformLocation(program, "iTime");

  let running = false;
  let rafId = null;
  const startTime = performance.now();
  // throttle to ~30fps for subtle background
  let lastFrame = 0;
  const frameInterval = 1000 / 30;

  function render(now) {
    if (!running) return;
    if (now - lastFrame >= frameInterval) {
      lastFrame = now;
      const t = (now - startTime) / 1000;
      gl.useProgram(program);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(aPos);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    rafId = requestAnimationFrame(render);
  }

  return {
    start() {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(render);
    },
    stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    },
    resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
  };
}

function initHeroCarousel() {
  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".hero-dot");
  const caption = document.getElementById("heroCaption");
  const captionTag = caption?.querySelector(".hero-caption-tag");
  const captionText = caption?.querySelector(".hero-caption-text");
  const progressBar = document.getElementById("heroProgress");

  if (!slides.length) return;

  const INTERVAL = 4000; // 4 seconds
  let current = 0;
  let timer = null;
  let progressTimer = null;
  let progressStart = Date.now();

  const updateCaption = (idx) => {
    const slide = slides[idx];
    if (!caption || !slide) return;
    const tag = slide.dataset.captionTag;
    const text = slide.dataset.captionText;
    // Fade caption
    caption.style.opacity = "0";
    caption.style.transform = "translateY(8px)";
    setTimeout(() => {
      if (captionTag) captionTag.textContent = tag;
      if (captionText) captionText.textContent = text;
      caption.style.opacity = "1";
      caption.style.transform = "translateY(0)";
    }, 350);
  };

  const goTo = (idx) => {
    slides[current].classList.remove("is-active");
    dots[current]?.classList.remove("is-active");
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add("is-active");
    dots[current]?.classList.add("is-active");
    updateCaption(current);
    resetProgress();
  };

  const next = () => goTo(current + 1);

  const start = () => {
    stop();
    timer = setInterval(next, INTERVAL);
    resetProgress();
  };

  const stop = () => {
    if (timer) clearInterval(timer);
    if (progressTimer) clearInterval(progressTimer);
  };

  const resetProgress = () => {
    if (!progressBar) return;
    progressStart = Date.now();
    if (progressTimer) clearInterval(progressTimer);
    progressBar.style.width = "0%";
    progressTimer = setInterval(() => {
      const elapsed = Date.now() - progressStart;
      const pct = Math.min((elapsed / INTERVAL) * 100, 100);
      progressBar.style.width = pct + "%";
      if (pct >= 100) clearInterval(progressTimer);
    }, 30);
  };

  // Caption transition setup
  if (caption) {
    caption.style.transition = "opacity .35s ease, transform .35s ease";
  }

  // Dots click
  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      const idx = parseInt(dot.dataset.slide, 10);
      goTo(idx);
      start();
    });
  });

  // Pause on hover
  const carousel = document.getElementById("heroCarousel");
  if (carousel) {
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
  }

  // Start
  start();
}
