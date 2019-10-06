# svelte-router
A little router component that uses code splitting for components. Uses page.js (~2kb min/gzip) for routing. 

## A Work in Progress: 
I'm not entirely sure this is useful yet and it has not been published to NPM at this time. 

## How to use: 
With Svelte v3: 

```html
<script>
 import { Router, Route } from '6edesign/svelte-router';
</script>

<div>
  <Router>
    <!-- Route paths can be strings (exact matches or express-style named-params) or regex -->
    <!-- componentImport is a function which dynamically imports the necessary component -->
    <Route 
      path='/' 
      componentImport={() => import('./HomeRoute.svelte')} 
    />
    <Route 
      path={/\/regex-route\.(\d+)/} 
      componentImport={() => import('./RegexRoute.svelte')} 
    />
    <Route 
      path='/named/:id'
      componentImport={() => import('./NamedParamsRoute.svelte')} 
    />
 </Router>
</div>
```

(Minimal) Rollup Config Example: 
```js
import svelte from "rollup-plugin-svelte";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import { terser } from "rollup-plugin-terser";

const test = {
  input: "src/app.js",
  output: {
    sourcemap: true,
    format: "es",
    dir: 'public/module'
  },
  experimentalCodeSplitting: true, 
  plugins: [
    svelte({
      nestedTransitions: true,
      dev: false,
      css: css => {
        css.write("public/app.css");
      }
    }),
    resolve(),
    commonjs()
  ]
};

export default [test];

```

## Contributing to this project

Clone & install the dependencies...

```bash
cd svelte-router
npm install
```

...then start [Rollup](https://rollupjs.org):

```bash
npm run dev
```
