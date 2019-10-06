function noop() { }
function assign(tar, src) {
    // @ts-ignore
    for (var k in src)
        { tar[k] = src[k]; }
    return tar;
}
function is_promise(value) {
    return value && typeof value === 'object' && typeof value.then === 'function';
}
function add_location(element, file, line, column, char) {
    element.__svelte_meta = {
        loc: { file: file, line: line, column: column, char: char }
    };
}
function run(fn) {
    return fn();
}
function blank_object() {
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
function subscribe(store, callback) {
    var unsub = store.subscribe(callback);
    return unsub.unsubscribe ? function () { return unsub.unsubscribe(); } : unsub;
}
function component_subscribe(component, store, callback) {
    component.$$.on_destroy.push(subscribe(store, callback));
}
function create_slot(definition, ctx, fn) {
    if (definition) {
        var slot_ctx = get_slot_context(definition, ctx, fn);
        return definition[0](slot_ctx);
    }
}
function get_slot_context(definition, ctx, fn) {
    return definition[1]
        ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
        : ctx.$$scope.ctx;
}
function get_slot_changes(definition, ctx, changed, fn) {
    return definition[1]
        ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
        : ctx.$$scope.changed || {};
}

function append(target, node) {
    target.appendChild(node);
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function element(name) {
    return document.createElement(name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function empty() {
    return text('');
}
function attr(node, attribute, value) {
    if (value == null)
        { node.removeAttribute(attribute); }
    else
        { node.setAttribute(attribute, value); }
}
function children(element) {
    return Array.from(element.childNodes);
}
function custom_event(type, detail) {
    var e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, false, false, detail);
    return e;
}

var current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        { throw new Error("Function called outside component initialization"); }
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
var binding_callbacks = [];
var render_callbacks = [];
var flush_callbacks = [];
var resolved_promise = Promise.resolve();
var update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
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
        while (binding_callbacks.length)
            { binding_callbacks.pop()(); }
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (var i = 0; i < render_callbacks.length; i += 1) {
            var callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                callback();
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
}
function update($$) {
    if ($$.fragment) {
        $$.update($$.dirty);
        run_all($$.before_update);
        $$.fragment.p($$.dirty, $$.ctx);
        $$.dirty = null;
        $$.after_update.forEach(add_render_callback);
    }
}
var outroing = new Set();
var outros;
function group_outros() {
    outros = {
        r: 0,
        c: [],
        p: outros // parent group
    };
}
function check_outros() {
    if (!outros.r) {
        run_all(outros.c);
    }
    outros = outros.p;
}
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function transition_out(block, local, detach, callback) {
    if (block && block.o) {
        if (outroing.has(block))
            { return; }
        outroing.add(block);
        outros.c.push(function () {
            outroing.delete(block);
            if (callback) {
                if (detach)
                    { block.d(1); }
                callback();
            }
        });
        block.o(local);
    }
}

function handle_promise(promise, info) {
    var obj;

    var token = info.token = {};
    function update(type, index, key, value) {
        var obj;

        if (info.token !== token)
            { return; }
        info.resolved = key && ( obj = {}, obj[key] = value, obj );
        var child_ctx = assign(assign({}, info.ctx), info.resolved);
        var block = type && (info.current = type)(child_ctx);
        if (info.block) {
            if (info.blocks) {
                info.blocks.forEach(function (block, i) {
                    if (i !== index && block) {
                        group_outros();
                        transition_out(block, 1, 1, function () {
                            info.blocks[i] = null;
                        });
                        check_outros();
                    }
                });
            }
            else {
                info.block.d(1);
            }
            block.c();
            transition_in(block, 1);
            block.m(info.mount(), info.anchor);
            flush();
        }
        info.block = block;
        if (info.blocks)
            { info.blocks[index] = block; }
    }
    if (is_promise(promise)) {
        var current_component = get_current_component();
        promise.then(function (value) {
            set_current_component(current_component);
            update(info.then, 1, info.value, value);
            set_current_component(null);
        }, function (error) {
            set_current_component(current_component);
            update(info.catch, 2, info.error, error);
            set_current_component(null);
        });
        // if we previously had a then/catch block, destroy it
        if (info.current !== info.pending) {
            update(info.pending, 0);
            return true;
        }
    }
    else {
        if (info.current !== info.then) {
            update(info.then, 1, info.value, promise);
            return true;
        }
        info.resolved = ( obj = {}, obj[info.value] = promise, obj );
    }
}

var globals = (typeof window !== 'undefined' ? window : global);
function mount_component(component, target, anchor) {
    var ref = component.$$;
    var fragment = ref.fragment;
    var on_mount = ref.on_mount;
    var on_destroy = ref.on_destroy;
    var after_update = ref.after_update;
    fragment.m(target, anchor);
    // onMount happens before the initial afterUpdate
    add_render_callback(function () {
        var new_on_destroy = on_mount.map(run).filter(is_function);
        if (on_destroy) {
            on_destroy.push.apply(on_destroy, new_on_destroy);
        }
        else {
            // Edge case - component was destroyed immediately,
            // most likely as a result of a binding initialising
            run_all(new_on_destroy);
        }
        component.$$.on_mount = [];
    });
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    if (component.$$.fragment) {
        run_all(component.$$.on_destroy);
        component.$$.fragment.d(detaching);
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
        component.$$.dirty = blank_object();
    }
    component.$$.dirty[key] = true;
}
function init(component, options, instance, create_fragment, not_equal, prop_names) {
    var parent_component = current_component;
    set_current_component(component);
    var props = options.props || {};
    var $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props: prop_names,
        update: noop,
        not_equal: not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        before_update: [],
        after_update: [],
        context: new Map(parent_component ? parent_component.$$.context : []),
        // everything else
        callbacks: blank_object(),
        dirty: null
    };
    var ready = false;
    $$.ctx = instance
        ? instance(component, props, function (key, ret, value) {
            if ( value === void 0 ) value = ret;

            if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                if ($$.bound[key])
                    { $$.bound[key](value); }
                if (ready)
                    { make_dirty(component, key); }
            }
            return ret;
        })
        : props;
    $$.update();
    ready = true;
    run_all($$.before_update);
    $$.fragment = create_fragment($$.ctx);
    if (options.target) {
        if (options.hydrate) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment.l(children(options.target));
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment.c();
        }
        if (options.intro)
            { transition_in(component.$$.fragment); }
        mount_component(component, options.target, options.anchor);
        flush();
    }
    set_current_component(parent_component);
}
var SvelteComponent = function SvelteComponent () {};

