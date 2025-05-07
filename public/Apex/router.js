const routes = [];
let currentRoute = null;

/**
 * Add a new route
 * @param {string} path - The route path
 * @param {Function} handler - The route handler function
 */
function add(path, handler) {
    const pattern = new RegExp('^' + path.replace(/:[^/]+/g, '([^/]+)') + '$');
    routes.push({ pattern, handler });
}

/**
 * Navigate to a new route
 * @param {string} path - The path to navigate to
 */
function navigate(path) {
    window.location.hash = path;
}

/**
 * Handle route changes
 */
function handleRouteChange() {
    const hash = window.location.hash.slice(1) || '/';

    for (const route of routes) {
        const match = hash.match(route.pattern);
        if (match) {
            const params = match.slice(1);
            currentRoute = { path: hash, params };
            route.handler(...params);
            return;
        }
    }

    // No route found
    console.warn(`No route found for path: ${hash}`);
}

/**
 * Start the router
 */
function start() {
    handleRouteChange();
}

/**
 * Get the current route
 * @returns {Object} The current route object
 */
function getCurrentRoute() {
    return currentRoute;
}

// Initialize event listener
window.addEventListener('#app', handleRouteChange);

// Export router functions
export { add, navigate, start, getCurrentRoute };