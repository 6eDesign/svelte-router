import{S as t,i as e,s as n,P as o,r as s,k as c,h as r,u,l as a,m as f,e as i,b as $,t as l,a as p,y as d,c as R,d as g,R as m}from"./Page-f16fa00f.js";function h(t){var e,n,o,s,c,r,u,a,f=JSON.stringify(t.$selectedRoute.ctx,null,2);return{c:function(){(e=i("h1")).textContent="Regex Route",n=$(),(o=i("p")).innerHTML="<strong>route:</strong>",s=$(),c=i("pre"),r=l(f),u=$(),(a=i("p")).innerHTML='Go <a href="/svelte-router/">home.</a>'},m:function(t,f){p(t,e,f),p(t,n,f),p(t,o,f),p(t,s,f),p(t,c,f),d(c,r),p(t,u,f),p(t,a,f)},p:function(t,e){t.$selectedRoute&&f!==(f=JSON.stringify(e.$selectedRoute.ctx,null,2))&&R(r,f)},d:function(t){t&&(g(e),g(n),g(o),g(s),g(c),g(u),g(a))}}}function x(t){var e,n=new o({props:{$$slots:{default:[h]},$$scope:{ctx:t}}});return{c:function(){n.$$.fragment.c()},m:function(t,o){s(n,t,o),e=!0},p:function(t,e){var o={};(t.$$scope||t.$selectedRoute)&&(o.$$scope={changed:t,ctx:e}),n.$set(o)},i:function(t){e||(c(n.$$.fragment,t),e=!0)},o:function(t){r(n.$$.fragment,t),e=!1},d:function(t){u(n,t)}}}function v(t,e,n){var o,s=a(m).selectedRoute;return f(t,s,function(t){n("$selectedRoute",o=t)}),{selectedRoute:s,$selectedRoute:o}}var y=function(t){function o(o){t.call(this),e(this,o,v,x,n,[])}return t&&(o.__proto__=t),o.prototype=Object.create(t&&t.prototype),o.prototype.constructor=o,o}(t);export default y;
//# sourceMappingURL=RegexRoute-0b90a6c8.js.map