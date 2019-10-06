<script>
  import { getContext, onMount } from 'svelte'; 
  import Page from './Page.svelte';
  // import { ROUTER } from '../Router.svelte';
  let { selectedRoute } = getContext('ROUTER'); 
</script>

<Page>
  <h1>Regex Route</h1>

  <p>
    <strong>route:</strong>
  </p>
  <pre>{JSON.stringify($selectedRoute.ctx.params,null,2)}</pre>
  <p>Go <a href="/svelte-router/">home.</a></p>
</Page>
