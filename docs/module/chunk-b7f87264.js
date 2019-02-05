function noop() {}

function assign(tar, src) {
	for (var k in src) tar[k] = src[k];
	return tar;
}

function isPromise(value) {
	return value && typeof value.then === 'function';
}

function addLoc(element, file, line, column, char) {
	element.__svelte_meta = {
		loc: { file, line, column, char }
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
		throw new Error(`'${name}' is not a store with a 'subscribe' method`);
	}
}

function create_slot(definition, ctx, fn) {
	if (definition) {
		const slot_ctx = get_slot_context(definition, ctx, fn);
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

function setAttribute(node, attribute, value) {
	if (value == null) node.removeAttribute(attribute);
	else node.setAttribute(attribute, value);
}

function children (element) {
	return Array.from(element.childNodes);
}

let outros;

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

let current_component;

function set_current_component(component) {
	current_component = component;
}

function get_current_component() {
	if (!current_component) throw new Error(`Function called outside component initialization`);
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

let dirty_components = [];

let update_scheduled = false;
const binding_callbacks = [];
const render_callbacks = [];

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
	const seen_callbacks = new Set();

	do {
		// first, call beforeUpdate functions
		// and update components
		while (dirty_components.length) {
			const component = dirty_components.shift();
			set_current_component(component);
			update(component.$$);
		}

		while (binding_callbacks.length) binding_callbacks.shift()();

		// then, once components are updated, call
		// afterUpdate functions. This may cause
		// subsequent updates...
		while (render_callbacks.length) {
			const callback = render_callbacks.pop();
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
	Promise.resolve().then(() => {
		if (update_scheduled) callback();
	});
}

function handlePromise(promise, info) {
	var token = info.token = {};

	function update(type, index, key, value) {
		if (info.token !== token) return;

		info.resolved = key && { [key]: value };

		const child_ctx = assign(assign({}, info.ctx), info.resolved);
		const block = type && (info.current = type)(child_ctx);

		if (info.block) {
			if (info.blocks) {
				info.blocks.forEach((block, i) => {
					if (i !== index && block) {
						group_outros();
						on_outro(() => {
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
			if (block.i) block.i();

			flush();
		}

		info.block = block;
		if (info.blocks) info.blocks[index] = block;
	}

	if (isPromise(promise)) {
		promise.then(value => {
			update(info.then, 1, info.value, value);
		}, error => {
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

		info.resolved = { [info.value]: promise };
	}
}

function mount_component(component, target, anchor) {
	const { fragment, on_mount, on_destroy, after_render } = component.$$;

	fragment.m(target, anchor);

	// onMount happens after the initial afterUpdate. Because
	// afterUpdate callbacks happen in reverse order (inner first)
	// we schedule onMount callbacks before afterUpdate callbacks
	add_render_callback(() => {
		const new_on_destroy = on_mount.map(run).filter(is_function);
		if (on_destroy) {
			on_destroy.push(...new_on_destroy);
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
	const parent_component = current_component;
	set_current_component(component);

	const props = options.props || {};

	const $$ = component.$$ = {
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

	let ready = false;

	$$.ctx = instance
		? instance(component, props, (key, value) => {
			if ($$.bound[key]) $$.bound[key](value);

			if ($$.ctx) {
				const changed = not_equal$$1(value, $$.ctx[key]);
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
		if (options.intro && component.$$.fragment.i) component.$$.fragment.i();
		flush();
	}

	set_current_component(parent_component);
}

class SvelteComponent {
	$destroy() {
		destroy(this, true);
		this.$destroy = noop;
	}

	$on(type, callback) {
		const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
		callbacks.push(callback);

		return () => {
			const index = callbacks.indexOf(callback);
			if (index !== -1) callbacks.splice(index, 1);
		};
	}

	$set() {
		// overridden by instance, if it has props
	}
}

class SvelteComponentDev extends SvelteComponent {
	constructor(options) {
		if (!options || (!options.target && !options.$$inline)) {
			throw new Error(`'target' is a required option`);
		}

		super();
	}

	$destroy() {
		super.$destroy();
		this.$destroy = () => {
			console.warn(`Component was already destroyed`);
		};
	}
}

function writable(value) {
	const subscribers = [];

	function set(newValue) {
		if (newValue === value) return;
		value = newValue;
		subscribers.forEach(s => s[1]());
		subscribers.forEach(s => s[0](value));
	}

	function update(fn) {
		set(fn(value));
	}

	function subscribe(run$$1, invalidate = noop) {
		const subscriber = [run$$1, invalidate];
		subscribers.push(subscriber);
		run$$1(value);

		return () => {
			const index = subscribers.indexOf(subscriber);
			if (index !== -1) subscribers.splice(index, 1);
		};
	}

	return { set, update, subscribe };
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

  var location = ('undefined' !== typeof window) && (window.history.location || window.location);

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
    // <callback>
    if ('function' === typeof path) {
      return page('*', path);
    }

    // route <path> to <callback ...>
    if ('function' === typeof fn) {
      var route = new Route(path);
      for (var i = 1; i < arguments.length; ++i) {
        page.callbacks.push(route.middleware(arguments[i]));
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
    if (0 === arguments.length) return base;
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
    if (running$1) return;
    running$1 = true;
    if (false === options.dispatch) dispatch = false;
    if (false === options.decodeURLComponents) decodeURLComponents = false;
    if (false !== options.popstate) window.addEventListener('popstate', onpopstate, false);
    if (false !== options.click) {
      document.addEventListener(clickEvent, onclick, false);
    }
    if (true === options.hashbang) hashbang = true;
    if (!dispatch) return;
    var url = (hashbang && ~location.hash.indexOf('#!')) ? location.hash.substr(2) + location.search : location.pathname + location.search + location.hash;
    page.replace(url, null, true, dispatch);
  };

  /**
   * Unbind click and popstate event handlers.
   *
   * @api public
   */

  page.stop = function() {
    if (!running$1) return;
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
    if (false !== dispatch) page.dispatch(ctx);
    if (false !== ctx.handled && false !== push) ctx.pushState();
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
    if (false !== dispatch) page.dispatch(ctx);
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
      if (!fn) return nextEnter();
      fn(prev, nextExit);
    }

    function nextEnter() {
      var fn = page.callbacks[i++];

      if (ctx.path !== page.current) {
        ctx.handled = false;
        return;
      }
      if (!fn) return unhandled(ctx);
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
    if (ctx.handled) return;
    var current;

    if (hashbang) {
      current = base + location.hash.replace('#!', '');
    } else {
      current = location.pathname + location.search;
    }

    if (current === ctx.canonicalPath) return;
    page.stop();
    ctx.handled = false;
    location.href = ctx.canonicalPath;
  }

  /**
   * Register an exit route on `path` with
   * callback `fn()`, which will be called
   * on the previous context when a new
   * page is visited.
   */
  page.exit = function(path, fn) {
    if (typeof path === 'function') {
      return page.exit('*', path);
    }

    var route = new Route(path);
    for (var i = 1; i < arguments.length; ++i) {
      page.exits.push(route.middleware(arguments[i]));
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
    if ('/' === path[0] && 0 !== path.indexOf(base)) path = base + (hashbang ? '#!' : '') + path;
    var i = path.indexOf('?');

    this.canonicalPath = path;
    this.path = path.replace(base, '') || '/';
    if (hashbang) this.path = this.path.replace('#!', '') || '/';

    this.title = document.title;
    this.state = state || {};
    this.state.path = path;
    this.querystring = ~i ? decodeURLEncodedURIComponent(path.slice(i + 1)) : '';
    this.pathname = decodeURLEncodedURIComponent(~i ? path.slice(0, i) : path);
    this.params = {};

    // fragment
    this.hash = '';
    if (!hashbang) {
      if (!~this.path.indexOf('#')) return;
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
      if (self.match(ctx.path, ctx.params)) return fn(ctx, next);
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

    if (!m) return false;

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
      if (!loaded) return;
      if (e.state) {
        var path = e.state.path;
        page.replace(path, e.state);
      } else {
        page.show(location.pathname + location.hash, undefined, undefined, false);
      }
    };
  })();
  /**
   * Handle "click" events.
   */

  function onclick(e) {

    if (1 !== which(e)) return;

    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (e.defaultPrevented) return;



    // ensure link
    var el = e.target;
    while (el && 'A' !== el.nodeName) el = el.parentNode;
    if (!el || 'A' !== el.nodeName) return;



    // Ignore if tag has
    // 1. "download" attribute
    // 2. rel="external" attribute
    if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') return;

    // ensure non-hash for the same path
    var link = el.getAttribute('href');
    if (!hashbang && el.pathname === location.pathname && (el.hash || '#' === link)) return;



    // Check for mailto: in the href
    if (link && link.indexOf('mailto:') > -1) return;

    // check target
    if (el.target) return;

    // x-origin
    if (!sameOrigin(el.href)) return;



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

    if (hashbang) path = path.replace('#!', '');

    if (base && orig === path) return;

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
    var origin = location.protocol + '//' + location.hostname;
    if (location.port) origin += ':' + location.port;
    return (href && (0 === href.indexOf(origin)));
  }

  page.sameOrigin = sameOrigin;

/* src\Components\Router.html generated by Svelte v3.0.0-alpha20 */

function create_fragment(ctx) {
	const default_slot_1 = ctx.$$slot_default;
	const default_slot = create_slot(default_slot_1, ctx, null);

	return {
		c: function create() {

			if (default_slot) default_slot.c();
		},

		l: function claim(nodes) {
			if (default_slot) default_slot.l(nodes);
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

			if (default_slot) default_slot.d(detach);
		}
	};
}

const ROUTER = { };

function instance($$self, $$props, $$invalidate) {
	
	
	let selectedRoute = writable(null);

	let { hashbang = false } = $$props;

	const routeMiddleware = route => (ctx) => { 
		selectedRoute.set({ctx, route});
	};
	
	setContext(ROUTER, { 
		registerRoute(route) { 
			page_js(route.path, routeMiddleware(route)); 
		}, 
		selectedRoute
	});

	onMount(() => {
		page_js({hashbang}); 
		setTimeout(() => {
		}, 0);
	});

	let { $$slot_default, $$scope } = $$props;

	$$self.$set = $$props => {
		if ('hashbang' in $$props) $$invalidate('hashbang', hashbang = $$props.hashbang);
		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
	};

	return { hashbang, $$slot_default, $$scope };
}

class Router extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance, create_fragment, safe_not_equal);

		const { ctx } = this.$$;
		const props = options.props || {};
		if (ctx.hashbang === undefined && !('hashbang' in props)) {
			console.warn("<Router> was created without expected prop 'hashbang'");
		}
	}

	get hashbang() {
		return this.$$.ctx.hashbang;
	}

	set hashbang(hashbang) {
		this.$set({ hashbang });
		flush();
	}
}

/* src\Components\Route.html generated by Svelte v3.0.0-alpha20 */

const file$1 = "src\\Components\\Route.html";

// (46:0) {#if $selectedRoute && $selectedRoute.route == route}
function create_if_block(ctx) {
	var if_block_anchor;

	function select_block_type(ctx) {
		if (ctx.asyncComponent) return create_if_block_1;
		return create_else_block;
	}

	var current_block_type = select_block_type(ctx);
	var if_block = current_block_type(ctx);

	return {
		c: function create() {
			if_block.c();
			if_block_anchor = createComment();
		},

		m: function mount(target_1, anchor) {
			if_block.m(target_1, anchor);
			insert(target_1, if_block_anchor, anchor);
		},

		p: function update(changed, ctx) {
			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(changed, ctx);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);
				if (if_block) {
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			}
		},

		d: function destroy(detach) {
			if_block.d(detach);

			if (detach) {
				detachNode(if_block_anchor);
			}
		}
	};
}

// (59:1) {:else}
function create_else_block(ctx) {
	const component_slot_1 = ctx.$$slot_component;
	const component_slot = create_slot(component_slot_1, ctx, null);

	return {
		c: function create() {

			if (component_slot) component_slot.c();
		},

		l: function claim(nodes) {
			if (component_slot) component_slot.l(nodes);
		},

		m: function mount(target_1, anchor) {

			if (component_slot) {
				component_slot.m(target_1, anchor);
			}
		},

		p: function update(changed, ctx) {

			if (component_slot && changed.$$scope) {
				component_slot.p(assign(assign({},(changed)), ctx.$$scope.changed), get_slot_context(component_slot_1, ctx, null));
			}
		},

		d: function destroy(detach) {

			if (component_slot) component_slot.d(detach);
		}
	};
}

// (47:1) {#if asyncComponent}
function create_if_block_1(ctx) {
	var promise, text, div;

	let info = {
		ctx,
		current: null,
		pending: create_pending_block,
		then: create_then_block,
		catch: create_catch_block,
		value: 'null',
		error: 'null'
	};

	handlePromise(promise = ctx.componentPromise, info);

	return {
		c: function create() {
			info.block.c();

			text = createText("\n\t\t");
			div = createElement("div");
			addLoc(div, file$1, 57, 2, 1266);
		},

		m: function mount(target_1, anchor) {
			info.block.m(target_1, info.anchor = anchor);
			info.mount = () => text.parentNode;
			info.anchor = text;

			insert(target_1, text, anchor);
			insert(target_1, div, anchor);
			add_binding_callback(() => ctx.div_binding(div, null));
		},

		p: function update(changed, new_ctx) {
			ctx = new_ctx;
			info.ctx = ctx;

			if (('componentPromise' in changed) && promise !== (promise = ctx.componentPromise) && handlePromise(promise, info)) ; else {
				info.block.p(changed, assign(assign({}, ctx), info.resolved));
			}

			if (changed.items) {
				ctx.div_binding(null, div);
				ctx.div_binding(div, null);
			}
		},

		d: function destroy(detach) {
			info.block.d(detach);
			info = null;

			if (detach) {
				detachNode(text);
				detachNode(div);
			}

			ctx.div_binding(null, div);
		}
	};
}

// (53:2) {:catch}
function create_catch_block(ctx) {
	var text;

	const error_slot_1 = ctx.$$slot_error;
	const error_slot = create_slot(error_slot_1, ctx, null);

	return {
		c: function create() {
			if (!error_slot) {
				text = createText("Error!");
			}

			if (error_slot) error_slot.c();
		},

		l: function claim(nodes) {
			if (error_slot) error_slot.l(nodes);
		},

		m: function mount(target_1, anchor) {
			if (!error_slot) {
				insert(target_1, text, anchor);
			}

			else {
				error_slot.m(target_1, anchor);
			}
		},

		p: function update(changed, ctx) {

			if (error_slot && changed.$$scope) {
				error_slot.p(assign(assign({},(changed)), ctx.$$scope.changed), get_slot_context(error_slot_1, ctx, null));
			}
		},

		d: function destroy(detach) {
			if (!error_slot) {
				if (detach) {
					detachNode(text);
				}
			}

			if (error_slot) error_slot.d(detach);
		}
	};
}

// (52:2) {:then}
function create_then_block(ctx) {
	return {
		c: noop,
		m: noop,
		p: noop,
		d: noop
	};
}

// (48:27)     <slot name="loading">     <p>Loading... </p>    </slot>   {:then}
function create_pending_block(ctx) {
	var p;

	const loading_slot_1 = ctx.$$slot_loading;
	const loading_slot = create_slot(loading_slot_1, ctx, null);

	return {
		c: function create() {
			if (!loading_slot) {
				p = createElement("p");
				p.textContent = "Loading...";
			}

			if (loading_slot) loading_slot.c();
			if (!loading_slot) {
				addLoc(p, file$1, 49, 4, 1157);
			}
		},

		l: function claim(nodes) {
			if (loading_slot) loading_slot.l(nodes);
		},

		m: function mount(target_1, anchor) {
			if (!loading_slot) {
				insert(target_1, p, anchor);
			}

			else {
				loading_slot.m(target_1, anchor);
			}
		},

		p: function update(changed, ctx) {

			if (loading_slot && changed.$$scope) {
				loading_slot.p(assign(assign({},(changed)), ctx.$$scope.changed), get_slot_context(loading_slot_1, ctx, null));
			}
		},

		d: function destroy(detach) {
			if (!loading_slot) {
				if (detach) {
					detachNode(p);
				}
			}

			if (loading_slot) loading_slot.d(detach);
		}
	};
}

function create_fragment$1(ctx) {
	var if_block_anchor;

	var if_block = (ctx.$selectedRoute && ctx.$selectedRoute.route == ctx.route) && create_if_block(ctx);

	return {
		c: function create() {
			if (if_block) if_block.c();
			if_block_anchor = createComment();
		},

		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},

		m: function mount(target_1, anchor) {
			if (if_block) if_block.m(target_1, anchor);
			insert(target_1, if_block_anchor, anchor);
		},

		p: function update(changed, ctx) {
			if (ctx.$selectedRoute && ctx.$selectedRoute.route == ctx.route) {
				if (if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block = create_if_block(ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},

		i: noop,
		o: noop,

		d: function destroy(detach) {
			if (if_block) if_block.d(detach);

			if (detach) {
				detachNode(if_block_anchor);
			}
		}
	};
}

const ROUTE = { };

function instance$1($$self, $$props, $$invalidate) {
	

	const { registerRoute, selectedRoute } = getContext(ROUTER);

	let { path, asyncComponent = null } = $$props;

	const route = { path, asyncComponent, ctx: { } };

	let componentPromise; 
	let target;

	setContext(ROUTE, route);
	
	registerRoute(route);
	selectedRoute.subscribe(selected => {
		if(!selected) return;
		route.ctx = selected.ctx; $$invalidate('route', route);
		if(asyncComponent && selected && selected.route == route) {
			componentPromise = Promise.all([
				asyncComponent(), 
				// todo: optionally fetch data/props concurrently with component import?
			])
			.then(([{default: Component}, props]) => {
				return new Component({
					target
				});
			}); $$invalidate('componentPromise', componentPromise);
			// .catch(err => {
			// 	console.log('Todo: handle error with generic/specific handler:\n', err)
			// 	trow err;
			// }); 
		}
	});

	let { $$slot_loading, $$slot_error, $$slot_component, $$scope } = $$props;

	function div_binding($$node, check) {
		target = $$node;
		$$invalidate('target', target);
	}

	let $selectedRoute;
	validate_store(selectedRoute, 'selectedRoute');
	$$self.$$.on_destroy.push(selectedRoute.subscribe($$value => { $selectedRoute = $$value; $$invalidate('$selectedRoute', $selectedRoute); }));

	$$self.$set = $$props => {
		if ('path' in $$props) $$invalidate('path', path = $$props.path);
		if ('asyncComponent' in $$props) $$invalidate('asyncComponent', asyncComponent = $$props.asyncComponent);
		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
	};

	return {
		path,
		asyncComponent,
		route,
		componentPromise,
		target,
		div_binding,
		$selectedRoute,
		$$slot_loading,
		$$slot_error,
		$$slot_component,
		$$scope
	};
}

class Route$1 extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$1, create_fragment$1, safe_not_equal);

		const { ctx } = this.$$;
		const props = options.props || {};
		if (ctx.path === undefined && !('path' in props)) {
			console.warn("<Route> was created without expected prop 'path'");
		}
		if (ctx.asyncComponent === undefined && !('asyncComponent' in props)) {
			console.warn("<Route> was created without expected prop 'asyncComponent'");
		}
	}

	get path() {
		return this.$$.ctx.path;
	}

	set path(path) {
		this.$set({ path });
		flush();
	}

	get asyncComponent() {
		return this.$$.ctx.asyncComponent;
	}

	set asyncComponent(asyncComponent) {
		this.$set({ asyncComponent });
		flush();
	}
}

export { SvelteComponentDev as a, addLoc as b, append as c, createElement as d, createText as e, detachNode as f, init as g, insert as h, noop as i, safe_not_equal as j, getContext as k, ROUTE as l, mount_component as m, setAttribute as n, Router as o, Route$1 as p };
//# sourceMappingURL=chunk-b7f87264.js.map
