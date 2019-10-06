<script>
	import Router from './Components/Router.svelte';
	import Route from './Components/Route.svelte';
	import HomeRoute from './Components/test/HomeRoute.svelte';
	import Error from './Components/test/Error.svelte';
	import Loading from './Components/test/Loading.svelte';

	const exampleRouterMiddleware = (ctx,next) => {
		console.log(`This runs for every route in instance of Router\n`, ctx); 
		next(); 
	};

	const exampleRouteMiddleware = (ctx,next) => {
		console.log(`This runs only for specific routes where it is applied\n`, ctx); 
		next(); 
	};

	const exampleRouterMetadata = { routerId: 123 };
	const exampleRouteMetadata = { pageName: 'Home (Alt)' }; 

	let base = '/svelte-router';
</script>

<div>
	<Router 
		hashbang={true}
		error={Error}
		loading={Loading}
		middleware={[exampleRouterMiddleware]}
		metadata={exampleRouterMetadata}
	>
		<!-- 
			Route paths can be strings (exact matches or express-style 
			named-params) or regex 
		
			Components can  be embedded via the {component} prop 
		-->
		<Route 
			path='/svelte-router' 
			component={HomeRoute}
		/>
		<!-- 
			Components/DOM can also be embedded via the default route slot
		-->
		<Route
			path='/svelte-router/home-alt'
			middleware={[exampleRouteMiddleware]}
			metadata={exampleRouteMetadata}
		>
			<HomeRoute />
		</Route>
		<!-- 
			asyncComponent is an optional prop which provides a function which 
			dynamically imports the necessary component for a route - for use 
			with codesplitting.  
		-->
		<Route 
			path={/\/svelte-router\/regex-route\.(\d+)/} 
			asyncComponent={() => import('./Components/test/RegexRoute.svelte')} 
		/>
		<!-- 
			you can override router-wide error and loading 
			components by specifying 'loading' and 'error' props
		-->
		<Route 
			path='/svelte-router/named/:id' 
			asyncComponent={() => import('./Components/test/NamedParamsRoute.svelte')} 
		>
		</Route>
	</Router>
</div>
