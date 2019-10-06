<script>
  import { getContext } from 'svelte';
  console.log(getContext('ROUTER'));
</script>

<h1>Page Wrapper</h1>
<slot></slot>
