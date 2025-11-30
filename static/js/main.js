import { initNavigation } from './modules/navigation.js';
import { initAnimations } from './modules/animations.js';
import { initGallery } from './modules/gallery.js';
import { initForms } from './modules/forms.js';
import { initServiceCards } from './modules/serviceCards.js';

document.addEventListener('DOMContentLoaded', async () => {
    initNavigation();
    initAnimations();
    initGallery();
    await initForms(); // теперь работает корректно
    initServiceCards();
  
    if (typeof ScrollTrigger !== 'undefined') {
      setTimeout(() => ScrollTrigger.refresh(), 500);
    }
  
    setTimeout(async () => {
      const sections = ['about', 'services', 'contact'];
      const scrollPosition = window.scrollY + 100;
  
      for (const sectionId of sections) {
        const section = document.getElementById(sectionId);
        if (!section) continue;
  
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
  
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          const { setActiveNavLink } = await import('./modules/navigation.js');
          setActiveNavLink(sectionId);
          break;
        }
      }
    }, 1000);
  });
