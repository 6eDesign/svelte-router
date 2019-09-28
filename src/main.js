import { getContext } from 'svelte';
import Router from './Components/Router.svelte';
import { ROUTER } from './Components/Router.svelte';
import Route from './Components/Route.svelte';


const getRouterCtx = () => {
  const ctx = getContext(ROUTER)
  ctx.selectedRoute.update(selected => {
    delete selected.ctx.page;
    return selected;
  });
  return ctx;
};

export { 
  getRouterCtx as getContext,
  Route,
  Router, 
}; 
