const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const screenPath = "assets/screens/";
// Align the Frost watch face with the display in the full-bleed wrist photograph.
document.querySelectorAll(".lifestyle > img, .highlight-wrist > img").forEach((photo) => {
  const screen = document.createElement("img");
  screen.src = screenPath + "01_watchface.png";
  screen.alt = "moonOS Frost watch face";
  screen.className = "photo-screen";
  screen.loading = "lazy";
  photo.after(screen);
  function positionScreen() {
    const parent = photo.parentElement;
    const scale = Math.max(
      parent.clientWidth / 1672,
      parent.clientHeight / 941,
    );
    const width = 1672 * scale;
    const height = 941 * scale;
    screen.style.left = `${(parent.clientWidth - width) / 2 + 0.3541 * width}px`;
    screen.style.top = `${(parent.clientHeight - height) / 2 + 0.2157 * height}px`;
    screen.style.width = `${0.2787 * width}px`;
    screen.style.height = `${0.5112 * height}px`;
  }
  new ResizeObserver(positionScreen).observe(photo.parentElement);
});
function setScreen(watch, filename) {
  const stack = watch.querySelector(".screen-stack");
  let next = Array.from(stack.children).find(
    (image) => image.dataset.file === filename,
  );
  if (!next) {
    next = document.createElement("img");
    next.src = screenPath + filename;
    next.alt =
      "moonOS " +
      filename
        .replace(/^\d+[a-z]?_/, "")
        .replace(/\.png|\.gif/g, "")
        .replaceAll("_", " ");
    next.dataset.file = filename;
    stack.append(next);
  }
  for (const image of stack.children)
    image.classList.toggle("visible", image === next);
}
for (const watch of document.querySelectorAll(".watch")) {
  const hardware = document.createElement("img");
  hardware.src = "assets/front.webp";
  hardware.className = "hardware";
  hardware.alt = "Moon One frosted case with orange strap";
  hardware.loading = "lazy";
  const stack = document.createElement("div");
  stack.className = "screen-stack";
  watch.append(hardware, stack);
  setScreen(watch, watch.dataset.screen);
}
if (!reducedMotion.matches) document.documentElement.classList.add("motion");
const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries)
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
  },
  { threshold: 0.12 },
);
document
  .querySelectorAll(".reveal")
  .forEach((element) => revealObserver.observe(element));
const storyWatch = document.querySelector(".story-watch");
const steps = [...document.querySelectorAll(".story-step")];
let activeStep = -1;
let ticking = false;
function updateScroll() {
  const anchor = innerHeight * (innerWidth < 701 ? 0.75 : 0.5);
  let nearest = 0;
  let distance = Infinity;
  steps.forEach((step, index) => {
    const rect = step.getBoundingClientRect();
    const value = Math.abs(rect.top + rect.height / 2 - anchor);
    if (value < distance) {
      distance = value;
      nearest = index;
    }
  });
  if (nearest !== activeStep) {
    activeStep = nearest;
    steps.forEach((step, index) =>
      step.classList.toggle("active", index === nearest),
    );
    setScreen(storyWatch, steps[nearest].dataset.story);
    if (nearest === 1) animateBpm();
  }
  if (!reducedMotion.matches) {
    const hero = document.querySelector(".hero-product");
    if (scrollY < innerHeight * 1.5)
      hero.style.transform = `translateY(${scrollY * 0.12}px) rotate(${Math.min(scrollY / 180, 5)}deg)`;
    const lunar = document.querySelector(".lunar");
    const rect = lunar.parentElement.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < innerHeight)
      lunar.style.transform = `translateY(${rect.top * 0.08}px)`;
  }
  ticking = false;
}
addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      requestAnimationFrame(updateScroll);
      ticking = true;
    }
  },
  { passive: true },
);
addEventListener("resize", updateScroll);
updateScroll();
function selectButton(button) {
  for (const sibling of button.parentElement.querySelectorAll("button")) {
    sibling.classList.toggle("selected", sibling === button);
    sibling.setAttribute("aria-pressed", String(sibling === button));
  }
}
document.querySelectorAll("[data-face]").forEach((button) =>
  button.addEventListener("click", () => {
    selectButton(button);
    setScreen(document.querySelector(".display-watch"), button.dataset.face);
  }),
);
if (!reducedMotion.matches)
  setScreen(document.querySelector(".display-watch"), "watchface_live.gif");
for (const type of ["hrv", "environment"])
  document.querySelectorAll(`[data-${type}]`).forEach((button) =>
    button.addEventListener("click", () => {
      selectButton(button);
      button.closest(".story-step").dataset.story = button.dataset[type];
      setScreen(storyWatch, button.dataset[type]);
    }),
  );
