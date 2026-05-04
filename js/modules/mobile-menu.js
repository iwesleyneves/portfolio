function initMobileMenu() {
  const navbar = document.querySelector(".navbar");
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelectorAll(".navbar a");

  if (!navbar || !menuToggle) return;

  function toggleMenu() {
    navbar.classList.toggle("active");
    // Toggle body scroll
    if (navbar.classList.contains("active")) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }

  function closeMenu() {
    navbar.classList.remove("active");
    document.body.style.overflow = "";
  }

  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close menu when a link is clicked
  navLinks.forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (navbar.classList.contains("active") && !navbar.contains(e.target)) {
      closeMenu();
    }
  });

  // Close menu on resize if window becomes wide
  window.addEventListener("resize", () => {
    if (window.innerWidth > 600 && navbar.classList.contains("active")) {
      closeMenu();
    }
  });
}
