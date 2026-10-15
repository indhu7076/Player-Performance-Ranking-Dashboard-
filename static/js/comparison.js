/* ==========================================================================
   COMPARISON JS - PLAYER PERFORMANCE RANKING DASHBOARD
   Compares 2 or 3 players across Matches, Goals, Assists, Passing, Defense, Fitness, Score
   ========================================================================== */

let compPlayers = [];
let chartBar = null;
let chartRadar = null;

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('comparison-page')) {
    fetchCompPlayers();
  }
});

function fetchCompPlayers() {
  fetch('/api/players')
    .then(res => res.json())
    .then(data => {
      if (data.success && data.players) {
        compPlayers = data.players;
        populateDropdowns(compPlayers);
        initListeners();
        
        if (compPlayers.length >= 2) {
          document.getElementById('select-p1').value = compPlayers[0]['Player ID'];
          document.getElementById('select-p2').value = compPlayers[1]['Player ID'];
          updateComparison();
        }
      }
    });
}

function populateDropdowns(players) {
  const sel1 = document.getElementById('select-p1');
  const sel2 = document.getElementById('select-p2');
  const sel3 = document.getElementById('select-p3');

  const options = players.map(p => 
    `<option value="${p['Player ID']}">${p['Player Name']} (${p.Team} • ${p.Position})</option>`
  ).join('');

  if (sel1) sel1.innerHTML = options;
  if (sel2) sel2.innerHTML = options;
  if (sel3) sel3.innerHTML = '<option value="none">-- None --</option>' + options;
}

function initListeners() {
  ['select-p1', 'select-p2', 'select-p3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', updateComparison);
  });
}

function updateComparison() {
  const id1 = document.getElementById('select-p1').value;
  const id2 = document.getElementById('select-p2').value;
  const id3 = document.getElementById('select-p3').value;

  const p1 = compPlayers.find(p => p['Player ID'] === id1);
  const p2 = compPlayers.find(p => p['Player ID'] === id2);
  const p3 = id3 !== 'none' ? compPlayers.find(p => p['Player ID'] === id3) : null;

  if (!p1 || !p2) return;

  renderTable(p1, p2, p3);
  renderCharts(p1, p2, p3);
}

function renderTable(p1, p2, p3) {
  const th3 = document.getElementById('th-p3');
  if (th3) th3.style.display = p3 ? 'table-cell' : 'none';

  document.getElementById('th-p1').textContent = p1['Player Name'];
  document.getElementById('th-p2').textContent = p2['Player Name'];
  if (p3) document.getElementById('th-p3').textContent = p3['Player Name'];

  const metrics = [
    { label: 'Overall Rank', key: 'Rank', format: v => `#${v}` },
    { label: 'Performance Score', key: 'Performance Score', format: v => `${v} pts` },
    { label: 'Performance Level', key: 'Performance Level', format: v => v },
    { label: 'Matches Played', key: 'Matches', format: v => v },
    { label: 'Goals', key: 'Goals', format: v => v },
    { label: 'Assists', key: 'Assists', format: v => v },
    { label: 'Passing Accuracy', key: 'Passing', format: v => `${v}%` },
    { label: 'Defensive Rating', key: 'Defense', format: v => v },
    { label: 'Fitness Index', key: 'Fitness', format: v => v }
  ];

  const tbody = document.getElementById('comp-table-body');
  tbody.innerHTML = metrics.map(m => {
    const v1 = m.format(p1[m.key]);
    const v2 = m.format(p2[m.key]);
    const v3 = p3 ? m.format(p3[m.key]) : '';

    return `
      <tr>
        <td style="font-weight: 700; color: var(--text-secondary); text-align: center;">${m.label}</td>
        <td style="text-align: center;"><strong>${v1}</strong></td>
        <td style="text-align: center;"><strong>${v2}</strong></td>
        ${p3 ? `<td style="text-align: center;"><strong>${v3}</strong></td>` : ''}
      </tr>
    `;
  }).join('');
}

function renderCharts(p1, p2, p3) {
  if (typeof Chart === 'undefined') return;

  if (chartBar) chartBar.destroy();
  if (chartRadar) chartRadar.destroy();

  const ctxBar = document.getElementById('comp-chart-bar');
  if (ctxBar) {
    const datasets = [
      {
        label: p1['Player Name'],
        data: [p1.Goals, p1.Assists, p1.Passing, p1.Defense, p1.Fitness],
        backgroundColor: '#06b6d4',
        borderRadius: 4
      },
      {
        label: p2['Player Name'],
        data: [p2.Goals, p2.Assists, p2.Passing, p2.Defense, p2.Fitness],
        backgroundColor: '#f59e0b',
        borderRadius: 4
      }
    ];

    if (p3) {
      datasets.push({
        label: p3['Player Name'],
        data: [p3.Goals, p3.Assists, p3.Passing, p3.Defense, p3.Fitness],
        backgroundColor: '#10b981',
        borderRadius: 4
      });
    }

    chartBar = new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: ['Goals', 'Assists', 'Passing (%)', 'Defense', 'Fitness'],
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: '#64748b' }, grid: { color: '#334155' } },
          y: { ticks: { color: '#64748b' }, grid: { color: '#334155' } }
        },
        plugins: { legend: { labels: { color: '#94a3b8' } } }
      }
    });
  }

  const ctxRadar = document.getElementById('comp-chart-radar');
  if (ctxRadar) {
    const datasets = [
      {
        label: p1['Player Name'],
        data: [p1.norm_goals || 50, p1.norm_assists || 50, p1.norm_passing || 50, p1.norm_defense || 50, p1.norm_fitness || 50],
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.2)'
      },
      {
        label: p2['Player Name'],
        data: [p2.norm_goals || 50, p2.norm_assists || 50, p2.norm_passing || 50, p2.norm_defense || 50, p2.norm_fitness || 50],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.2)'
      }
    ];

    if (p3) {
      datasets.push({
        label: p3['Player Name'],
        data: [p3.norm_goals || 50, p3.norm_assists || 50, p3.norm_passing || 50, p3.norm_defense || 50, p3.norm_fitness || 50],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)'
      });
    }

    chartRadar = new Chart(ctxRadar, {
      type: 'radar',
      data: {
        labels: ['Goals', 'Assists', 'Passing', 'Defense', 'Fitness'],
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { r: { grid: { color: '#334155' }, ticks: { color: '#64748b' } } },
        plugins: { legend: { labels: { color: '#94a3b8' } } }
      }
    });
  }
}