document.querySelector("#sleep-screen").addEventListener("change", (event) => {
  document.querySelector("#sleep").dataset.story = event.target.value;
  setScreen(storyWatch, event.target.value);
});
const themeWatch = document.querySelector("#theme-watch");
document.querySelectorAll("[data-theme]").forEach((button) =>
  button.addEventListener("click", () => {
    selectButton(button);
    setScreen(
      themeWatch,
      button.dataset.theme === "dark"
        ? "13_settings_other_theme.png"
        : "06_settings.png",
    );
    document.querySelector("#theme-caption").textContent =
      button.dataset.theme === "dark"
        ? "Dark. After hours."
        : "Frost. A softer glow.";
    document.querySelectorAll("[data-app]").forEach((item) => {
      item.classList.remove("selected");
      item.setAttribute("aria-pressed", "false");
    });
  }),
);
document.querySelectorAll("[data-app]").forEach((button) =>
  button.addEventListener("click", () => {
    selectButton(button);
    selectButton(document.querySelector('[data-theme="frost"]'));
    setScreen(themeWatch, button.dataset.app);
    document.querySelector("#theme-caption").textContent =
      button.textContent + ". Built into moonOS.";
  }),
);
function animateBpm() {
  const number = document.querySelector("#bpm");
  if (reducedMotion.matches) {
    number.textContent = "96";
    return;
  }
  const start = performance.now();
  function frame(now) {
    const progress = Math.min((now - start) / 1200, 1);
    number.textContent = String(Math.round(70 + 26 * progress));
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
const track = document.querySelector("#highlight-track");
const cards = [...track.children];
let slide = 0;
let paused = reducedMotion.matches;
let userInteracting = false;
function moveSlide(direction) {
  slide = (slide + direction + cards.length) % cards.length;
  track.scrollTo({
    left: cards[slide].offsetLeft - cards[0].offsetLeft,
    behavior: reducedMotion.matches ? "instant" : "smooth",
  });
}
document
  .querySelector("#slide-prev")
  .addEventListener("click", () => moveSlide(-1));
document
  .querySelector("#slide-next")
  .addEventListener("click", () => moveSlide(1));
const pauseButton = document.querySelector("#slide-pause");
function updatePause() {
  pauseButton.textContent = paused ? "▷" : "Ⅱ";
  pauseButton.setAttribute(
    "aria-label",
    paused ? "Play highlights" : "Pause highlights",
  );
  pauseButton.setAttribute("aria-pressed", String(paused));
}
pauseButton.addEventListener("click", () => {
  paused = !paused;
  updatePause();
});
updatePause();
track.addEventListener("pointerenter", () => {
  userInteracting = true;
});
track.addEventListener("pointerleave", () => {
  userInteracting = false;
});
track.addEventListener("focusin", () => {
  userInteracting = true;
});
track.addEventListener("focusout", () => {
  userInteracting = false;
});
track.addEventListener(
  "scroll",
  () => {
    const max = track.scrollWidth - track.clientWidth;
    document.querySelector(".slide-progress span").style.transform =
      `translateX(${max ? (track.scrollLeft / max) * 400 : 0}%)`;
  },
  { passive: true },
);
setInterval(() => {
  const rect = track.getBoundingClientRect();
  if (
    !paused &&
    !userInteracting &&
    !document.hidden &&
    rect.top < innerHeight &&
    rect.bottom > 0
  )
    moveSlide(1);
}, 5500);
reducedMotion.addEventListener("change", () => {
  document.documentElement.classList.toggle("motion", !reducedMotion.matches);
  paused = reducedMotion.matches;
  updatePause();
  const selectedFace = document.querySelector("[data-face].selected");
  setScreen(
    document.querySelector(".display-watch"),
    selectedFace.dataset.face === "01_watchface.png" && !reducedMotion.matches
      ? "watchface_live.gif"
      : selectedFace.dataset.face,
  );
  if (reducedMotion.matches) {
    document.querySelector(".hero-product").style.transform = "";
    document.querySelector(".lunar").style.transform = "";
  }
});
document.querySelector("#waitlist-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const email = form.email.value.trim();
  const subject = encodeURIComponent("Moon One waitlist");
  const body = encodeURIComponent(
    `Hi, please add me to the Moon One waitlist.\n\nEmail: ${email}`,
  );
  window.location.href = `mailto:ffurduj@gmail.com?subject=${subject}&body=${body}`;
  form.hidden = true;
  form.style.display = "none";
  const status = document.querySelector("#form-status");
  status.querySelector("span").textContent =
    "Your email app should open with a short message. Just press send.";
  status.hidden = false;
});
