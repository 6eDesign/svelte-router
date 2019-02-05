function noop(){}function assign(t,e){for(var n in e)t[n]=e[n];return t}function isPromise(t){return t&&"function"==typeof t.then}function run(t){return t()}function blankObject(){return Object.create(null)}function run_all(t){t.forEach(run)}function is_function(t){return"function"==typeof t}function safe_not_equal(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function create_slot(t,e,n){if(t){var o=get_slot_context(t,e,n);return t[0](o)}}function get_slot_context(t,e,n){return t[1]?assign({},assign(e.$$scope.ctx,t[1](n?n(e):{}))):e.$$scope.ctx}function append(t,e){t.appendChild(e)}function insert(t,e,n){t.insertBefore(e,n)}function detachNode(t){t.parentNode.removeChild(t)}function createElement(t){return document.createElement(t)}function createText(t){return document.createTextNode(t)}function createComment(){return document.createComment("")}function setAttribute(t,e,n){null==n?t.removeAttribute(e):t.setAttribute(e,n)}function children(t){return Array.from(t.childNodes)}function setData(t,e){t.data=""+e}var outros,current_component;function group_outros(){outros={remaining:0,callbacks:[]}}function check_outros(){outros.remaining||run_all(outros.callbacks)}function on_outro(t){outros.callbacks.push(t)}function set_current_component(t){current_component=t}function get_current_component(){if(!current_component)throw new Error("Function called outside component initialization");return current_component}function onMount(t){get_current_component().$$.on_mount.push(t)}function setContext(t,e){get_current_component().$$.context.set(t,e)}function getContext(t){return get_current_component().$$.context.get(t)}var SvelteElement,dirty_components=[],update_scheduled=!1,binding_callbacks=[],render_callbacks=[];function schedule_update(){update_scheduled||(update_scheduled=!0,queue_microtask(flush))}function add_render_callback(t){render_callbacks.push(t)}function add_binding_callback(t){binding_callbacks.push(t)}function flush(){var t=new Set;do{for(;dirty_components.length;){var e=dirty_components.shift();set_current_component(e),update(e.$$)}for(;binding_callbacks.length;)binding_callbacks.shift()();for(;render_callbacks.length;){var n=render_callbacks.pop();t.has(n)||(n(),t.add(n))}}while(dirty_components.length);update_scheduled=!1}function update(t){t.fragment&&(t.update(t.dirty),run_all(t.before_render),t.fragment.p(t.dirty,t.ctx),t.dirty=null,t.after_render.forEach(add_render_callback))}function queue_microtask(t){Promise.resolve().then(function(){update_scheduled&&t()})}function handlePromise(t,e){var n,o=e.token={};function a(t,n,a,r){var i;if(e.token===o){e.resolved=a&&((i={})[a]=r,i);var c=assign(assign({},e.ctx),e.resolved),s=t&&(e.current=t)(c);e.block&&(e.blocks?e.blocks.forEach(function(t,o){o!==n&&t&&(group_outros(),on_outro(function(){t.d(1),e.blocks[o]=null}),t.o(),check_outros())}):e.block.d(1),s.c(),s.m(e.mount(),e.anchor),s.i&&s.i(),flush()),e.block=s,e.blocks&&(e.blocks[n]=s)}}if(isPromise(t)){if(t.then(function(t){a(e.then,1,e.value,t)},function(t){a(e.catch,2,e.error,t)}),e.current!==e.pending)return a(e.pending,0),!0}else{if(e.current!==e.then)return a(e.then,1,e.value,t),!0;e.resolved=((n={})[e.value]=t,n)}}function mount_component(t,e,n){var o=t.$$,a=o.fragment,r=o.on_mount,i=o.on_destroy,c=o.after_render;a.m(e,n),add_render_callback(function(){var e=r.map(run).filter(is_function);i?i.push.apply(i,e):run_all(e),t.$$.on_mount=[]}),c.forEach(add_render_callback)}function destroy(t,e){t.$$&&(run_all(t.$$.on_destroy),t.$$.fragment.d(e),t.$$.on_destroy=t.$$.fragment=null,t.$$.ctx={})}function make_dirty(t,e){t.$$.dirty||(dirty_components.push(t),schedule_update(),t.$$.dirty={}),t.$$.dirty[e]=!0}function init(t,e,n,o,a){var r=current_component;set_current_component(t);var i=e.props||{},c=t.$$={fragment:null,ctx:null,update:noop,not_equal:a,bound:blankObject(),on_mount:[],on_destroy:[],before_render:[],after_render:[],context:new Map(r?r.$$.context:[]),callbacks:blankObject(),dirty:null},s=!1;c.ctx=n?n(t,i,function(e,n){if(c.bound[e]&&c.bound[e](n),c.ctx){var o=a(n,c.ctx[e]);return s&&o&&make_dirty(t,e),c.ctx[e]=n,o}}):i,c.update(),s=!0,run_all(c.before_render),c.fragment=o(c.ctx),e.target&&(e.hydrate?c.fragment.l(children(e.target)):c.fragment.c(),mount_component(t,e.target,e.anchor),e.intro&&t.$$.fragment.i&&t.$$.fragment.i(),flush()),set_current_component(r)}"undefined"!=typeof HTMLElement&&(SvelteElement=function(t){function e(){t.call(this),this.attachShadow({mode:"open"})}return t&&(e.__proto__=t),e.prototype=Object.create(t&&t.prototype),e.prototype.constructor=e,e.prototype.connectedCallback=function(){for(var t in this.$$.slotted)this.appendChild(this.$$.slotted[t])},e.prototype.attributeChangedCallback=function(t,e,n){this[t]=n},e.prototype.$destroy=function(){destroy(this,!0),this.$destroy=noop},e.prototype.$on=function(t,e){var n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),function(){var t=n.indexOf(e);-1!==t&&n.splice(t,1)}},e.prototype.$set=function(){},e}(HTMLElement));var SvelteComponent=function(){};SvelteComponent.prototype.$destroy=function(){destroy(this,!0),this.$destroy=noop},SvelteComponent.prototype.$on=function(t,e){var n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),function(){var t=n.indexOf(e);-1!==t&&n.splice(t,1)}},SvelteComponent.prototype.$set=function(){};var SvelteComponentDev=function(t){function e(e){if(!e||!e.target&&!e.$$inline)throw new Error("'target' is a required option");t.call(this)}return t&&(e.__proto__=t),e.prototype=Object.create(t&&t.prototype),e.prototype.constructor=e,e.prototype.$destroy=function(){t.prototype.$destroy.call(this),this.$destroy=function(){console.warn("Component was already destroyed")}},e}(SvelteComponent);function writable(t){var e=[];function n(n){n!==t&&(t=n,e.forEach(function(t){return t[1]()}),e.forEach(function(e){return e[0](t)}))}return{set:n,update:function(e){n(e(t))},subscribe:function(n,o){void 0===o&&(o=noop);var a=[n,o];return e.push(a),n(t),function(){var t=e.indexOf(a);-1!==t&&e.splice(t,1)}}}}var pathToRegexp=pathtoRegexp,MATCHING_GROUP_REGEXP=/\((?!\?)/g;function pathtoRegexp(t,e,n){e=e||[];var o,a=(n=n||{}).strict,r=!1!==n.end,i=n.sensitive?"":"i",c=0,s=e.length,u=0,p=0;if(t instanceof RegExp){for(;o=MATCHING_GROUP_REGEXP.exec(t.source);)e.push({name:p++,optional:!1,offset:o.index});return t}if(Array.isArray(t))return t=t.map(function(t){return pathtoRegexp(t,e,n).source}),new RegExp("(?:"+t.join("|")+")",i);for(t=("^"+t+(a?"":"/"===t[t.length-1]?"?":"/?")).replace(/\/\(/g,"/(?:").replace(/([\/\.])/g,"\\$1").replace(/(\\\/)?(\\\.)?:(\w+)(\(.*?\))?(\*)?(\?)?/g,function(t,n,o,a,r,i,s,u){n=n||"",o=o||"",r=r||"([^\\/"+o+"]+?)",s=s||"",e.push({name:a,optional:!!s,offset:u+c});var p=(s?"":n)+"(?:"+o+(s?n:"")+r+(i?"((?:[\\/"+o+"].+?)?)":"")+")"+s;return c+=p.length-t.length,p}).replace(/\*/g,function(t,n){for(var o=e.length;o-- >s&&e[o].offset>n;)e[o].offset+=3;return"(.*)"});o=MATCHING_GROUP_REGEXP.exec(t);){for(var l=0,h=o.index;"\\"===t.charAt(--h);)l++;l%2!=1&&((s+u===e.length||e[s+u].offset>o.index)&&e.splice(s+u,0,{name:p++,optional:!1,offset:o.index}),u++)}return t+=r?"$":"/"===t[t.length-1]?"":"(?=\\/|$)",new RegExp(t,i)}var running$1,prevContext,page_js=page,clickEvent="undefined"!=typeof document&&document.ontouchstart?"touchstart":"click",location="undefined"!=typeof window&&(window.history.location||window.location),dispatch=!0,decodeURLComponents=!0,base="",hashbang=!1;function page(t,e){var n=arguments;if("function"==typeof t)return page("*",t);if("function"==typeof e)for(var o=new Route(t),a=1;a<arguments.length;++a)page.callbacks.push(o.middleware(n[a]));else"string"==typeof t?page["string"==typeof e?"redirect":"show"](t,e):page.start(t)}function unhandled(t){t.handled||(hashbang?base+location.hash.replace("#!",""):location.pathname+location.search)!==t.canonicalPath&&(page.stop(),t.handled=!1,location.href=t.canonicalPath)}function decodeURLEncodedURIComponent(t){return"string"!=typeof t?t:decodeURLComponents?decodeURIComponent(t.replace(/\+/g," ")):t}function Context(t,e){"/"===t[0]&&0!==t.indexOf(base)&&(t=base+(hashbang?"#!":"")+t);var n=t.indexOf("?");if(this.canonicalPath=t,this.path=t.replace(base,"")||"/",hashbang&&(this.path=this.path.replace("#!","")||"/"),this.title=document.title,this.state=e||{},this.state.path=t,this.querystring=~n?decodeURLEncodedURIComponent(t.slice(n+1)):"",this.pathname=decodeURLEncodedURIComponent(~n?t.slice(0,n):t),this.params={},this.hash="",!hashbang){if(!~this.path.indexOf("#"))return;var o=this.path.split("#");this.path=o[0],this.hash=decodeURLEncodedURIComponent(o[1])||"",this.querystring=this.querystring.split("#")[0]}}function Route(t,e){e=e||{},this.path=t,this.method="GET",this.regexp=pathToRegexp(this.path,this.keys=[],e.sensitive,e.strict)}page.callbacks=[],page.exits=[],page.current="",page.len=0,page.base=function(t){if(0===arguments.length)return base;base=t},page.start=function(t){if(t=t||{},!running$1&&(running$1=!0,!1===t.dispatch&&(dispatch=!1),!1===t.decodeURLComponents&&(decodeURLComponents=!1),!1!==t.popstate&&window.addEventListener("popstate",onpopstate,!1),!1!==t.click&&document.addEventListener(clickEvent,onclick,!1),!0===t.hashbang&&(hashbang=!0),dispatch)){var e=hashbang&&~location.hash.indexOf("#!")?location.hash.substr(2)+location.search:location.pathname+location.search+location.hash;page.replace(e,null,!0,dispatch)}},page.stop=function(){running$1&&(page.current="",page.len=0,running$1=!1,document.removeEventListener(clickEvent,onclick,!1),window.removeEventListener("popstate",onpopstate,!1))},page.show=function(t,e,n,o){var a=new Context(t,e);return page.current=a.path,!1!==n&&page.dispatch(a),!1!==a.handled&&!1!==o&&a.pushState(),a},page.back=function(t,e){page.len>0?(history.back(),page.len--):t?setTimeout(function(){page.show(t,e)}):setTimeout(function(){page.show(base,e)})},page.redirect=function(t,e){"string"==typeof t&&"string"==typeof e&&page(t,function(t){setTimeout(function(){page.replace(e)},0)}),"string"==typeof t&&void 0===e&&setTimeout(function(){page.replace(t)},0)},page.replace=function(t,e,n,o){var a=new Context(t,e);return page.current=a.path,a.init=n,a.save(),!1!==o&&page.dispatch(a),a},page.dispatch=function(t){var e=prevContext,n=0,o=0;function a(){var e=page.callbacks[n++];if(t.path===page.current)return e?void e(t,a):unhandled(t);t.handled=!1}prevContext=t,e?function t(){var n=page.exits[o++];if(!n)return a();n(e,t)}():a()},page.exit=function(t,e){var n=arguments;if("function"==typeof t)return page.exit("*",t);for(var o=new Route(t),a=1;a<arguments.length;++a)page.exits.push(o.middleware(n[a]))},page.Context=Context,Context.prototype.pushState=function(){page.len++,history.pushState(this.state,this.title,hashbang&&"/"!==this.path?"#!"+this.path:this.canonicalPath)},Context.prototype.save=function(){history.replaceState(this.state,this.title,hashbang&&"/"!==this.path?"#!"+this.path:this.canonicalPath)},page.Route=Route,Route.prototype.middleware=function(t){var e=this;return function(n,o){if(e.match(n.path,n.params))return t(n,o);o()}},Route.prototype.match=function(t,e){var n=this.keys,o=t.indexOf("?"),a=~o?t.slice(0,o):t,r=this.regexp.exec(decodeURIComponent(a));if(!r)return!1;for(var i=1,c=r.length;i<c;++i){var s=n[i-1];if(s){var u=decodeURLEncodedURIComponent(r[i]);void 0===u&&hasOwnProperty.call(e,s.name)||(e[s.name]=u)}}return!0};var onpopstate=function(){var t=!1;if("undefined"!=typeof window)return"complete"===document.readyState?t=!0:window.addEventListener("load",function(){setTimeout(function(){t=!0},0)}),function(e){if(t)if(e.state){var n=e.state.path;page.replace(n,e.state)}else page.show(location.pathname+location.hash,void 0,void 0,!1)}}();function onclick(t){if(1===which(t)&&!(t.metaKey||t.ctrlKey||t.shiftKey||t.defaultPrevented)){for(var e=t.target;e&&"A"!==e.nodeName;)e=e.parentNode;if(e&&"A"===e.nodeName&&!e.hasAttribute("download")&&"external"!==e.getAttribute("rel")){var n=e.getAttribute("href");if((hashbang||e.pathname!==location.pathname||!e.hash&&"#"!==n)&&!(n&&n.indexOf("mailto:")>-1)&&!e.target&&sameOrigin(e.href)){var o=e.pathname+e.search+(e.hash||"");"undefined"!=typeof process&&o.match(/^\/[a-zA-Z]:\//)&&(o=o.replace(/^\/[a-zA-Z]:\//,"/"));var a=o;0===o.indexOf(base)&&(o=o.substr(base.length)),hashbang&&(o=o.replace("#!","")),base&&a===o||(t.preventDefault(),page.show(a))}}}}function which(t){return null===(t=t||window.event).which?t.button:t.which}function sameOrigin(t){var e=location.protocol+"//"+location.hostname;return location.port&&(e+=":"+location.port),t&&0===t.indexOf(e)}function create_fragment(t){var e=t.$$slot_default,n=create_slot(e,t,null);return{c:function(){n&&n.c()},l:function(t){n&&n.l(t)},m:function(t,e){n&&n.m(t,e)},p:function(t,o){n&&t.$$scope&&n.p(assign(assign({},t),o.$$scope.changed),get_slot_context(e,o,null))},i:noop,o:noop,d:function(t){n&&n.d(t)}}}page.sameOrigin=sameOrigin;var ROUTER={};function instance(t,e,n){var o=writable(null),a=e.hashbang;void 0===a&&(a=!1);setContext(ROUTER,{registerRoute:function(t){page_js(t.path,function(t){return function(e){o.set({ctx:e,route:t})}}(t))},selectedRoute:o}),onMount(function(){setTimeout(function(){page_js({hashbang:a})},0)});var r=e.$$slot_default,i=e.$$scope;return t.$set=function(t){"hashbang"in t&&n("hashbang",a=t.hashbang),"$$scope"in t&&n("$$scope",i=t.$$scope)},{hashbang:a,$$slot_default:r,$$scope:i}}var Router=function(t){function e(e){t.call(this),init(this,e,instance,create_fragment,safe_not_equal)}t&&(e.__proto__=t),e.prototype=Object.create(t&&t.prototype),e.prototype.constructor=e;var n={hashbang:{configurable:!0}};return n.hashbang.get=function(){return this.$$.ctx.hashbang},n.hashbang.set=function(t){this.$set({hashbang:t}),flush()},Object.defineProperties(e.prototype,n),e}(SvelteComponent);export{SvelteComponent as a,add_binding_callback as b,assign as c,createComment as d,createElement as e,createText as f,create_slot as g,detachNode as h,flush as i,get_slot_context as j,handlePromise as k,init as l,insert as m,noop as n,safe_not_equal as o,getContext as p,writable as q,ROUTER as r,append as s,setData as t,mount_component as u,setAttribute as v,Router as w,onMount as x};
//# sourceMappingURL=chunk-5ed5c040.js.map
