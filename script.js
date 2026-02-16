document.addEventListener("DOMContentLoaded", () => {

const messages = [
  "I’ll always be here for you — to listen, to understand, to just be there.",
  "If talking lightens your heart even a little, I could listen to you for hours and still want more.",
  "Even when you don’t want advice or solutions, I’m more than happy to simply sit beside you and listen.",
  "One message from you is enough to brighten my entire day.",
  "Your smile is my favorite sight in the world.",
  "Your voice feels like my favorite song — the one I never get tired of.",
  "Hey monkey… whatever we’re going through, we both deserve something beautiful. This is just a phase, and it will pass — together."
];

let index = 0;
let activeBalloon = null;
let collected = [];
let confettiInterval = null;

const envelopeContainer = document.getElementById("envelopeContainer");
const envelope = document.getElementById("envelope");
const popSound = document.getElementById("popSound");
const finalSound = document.getElementById("finalSound");

/* ---------------- ENVELOPE VISIBILITY ---------------- */

function setEnvelopeVisibility(percentVisible) {
  const height = envelopeContainer.offsetHeight;
  const visibleHeight = height * (percentVisible / 100);
  envelopeContainer.style.bottom = -(height - visibleHeight) + "px";
}

setTimeout(() => setEnvelopeVisibility(20), 50);

/* ---------------- BALLOON ---------------- */

function createBalloon() {

  if (index >= messages.length) return;
  if (activeBalloon) return;

  const balloon = document.createElement("div");
  balloon.className = "balloon";

  balloon.style.left = Math.random() * (window.innerWidth - 100) + "px";
  balloon.style.top = "-150px";

  document.body.appendChild(balloon);
  activeBalloon = balloon;

  setTimeout(() => {
    balloon.style.transition = "top 2s ease";
    balloon.style.top = (window.innerHeight / 3) + "px";
  }, 50);

  balloon.addEventListener("click", () => {
    popBalloon(balloon);
  });
}

function popBalloon(balloon) {

  popSound.play();
  balloon.remove();
  activeBalloon = null;

  createCard(messages[index]);
  index++;
}

/* ---------------- CARD ---------------- */

function createCard(text) {

  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <div class="main-text">${text}</div>
    <div class="instruction">
      Slide into the envelope
      <div class="arrow">⬇</div>
    </div>
  `;

  document.body.appendChild(card);

  // PERFECT CENTER (RESPONSIVE)
  requestAnimationFrame(() => {
    const rect = card.getBoundingClientRect();
    card.style.left = (window.innerWidth - rect.width) / 2 + "px";
    card.style.top = (window.innerHeight - rect.height) / 2 + "px";
  });

  enableDrag(card);
}

/* ---------------- DRAG TO ENVELOPE ---------------- */

function enableDrag(element) {

  let offsetX, offsetY;

  function start(e) {
    const rect = element.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;

    setEnvelopeVisibility(40);
    envelope.classList.add("open");

    document.addEventListener("mousemove", move);
    document.addEventListener("touchmove", move, { passive: false });
    document.addEventListener("mouseup", end);
    document.addEventListener("touchend", end);
  }

  function move(e) {
    e.preventDefault();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    element.style.left = (clientX - offsetX) + "px";
    element.style.top = (clientY - offsetY) + "px";
  }

  function end() {

    document.removeEventListener("mousemove", move);
    document.removeEventListener("touchmove", move);
    document.removeEventListener("mouseup", end);
    document.removeEventListener("touchend", end);

    const cardRect = element.getBoundingClientRect();
    const envelopeRect = envelope.getBoundingClientRect();

    const isInside =
      cardRect.right > envelopeRect.left &&
      cardRect.left < envelopeRect.right &&
      cardRect.bottom > envelopeRect.top &&
      cardRect.top < envelopeRect.bottom;

    if (isInside) {

      const mainText = element.querySelector(".main-text").innerText;
      collected.push(mainText);

      element.remove();

      envelope.classList.remove("open");
      setEnvelopeVisibility(20);

      if (index < messages.length) {
        setTimeout(createBalloon, 150);
      } else {
        finalReveal();
      }

    } else {
      envelope.classList.remove("open");
      setEnvelopeVisibility(20);
    }
  }

  element.addEventListener("mousedown", start);
  element.addEventListener("touchstart", start);
}

/* ---------------- FINAL ---------------- */

function finalReveal() {

  envelopeContainer.style.bottom = "auto";
  envelopeContainer.style.top = "50%";
  envelopeContainer.style.transform = "translate(-50%, -50%)";

  envelope.addEventListener("click", handleFinalClick, { once: true });
}

function handleFinalClick() {

  finalSound.play();
  envelopeContainer.remove();

  burstCards();
  startConfettiRain();
}

/* ---------------- RANDOM RESPONSIVE FINAL CARDS ---------------- */

function burstCards() {

  const placed = [];

  collected.forEach(text => {

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<div class="main-text">${text}</div>`;

    document.body.appendChild(card);

    const rect = card.getBoundingClientRect();
    const cardWidth = rect.width;
    const cardHeight = rect.height;

    let x, y, overlap;
    let attempts = 0;

    do {
      x = Math.random() * (window.innerWidth - cardWidth);
      y = Math.random() * (window.innerHeight - cardHeight);

      overlap = placed.some(p =>
        x < p.x + p.w &&
        x + cardWidth > p.x &&
        y < p.y + p.h &&
        y + cardHeight > p.y
      );

      attempts++;
    } while (overlap && attempts < 200);

    placed.push({ x, y, w: cardWidth, h: cardHeight });

    card.style.left = x + "px";
    card.style.top = y + "px";

    enableFreeDrag(card);
  });
}

/* ---------------- LIGHT CONFETTI ---------------- */

function startConfettiRain() {

  const colors = ["#ff4d6d", "#ff85a1", "#ffd6e0", "#ffffff", "#ffc2d1"];

  confettiInterval = setInterval(() => {

    for (let i = 0; i < 4; i++) {

      const confetti = document.createElement("div");
      confetti.className = "confetti-piece";

      confetti.style.left = Math.random() * window.innerWidth + "px";
      confetti.style.background =
        colors[Math.floor(Math.random() * colors.length)];

      document.body.appendChild(confetti);

      const fallDuration = 3000 + Math.random() * 2000;

      setTimeout(() => {
        confetti.style.top = window.innerHeight + "px";
      }, 10);

      setTimeout(() => {
        confetti.remove();
      }, fallDuration);
    }

  }, 200);
}

/* ---------------- FREE DRAG FINAL ---------------- */

function enableFreeDrag(element) {

  let offsetX, offsetY;

  function start(e) {
    const rect = element.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;

    document.addEventListener("mousemove", move);
    document.addEventListener("touchmove", move, { passive: false });
    document.addEventListener("mouseup", end);
    document.addEventListener("touchend", end);
  }

  function move(e) {
    e.preventDefault();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    element.style.left = (clientX - offsetX) + "px";
    element.style.top = (clientY - offsetY) + "px";
  }

  function end() {
    document.removeEventListener("mousemove", move);
    document.removeEventListener("touchmove", move);
    document.removeEventListener("mouseup", end);
    document.removeEventListener("touchend", end);
  }

  element.addEventListener("mousedown", start);
  element.addEventListener("touchstart", start);
}

createBalloon();

});
