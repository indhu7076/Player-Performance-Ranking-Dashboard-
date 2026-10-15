/* ==========================================================================
   RANKINGS JS - PLAYER PERFORMANCE RANKING DASHBOARD
   Podium Cards, Dynamic Leaderboard, Search, Filters & Sorting
   ========================================================================== */

let rankingsPlayers = [];

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('rankings-page')) {
    fetchRankingsData();
    initControls();
  }
});

function fetchRankingsData() {
  fetch('/api/players')
    .then(res => res.json())
    .then(data => {
      if (data.success && data.players) {
        rankingsPlayers = data.players;
        renderPodium(rankingsPlayers);
        renderTable(rankingsPlayers);
      }
    });
}

function initControls() {
  const searchInput = document.getElementById('rank-search');
  const teamFilter = document.getElementById('rank-team-filter');
  const posFilter = document.getElementById('rank-pos-filter');
  const sortSelect = document.getElementById('rank-sort-select');

  const update = () => {
    let filtered = [...rankingsPlayers];

    if (searchInput && searchInput.value.trim() !== '') {
      const q = searchInput.value.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p['Player Name'].toLowerCase().includes(q) ||
        p['Team'].toLowerCase().includes(q) ||
        p['Player ID'].toLowerCase().includes(q)
      );
    }

    if (teamFilter && teamFilter.value !== 'all') {
      filtered = filtered.filter(p => p.Team === teamFilter.value);
    }

    if (posFilter && posFilter.value !== 'all') {
      filtered = filtered.filter(p => p.Position === posFilter.value);
    }

    if (sortSelect) {
      const val = sortSelect.value;
      if (val === 'Rank-asc') filtered.sort((a,b) => a.Rank - b.Rank);
      else if (val === 'Score-desc') filtered.sort((a,b) => b['Performance Score'] - a['Performance Score']);
      else if (val === 'Name-asc') filtered.sort((a,b) => a['Player Name'].localeCompare(b['Player Name']));
      else if (val === 'Goals-desc') filtered.sort((a,b) => b.Goals - a.Goals);
    }

    renderTable(filtered);
  };

  if (searchInput) searchInput.addEventListener('input', update);
  if (teamFilter) teamFilter.addEventListener('change', update);
  if (posFilter) posFilter.addEventListener('change', update);
  if (sortSelect) sortSelect.addEventListener('change', update);
}

function renderPodium(players) {
  const sorted = [...players].sort((a, b) => a.Rank - b.Rank);
  const p1 = sorted[0];
  const p2 = sorted[1];
  const p3 = sorted[2];

  if (p1 && document.getElementById('podium-1-name')) {
    document.getElementById('podium-1-name').textContent = p1['Player Name'];
    document.getElementById('podium-1-team').textContent = `${p1.Team} • ${p1.Position}`;
    document.getElementById('podium-1-score').textContent = `${p1['Performance Score']} pts`;
  }
  if (p2 && document.getElementById('podium-2-name')) {
    document.getElementById('podium-2-name').textContent = p2['Player Name'];
    document.getElementById('podium-2-team').textContent = `${p2.Team} • ${p2.Position}`;
    document.getElementById('podium-2-score').textContent = `${p2['Performance Score']} pts`;
  }
  if (p3 && document.getElementById('podium-3-name')) {
    document.getElementById('podium-3-name').textContent = p3['Player Name'];
    document.getElementById('podium-3-team').textContent = `${p3.Team} • ${p3.Position}`;
    document.getElementById('podium-3-score').textContent = `${p3['Performance Score']} pts`;
  }
}

function renderTable(players) {
  const tbody = document.getElementById('rankings-tbody');
  if (!tbody) return;

  if (!players || players.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No player records matching criteria.</td></tr>';
    return;
  }

  tbody.innerHTML = players.map(p => {
    let rankBadge = `<strong>#${p.Rank}</strong>`;
    if (p.Rank === 1) rankBadge = '🥇 1';
    else if (p.Rank === 2) rankBadge = '🥈 2';
    else if (p.Rank === 3) rankBadge = '🥉 3';

    let lvlClass = 'badge-average';
    if (p['Performance Level'] === 'Excellent') lvlClass = 'badge-excellent';
    else if (p['Performance Level'] === 'Very Good') lvlClass = 'badge-very-good';
    else if (p['Performance Level'] === 'Good') lvlClass = 'badge-good';

    return `
      <tr onclick="window.location.href='/player/${p['Player ID']}'" style="cursor: pointer;">
        <td>${rankBadge}</td>
        <td>
          <a href="/player/${p['Player ID']}" style="color: var(--accent-cyan); font-weight: 700; text-decoration: none;">
            ${p['Player Name']}
          </a>
        </td>
        <td>${p.Team}</td>
        <td>${p.Position}</td>
        <td><strong style="color: var(--accent-gold); font-size: 1rem;">${p['Performance Score']}</strong></td>
        <td><span class="badge ${lvlClass}">${p['Performance Level']}</span></td>
      </tr>
    `;
  }).join('');
}
