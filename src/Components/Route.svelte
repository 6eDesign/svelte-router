<script>
	import { getContext, onDestroy } from 'svelte';
	import { ROUTER } from './Router.svelte';
	import DefaultLoadingComponent from './Loading.svelte';
	import DefaultErrorComponent from './Error.svelte';

	const {
		registerRoute, 
		selectedRoute, 
		error: routerErrorComponent=null, 
		loading: routerLoadingComponent=null
	} = getContext(ROUTER);

	// props
	export let path; 
	export let asyncComponent = null;
	export let component = null;
	export let middleware = [];
	export let metadata = { }
	export let error = null;
	export let loading = null;

	// template variables
	let componentPromise; 
	let target;
	let routeError = null;

	// reactive variables: 
	let loadingComponent, errorComponent; 
	$: loadingComponent = loading || routerLoadingComponent || DefaultLoadingComponent;
	$: errorComponent = error || routerErrorComponent || DefaultErrorComponent;

	const route = { 
		path, 
		asyncComponent, 
		middleware, 
		metadata 
	};
	console.log(JSON.stringify(route, null, 2));
	registerRoute(route);

	selectedRoute.subscribe(selected => {
		if(!selected) return;
		if(asyncComponent && selected && selected.route == route) {
			componentPromise = asyncComponent();
			componentPromise.then(
				({default: Component}) => {
					return new Component({
						target
					});
			}); 
		}
	});

</script>

{#if $selectedRoute && $selectedRoute.route == route}
	{#if asyncComponent}
		{#await componentPromise}
			<svelte:component this={loadingComponent} />
		{:then}
		{:catch error}
			<svelte:component this={errorComponent} error={error} />
		{/await}
		<div bind:this={target}></div>
	{:else if component}
		<svelte:component this={component} />
	{:else}
		<slot></slot>
	{/if}
{/if}
