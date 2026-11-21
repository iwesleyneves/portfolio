function initCarousels() {
  createCarousel({
    containerSelector: ".projects-container",
    cardSelector: ".project-card",
    leftArrowSelector: ".projects .arrow.left",
    rightArrowSelector: ".projects .arrow.right",
    sectionSelector: "#projects",
    viewportSelector: ".projects-viewport"
  });
}

function createCarousel({
  containerSelector,
  cardSelector,
  leftArrowSelector,
  rightArrowSelector,
  sectionSelector,
  viewportSelector
}) {
  const container = document.querySelector(containerSelector);
  const cards = document.querySelectorAll(cardSelector);
  const leftArrow = document.querySelector(leftArrowSelector);
  const rightArrow = document.querySelector(rightArrowSelector);
  const section = document.querySelector(sectionSelector);
  const viewport = document.querySelector(viewportSelector);

  if (!container || cards.length === 0 || !leftArrow || !rightArrow) return;

  let currentIndex = 0;
  let wheelScrollLocked = false;

  function getGap() {
    const computed = window.getComputedStyle(container);
    return parseFloat(computed.columnGap || computed.gap) || 28;
  }

  function getCardStep() {
    return cards[0].offsetWidth + getGap();
  }

  function getVisibleCards() {
    if (!viewport) {
      if (window.innerWidth <= 700) return 1;
      if (window.innerWidth <= 1000) return 2;
      return 3;
    }
    const available = viewport.clientWidth;
    const step = getCardStep();
    return Math.max(1, Math.floor((available + getGap()) / step));
  }

  function getMaxIndex() {
    return Math.max(0, cards.length - getVisibleCards());
  }

  function updateCarousel() {
    const gap = getGap();
    const cardWidth = cards[0].offsetWidth;
    const step = cardWidth + gap;
    const maxIndex = getMaxIndex();

    if (currentIndex > maxIndex) currentIndex = maxIndex;

    const totalTrackWidth = cards.length * cardWidth + (cards.length - 1) * gap;
    const viewportStyle = viewport ? window.getComputedStyle(viewport) : null;
    const padX = viewportStyle
      ? (parseFloat(viewportStyle.paddingLeft) || 0) + (parseFloat(viewportStyle.paddingRight) || 0)
      : 0;
    const innerWidth = viewport ? viewport.clientWidth - padX : totalTrackWidth;
    const maxOffset = Math.max(0, totalTrackWidth - innerWidth);
    const rawOffset = currentIndex * step;
    const offset = currentIndex === maxIndex ? maxOffset : Math.min(rawOffset, maxOffset);

    container.style.transform = `translate3d(-${Math.max(0, offset)}px, 0, 0)`;

    leftArrow.classList.toggle("is-disabled", currentIndex <= 0);
    rightArrow.classList.toggle("is-disabled", currentIndex >= maxIndex);
  }

  function next() {
    const maxIndex = getMaxIndex();

    if (currentIndex < maxIndex) {
      currentIndex++;
      updateCarousel();
    }
  }

  function prev() {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  }

  function isSectionVisible() {
    if (!section) return false;

    const rect = section.getBoundingClientRect();

    return rect.top < window.innerHeight * 0.75 && rect.bottom > window.innerHeight * 0.25;
  }

  function handleWheel(event) {
    const scrollDistance = event.shiftKey ? event.deltaY : event.deltaX;
    const isHorizontalScroll =
      event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY);

    if (!isHorizontalScroll || wheelScrollLocked) return;

    const maxIndex = getMaxIndex();
    const canScrollRight = scrollDistance > 0 && currentIndex < maxIndex;
    const canScrollLeft = scrollDistance < 0 && currentIndex > 0;

    if (!canScrollRight && !canScrollLeft) return;

    event.preventDefault();
    wheelScrollLocked = true;

    if (canScrollRight) {
      next();
    } else {
      prev();
    }

    setTimeout(() => {
      wheelScrollLocked = false;
    }, 450);
  }

  function handleKeyboard(event) {
    if (!isSectionVisible()) return;

    if (event.key === "ArrowRight") {
      event.preventDefault();
      next();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      prev();
    }
  }

  function handleResize() {
    const maxIndex = getMaxIndex();

    if (currentIndex > maxIndex) {
      currentIndex = maxIndex;
    }

    updateCarousel();
  }

  rightArrow.addEventListener("click", next);
  leftArrow.addEventListener("click", prev);
  window.addEventListener("keydown", handleKeyboard);
  window.addEventListener("resize", handleResize);

  if (viewport) {
    viewport.setAttribute("tabindex", "0");
    viewport.addEventListener("wheel", handleWheel, { passive: false });
  }

  updateCarousel();
}
