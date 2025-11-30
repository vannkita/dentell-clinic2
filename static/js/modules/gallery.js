export function initGallery() {
    const gallery = document.querySelector('.gallery-carousel');
    if (!gallery) return;
  
    if (typeof $.fn.owlCarousel === 'undefined') {
      console.warn('OwlCarousel not loaded - gallery disabled');
      return;
    }
  
    $(gallery).owlCarousel({
      loop: true,
      margin: 20,
      nav: true,
      dots: false,
      autoplay: true,
      autoplayTimeout: 5000,
      smartSpeed: 800,
      responsive: {
        0: { items: 1 },
        768: { items: 2 },
        992: { items: 3 },
      },
    });
  }
