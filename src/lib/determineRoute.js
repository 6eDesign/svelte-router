const isNamedParam = str => str.length > 2 && str.indexOf(':') == 0; 

const testString = (routeString, path) => { 
  let params = { }; 
  if(routeString.indexOf(':') == -1) { 
    return routeString === path ? params : false;
  }
  const pathParts = path.substring(1).split('/'); 
  const routeParts = routeString.substring(1).split('/');
  if(pathParts.length !== routeParts.length) return false;
  for (var i = 0; i < pathParts.length; ++i) { 
    if(isNamedParam(routeParts[i])) { 
      params[routeParts[i].substring(1)] = pathParts[i]; 
      continue; 
    }
    if(pathParts[i] !== routeParts[i]) return false;
  }
  return true;
};

const matchRoute = (route, path) => { 
  switch(typeof route.path) { 
    case 'string': 
      return testString(route.path, path); 
    case 'function': 
      return route.path(path);
    case 'object': 
      if(!(route.path instanceof RegExp)) return false;
      return route.path.test(path);
      break;
    default: 
      return false;
  }
};

export default function determineRoute(routes, path) { 
  for(var i=0; i < routes.length; ++i) { 
    let params = matchRoute(routes[i], path); 
    if(params) { 
      return { route: routes[i], params }; 
    }
  }
  return null;
}