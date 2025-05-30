export let routes = [];
export function Routes(newroutes) {
    routes = newroutes
}

function navigate(path) {    
    window.location.hash = path;
    handleRouteChange();
}

function handleRouteChange() {
    let Error = true
    
    let hash = "#" + window.location.hash.slice(1);
   
    for (const route of routes) {
        if (route.route === hash) {
            Error = false
            route.handler1();
            route.handler2();
            route.handler3();
            route.handler4();

            route.Error()
            return;
        }
    }
    if (Error && routes.length == 2) {
        routes[routes.length-1].handler()
    }
}

window.onhashchange=handleRouteChange;
window.onload=navigate('#/')


export {navigate};