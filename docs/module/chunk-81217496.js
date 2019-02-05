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

function children (element) {
	return Array.from(element.childNodes);
}

function setData(text, data) {
	text.data = '' + data;
}

var outros;

function group_outros() {
	outros = {
		remaining: 0,
		callbacks: []
	};
}

function check_outros() {
	if (!outros.remaining) {
		run_all(outros.callbacks);
	}
}

function on_outro(callback) {
	outros.callbacks.push(callback);
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
						group_outros();
						on_outro(function () {
							block.d(1);
							info.blocks[i] = null;
						});
						block.o();
						check_outros();
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

function writable(value) {
	var subscribers = [];

	function set(newValue) {
		if (newValue === value) { return; }
		value = newValue;
		subscribers.forEach(function (s) { return s[1](); });
		subscribers.forEach(function (s) { return s[0](value); });
	}

	function update(fn) {
		set(fn(value));
	}

	function subscribe(run$$1, invalidate) {
		if ( invalidate === void 0 ) invalidate = noop;

		var subscriber = [run$$1, invalidate];
		subscribers.push(subscriber);
		run$$1(value);

		return function () {
			var index = subscribers.indexOf(subscriber);
			if (index !== -1) { subscribers.splice(index, 1); }
		};
	}

	return { set: set, update: update, subscribe: subscribe };
}

/**
 * Expose `pathtoRegexp`.
 */

var pathToRegexp = pathtoRegexp;

/**
 * Match matching groups in a regular expression.
 */
var MATCHING_GROUP_REGEXP = /\((?!\?)/g;

/**
 * Normalize the given path string,
 * returning a regular expression.
 *
 * An empty array should be passed,
 * which will contain the placeholder
 * key names. For example "/user/:id" will
 * then contain ["id"].
 *
 * @param  {String|RegExp|Array} path
 * @param  {Array} keys
 * @param  {Object} options
 * @return {RegExp}
 * @api private
 */

function pathtoRegexp(path, keys, options) {
  options = options || {};
  keys = keys || [];
  var strict = options.strict;
  var end = options.end !== false;
  var flags = options.sensitive ? '' : 'i';
  var extraOffset = 0;
  var keysOffset = keys.length;
  var i = 0;
  var name = 0;
  var m;

  if (path instanceof RegExp) {
    while (m = MATCHING_GROUP_REGEXP.exec(path.source)) {
      keys.push({
        name: name++,
        optional: false,
        offset: m.index
      });
    }

    return path;
  }

  if (Array.isArray(path)) {
    // Map array parts into regexps and return their source. We also pass
    // the same keys and options instance into every generation to get
    // consistent matching groups before we join the sources together.
    path = path.map(function (value) {
      return pathtoRegexp(value, keys, options).source;
    });

    return new RegExp('(?:' + path.join('|') + ')', flags);
  }

  path = ('^' + path + (strict ? '' : path[path.length - 1] === '/' ? '?' : '/?'))
    .replace(/\/\(/g, '/(?:')
    .replace(/([\/\.])/g, '\\$1')
    .replace(/(\\\/)?(\\\.)?:(\w+)(\(.*?\))?(\*)?(\?)?/g, function (match, slash, format, key, capture, star, optional, offset) {
      slash = slash || '';
      format = format || '';
      capture = capture || '([^\\/' + format + ']+?)';
      optional = optional || '';

      keys.push({
        name: key,
        optional: !!optional,
        offset: offset + extraOffset
      });

      var result = ''
        + (optional ? '' : slash)
        + '(?:'
        + format + (optional ? slash : '') + capture
        + (star ? '((?:[\\/' + format + '].+?)?)' : '')
        + ')'
        + optional;

      extraOffset += result.length - match.length;

      return result;
    })
    .replace(/\*/g, function (star, index) {
      var len = keys.length;

      while (len-- > keysOffset && keys[len].offset > index) {
        keys[len].offset += 3; // Replacement length minus asterisk length.
      }

      return '(.*)';
    });

  // This is a workaround for handling unnamed matching groups.
  while (m = MATCHING_GROUP_REGEXP.exec(path)) {
    var escapeCount = 0;
    var index = m.index;

    while (path.charAt(--index) === '\\') {
      escapeCount++;
    }

    // It's possible to escape the bracket.
    if (escapeCount % 2 === 1) {
      continue;
    }

    if (keysOffset + i === keys.length || keys[keysOffset + i].offset > m.index) {
      keys.splice(keysOffset + i, 0, {
        name: name++, // Unnamed matching groups must be consistently linear.
        optional: false,
        offset: m.index
      });
    }

    i++;
  }

  // If the path is non-ending, match until the end or a slash.
  path += (end ? '$' : (path[path.length - 1] === '/' ? '' : '(?=\\/|$)'));

  return new RegExp(path, flags);
}

/**
   * Module dependencies.
   */

  

  /**
   * Module exports.
   */

  var page_js = page;

  /**
   * Detect click event
   */
  var clickEvent = ('undefined' !== typeof document) && document.ontouchstart ? 'touchstart' : 'click';

  /**
   * To work properly with the URL
   * history.location generated polyfill in https://github.com/devote/HTML5-History-API
   */

  var location$1 = ('undefined' !== typeof window) && (window.history.location || window.location);

  /**
   * Perform initial dispatch.
   */

  var dispatch = true;


  /**
   * Decode URL components (query string, pathname, hash).
   * Accommodates both regular percent encoding and x-www-form-urlencoded format.
   */
  var decodeURLComponents = true;

  /**
   * Base path.
   */

  var base = '';

  /**
   * Running flag.
   */

  var running$1;

  /**
   * HashBang option
   */

  var hashbang = false;

  /**
   * Previous context, for capturing
   * page exit events.
   */

  var prevContext;

  /**
   * Register `path` with callback `fn()`,
   * or route `path`, or redirection,
   * or `page.start()`.
   *
   *   page(fn);
   *   page('*', fn);
   *   page('/user/:id', load, user);
   *   page('/user/' + user.id, { some: 'thing' });
   *   page('/user/' + user.id);
   *   page('/from', '/to')
   *   page();
   *
   * @param {String|Function} path
   * @param {Function} fn...
   * @api public
   */

  function page(path, fn) {
    var arguments$1 = arguments;

    // <callback>
    if ('function' === typeof path) {
      return page('*', path);
    }

    // route <path> to <callback ...>
    if ('function' === typeof fn) {
      var route = new Route(path);
      for (var i = 1; i < arguments.length; ++i) {
        page.callbacks.push(route.middleware(arguments$1[i]));
      }
      // show <path> with [state]
    } else if ('string' === typeof path) {
      page['string' === typeof fn ? 'redirect' : 'show'](path, fn);
      // start [options]
    } else {
      page.start(path);
    }
  }

  /**
   * Callback functions.
   */

  page.callbacks = [];
  page.exits = [];

  /**
   * Current path being processed
   * @type {String}
   */
  page.current = '';

  /**
   * Number of pages navigated to.
   * @type {number}
   *
   *     page.len == 0;
   *     page('/login');
   *     page.len == 1;
   */

  page.len = 0;

  /**
   * Get or set basepath to `path`.
   *
   * @param {String} path
   * @api public
   */

  page.base = function(path) {
    if (0 === arguments.length) { return base; }
    base = path;
  };

  /**
   * Bind with the given `options`.
   *
   * Options:
   *
   *    - `click` bind to click events [true]
   *    - `popstate` bind to popstate [true]
   *    - `dispatch` perform initial dispatch [true]
   *
   * @param {Object} options
   * @api public
   */

  page.start = function(options) {
    options = options || {};
    if (running$1) { return; }
    running$1 = true;
    if (false === options.dispatch) { dispatch = false; }
    if (false === options.decodeURLComponents) { decodeURLComponents = false; }
    if (false !== options.popstate) { window.addEventListener('popstate', onpopstate, false); }
    if (false !== options.click) {
      document.addEventListener(clickEvent, onclick, false);
    }
    if (true === options.hashbang) { hashbang = true; }
    if (!dispatch) { return; }
    var url = (hashbang && ~location$1.hash.indexOf('#!')) ? location$1.hash.substr(2) + location$1.search : location$1.pathname + location$1.search + location$1.hash;
    page.replace(url, null, true, dispatch);
  };

  /**
   * Unbind click and popstate event handlers.
   *
   * @api public
   */

  page.stop = function() {
    if (!running$1) { return; }
    page.current = '';
    page.len = 0;
    running$1 = false;
    document.removeEventListener(clickEvent, onclick, false);
    window.removeEventListener('popstate', onpopstate, false);
  };

  /**
   * Show `path` with optional `state` object.
   *
   * @param {String} path
   * @param {Object} state
   * @param {Boolean} dispatch
   * @return {Context}
   * @api public
   */

  page.show = function(path, state, dispatch, push) {
    var ctx = new Context(path, state);
    page.current = ctx.path;
    if (false !== dispatch) { page.dispatch(ctx); }
    if (false !== ctx.handled && false !== push) { ctx.pushState(); }
    return ctx;
  };

  /**
   * Goes back in the history
   * Back should always let the current route push state and then go back.
   *
   * @param {String} path - fallback path to go back if no more history exists, if undefined defaults to page.base
   * @param {Object} [state]
   * @api public
   */

  page.back = function(path, state) {
    if (page.len > 0) {
      // this may need more testing to see if all browsers
      // wait for the next tick to go back in history
      history.back();
      page.len--;
    } else if (path) {
      setTimeout(function() {
        page.show(path, state);
      });
    }else{
      setTimeout(function() {
        page.show(base, state);
      });
    }
  };


  /**
   * Register route to redirect from one path to other
   * or just redirect to another route
   *
   * @param {String} from - if param 'to' is undefined redirects to 'from'
   * @param {String} [to]
   * @api public
   */
  page.redirect = function(from, to) {
    // Define route from a path to another
    if ('string' === typeof from && 'string' === typeof to) {
      page(from, function(e) {
        setTimeout(function() {
          page.replace(to);
        }, 0);
      });
    }

    // Wait for the push state and replace it with another
    if ('string' === typeof from && 'undefined' === typeof to) {
      setTimeout(function() {
        page.replace(from);
      }, 0);
    }
  };

  /**
   * Replace `path` with optional `state` object.
   *
   * @param {String} path
   * @param {Object} state
   * @return {Context}
   * @api public
   */


  page.replace = function(path, state, init, dispatch) {
    var ctx = new Context(path, state);
    page.current = ctx.path;
    ctx.init = init;
    ctx.save(); // save before dispatching, which may redirect
    if (false !== dispatch) { page.dispatch(ctx); }
    return ctx;
  };

  /**
   * Dispatch the given `ctx`.
   *
   * @param {Object} ctx
   * @api private
   */

  page.dispatch = function(ctx) {
    var prev = prevContext,
      i = 0,
      j = 0;

    prevContext = ctx;

    function nextExit() {
      var fn = page.exits[j++];
      if (!fn) { return nextEnter(); }
      fn(prev, nextExit);
    }

    function nextEnter() {
      var fn = page.callbacks[i++];

      if (ctx.path !== page.current) {
        ctx.handled = false;
        return;
      }
      if (!fn) { return unhandled(ctx); }
      fn(ctx, nextEnter);
    }

    if (prev) {
      nextExit();
    } else {
      nextEnter();
    }
  };

  /**
   * Unhandled `ctx`. When it's not the initial
   * popstate then redirect. If you wish to handle
   * 404s on your own use `page('*', callback)`.
   *
   * @param {Context} ctx
   * @api private
   */

  function unhandled(ctx) {
    if (ctx.handled) { return; }
    var current;

    if (hashbang) {
      current = base + location$1.hash.replace('#!', '');
    } else {
      current = location$1.pathname + location$1.search;
    }

    if (current === ctx.canonicalPath) { return; }
    page.stop();
    ctx.handled = false;
    location$1.href = ctx.canonicalPath;
  }

  /**
   * Register an exit route on `path` with
   * callback `fn()`, which will be called
   * on the previous context when a new
   * page is visited.
   */
  page.exit = function(path, fn) {
    var arguments$1 = arguments;

    if (typeof path === 'function') {
      return page.exit('*', path);
    }

    var route = new Route(path);
    for (var i = 1; i < arguments.length; ++i) {
      page.exits.push(route.middleware(arguments$1[i]));
    }
  };

  /**
   * Remove URL encoding from the given `str`.
   * Accommodates whitespace in both x-www-form-urlencoded
   * and regular percent-encoded form.
   *
   * @param {str} URL component to decode
   */
  function decodeURLEncodedURIComponent(val) {
    if (typeof val !== 'string') { return val; }
    return decodeURLComponents ? decodeURIComponent(val.replace(/\+/g, ' ')) : val;
  }

  /**
   * Initialize a new "request" `Context`
   * with the given `path` and optional initial `state`.
   *
   * @param {String} path
   * @param {Object} state
   * @api public
   */

  function Context(path, state) {
    if ('/' === path[0] && 0 !== path.indexOf(base)) { path = base + (hashbang ? '#!' : '') + path; }
    var i = path.indexOf('?');

    this.canonicalPath = path;
    this.path = path.replace(base, '') || '/';
    if (hashbang) { this.path = this.path.replace('#!', '') || '/'; }

    this.title = document.title;
    this.state = state || {};
    this.state.path = path;
    this.querystring = ~i ? decodeURLEncodedURIComponent(path.slice(i + 1)) : '';
    this.pathname = decodeURLEncodedURIComponent(~i ? path.slice(0, i) : path);
    this.params = {};

    // fragment
    this.hash = '';
    if (!hashbang) {
      if (!~this.path.indexOf('#')) { return; }
      var parts = this.path.split('#');
      this.path = parts[0];
      this.hash = decodeURLEncodedURIComponent(parts[1]) || '';
      this.querystring = this.querystring.split('#')[0];
    }
  }

  /**
   * Expose `Context`.
   */

  page.Context = Context;

  /**
   * Push state.
   *
   * @api private
   */

  Context.prototype.pushState = function() {
    page.len++;
    history.pushState(this.state, this.title, hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
  };

  /**
   * Save the context state.
   *
   * @api public
   */

  Context.prototype.save = function() {
    history.replaceState(this.state, this.title, hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
  };

  /**
   * Initialize `Route` with the given HTTP `path`,
   * and an array of `callbacks` and `options`.
   *
   * Options:
   *
   *   - `sensitive`    enable case-sensitive routes
   *   - `strict`       enable strict matching for trailing slashes
   *
   * @param {String} path
   * @param {Object} options.
   * @api private
   */

  function Route(path, options) {
    options = options || {};
    this.path = path;
    this.method = 'GET';
    this.regexp = pathToRegexp(this.path,
      this.keys = [],
      options.sensitive,
      options.strict);
  }

  /**
   * Expose `Route`.
   */

  page.Route = Route;

  /**
   * Return route middleware with
   * the given callback `fn()`.
   *
   * @param {Function} fn
   * @return {Function}
   * @api public
   */

  Route.prototype.middleware = function(fn) {
    var self = this;
    return function(ctx, next) {
      if (self.match(ctx.path, ctx.params)) { return fn(ctx, next); }
      next();
    };
  };

  /**
   * Check if this route matches `path`, if so
   * populate `params`.
   *
   * @param {String} path
   * @param {Object} params
   * @return {Boolean}
   * @api private
   */

  Route.prototype.match = function(path, params) {
    var keys = this.keys,
      qsIndex = path.indexOf('?'),
      pathname = ~qsIndex ? path.slice(0, qsIndex) : path,
      m = this.regexp.exec(decodeURIComponent(pathname));

    if (!m) { return false; }

    for (var i = 1, len = m.length; i < len; ++i) {
      var key = keys[i - 1];
      if (key) {
        var val = decodeURLEncodedURIComponent(m[i]);
        if (val !== undefined || !(hasOwnProperty.call(params, key.name))) {
          params[key.name] = val;
        }        
      }

    }

    return true;
  };


  /**
   * Handle "populate" events.
   */

  var onpopstate = (function () {
    var loaded = false;
    if ('undefined' === typeof window) {
      return;
    }
    if (document.readyState === 'complete') {
      loaded = true;
    } else {
      window.addEventListener('load', function() {
        setTimeout(function() {
          loaded = true;
        }, 0);
      });
    }
    return function onpopstate(e) {
      if (!loaded) { return; }
      if (e.state) {
        var path = e.state.path;
        page.replace(path, e.state);
      } else {
        page.show(location$1.pathname + location$1.hash, undefined, undefined, false);
      }
    };
  })();
  /**
   * Handle "click" events.
   */

  function onclick(e) {

    if (1 !== which(e)) { return; }

    if (e.metaKey || e.ctrlKey || e.shiftKey) { return; }
    if (e.defaultPrevented) { return; }



    // ensure link
    var el = e.target;
    while (el && 'A' !== el.nodeName) { el = el.parentNode; }
    if (!el || 'A' !== el.nodeName) { return; }



    // Ignore if tag has
    // 1. "download" attribute
    // 2. rel="external" attribute
    if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') { return; }

    // ensure non-hash for the same path
    var link = el.getAttribute('href');
    if (!hashbang && el.pathname === location$1.pathname && (el.hash || '#' === link)) { return; }



    // Check for mailto: in the href
    if (link && link.indexOf('mailto:') > -1) { return; }

    // check target
    if (el.target) { return; }

    // x-origin
    if (!sameOrigin(el.href)) { return; }



    // rebuild path
    var path = el.pathname + el.search + (el.hash || '');

    // strip leading "/[drive letter]:" on NW.js on Windows
    if (typeof process !== 'undefined' && path.match(/^\/[a-zA-Z]:\//)) {
      path = path.replace(/^\/[a-zA-Z]:\//, '/');
    }

    // same page
    var orig = path;

    if (path.indexOf(base) === 0) {
      path = path.substr(base.length);
    }

    if (hashbang) { path = path.replace('#!', ''); }

    if (base && orig === path) { return; }

    e.preventDefault();
    page.show(orig);
  }

  /**
   * Event button.
   */

  function which(e) {
    e = e || window.event;
    return null === e.which ? e.button : e.which;
  }

  /**
   * Check if `href` is the same origin.
   */

  function sameOrigin(href) {
    var origin = location$1.protocol + '//' + location$1.hostname;
    if (location$1.port) { origin += ':' + location$1.port; }
    return (href && (0 === href.indexOf(origin)));
  }

  page.sameOrigin = sameOrigin;

/* src\Components\Router.html generated by Svelte v3.0.0-alpha20 */

function create_fragment(ctx) {
	var default_slot_1 = ctx.$$slot_default;
	var default_slot = create_slot(default_slot_1, ctx, null);

	return {
		c: function create() {

			if (default_slot) { default_slot.c(); }
		},

		l: function claim(nodes) {
			if (default_slot) { default_slot.l(nodes); }
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},

		m: function mount(target, anchor) {

			if (default_slot) {
				default_slot.m(target, anchor);
			}
		},

		p: function update(changed, ctx) {

			if (default_slot && changed.$$scope) {
				default_slot.p(assign(assign({},(changed)), ctx.$$scope.changed), get_slot_context(default_slot_1, ctx, null));
			}
		},

		i: noop,
		o: noop,

		d: function destroy(detach) {

			if (default_slot) { default_slot.d(detach); }
		}
	};
}

var ROUTER = { };

function instance($$self, $$props, $$invalidate) {
	
	
	var selectedRoute = writable(null);

	var middleware = $$props.middleware; if ( middleware === void 0 ) middleware = [];
	var hashbang = $$props.hashbang; if ( hashbang === void 0 ) hashbang = false;
	var metadata = $$props.metadata; if ( metadata === void 0 ) metadata = { };
	var error = $$props.error; if ( error === void 0 ) error = null;
	var loading = $$props.loading; if ( loading === void 0 ) loading = null;
	var base = $$props.base; if ( base === void 0 ) base = '/';

	var applyMetadata = function (ref) {
		var route = ref.metadata;

		return function (ctx,next) { 
		ctx.metadata = { 
			route: route, 
			router: metadata
		};
		next(); 
	};
	};

	var routeMiddleware = function (route) { return function (ctx) { 
		selectedRoute.set({ctx: ctx, route: route});
		// todo: will need to call next if there are child routes
	}; };
	
	setContext(ROUTER, { 
		registerRoute: function registerRoute(route) { 
			page_js.apply(
				void 0, [ route.path, 
				applyMetadata(route) ].concat( middleware, 
				route.middleware,
				[routeMiddleware(route)] )
			); 
		}, 
		error: error,
		loading: loading,
		selectedRoute: selectedRoute
	});

	onMount(function () {
		setTimeout(function () {
			page_js({hashbang: hashbang}); 
			page_js.base(base);
		}, 0);
	});

	var $$slot_default = $$props.$$slot_default;
	var $$scope = $$props.$$scope;

	$$self.$set = function ($$props) {
		if ('middleware' in $$props) { $$invalidate('middleware', middleware = $$props.middleware); }
		if ('hashbang' in $$props) { $$invalidate('hashbang', hashbang = $$props.hashbang); }
		if ('metadata' in $$props) { $$invalidate('metadata', metadata = $$props.metadata); }
		if ('error' in $$props) { $$invalidate('error', error = $$props.error); }
		if ('loading' in $$props) { $$invalidate('loading', loading = $$props.loading); }
		if ('base' in $$props) { $$invalidate('base', base = $$props.base); }
		if ('$$scope' in $$props) { $$invalidate('$$scope', $$scope = $$props.$$scope); }
	};

	return {
		middleware: middleware,
		hashbang: hashbang,
		metadata: metadata,
		error: error,
		loading: loading,
		base: base,
		$$slot_default: $$slot_default,
		$$scope: $$scope
	};
}

var Router = /*@__PURE__*/(function (SvelteComponentDev$$1) {
	function Router(options) {
		SvelteComponentDev$$1.call(this, options);
		init(this, options, instance, create_fragment, safe_not_equal);

		var ref = this.$$;
		var ctx = ref.ctx;
		var props = options.props || {};
		if (ctx.middleware === undefined && !('middleware' in props)) {
			console.warn("<Router> was created without expected prop 'middleware'");
		}
		if (ctx.hashbang === undefined && !('hashbang' in props)) {
			console.warn("<Router> was created without expected prop 'hashbang'");
		}
		if (ctx.metadata === undefined && !('metadata' in props)) {
			console.warn("<Router> was created without expected prop 'metadata'");
		}
		if (ctx.error === undefined && !('error' in props)) {
			console.warn("<Router> was created without expected prop 'error'");
		}
		if (ctx.loading === undefined && !('loading' in props)) {
			console.warn("<Router> was created without expected prop 'loading'");
		}
		if (ctx.base === undefined && !('base' in props)) {
			console.warn("<Router> was created without expected prop 'base'");
		}
	}

	if ( SvelteComponentDev$$1 ) Router.__proto__ = SvelteComponentDev$$1;
	Router.prototype = Object.create( SvelteComponentDev$$1 && SvelteComponentDev$$1.prototype );
	Router.prototype.constructor = Router;

	var prototypeAccessors = { middleware: { configurable: true },hashbang: { configurable: true },metadata: { configurable: true },error: { configurable: true },loading: { configurable: true },base: { configurable: true } };

	prototypeAccessors.middleware.get = function () {
		return this.$$.ctx.middleware;
	};

	prototypeAccessors.middleware.set = function (middleware) {
		this.$set({ middleware: middleware });
		flush();
	};

	prototypeAccessors.hashbang.get = function () {
		return this.$$.ctx.hashbang;
	};

	prototypeAccessors.hashbang.set = function (hashbang) {
		this.$set({ hashbang: hashbang });
		flush();
	};

	prototypeAccessors.metadata.get = function () {
		return this.$$.ctx.metadata;
	};

	prototypeAccessors.metadata.set = function (metadata) {
		this.$set({ metadata: metadata });
		flush();
	};

	prototypeAccessors.error.get = function () {
		return this.$$.ctx.error;
	};

	prototypeAccessors.error.set = function (error) {
		this.$set({ error: error });
		flush();
	};

	prototypeAccessors.loading.get = function () {
		return this.$$.ctx.loading;
	};

	prototypeAccessors.loading.set = function (loading) {
		this.$set({ loading: loading });
		flush();
	};

	prototypeAccessors.base.get = function () {
		return this.$$.ctx.base;
	};

	prototypeAccessors.base.set = function (base) {
		this.$set({ base: base });
		flush();
	};

	Object.defineProperties( Router.prototype, prototypeAccessors );

	return Router;
}(SvelteComponentDev));

export { SvelteComponentDev as a, addLoc as b, createElement as c, detachNode as d, init as e, insert as f, noop as g, safe_not_equal as h, createText as i, flush as j, setData as k, add_binding_callback as l, assign as m, check_outros as n, createComment as o, create_slot as p, get_slot_context as q, group_outros as r, handlePromise as s, mount_component as t, on_outro as u, validate_store as v, getContext as w, writable as x, ROUTER as y, append as z, Router as A, onMount as B };
//# sourceMappingURL=chunk-81217496.js.map
