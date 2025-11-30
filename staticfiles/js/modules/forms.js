import { getCookie } from '../utils/cookies.js';
import { showToast } from '../utils/toast.js';

export function initForms() {
  const appointmentForm = document.getElementById('appointmentForm');
  if (!appointmentForm) return;

  appointmentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const phoneInput = appointmentForm.querySelector('input[name="phone"]');
    const phoneError = appointmentForm.querySelector('#phoneError');
    const phoneValue = phoneInput?.value.trim() || '';
    const phoneRegex = /^(\+7|7|8)?9\d{9}$/;

    phoneInput.classList.remove('is-invalid');
    phoneError.style.display = 'none';

    if (!phoneValue) {
      phoneInput.classList.add('is-invalid');
      phoneError.textContent = 'Пожалуйста, введите номер телефона';
      phoneError.style.display = 'block';
      phoneInput.focus();
      return;
    }

    if (!phoneRegex.test(phoneValue)) {
      phoneInput.classList.add('is-invalid');
      phoneError.textContent = 'Введите номер в формате +79XXXXXXXXX';
      phoneError.style.display = 'block';
      phoneInput.focus();
      return;
    }

    const formData = new FormData(appointmentForm);
    const submitBtn = appointmentForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    const csrfToken = getCookie('csrftoken');
    formData.append('csrfmiddlewaretoken', csrfToken);

    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Отправка...';
    submitBtn.disabled = true;

    try {
      const response = await fetch(appointmentForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'X-CSRFToken': csrfToken },
      });

      const data = await response.json();
      const modalEl = document.getElementById('appointmentModal');
      const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
      modalInstance.hide();

      document.body.classList.remove('modal-open');
      document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove());

      if (data.success) {
        showToast('success', '✅ Ваша заявка успешно отправлена!');
        appointmentForm.reset();
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
