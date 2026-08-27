// ============================================
// FOOTER COMPONENT
// ============================================

export function renderFooter() {
  const footer = document.createElement('footer');
  footer.className = 'footer';

  footer.innerHTML = `
    <div class="footer-inner">
      <div class="footer-grid">
        <div>
          <div class="footer-brand">
            <div class="navbar-brand-icon" style="width:32px;height:32px;font-size:1rem;">⚽</div>
            FootballHub
          </div>
          <p class="footer-description">
            The ultimate platform for organizing and managing local football teams, players, matches, and tournaments. Bringing the beautiful game together.
          </p>
        </div>

        <div>
          <h4 class="footer-col-title">Explore</h4>
          <div class="footer-links">
            <a href="#/teams">Teams</a>
            <a href="#/players">Players</a>
            <a href="#/matches">Matches</a>
            <a href="#/standings">Standings</a>
          </div>
        </div>

        <div>
          <h4 class="footer-col-title">Tournaments</h4>
          <div class="footer-links">
            <a href="#/tournaments">Active</a>
            <a href="#/tournaments">Upcoming</a>
            <a href="#/tournaments">Results</a>
          </div>
        </div>

        <div>
          <h4 class="footer-col-title">Platform</h4>
          <div class="footer-links">
            <a href="#">About</a>
            <a href="#">Contact</a>
            <a href="#">Admin</a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} FootballHub. All rights reserved.</span>
        <span>Built with ⚽ & ❤️</span>
      </div>
    </div>
  `;

  return footer;
}
