import{a as SvelteComponent,x as append,b as createElement,h as createText,c as detachNode,d as init,e as insert,s as mount_component,f as noop,g as safe_not_equal,j as setData,u as getContext,y as Page,w as ROUTER}from"./chunk-d17ba98d.js";function create_default_slot(e){var t,n,o,a,r,c,s,u,i=JSON.stringify(e.$selectedRoute.ctx,null,2);return{c:function(){(t=createElement("h1")).textContent="Named Params Route",n=createText("\r\n\r\n  "),(o=createElement("p")).innerHTML="<strong>route:</strong>",a=createText("\r\n  "),r=createElement("pre"),c=createText(i),s=createText("\r\n  "),(u=createElement("p")).innerHTML='Go <a href="/svelte-router/">home.</a>'},m:function(e,i){insert(e,t,i),insert(e,n,i),insert(e,o,i),insert(e,a,i),insert(e,r,i),append(r,c),insert(e,s,i),insert(e,u,i)},p:function(e,t){e.$selectedRoute&&i!==(i=JSON.stringify(t.$selectedRoute.ctx,null,2))&&setData(c,i)},d:function(e){e&&(detachNode(t),detachNode(n),detachNode(o),detachNode(a),detachNode(r),detachNode(s),detachNode(u))}}}function create_fragment(e){var t,n=new Page({props:{$$slot_default:[create_default_slot],$$scope:{ctx:e}}});return{c:function(){n.$$.fragment.c()},m:function(e,t){mount_component(n,e,t)},p:noop,i:function(){t||(n.$$.fragment.i(),t=!0)},o:function(){n&&n.$$.fragment.o(),t=!1},d:function(e){n.$destroy(e)}}}function instance(e,t,n){var o,a=getContext(ROUTER).selectedRoute;return e.$$.on_destroy.push(a.subscribe(function(e){n("$selectedRoute",o=e)})),{$selectedRoute:o}}var NamedParamsRoute=function(e){function t(t){e.call(this),init(this,t,instance,create_fragment,safe_not_equal)}return e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t,t}(SvelteComponent);export default NamedParamsRoute;
//# sourceMappingURL=NamedParamsRoute.js.map
