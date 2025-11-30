function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) {
      console.error(`Section not found: ${sectionId}`);
      return;
    }
  
    const navbarHeight = document.querySelector('.navbar').offsetHeight;
    const sectionPosition = section.offsetTop - navbarHeight;
  
    window.scrollTo({
      top: sectionPosition,
      behavior: 'smooth',
    });
  
    setActiveNavLink(sectionId);
  }
  
  export function setActiveNavLink(sectionId) {
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.classList.remove('active');
    });
  
    const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }
  
  export function initNavigation() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
  
    navbar.style.opacity = '1';
    navbar.style.visibility = 'visible';
  
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  
    document.querySelectorAll('.nav-link[data-section]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.getAttribute('data-section');
        scrollToSection(sectionId);
      });
    });
  }