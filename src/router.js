// ============================================
// HASH-BASED SPA ROUTER
// ============================================

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.params = {};
    this.onBeforeNavigate = null;
  }

  addRoute(path, handler) {
    this.routes[path] = handler;
    return this;
  }

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
  }

  handleRoute() {
    const rawHash = window.location.hash.slice(1) || '/';
    const cleanHash = rawHash.split('?')[0]; // strip any query params
    const fullPath = '/' + cleanHash.replace(/^\//, '');

    // Reset params
    this.params = {};

    // 1. Try exact full path match first (e.g., /admin/teams, /players, /)
    if (this.routes[fullPath]) {
      this.navigate(fullPath);
      return;
    }

    // 2. Try prefix path with id param (e.g., /players/player-1 -> /players with params.id)
    const [path, ...rest] = cleanHash.split('/').filter(Boolean);
    const prefixRoute = '/' + (path || '');
    if (this.routes[prefixRoute] && rest.length > 0) {
      this.params.id = rest.join('/');
      this.navigate(prefixRoute);
      return;
    }

    // 3. Try regex pattern routes (:param)
    for (const route of Object.keys(this.routes)) {
      const pattern = route.replace(/:(\w+)/g, '([^/]+)');
      const regex = new RegExp(`^${pattern}$`);
      const match = fullPath.match(regex);
      if (match) {
        const paramNames = [...route.matchAll(/:(\w+)/g)].map(m => m[1]);
        paramNames.forEach((name, i) => {
          this.params[name] = match[i + 1];
        });
        this.navigate(route);
        return;
      }
    }

    // Default: home
    this.navigate('/');
  }

  navigate(routePath) {
    const container = document.getElementById('page-content');
    if (!container) return;

    // Page transition
    container.classList.add('page-exit');
    
    setTimeout(() => {
      container.innerHTML = '';
      container.classList.remove('page-exit');
      container.classList.add('page-enter');

      this.currentRoute = routePath;
      const handler = this.routes[routePath] || this.routes['/'];
      if (handler) {
        handler(container, this.params);
      }

      // Update active nav link
      document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${routePath}` || (routePath === '/' && href === '#/')) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(() => container.classList.remove('page-enter'), 400);
    }, 200);
  }

  getParams() {
    return this.params;
  }
}

export const router = new Router();

// Navigate helper for use in onclick handlers
export function navigateTo(path) {
  window.location.hash = path;
}
