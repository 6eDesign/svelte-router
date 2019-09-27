<script context="module">
	export const ROUTER = { }; 
</script>

<script>
	import { setContext, onMount, afterUpdate } from 'svelte';
	import { writable } from 'svelte/store';
	console.log('hi');
	import page from 'page';
	
	let selectedRoute = writable(null);

	export let middleware = [];
	export let hashbang = false;
	export let metadata = { }; 
	export let error = null;
	export let loading = null;

	const applyMetadata = ({ metadata: route }) => (ctx,next) => { 
		ctx.metadata = { 
			route, 
			router: metadata
		};
		next(); 
	};

	const routeMiddleware = route => (ctx) => { 
		selectedRoute.set({ctx, route});
		// todo: will need to call next if there are child routes
	};
	
	setContext(ROUTER, { 
		registerRoute(route) { 
			console.log('hi1123123', route);
			page(
				route.path, 
				applyMetadata(route),
				...middleware, 
				...route.middleware,
				routeMiddleware(route)
			); 
		}, 
		error,
		loading,
		selectedRoute
	});

	onMount(() => {
		page();
	});

</script>

<slot></slot>
