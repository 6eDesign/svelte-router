<script>
  import { getContext } from 'svelte'; 
  import Page from './Page.svelte';
  // import { ROUTER } from '../Router.svelte';
  let { selectedRoute } = getContext('ROUTER'); 
</script>

<Page>
  <h1>Homepage</h1>
  <p>
    <strong>route:</strong>
  </p>
  <pre>{JSON.stringify($selectedRoute.ctx.params,null,2)}</pre>
  <p>
    Go to <a href="/svelte-router/home-alt">home-alternate</a>
  </p>
  <p>
    Go to <a href="/svelte-router/regex-route.123">regex route</a>
  </p>
  <p>
    Go to <a href="/svelte-router/named/123">named-params route</a>
  </p>
</Page>