SvelteComponent.prototype.$destroy = function $destroy () {
    destroy_component(this, 1);
    this.$destroy = noop;
};
SvelteComponent.prototype.$on = function $on (type, callback) {
    var callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
    callbacks.push(callback);
    return function () {
        var index = callbacks.indexOf(callback);
        if (index !== -1)
            { callbacks.splice(index, 1); }
    };
};
SvelteComponent.prototype.$set = function $set () {
    // overridden by instance, if it has props
};

function dispatch_dev(type, detail) {
    document.dispatchEvent(custom_event(type, detail));
}
function append_dev(target, node) {
    dispatch_dev("SvelteDOMInsert", { target: target, node: node });
    append(target, node);
}
function insert_dev(target, node, anchor) {
    dispatch_dev("SvelteDOMInsert", { target: target, node: node, anchor: anchor });
    insert(target, node, anchor);
}
function detach_dev(node) {
    dispatch_dev("SvelteDOMRemove", { node: node });
    detach(node);
}
function attr_dev(node, attribute, value) {
    attr(node, attribute, value);
    if (value == null)
        { dispatch_dev("SvelteDOMRemoveAttribute", { node: node, attribute: attribute }); }
    else
        { dispatch_dev("SvelteDOMSetAttribute", { node: node, attribute: attribute, value: value }); }
}
function set_data_dev(text, data) {
    data = '' + data;
    if (text.data === data)
        { return; }
    dispatch_dev("SvelteDOMSetData", { node: text, data: data });
    text.data = data;
}
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
            console.warn("Component was already destroyed"); // eslint-disable-line no-console
        };
    };

    return SvelteComponentDev;
}(SvelteComponent));

/* src\Components\test\Page.svelte generated by Svelte v3.12.1 */

var file = "src\\Components\\test\\Page.svelte";

function create_fragment(ctx) {
	var h1, t_1, current;

	var default_slot_template = ctx.$$slots.default;
	var default_slot = create_slot(default_slot_template, ctx, null);

	var block = {
		c: function create() {
			h1 = element("h1");
			h1.textContent = "Page Wrapper";
			t_1 = space();

			if (default_slot) { default_slot.c(); }
			add_location(h1, file, 5, 0, 101);
		},

		l: function claim(nodes) {
			if (default_slot) { default_slot.l(nodes); }
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},

		m: function mount(target, anchor) {
			insert_dev(target, h1, anchor);
			insert_dev(target, t_1, anchor);

			if (default_slot) {
				default_slot.m(target, anchor);
			}

			current = true;
		},

		p: function update(changed, ctx) {
			if (default_slot && default_slot.p && changed.$$scope) {
				default_slot.p(
					get_slot_changes(default_slot_template, ctx, changed, null),
					get_slot_context(default_slot_template, ctx, null)
				);
			}
		},

		i: function intro(local) {
			if (current) { return; }
			transition_in(default_slot, local);
			current = true;
		},

		o: function outro(local) {
			transition_out(default_slot, local);
			current = false;
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(h1);
				detach_dev(t_1);
			}

			if (default_slot) { default_slot.d(detaching); }
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block: block, id: create_fragment.name, type: "component", source: "", ctx: ctx });
	return block;
}

function instance($$self, $$props, $$invalidate) {
	console.log(getContext('ROUTER'));

	var $$slots = $$props.$$slots; if ( $$slots === void 0 ) $$slots = {};
	var $$scope = $$props.$$scope;

	$$self.$set = function ($$props) {
		if ('$$scope' in $$props) { $$invalidate('$$scope', $$scope = $$props.$$scope); }
	};

	$$self.$capture_state = function () {
		return {};
	};

	$$self.$inject_state = function ($$props) {};

	return { $$slots: $$slots, $$scope: $$scope };
}

var Page = /*@__PURE__*/(function (SvelteComponentDev) {
	function Page(options) {
		SvelteComponentDev.call(this, options);
		init(this, options, instance, create_fragment, safe_not_equal, []);
		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Page", options: options, id: create_fragment.name });
	}

	if ( SvelteComponentDev ) Page.__proto__ = SvelteComponentDev;
	Page.prototype = Object.create( SvelteComponentDev && SvelteComponentDev.prototype );
	Page.prototype.constructor = Page;

	return Page;
}(SvelteComponentDev));

export { handle_promise as A, mount_component as B, destroy_component as C, assign as D, attr_dev as E, append_dev as F, Page as P, SvelteComponentDev as S, setContext as a, get_slot_context as b, create_slot as c, dispatch_dev as d, transition_out as e, element as f, get_slot_changes as g, add_location as h, init as i, insert_dev as j, detach_dev as k, globals as l, space as m, noop as n, onMount as o, text as p, set_data_dev as q, getContext as r, safe_not_equal as s, transition_in as t, component_subscribe as u, validate_store as v, empty as w, group_outros as x, check_outros as y, binding_callbacks as z };
//# sourceMappingURL=Page-16fd0467.js.map
