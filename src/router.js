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
    const hash = window.location.hash.slice(1) || '/';
    const [path, ...rest] = hash.split('/').filter(Boolean);
    const routePath = '/' + (path || '');

    // Check for parameterized routes
    this.params = {};
    
    // Try exact match first
    if (this.routes[routePath]) {
      if (rest.length > 0) {
        this.params.id = rest.join('/');
      }
      this.navigate(routePath);
      return;
    }

    // Try with sub-path
    const fullPath = '/' + hash.replace(/^\//, '');
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
