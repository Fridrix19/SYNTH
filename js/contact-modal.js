/**
 * Форма обратной связи (Web3Forms). Подключать после Bootstrap на страницах с #contactForm.
 */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    form.classList.add('was-validated');
    if (!form.checkValidity()) return;

    const btn = document.getElementById('contactSubmit');
    const accessKey = form.querySelector('input[name="access_key"]')?.value?.trim();
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    if (btn) btn.disabled = true;
    try {
      const r = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `[SYNTH] Сообщение от ${name}`,
          name,
          email,
          message,
        }),
      });
      let data = {};
      try {
        data = await r.json();
      } catch (_) {}

      const toastOk = document.getElementById('contactToastOk');
      const toastErr = document.getElementById('contactToastErr');
      const errText = document.getElementById('contactToastErrText');

      if (r.ok && data.success) {
        if (toastOk) new bootstrap.Toast(toastOk).show();
        form.reset();
        form.classList.remove('was-validated');
        const modalEl = document.getElementById('contactModal');
        if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();
      } else {
        const apiMsg = data.message || data.error;
        if (errText) {
          errText.textContent =
            typeof apiMsg === 'string'
              ? apiMsg
              : 'Не удалось отправить. Проверьте ключ Web3Forms или попробуйте позже.';
        }
        if (toastErr) new bootstrap.Toast(toastErr).show();
      }
    } catch (_) {
      const errText = document.getElementById('contactToastErrText');
      const toastErr = document.getElementById('contactToastErr');
      if (errText) {
        errText.textContent =
          'Нет связи с сервисом отправки. Проверьте интернет или отключите блокировщики.';
      }
      if (toastErr) new bootstrap.Toast(toastErr).show();
    }
    if (btn) btn.disabled = false;
  });
}

function openContactModalFromHash() {
  if (window.location.hash !== '#contact') return;
  const el = document.getElementById('contactModal');
  if (el && typeof bootstrap !== 'undefined') {
    bootstrap.Modal.getOrCreateInstance(el).show();
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initContactForm();
  openContactModalFromHash();
});
