export function initServiceCards() {
    document.querySelectorAll('.service-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('a, button')) return;
  
        const serviceName = card.querySelector('.card-title')?.textContent?.trim() || '';
        const commentField = document.querySelector('#appointmentModal textarea[name="comment"]');
  
        if (commentField) {
          commentField.value = serviceName ? `Хочу записаться на: ${serviceName}` : '';
        }
  
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('appointmentModal'));
        modal.show();
  
        document.querySelector('#appointmentModal input[name="first_name"]')?.focus();
      });
    });
  }
