function t(){}function e(t,e){for(var n in e)t[n]=e[n];return t}function n(t){return t()}function o(){return Object.create(null)}function r(t){t.forEach(n)}function i(t){return"function"==typeof t}function a(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function s(t,e,n){t.$$.on_destroy.push(function(t,e){var n=t.subscribe(e);return n.unsubscribe?function(){return n.unsubscribe()}:n}(e,n))}function c(t,e,n){if(t){var o=h(t,e,n);return t[0](o)}}function h(t,n,o){return t[1]?e({},e(n.$$scope.ctx,t[1](o?o(n):{}))):n.$$scope.ctx}function u(t,n,o,r){return t[1]?e({},e(n.$$scope.changed||{},t[1](r?r(o):{}))):n.$$scope.changed||{}}function p(t,e){t.appendChild(e)}function f(t,e,n){t.insertBefore(e,n||null)}function l(t){t.parentNode.removeChild(t)}function d(t){return document.createElement(t)}function v(t){return document.createTextNode(t)}function g(){return v(" ")}function m(){return v("")}function y(t,e,n){null==n?t.removeAttribute(e):t.setAttribute(e,n)}function b(t,e){e=""+e,t.data!==e&&(t.data=e)}var $;function w(t){$=t}function _(){if(!$)throw new Error("Function called outside component initialization");return $}function x(t){return _().$$.context.get(t)}var k=[],E=[],R=[],U=[],C=Promise.resolve(),L=!1;function O(t){R.push(t)}function A(){var t=new Set;do{for(;k.length;){var e=k.shift();w(e),P(e.$$)}for(;E.length;)E.pop()();for(var n=0;n<R.length;n+=1){var o=R[n];t.has(o)||(o(),t.add(o))}R.length=0}while(k.length);for(;U.length;)U.pop()();L=!1}function P(t){t.fragment&&(t.update(t.dirty),r(t.before_update),t.fragment.p(t.dirty,t.ctx),t.dirty=null,t.after_update.forEach(O))}var j,T=new Set;function S(){j={r:0,c:[],p:j}}function I(){j.r||r(j.c),j=j.p}function H(t,e){t&&t.i&&(T.delete(t),t.i(e))}function N(t,e,n,o){if(t&&t.o){if(T.has(t))return;T.add(t),j.c.push(function(){T.delete(t),o&&(n&&t.d(1),o())}),t.o(e)}}function B(t,n){var o,r,i=n.token={};function a(t,o,r,a){var s;if(n.token===i){n.resolved=r&&((s={})[r]=a,s);var c=e(e({},n.ctx),n.resolved),h=t&&(n.current=t)(c);n.block&&(n.blocks?n.blocks.forEach(function(t,e){e!==o&&t&&(S(),N(t,1,1,function(){n.blocks[e]=null}),I())}):n.block.d(1),h.c(),H(h,1),h.m(n.mount(),n.anchor),A()),n.block=h,n.blocks&&(n.blocks[o]=h)}}if((r=t)&&"object"==typeof r&&"function"==typeof r.then){var s=_();if(t.then(function(t){w(s),a(n.then,1,n.value,t),w(null)},function(t){w(s),a(n.catch,2,n.error,t),w(null)}),n.current!==n.pending)return a(n.pending,0),!0}else{if(n.current!==n.then)return a(n.then,1,n.value,t),!0;n.resolved=((o={})[n.value]=t,o)}}function q(t,e,o){var a=t.$$,s=a.fragment,c=a.on_mount,h=a.on_destroy,u=a.after_update;s.m(e,o),O(function(){var e=c.map(n).filter(i);h?h.push.apply(h,e):r(e),t.$$.on_mount=[]}),u.forEach(O)}function z(t,e){t.$$.fragment&&(r(t.$$.on_destroy),t.$$.fragment.d(e),t.$$.on_destroy=t.$$.fragment=null,t.$$.ctx={})}function K(t,e){t.$$.dirty||(k.push(t),L||(L=!0,C.then(A)),t.$$.dirty=o()),t.$$.dirty[e]=!0}function V(e,n,i,a,s,c){var h=$;w(e);var u,p=n.props||{},f=e.$$={fragment:null,ctx:null,props:c,update:t,not_equal:s,bound:o(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(h?h.$$.context:[]),callbacks:o(),dirty:null},l=!1;f.ctx=i?i(e,p,function(t,n,o){return void 0===o&&(o=n),f.ctx&&s(f.ctx[t],f.ctx[t]=o)&&(f.bound[t]&&f.bound[t](o),l&&K(e,t)),n}):p,f.update(),l=!0,r(f.before_update),f.fragment=a(f.ctx),n.target&&(n.hydrate?f.fragment.l((u=n.target,Array.from(u.childNodes))):f.fragment.c(),n.intro&&H(e.$$.fragment),q(e,n.target,n.anchor),A()),w(h)}var F=function(){};F.prototype.$destroy=function(){z(this,1),this.$destroy=t},F.prototype.$on=function(t,e){var n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),function(){var t=n.indexOf(e);-1!==t&&n.splice(t,1)}},F.prototype.$set=function(){};var G=[];var Z=Array.isArray||function(t){return"[object Array]"==Object.prototype.toString.call(t)},D=at,M=Y,W=function(t){return tt(Y(t))},J=tt,Q=it,X=new RegExp(["(\\\\.)","([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))"].join("|"),"g");function Y(t){for(var e,n=[],o=0,r=0,i="";null!=(e=X.exec(t));){var a=e[0],s=e[1],c=e.index;if(i+=t.slice(r,c),r=c+a.length,s)i+=s[1];else{i&&(n.push(i),i="");var h=e[2],u=e[3],p=e[4],f=e[5],l=e[6],d=e[7],v="+"===l||"*"===l,g="?"===l||"*"===l,m=h||"/",y=p||f||(d?".*":"[^"+m+"]+?");n.push({name:u||o++,prefix:h||"",delimiter:m,optional:g,repeat:v,pattern:nt(y)})}}return r<t.length&&(i+=t.substr(r)),i&&n.push(i),n}function tt(t){for(var e=new Array(t.length),n=0;n<t.length;n++)"object"==typeof t[n]&&(e[n]=new RegExp("^"+t[n].pattern+"$"));return function(n){for(var o="",r=n||{},i=0;i<t.length;i++){var a=t[i];if("string"!=typeof a){var s,c=r[a.name];if(null==c){if(a.optional)continue;throw new TypeError('Expected "'+a.name+'" to be defined')}if(Z(c)){if(!a.repeat)throw new TypeError('Expected "'+a.name+'" to not repeat, but received "'+c+'"');if(0===c.length){if(a.optional)continue;throw new TypeError('Expected "'+a.name+'" to not be empty')}for(var h=0;h<c.length;h++){if(s=encodeURIComponent(c[h]),!e[i].test(s))throw new TypeError('Expected all "'+a.name+'" to match "'+a.pattern+'", but received "'+s+'"');o+=(0===h?a.prefix:a.delimiter)+s}}else{if(s=encodeURIComponent(c),!e[i].test(s))throw new TypeError('Expected "'+a.name+'" to match "'+a.pattern+'", but received "'+s+'"');o+=a.prefix+s}}else o+=a}return o}}function et(t){return t.replace(/([.+*?=^!:${}()[\]|\/])/g,"\\$1")}function nt(t){return t.replace(/([=!:$\/()])/g,"\\$1")}function ot(t,e){return t.keys=e,t}function rt(t){return t.sensitive?"":"i"}function it(t,e){for(var n=(e=e||{}).strict,o=!1!==e.end,r="",i=t[t.length-1],a="string"==typeof i&&/\/$/.test(i),s=0;s<t.length;s++){var c=t[s];if("string"==typeof c)r+=et(c);else{var h=et(c.prefix),u=c.pattern;c.repeat&&(u+="(?:"+h+u+")*"),r+=u=c.optional?h?"(?:"+h+"("+u+"))?":"("+u+")?":h+"("+u+")"}}return n||(r=(a?r.slice(0,-2):r)+"(?:\\/(?=$))?"),r+=o?"$":n&&a?"":"(?=\\/|$)",new RegExp("^"+r,rt(e))}function at(t,e,n){return Z(e=e||[])?n||(n={}):(n=e,e=[]),t instanceof RegExp?function(t,e){var n=t.source.match(/\((?!\?)/g);if(n)for(var o=0;o<n.length;o++)e.push({name:o,prefix:null,delimiter:null,optional:!1,repeat:!1,pattern:null});return ot(t,e)}(t,e):Z(t)?function(t,e,n){for(var o=[],r=0;r<t.length;r++)o.push(at(t[r],e,n).source);return ot(new RegExp("(?:"+o.join("|")+")",rt(n)),e)}(t,e,n):function(t,e,n){for(var o=Y(t),r=it(o,n),i=0;i<o.length;i++)"string"!=typeof o[i]&&e.push(o[i]);return ot(r,e)}(t,e,n)}D.parse=M,D.compile=W,D.tokensToFunction=J,D.tokensToRegExp=Q;var st,ct="undefined"!=typeof document,ht="undefined"!=typeof window,ut="undefined"!=typeof history,pt="undefined"!=typeof process,ft=ct&&document.ontouchstart?"touchstart":"click",lt=ht&&!(!window.history.location&&!window.location);function dt(){this.callbacks=[],this.exits=[],this.current="",this.len=0,this._decodeURLComponents=!0,this._base="",this._strict=!1,this._running=!1,this._hashbang=!1,this.clickHandler=this.clickHandler.bind(this),this._onpopstate=this._onpopstate.bind(this)}function vt(t,e){var n=arguments;if("function"==typeof t)return vt.call(this,"*",t);if("function"==typeof e)for(var o=new mt(t,null,this),r=1;r<arguments.length;++r)this.callbacks.push(o.middleware(n[r]));else"string"==typeof t?this["string"==typeof e?"redirect":"show"](t,e):this.start(t)}function gt(t,e,n){var o=this.page=n||vt,r=o._window,i=o._hashbang,a=o._getBase();"/"===t[0]&&0!==t.indexOf(a)&&(t=a+(i?"#!":"")+t);var s=t.indexOf("?");this.canonicalPath=t;var c=new RegExp("^"+a.replace(/([.+*?=^!:${}()[\]|\/\\])/g,"\\$1"));if(this.path=t.replace(c,"")||"/",i&&(this.path=this.path.replace("#!","")||"/"),this.title=ct&&r.document.title,this.state=e||{},this.state.path=t,this.querystring=~s?o._decodeURLEncodedURIComponent(t.slice(s+1)):"",this.pathname=o._decodeURLEncodedURIComponent(~s?t.slice(0,s):t),this.params={},this.hash="",!i){if(!~this.path.indexOf("#"))return;var h=this.path.split("#");this.path=this.pathname=h[0],this.hash=o._decodeURLEncodedURIComponent(h[1])||"",this.querystring=this.querystring.split("#")[0]}}function mt(t,e,n){this.page=n||yt;var o=e||{};o.strict=o.strict||n._strict,this.path="*"===t?"(.*)":t,this.method="GET",this.regexp=D(this.path,this.keys=[],o)}dt.prototype.configure=function(t){var e=t||{};this._window=e.window||ht&&window,this._decodeURLComponents=!1!==e.decodeURLComponents,this._popstate=!1!==e.popstate&&ht,this._click=!1!==e.click&&ct,this._hashbang=!!e.hashbang;var n=this._window;this._popstate?n.addEventListener("popstate",this._onpopstate,!1):ht&&n.removeEventListener("popstate",this._onpopstate,!1),this._click?n.document.addEventListener(ft,this.clickHandler,!1):ct&&n.document.removeEventListener(ft,this.clickHandler,!1),this._hashbang&&ht&&!ut?n.addEventListener("hashchange",this._onpopstate,!1):ht&&n.removeEventListener("hashchange",this._onpopstate,!1)},dt.prototype.base=function(t){if(0===arguments.length)return this._base;this._base=t},dt.prototype._getBase=function(){var t=this._base;if(t)return t;var e=ht&&this._window&&this._window.location;return ht&&this._hashbang&&e&&"file:"===e.protocol&&(t=e.pathname),t},dt.prototype.strict=function(t){if(0===arguments.length)return this._strict;this._strict=t},dt.prototype.start=function(t){var e=t||{};if(this.configure(e),!1!==e.dispatch){var n;if(this._running=!0,lt){var o=this._window.location;n=this._hashbang&&~o.hash.indexOf("#!")?o.hash.substr(2)+o.search:this._hashbang?o.search+o.hash:o.pathname+o.search+o.hash}this.replace(n,null,!0,e.dispatch)}},dt.prototype.stop=function(){if(this._running){this.current="",this.len=0,this._running=!1;var t=this._window;this._click&&t.document.removeEventListener(ft,this.clickHandler,!1),ht&&t.removeEventListener("popstate",this._onpopstate,!1),ht&&t.removeEventListener("hashchange",this._onpopstate,!1)}},dt.prototype.show=function(t,e,n,o){var r=new gt(t,e,this),i=this.prevContext;return this.prevContext=r,this.current=r.path,!1!==n&&this.dispatch(r,i),!1!==r.handled&&!1!==o&&r.pushState(),r},dt.prototype.back=function(t,e){var n=this;if(this.len>0){var o=this._window;ut&&o.history.back(),this.len--}else t?setTimeout(function(){n.show(t,e)}):setTimeout(function(){n.show(n._getBase(),e)})},dt.prototype.redirect=function(t,e){var n=this;"string"==typeof t&&"string"==typeof e&&vt.call(this,t,function(t){setTimeout(function(){n.replace(e)},0)}),"string"==typeof t&&void 0===e&&setTimeout(function(){n.replace(t)},0)},dt.prototype.replace=function(t,e,n,o){var r=new gt(t,e,this),i=this.prevContext;return this.prevContext=r,this.current=r.path,r.init=n,r.save(),!1!==o&&this.dispatch(r,i),r},dt.prototype.dispatch=function(t,e){var n=0,o=0,r=this;function i(){var e=r.callbacks[n++];if(t.path===r.current)return e?void e(t,i):function(t){if(t.handled)return;var e,n=this._window;e=this._hashbang?lt&&this._getBase()+n.location.hash.replace("#!",""):lt&&n.location.pathname+n.location.search;if(e===t.canonicalPath)return;this.stop(),t.handled=!1,lt&&(n.location.href=t.canonicalPath)}.call(r,t);t.handled=!1}e?function t(){var n=r.exits[o++];if(!n)return i();n(e,t)}():i()},dt.prototype.exit=function(t,e){var n=arguments;if("function"==typeof t)return this.exit("*",t);for(var o=new mt(t,null,this),r=1;r<arguments.length;++r)this.exits.push(o.middleware(n[r]))},dt.prototype.clickHandler=function(t){if(1===this._which(t)&&!(t.metaKey||t.ctrlKey||t.shiftKey||t.defaultPrevented)){var e=t.target,n=t.path||(t.composedPath?t.composedPath():null);if(n)for(var o=0;o<n.length;o++)if(n[o].nodeName&&"A"===n[o].nodeName.toUpperCase()&&n[o].href){e=n[o];break}for(;e&&"A"!==e.nodeName.toUpperCase();)e=e.parentNode;if(e&&"A"===e.nodeName.toUpperCase()){var r="object"==typeof e.href&&"SVGAnimatedString"===e.href.constructor.name;if(!e.hasAttribute("download")&&"external"!==e.getAttribute("rel")){var i=e.getAttribute("href");if((this._hashbang||!this._samePath(e)||!e.hash&&"#"!==i)&&!(i&&i.indexOf("mailto:")>-1)&&(r?!e.target.baseVal:!e.target)&&(r||this.sameOrigin(e.href))){var a=r?e.href.baseVal:e.pathname+e.search+(e.hash||"");a="/"!==a[0]?"/"+a:a,pt&&a.match(/^\/[a-zA-Z]:\//)&&(a=a.replace(/^\/[a-zA-Z]:\//,"/"));var s=a,c=this._getBase();0===a.indexOf(c)&&(a=a.substr(c.length)),this._hashbang&&(a=a.replace("#!","")),(!c||s!==a||lt&&"file:"===this._window.location.protocol)&&(t.preventDefault(),this.show(s))}}}}},dt.prototype._onpopstate=(st=!1,ht?(ct&&"complete"===document.readyState?st=!0:window.addEventListener("load",function(){setTimeout(function(){st=!0},0)}),function(t){if(st)if(t.state){var e=t.state.path;this.replace(e,t.state)}else if(lt){var n=this._window.location;this.show(n.pathname+n.search+n.hash,void 0,void 0,!1)}}):function(){}),dt.prototype._which=function(t){return null==(t=t||ht&&this._window.event).which?t.button:t.which},dt.prototype._toURL=function(t){var e=this._window;if("function"==typeof URL&&lt)return new URL(t,e.location.toString());if(ct){var n=e.document.createElement("a");return n.href=t,n}},dt.prototype.sameOrigin=function(t){if(!t||!lt)return!1;var e=this._toURL(t),n=this._window.location;return n.protocol===e.protocol&&n.hostname===e.hostname&&n.port===e.port},dt.prototype._samePath=function(t){if(!lt)return!1;var e=this._window.location;return t.pathname===e.pathname&&t.search===e.search},dt.prototype._decodeURLEncodedURIComponent=function(t){return"string"!=typeof t?t:this._decodeURLComponents?decodeURIComponent(t.replace(/\+/g," ")):t},gt.prototype.pushState=function(){var t=this.page,e=t._window,n=t._hashbang;t.len++,ut&&e.history.pushState(this.state,this.title,n&&"/"!==this.path?"#!"+this.path:this.canonicalPath)},gt.prototype.save=function(){var t=this.page;ut&&t._window.history.replaceState(this.state,this.title,t._hashbang&&"/"!==this.path?"#!"+this.path:this.canonicalPath)},mt.prototype.middleware=function(t){var e=this;return function(n,o){if(e.match(n.path,n.params))return t(n,o);o()}},mt.prototype.match=function(t,e){var n=this.keys,o=t.indexOf("?"),r=~o?t.slice(0,o):t,i=this.regexp.exec(decodeURIComponent(r));if(!i)return!1;for(var a=1,s=i.length;a<s;++a){var c=n[a-1],h=this.page._decodeURLEncodedURIComponent(i[a]);void 0===h&&hasOwnProperty.call(e,c.name)||(e[c.name]=h)}return!0};var yt=function t(){var e=new dt;function n(){return vt.apply(e,arguments)}return n.callbacks=e.callbacks,n.exits=e.exits,n.base=e.base.bind(e),n.strict=e.strict.bind(e),n.start=e.start.bind(e),n.stop=e.stop.bind(e),n.show=e.show.bind(e),n.back=e.back.bind(e),n.redirect=e.redirect.bind(e),n.replace=e.replace.bind(e),n.dispatch=e.dispatch.bind(e),n.exit=e.exit.bind(e),n.configure=e.configure.bind(e),n.sameOrigin=e.sameOrigin.bind(e),n.clickHandler=e.clickHandler.bind(e),n.create=t,Object.defineProperty(n,"len",{get:function(){return e.len},set:function(t){e.len=t}}),Object.defineProperty(n,"current",{get:function(){return e.current},set:function(t){e.current=t}}),n.Context=gt,n.Route=mt,n}(),bt=yt,$t=yt;function wt(t){var e,n=t.$$slots.default,o=c(n,t,null);return{c:function(){o&&o.c()},l:function(t){o&&o.l(t)},m:function(t,n){o&&o.m(t,n),e=!0},p:function(t,e){o&&o.p&&t.$$scope&&o.p(u(n,e,t,null),h(n,e,null))},i:function(t){e||(H(o,t),e=!0)},o:function(t){N(o,t),e=!1},d:function(t){o&&o.d(t)}}}bt.default=$t;var _t={};function xt(e,n,o){var r=function(e,n){var o;void 0===n&&(n=t);var r=[];function i(t){if(a(e,t)&&(e=t,o)){for(var n=!G.length,i=0;i<r.length;i+=1){var s=r[i];s[1](),G.push(s,e)}if(n){for(var c=0;c<G.length;c+=2)G[c][0](G[c+1]);G.length=0}}}return{set:i,update:function(t){i(t(e))},subscribe:function(a,s){void 0===s&&(s=t);var c=[a,s];return r.push(c),1===r.length&&(o=n(i)||t),a(e),function(){var t=r.indexOf(c);-1!==t&&r.splice(t,1),0===r.length&&(o(),o=null)}}}}(null),i=n.middleware;void 0===i&&(i=[]);var s=n.hashbang;void 0===s&&(s=!1);var c=n.metadata;void 0===c&&(c={});var h=n.error;void 0===h&&(h=null);var u=n.loading;void 0===u&&(u=null);var p,f,l,d=function(t){var e=t.metadata;return function(t,n){t.metadata={route:e,router:c},n()}},v=function(t){return function(e){r.set({ctx:e,route:t})}};p=_t,f={registerRoute:function(t){bt.apply(void 0,[t.path,d(t)].concat(i,t.middleware,[v(t)]))},error:h,loading:u,selectedRoute:r},_().$$.context.set(p,f),l=function(){bt({hashbang:s})},_().$$.on_mount.push(l);var g=n.$$slots;void 0===g&&(g={});var m=n.$$scope;return e.$set=function(t){"middleware"in t&&o("middleware",i=t.middleware),"hashbang"in t&&o("hashbang",s=t.hashbang),"metadata"in t&&o("metadata",c=t.metadata),"error"in t&&o("error",h=t.error),"loading"in t&&o("loading",u=t.loading),"$$scope"in t&&o("$$scope",m=t.$$scope)},{middleware:i,hashbang:s,metadata:c,error:h,loading:u,$$slots:g,$$scope:m}}var kt=function(t){function e(e){t.call(this),V(this,e,xt,wt,a,["middleware","hashbang","metadata","error","loading"])}return t&&(e.__proto__=t),e.prototype=Object.create(t&&t.prototype),e.prototype.constructor=e,e}(F);function Et(t){var e,n,o,r=t.$$slots.default,i=c(r,t,null);return{c:function(){(e=d("h1")).textContent="Page Wrapper",n=g(),i&&i.c()},l:function(t){i&&i.l(t)},m:function(t,r){f(t,e,r),f(t,n,r),i&&i.m(t,r),o=!0},p:function(t,e){i&&i.p&&t.$$scope&&i.p(u(r,e,t,null),h(r,e,null))},i:function(t){o||(H(i,t),o=!0)},o:function(t){N(i,t),o=!1},d:function(t){t&&(l(e),l(n)),i&&i.d(t)}}}function Rt(t,e,n){var o=e.$$slots;void 0===o&&(o={});var r=e.$$scope;return t.$set=function(t){"$$scope"in t&&n("$$scope",r=t.$$scope)},{$$slots:o,$$scope:r}}var Ut=function(t){function e(e){t.call(this),V(this,e,Rt,Et,a,[])}return t&&(e.__proto__=t),e.prototype=Object.create(t&&t.prototype),e.prototype.constructor=e,e}(F);export{kt as A,Ut as P,_t as R,F as S,f as a,g as b,b as c,l as d,d as e,m as f,S as g,N as h,V as i,I as j,H as k,x as l,s as m,t as n,c as o,u as p,h as q,q as r,a as s,v as t,z as u,B as v,e as w,E as x,p as y,y as z};
//# sourceMappingURL=Page-772cd5a7.js.map