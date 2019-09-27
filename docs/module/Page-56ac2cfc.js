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
function set_data(text, data) {
    data = '' + data;
    if (text.data !== data)
        { text.data = data; }
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
function add_flush_callback(fn) {
    flush_callbacks.push(fn);
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

function bind(component, name, callback) {
    if (component.$$.props.indexOf(name) === -1)
        { return; }
    component.$$.bound[name] = callback;
    callback(component.$$.ctx[name]);
}
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
        ? instance(component, props, function (key, value) {
            if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                if ($$.bound[key])
                    { $$.bound[key](value); }
                if (ready)
                    { make_dirty(component, key); }
            }
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

var subscriber_queue = [];
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
function writable(value, start) {
    if ( start === void 0 ) start = noop;

    var stop;
    var subscribers = [];
    function set(new_value) {
        if (safe_not_equal(value, new_value)) {
            value = new_value;
            if (stop) { // store is ready
                var run_queue = !subscriber_queue.length;
                for (var i = 0; i < subscribers.length; i += 1) {
                    var s = subscribers[i];
                    s[1]();
                    subscriber_queue.push(s, value);
                }
                if (run_queue) {
                    for (var i$1 = 0; i$1 < subscriber_queue.length; i$1 += 2) {
                        subscriber_queue[i$1][0](subscriber_queue[i$1 + 1]);
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }
    function update(fn) {
        set(fn(value));
    }
    function subscribe(run, invalidate) {
        if ( invalidate === void 0 ) invalidate = noop;

        var subscriber = [run, invalidate];
        subscribers.push(subscriber);
        if (subscribers.length === 1) {
            stop = start(set) || noop;
        }
        run(value);
        return function () {
            var index = subscribers.indexOf(subscriber);
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
            if (subscribers.length === 0) {
                stop();
                stop = null;
            }
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

  var running;

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
    if (running) { return; }
    running = true;
    if (false === options.dispatch) { dispatch = false; }
    if (false === options.decodeURLComponents) { decodeURLComponents = false; }
    if (false !== options.popstate) { window.addEventListener('popstate', onpopstate, false); }
    if (false !== options.click) {
      document.addEventListener(clickEvent, onclick, false);
    }
    if (true === options.hashbang) { hashbang = true; }
    if (!dispatch) { return; }
    var url = (hashbang && ~location.hash.indexOf('#!')) ? location.hash.substr(2) + location.search : location.pathname + location.search + location.hash;
    page.replace(url, null, true, dispatch);
  };

  /**
   * Unbind click and popstate event handlers.
   *
   * @api public
   */

  page.stop = function() {
    if (!running) { return; }
    page.current = '';
    page.len = 0;
    running = false;
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
      current = base + location.hash.replace('#!', '');
    } else {
      current = location.pathname + location.search;
    }

    if (current === ctx.canonicalPath) { return; }
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
        page.show(location.pathname + location.hash, undefined, undefined, false);
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
    if (!hashbang && el.pathname === location.pathname && (el.hash || '#' === link)) { return; }



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
    var origin = location.protocol + '//' + location.hostname;
    if (location.port) { origin += ':' + location.port; }
    return (href && (0 === href.indexOf(origin)));
  }

  page.sameOrigin = sameOrigin;

/* src\Components\Router.html generated by Svelte v3.7.1 */

function create_fragment(ctx) {
	var current;

	var default_slot_template = ctx.$$slots.default;
	var default_slot = create_slot(default_slot_template, ctx, null);

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
			if (default_slot) { default_slot.d(detaching); }
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
		}, 0);
	});

	var writable_props = ['middleware', 'hashbang', 'metadata', 'error', 'loading'];
	Object.keys($$props).forEach(function (key) {
		if (!writable_props.includes(key) && !key.startsWith('$$')) { console.warn(("<Router> was created with unknown prop '" + key + "'")); }
	});

	var $$slots = $$props.$$slots; if ( $$slots === void 0 ) $$slots = {};
	var $$scope = $$props.$$scope;

	$$self.$set = function ($$props) {
		if ('middleware' in $$props) { $$invalidate('middleware', middleware = $$props.middleware); }
		if ('hashbang' in $$props) { $$invalidate('hashbang', hashbang = $$props.hashbang); }
		if ('metadata' in $$props) { $$invalidate('metadata', metadata = $$props.metadata); }
		if ('error' in $$props) { $$invalidate('error', error = $$props.error); }
		if ('loading' in $$props) { $$invalidate('loading', loading = $$props.loading); }
		if ('$$scope' in $$props) { $$invalidate('$$scope', $$scope = $$props.$$scope); }
	};

	return {
		middleware: middleware,
		hashbang: hashbang,
		metadata: metadata,
		error: error,
		loading: loading,
		$$slots: $$slots,
		$$scope: $$scope
	};
}

var Router = /*@__PURE__*/(function (SvelteComponentDev) {
	function Router(options) {
		SvelteComponentDev.call(this, options);
		init(this, options, instance, create_fragment, safe_not_equal, ["middleware", "hashbang", "metadata", "error", "loading"]);
	}

	if ( SvelteComponentDev ) Router.__proto__ = SvelteComponentDev;
	Router.prototype = Object.create( SvelteComponentDev && SvelteComponentDev.prototype );
	Router.prototype.constructor = Router;

	var prototypeAccessors = { middleware: { configurable: true },hashbang: { configurable: true },metadata: { configurable: true },error: { configurable: true },loading: { configurable: true } };

	prototypeAccessors.middleware.get = function () {
		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	};

	prototypeAccessors.middleware.set = function (value) {
		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	};

	prototypeAccessors.hashbang.get = function () {
		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	};

	prototypeAccessors.hashbang.set = function (value) {
		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	};

	prototypeAccessors.metadata.get = function () {
		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	};

	prototypeAccessors.metadata.set = function (value) {
		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	};

	prototypeAccessors.error.get = function () {
		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	};

	prototypeAccessors.error.set = function (value) {
		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	};

	prototypeAccessors.loading.get = function () {
		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	};

	prototypeAccessors.loading.set = function (value) {
		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	};

	Object.defineProperties( Router.prototype, prototypeAccessors );

	return Router;
}(SvelteComponentDev));

/* src\Components\test\Page.html generated by Svelte v3.7.1 */

var file = "src\\Components\\test\\Page.html";

function create_fragment$1(ctx) {
	var h1, t_1, current;

	var default_slot_template = ctx.$$slots.default;
	var default_slot = create_slot(default_slot_template, ctx, null);

	return {
		c: function create() {
			h1 = element("h1");
			h1.textContent = "Page Wrapper";
			t_1 = space();

			if (default_slot) { default_slot.c(); }
			add_location(h1, file, 0, 0, 0);
		},

		l: function claim(nodes) {
			if (default_slot) { default_slot.l(nodes); }
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},

		m: function mount(target, anchor) {
			insert(target, h1, anchor);
			insert(target, t_1, anchor);

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
				detach(h1);
				detach(t_1);
			}

			if (default_slot) { default_slot.d(detaching); }
		}
	};
}

function instance$1($$self, $$props, $$invalidate) {
	var $$slots = $$props.$$slots; if ( $$slots === void 0 ) $$slots = {};
	var $$scope = $$props.$$scope;

	$$self.$set = function ($$props) {
		if ('$$scope' in $$props) { $$invalidate('$$scope', $$scope = $$props.$$scope); }
	};

	return { $$slots: $$slots, $$scope: $$scope };
}

var Page = /*@__PURE__*/(function (SvelteComponentDev) {
	function Page(options) {
		SvelteComponentDev.call(this, options);
		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
	}

	if ( SvelteComponentDev ) Page.__proto__ = SvelteComponentDev;
	Page.prototype = Object.create( SvelteComponentDev && SvelteComponentDev.prototype );
	Page.prototype.constructor = Page;

	return Page;
}(SvelteComponentDev));

export { binding_callbacks as A, bind as B, attr as C, append as D, add_flush_callback as E, Router as F, Page as P, ROUTER as R, SvelteComponentDev as S, add_location as a, insert as b, space as c, detach as d, element as e, set_data as f, globals as g, empty as h, init as i, group_outros as j, transition_out as k, check_outros as l, transition_in as m, noop as n, getContext as o, component_subscribe as p, create_slot as q, get_slot_changes as r, safe_not_equal as s, text as t, get_slot_context as u, validate_store as v, mount_component as w, destroy_component as x, handle_promise as y, assign as z };
//# sourceMappingURL=Page-56ac2cfc.js.map
