import{a as SvelteComponent,x as append,b as createElement,h as createText,c as detachNode,d as init,e as insert,f as noop,g as safe_not_equal,j as setData,u as getContext,z as onMount,w as ROUTER}from"./chunk-9e05cdba.js";function create_fragment(e){var t,n,o,a,r,c,s,i,u=JSON.stringify(e.$selectedRoute.ctx,null,2);return{c:function(){(t=createElement("h1")).textContent="Regex Route",n=createText("\r\n\r\n"),(o=createElement("p")).innerHTML="<strong>route:</strong>",a=createText("\r\n"),r=createElement("pre"),c=createText(u),s=createText("\r\n"),(i=createElement("p")).innerHTML='Go <a href="/">home.</a>'},m:function(e,u){insert(e,t,u),insert(e,n,u),insert(e,o,u),insert(e,a,u),insert(e,r,u),append(r,c),insert(e,s,u),insert(e,i,u)},p:function(e,t){e.$selectedRoute&&u!==(u=JSON.stringify(t.$selectedRoute.ctx,null,2))&&setData(c,u)},i:noop,o:noop,d:function(e){e&&(detachNode(t),detachNode(n),detachNode(o),detachNode(a),detachNode(r),detachNode(s),detachNode(i))}}}function instance(e,t,n){var o,a=getContext(ROUTER).selectedRoute;return e.$$.on_destroy.push(a.subscribe(function(e){n("$selectedRoute",o=e)})),{$selectedRoute:o}}var RegexRoute=function(e){function t(t){e.call(this),init(this,t,instance,create_fragment,safe_not_equal)}return e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t,t}(SvelteComponent);export default RegexRoute;
//# sourceMappingURL=RegexRoute.js.map
