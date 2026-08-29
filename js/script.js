/* ============================================
   AezraPuissant — page logic
   Populates the Discord avatar/username via the
   public Lanyard API, and renders a simple view
   counter. No backend required.
   ============================================ */

(() => {
  const DISCORD_ID = '1034804876733071382';
  const LANYARD_URL = `https://api.lanyard.rest/v1/users/${DISCORD_ID}`;

  const avatarEl = document.getElementById('discordAvatar');
  const usernameEl = document.getElementById('discordUsername');
  const viewCountEl = document.getElementById('view-count-number');

  // ---------- Discord profile via Lanyard ----------
  async function loadDiscordProfile() {
    try {
      const res = await fetch(LANYARD_URL);
      if (!res.ok) throw new Error(`Lanyard responded ${res.status}`);
      const { data, success } = await res.json();
      if (!success || !data || !data.discord_user) throw new Error('Lanyard: no user data');

      const user = data.discord_user;
      const avatarUrl = user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256`
        : `https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator || 0) % 5}.png`;

      if (avatarEl) avatarEl.src = avatarUrl;

      const displayName = user.global_name || user.username || 'Unknown';
      if (usernameEl) usernameEl.textContent = displayName;
      if (usernameEl) usernameEl.setAttribute('data-text', displayName);

      const statusDot = document.getElementById('statusDot');
      if (statusDot) statusDot.className = `status-dot ${data.discord_status || 'offline'}`;
    } catch (err) {
      console.warn('[AezraPuissant] Falling back to static profile info:', err);
      // Keep whatever is already in the markup (rr.png + the placeholder text)
      // so the page still looks intentional if Lanyard is unreachable.
    }
  }

  // ---------- View counter ----------
  // Uses a free, keyless counter API so no backend is required.
  // Falls back to a locally-persisted count if the request fails,
  // so the page never shows a broken counter.
  async function loadViewCount() {
    if (!viewCountEl) return;
    const NAMESPACE = 'aezrapuissant-site';
    const KEY = 'profile-views';
    const endpoint = `https://api.counterapi.dev/v1/${NAMESPACE}/${KEY}/up`;

    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`Counter API responded ${res.status}`);
      const json = await res.json();
      const count = json.count ?? json.value;
      if (typeof count !== 'number') throw new Error('Counter API: unexpected payload');
      viewCountEl.textContent = count.toLocaleString();
    } catch (err) {
      console.warn('[AezraPuissant] View counter API unavailable, using local fallback:', err);
      const stored = Number(localStorage.getItem(KEY) || 0) + 1;
      localStorage.setItem(KEY, String(stored));
      viewCountEl.textContent = `${stored.toLocaleString()}*`;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadDiscordProfile();
    loadViewCount();
  });
})();
