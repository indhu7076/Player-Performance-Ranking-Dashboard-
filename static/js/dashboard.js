/* ==========================================================================
   DASHBOARD JS - PLAYER PERFORMANCE RANKING DASHBOARD
   Renders 4 KPI Cards & 4 Chart.js Visualizations
   ========================================================================== */

let allPlayers = [];
let chartInstances = {};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('dashboard-page')) {
    fetchDashboardData();
    initFilterListeners();
  }
});

function fetchDashboardData() {
  fetch('/api/players')
    .then(res => res.json())
    .then(data => {
      if (data.success && data.players) {
        allPlayers = data.players;
        updateDashboard(allPlayers);
      }
    });
}

function initFilterListeners() {
  const teamFilter = document.getElementById('dash-team-filter');
  const posFilter = document.getElementById('dash-pos-filter');
  const rangeFilter = document.getElementById('dash-range-filter');

  const applyFilters = () => {
    let filtered = [...allPlayers];
    if (teamFilter && teamFilter.value !== 'all') {
      filtered = filtered.filter(p => p.Team === teamFilter.value);
    }
    if (posFilter && posFilter.value !== 'all') {
      filtered = filtered.filter(p => p.Position === posFilter.value);
    }
    if (rangeFilter && rangeFilter.value !== 'all') {
      filtered = filtered.filter(p => p['Performance Level'] === rangeFilter.value);
    }
    updateDashboard(filtered);
  };

  if (teamFilter) teamFilter.addEventListener('change', applyFilters);
  if (posFilter) posFilter.addEventListener('change', applyFilters);
  if (rangeFilter) rangeFilter.addEventListener('change', applyFilters);
}

function updateDashboard(players) {
  updateKPICards(players);
  renderCharts(players);
}

// 1. Update 4 Top KPI Cards
function updateKPICards(players) {
  if (!players || players.length === 0) {
    document.getElementById('kpi-total-players').textContent = '0';
    document.getElementById('kpi-avg-score').textContent = '0.0';
    document.getElementById('kpi-highest-score').textContent = '0.0';
    document.getElementById('kpi-top-player').textContent = 'None';
    return;
  }

  const total = players.length;
  const avg = (players.reduce((sum, p) => sum + p['Performance Score'], 0) / total).toFixed(1);
  const topPlayer = [...players].sort((a, b) => b['Performance Score'] - a['Performance Score'])[0];

  document.getElementById('kpi-total-players').textContent = total;
  document.getElementById('kpi-avg-score').textContent = avg;
  document.getElementById('kpi-highest-score').textContent = topPlayer ? `${topPlayer['Performance Score']} pts` : '0';
  document.getElementById('kpi-top-player').textContent = topPlayer ? topPlayer['Player Name'] : 'N/A';
}

// 2. Render 4 Clean Charts
function renderCharts(players) {
  if (typeof Chart === 'undefined') return;

  Object.values(chartInstances).forEach(c => c.destroy());
  chartInstances = {};

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 } } }
    },
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { color: '#334155' } },
      y: { ticks: { color: '#64748b' }, grid: { color: '#334155' } }
    }
  };

  // Chart 1: Performance Score Distribution
  const ctx1 = document.getElementById('chart-distribution');
  if (ctx1) {
    const counts = { 'Excellent': 0, 'Very Good': 0, 'Good': 0, 'Average': 0 };
    players.forEach(p => {
      const lvl = p['Performance Level'] || 'Average';
      if (counts[lvl] !== undefined) counts[lvl]++;
    });

    chartInstances.dist = new Chart(ctx1, {
      type: 'doughnut',
      data: {
        labels: ['Excellent (≥85)', 'Very Good (75-84.9)', 'Good (65-74.9)', 'Average (<65)'],
        datasets: [{
          data: [counts['Excellent'], counts['Very Good'], counts['Good'], counts['Average']],
          backgroundColor: ['#10b981', '#06b6d4', '#f59e0b', '#64748b'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } }
      }
    });
  }

  // Chart 2: Team-wise Performance
  const ctx2 = document.getElementById('chart-team');
  if (ctx2) {
    const teams = {};
    players.forEach(p => {
      if (!teams[p.Team]) teams[p.Team] = { total: 0, count: 0 };
      teams[p.Team].total += p['Performance Score'];
      teams[p.Team].count += 1;
    });

    const teamNames = Object.keys(teams);
    const teamAvgs = teamNames.map(t => (teams[t].total / teams[t].count).toFixed(1));

    chartInstances.team = new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: teamNames,
        datasets: [{
          label: 'Avg Performance Score',
          data: teamAvgs,
          backgroundColor: '#06b6d4',
          borderRadius: 6
        }]
      },
      options: commonOptions
    });
  }

  // Chart 3: Position-wise Performance
  const ctx3 = document.getElementById('chart-position');
  if (ctx3) {
    const positions = {};
    players.forEach(p => {
      if (!positions[p.Position]) positions[p.Position] = { total: 0, count: 0 };
      positions[p.Position].total += p['Performance Score'];
      positions[p.Position].count += 1;
    });

    const posNames = Object.keys(positions);
    const posAvgs = posNames.map(pos => (positions[pos].total / positions[pos].count).toFixed(1));

    chartInstances.pos = new Chart(ctx3, {
      type: 'bar',
      data: {
        labels: posNames,
        datasets: [{
          label: 'Avg Position Score',
          data: posAvgs,
          backgroundColor: '#3b82f6',
          borderRadius: 6
        }]
      },
      options: commonOptions
    });
  }

  // Chart 4: Performance Trend Line
  const ctx4 = document.getElementById('chart-trend');
  if (ctx4) {
    const sorted = [...players].sort((a, b) => a['Rank'] - b['Rank']);

    chartInstances.trend = new Chart(ctx4, {
      type: 'line',
      data: {
        labels: sorted.map(p => `#${p['Rank']}`),
        datasets: [{
          label: 'Performance Curve',
          data: sorted.map(p => p['Performance Score']),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          fill: true,
          tension: 0.35
        }]
      },
      options: commonOptions
    });
  }
}
