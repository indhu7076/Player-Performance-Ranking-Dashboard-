/* ==========================================================================
   ALGORITHM JS - PLAYER PERFORMANCE RANKING DASHBOARD
   Sliders for Goals, Assists, Passing, Defense, Fitness & live recalculation
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('algorithm-page')) {
    initAlgorithmControls();
  }
});

function initAlgorithmControls() {
  const sliders = ['w-goals', 'w-assists', 'w-passing', 'w-defense', 'w-fitness'];
  
  const updateTotal = () => {
    let total = 0;
    sliders.forEach(id => {
      const el = document.getElementById(id);
      const valEl = document.getElementById(`${id}-val`);
      if (el && valEl) {
        const val = parseInt(el.value, 10);
        valEl.textContent = `${val}%`;
        total += val;
      }
    });

    const totalEl = document.getElementById('total-weight-val');
    if (totalEl) {
      totalEl.textContent = `${total}% Total`;
      if (total === 100) {
        totalEl.className = 'badge badge-very-good';
      } else {
        totalEl.className = 'badge badge-excellent';
        totalEl.style.background = 'rgba(239, 68, 68, 0.2)';
        totalEl.style.color = 'var(--accent-red)';
      }
    }
  };

  sliders.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateTotal);
  });

  updateTotal();

  const applyBtn = document.getElementById('btn-apply-weights');
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      let total = 0;
      const weights = {};
      sliders.forEach(id => {
        const key = id.replace('w-', '');
        const val = parseInt(document.getElementById(id).value, 10);
        weights[key] = val / 100.0;
        total += val;
      });

      if (total !== 100) {
        showToast(`Total weight must equal 100%. Current sum: ${total}%`, 'error');
        return;
      }

      fetch('/api/algorithm/recalculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weights: weights })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showToast("Algorithm weights updated & rankings recalculated!");
          renderAlgoPreviewTable(data.players);
        }
      });
    });
  }

  // Initial fetch for preview
  fetch('/api/players')
    .then(res => res.json())
    .then(data => {
      if (data.success && data.players) {
        renderAlgoPreviewTable(data.players);
      }
    });
}

function renderAlgoPreviewTable(players) {
  const tbody = document.getElementById('algo-preview-tbody');
  if (!tbody || !players) return;

  const sorted = [...players].sort((a,b) => a.Rank - b.Rank).slice(0, 10);

  tbody.innerHTML = sorted.map(p => `
    <tr>
      <td><strong>#${p.Rank}</strong></td>
      <td><strong>${p['Player Name']}</strong></td>
      <td>${p.Team}</td>
      <td><strong style="color: var(--accent-gold);">${p['Performance Score']}</strong></td>
      <td><span class="badge badge-very-good">${p['Performance Level']}</span></td>
    </tr>
  `).join('');
}
