import{c as SvelteComponentDev,j as addLoc,l as append,o as createElement,p as createText,q as detachNode,f as init,t as insert,b as noop,g as safe_not_equal}from"./chunk-8c712974.js";var file="src\\Components\\Home.html";function create_fragment(e){var t,o,n,a,r;return{c:function(){(t=createElement("h1")).textContent="Homepage",o=createText("\r\n"),n=createElement("p"),a=createText("Go "),(r=createElement("a")).textContent="test.",addLoc(t,file,0,0,0),r.href="/test",addLoc(r,file,1,6,25),addLoc(n,file,1,0,19)},l:function(e){throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option")},m:function(e,c){insert(e,t,c),insert(e,o,c),insert(e,n,c),append(n,a),append(n,r)},p:noop,i:noop,o:noop,d:function(e){e&&(detachNode(t),detachNode(o),detachNode(n))}}}var Home=function(e){function t(t){e.call(this,t),init(this,t,null,create_fragment,safe_not_equal)}return e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t,t}(SvelteComponentDev);export default Home;
//# sourceMappingURL=Home.js.map
