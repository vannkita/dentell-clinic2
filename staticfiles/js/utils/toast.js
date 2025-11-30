export function showToast(type, message) {
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