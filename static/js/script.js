// ==============================================
// MAIN SCRIPT FILE
// ==============================================

// ==============================================
// GLOBAL HELPER FUNCTIONS
// ==============================================

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

function showToast(type, message) {
  const toastEl = document.getElementById('toast');
  if (!toastEl) {
    console.error('Toast element not found');
    return;
  }

  const toastBody = toastEl.querySelector('.toast-body');
  if (!toastBody) {
    console.error('Toast body not found');
    return;
  }

  toastBody.innerText = message;

  toastEl.classList.remove('bg-success', 'bg-danger');
  toastEl.classList.add(type === 'success' ? 'bg-success' : 'bg-danger');

  const bsToast = new bootstrap.Toast(toastEl);
  bsToast.show();
}

// ==============================================
// NAVIGATION MODULE
// ==============================================

function initNavigation() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  // Гарантируем видимость навигации
  navbar.style.opacity = '1';
  navbar.style.visibility = 'visible';

  // Эффект при прокрутке
  window.addEventListener('scroll', function() {
    if (window.scrollY > 10) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Плавная прокрутка к секциям
  document.querySelectorAll('.nav-link[data-section]').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const sectionId = this.getAttribute('data-section');
      scrollToSection(sectionId);
    });
  });
}

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
    behavior: 'smooth'
  });
  
  setActiveNavLink(sectionId);
}

function setActiveNavLink(sectionId) {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  
  const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

// ==============================================
// ANIMATIONS MODULE
// ==============================================

function initAnimations() {
  // Проверяем наличие GSAP
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('GSAP or ScrollTrigger not loaded - animations disabled');
    return;
  }
  
  // Регистрируем плагин
  gsap.registerPlugin(ScrollTrigger);
  
  // Параллакс для героя
  gsap.to(".hero-section", {
    scrollTrigger: {
      scrub: true
    },
    y: 100,
    opacity: 0.8,
    scale: 1.02
  });

  // Анимация секций при скролле
  gsap.utils.toArray(".animate-section").forEach(section => {
    gsap.from(section, {
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        toggleActions: "play none none none"
      },
      opacity: 0,
      y: 50,
      duration: 1
    });
  });

  // Анимация карточек услуг
  gsap.utils.toArray(".service-card").forEach((card, i) => {
    gsap.set(card, { opacity: 1, x: 0 });
    
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: "top 90%",
        toggleActions: "play none none none",
        once: true
      },
      opacity: 0,
      x: i % 2 ? 50 : -50,
      duration: 0.8,
      delay: i * 0.1
    });
  });
}

// ==============================================
// GALLERY MODULE
// ==============================================

function initGallery() {
  const gallery = document.querySelector('.gallery-carousel');
  if (!gallery) return;
  
  // Проверяем наличие OwlCarousel
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
      992: { items: 3 }
    }
  });
}
// ==============================================
// FORM SUBMISSION MODULE (ФИНАЛЬНАЯ РАБОЧАЯ ВЕРСИЯ)
// ==============================================

function initForms() {
  const appointmentForm = document.getElementById('appointmentForm');
  if (!appointmentForm) return;

  appointmentForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const phoneInput = this.querySelector('input[name="phone"]');
    const phoneError = this.querySelector('#phoneError');
    const phoneValue = phoneInput?.value.trim() || '';
    const phoneRegex = /^(\+7|7|8)?9\d{9}$/;
    
    // Скрыть предыдущую ошибку (если была)
    phoneInput.classList.remove('is-invalid');
    phoneError.style.display = 'none';
    
    if (!phoneValue) {
      phoneInput.classList.add('is-invalid');
      phoneError.textContent = 'Пожалуйста, введите номер телефона';
      phoneError.style.display = 'block';
      phoneInput?.focus();
      return;
    }
    
    if (!phoneRegex.test(phoneValue)) {
      phoneInput.classList.add('is-invalid');
      phoneError.textContent = 'Введите номер в формате +79XXXXXXXXX';
      phoneError.style.display = 'block';
      phoneInput?.focus();
      return;
    }

    const formData = new FormData(this);
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    // CSRF токен
    const csrfToken = getCookie('csrftoken');
    formData.append('csrfmiddlewaretoken', csrfToken);

    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Отправка...';
    submitBtn.disabled = true;

    try {
      const response = await fetch(this.action, {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRFToken': csrfToken
        }
      });

      const data = await response.json();

      const modalEl = document.getElementById('appointmentModal');
      const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
      modalInstance.hide();

      // Удаляем затемнение вручную, если оно вдруг не исчезло
      document.body.classList.remove('modal-open');
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());

      // Показываем уведомление
      if (data.success) {
        showToast('success', '✅ Ваша заявка успешно отправлена!');
        this.reset(); // Очищаем форму
      } else {
        showToast('error', data.error || '❌ Ошибка при отправке формы');
      }

    } catch (error) {
      console.error('Ошибка:', error);
      showToast('error', '❌ Произошла ошибка. Пожалуйста, попробуйте еще раз.');
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}

// ==============================================
// SERVICE CARDS CLICK HANDLER (ИСПРАВЛЕННЫЙ)
// ==============================================

function initServiceCards() {
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', function(e) {
      // Проверяем, не был ли клик по внутренним элементам
      if (e.target.closest('a, button')) return;
      
      const serviceName = this.querySelector('.card-title')?.textContent?.trim() || '';
      const commentField = document.querySelector('#appointmentModal textarea[name="comment"]');
      
      if (commentField) {
        commentField.value = serviceName ? `Хочу записаться на: ${serviceName}` : '';
      }
      
      // Открываем модальное окно
      const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('appointmentModal'));
      modal.show();
      
      // Фокусируемся на первом поле
      document.querySelector('#appointmentModal input[name="first_name"]')?.focus();
    });
  });
}

// ==============================================
// INITIALIZATION
// ==============================================

document.addEventListener('DOMContentLoaded', function() {
  initNavigation();
  initAnimations();
  initGallery();
  initForms();
  initServiceCards();
  
  if (typeof ScrollTrigger !== 'undefined') {
    setTimeout(() => ScrollTrigger.refresh(), 500);
  }
});
  // Установка активной вкладки при загрузке
  setTimeout(() => {
    // Функция для обновления активной вкладки
    function updateActiveNavLink() {
      const sections = ['about', 'services', 'contact'];
      const scrollPosition = window.scrollY + 100;
      
      for (const sectionId of sections) {
        const section = document.getElementById(sectionId);
        if (!section) continue;
        
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          setActiveNavLink(sectionId);
          break;
        }
      }
    }
    
    updateActiveNavLink();
  }, 1000);
