export function initAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP or ScrollTrigger not loaded - animations disabled');
      return;
    }
  
    gsap.registerPlugin(ScrollTrigger);
  
    gsap.to('.hero-section', {
      scrollTrigger: { scrub: true },
      y: 100,
      opacity: 0.8,
      scale: 1.02,
    });
  
    gsap.utils.toArray('.animate-section').forEach((section) => {
      gsap.from(section, {
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 50,
        duration: 1,
      });
    });
  
    gsap.utils.toArray('.service-card').forEach((card, i) => {
      gsap.set(card, { opacity: 1, x: 0 });
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 90%',
          toggleActions: 'play none none none',
          once: true,
        },
        opacity: 0,
        x: i % 2 ? 50 : -50,
        duration: 0.8,
        delay: i * 0.1,
      });
    });
  }
