function n(){}function t(n,t){for(var o in t)n[o]=t[o];return n}function o(n){return n()}function e(){return Object.create(null)}function r(n){n.forEach(o)}function u(n){return"function"==typeof n}function c(n,t){return n!=n?t==t:n!==t||n&&"object"==typeof n||"function"==typeof n}function a(n,t,o){n.$$.on_destroy.push(function(n,t){var o=n.subscribe(t);return o.unsubscribe?function(){return o.unsubscribe()}:o}(t,o))}function i(n,t,o){if(n){var e=f(n,t,o);return n[0](e)}}function f(n,o,e){return n[1]?t({},t(o.$$scope.ctx,n[1](e?e(o):{}))):o.$$scope.ctx}function s(n,o,e,r){return n[1]?t({},t(o.$$scope.changed||{},n[1](r?r(e):{}))):o.$$scope.changed||{}}function l(n,t){n.appendChild(t)}function p(n,t,o){n.insertBefore(t,o||null)}function $(n){n.parentNode.removeChild(n)}function d(n){return document.createElement(n)}function h(n){return document.createTextNode(n)}function v(){return h(" ")}function b(){return h("")}function m(n,t,o){null==o?n.removeAttribute(t):n.setAttribute(t,o)}function y(n,t){t=""+t,n.data!==t&&(n.data=t)}var g;function x(n){g=n}function _(){if(!g)throw new Error("Function called outside component initialization");return g}function k(n){_().$$.on_mount.push(n)}function w(n,t){_().$$.context.set(n,t)}function E(n){return _().$$.context.get(n)}var j=[],A=[],C=[],N=[],O=Promise.resolve(),P=!1;function S(n){C.push(n)}function q(){var n=new Set;do{for(;j.length;){var t=j.shift();x(t),z(t.$$)}for(;A.length;)A.pop()();for(var o=0;o<C.length;o+=1){var e=C[o];n.has(e)||(e(),n.add(e))}C.length=0}while(j.length);for(;N.length;)N.pop()();P=!1}function z(n){n.fragment&&(n.update(n.dirty),r(n.before_update),n.fragment.p(n.dirty,n.ctx),n.dirty=null,n.after_update.forEach(S))}var B,F=new Set;function M(){B={r:0,c:[],p:B}}function T(){B.r||r(B.c),B=B.p}function W(n,t){n&&n.i&&(F.delete(n),n.i(t))}function D(n,t,o,e){if(n&&n.o){if(F.has(n))return;F.add(n),B.c.push(function(){F.delete(n),e&&(o&&n.d(1),e())}),n.o(t)}}function G(n,o){var e,r,u=o.token={};function c(n,e,r,c){var a;if(o.token===u){o.resolved=r&&((a={})[r]=c,a);var i=t(t({},o.ctx),o.resolved),f=n&&(o.current=n)(i);o.block&&(o.blocks?o.blocks.forEach(function(n,t){t!==e&&n&&(M(),D(n,1,1,function(){o.blocks[t]=null}),T())}):o.block.d(1),f.c(),W(f,1),f.m(o.mount(),o.anchor),q()),o.block=f,o.blocks&&(o.blocks[e]=f)}}if((r=n)&&"object"==typeof r&&"function"==typeof r.then){var a=_();if(n.then(function(n){x(a),c(o.then,1,o.value,n),x(null)},function(n){x(a),c(o.catch,2,o.error,n),x(null)}),o.current!==o.pending)return c(o.pending,0),!0}else{if(o.current!==o.then)return c(o.then,1,o.value,n),!0;o.resolved=((e={})[o.value]=n,e)}}function H(n,t,e){var c=n.$$,a=c.fragment,i=c.on_mount,f=c.on_destroy,s=c.after_update;a.m(t,e),S(function(){var t=i.map(o).filter(u);f?f.push.apply(f,t):r(t),n.$$.on_mount=[]}),s.forEach(S)}function I(n,t){n.$$.fragment&&(r(n.$$.on_destroy),n.$$.fragment.d(t),n.$$.on_destroy=n.$$.fragment=null,n.$$.ctx={})}function J(n,t){n.$$.dirty||(j.push(n),P||(P=!0,O.then(q)),n.$$.dirty=e()),n.$$.dirty[t]=!0}function K(t,o,u,c,a,i){var f=g;x(t);var s,l=o.props||{},p=t.$$={fragment:null,ctx:null,props:i,update:n,not_equal:a,bound:e(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(f?f.$$.context:[]),callbacks:e(),dirty:null},$=!1;p.ctx=u?u(t,l,function(n,o,e){return void 0===e&&(e=o),p.ctx&&a(p.ctx[n],p.ctx[n]=e)&&(p.bound[n]&&p.bound[n](e),$&&J(t,n)),o}):l,p.update(),$=!0,r(p.before_update),p.fragment=c(p.ctx),o.target&&(o.hydrate?p.fragment.l((s=o.target,Array.from(s.childNodes))):p.fragment.c(),o.intro&&W(t.$$.fragment),H(t,o.target,o.anchor),q()),x(f)}var L=function(){};function Q(n){var t,o,e,r=n.$$slots.default,u=i(r,n,null);return{c:function(){(t=d("h1")).textContent="Page Wrapper",o=v(),u&&u.c()},l:function(n){u&&u.l(n)},m:function(n,r){p(n,t,r),p(n,o,r),u&&u.m(n,r),e=!0},p:function(n,t){u&&u.p&&n.$$scope&&u.p(s(r,t,n,null),f(r,t,null))},i:function(n){e||(W(u,n),e=!0)},o:function(n){D(u,n),e=!1},d:function(n){n&&($(t),$(o)),u&&u.d(n)}}}function R(n,t,o){var e=t.$$slots;void 0===e&&(e={});var r=t.$$scope;return n.$set=function(n){"$$scope"in n&&o("$$scope",r=n.$$scope)},{$$slots:e,$$scope:r}}L.prototype.$destroy=function(){I(this,1),this.$destroy=n},L.prototype.$on=function(n,t){var o=this.$$.callbacks[n]||(this.$$.callbacks[n]=[]);return o.push(t),function(){var n=o.indexOf(t);-1!==n&&o.splice(n,1)}},L.prototype.$set=function(){};var U=function(n){function t(t){n.call(this),K(this,t,R,Q,c,[])}return n&&(t.__proto__=n),t.prototype=Object.create(n&&n.prototype),t.prototype.constructor=t,t}(L);export{l as A,m as B,U as P,L as S,f as a,D as b,i as c,w as d,d as e,p as f,s as g,$ as h,K as i,v as j,h as k,y as l,b as m,n,k as o,M as p,T as q,E as r,c as s,W as t,a as u,H as v,I as w,G as x,t as y,A as z};
//# sourceMappingURL=Page-42dd47cb.js.map
