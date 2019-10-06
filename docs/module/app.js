import { s as safe_not_equal, n as noop, S as SvelteComponentDev, i as init, d as dispatch_dev, c as create_slot, a as setContext, o as onMount, g as get_slot_changes, b as get_slot_context, t as transition_in, e as transition_out, f as element, h as add_location, j as insert_dev, k as detach_dev, l as globals, m as space, p as text, q as set_data_dev, r as getContext, v as validate_store, u as component_subscribe, w as empty, x as group_outros, y as check_outros, z as binding_callbacks, A as handle_promise, B as mount_component, C as destroy_component, D as assign, P as Page$1, E as attr_dev, F as append_dev } from './Page-16fd0467.js';

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

var isarray = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

/**
 * Expose `pathToRegexp`.
 */
var pathToRegexp_1 = pathToRegexp;
var parse_1 = parse;
var compile_1 = compile;
var tokensToFunction_1 = tokensToFunction;
var tokensToRegExp_1 = tokensToRegExp;

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
].join('|'), 'g');

/**
 * Parse a string for the raw tokens.
 *
 * @param  {String} str
 * @return {Array}
 */
function parse (str) {
  var tokens = [];
  var key = 0;
  var index = 0;
  var path = '';
  var res;

  while ((res = PATH_REGEXP.exec(str)) != null) {
    var m = res[0];
    var escaped = res[1];
    var offset = res.index;
    path += str.slice(index, offset);
    index = offset + m.length;

    // Ignore already escaped sequences.
    if (escaped) {
      path += escaped[1];
      continue
    }

    // Push the current path onto the tokens.
    if (path) {
      tokens.push(path);
      path = '';
    }

    var prefix = res[2];
    var name = res[3];
    var capture = res[4];
    var group = res[5];
    var suffix = res[6];
    var asterisk = res[7];

    var repeat = suffix === '+' || suffix === '*';
    var optional = suffix === '?' || suffix === '*';
    var delimiter = prefix || '/';
    var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?');

    tokens.push({
      name: name || key++,
      prefix: prefix || '',
      delimiter: delimiter,
      optional: optional,
      repeat: repeat,
      pattern: escapeGroup(pattern)
    });
  }

  // Match any characters still remaining.
  if (index < str.length) {
    path += str.substr(index);
  }

  // If the path exists, push it onto the end.
  if (path) {
    tokens.push(path);
  }

  return tokens
}

/**
 * Compile a string to a template function for the path.
 *
 * @param  {String}   str
 * @return {Function}
 */
function compile (str) {
  return tokensToFunction(parse(str))
}

/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction (tokens) {
  // Compile all the tokens into regexps.
  var matches = new Array(tokens.length);

  // Compile all the patterns before compilation.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] === 'object') {
      matches[i] = new RegExp('^' + tokens[i].pattern + '$');
    }
  }

  return function (obj) {
    var path = '';
    var data = obj || {};

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];

      if (typeof token === 'string') {
        path += token;

        continue
      }

      var value = data[token.name];
      var segment;

      if (value == null) {
        if (token.optional) {
          continue
        } else {
          throw new TypeError('Expected "' + token.name + '" to be defined')
        }
      }

      if (isarray(value)) {
        if (!token.repeat) {
          throw new TypeError('Expected "' + token.name + '" to not repeat, but received "' + value + '"')
        }

        if (value.length === 0) {
          if (token.optional) {
            continue
          } else {
            throw new TypeError('Expected "' + token.name + '" to not be empty')
          }
        }

        for (var j = 0; j < value.length; j++) {
          segment = encodeURIComponent(value[j]);

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
          }

          path += (j === 0 ? token.prefix : token.delimiter) + segment;
        }

        continue
      }

      segment = encodeURIComponent(value);

      if (!matches[i].test(segment)) {
        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
      }

      path += token.prefix + segment;
    }

    return path
  }
}

/**
 * Escape a regular expression string.
 *
 * @param  {String} str
 * @return {String}
 */
function escapeString (str) {
  return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1')
}

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {String} group
 * @return {String}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$\/()])/g, '\\$1')
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {RegExp} re
 * @param  {Array}  keys
 * @return {RegExp}
 */
function attachKeys (re, keys) {
  re.keys = keys;
  return re
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {String}
 */
function flags (options) {
  return options.sensitive ? '' : 'i'
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {RegExp} path
 * @param  {Array}  keys
 * @return {RegExp}
 */
function regexpToRegexp (path, keys) {
  // Use a negative lookahead to match only capturing groups.
  var groups = path.source.match(/\((?!\?)/g);

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        prefix: null,
        delimiter: null,
        optional: false,
        repeat: false,
        pattern: null
      });
    }
  }

  return attachKeys(path, keys)
}

/**
 * Transform an array into a regexp.
 *
 * @param  {Array}  path
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function arrayToRegexp (path, keys, options) {
  var parts = [];

  for (var i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source);
  }

  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));

  return attachKeys(regexp, keys)
}

/**
 * Create a path regexp from string input.
 *
 * @param  {String} path
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function stringToRegexp (path, keys, options) {
  var tokens = parse(path);
  var re = tokensToRegExp(tokens, options);

  // Attach keys back to the regexp.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] !== 'string') {
      keys.push(tokens[i]);
    }
  }

  return attachKeys(re, keys)
}

/**
 * Expose a function for taking tokens and returning a RegExp.
 *
 * @param  {Array}  tokens
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function tokensToRegExp (tokens, options) {
  options = options || {};

  var strict = options.strict;
  var end = options.end !== false;
  var route = '';
  var lastToken = tokens[tokens.length - 1];
  var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken);

  // Iterate over the tokens and create our regexp string.
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];

    if (typeof token === 'string') {
      route += escapeString(token);
    } else {
      var prefix = escapeString(token.prefix);
      var capture = token.pattern;

      if (token.repeat) {
        capture += '(?:' + prefix + capture + ')*';
      }

      if (token.optional) {
        if (prefix) {
          capture = '(?:' + prefix + '(' + capture + '))?';
        } else {
          capture = '(' + capture + ')?';
        }
      } else {
        capture = prefix + '(' + capture + ')';
      }

      route += capture;
    }
  }

  // In non-strict mode we allow a slash at the end of match. If the path to
  // match already ends with a slash, we remove it for consistency. The slash
  // is valid at the end of a path match, not in the middle. This is important
  // in non-ending mode, where "/test/" shouldn't match "/test//route".
  if (!strict) {
    route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?';
  }

  if (end) {
    route += '$';
  } else {
    // In non-ending mode, we need the capturing groups to match as much as
    // possible by using a positive lookahead to the end or next path segment.
    route += strict && endsWithSlash ? '' : '(?=\\/|$)';
  }

  return new RegExp('^' + route, flags(options))
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(String|RegExp|Array)} path
 * @param  {Array}                 [keys]
 * @param  {Object}                [options]
 * @return {RegExp}
 */
function pathToRegexp (path, keys, options) {
  keys = keys || [];

  if (!isarray(keys)) {
    options = keys;
    keys = [];
  } else if (!options) {
    options = {};
  }

  if (path instanceof RegExp) {
    return regexpToRegexp(path, keys)
  }

  if (isarray(path)) {
    return arrayToRegexp(path, keys, options)
  }

  return stringToRegexp(path, keys, options)
}

pathToRegexp_1.parse = parse_1;
pathToRegexp_1.compile = compile_1;
pathToRegexp_1.tokensToFunction = tokensToFunction_1;
pathToRegexp_1.tokensToRegExp = tokensToRegExp_1;

