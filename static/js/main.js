/* ==========================================================================
   GLOBAL MAIN JS - PLAYER PERFORMANCE RANKING DASHBOARD
   Handles navbar mobile drawer, presentation mode, theme, toasts
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initPresentationMode();
});

// 1. Mobile Menu Drawer
function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const closeBtn = document.getElementById('mobile-menu-close');
  const drawer = document.getElementById('mobile-drawer');

  if (btn && drawer) {
    btn.addEventListener('click', () => drawer.classList.add('open'));
  }
  if (closeBtn && drawer) {
    closeBtn.addEventListener('click', () => drawer.classList.remove('open'));
  }
}

// 2. Presentation Mode Toggle
function initPresentationMode() {
  const btn = document.getElementById('btn-presentation-mode');
  if (btn) {
    btn.addEventListener('click', () => {
      document.body.classList.toggle('presentation-mode');
      const isActive = document.body.classList.contains('presentation-mode');
      showToast(isActive ? "Presentation Mode Activated" : "Presentation Mode Deactivated");
    });
  }
}

// 3. Demo Reset
window.triggerDemoReset = function() {
  if (!confirm("Reset dataset to default demo sample data and standard algorithm weights?")) return;
  fetch('/api/demo/reset', { method: 'POST' })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast("Demo dataset reset successfully!");
        setTimeout(() => window.location.reload(), 800);
      } else {
        showToast(data.message || "Failed to reset demo dataset", "error");
      }
    });
};

// 4. Toast Notification
window.showToast = function(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="lucide-info"></i><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};
