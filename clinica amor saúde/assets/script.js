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

  // Reveal on scroll
  const observer = new IntersectionObserver(entries => {
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
    observer.observe(el);
  });
});

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
