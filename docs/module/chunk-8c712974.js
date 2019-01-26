function noop() {}

function assign(tar, src) {
	for (var k in src) { tar[k] = src[k]; }
	return tar;
}

function isPromise(value) {
	return value && typeof value.then === 'function';
}

function addLoc(element, file, line, column, char) {
	element.__svelte_meta = {
		loc: { file: file, line: line, column: column, char: char }
	};
}

function run(fn) {
	return fn();
}

function blankObject() {
	return Object.create(null);
}

function run_all(fns) {
	fns.forEach(run);
}

function is_function(thing) {
	return typeof thing === 'function';
}

function safe_not_equal(a, b) {
	return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}

function validate_store(store, name) {
	if (!store || typeof store.subscribe !== 'function') {
		throw new Error(("'" + name + "' is not a store with a 'subscribe' method"));
	}
}

function create_slot(definition, ctx) {
	if (definition) {
		var slot_ctx = definition[1]
			? assign({}, assign(ctx.$$scope.ctx, definition[1](ctx)))
			: ctx.$$scope.ctx;

		return definition[0](slot_ctx);
	}
}

function append(target, node) {
	target.appendChild(node);
}

function insert(target, node, anchor) {
	target.insertBefore(node, anchor);
}

function detachNode(node) {
	node.parentNode.removeChild(node);
}

function createElement(name) {
	return document.createElement(name);
}

function createText(data) {
	return document.createTextNode(data);
}

function createComment() {
	return document.createComment('');
}

function addListener(node, event, handler, options) {
	node.addEventListener(event, handler, options);
	return function () { return node.removeEventListener(event, handler, options); };
}

function children (element) {
	return Array.from(element.childNodes);
}

function setData(text, data) {
	text.data = '' + data;
}

var current_component;

function set_current_component(component) {
	current_component = component;
}

function get_current_component() {
	if (!current_component) { throw new Error("Function called outside component initialization"); }
	return current_component;
}

function onMount(fn) {
	get_current_component().$$.on_mount.push(fn);
}

function setContext(key, context) {
	get_current_component().$$.context.set(key, context);
}

function getContext(key) {
	return get_current_component().$$.context.get(key);
}

var dirty_components = [];

var update_scheduled = false;
var binding_callbacks = [];
var render_callbacks = [];

function schedule_update() {
	if (!update_scheduled) {
		update_scheduled = true;
		queue_microtask(flush);
	}
}

function add_render_callback(fn) {
	render_callbacks.push(fn);
}

function add_binding_callback(fn) {
	binding_callbacks.push(fn);
}

function flush() {
	var seen_callbacks = new Set();

	do {
		// first, call beforeUpdate functions
		// and update components
		while (dirty_components.length) {
			var component = dirty_components.shift();
			set_current_component(component);
			update(component.$$);
		}

		while (binding_callbacks.length) { binding_callbacks.shift()(); }

		// then, once components are updated, call
		// afterUpdate functions. This may cause
		// subsequent updates...
		while (render_callbacks.length) {
			var callback = render_callbacks.pop();
			if (!seen_callbacks.has(callback)) {
				callback();

				// ...so guard against infinite loops
				seen_callbacks.add(callback);
			}
		}
	} while (dirty_components.length);

	update_scheduled = false;
}

function update($$) {
	if ($$.fragment) {
		$$.update($$.dirty);
		run_all($$.before_render);
		$$.fragment.p($$.dirty, $$.ctx);
		$$.dirty = null;

		$$.after_render.forEach(add_render_callback);
	}
}

function queue_microtask(callback) {
	Promise.resolve().then(function () {
		if (update_scheduled) { callback(); }
	});
}

function handlePromise(promise, info) {
	var obj;

	var token = info.token = {};

	function update(type, index, key, value) {
		var obj;

		if (info.token !== token) { return; }

		info.resolved = key && ( obj = {}, obj[key] = value, obj );

		var child_ctx = assign(assign({}, info.ctx), info.resolved);
		var block = type && (info.current = type)(child_ctx);

		if (info.block) {
			if (info.blocks) {
				info.blocks.forEach(function (block, i) {
					if (i !== index && block) {
						block.o(function () {
							block.d(1);
							info.blocks[i] = null;
						});
					}
				});
			} else {
				info.block.d(1);
			}

			block.c();
			block.m(info.mount(), info.anchor);
			if (block.i) { block.i(); }

			flush();
		}

		info.block = block;
		if (info.blocks) { info.blocks[index] = block; }
	}

	if (isPromise(promise)) {
		promise.then(function (value) {
			update(info.then, 1, info.value, value);
		}, function (error) {
			update(info.catch, 2, info.error, error);
		});

		// if we previously had a then/catch block, destroy it
		if (info.current !== info.pending) {
			update(info.pending, 0);
			return true;
		}
	} else {
		if (info.current !== info.then) {
			update(info.then, 1, info.value, promise);
			return true;
		}

		info.resolved = ( obj = {}, obj[info.value] = promise, obj );
	}
}

function mount_component(component, target, anchor) {
	var ref = component.$$;
	var fragment = ref.fragment;
	var on_mount = ref.on_mount;
	var on_destroy = ref.on_destroy;
	var after_render = ref.after_render;

	fragment.m(target, anchor);

	// onMount happens after the initial afterUpdate. Because
	// afterUpdate callbacks happen in reverse order (inner first)
	// we schedule onMount callbacks before afterUpdate callbacks
	add_render_callback(function () {
		var new_on_destroy = on_mount.map(run).filter(is_function);
		if (on_destroy) {
			on_destroy.push.apply(on_destroy, new_on_destroy);
		} else {
			// Edge case — component was destroyed immediately,
			// most likely as a result of a binding initialising
			run_all(new_on_destroy);
		}
		component.$$.on_mount = [];
	});

	after_render.forEach(add_render_callback);
}

