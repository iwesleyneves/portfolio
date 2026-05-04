function initCertificateModal() {
  const modal = document.getElementById("certificate-modal");
  const modalImg = document.getElementById("modal-cert-img");
  const closeBtn = document.querySelector(".modal-close");
  const overlay = document.querySelector(".modal-overlay");
  const certButtons = document.querySelectorAll(".certificate-card-link[data-cert-img]");

  if (!modal || certButtons.length === 0) return;

  function openModal(imgSrc) {
    modalImg.src = imgSrc;
    modal.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent scrolling
  }

  function closeModal() {
    modal.classList.remove("active");
    document.body.style.overflow = ""; // Restore scrolling
    // Clear image after transition to prevent flicker next time
    setTimeout(() => {
      if (!modal.classList.contains("active")) {
        modalImg.src = "";
      }
    }, 400);
  }

  certButtons.forEach(button => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const imgSrc = button.getAttribute("data-cert-img");
      if (imgSrc) {
        openModal(imgSrc);
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  if (overlay) {
    overlay.addEventListener("click", closeModal);
  }

  // Close on ESC key
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });
}