/**
   * Module dependencies.
   */

  

  /**
   * Short-cuts for global-object checks
   */

  var hasDocument = ('undefined' !== typeof document);
  var hasWindow = ('undefined' !== typeof window);
  var hasHistory = ('undefined' !== typeof history);
  var hasProcess = typeof process !== 'undefined';

  /**
   * Detect click event
   */
  var clickEvent = hasDocument && document.ontouchstart ? 'touchstart' : 'click';

  /**
   * To work properly with the URL
   * history.location generated polyfill in https://github.com/devote/HTML5-History-API
   */

  var isLocation = hasWindow && !!(window.history.location || window.location);

  /**
   * The page instance
   * @api private
   */
  function Page() {
    // public things
    this.callbacks = [];
    this.exits = [];
    this.current = '';
    this.len = 0;

    // private things
    this._decodeURLComponents = true;
    this._base = '';
    this._strict = false;
    this._running = false;
    this._hashbang = false;

    // bound functions
    this.clickHandler = this.clickHandler.bind(this);
    this._onpopstate = this._onpopstate.bind(this);
  }

  /**
   * Configure the instance of page. This can be called multiple times.
   *
   * @param {Object} options
   * @api public
   */

  Page.prototype.configure = function(options) {
    var opts = options || {};

    this._window = opts.window || (hasWindow && window);
    this._decodeURLComponents = opts.decodeURLComponents !== false;
    this._popstate = opts.popstate !== false && hasWindow;
    this._click = opts.click !== false && hasDocument;
    this._hashbang = !!opts.hashbang;

    var _window = this._window;
    if(this._popstate) {
      _window.addEventListener('popstate', this._onpopstate, false);
    } else if(hasWindow) {
      _window.removeEventListener('popstate', this._onpopstate, false);
    }

    if (this._click) {
      _window.document.addEventListener(clickEvent, this.clickHandler, false);
    } else if(hasDocument) {
      _window.document.removeEventListener(clickEvent, this.clickHandler, false);
    }

    if(this._hashbang && hasWindow && !hasHistory) {
      _window.addEventListener('hashchange', this._onpopstate, false);
    } else if(hasWindow) {
      _window.removeEventListener('hashchange', this._onpopstate, false);
    }
  };

  /**
   * Get or set basepath to `path`.
   *
   * @param {string} path
   * @api public
   */

  Page.prototype.base = function(path) {
    if (0 === arguments.length) { return this._base; }
    this._base = path;
  };

  /**
   * Gets the `base`, which depends on whether we are using History or
   * hashbang routing.

   * @api private
   */
  Page.prototype._getBase = function() {
    var base = this._base;
    if(!!base) { return base; }
    var loc = hasWindow && this._window && this._window.location;

    if(hasWindow && this._hashbang && loc && loc.protocol === 'file:') {
      base = loc.pathname;
    }

    return base;
  };

  /**
   * Get or set strict path matching to `enable`
   *
   * @param {boolean} enable
   * @api public
   */

  Page.prototype.strict = function(enable) {
    if (0 === arguments.length) { return this._strict; }
    this._strict = enable;
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

  Page.prototype.start = function(options) {
    var opts = options || {};
    this.configure(opts);

    if (false === opts.dispatch) { return; }
    this._running = true;

    var url;
    if(isLocation) {
      var window = this._window;
      var loc = window.location;

      if(this._hashbang && ~loc.hash.indexOf('#!')) {
        url = loc.hash.substr(2) + loc.search;
      } else if (this._hashbang) {
        url = loc.search + loc.hash;
      } else {
        url = loc.pathname + loc.search + loc.hash;
      }
    }

    this.replace(url, null, true, opts.dispatch);
  };

  /**
   * Unbind click and popstate event handlers.
   *
   * @api public
   */

  Page.prototype.stop = function() {
    if (!this._running) { return; }
    this.current = '';
    this.len = 0;
    this._running = false;

    var window = this._window;
    this._click && window.document.removeEventListener(clickEvent, this.clickHandler, false);
    hasWindow && window.removeEventListener('popstate', this._onpopstate, false);
    hasWindow && window.removeEventListener('hashchange', this._onpopstate, false);
  };

  /**
   * Show `path` with optional `state` object.
   *
   * @param {string} path
   * @param {Object=} state
   * @param {boolean=} dispatch
   * @param {boolean=} push
   * @return {!Context}
   * @api public
   */

  Page.prototype.show = function(path, state, dispatch, push) {
    var ctx = new Context(path, state, this),
      prev = this.prevContext;
    this.prevContext = ctx;
    this.current = ctx.path;
    if (false !== dispatch) { this.dispatch(ctx, prev); }
    if (false !== ctx.handled && false !== push) { ctx.pushState(); }
    return ctx;
  };

  /**
   * Goes back in the history
   * Back should always let the current route push state and then go back.
   *
   * @param {string} path - fallback path to go back if no more history exists, if undefined defaults to page.base
   * @param {Object=} state
   * @api public
   */

  Page.prototype.back = function(path, state) {
    var page = this;
    if (this.len > 0) {
      var window = this._window;
      // this may need more testing to see if all browsers
      // wait for the next tick to go back in history
      hasHistory && window.history.back();
      this.len--;
    } else if (path) {
      setTimeout(function() {
        page.show(path, state);
      });
    } else {
      setTimeout(function() {
        page.show(page._getBase(), state);
      });
    }
  };

  /**
   * Register route to redirect from one path to other
   * or just redirect to another route
   *
   * @param {string} from - if param 'to' is undefined redirects to 'from'
   * @param {string=} to
   * @api public
   */
  Page.prototype.redirect = function(from, to) {
    var inst = this;

    // Define route from a path to another
    if ('string' === typeof from && 'string' === typeof to) {
      page.call(this, from, function(e) {
        setTimeout(function() {
          inst.replace(/** @type {!string} */ (to));
        }, 0);
      });
    }

    // Wait for the push state and replace it with another
    if ('string' === typeof from && 'undefined' === typeof to) {
      setTimeout(function() {
        inst.replace(from);
      }, 0);
    }
  };

  /**
   * Replace `path` with optional `state` object.
   *
   * @param {string} path
   * @param {Object=} state
   * @param {boolean=} init
   * @param {boolean=} dispatch
   * @return {!Context}
   * @api public
   */


  Page.prototype.replace = function(path, state, init, dispatch) {
    var ctx = new Context(path, state, this),
      prev = this.prevContext;
    this.prevContext = ctx;
    this.current = ctx.path;
    ctx.init = init;
    ctx.save(); // save before dispatching, which may redirect
    if (false !== dispatch) { this.dispatch(ctx, prev); }
    return ctx;
  };

  /**
   * Dispatch the given `ctx`.
   *
   * @param {Context} ctx
   * @api private
   */

  Page.prototype.dispatch = function(ctx, prev) {
    var i = 0, j = 0, page = this;

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
      if (!fn) { return unhandled.call(page, ctx); }
      fn(ctx, nextEnter);
    }

    if (prev) {
      nextExit();
    } else {
      nextEnter();
    }
  };

  /**
   * Register an exit route on `path` with
   * callback `fn()`, which will be called
   * on the previous context when a new
   * page is visited.
   */
  Page.prototype.exit = function(path, fn) {
    var arguments$1 = arguments;

    if (typeof path === 'function') {
      return this.exit('*', path);
    }

    var route = new Route(path, null, this);
    for (var i = 1; i < arguments.length; ++i) {
      this.exits.push(route.middleware(arguments$1[i]));
    }
  };

  /**
   * Handle "click" events.
   */

  /* jshint +W054 */
  Page.prototype.clickHandler = function(e) {
    if (1 !== this._which(e)) { return; }

    if (e.metaKey || e.ctrlKey || e.shiftKey) { return; }
    if (e.defaultPrevented) { return; }

    // ensure link
    // use shadow dom when available if not, fall back to composedPath()
    // for browsers that only have shady
    var el = e.target;
    var eventPath = e.path || (e.composedPath ? e.composedPath() : null);

    if(eventPath) {
      for (var i = 0; i < eventPath.length; i++) {
        if (!eventPath[i].nodeName) { continue; }
        if (eventPath[i].nodeName.toUpperCase() !== 'A') { continue; }
        if (!eventPath[i].href) { continue; }

        el = eventPath[i];
        break;
      }
    }

    // continue ensure link
    // el.nodeName for svg links are 'a' instead of 'A'
    while (el && 'A' !== el.nodeName.toUpperCase()) { el = el.parentNode; }
    if (!el || 'A' !== el.nodeName.toUpperCase()) { return; }

    // check if link is inside an svg
    // in this case, both href and target are always inside an object
    var svg = (typeof el.href === 'object') && el.href.constructor.name === 'SVGAnimatedString';

    // Ignore if tag has
    // 1. "download" attribute
    // 2. rel="external" attribute
    if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') { return; }

    // ensure non-hash for the same path
    var link = el.getAttribute('href');
    if(!this._hashbang && this._samePath(el) && (el.hash || '#' === link)) { return; }

    // Check for mailto: in the href
    if (link && link.indexOf('mailto:') > -1) { return; }

    // check target
    // svg target is an object and its desired value is in .baseVal property
    if (svg ? el.target.baseVal : el.target) { return; }

    // x-origin
    // note: svg links that are not relative don't call click events (and skip page.js)
    // consequently, all svg links tested inside page.js are relative and in the same origin
    if (!svg && !this.sameOrigin(el.href)) { return; }

    // rebuild path
    // There aren't .pathname and .search properties in svg links, so we use href
    // Also, svg href is an object and its desired value is in .baseVal property
    var path = svg ? el.href.baseVal : (el.pathname + el.search + (el.hash || ''));

    path = path[0] !== '/' ? '/' + path : path;

    // strip leading "/[drive letter]:" on NW.js on Windows
    if (hasProcess && path.match(/^\/[a-zA-Z]:\//)) {
      path = path.replace(/^\/[a-zA-Z]:\//, '/');
    }

    // same page
    var orig = path;
    var pageBase = this._getBase();

    if (path.indexOf(pageBase) === 0) {
      path = path.substr(pageBase.length);
    }

    if (this._hashbang) { path = path.replace('#!', ''); }

    if (pageBase && orig === path && (!isLocation || this._window.location.protocol !== 'file:')) {
      return;
    }

    e.preventDefault();
    this.show(orig);
  };

  /**
   * Handle "populate" events.
   * @api private
   */

  Page.prototype._onpopstate = (function () {
    var loaded = false;
    if ( ! hasWindow ) {
      return function () {};
    }
    if (hasDocument && document.readyState === 'complete') {
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
      var page = this;
      if (e.state) {
        var path = e.state.path;
        page.replace(path, e.state);
      } else if (isLocation) {
        var loc = page._window.location;
        page.show(loc.pathname + loc.search + loc.hash, undefined, undefined, false);
      }
    };
  })();

  /**
   * Event button.
   */
  Page.prototype._which = function(e) {
    e = e || (hasWindow && this._window.event);
    return null == e.which ? e.button : e.which;
  };

  /**
   * Convert to a URL object
   * @api private
   */
  Page.prototype._toURL = function(href) {
    var window = this._window;
    if(typeof URL === 'function' && isLocation) {
      return new URL(href, window.location.toString());
    } else if (hasDocument) {
      var anc = window.document.createElement('a');
      anc.href = href;
      return anc;
    }
  };

  /**
   * Check if `href` is the same origin.
   * @param {string} href
   * @api public
   */

  Page.prototype.sameOrigin = function(href) {
    if(!href || !isLocation) { return false; }

    var url = this._toURL(href);
    var window = this._window;

    var loc = window.location;
    return loc.protocol === url.protocol &&
      loc.hostname === url.hostname &&
      loc.port === url.port;
  };

  /**
   * @api private
   */
  Page.prototype._samePath = function(url) {
    if(!isLocation) { return false; }
    var window = this._window;
    var loc = window.location;
    return url.pathname === loc.pathname &&
      url.search === loc.search;
  };

  /**
   * Remove URL encoding from the given `str`.
   * Accommodates whitespace in both x-www-form-urlencoded
   * and regular percent-encoded form.
   *
   * @param {string} val - URL component to decode
   * @api private
   */
  Page.prototype._decodeURLEncodedURIComponent = function(val) {
    if (typeof val !== 'string') { return val; }
    return this._decodeURLComponents ? decodeURIComponent(val.replace(/\+/g, ' ')) : val;
  };

  /**
   * Create a new `page` instance and function
   */
  function createPage() {
    var pageInstance = new Page();

    function pageFn(/* args */) {
      return page.apply(pageInstance, arguments);
    }

    // Copy all of the things over. In 2.0 maybe we use setPrototypeOf
    pageFn.callbacks = pageInstance.callbacks;
    pageFn.exits = pageInstance.exits;
    pageFn.base = pageInstance.base.bind(pageInstance);
    pageFn.strict = pageInstance.strict.bind(pageInstance);
    pageFn.start = pageInstance.start.bind(pageInstance);
    pageFn.stop = pageInstance.stop.bind(pageInstance);
    pageFn.show = pageInstance.show.bind(pageInstance);
    pageFn.back = pageInstance.back.bind(pageInstance);
    pageFn.redirect = pageInstance.redirect.bind(pageInstance);
    pageFn.replace = pageInstance.replace.bind(pageInstance);
    pageFn.dispatch = pageInstance.dispatch.bind(pageInstance);
    pageFn.exit = pageInstance.exit.bind(pageInstance);
    pageFn.configure = pageInstance.configure.bind(pageInstance);
    pageFn.sameOrigin = pageInstance.sameOrigin.bind(pageInstance);
    pageFn.clickHandler = pageInstance.clickHandler.bind(pageInstance);

    pageFn.create = createPage;

    Object.defineProperty(pageFn, 'len', {
      get: function(){
        return pageInstance.len;
      },
      set: function(val) {
        pageInstance.len = val;
      }
    });

    Object.defineProperty(pageFn, 'current', {
      get: function(){
        return pageInstance.current;
      },
      set: function(val) {
        pageInstance.current = val;
      }
    });

    // In 2.0 these can be named exports
    pageFn.Context = Context;
    pageFn.Route = Route;

    return pageFn;
  }

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
   * @param {string|!Function|!Object} path
   * @param {Function=} fn
   * @api public
   */

  function page(path, fn) {
    var arguments$1 = arguments;

    // <callback>
    if ('function' === typeof path) {
      return page.call(this, '*', path);
    }

    // route <path> to <callback ...>
    if ('function' === typeof fn) {
      var route = new Route(/** @type {string} */ (path), null, this);
      for (var i = 1; i < arguments.length; ++i) {
        this.callbacks.push(route.middleware(arguments$1[i]));
      }
      // show <path> with [state]
    } else if ('string' === typeof path) {
      this['string' === typeof fn ? 'redirect' : 'show'](path, fn);
      // start [options]
    } else {
      this.start(path);
    }
  }

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
    var page = this;
    var window = page._window;

    if (page._hashbang) {
      current = isLocation && this._getBase() + window.location.hash.replace('#!', '');
    } else {
      current = isLocation && window.location.pathname + window.location.search;
    }

    if (current === ctx.canonicalPath) { return; }
    page.stop();
    ctx.handled = false;
    isLocation && (window.location.href = ctx.canonicalPath);
  }

  /**
   * Escapes RegExp characters in the given string.
   *
   * @param {string} s
   * @api private
   */
  function escapeRegExp(s) {
    return s.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
  }

  /**
   * Initialize a new "request" `Context`
   * with the given `path` and optional initial `state`.
   *
   * @constructor
   * @param {string} path
   * @param {Object=} state
   * @api public
   */

  function Context(path, state, pageInstance) {
    var _page = this.page = pageInstance || page;
    var window = _page._window;
    var hashbang = _page._hashbang;

    var pageBase = _page._getBase();
    if ('/' === path[0] && 0 !== path.indexOf(pageBase)) { path = pageBase + (hashbang ? '#!' : '') + path; }
    var i = path.indexOf('?');

    this.canonicalPath = path;
    var re = new RegExp('^' + escapeRegExp(pageBase));
    this.path = path.replace(re, '') || '/';
    if (hashbang) { this.path = this.path.replace('#!', '') || '/'; }

    this.title = (hasDocument && window.document.title);
    this.state = state || {};
    this.state.path = path;
    this.querystring = ~i ? _page._decodeURLEncodedURIComponent(path.slice(i + 1)) : '';
    this.pathname = _page._decodeURLEncodedURIComponent(~i ? path.slice(0, i) : path);
    this.params = {};

    // fragment
    this.hash = '';
    if (!hashbang) {
      if (!~this.path.indexOf('#')) { return; }
      var parts = this.path.split('#');
      this.path = this.pathname = parts[0];
      this.hash = _page._decodeURLEncodedURIComponent(parts[1]) || '';
      this.querystring = this.querystring.split('#')[0];
    }
  }

  /**
   * Push state.
   *
   * @api private
   */

  Context.prototype.pushState = function() {
    var page = this.page;
    var window = page._window;
    var hashbang = page._hashbang;

    page.len++;
    if (hasHistory) {
        window.history.pushState(this.state, this.title,
          hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
    }
  };

  /**
   * Save the context state.
   *
   * @api public
   */

  Context.prototype.save = function() {
    var page = this.page;
    if (hasHistory) {
        page._window.history.replaceState(this.state, this.title,
          page._hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
    }
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
   * @constructor
   * @param {string} path
   * @param {Object=} options
   * @api private
   */

  function Route(path, options, page) {
    var _page = this.page = page || globalPage;
    var opts = options || {};
    opts.strict = opts.strict || page._strict;
    this.path = (path === '*') ? '(.*)' : path;
    this.method = 'GET';
    this.regexp = pathToRegexp_1(this.path, this.keys = [], opts);
  }

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
   * @param {string} path
   * @param {Object} params
   * @return {boolean}
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
      var val = this.page._decodeURLEncodedURIComponent(m[i]);
      if (val !== undefined || !(hasOwnProperty.call(params, key.name))) {
        params[key.name] = val;
      }
    }

    return true;
  };


  /**
   * Module exports.
   */

  var globalPage = createPage();
  var page_js = globalPage;
  var default_1 = globalPage;

page_js.default = default_1;

/* src\Components\Router.svelte generated by Svelte v3.12.1 */

function create_fragment(ctx) {
	var current;

	var default_slot_template = ctx.$$slots.default;
	var default_slot = create_slot(default_slot_template, ctx, null);

	var block = {
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
	dispatch_dev("SvelteRegisterBlock", { block: block, id: create_fragment.name, type: "component", source: "", ctx: ctx });
	return block;
}

function instance($$self, $$props, $$invalidate) {
	
	
	var selectedRoute = writable(null);

	var middleware = $$props.middleware; if ( middleware === void 0 ) middleware = [];
	var hashbang = $$props.hashbang; if ( hashbang === void 0 ) hashbang = false;
	var metadata = $$props.metadata; if ( metadata === void 0 ) metadata = { };
	var error = $$props.error; if ( error === void 0 ) error = null;
	var loading = $$props.loading; if ( loading === void 0 ) loading = null;

	var customizeCtx = function (ref) {
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
	
	setContext('ROUTER', { 
		registerRoute: function registerRoute(route) { 
			page_js.apply(
				void 0, [ route.path, 	
				customizeCtx(route) ].concat( middleware, 
				route.middleware,
				[routeMiddleware(route)] )
			); 
		}, 
		error: error,
		loading: loading,
		selectedRoute: selectedRoute
	});

	onMount(function () {
		page_js({});
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

	$$self.$capture_state = function () {
		return { selectedRoute: selectedRoute, middleware: middleware, hashbang: hashbang, metadata: metadata, error: error, loading: loading };
	};

	$$self.$inject_state = function ($$props) {
		if ('selectedRoute' in $$props) { selectedRoute = $$props.selectedRoute; }
		if ('middleware' in $$props) { $$invalidate('middleware', middleware = $$props.middleware); }
		if ('hashbang' in $$props) { $$invalidate('hashbang', hashbang = $$props.hashbang); }
		if ('metadata' in $$props) { $$invalidate('metadata', metadata = $$props.metadata); }
		if ('error' in $$props) { $$invalidate('error', error = $$props.error); }
		if ('loading' in $$props) { $$invalidate('loading', loading = $$props.loading); }
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
		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Router", options: options, id: create_fragment.name });
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

/* src\Components\Loading.svelte generated by Svelte v3.12.1 */

var file = "src\\Components\\Loading.svelte";

function create_fragment$1(ctx) {
	var p;

	var block = {
		c: function create() {
			p = element("p");
			p.textContent = "Loading...";
			add_location(p, file, 0, 0, 0);
		},

		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},

		m: function mount(target, anchor) {
			insert_dev(target, p, anchor);
		},

		p: noop,
		i: noop,
		o: noop,

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(p);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block: block, id: create_fragment$1.name, type: "component", source: "", ctx: ctx });
	return block;
}

var Loading = /*@__PURE__*/(function (SvelteComponentDev) {
	function Loading(options) {
		SvelteComponentDev.call(this, options);
		init(this, options, null, create_fragment$1, safe_not_equal, []);
		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Loading", options: options, id: create_fragment$1.name });
	}

	if ( SvelteComponentDev ) Loading.__proto__ = SvelteComponentDev;
	Loading.prototype = Object.create( SvelteComponentDev && SvelteComponentDev.prototype );
	Loading.prototype.constructor = Loading;

	return Loading;
}(SvelteComponentDev));

/* src\Components\Error.svelte generated by Svelte v3.12.1 */
var Error_1 = globals.Error;

var file$1 = "src\\Components\\Error.svelte";

function create_fragment$2(ctx) {
	var h1, t1, p, t3, t4;

	var block = {
		c: function create() {
			h1 = element("h1");
			h1.textContent = "ERROR!";
			t1 = space();
			p = element("p");
			p.textContent = "Error:";
			t3 = space();
			t4 = text(ctx.error);
			add_location(h1, file$1, 4, 0, 51);
			add_location(p, file$1, 6, 0, 70);
		},

		l: function claim(nodes) {
			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},

		m: function mount(target, anchor) {
			insert_dev(target, h1, anchor);
			insert_dev(target, t1, anchor);
			insert_dev(target, p, anchor);
			insert_dev(target, t3, anchor);
			insert_dev(target, t4, anchor);
		},

		p: function update(changed, ctx) {
			if (changed.error) {
				set_data_dev(t4, ctx.error);
			}
		},

		i: noop,
		o: noop,

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(h1);
				detach_dev(t1);
				detach_dev(p);
				detach_dev(t3);
				detach_dev(t4);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block: block, id: create_fragment$2.name, type: "component", source: "", ctx: ctx });
	return block;
}

function instance$1($$self, $$props, $$invalidate) {
	var error = $$props.error; if ( error === void 0 ) error = null;

	var writable_props = ['error'];
	Object.keys($$props).forEach(function (key) {
		if (!writable_props.includes(key) && !key.startsWith('$$')) { console.warn(("<Error> was created with unknown prop '" + key + "'")); }
	});

	$$self.$set = function ($$props) {
		if ('error' in $$props) { $$invalidate('error', error = $$props.error); }
	};

	$$self.$capture_state = function () {
		return { error: error };
	};

	$$self.$inject_state = function ($$props) {
		if ('error' in $$props) { $$invalidate('error', error = $$props.error); }
	};

	return { error: error };
}

var Error$1 = /*@__PURE__*/(function (SvelteComponentDev) {
	function Error(options) {
		SvelteComponentDev.call(this, options);
		init(this, options, instance$1, create_fragment$2, safe_not_equal, ["error"]);
		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Error", options: options, id: create_fragment$2.name });
	}

	if ( SvelteComponentDev ) Error.__proto__ = SvelteComponentDev;
	Error.prototype = Object.create( SvelteComponentDev && SvelteComponentDev.prototype );
	Error.prototype.constructor = Error;

	var prototypeAccessors = { error: { configurable: true } };

	prototypeAccessors.error.get = function () {
		throw new Error_1("<Error>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	};

	prototypeAccessors.error.set = function (value) {
		throw new Error_1("<Error>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	};

	Object.defineProperties( Error.prototype, prototypeAccessors );

	return Error;
}(SvelteComponentDev));

/* src\Components\Route.svelte generated by Svelte v3.12.1 */

var file$2 = "src\\Components\\Route.svelte";

// (57:0) {#if $selectedRoute && $selectedRoute.route == route}
function create_if_block(ctx) {
	var current_block_type_index, if_block, if_block_anchor, current;

	var if_block_creators = [
		create_if_block_1,
		create_if_block_2,
		create_else_block
	];

	var if_blocks = [];

	function select_block_type(changed, ctx) {
		if (ctx.asyncComponent) { return 0; }
		if (ctx.component) { return 1; }
		return 2;
	}

	current_block_type_index = select_block_type(null, ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	var block = {
		c: function create() {
			if_block.c();
			if_block_anchor = empty();
		},

		m: function mount(target_1, anchor) {
			if_blocks[current_block_type_index].m(target_1, anchor);
			insert_dev(target_1, if_block_anchor, anchor);
			current = true;
		},

		p: function update(changed, ctx) {
			var previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(changed, ctx);
			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(changed, ctx);
			} else {
				group_outros();
				transition_out(if_blocks[previous_block_index], 1, 1, function () {
					if_blocks[previous_block_index] = null;
				});
				check_outros();

				if_block = if_blocks[current_block_type_index];
				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				}
				transition_in(if_block, 1);
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},

		i: function intro(local) {
			if (current) { return; }
			transition_in(if_block);
			current = true;
		},

		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},

		d: function destroy(detaching) {
			if_blocks[current_block_type_index].d(detaching);

			if (detaching) {
				detach_dev(if_block_anchor);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block: block, id: create_if_block.name, type: "if", source: "(57:0) {#if $selectedRoute && $selectedRoute.route == route}", ctx: ctx });
	return block;
}

// (68:1) {:else}
function create_else_block(ctx) {
	var current;

	var default_slot_template = ctx.$$slots.default;
	var default_slot = create_slot(default_slot_template, ctx, null);

	var block = {
		c: function create() {
			if (default_slot) { default_slot.c(); }
		},

		l: function claim(nodes) {
			if (default_slot) { default_slot.l(nodes); }
		},

		m: function mount(target_1, anchor) {
			if (default_slot) {
				default_slot.m(target_1, anchor);
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
	dispatch_dev("SvelteRegisterBlock", { block: block, id: create_else_block.name, type: "else", source: "(68:1) {:else}", ctx: ctx });
	return block;
}

// (66:21) 
function create_if_block_2(ctx) {
	var switch_instance_anchor, current;

	var switch_value = ctx.component;

	function switch_props(ctx) {
		return {
			props: { selectedRoute: ctx.selectedRoute },
			$$inline: true
		};
	}

	if (switch_value) {
		var switch_instance = new switch_value(switch_props(ctx));
	}

	var block = {
		c: function create() {
			if (switch_instance) { switch_instance.$$.fragment.c(); }
			switch_instance_anchor = empty();
		},

		m: function mount(target_1, anchor) {
			if (switch_instance) {
				mount_component(switch_instance, target_1, anchor);
			}

			insert_dev(target_1, switch_instance_anchor, anchor);
			current = true;
		},

		p: function update(changed, ctx) {
			if (switch_value !== (switch_value = ctx.component)) {
				if (switch_instance) {
					group_outros();
					var old_component = switch_instance;
					transition_out(old_component.$$.fragment, 1, 0, function () {
						destroy_component(old_component, 1);
					});
					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props(ctx));

					switch_instance.$$.fragment.c();
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
				} else {
					switch_instance = null;
				}
			}
		},

		i: function intro(local) {
			if (current) { return; }
			if (switch_instance) { transition_in(switch_instance.$$.fragment, local); }

			current = true;
		},

		o: function outro(local) {
			if (switch_instance) { transition_out(switch_instance.$$.fragment, local); }
			current = false;
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(switch_instance_anchor);
			}

			if (switch_instance) { destroy_component(switch_instance, detaching); }
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block: block, id: create_if_block_2.name, type: "if", source: "(66:21) ", ctx: ctx });
	return block;
}

// (58:1) {#if asyncComponent}
function create_if_block_1(ctx) {
	var promise, t, div, current;

	var info = {
		ctx: ctx,
		current: null,
		token: null,
		pending: create_pending_block,
		then: create_then_block,
		catch: create_catch_block,
		value: 'null',
		error: 'error',
		blocks: [,,,]
	};

	handle_promise(promise = ctx.componentPromise, info);

	var block = {
		c: function create() {
			info.block.c();

			t = space();
			div = element("div");
			add_location(div, file$2, 64, 2, 1634);
		},

		m: function mount(target_1, anchor) {
			info.block.m(target_1, info.anchor = anchor);
			info.mount = function () { return t.parentNode; };
			info.anchor = t;

			insert_dev(target_1, t, anchor);
			insert_dev(target_1, div, anchor);
			ctx.div_binding(div);
			current = true;
		},

		p: function update(changed, new_ctx) {
			ctx = new_ctx;
			info.ctx = ctx;

			if (('componentPromise' in changed) && promise !== (promise = ctx.componentPromise) && handle_promise(promise, info)) ; else {
				info.block.p(changed, assign(assign({}, ctx), info.resolved));
			}
		},

		i: function intro(local) {
			if (current) { return; }
			transition_in(info.block);
			current = true;
		},

		o: function outro(local) {
			for (var i = 0; i < 3; i += 1) {
				var block = info.blocks[i];
				transition_out(block);
			}

			current = false;
		},

		d: function destroy(detaching) {
			info.block.d(detaching);
			info.token = null;
			info = null;

			if (detaching) {
				detach_dev(t);
				detach_dev(div);
			}

			ctx.div_binding(null);
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block: block, id: create_if_block_1.name, type: "if", source: "(58:1) {#if asyncComponent}", ctx: ctx });
	return block;
}

// (62:2) {:catch error}
function create_catch_block(ctx) {
	var switch_instance_anchor, current;

	var switch_value = ctx.errorComponent;

	function switch_props(ctx) {
		return {
			props: { error: ctx.error },
			$$inline: true
		};
	}

	if (switch_value) {
		var switch_instance = new switch_value(switch_props(ctx));
	}

	var block = {
		c: function create() {
			if (switch_instance) { switch_instance.$$.fragment.c(); }
			switch_instance_anchor = empty();
		},

		m: function mount(target_1, anchor) {
			if (switch_instance) {
				mount_component(switch_instance, target_1, anchor);
			}

			insert_dev(target_1, switch_instance_anchor, anchor);
			current = true;
		},

		p: function update(changed, ctx) {
			var switch_instance_changes = {};
			if (changed.componentPromise) { switch_instance_changes.error = ctx.error; }

			if (switch_value !== (switch_value = ctx.errorComponent)) {
				if (switch_instance) {
					group_outros();
					var old_component = switch_instance;
					transition_out(old_component.$$.fragment, 1, 0, function () {
						destroy_component(old_component, 1);
					});
					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props(ctx));

					switch_instance.$$.fragment.c();
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
				} else {
					switch_instance = null;
				}
			}

			else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},

		i: function intro(local) {
			if (current) { return; }
			if (switch_instance) { transition_in(switch_instance.$$.fragment, local); }

			current = true;
		},

		o: function outro(local) {
			if (switch_instance) { transition_out(switch_instance.$$.fragment, local); }
			current = false;
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(switch_instance_anchor);
			}

			if (switch_instance) { destroy_component(switch_instance, detaching); }
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block: block, id: create_catch_block.name, type: "catch", source: "(62:2) {:catch error}", ctx: ctx });
	return block;
}

// (61:2) {:then}
function create_then_block(ctx) {
	var block = {
		c: noop,
		m: noop,
		p: noop,
		i: noop,
		o: noop,
		d: noop
	};
	dispatch_dev("SvelteRegisterBlock", { block: block, id: create_then_block.name, type: "then", source: "(61:2) {:then}", ctx: ctx });
	return block;
}

// (59:27)      <svelte:component this={loadingComponent}
function create_pending_block(ctx) {
	var switch_instance_anchor, current;

	var switch_value = ctx.loadingComponent;

	function switch_props(ctx) {
		return { $$inline: true };
	}

	if (switch_value) {
		var switch_instance = new switch_value(switch_props());
	}

	var block = {
		c: function create() {
			if (switch_instance) { switch_instance.$$.fragment.c(); }
			switch_instance_anchor = empty();
		},

		m: function mount(target_1, anchor) {
			if (switch_instance) {
				mount_component(switch_instance, target_1, anchor);
			}

			insert_dev(target_1, switch_instance_anchor, anchor);
			current = true;
		},

		p: function update(changed, ctx) {
			if (switch_value !== (switch_value = ctx.loadingComponent)) {
				if (switch_instance) {
					group_outros();
					var old_component = switch_instance;
					transition_out(old_component.$$.fragment, 1, 0, function () {
						destroy_component(old_component, 1);
					});
					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props());

					switch_instance.$$.fragment.c();
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
				} else {
					switch_instance = null;
				}
			}
		},

		i: function intro(local) {
			if (current) { return; }
			if (switch_instance) { transition_in(switch_instance.$$.fragment, local); }

			current = true;
		},

		o: function outro(local) {
			if (switch_instance) { transition_out(switch_instance.$$.fragment, local); }
			current = false;
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(switch_instance_anchor);
			}

			if (switch_instance) { destroy_component(switch_instance, detaching); }
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block: block, id: create_pending_block.name, type: "pending", source: "(59:27)      <svelte:component this={loadingComponent}", ctx: ctx });
	return block;
}

function create_fragment$3(ctx) {
	var if_block_anchor, current;

	var if_block = (ctx.$selectedRoute && ctx.$selectedRoute.route == ctx.route) && create_if_block(ctx);

	var block = {
		c: function create() {
			if (if_block) { if_block.c(); }
			if_block_anchor = empty();
		},

		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},

		m: function mount(target_1, anchor) {
			if (if_block) { if_block.m(target_1, anchor); }
			insert_dev(target_1, if_block_anchor, anchor);
			current = true;
		},

		p: function update(changed, ctx) {
			if (ctx.$selectedRoute && ctx.$selectedRoute.route == ctx.route) {
				if (if_block) {
					if_block.p(changed, ctx);
					transition_in(if_block, 1);
				} else {
					if_block = create_if_block(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();
				transition_out(if_block, 1, 1, function () {
					if_block = null;
				});
				check_outros();
			}
		},

		i: function intro(local) {
			if (current) { return; }
			transition_in(if_block);
			current = true;
		},

		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},

		d: function destroy(detaching) {
			if (if_block) { if_block.d(detaching); }

			if (detaching) {
				detach_dev(if_block_anchor);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block: block, id: create_fragment$3.name, type: "component", source: "", ctx: ctx });
	return block;
}

var routeError = null;

function instance$2($$self, $$props, $$invalidate) {
	var $selectedRoute;

	

	var ref = getContext('ROUTER');
	var registerRoute = ref.registerRoute;
	var selectedRoute = ref.selectedRoute;
	var routerErrorComponent = ref.error; if ( routerErrorComponent === void 0 ) routerErrorComponent = null;
	var routerLoadingComponent = ref.loading; if ( routerLoadingComponent === void 0 ) routerLoadingComponent = null; validate_store(selectedRoute, 'selectedRoute'); component_subscribe($$self, selectedRoute, function ($$value) { $selectedRoute = $$value; $$invalidate('$selectedRoute', $selectedRoute); });

	// props
	var path = $$props.path;
	var asyncComponent = $$props.asyncComponent; if ( asyncComponent === void 0 ) asyncComponent = null;
	var component = $$props.component; if ( component === void 0 ) component = null;
	var middleware = $$props.middleware; if ( middleware === void 0 ) middleware = [];
	var metadata = $$props.metadata; if ( metadata === void 0 ) metadata = { };
	var error = $$props.error; if ( error === void 0 ) error = null;
	var loading = $$props.loading; if ( loading === void 0 ) loading = null;

	// template variables
	var componentPromise; 
	var target;

	// reactive variables: 
	var loadingComponent, errorComponent;

	var route = { 
		path: path, 
		asyncComponent: asyncComponent, 
		middleware: middleware, 
		metadata: metadata 
	};
	registerRoute(route);

	selectedRoute.subscribe(function (selected) {
		if(!selected) { return; }
		if(asyncComponent && selected && selected.route == route) {
			$$invalidate('componentPromise', componentPromise = asyncComponent());
			componentPromise.then(
				function (ref) {
					var Component = ref.default;

					return new Component({
						target: target, 
						props: { selectedRoute: selectedRoute }
					});
			}); 
		}
	});

	var writable_props = ['path', 'asyncComponent', 'component', 'middleware', 'metadata', 'error', 'loading'];
	Object.keys($$props).forEach(function (key) {
		if (!writable_props.includes(key) && !key.startsWith('$$')) { console.warn(("<Route> was created with unknown prop '" + key + "'")); }
	});

	var $$slots = $$props.$$slots; if ( $$slots === void 0 ) $$slots = {};
	var $$scope = $$props.$$scope;

	function div_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](function () {
			$$invalidate('target', target = $$value);
		});
	}

	$$self.$set = function ($$props) {
		if ('path' in $$props) { $$invalidate('path', path = $$props.path); }
		if ('asyncComponent' in $$props) { $$invalidate('asyncComponent', asyncComponent = $$props.asyncComponent); }
		if ('component' in $$props) { $$invalidate('component', component = $$props.component); }
		if ('middleware' in $$props) { $$invalidate('middleware', middleware = $$props.middleware); }
		if ('metadata' in $$props) { $$invalidate('metadata', metadata = $$props.metadata); }
		if ('error' in $$props) { $$invalidate('error', error = $$props.error); }
		if ('loading' in $$props) { $$invalidate('loading', loading = $$props.loading); }
		if ('$$scope' in $$props) { $$invalidate('$$scope', $$scope = $$props.$$scope); }
	};

	$$self.$capture_state = function () {
		return { path: path, asyncComponent: asyncComponent, component: component, middleware: middleware, metadata: metadata, error: error, loading: loading, componentPromise: componentPromise, target: target, routeError: routeError, loadingComponent: loadingComponent, errorComponent: errorComponent, $selectedRoute: $selectedRoute };
	};

	$$self.$inject_state = function ($$props) {
		if ('path' in $$props) { $$invalidate('path', path = $$props.path); }
		if ('asyncComponent' in $$props) { $$invalidate('asyncComponent', asyncComponent = $$props.asyncComponent); }
		if ('component' in $$props) { $$invalidate('component', component = $$props.component); }
		if ('middleware' in $$props) { $$invalidate('middleware', middleware = $$props.middleware); }
		if ('metadata' in $$props) { $$invalidate('metadata', metadata = $$props.metadata); }
		if ('error' in $$props) { $$invalidate('error', error = $$props.error); }
		if ('loading' in $$props) { $$invalidate('loading', loading = $$props.loading); }
		if ('componentPromise' in $$props) { $$invalidate('componentPromise', componentPromise = $$props.componentPromise); }
		if ('target' in $$props) { $$invalidate('target', target = $$props.target); }
		if ('routeError' in $$props) { routeError = $$props.routeError; }
		if ('loadingComponent' in $$props) { $$invalidate('loadingComponent', loadingComponent = $$props.loadingComponent); }
		if ('errorComponent' in $$props) { $$invalidate('errorComponent', errorComponent = $$props.errorComponent); }
		if ('$selectedRoute' in $$props) { selectedRoute.set($selectedRoute); }
	};

	$$self.$$.update = function ($$dirty) {
		if ( $$dirty === void 0 ) $$dirty = { loading: 1, error: 1 };

		if ($$dirty.loading) { $$invalidate('loadingComponent', loadingComponent = loading || routerLoadingComponent || Loading); }
		if ($$dirty.error) { $$invalidate('errorComponent', errorComponent = error || routerErrorComponent || Error$1); }
	};

	return {
		selectedRoute: selectedRoute,
		path: path,
		asyncComponent: asyncComponent,
		component: component,
		middleware: middleware,
		metadata: metadata,
		error: error,
		loading: loading,
		componentPromise: componentPromise,
		target: target,
		loadingComponent: loadingComponent,
		errorComponent: errorComponent,
		route: route,
		$selectedRoute: $selectedRoute,
		div_binding: div_binding,
		$$slots: $$slots,
		$$scope: $$scope
	};
}

var Route$1 = /*@__PURE__*/(function (SvelteComponentDev) {
	function Route(options) {
		SvelteComponentDev.call(this, options);
		init(this, options, instance$2, create_fragment$3, safe_not_equal, ["path", "asyncComponent", "component", "middleware", "metadata", "error", "loading"]);
		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Route", options: options, id: create_fragment$3.name });

		var ref = this.$$;
		var ctx = ref.ctx;
		var props = options.props || {};
		if (ctx.path === undefined && !('path' in props)) {
			console.warn("<Route> was created without expected prop 'path'");
		}
	}

	if ( SvelteComponentDev ) Route.__proto__ = SvelteComponentDev;
	Route.prototype = Object.create( SvelteComponentDev && SvelteComponentDev.prototype );
	Route.prototype.constructor = Route;

	var prototypeAccessors = { path: { configurable: true },asyncComponent: { configurable: true },component: { configurable: true },middleware: { configurable: true },metadata: { configurable: true },error: { configurable: true },loading: { configurable: true } };

	prototypeAccessors.path.get = function () {
		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	};

	prototypeAccessors.path.set = function (value) {
		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	};

	prototypeAccessors.asyncComponent.get = function () {
		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	};

	prototypeAccessors.asyncComponent.set = function (value) {
		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	};

	prototypeAccessors.component.get = function () {
		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	};

	prototypeAccessors.component.set = function (value) {
		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	};

	prototypeAccessors.middleware.get = function () {
		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	};

	prototypeAccessors.middleware.set = function (value) {
		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	};

	prototypeAccessors.metadata.get = function () {
		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	};

	prototypeAccessors.metadata.set = function (value) {
		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	};

	prototypeAccessors.error.get = function () {
		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	};

	prototypeAccessors.error.set = function (value) {
		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	};

	prototypeAccessors.loading.get = function () {
		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	};

	prototypeAccessors.loading.set = function (value) {
		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	};

	Object.defineProperties( Route.prototype, prototypeAccessors );

	return Route;
}(SvelteComponentDev));

/* src\Components\test\HomeRoute.svelte generated by Svelte v3.12.1 */

var file$3 = "src\\Components\\test\\HomeRoute.svelte";

// (8:0) <Page>
function create_default_slot(ctx) {
	var h1, t1, p0, strong, t3, pre, t4_value = JSON.stringify(ctx.$selectedRoute.ctx.params,null,2) + "", t4, t5, p1, t6, a0, t8, p2, t9, a1, t11, p3, t12, a2;

	var block = {
		c: function create() {
			h1 = element("h1");
			h1.textContent = "Homepage";
			t1 = space();
			p0 = element("p");
			strong = element("strong");
			strong.textContent = "route:";
			t3 = space();
			pre = element("pre");
			t4 = text(t4_value);
			t5 = space();
			p1 = element("p");
			t6 = text("Go to ");
			a0 = element("a");
			a0.textContent = "home-alternate";
			t8 = space();
			p2 = element("p");
			t9 = text("Go to ");
			a1 = element("a");
			a1.textContent = "regex route";
			t11 = space();
			p3 = element("p");
			t12 = text("Go to ");
			a2 = element("a");
			a2.textContent = "named-params route";
			add_location(h1, file$3, 8, 2, 210);
			add_location(strong, file$3, 10, 4, 240);
			add_location(p0, file$3, 9, 2, 231);
			add_location(pre, file$3, 12, 2, 275);
			attr_dev(a0, "href", "/svelte-router/home-alt");
			add_location(a0, file$3, 14, 10, 355);
			add_location(p1, file$3, 13, 2, 340);
			attr_dev(a1, "href", "/svelte-router/regex-route.123");
			add_location(a1, file$3, 17, 10, 434);
			add_location(p2, file$3, 16, 2, 419);
			attr_dev(a2, "href", "/svelte-router/named/123");
			add_location(a2, file$3, 20, 10, 517);
			add_location(p3, file$3, 19, 2, 502);
		},

		m: function mount(target, anchor) {
			insert_dev(target, h1, anchor);
			insert_dev(target, t1, anchor);
			insert_dev(target, p0, anchor);
			append_dev(p0, strong);
			insert_dev(target, t3, anchor);
			insert_dev(target, pre, anchor);
			append_dev(pre, t4);
			insert_dev(target, t5, anchor);
			insert_dev(target, p1, anchor);
			append_dev(p1, t6);
			append_dev(p1, a0);
			insert_dev(target, t8, anchor);
			insert_dev(target, p2, anchor);
			append_dev(p2, t9);
			append_dev(p2, a1);
			insert_dev(target, t11, anchor);
			insert_dev(target, p3, anchor);
			append_dev(p3, t12);
			append_dev(p3, a2);
		},

		p: function update(changed, ctx) {
			if ((changed.$selectedRoute) && t4_value !== (t4_value = JSON.stringify(ctx.$selectedRoute.ctx.params,null,2) + "")) {
				set_data_dev(t4, t4_value);
			}
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(h1);
				detach_dev(t1);
				detach_dev(p0);
				detach_dev(t3);
				detach_dev(pre);
				detach_dev(t5);
				detach_dev(p1);
				detach_dev(t8);
				detach_dev(p2);
				detach_dev(t11);
				detach_dev(p3);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block: block, id: create_default_slot.name, type: "slot", source: "(8:0) <Page>", ctx: ctx });
	return block;
}

function create_fragment$4(ctx) {
	var current;

	var page = new Page$1({
		props: {
		$$slots: { default: [create_default_slot] },
		$$scope: { ctx: ctx }
	},
		$$inline: true
	});

	var block = {
		c: function create() {
			page.$$.fragment.c();
		},

		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},

		m: function mount(target, anchor) {
			mount_component(page, target, anchor);
			current = true;
		},

		p: function update(changed, ctx) {
			var page_changes = {};
			if (changed.$$scope || changed.$selectedRoute) { page_changes.$$scope = { changed: changed, ctx: ctx }; }
			page.$set(page_changes);
		},

		i: function intro(local) {
			if (current) { return; }
			transition_in(page.$$.fragment, local);

			current = true;
		},

		o: function outro(local) {
			transition_out(page.$$.fragment, local);
			current = false;
		},

		d: function destroy(detaching) {
			destroy_component(page, detaching);
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block: block, id: create_fragment$4.name, type: "component", source: "", ctx: ctx });
	return block;
}

function instance$3($$self, $$props, $$invalidate) {
	var $selectedRoute;

	
  // import { ROUTER } from '../Router.svelte';
  var ref = getContext('ROUTER');
	var selectedRoute = ref.selectedRoute; validate_store(selectedRoute, 'selectedRoute'); component_subscribe($$self, selectedRoute, function ($$value) { $selectedRoute = $$value; $$invalidate('$selectedRoute', $selectedRoute); });

	$$self.$capture_state = function () {
		return {};
	};

	$$self.$inject_state = function ($$props) {
		if ('selectedRoute' in $$props) { $$invalidate('selectedRoute', selectedRoute = $$props.selectedRoute); }
		if ('$selectedRoute' in $$props) { selectedRoute.set($selectedRoute); }
	};

	return { selectedRoute: selectedRoute, $selectedRoute: $selectedRoute };
}

var HomeRoute = /*@__PURE__*/(function (SvelteComponentDev) {
	function HomeRoute(options) {
		SvelteComponentDev.call(this, options);
		init(this, options, instance$3, create_fragment$4, safe_not_equal, []);
		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "HomeRoute", options: options, id: create_fragment$4.name });
	}

	if ( SvelteComponentDev ) HomeRoute.__proto__ = SvelteComponentDev;
	HomeRoute.prototype = Object.create( SvelteComponentDev && SvelteComponentDev.prototype );
	HomeRoute.prototype.constructor = HomeRoute;

	return HomeRoute;
}(SvelteComponentDev));

/* src\Components\test\Error.svelte generated by Svelte v3.12.1 */
var Error_1$1 = globals.Error;

var file$4 = "src\\Components\\test\\Error.svelte";

function create_fragment$5(ctx) {
	var h1, t1, pre, t2;

	var block = {
		c: function create() {
			h1 = element("h1");
			h1.textContent = "Custom Error Page";
			t1 = space();
			pre = element("pre");
			t2 = text(ctx.error);
			add_location(h1, file$4, 4, 0, 51);
			attr_dev(pre, "class", "svelte-kaf4t9");
			add_location(pre, file$4, 6, 0, 81);
		},

		l: function claim(nodes) {
			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},

		m: function mount(target, anchor) {
			insert_dev(target, h1, anchor);
			insert_dev(target, t1, anchor);
			insert_dev(target, pre, anchor);
			append_dev(pre, t2);
		},

		p: function update(changed, ctx) {
			if (changed.error) {
				set_data_dev(t2, ctx.error);
			}
		},

		i: noop,
		o: noop,

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(h1);
				detach_dev(t1);
				detach_dev(pre);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block: block, id: create_fragment$5.name, type: "component", source: "", ctx: ctx });
	return block;
}

function instance$4($$self, $$props, $$invalidate) {
	var error = $$props.error; if ( error === void 0 ) error = null;

	var writable_props = ['error'];
	Object.keys($$props).forEach(function (key) {
		if (!writable_props.includes(key) && !key.startsWith('$$')) { console.warn(("<Error> was created with unknown prop '" + key + "'")); }
	});

	$$self.$set = function ($$props) {
		if ('error' in $$props) { $$invalidate('error', error = $$props.error); }
	};

	$$self.$capture_state = function () {
		return { error: error };
	};

	$$self.$inject_state = function ($$props) {
		if ('error' in $$props) { $$invalidate('error', error = $$props.error); }
	};

	return { error: error };
}

var Error$2 = /*@__PURE__*/(function (SvelteComponentDev) {
	function Error(options) {
		SvelteComponentDev.call(this, options);
		init(this, options, instance$4, create_fragment$5, safe_not_equal, ["error"]);
		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Error", options: options, id: create_fragment$5.name });
	}

	if ( SvelteComponentDev ) Error.__proto__ = SvelteComponentDev;
	Error.prototype = Object.create( SvelteComponentDev && SvelteComponentDev.prototype );
	Error.prototype.constructor = Error;

	var prototypeAccessors = { error: { configurable: true } };

	prototypeAccessors.error.get = function () {
		throw new Error_1$1("<Error>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	};

	prototypeAccessors.error.set = function (value) {
		throw new Error_1$1("<Error>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	};

	Object.defineProperties( Error.prototype, prototypeAccessors );

	return Error;
}(SvelteComponentDev));

/* src\Components\test\Loading.svelte generated by Svelte v3.12.1 */

var file$5 = "src\\Components\\test\\Loading.svelte";

function create_fragment$6(ctx) {
	var div4, div0, t0, div1, t1, div2, t2, div3;

	var block = {
		c: function create() {
			div4 = element("div");
			div0 = element("div");
			t0 = space();
			div1 = element("div");
			t1 = space();
			div2 = element("div");
			t2 = space();
			div3 = element("div");
			attr_dev(div0, "class", "svelte-1usn4hs");
			add_location(div0, file$5, 1, 1, 21);
			attr_dev(div1, "class", "svelte-1usn4hs");
			add_location(div1, file$5, 2, 1, 35);
			attr_dev(div2, "class", "svelte-1usn4hs");
			add_location(div2, file$5, 3, 1, 49);
			attr_dev(div3, "class", "svelte-1usn4hs");
			add_location(div3, file$5, 4, 1, 63);
			attr_dev(div4, "class", "ring svelte-1usn4hs");
			add_location(div4, file$5, 0, 0, 0);
		},

		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},

		m: function mount(target, anchor) {
			insert_dev(target, div4, anchor);
			append_dev(div4, div0);
			append_dev(div4, t0);
			append_dev(div4, div1);
			append_dev(div4, t1);
			append_dev(div4, div2);
			append_dev(div4, t2);
			append_dev(div4, div3);
		},

		p: noop,
		i: noop,
		o: noop,

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div4);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block: block, id: create_fragment$6.name, type: "component", source: "", ctx: ctx });
	return block;
}

var Loading$1 = /*@__PURE__*/(function (SvelteComponentDev) {
	function Loading(options) {
		SvelteComponentDev.call(this, options);
		init(this, options, null, create_fragment$6, safe_not_equal, []);
		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Loading", options: options, id: create_fragment$6.name });
	}

	if ( SvelteComponentDev ) Loading.__proto__ = SvelteComponentDev;
	Loading.prototype = Object.create( SvelteComponentDev && SvelteComponentDev.prototype );
	Loading.prototype.constructor = Loading;

	return Loading;
}(SvelteComponentDev));

/* src\App.svelte generated by Svelte v3.12.1 */
var Error_1$2 = globals.Error;

var file$6 = "src\\App.svelte";

// (45:2) <Route     path='/svelte-router/home-alt'     middleware={[exampleRouteMiddleware]}     metadata={exampleRouteMetadata}    >
function create_default_slot_2(ctx) {
	var current;

	var homeroute = new HomeRoute({ $$inline: true });

	var block = {
		c: function create() {
			homeroute.$$.fragment.c();
		},

		m: function mount(target, anchor) {
			mount_component(homeroute, target, anchor);
			current = true;
		},

		i: function intro(local) {
			if (current) { return; }
			transition_in(homeroute.$$.fragment, local);

			current = true;
		},

		o: function outro(local) {
			transition_out(homeroute.$$.fragment, local);
			current = false;
		},

		d: function destroy(detaching) {
			destroy_component(homeroute, detaching);
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block: block, id: create_default_slot_2.name, type: "slot", source: "(45:2) <Route     path='/svelte-router/home-alt'     middleware={[exampleRouteMiddleware]}     metadata={exampleRouteMetadata}    >", ctx: ctx });
	return block;
}

// (65:2) <Route      path='/svelte-router/named/:id'      asyncComponent={() => import('./Components/test/NamedParamsRoute.svelte')}     >
function create_default_slot_1(ctx) {
	var block = {
		c: noop,
		m: noop,
		d: noop
	};
	dispatch_dev("SvelteRegisterBlock", { block: block, id: create_default_slot_1.name, type: "slot", source: "(65:2) <Route      path='/svelte-router/named/:id'      asyncComponent={() => import('./Components/test/NamedParamsRoute.svelte')}     >", ctx: ctx });
	return block;
}

// (25:1) <Router     hashbang={true}    error={Error}    loading={Loading}    middleware={[exampleRouterMiddleware]}    metadata={exampleRouterMetadata}   >
function create_default_slot$1(ctx) {
	var t0, t1, t2, current;

	var route0 = new Route$1({
		props: {
		path: "/svelte-router",
		component: HomeRoute
	},
		$$inline: true
	});

	var route1 = new Route$1({
		props: {
		path: "/svelte-router/home-alt",
		middleware: [ctx.exampleRouteMiddleware],
		metadata: ctx.exampleRouteMetadata,
		$$slots: { default: [create_default_slot_2] },
		$$scope: { ctx: ctx }
	},
		$$inline: true
	});

	var route2 = new Route$1({
		props: {
		path: /\/svelte-router\/regex-route\.(\d+)/,
		asyncComponent: func
	},
		$$inline: true
	});

	var route3 = new Route$1({
		props: {
		path: "/svelte-router/named/:id",
		asyncComponent: func_1,
		$$slots: { default: [create_default_slot_1] },
		$$scope: { ctx: ctx }
	},
		$$inline: true
	});

	var block = {
		c: function create() {
			route0.$$.fragment.c();
			t0 = space();
			route1.$$.fragment.c();
			t1 = space();
			route2.$$.fragment.c();
			t2 = space();
			route3.$$.fragment.c();
		},

		m: function mount(target, anchor) {
			mount_component(route0, target, anchor);
			insert_dev(target, t0, anchor);
			mount_component(route1, target, anchor);
			insert_dev(target, t1, anchor);
			mount_component(route2, target, anchor);
			insert_dev(target, t2, anchor);
			mount_component(route3, target, anchor);
			current = true;
		},

		p: function update(changed, ctx) {
			var route1_changes = {};
			if (changed.$$scope) { route1_changes.$$scope = { changed: changed, ctx: ctx }; }
			route1.$set(route1_changes);

			var route3_changes = {};
			if (changed.$$scope) { route3_changes.$$scope = { changed: changed, ctx: ctx }; }
			route3.$set(route3_changes);
		},

		i: function intro(local) {
			if (current) { return; }
			transition_in(route0.$$.fragment, local);

			transition_in(route1.$$.fragment, local);

			transition_in(route2.$$.fragment, local);

			transition_in(route3.$$.fragment, local);

			current = true;
		},

		o: function outro(local) {
			transition_out(route0.$$.fragment, local);
			transition_out(route1.$$.fragment, local);
			transition_out(route2.$$.fragment, local);
			transition_out(route3.$$.fragment, local);
			current = false;
		},

		d: function destroy(detaching) {
			destroy_component(route0, detaching);

			if (detaching) {
				detach_dev(t0);
			}

			destroy_component(route1, detaching);

			if (detaching) {
				detach_dev(t1);
			}

			destroy_component(route2, detaching);

			if (detaching) {
				detach_dev(t2);
			}

			destroy_component(route3, detaching);
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block: block, id: create_default_slot$1.name, type: "slot", source: "(25:1) <Router     hashbang={true}    error={Error}    loading={Loading}    middleware={[exampleRouterMiddleware]}    metadata={exampleRouterMetadata}   >", ctx: ctx });
	return block;
}

function create_fragment$7(ctx) {
	var div, current;

	var router = new Router({
		props: {
		hashbang: true,
		error: Error$2,
		loading: Loading$1,
		middleware: [ctx.exampleRouterMiddleware],
		metadata: ctx.exampleRouterMetadata,
		$$slots: { default: [create_default_slot$1] },
		$$scope: { ctx: ctx }
	},
		$$inline: true
	});

	var block = {
		c: function create() {
			div = element("div");
			router.$$.fragment.c();
			add_location(div, file$6, 23, 0, 737);
		},

		l: function claim(nodes) {
			throw new Error_1$2("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},

		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			mount_component(router, div, null);
			current = true;
		},

		p: function update(changed, ctx) {
			var router_changes = {};
			if (changed.$$scope) { router_changes.$$scope = { changed: changed, ctx: ctx }; }
			router.$set(router_changes);
		},

		i: function intro(local) {
			if (current) { return; }
			transition_in(router.$$.fragment, local);

			current = true;
		},

		o: function outro(local) {
			transition_out(router.$$.fragment, local);
			current = false;
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div);
			}

			destroy_component(router);
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block: block, id: create_fragment$7.name, type: "component", source: "", ctx: ctx });
	return block;
}

var base = '/svelte-router';

var func = function () { return import('./RegexRoute-2ebddd9d.js'); };

var func_1 = function () { return import('./NamedParamsRoute-fabbe1e7.js'); };

function instance$5($$self) {
	

	var exampleRouterMiddleware = function (ctx,next) {
		console.log("This runs for every route in instance of Router\n", ctx); 
		next(); 
	};

	var exampleRouteMiddleware = function (ctx,next) {
		console.log("This runs only for specific routes where it is applied\n", ctx); 
		next(); 
	};

	var exampleRouterMetadata = { routerId: 123 };
	var exampleRouteMetadata = { pageName: 'Home (Alt)' };

	$$self.$capture_state = function () {
		return {};
	};

	$$self.$inject_state = function ($$props) {
		if ('base' in $$props) { base = $$props.base; }
	};

	return {
		exampleRouterMiddleware: exampleRouterMiddleware,
		exampleRouteMiddleware: exampleRouteMiddleware,
		exampleRouterMetadata: exampleRouterMetadata,
		exampleRouteMetadata: exampleRouteMetadata
	};
}

var App = /*@__PURE__*/(function (SvelteComponentDev) {
	function App(options) {
		SvelteComponentDev.call(this, options);
		init(this, options, instance$5, create_fragment$7, safe_not_equal, []);
		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options: options, id: create_fragment$7.name });
	}

	if ( SvelteComponentDev ) App.__proto__ = SvelteComponentDev;
	App.prototype = Object.create( SvelteComponentDev && SvelteComponentDev.prototype );
	App.prototype.constructor = App;

	return App;
}(SvelteComponentDev));

var app = new App({
  target: document.body,
  data: {}
});

export default app;
//# sourceMappingURL=app.js.map
