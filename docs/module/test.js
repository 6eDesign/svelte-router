import{a as run_all,b as noop,c as SvelteComponentDev,d as addListener,e as create_slot,f as init,g as safe_not_equal,h as setContext,i as onMount,j as addLoc,k as append,l as assign,m as createComment,n as createElement,o as createText,p as detachNode,q as flush,r as handlePromise,s as insert,t as setData,u as validate_store,v as getContext,w as mount_component}from"./chunk-97f4ea02.js";function assign$1(t,e){var n=arguments;if(null==t)throw new TypeError("Cannot convert first argument to object");for(var o=Object(t),r=1;r<arguments.length;r++){var c=n[r];if(null!=c)for(var a=Object.keys(Object(c)),i=0,u=a.length;i<u;i++){var s=a[i],p=Object.getOwnPropertyDescriptor(c,s);void 0!==p&&p.enumerable&&(o[s]=c[s])}}return o}function polyfill(){Object.assign||Object.defineProperty(Object,"assign",{enumerable:!1,configurable:!0,writable:!0,value:assign$1})}var es6ObjectAssign={assign:assign$1,polyfill:polyfill},es6ObjectAssign_2=es6ObjectAssign.polyfill;function readable(t,e){var n,o=[];function r(t){t!==e&&(e=t,o.forEach(function(t){return t[1]()}),o.forEach(function(t){return t[0](e)}))}return{subscribe:function(c,a){void 0===a&&(a=noop),0===o.length&&(n=t(r));var i=[c,a];return o.push(i),c(e),function(){var t=o.indexOf(i);-1!==t&&o.splice(t,1),0===o.length&&(n&&n(),n=null)}}}}function writable(t){var e=[];function n(n){n!==t&&(t=n,e.forEach(function(t){return t[1]()}),e.forEach(function(e){return e[0](t)}))}return{set:n,update:function(e){n(e(t))},subscribe:function(n,o){void 0===o&&(o=noop);var r=[n,o];return e.push(r),n(t),function(){var t=e.indexOf(r);-1!==t&&e.splice(t,1)}}}}function derive(t,e){var n=!Array.isArray(t);n&&(t=[t]);var o=1===e.length,r={};return readable(function(c){var a=!1,i=[],u=0,s=function(){if(!u){var t=e(n?i[0]:i,c);o&&r!==(r=t)&&c(t)}},p=t.map(function(t,e){return t.subscribe(function(t){i[e]=t,u&=~(1<<e),a&&s()},function(){u|=1<<e})});return a=!0,s(),function(){run_all(p)}})}var isNamedParam=function(t){return t.length>2&&0==t.indexOf(":")},testString=function(t,e){var n={};if(-1==t.indexOf(":"))return t===e&&n;var o=e.substring(1).split("/"),r=t.substring(1).split("/");if(o.length!==r.length)return!1;for(var c=0;c<o.length;++c)if(isNamedParam(r[c]))n[r[c].substring(1)]=o[c];else if(o[c]!==r[c])return!1;return!0},matchRoute=function(t,e){switch(typeof t.path){case"string":return testString(t.path,e);case"function":return t.path(e);case"object":return t.path instanceof RegExp&&t.path.test(e);default:return!1}};function determineRoute(t,e){for(var n=0;n<t.length;++n){var o=matchRoute(t[n],e);if(o)return{route:t[n],params:o}}return null}function create_fragment(t){var e,n=create_slot(t.$$slot_default,t);return{c:function(){n&&n.c(),e=[addListener(window,"hashchange",t.locationChange),addListener(window,"popstate",t.locationChange)]},l:function(t){throw n&&n.l(t),new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option")},m:function(t,e){n&&n.m(t,e)},p:function(t,e){n&&t.$$scope&&n.p(e.$$scope.changed,e.$$scope.ctx)},i:noop,o:noop,d:function(t){n&&n.d(t),run_all(e)}}}var ROUTER={};function instance(t,e,n){var o=writable([]),r=writable(null),c=derive([o,r],function(t){var e=t[0],n=t[1];return n&&e?determineRoute(e,n):null}),a=function(){r.set(location.pathname)};setContext(ROUTER,{registerRoute:function(t){o.update(function(e){return e.push(t),e})},selectedRoute:c}),onMount(a);var i=e.$$slot_default,u=e.$$scope;return t.$set=function(t){"$$scope"in t&&n("$$scope",u=t.$$scope)},{locationChange:a,$$slot_default:i,$$scope:u}}var Router=function(t){function e(e){t.call(this,e),init(this,e,instance,create_fragment,safe_not_equal)}return t&&(e.__proto__=t),e.prototype=Object.create(t&&t.prototype),e.prototype.constructor=e,e}(SvelteComponentDev),file$1="src\\Components\\Route.html";function create_if_block(t){var e,n,o={ctx:t,current:null,pending:create_pending_block,then:create_then_block,catch:create_catch_block,value:"something",error:"null"};return handlePromise(n=t.ComponentPromise,o),{c:function(){e=createComment(),o.block.c()},m:function(t,n){insert(t,e,n),o.block.m(t,o.anchor=n),o.mount=function(){return e.parentNode},o.anchor=e},p:function(e,r){t=r,o.ctx=t,"ComponentPromise"in e&&n!==(n=t.ComponentPromise)&&handlePromise(n,o)||o.block.p(e,assign(assign({},t),o.resolved))},d:function(t){t&&detachNode(e),o.block.d(t),o=null}}}function create_catch_block(t){return{c:noop,m:noop,p:noop,d:noop}}function create_then_block(t){var e,n;return{c:function(){e=createText("Loaded! "),n=createText(t.Component)},m:function(t,o){insert(t,e,o),insert(t,n,o)},p:noop,d:function(t){t&&(detachNode(e),detachNode(n))}}}function create_pending_block(t){var e,n,o,r=JSON.stringify(t.$selectedRoute,null,2),c=create_slot(t.$$slot_default,t);return{c:function(){c||(e=createElement("p"),n=createText("Loading... "),o=createText(r)),c&&c.c(),c||addLoc(e,file$1,30,3,684)},l:function(t){c&&c.l(t)},m:function(t,r){c?c.m(t,r):(insert(t,e,r),append(e,n),append(e,o))},p:function(t,e){c||t.$selectedRoute&&r!==(r=JSON.stringify(e.$selectedRoute,null,2))&&setData(o,r),c&&t.$$scope&&c.p(e.$$scope.changed,e.$$scope.ctx)},d:function(t){c||t&&detachNode(e),c&&c.d(t)}}}function create_fragment$1(t){var e,n=t.$selectedRoute&&t.$selectedRoute.route==t.route&&create_if_block(t);return{c:function(){n&&n.c(),e=createComment()},l:function(t){throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option")},m:function(t,o){n&&n.m(t,o),insert(t,e,o)},p:function(t,o){o.$selectedRoute&&o.$selectedRoute.route==o.route?n?n.p(t,o):((n=create_if_block(o)).c(),n.m(e.parentNode,e)):n&&(n.d(1),n=null)},i:noop,o:noop,d:function(t){n&&n.d(t),t&&detachNode(e)}}}function instance$1(t,e,n){var o,r=e.path,c=e.componentImport,a={path:r,componentImport:c},i=getContext(ROUTER),u=i.registerRoute,s=(i.unregisterRoute,i.selectedRoute);u(a),s.subscribe(function(t){t&&t.route==a&&(console.log('Dynamically importing route "'+a.path+'"'),o=c().then(function(t){var e=t.default;return console.log(e),e}),n("ComponentPromise",o))});var p,l=e.$$slot_default,f=e.$$scope;return validate_store(s,"selectedRoute"),t.$$.on_destroy.push(s.subscribe(function(t){n("$selectedRoute",p=t)})),t.$set=function(t){"path"in t&&n("path",r=t.path),"componentImport"in t&&n("componentImport",c=t.componentImport),"$$scope"in t&&n("$$scope",f=t.$$scope)},{path:r,componentImport:c,ComponentPromise:o,route:a,$selectedRoute:p,$$slot_default:l,$$scope:f}}var Route=function(t){function e(e){t.call(this,e),init(this,e,instance$1,create_fragment$1,safe_not_equal);var n=this.$$.ctx,o=e.props||{};void 0!==n.path||"path"in o||console.warn("<Route> was created without expected prop 'path'"),void 0!==n.componentImport||"componentImport"in o||console.warn("<Route> was created without expected prop 'componentImport'")}t&&(e.__proto__=t),e.prototype=Object.create(t&&t.prototype),e.prototype.constructor=e;var n={path:{configurable:!0},componentImport:{configurable:!0}};return n.path.get=function(){return this.$$.ctx.path},n.path.set=function(t){this.$set({path:t}),flush()},n.componentImport.get=function(){return this.$$.ctx.componentImport},n.componentImport.set=function(t){this.$set({componentImport:t}),flush()},Object.defineProperties(e.prototype,n),e}(SvelteComponentDev);function create_default_slot(t){var e,n=new Route({props:{path:"/",componentImport:func},$$inline:!0});return{c:function(){n.$$.fragment.c()},m:function(t,e){mount_component(n,t,e)},p:noop,i:function(){e||(n.$$.fragment.i(),e=!0)},o:function(){n&&n.$$.fragment.o(),e=!1},d:function(t){n.$destroy(t)}}}function create_fragment$2(t){var e,n=new Router({props:{$$slot_default:[create_default_slot],$$scope:{ctx:t}},$$inline:!0});return{c:function(){n.$$.fragment.c()},l:function(t){throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option")},m:function(t,e){mount_component(n,t,e)},p:noop,i:function(){e||(n.$$.fragment.i(),e=!0)},o:function(){n&&n.$$.fragment.o(),e=!1},d:function(t){n.$destroy(t)}}}function func(){return import("./Home.js")}var App=function(t){function e(e){t.call(this,e),init(this,e,null,create_fragment$2,safe_not_equal)}return t&&(e.__proto__=t),e.prototype=Object.create(t&&t.prototype),e.prototype.constructor=e,e}(SvelteComponentDev);es6ObjectAssign_2();var app=new App({target:document.body,data:{}});export default app;
//# sourceMappingURL=test.js.map