function destroy(component, detach) {
	if (component.$$) {
		run_all(component.$$.on_destroy);
		component.$$.fragment.d(detach);

		// TODO null out other refs, including component.$$ (but need to
		// preserve final state?)
		component.$$.on_destroy = component.$$.fragment = null;
		component.$$.ctx = {};
	}
}

function make_dirty(component, key) {
	if (!component.$$.dirty) {
		dirty_components.push(component);
		schedule_update();
		component.$$.dirty = {};
	}
	component.$$.dirty[key] = true;
}

function init(component, options, instance, create_fragment, not_equal$$1) {
	var parent_component = current_component;
	set_current_component(component);

	var props = options.props || {};

	var $$ = component.$$ = {
		fragment: null,
		ctx: null,

		// state
		update: noop,
		not_equal: not_equal$$1,
		bound: blankObject(),

		// lifecycle
		on_mount: [],
		on_destroy: [],
		before_render: [],
		after_render: [],
		context: new Map(parent_component ? parent_component.$$.context : []),

		// everything else
		callbacks: blankObject(),
		dirty: null
	};

	var ready = false;

	$$.ctx = instance
		? instance(component, props, function (key, value) {
			if ($$.bound[key]) { $$.bound[key](value); }

			if ($$.ctx) {
				var changed = not_equal$$1(value, $$.ctx[key]);
				if (ready && changed) {
					make_dirty(component, key);
				}

				$$.ctx[key] = value;
				return changed;
			}
		})
		: props;

	$$.update();
	ready = true;
	run_all($$.before_render);
	$$.fragment = create_fragment($$.ctx);

	if (options.target) {
		if (options.hydrate) {
			$$.fragment.l(children(options.target));
		} else {
			$$.fragment.c();
		}

		mount_component(component, options.target, options.anchor);
		if (options.intro && component.$$.fragment.i) { component.$$.fragment.i(); }
		flush();
	}

	set_current_component(parent_component);
}

var SvelteElement;
if (typeof HTMLElement !== 'undefined') {
	SvelteElement = /*@__PURE__*/(function (HTMLElement) {
		function SvelteElement() {
			HTMLElement.call(this);
			this.attachShadow({ mode: 'open' });
		}

		if ( HTMLElement ) SvelteElement.__proto__ = HTMLElement;
		SvelteElement.prototype = Object.create( HTMLElement && HTMLElement.prototype );
		SvelteElement.prototype.constructor = SvelteElement;

		SvelteElement.prototype.connectedCallback = function connectedCallback () {
			for (var key in this.$$.slotted) {
				this.appendChild(this.$$.slotted[key]);
			}
		};

		SvelteElement.prototype.attributeChangedCallback = function attributeChangedCallback (attr, oldValue, newValue) {
			this[attr] = newValue;
		};

		SvelteElement.prototype.$destroy = function $destroy () {
			destroy(this, true);
			this.$destroy = noop;
		};

		SvelteElement.prototype.$on = function $on (type, callback) {
			// TODO should this delegate to addEventListener?
			var callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
			callbacks.push(callback);

			return function () {
				var index = callbacks.indexOf(callback);
				if (index !== -1) { callbacks.splice(index, 1); }
			};
		};

		SvelteElement.prototype.$set = function $set () {
			// overridden by instance, if it has props
		};

		return SvelteElement;
	}(HTMLElement));
}

var SvelteComponent = function SvelteComponent () {};

SvelteComponent.prototype.$destroy = function $destroy () {
	destroy(this, true);
	this.$destroy = noop;
};

SvelteComponent.prototype.$on = function $on (type, callback) {
	var callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
	callbacks.push(callback);

	return function () {
		var index = callbacks.indexOf(callback);
		if (index !== -1) { callbacks.splice(index, 1); }
	};
};

SvelteComponent.prototype.$set = function $set () {
	// overridden by instance, if it has props
};

var SvelteComponentDev = /*@__PURE__*/(function (SvelteComponent) {
	function SvelteComponentDev(options) {
		if (!options || (!options.target && !options.$$inline)) {
			throw new Error("'target' is a required option");
		}

		SvelteComponent.call(this);
	}

	if ( SvelteComponent ) SvelteComponentDev.__proto__ = SvelteComponent;
	SvelteComponentDev.prototype = Object.create( SvelteComponent && SvelteComponent.prototype );
	SvelteComponentDev.prototype.constructor = SvelteComponentDev;

	SvelteComponentDev.prototype.$destroy = function $destroy () {
		SvelteComponent.prototype.$destroy.call(this);
		this.$destroy = function () {
			console.warn("Component was already destroyed");
		};
	};

	return SvelteComponentDev;
}(SvelteComponent));

export { run_all as a, noop as b, SvelteComponentDev as c, addListener as d, create_slot as e, init as f, safe_not_equal as g, setContext as h, onMount as i, addLoc as j, add_binding_callback as k, append as l, assign as m, createComment as n, createElement as o, createText as p, detachNode as q, flush as r, handlePromise as s, insert as t, setData as u, validate_store as v, getContext as w, mount_component as x };
//# sourceMappingURL=chunk-8c712974.js.map
