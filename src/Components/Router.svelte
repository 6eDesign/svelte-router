<!-- <script context="module">
	export const ROUTER = { }; 
</script> -->

<script>
	import { setContext, onMount, afterUpdate } from 'svelte';
	import { writable } from 'svelte/store';
	import page from 'page';
	
	let selectedRoute = writable(null);

	export let middleware = [];
	export let hashbang = false;
	export let metadata = { }; 
	export let error = null;
	export let loading = null;
	export let base = '/';

	const customizeCtx = ({ metadata: route }) => (ctx,next) => { 
		ctx.metadata = { 
			route, 
			router: metadata
		};
		ctx.navigate = page;
		next(); 
	};

	const routeMiddleware = route => (ctx) => { 
		selectedRoute.set({ctx, route});
		// todo: will need to call next if there are child routes
	};
	
	setContext('ROUTER', { 
		registerRoute(route) { 
			page(
				route.path, 	
				customizeCtx(route),
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
		if (base !== '/') {
			page.base(base)
		}
		page({});
	});

</script>

<slot></slot>
