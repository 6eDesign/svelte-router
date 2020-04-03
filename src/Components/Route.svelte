<script>
  import { getContext, onDestroy } from "svelte";
  import DefaultLoadingComponent from "./Loading.svelte";
  import DefaultErrorComponent from "./Error.svelte";

  const {
    registerRoute,
    selectedRoute,
    error: routerErrorComponent = null,
    loading: routerLoadingComponent = null
  } = getContext("ROUTER");

  // props
  export let path;
  export let asyncComponent = null;
  export let component = null;
  export let middleware = [];
  export let metadata = {};
  export let error = null;
  export let loading = null;

  // template variables
  let componentPromise;
  let target;
  let routeError = null;
  let routeIsActive = false;

  // reactive variables:
  let loadingComponent, errorComponent;
  $: loadingComponent =
    loading || routerLoadingComponent || DefaultLoadingComponent;
  $: errorComponent = error || routerErrorComponent || DefaultErrorComponent;

  const route = {
    path,
    asyncComponent,
    middleware,
    metadata
  };
  registerRoute(route);

  selectedRoute.subscribe(selected => {
    if (!selected || selected.route !== route) {
      if (component) component.$destroy();
      routeIsActive = false;
      return;
    }
    if (asyncComponent && selected && selected.route == route) {
      componentPromise = asyncComponent();
      if (routeIsActive) {
        component.$set({ selectedRoute });
      } else {
        routeIsActive = true;
        componentPromise.then(({ default: Component }) => {
          component = new Component({
            target,
            props: { selectedRoute }
          });
          return component;
        });
      }
    }
  });
</script>

{#if $selectedRoute && $selectedRoute.route == route}
  {#if asyncComponent}
    {#await componentPromise}
      <svelte:component this={loadingComponent} />
    {:then}

    {:catch error}
      <svelte:component this={errorComponent} {error} />
    {/await}
    <div bind:this={target} class="route-container" />
  {:else if component}
    <svelte:component this={component} {selectedRoute} />
  {:else}
    <slot />
  {/if}
{/if}
