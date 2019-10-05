import { getContext } from 'svelte';
import Router from './Components/Router.svelte';
import { ROUTER } from './Components/Router.svelte';
import Route from './Components/Route.svelte';


const getRouterCtx = () => getContext(ROUTER);

export { 
  getRouterCtx as getContext,
  Route,
  Router, 
}; 
