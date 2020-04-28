
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
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
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
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
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
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
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
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
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.21.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
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
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function regexparam (str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* Router.svelte generated by Svelte v3.21.0 */

    const { Error: Error_1, Object: Object_1, console: console_1 } = globals;

    // (209:0) {:else}
    function create_else_block(ctx) {
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[10]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[10]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(209:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (207:0) {#if componentParams}
    function create_if_block(ctx) {
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		return {
    			props: { params: /*componentParams*/ ctx[1] },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[9]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty & /*componentParams*/ 2) switch_instance_changes.params = /*componentParams*/ ctx[1];

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[9]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(207:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
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
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap(route, userData, ...conditions) {
    	// Check if we don't have userData
    	if (userData && typeof userData == "function") {
    		conditions = conditions && conditions.length ? conditions : [];
    		conditions.unshift(userData);
    		userData = undefined;
    	}

    	// Parameter route and each item of conditions must be functions
    	if (!route || typeof route != "function") {
    		throw Error("Invalid parameter route");
    	}

    	if (conditions && conditions.length) {
    		for (let i = 0; i < conditions.length; i++) {
    			if (!conditions[i] || typeof conditions[i] != "function") {
    				throw Error("Invalid parameter conditions[" + i + "]");
    			}
    		}
    	}

    	// Returns an object that contains all the functions to execute too
    	const obj = { route, userData };

    	if (conditions && conditions.length) {
    		obj.conditions = conditions;
    	}

    	// The _sveltesparouter flag is to confirm the object was created by this router
    	Object.defineProperty(obj, "_sveltesparouter", { value: true });

    	return obj;
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf("#/");

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: "/";

    	// Check if there's a querystring
    	const qsPosition = location.indexOf("?");

    	let querystring = "";

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(getLocation(), // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener("hashchange", update, false);

    	return function stop() {
    		window.removeEventListener("hashchange", update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);

    function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	return nextTickPromise(() => {
    		window.location.hash = (location.charAt(0) == "#" ? "" : "#") + location;
    	});
    }

    function pop() {
    	// Execute this code when the current call stack is complete
    	return nextTickPromise(() => {
    		window.history.back();
    	});
    }

    function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	return nextTickPromise(() => {
    		const dest = (location.charAt(0) == "#" ? "" : "#") + location;

    		try {
    			window.history.replaceState(undefined, undefined, dest);
    		} catch(e) {
    			// eslint-disable-next-line no-console
    			console.warn("Caught exception while replacing the current page. If you're running this in the Svelte REPL, please note that the `replace` method might not work in this environment.");
    		}

    		// The method above doesn't trigger the hashchange event, so let's do that manually
    		window.dispatchEvent(new Event("hashchange"));
    	});
    }

    function link(node) {
    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != "a") {
    		throw Error("Action \"link\" can only be used with <a> tags");
    	}

    	// Destination must start with '/'
    	const href = node.getAttribute("href");

    	if (!href || href.length < 1 || href.charAt(0) != "/") {
    		throw Error("Invalid value for \"href\" attribute");
    	}

    	// Add # to every href attribute
    	node.setAttribute("href", "#" + href);
    }

    function nextTickPromise(cb) {
    	return new Promise(resolve => {
    			setTimeout(
    				() => {
    					resolve(cb());
    				},
    				0
    			);
    		});
    }

    function instance($$self, $$props, $$invalidate) {
    	let $loc,
    		$$unsubscribe_loc = noop;

    	validate_store(loc, "loc");
    	component_subscribe($$self, loc, $$value => $$invalidate(4, $loc = $$value));
    	$$self.$$.on_destroy.push(() => $$unsubscribe_loc());
    	let { routes = {} } = $$props;
    	let { prefix = "" } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent} component - Svelte component for the route
     */
    		constructor(path, component) {
    			if (!component || typeof component != "function" && (typeof component != "object" || component._sveltesparouter !== true)) {
    				throw Error("Invalid component object");
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == "string" && (path.length < 1 || path.charAt(0) != "/" && path.charAt(0) != "*") || typeof path == "object" && !(path instanceof RegExp)) {
    				throw Error("Invalid value for \"path\" argument");
    			}

    			const { pattern, keys } = regexparam(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == "object" && component._sveltesparouter === true) {
    				this.component = component.route;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    			} else {
    				this.component = component;
    				this.conditions = [];
    				this.userData = undefined;
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, remove it before we run the matching
    			if (prefix && path.startsWith(prefix)) {
    				path = path.substr(prefix.length) || "/";
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				out[this._keys[i]] = matches[++i] || null;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {SvelteComponent} component - Svelte component
     * @property {string} name - Name of the Svelte component
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {Object} [userData] - Custom data passed by the user
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {bool} Returns true if all the conditions succeeded
     */
    		checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	const dispatchNextTick = (name, detail) => {
    		// Execute this code when the current call stack is complete
    		setTimeout(
    			() => {
    				dispatch(name, detail);
    			},
    			0
    		);
    	};

    	const writable_props = ["routes", "prefix"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Router", $$slots, []);

    	function routeEvent_handler(event) {
    		bubble($$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ("routes" in $$props) $$invalidate(2, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(3, prefix = $$props.prefix);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		derived,
    		wrap,
    		getLocation,
    		loc,
    		location,
    		querystring,
    		push,
    		pop,
    		replace,
    		link,
    		nextTickPromise,
    		createEventDispatcher,
    		regexparam,
    		routes,
    		prefix,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		dispatch,
    		dispatchNextTick,
    		$loc
    	});

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(2, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(3, prefix = $$props.prefix);
    		if ("component" in $$props) $$invalidate(0, component = $$props.component);
    		if ("componentParams" in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*component, $loc*/ 17) {
    			// Handle hash change events
    			// Listen to changes in the $loc store and update the page
    			 {
    				// Find a route matching the location
    				$$invalidate(0, component = null);

    				let i = 0;

    				while (!component && i < routesList.length) {
    					const match = routesList[i].match($loc.location);

    					if (match) {
    						const detail = {
    							component: routesList[i].component,
    							name: routesList[i].component.name,
    							location: $loc.location,
    							querystring: $loc.querystring,
    							userData: routesList[i].userData
    						};

    						// Check if the route can be loaded - if all conditions succeed
    						if (!routesList[i].checkConditions(detail)) {
    							// Trigger an event to notify the user
    							dispatchNextTick("conditionsFailed", detail);

    							break;
    						}

    						$$invalidate(0, component = routesList[i].component);

    						// Set componentParams onloy if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    						// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    						if (match && typeof match == "object" && Object.keys(match).length) {
    							$$invalidate(1, componentParams = match);
    						} else {
    							$$invalidate(1, componentParams = null);
    						}

    						dispatchNextTick("routeLoaded", detail);
    					}

    					i++;
    				}
    			}
    		}
    	};

    	return [
    		component,
    		componentParams,
    		routes,
    		prefix,
    		$loc,
    		RouteItem,
    		routesList,
    		dispatch,
    		dispatchNextTick,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { routes: 2, prefix: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/Home.svelte generated by Svelte v3.21.0 */

    const file = "src/routes/Home.svelte";

    function create_fragment$1(ctx) {
    	let _DOCTYPE;
    	let t0;
    	let html;
    	let head;
    	let title;
    	let t2;
    	let meta0;
    	let t3;
    	let meta1;
    	let t4;
    	let link0;
    	let t5;
    	let link1;
    	let t6;
    	let body;
    	let div2;
    	let header0;
    	let h1;
    	let a0;
    	let t8;
    	let nav0;
    	let ul0;
    	let li0;
    	let a1;
    	let t10;
    	let li1;
    	let a2;
    	let t12;
    	let li2;
    	let a3;
    	let t14;
    	let li3;
    	let a4;
    	let t16;
    	let li4;
    	let a5;
    	let t18;
    	let nav1;
    	let ul1;
    	let li5;
    	let a6;
    	let t20;
    	let form0;
    	let input0;
    	let t21;
    	let li6;
    	let a7;
    	let t23;
    	let section3;
    	let section0;
    	let form1;
    	let input1;
    	let t24;
    	let section1;
    	let ul2;
    	let li7;
    	let a8;
    	let h30;
    	let t26;
    	let p0;
    	let t28;
    	let li8;
    	let a9;
    	let h31;
    	let t30;
    	let p1;
    	let t32;
    	let li9;
    	let a10;
    	let h32;
    	let t34;
    	let p2;
    	let t36;
    	let li10;
    	let a11;
    	let h33;
    	let t38;
    	let p3;
    	let t40;
    	let section2;
    	let ul3;
    	let li11;
    	let a12;
    	let t42;
    	let div1;
    	let article;
    	let header1;
    	let div0;
    	let h2;
    	let t44;
    	let p4;
    	let strong;
    	let t46;
    	let span0;
    	let img;
    	let img_src_value;
    	let t47;
    	let p5;
    	let t49;
    	let p6;
    	let t51;
    	let p7;
    	let t53;
    	let p8;
    	let t55;
    	let p9;
    	let t57;
    	let section4;
    	let ul4;
    	let li12;
    	let a13;
    	let span1;
    	let t59;
    	let li13;
    	let a14;
    	let span2;
    	let t61;
    	let li14;
    	let a15;
    	let span3;
    	let t63;
    	let li15;
    	let a16;
    	let span4;
    	let t65;
    	let li16;
    	let a17;
    	let span5;
    	let t67;
    	let p10;
    	let t68;
    	let a18;
    	let t70;
    	let a19;
    	let t72;
    	let t73;
    	let script0;
    	let script0_src_value;
    	let t74;
    	let script1;
    	let script1_src_value;
    	let t75;
    	let script2;
    	let script2_src_value;
    	let t76;
    	let script3;
    	let script3_src_value;
    	let t77;
    	let script4;
    	let script4_src_value;

    	const block = {
    		c: function create() {
    			_DOCTYPE = element("!DOCTYPE");
    			t0 = space();
    			html = element("html");
    			head = element("head");
    			title = element("title");
    			title.textContent = "Planet First";
    			t2 = space();
    			meta0 = element("meta");
    			t3 = space();
    			meta1 = element("meta");
    			t4 = space();
    			link0 = element("link");
    			t5 = space();
    			link1 = element("link");
    			t6 = space();
    			body = element("body");
    			div2 = element("div");
    			header0 = element("header");
    			h1 = element("h1");
    			a0 = element("a");
    			a0.textContent = "Planet First";
    			t8 = space();
    			nav0 = element("nav");
    			ul0 = element("ul");
    			li0 = element("li");
    			a1 = element("a");
    			a1.textContent = "Lorem";
    			t10 = space();
    			li1 = element("li");
    			a2 = element("a");
    			a2.textContent = "Ipsum";
    			t12 = space();
    			li2 = element("li");
    			a3 = element("a");
    			a3.textContent = "Feugiat";
    			t14 = space();
    			li3 = element("li");
    			a4 = element("a");
    			a4.textContent = "Tempus";
    			t16 = space();
    			li4 = element("li");
    			a5 = element("a");
    			a5.textContent = "Adipiscing";
    			t18 = space();
    			nav1 = element("nav");
    			ul1 = element("ul");
    			li5 = element("li");
    			a6 = element("a");
    			a6.textContent = "Search";
    			t20 = space();
    			form0 = element("form");
    			input0 = element("input");
    			t21 = space();
    			li6 = element("li");
    			a7 = element("a");
    			a7.textContent = "Menu";
    			t23 = space();
    			section3 = element("section");
    			section0 = element("section");
    			form1 = element("form");
    			input1 = element("input");
    			t24 = space();
    			section1 = element("section");
    			ul2 = element("ul");
    			li7 = element("li");
    			a8 = element("a");
    			h30 = element("h3");
    			h30.textContent = "Lorem ipsum";
    			t26 = space();
    			p0 = element("p");
    			p0.textContent = "Feugiat tempus veroeros dolor";
    			t28 = space();
    			li8 = element("li");
    			a9 = element("a");
    			h31 = element("h3");
    			h31.textContent = "Dolor sit amet";
    			t30 = space();
    			p1 = element("p");
    			p1.textContent = "Sed vitae justo condimentum";
    			t32 = space();
    			li9 = element("li");
    			a10 = element("a");
    			h32 = element("h3");
    			h32.textContent = "Feugiat veroeros";
    			t34 = space();
    			p2 = element("p");
    			p2.textContent = "Phasellus sed ultricies mi congue";
    			t36 = space();
    			li10 = element("li");
    			a11 = element("a");
    			h33 = element("h3");
    			h33.textContent = "Etiam sed consequat";
    			t38 = space();
    			p3 = element("p");
    			p3.textContent = "Porta lectus amet ultricies";
    			t40 = space();
    			section2 = element("section");
    			ul3 = element("ul");
    			li11 = element("li");
    			a12 = element("a");
    			a12.textContent = "Log In";
    			t42 = space();
    			div1 = element("div");
    			article = element("article");
    			header1 = element("header");
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Planet First";
    			t44 = space();
    			p4 = element("p");
    			strong = element("strong");
    			strong.textContent = "A collective and open ecosystem of planet- and human- centric projects";
    			t46 = space();
    			span0 = element("span");
    			img = element("img");
    			t47 = space();
    			p5 = element("p");
    			p5.textContent = "We are the Threefold Network, and have built a new peer-to-peer internet that empowers equality, freedom and sustainability. As we launch the ThreeFold Grid and many other experiences on top, the time has come for us to make our world peer-to-peer.";
    			t49 = space();
    			p6 = element("p");
    			p6.textContent = "As of the 29th of April 2020, the ThreeFold Network will enter a rolling launch with many exciting announcements for the world. This will start with the announcement of our Grid 2.0 upgrade and the availability of the ThreeFold Token on Stellar Exchange.";
    			t51 = space();
    			p7 = element("p");
    			p7.textContent = "The time has come to start building our peer-to-peer world together, and it goes without saying that a collective and equal approach is needed. Many beautiful projects have joined the Planet First Ecosystem, and together we aim to empower a better future for humanity and our planet.";
    			t53 = space();
    			p8 = element("p");
    			p8.textContent = "If not us, who? If not now, when?";
    			t55 = space();
    			p9 = element("p");
    			p9.textContent = "Interested to learn more? Explore the first projects living on the ThreeFold Network";
    			t57 = space();
    			section4 = element("section");
    			ul4 = element("ul");
    			li12 = element("li");
    			a13 = element("a");
    			span1 = element("span");
    			span1.textContent = "Twitter";
    			t59 = space();
    			li13 = element("li");
    			a14 = element("a");
    			span2 = element("span");
    			span2.textContent = "Facebook";
    			t61 = space();
    			li14 = element("li");
    			a15 = element("a");
    			span3 = element("span");
    			span3.textContent = "Instagram";
    			t63 = space();
    			li15 = element("li");
    			a16 = element("a");
    			span4 = element("span");
    			span4.textContent = "RSS";
    			t65 = space();
    			li16 = element("li");
    			a17 = element("a");
    			span5 = element("span");
    			span5.textContent = "Email";
    			t67 = space();
    			p10 = element("p");
    			t68 = text("© Untitled. Design: ");
    			a18 = element("a");
    			a18.textContent = "HTML5 UP";
    			t70 = text(". Images: ");
    			a19 = element("a");
    			a19.textContent = "Unsplash";
    			t72 = text(".");
    			t73 = space();
    			script0 = element("script");
    			t74 = space();
    			script1 = element("script");
    			t75 = space();
    			script2 = element("script");
    			t76 = space();
    			script3 = element("script");
    			t77 = space();
    			script4 = element("script");
    			attr_dev(_DOCTYPE, "html", "");
    			add_location(_DOCTYPE, file, 0, 0, 0);
    			add_location(title, file, 8, 2, 190);
    			attr_dev(meta0, "charset", "utf-8");
    			add_location(meta0, file, 9, 2, 220);
    			attr_dev(meta1, "name", "viewport");
    			attr_dev(meta1, "content", "width=device-width, initial-scale=1, user-scalable=no");
    			add_location(meta1, file, 10, 2, 247);
    			attr_dev(link0, "rel", "stylesheet");
    			attr_dev(link0, "href", "assets/css/main.css");
    			add_location(link0, file, 11, 2, 338);
    			attr_dev(link1, "href", "https://fonts.googleapis.com/css?family=Bebas+Neue&display=swap");
    			attr_dev(link1, "rel", "stylesheet");
    			add_location(link1, file, 12, 2, 393);
    			add_location(head, file, 7, 1, 181);
    			attr_dev(a0, "href", "index.html");
    			add_location(a0, file, 21, 10, 634);
    			add_location(h1, file, 21, 6, 630);
    			attr_dev(a1, "href", "#");
    			add_location(a1, file, 24, 12, 727);
    			add_location(li0, file, 24, 8, 723);
    			attr_dev(a2, "href", "#");
    			add_location(a2, file, 25, 12, 766);
    			add_location(li1, file, 25, 8, 762);
    			attr_dev(a3, "href", "#");
    			add_location(a3, file, 26, 12, 805);
    			add_location(li2, file, 26, 8, 801);
    			attr_dev(a4, "href", "#");
    			add_location(a4, file, 27, 12, 846);
    			add_location(li3, file, 27, 8, 842);
    			attr_dev(a5, "href", "#");
    			add_location(a5, file, 28, 12, 886);
    			add_location(li4, file, 28, 8, 882);
    			add_location(ul0, file, 23, 7, 710);
    			attr_dev(nav0, "class", "links");
    			add_location(nav0, file, 22, 6, 683);
    			attr_dev(a6, "class", "fa-search");
    			attr_dev(a6, "href", "#search");
    			add_location(a6, file, 34, 9, 1018);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "query");
    			attr_dev(input0, "placeholder", "Search");
    			add_location(input0, file, 36, 10, 1127);
    			attr_dev(form0, "id", "search");
    			attr_dev(form0, "method", "get");
    			attr_dev(form0, "action", "#");
    			add_location(form0, file, 35, 9, 1074);
    			attr_dev(li5, "class", "search");
    			add_location(li5, file, 33, 8, 989);
    			attr_dev(a7, "class", "fa-bars");
    			attr_dev(a7, "href", "#menu");
    			add_location(a7, file, 40, 9, 1249);
    			attr_dev(li6, "class", "menu");
    			add_location(li6, file, 39, 8, 1222);
    			add_location(ul1, file, 32, 7, 976);
    			attr_dev(nav1, "class", "main");
    			add_location(nav1, file, 31, 6, 950);
    			attr_dev(header0, "id", "header");
    			add_location(header0, file, 20, 5, 603);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "name", "query");
    			attr_dev(input1, "placeholder", "Search");
    			add_location(input1, file, 52, 9, 1492);
    			attr_dev(form1, "class", "search");
    			attr_dev(form1, "method", "get");
    			attr_dev(form1, "action", "#");
    			add_location(form1, file, 51, 8, 1437);
    			add_location(section0, file, 50, 7, 1419);
    			add_location(h30, file, 61, 11, 1696);
    			add_location(p0, file, 62, 11, 1728);
    			attr_dev(a8, "href", "#");
    			add_location(a8, file, 60, 10, 1672);
    			add_location(li7, file, 59, 9, 1657);
    			add_location(h31, file, 67, 11, 1843);
    			add_location(p1, file, 68, 11, 1878);
    			attr_dev(a9, "href", "#");
    			add_location(a9, file, 66, 10, 1819);
    			add_location(li8, file, 65, 9, 1804);
    			add_location(h32, file, 73, 11, 1991);
    			add_location(p2, file, 74, 11, 2028);
    			attr_dev(a10, "href", "#");
    			add_location(a10, file, 72, 10, 1967);
    			add_location(li9, file, 71, 9, 1952);
    			add_location(h33, file, 79, 11, 2147);
    			add_location(p3, file, 80, 11, 2187);
    			attr_dev(a11, "href", "#");
    			add_location(a11, file, 78, 10, 2123);
    			add_location(li10, file, 77, 9, 2108);
    			attr_dev(ul2, "class", "links");
    			add_location(ul2, file, 58, 8, 1629);
    			add_location(section1, file, 57, 7, 1611);
    			attr_dev(a12, "href", "#");
    			attr_dev(a12, "class", "button large fit");
    			add_location(a12, file, 89, 13, 2375);
    			add_location(li11, file, 89, 9, 2371);
    			attr_dev(ul3, "class", "actions stacked");
    			add_location(ul3, file, 88, 8, 2333);
    			add_location(section2, file, 87, 7, 2315);
    			attr_dev(section3, "id", "menu");
    			add_location(section3, file, 47, 5, 1369);
    			add_location(h2, file, 102, 10, 2624);
    			add_location(strong, file, 103, 13, 2659);
    			add_location(p4, file, 103, 10, 2656);
    			attr_dev(div0, "class", "title");
    			add_location(div0, file, 101, 9, 2594);
    			add_location(header1, file, 100, 8, 2576);
    			if (img.src !== (img_src_value = "images/pic01.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file, 106, 37, 2822);
    			attr_dev(span0, "class", "image featured");
    			add_location(span0, file, 106, 8, 2793);
    			add_location(p5, file, 107, 8, 2875);
    			add_location(p6, file, 108, 8, 3139);
    			add_location(p7, file, 109, 16, 3417);
    			add_location(p8, file, 110, 16, 3724);
    			add_location(p9, file, 111, 8, 3773);
    			attr_dev(article, "class", "post");
    			add_location(article, file, 99, 7, 2545);
    			attr_dev(div1, "id", "main");
    			add_location(div1, file, 96, 5, 2501);
    			attr_dev(span1, "class", "label");
    			add_location(span1, file, 126, 54, 4288);
    			attr_dev(a13, "href", "#");
    			attr_dev(a13, "class", "icon brands fa-twitter");
    			add_location(a13, file, 126, 11, 4245);
    			add_location(li12, file, 126, 7, 4241);
    			attr_dev(span2, "class", "label");
    			add_location(span2, file, 127, 57, 4389);
    			attr_dev(a14, "href", "#");
    			attr_dev(a14, "class", "icon brands fa-facebook-f");
    			add_location(a14, file, 127, 11, 4343);
    			add_location(li13, file, 127, 7, 4339);
    			attr_dev(span3, "class", "label");
    			add_location(span3, file, 128, 56, 4490);
    			attr_dev(a15, "href", "#");
    			attr_dev(a15, "class", "icon brands fa-instagram");
    			add_location(a15, file, 128, 11, 4445);
    			add_location(li14, file, 128, 7, 4441);
    			attr_dev(span4, "class", "label");
    			add_location(span4, file, 129, 49, 4585);
    			attr_dev(a16, "href", "#");
    			attr_dev(a16, "class", "icon solid fa-rss");
    			add_location(a16, file, 129, 11, 4547);
    			add_location(li15, file, 129, 7, 4543);
    			attr_dev(span5, "class", "label");
    			add_location(span5, file, 130, 54, 4679);
    			attr_dev(a17, "href", "#");
    			attr_dev(a17, "class", "icon solid fa-envelope");
    			add_location(a17, file, 130, 11, 4636);
    			add_location(li16, file, 130, 7, 4632);
    			attr_dev(ul4, "class", "icons");
    			add_location(ul4, file, 125, 6, 4215);
    			attr_dev(a18, "href", "http://html5up.net");
    			add_location(a18, file, 132, 52, 4785);
    			attr_dev(a19, "href", "http://unsplash.com");
    			add_location(a19, file, 132, 103, 4836);
    			attr_dev(p10, "class", "copyright");
    			add_location(p10, file, 132, 6, 4739);
    			attr_dev(section4, "id", "footer");
    			add_location(section4, file, 124, 5, 4187);
    			attr_dev(div2, "id", "wrapper");
    			add_location(div2, file, 17, 3, 558);
    			if (script0.src !== (script0_src_value = "assets/js/jquery.min.js")) attr_dev(script0, "src", script0_src_value);
    			add_location(script0, file, 138, 3, 4934);
    			if (script1.src !== (script1_src_value = "assets/js/browser.min.js")) attr_dev(script1, "src", script1_src_value);
    			add_location(script1, file, 139, 3, 4985);
    			if (script2.src !== (script2_src_value = "assets/js/breakpoints.min.js")) attr_dev(script2, "src", script2_src_value);
    			add_location(script2, file, 140, 3, 5037);
    			if (script3.src !== (script3_src_value = "assets/js/util.js")) attr_dev(script3, "src", script3_src_value);
    			add_location(script3, file, 141, 3, 5093);
    			if (script4.src !== (script4_src_value = "assets/js/main.js")) attr_dev(script4, "src", script4_src_value);
    			add_location(script4, file, 142, 3, 5138);
    			attr_dev(body, "class", "single is-preload");
    			add_location(body, file, 14, 1, 502);
    			attr_dev(html, "lang", "en");
    			add_location(html, file, 6, 0, 163);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, _DOCTYPE, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, html, anchor);
    			append_dev(html, head);
    			append_dev(head, title);
    			append_dev(head, t2);
    			append_dev(head, meta0);
    			append_dev(head, t3);
    			append_dev(head, meta1);
    			append_dev(head, t4);
    			append_dev(head, link0);
    			append_dev(head, t5);
    			append_dev(head, link1);
    			append_dev(html, t6);
    			append_dev(html, body);
    			append_dev(body, div2);
    			append_dev(div2, header0);
    			append_dev(header0, h1);
    			append_dev(h1, a0);
    			append_dev(header0, t8);
    			append_dev(header0, nav0);
    			append_dev(nav0, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, a1);
    			append_dev(ul0, t10);
    			append_dev(ul0, li1);
    			append_dev(li1, a2);
    			append_dev(ul0, t12);
    			append_dev(ul0, li2);
    			append_dev(li2, a3);
    			append_dev(ul0, t14);
    			append_dev(ul0, li3);
    			append_dev(li3, a4);
    			append_dev(ul0, t16);
    			append_dev(ul0, li4);
    			append_dev(li4, a5);
    			append_dev(header0, t18);
    			append_dev(header0, nav1);
    			append_dev(nav1, ul1);
    			append_dev(ul1, li5);
    			append_dev(li5, a6);
    			append_dev(li5, t20);
    			append_dev(li5, form0);
    			append_dev(form0, input0);
    			append_dev(ul1, t21);
    			append_dev(ul1, li6);
    			append_dev(li6, a7);
    			append_dev(div2, t23);
    			append_dev(div2, section3);
    			append_dev(section3, section0);
    			append_dev(section0, form1);
    			append_dev(form1, input1);
    			append_dev(section3, t24);
    			append_dev(section3, section1);
    			append_dev(section1, ul2);
    			append_dev(ul2, li7);
    			append_dev(li7, a8);
    			append_dev(a8, h30);
    			append_dev(a8, t26);
    			append_dev(a8, p0);
    			append_dev(ul2, t28);
    			append_dev(ul2, li8);
    			append_dev(li8, a9);
    			append_dev(a9, h31);
    			append_dev(a9, t30);
    			append_dev(a9, p1);
    			append_dev(ul2, t32);
    			append_dev(ul2, li9);
    			append_dev(li9, a10);
    			append_dev(a10, h32);
    			append_dev(a10, t34);
    			append_dev(a10, p2);
    			append_dev(ul2, t36);
    			append_dev(ul2, li10);
    			append_dev(li10, a11);
    			append_dev(a11, h33);
    			append_dev(a11, t38);
    			append_dev(a11, p3);
    			append_dev(section3, t40);
    			append_dev(section3, section2);
    			append_dev(section2, ul3);
    			append_dev(ul3, li11);
    			append_dev(li11, a12);
    			append_dev(div2, t42);
    			append_dev(div2, div1);
    			append_dev(div1, article);
    			append_dev(article, header1);
    			append_dev(header1, div0);
    			append_dev(div0, h2);
    			append_dev(div0, t44);
    			append_dev(div0, p4);
    			append_dev(p4, strong);
    			append_dev(article, t46);
    			append_dev(article, span0);
    			append_dev(span0, img);
    			append_dev(article, t47);
    			append_dev(article, p5);
    			append_dev(article, t49);
    			append_dev(article, p6);
    			append_dev(article, t51);
    			append_dev(article, p7);
    			append_dev(article, t53);
    			append_dev(article, p8);
    			append_dev(article, t55);
    			append_dev(article, p9);
    			append_dev(div2, t57);
    			append_dev(div2, section4);
    			append_dev(section4, ul4);
    			append_dev(ul4, li12);
    			append_dev(li12, a13);
    			append_dev(a13, span1);
    			append_dev(ul4, t59);
    			append_dev(ul4, li13);
    			append_dev(li13, a14);
    			append_dev(a14, span2);
    			append_dev(ul4, t61);
    			append_dev(ul4, li14);
    			append_dev(li14, a15);
    			append_dev(a15, span3);
    			append_dev(ul4, t63);
    			append_dev(ul4, li15);
    			append_dev(li15, a16);
    			append_dev(a16, span4);
    			append_dev(ul4, t65);
    			append_dev(ul4, li16);
    			append_dev(li16, a17);
    			append_dev(a17, span5);
    			append_dev(section4, t67);
    			append_dev(section4, p10);
    			append_dev(p10, t68);
    			append_dev(p10, a18);
    			append_dev(p10, t70);
    			append_dev(p10, a19);
    			append_dev(p10, t72);
    			append_dev(body, t73);
    			append_dev(body, script0);
    			append_dev(body, t74);
    			append_dev(body, script1);
    			append_dev(body, t75);
    			append_dev(body, script2);
    			append_dev(body, t76);
    			append_dev(body, script3);
    			append_dev(body, t77);
    			append_dev(body, script4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(_DOCTYPE);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(html);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Home", $$slots, []);
    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/components/Project.svelte generated by Svelte v3.21.0 */

    const file$1 = "src/components/Project.svelte";

    function create_fragment$2(ctx) {
    	let div2;
    	let header;
    	let div0;
    	let h2;
    	let a0;
    	let t1;
    	let p0;
    	let t3;
    	let div1;
    	let time;
    	let t5;
    	let a1;
    	let span;
    	let img0;
    	let img0_src_value;
    	let t7;
    	let a2;
    	let img1;
    	let img1_src_value;
    	let t8;
    	let p1;
    	let t10;
    	let footer;
    	let ul;
    	let li;
    	let a3;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			header = element("header");
    			div0 = element("div");
    			h2 = element("h2");
    			a0 = element("a");
    			a0.textContent = "Project Title";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Lorem ipsum dolor amet nullam consequat etiam feugiat";
    			t3 = space();
    			div1 = element("div");
    			time = element("time");
    			time.textContent = "November 1, 2015";
    			t5 = space();
    			a1 = element("a");
    			span = element("span");
    			span.textContent = "Jane Doe";
    			img0 = element("img");
    			t7 = space();
    			a2 = element("a");
    			img1 = element("img");
    			t8 = space();
    			p1 = element("p");
    			p1.textContent = "Mauris neque quam, fermentum ut nisl vitae, convallis maximus nisl. Sed mattis nunc id lorem euismod placerat. Vivamus porttitor magna enim, ac accumsan tortor cursus at. Phasellus sed ultricies mi non congue ullam corper. Praesent tincidunt sed tellus ut rutrum. Sed vitae justo condimentum, porta lectus vitae, ultricies congue gravida diam non fringilla.";
    			t10 = space();
    			footer = element("footer");
    			ul = element("ul");
    			li = element("li");
    			a3 = element("a");
    			a3.textContent = "Continue Reading";
    			attr_dev(a0, "href", "");
    			add_location(a0, file$1, 7, 10, 109);
    			add_location(h2, file$1, 7, 6, 105);
    			add_location(p0, file$1, 8, 6, 149);
    			attr_dev(div0, "class", "title");
    			add_location(div0, file$1, 6, 4, 79);
    			attr_dev(time, "class", "published");
    			attr_dev(time, "datetime", "2015-11-01");
    			add_location(time, file$1, 11, 6, 250);
    			attr_dev(span, "class", "name");
    			add_location(span, file$1, 12, 33, 353);
    			if (img0.src !== (img0_src_value = "images/avatar.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$1, 12, 67, 387);
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "class", "author");
    			add_location(a1, file$1, 12, 6, 326);
    			attr_dev(div1, "class", "meta");
    			add_location(div1, file$1, 10, 4, 225);
    			add_location(header, file$1, 5, 2, 66);
    			if (img1.src !== (img1_src_value = "")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$1, 15, 36, 489);
    			attr_dev(a2, "href", "");
    			attr_dev(a2, "class", "image featured");
    			add_location(a2, file$1, 15, 2, 455);
    			add_location(p1, file$1, 16, 2, 517);
    			attr_dev(a3, "href", "");
    			attr_dev(a3, "class", "button large");
    			add_location(a3, file$1, 19, 10, 928);
    			add_location(li, file$1, 19, 6, 924);
    			attr_dev(ul, "class", "actions");
    			add_location(ul, file$1, 18, 4, 897);
    			add_location(footer, file$1, 17, 2, 884);
    			attr_dev(div2, "class", "project");
    			add_location(div2, file$1, 4, 0, 42);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, header);
    			append_dev(header, div0);
    			append_dev(div0, h2);
    			append_dev(h2, a0);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(header, t3);
    			append_dev(header, div1);
    			append_dev(div1, time);
    			append_dev(div1, t5);
    			append_dev(div1, a1);
    			append_dev(a1, span);
    			append_dev(a1, img0);
    			append_dev(div2, t7);
    			append_dev(div2, a2);
    			append_dev(a2, img1);
    			append_dev(div2, t8);
    			append_dev(div2, p1);
    			append_dev(div2, t10);
    			append_dev(div2, footer);
    			append_dev(footer, ul);
    			append_dev(ul, li);
    			append_dev(li, a3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { project } = $$props;
    	const writable_props = ["project"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Project> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Project", $$slots, []);

    	$$self.$set = $$props => {
    		if ("project" in $$props) $$invalidate(0, project = $$props.project);
    	};

    	$$self.$capture_state = () => ({ project });

    	$$self.$inject_state = $$props => {
    		if ("project" in $$props) $$invalidate(0, project = $$props.project);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [project];
    }

    class Project extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { project: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Project",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*project*/ ctx[0] === undefined && !("project" in props)) {
    			console.warn("<Project> was created without expected prop 'project'");
    		}
    	}

    	get project() {
    		throw new Error("<Project>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set project(value) {
    		throw new Error("<Project>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ProjectList.svelte generated by Svelte v3.21.0 */
    const file$2 = "src/components/ProjectList.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (8:1) {#each projects as project}
    function create_each_block(ctx) {
    	let li;
    	let t;
    	let current;

    	const project = new Project({
    			props: { project: /*project*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(project.$$.fragment);
    			t = space();
    			add_location(li, file$2, 8, 2, 126);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(project, li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const project_changes = {};
    			if (dirty & /*projects*/ 1) project_changes.project = /*project*/ ctx[1];
    			project.$set(project_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(project.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(project.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(project);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(8:1) {#each projects as project}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let ul;
    	let current;
    	let each_value = /*projects*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(ul, file$2, 6, 0, 90);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*projects*/ 1) {
    				each_value = /*projects*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { projects = [] } = $$props;
    	const writable_props = ["projects"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ProjectList> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ProjectList", $$slots, []);

    	$$self.$set = $$props => {
    		if ("projects" in $$props) $$invalidate(0, projects = $$props.projects);
    	};

    	$$self.$capture_state = () => ({ Project, projects });

    	$$self.$inject_state = $$props => {
    		if ("projects" in $$props) $$invalidate(0, projects = $$props.projects);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [projects];
    }

    class ProjectList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { projects: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProjectList",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get projects() {
    		throw new Error("<ProjectList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set projects(value) {
    		throw new Error("<ProjectList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/MiniProject.svelte generated by Svelte v3.21.0 */

    const file$3 = "src/components/MiniProject.svelte";

    function create_fragment$4(ctx) {
    	let article;
    	let header;
    	let h3;
    	let a0;
    	let t1;
    	let time;
    	let t3;
    	let a1;
    	let img0;
    	let img0_src_value;
    	let t4;
    	let a2;
    	let img1;
    	let img1_src_value;

    	const block = {
    		c: function create() {
    			article = element("article");
    			header = element("header");
    			h3 = element("h3");
    			a0 = element("a");
    			a0.textContent = "Mini Project Title";
    			t1 = space();
    			time = element("time");
    			time.textContent = "October 20, 2015";
    			t3 = space();
    			a1 = element("a");
    			img0 = element("img");
    			t4 = space();
    			a2 = element("a");
    			img1 = element("img");
    			attr_dev(a0, "href", "");
    			add_location(a0, file$3, 6, 8, 95);
    			add_location(h3, file$3, 6, 4, 91);
    			attr_dev(time, "class", "published");
    			attr_dev(time, "datetime", "2015-10-20");
    			add_location(time, file$3, 7, 4, 138);
    			if (img0.src !== (img0_src_value = "")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$3, 8, 31, 239);
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "class", "author");
    			add_location(a1, file$3, 8, 4, 212);
    			add_location(header, file$3, 5, 2, 78);
    			if (img1.src !== (img1_src_value = "")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$3, 10, 27, 304);
    			attr_dev(a2, "href", "");
    			attr_dev(a2, "class", "image");
    			add_location(a2, file$3, 10, 2, 279);
    			attr_dev(article, "class", "miniProject");
    			add_location(article, file$3, 4, 0, 46);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, header);
    			append_dev(header, h3);
    			append_dev(h3, a0);
    			append_dev(header, t1);
    			append_dev(header, time);
    			append_dev(header, t3);
    			append_dev(header, a1);
    			append_dev(a1, img0);
    			append_dev(article, t4);
    			append_dev(article, a2);
    			append_dev(a2, img1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { miniProject } = $$props;
    	const writable_props = ["miniProject"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MiniProject> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("MiniProject", $$slots, []);

    	$$self.$set = $$props => {
    		if ("miniProject" in $$props) $$invalidate(0, miniProject = $$props.miniProject);
    	};

    	$$self.$capture_state = () => ({ miniProject });

    	$$self.$inject_state = $$props => {
    		if ("miniProject" in $$props) $$invalidate(0, miniProject = $$props.miniProject);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [miniProject];
    }

    class MiniProject extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { miniProject: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MiniProject",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*miniProject*/ ctx[0] === undefined && !("miniProject" in props)) {
    			console.warn("<MiniProject> was created without expected prop 'miniProject'");
    		}
    	}

    	get miniProject() {
    		throw new Error("<MiniProject>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set miniProject(value) {
    		throw new Error("<MiniProject>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/MiniProjectList.svelte generated by Svelte v3.21.0 */
    const file$4 = "src/components/MiniProjectList.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (9:4) {#each miniProjects as miniProject}
    function create_each_block$1(ctx) {
    	let li;
    	let t;
    	let current;

    	const miniproject = new MiniProject({
    			props: { miniProject: /*miniProject*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(miniproject.$$.fragment);
    			t = space();
    			add_location(li, file$4, 9, 6, 186);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(miniproject, li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const miniproject_changes = {};
    			if (dirty & /*miniProjects*/ 1) miniproject_changes.miniProject = /*miniProject*/ ctx[1];
    			miniproject.$set(miniproject_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(miniproject.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(miniproject.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(miniproject);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(9:4) {#each miniProjects as miniProject}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div;
    	let ul;
    	let current;
    	let each_value = /*miniProjects*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(ul, file$4, 7, 2, 135);
    			attr_dev(div, "class", "miniProjectList");
    			add_location(div, file$4, 6, 0, 103);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*miniProjects*/ 1) {
    				each_value = /*miniProjects*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { miniProjects = [] } = $$props;
    	const writable_props = ["miniProjects"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MiniProjectList> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("MiniProjectList", $$slots, []);

    	$$self.$set = $$props => {
    		if ("miniProjects" in $$props) $$invalidate(0, miniProjects = $$props.miniProjects);
    	};

    	$$self.$capture_state = () => ({ MiniProject, miniProjects });

    	$$self.$inject_state = $$props => {
    		if ("miniProjects" in $$props) $$invalidate(0, miniProjects = $$props.miniProjects);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [miniProjects];
    }

    class MiniProjectList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { miniProjects: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MiniProjectList",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get miniProjects() {
    		throw new Error("<MiniProjectList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set miniProjects(value) {
    		throw new Error("<MiniProjectList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/User.svelte generated by Svelte v3.21.0 */

    const file$5 = "src/components/User.svelte";

    function create_fragment$6(ctx) {
    	let article;
    	let header;
    	let h3;
    	let a0;
    	let t1;
    	let time;
    	let t3;
    	let a1;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			article = element("article");
    			header = element("header");
    			h3 = element("h3");
    			a0 = element("a");
    			a0.textContent = "Lorem ipsum fermentum ut nisl vitae";
    			t1 = space();
    			time = element("time");
    			time.textContent = "October 20, 2015";
    			t3 = space();
    			a1 = element("a");
    			img = element("img");
    			attr_dev(a0, "href", "#");
    			add_location(a0, file$5, 7, 6, 89);
    			add_location(h3, file$5, 6, 4, 78);
    			attr_dev(time, "class", "published");
    			attr_dev(time, "datetime", "2015-10-20");
    			add_location(time, file$5, 9, 4, 155);
    			add_location(header, file$5, 5, 2, 65);
    			if (img.src !== (img_src_value = "")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$5, 12, 4, 270);
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "class", "image");
    			add_location(a1, file$5, 11, 2, 239);
    			attr_dev(article, "class", "user");
    			add_location(article, file$5, 4, 0, 40);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, header);
    			append_dev(header, h3);
    			append_dev(h3, a0);
    			append_dev(header, t1);
    			append_dev(header, time);
    			append_dev(article, t3);
    			append_dev(article, a1);
    			append_dev(a1, img);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { user } = $$props;
    	const writable_props = ["user"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<User> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("User", $$slots, []);

    	$$self.$set = $$props => {
    		if ("user" in $$props) $$invalidate(0, user = $$props.user);
    	};

    	$$self.$capture_state = () => ({ user });

    	$$self.$inject_state = $$props => {
    		if ("user" in $$props) $$invalidate(0, user = $$props.user);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [user];
    }

    class User extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { user: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "User",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*user*/ ctx[0] === undefined && !("user" in props)) {
    			console.warn("<User> was created without expected prop 'user'");
    		}
    	}

    	get user() {
    		throw new Error("<User>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set user(value) {
    		throw new Error("<User>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/UserList.svelte generated by Svelte v3.21.0 */
    const file$6 = "src/components/UserList.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (11:2) {#each users as user}
    function create_each_block$2(ctx) {
    	let li;
    	let t;
    	let current;

    	const user = new User({
    			props: { user: /*user*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(user.$$.fragment);
    			t = space();
    			add_location(li, file$6, 11, 1, 134);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(user, li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const user_changes = {};
    			if (dirty & /*users*/ 1) user_changes.user = /*user*/ ctx[1];
    			user.$set(user_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(user.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(user.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(user);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(11:2) {#each users as user}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let section;
    	let ul;
    	let current;
    	let each_value = /*users*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			section = element("section");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "posts");
    			add_location(ul, file$6, 9, 0, 90);
    			add_location(section, file$6, 6, 0, 78);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*users*/ 1) {
    				each_value = /*users*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { users = [] } = $$props;
    	const writable_props = ["users"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<UserList> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("UserList", $$slots, []);

    	$$self.$set = $$props => {
    		if ("users" in $$props) $$invalidate(0, users = $$props.users);
    	};

    	$$self.$capture_state = () => ({ User, users });

    	$$self.$inject_state = $$props => {
    		if ("users" in $$props) $$invalidate(0, users = $$props.users);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [users];
    }

    class UserList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { users: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UserList",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get users() {
    		throw new Error("<UserList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set users(value) {
    		throw new Error("<UserList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/SideBar.svelte generated by Svelte v3.21.0 */
    const file$7 = "src/components/SideBar.svelte";

    function create_fragment$8(ctx) {
    	let section2;
    	let section0;
    	let a0;
    	let img;
    	let img_src_value;
    	let t0;
    	let header;
    	let h20;
    	let t2;
    	let p0;
    	let t3;
    	let a1;
    	let t5;
    	let t6;
    	let t7;
    	let section1;
    	let h21;
    	let t9;
    	let p1;
    	let t11;
    	let ul;
    	let li;
    	let a2;
    	let current;

    	const miniprojectlist = new MiniProjectList({
    			props: { miniProjects: /*miniProjects*/ ctx[0] },
    			$$inline: true
    		});

    	const userlist = new UserList({
    			props: { users: /*users*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section2 = element("section");
    			section0 = element("section");
    			a0 = element("a");
    			img = element("img");
    			t0 = space();
    			header = element("header");
    			h20 = element("h2");
    			h20.textContent = "Future Imperfect";
    			t2 = space();
    			p0 = element("p");
    			t3 = text("Another fine responsive site template by ");
    			a1 = element("a");
    			a1.textContent = "HTML5 UP";
    			t5 = space();
    			create_component(miniprojectlist.$$.fragment);
    			t6 = space();
    			create_component(userlist.$$.fragment);
    			t7 = space();
    			section1 = element("section");
    			h21 = element("h2");
    			h21.textContent = "About";
    			t9 = space();
    			p1 = element("p");
    			p1.textContent = "Mauris neque quam, fermentum ut nisl vitae, convallis maximus nisl. Sed mattis nunc id lorem euismod amet placerat. Vivamus porttitor magna enim, ac accumsan tortor cursus at phasellus sed ultricies.";
    			t11 = space();
    			ul = element("ul");
    			li = element("li");
    			a2 = element("a");
    			a2.textContent = "Learn More";
    			if (img.src !== (img_src_value = "images/logo.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$7, 11, 37, 292);
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "class", "logo");
    			add_location(a0, file$7, 11, 12, 267);
    			add_location(h20, file$7, 13, 16, 370);
    			attr_dev(a1, "href", "http://html5up.net");
    			add_location(a1, file$7, 14, 60, 456);
    			add_location(p0, file$7, 14, 16, 412);
    			add_location(header, file$7, 12, 12, 345);
    			attr_dev(section0, "id", "intro");
    			add_location(section0, file$7, 10, 8, 234);
    			add_location(h21, file$7, 26, 12, 726);
    			add_location(p1, file$7, 27, 12, 753);
    			attr_dev(a2, "href", "#");
    			attr_dev(a2, "class", "button");
    			add_location(a2, file$7, 29, 20, 1013);
    			add_location(li, file$7, 29, 16, 1009);
    			attr_dev(ul, "class", "actions");
    			add_location(ul, file$7, 28, 12, 972);
    			attr_dev(section1, "class", "blurb");
    			add_location(section1, file$7, 25, 8, 690);
    			attr_dev(section2, "id", "sidebar");
    			add_location(section2, file$7, 7, 0, 183);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section2, anchor);
    			append_dev(section2, section0);
    			append_dev(section0, a0);
    			append_dev(a0, img);
    			append_dev(section0, t0);
    			append_dev(section0, header);
    			append_dev(header, h20);
    			append_dev(header, t2);
    			append_dev(header, p0);
    			append_dev(p0, t3);
    			append_dev(p0, a1);
    			append_dev(section2, t5);
    			mount_component(miniprojectlist, section2, null);
    			append_dev(section2, t6);
    			mount_component(userlist, section2, null);
    			append_dev(section2, t7);
    			append_dev(section2, section1);
    			append_dev(section1, h21);
    			append_dev(section1, t9);
    			append_dev(section1, p1);
    			append_dev(section1, t11);
    			append_dev(section1, ul);
    			append_dev(ul, li);
    			append_dev(li, a2);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const miniprojectlist_changes = {};
    			if (dirty & /*miniProjects*/ 1) miniprojectlist_changes.miniProjects = /*miniProjects*/ ctx[0];
    			miniprojectlist.$set(miniprojectlist_changes);
    			const userlist_changes = {};
    			if (dirty & /*users*/ 2) userlist_changes.users = /*users*/ ctx[1];
    			userlist.$set(userlist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(miniprojectlist.$$.fragment, local);
    			transition_in(userlist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(miniprojectlist.$$.fragment, local);
    			transition_out(userlist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section2);
    			destroy_component(miniprojectlist);
    			destroy_component(userlist);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { miniProjects = [] } = $$props;
    	let { users = [] } = $$props;
    	const writable_props = ["miniProjects", "users"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SideBar> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("SideBar", $$slots, []);

    	$$self.$set = $$props => {
    		if ("miniProjects" in $$props) $$invalidate(0, miniProjects = $$props.miniProjects);
    		if ("users" in $$props) $$invalidate(1, users = $$props.users);
    	};

    	$$self.$capture_state = () => ({
    		MiniProjectList,
    		UserList,
    		miniProjects,
    		users
    	});

    	$$self.$inject_state = $$props => {
    		if ("miniProjects" in $$props) $$invalidate(0, miniProjects = $$props.miniProjects);
    		if ("users" in $$props) $$invalidate(1, users = $$props.users);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [miniProjects, users];
    }

    class SideBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { miniProjects: 0, users: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SideBar",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get miniProjects() {
    		throw new Error("<SideBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set miniProjects(value) {
    		throw new Error("<SideBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get users() {
    		throw new Error("<SideBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set users(value) {
    		throw new Error("<SideBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/Projects.svelte generated by Svelte v3.21.0 */
    const file$8 = "src/routes/Projects.svelte";

    function create_fragment$9(ctx) {
    	let main;
    	let div1;
    	let div0;
    	let t0;
    	let ul;
    	let li0;
    	let a0;
    	let t2;
    	let li1;
    	let a1;
    	let t4;
    	let current;

    	const projectlist = new ProjectList({
    			props: { projects: /*projects*/ ctx[2] },
    			$$inline: true
    		});

    	const sidebar = new SideBar({
    			props: {
    				miniProjects: /*miniProjects*/ ctx[0],
    				users: /*users*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			div0 = element("div");
    			create_component(projectlist.$$.fragment);
    			t0 = space();
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Previous Page";
    			t2 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "Next Page";
    			t4 = space();
    			create_component(sidebar.$$.fragment);
    			attr_dev(a0, "href", "");
    			attr_dev(a0, "class", "disabled button large previous");
    			add_location(a0, file$8, 39, 10, 861);
    			add_location(li0, file$8, 38, 8, 846);
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "class", "button large next");
    			add_location(a1, file$8, 42, 10, 966);
    			add_location(li1, file$8, 41, 8, 951);
    			attr_dev(ul, "class", "actions pagination");
    			add_location(ul, file$8, 37, 6, 806);
    			attr_dev(div0, "id", "main");
    			add_location(div0, file$8, 31, 4, 717);
    			attr_dev(div1, "id", "wrapper");
    			add_location(div1, file$8, 28, 2, 675);
    			add_location(main, file$8, 25, 0, 646);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			mount_component(projectlist, div0, null);
    			append_dev(div0, t0);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(ul, t2);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(div1, t4);
    			mount_component(sidebar, div1, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(projectlist.$$.fragment, local);
    			transition_in(sidebar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(projectlist.$$.fragment, local);
    			transition_out(sidebar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(projectlist);
    			destroy_component(sidebar);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function getResult() {
    	let response = await fetch(`http://127.0.0.1:3000/data`);
    	let text = await response.text();
    	let data = text;
    	let obj = JSON.parse(data);

    	return {
    		projects: obj.projects,
    		users: obj.people
    	};
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { url = "" } = $$props;
    	let miniProjects = [1, 2, 3];
    	let users = [1, 2, 3];
    	let projects = [1, 2, 3];
    	let res = getResult();
    	const writable_props = ["url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Projects> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Projects", $$slots, []);

    	$$self.$set = $$props => {
    		if ("url" in $$props) $$invalidate(3, url = $$props.url);
    	};

    	$$self.$capture_state = () => ({
    		ProjectList,
    		SideBar,
    		url,
    		miniProjects,
    		users,
    		projects,
    		getResult,
    		res
    	});

    	$$self.$inject_state = $$props => {
    		if ("url" in $$props) $$invalidate(3, url = $$props.url);
    		if ("miniProjects" in $$props) $$invalidate(0, miniProjects = $$props.miniProjects);
    		if ("users" in $$props) $$invalidate(1, users = $$props.users);
    		if ("projects" in $$props) $$invalidate(2, projects = $$props.projects);
    		if ("res" in $$props) res = $$props.res;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [miniProjects, users, projects, url];
    }

    class Projects extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { url: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Projects",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get url() {
    		throw new Error("<Projects>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Projects>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/Users.svelte generated by Svelte v3.21.0 */

    function create_fragment$a(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Users");
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Users> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Users", $$slots, []);
    	return [];
    }

    class Users extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Users",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    // import {
    let routes;
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('routemap')) {

        routes = {
            // Exact path
            '/': Home,
            '/projects': Projects,
            '/users': Users,

            // // Using named parameters, with last being optional
            // '/author/:first/:last?': Author,

            // // Wildcard parameter
            // '/book/*': Book,

            // // Catch-all
            // // This is optional, but if present it must be the last
            // '*': NotFound,
        };
    } else {
        routes = new Map();

        // Exact path
        routes.set('/', Home);
        routes.set('/projects', Projects);
        routes.set('/users', Users);
    }
    var routes$1 = routes;

    /* node_modules/svelte-spa-router/Router.svelte generated by Svelte v3.21.0 */

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation$1() {
    	const hashPosition = window.location.href.indexOf("#/");

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: "/";

    	// Check if there's a querystring
    	const qsPosition = location.indexOf("?");

    	let querystring = "";

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc$1 = readable(getLocation$1(), // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	const update = () => {
    		set(getLocation$1());
    	};

    	window.addEventListener("hashchange", update, false);

    	return function stop() {
    		window.removeEventListener("hashchange", update, false);
    	};
    });

    const location$1 = derived(loc$1, $loc => $loc.location);
    const querystring$1 = derived(loc$1, $loc => $loc.querystring);

    function link$1(node) {
    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != "a") {
    		throw Error("Action \"link\" can only be used with <a> tags");
    	}

    	// Destination must start with '/'
    	const href = node.getAttribute("href");

    	if (!href || href.length < 1 || href.charAt(0) != "/") {
    		throw Error("Invalid value for \"href\" attribute");
    	}

    	// Add # to every href attribute
    	node.setAttribute("href", "#" + href);
    }

    /* src/components/Navigation.svelte generated by Svelte v3.21.0 */
    const file$9 = "src/components/Navigation.svelte";

    function create_fragment$b(ctx) {
    	let div;
    	let header;
    	let h1;
    	let a0;
    	let t1;
    	let nav1;
    	let ul0;
    	let nav0;
    	let li0;
    	let a1;
    	let link_action;
    	let t3;
    	let li1;
    	let a2;
    	let link_action_1;
    	let t5;
    	let li2;
    	let a3;
    	let link_action_2;
    	let t7;
    	let nav2;
    	let ul1;
    	let li3;
    	let a4;
    	let t9;
    	let form0;
    	let input0;
    	let t10;
    	let li4;
    	let a5;
    	let t12;
    	let section3;
    	let section0;
    	let form1;
    	let input1;
    	let t13;
    	let section1;
    	let ul2;
    	let li5;
    	let a6;
    	let h30;
    	let t15;
    	let p0;
    	let t17;
    	let li6;
    	let a7;
    	let h31;
    	let t19;
    	let p1;
    	let t21;
    	let li7;
    	let a8;
    	let h32;
    	let t23;
    	let p2;
    	let t25;
    	let li8;
    	let a9;
    	let h33;
    	let t27;
    	let p3;
    	let t29;
    	let section2;
    	let ul3;
    	let li9;
    	let a10;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			header = element("header");
    			h1 = element("h1");
    			a0 = element("a");
    			a0.textContent = "Future Imperfect";
    			t1 = space();
    			nav1 = element("nav");
    			ul0 = element("ul");
    			nav0 = element("nav");
    			li0 = element("li");
    			a1 = element("a");
    			a1.textContent = "Home";
    			t3 = space();
    			li1 = element("li");
    			a2 = element("a");
    			a2.textContent = "Projects";
    			t5 = space();
    			li2 = element("li");
    			a3 = element("a");
    			a3.textContent = "Users";
    			t7 = space();
    			nav2 = element("nav");
    			ul1 = element("ul");
    			li3 = element("li");
    			a4 = element("a");
    			a4.textContent = "Search";
    			t9 = space();
    			form0 = element("form");
    			input0 = element("input");
    			t10 = space();
    			li4 = element("li");
    			a5 = element("a");
    			a5.textContent = "Menu";
    			t12 = space();
    			section3 = element("section");
    			section0 = element("section");
    			form1 = element("form");
    			input1 = element("input");
    			t13 = space();
    			section1 = element("section");
    			ul2 = element("ul");
    			li5 = element("li");
    			a6 = element("a");
    			h30 = element("h3");
    			h30.textContent = "Lorem ipsum";
    			t15 = space();
    			p0 = element("p");
    			p0.textContent = "Feugiat tempus veroeros dolor";
    			t17 = space();
    			li6 = element("li");
    			a7 = element("a");
    			h31 = element("h3");
    			h31.textContent = "Dolor sit amet";
    			t19 = space();
    			p1 = element("p");
    			p1.textContent = "Sed vitae justo condimentum";
    			t21 = space();
    			li7 = element("li");
    			a8 = element("a");
    			h32 = element("h3");
    			h32.textContent = "Feugiat veroeros";
    			t23 = space();
    			p2 = element("p");
    			p2.textContent = "Phasellus sed ultricies mi congue";
    			t25 = space();
    			li8 = element("li");
    			a9 = element("a");
    			h33 = element("h3");
    			h33.textContent = "Etiam sed consequat";
    			t27 = space();
    			p3 = element("p");
    			p3.textContent = "Porta lectus amet ultricies";
    			t29 = space();
    			section2 = element("section");
    			ul3 = element("ul");
    			li9 = element("li");
    			a10 = element("a");
    			a10.textContent = "Log In";
    			attr_dev(a0, "href", "index.html");
    			add_location(a0, file$9, 8, 6, 123);
    			add_location(h1, file$9, 7, 4, 112);
    			attr_dev(a1, "href", "/");
    			add_location(a1, file$9, 14, 12, 251);
    			add_location(li0, file$9, 13, 10, 234);
    			attr_dev(a2, "href", "/projects");
    			add_location(a2, file$9, 17, 12, 324);
    			add_location(li1, file$9, 16, 10, 307);
    			attr_dev(a3, "href", "/users");
    			add_location(a3, file$9, 20, 12, 409);
    			add_location(li2, file$9, 19, 10, 392);
    			add_location(nav0, file$9, 12, 8, 218);
    			add_location(ul0, file$9, 11, 6, 205);
    			attr_dev(nav1, "class", "links");
    			add_location(nav1, file$9, 10, 4, 179);
    			attr_dev(a4, "class", "fa-search");
    			attr_dev(a4, "href", "#search");
    			add_location(a4, file$9, 28, 10, 571);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "query");
    			attr_dev(input0, "placeholder", "Search");
    			add_location(input0, file$9, 30, 12, 683);
    			attr_dev(form0, "id", "search");
    			attr_dev(form0, "method", "get");
    			attr_dev(form0, "action", "#");
    			add_location(form0, file$9, 29, 10, 628);
    			attr_dev(li3, "class", "search");
    			add_location(li3, file$9, 27, 8, 541);
    			attr_dev(a5, "class", "fa-bars");
    			attr_dev(a5, "href", "#menu");
    			add_location(a5, file$9, 34, 10, 807);
    			attr_dev(li4, "class", "menu");
    			add_location(li4, file$9, 33, 8, 779);
    			add_location(ul1, file$9, 26, 6, 528);
    			attr_dev(nav2, "class", "main");
    			add_location(nav2, file$9, 25, 4, 503);
    			attr_dev(header, "id", "header");
    			add_location(header, file$9, 6, 2, 87);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "name", "query");
    			attr_dev(input1, "placeholder", "Search");
    			add_location(input1, file$9, 45, 8, 1030);
    			attr_dev(form1, "class", "search");
    			attr_dev(form1, "method", "get");
    			attr_dev(form1, "action", "#");
    			add_location(form1, file$9, 44, 6, 976);
    			add_location(section0, file$9, 43, 4, 960);
    			add_location(h30, file$9, 54, 12, 1222);
    			add_location(p0, file$9, 55, 12, 1255);
    			attr_dev(a6, "href", "#");
    			add_location(a6, file$9, 53, 10, 1197);
    			add_location(li5, file$9, 52, 8, 1182);
    			add_location(h31, file$9, 60, 12, 1369);
    			add_location(p1, file$9, 61, 12, 1405);
    			attr_dev(a7, "href", "#");
    			add_location(a7, file$9, 59, 10, 1344);
    			add_location(li6, file$9, 58, 8, 1329);
    			add_location(h32, file$9, 66, 12, 1517);
    			add_location(p2, file$9, 67, 12, 1555);
    			attr_dev(a8, "href", "#");
    			add_location(a8, file$9, 65, 10, 1492);
    			add_location(li7, file$9, 64, 8, 1477);
    			add_location(h33, file$9, 72, 12, 1673);
    			add_location(p3, file$9, 73, 12, 1714);
    			attr_dev(a9, "href", "#");
    			add_location(a9, file$9, 71, 10, 1648);
    			add_location(li8, file$9, 70, 8, 1633);
    			attr_dev(ul2, "class", "links");
    			add_location(ul2, file$9, 51, 6, 1155);
    			add_location(section1, file$9, 50, 4, 1139);
    			attr_dev(a10, "href", "#");
    			attr_dev(a10, "class", "button large fit");
    			add_location(a10, file$9, 83, 10, 1899);
    			add_location(li9, file$9, 82, 8, 1884);
    			attr_dev(ul3, "class", "actions stacked");
    			add_location(ul3, file$9, 81, 6, 1847);
    			add_location(section2, file$9, 80, 4, 1831);
    			attr_dev(section3, "id", "menu");
    			add_location(section3, file$9, 40, 2, 915);
    			add_location(div, file$9, 5, 0, 79);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, header);
    			append_dev(header, h1);
    			append_dev(h1, a0);
    			append_dev(header, t1);
    			append_dev(header, nav1);
    			append_dev(nav1, ul0);
    			append_dev(ul0, nav0);
    			append_dev(nav0, li0);
    			append_dev(li0, a1);
    			append_dev(nav0, t3);
    			append_dev(nav0, li1);
    			append_dev(li1, a2);
    			append_dev(nav0, t5);
    			append_dev(nav0, li2);
    			append_dev(li2, a3);
    			append_dev(header, t7);
    			append_dev(header, nav2);
    			append_dev(nav2, ul1);
    			append_dev(ul1, li3);
    			append_dev(li3, a4);
    			append_dev(li3, t9);
    			append_dev(li3, form0);
    			append_dev(form0, input0);
    			append_dev(ul1, t10);
    			append_dev(ul1, li4);
    			append_dev(li4, a5);
    			append_dev(div, t12);
    			append_dev(div, section3);
    			append_dev(section3, section0);
    			append_dev(section0, form1);
    			append_dev(form1, input1);
    			append_dev(section3, t13);
    			append_dev(section3, section1);
    			append_dev(section1, ul2);
    			append_dev(ul2, li5);
    			append_dev(li5, a6);
    			append_dev(a6, h30);
    			append_dev(a6, t15);
    			append_dev(a6, p0);
    			append_dev(ul2, t17);
    			append_dev(ul2, li6);
    			append_dev(li6, a7);
    			append_dev(a7, h31);
    			append_dev(a7, t19);
    			append_dev(a7, p1);
    			append_dev(ul2, t21);
    			append_dev(ul2, li7);
    			append_dev(li7, a8);
    			append_dev(a8, h32);
    			append_dev(a8, t23);
    			append_dev(a8, p2);
    			append_dev(ul2, t25);
    			append_dev(ul2, li8);
    			append_dev(li8, a9);
    			append_dev(a9, h33);
    			append_dev(a9, t27);
    			append_dev(a9, p3);
    			append_dev(section3, t29);
    			append_dev(section3, section2);
    			append_dev(section2, ul3);
    			append_dev(ul3, li9);
    			append_dev(li9, a10);
    			if (remount) run_all(dispose);

    			dispose = [
    				action_destroyer(link_action = link$1.call(null, a1)),
    				action_destroyer(link_action_1 = link$1.call(null, a2)),
    				action_destroyer(link_action_2 = link$1.call(null, a3))
    			];
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navigation> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Navigation", $$slots, []);
    	$$self.$capture_state = () => ({ link: link$1 });
    	return [];
    }

    class Navigation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navigation",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.21.0 */
    const file$a = "src/App.svelte";

    function create_fragment$c(ctx) {
    	let meta0;
    	let meta1;
    	let link;
    	let t0;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let current;
    	const navigation = new Navigation({ $$inline: true });
    	const router = new Router({ props: { routes: routes$1 }, $$inline: true });

    	const block = {
    		c: function create() {
    			meta0 = element("meta");
    			meta1 = element("meta");
    			link = element("link");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			create_component(navigation.$$.fragment);
    			t1 = space();
    			div1 = element("div");
    			create_component(router.$$.fragment);
    			attr_dev(meta0, "charset", "utf-8");
    			add_location(meta0, file$a, 11, 2, 309);
    			attr_dev(meta1, "name", "viewport");
    			attr_dev(meta1, "content", "width=device-width, initial-scale=1, user-scalable=no");
    			add_location(meta1, file$a, 12, 2, 336);
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "./assets/css/main.css");
    			add_location(link, file$a, 15, 2, 435);
    			add_location(div0, file$a, 19, 2, 514);
    			add_location(div1, file$a, 22, 2, 550);
    			add_location(div2, file$a, 18, 0, 506);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, meta0);
    			append_dev(document.head, meta1);
    			append_dev(document.head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			mount_component(navigation, div0, null);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			mount_component(router, div1, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navigation.$$.fragment, local);
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navigation.$$.fragment, local);
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(meta0);
    			detach_dev(meta1);
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			destroy_component(navigation);
    			destroy_component(router);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	$$self.$capture_state = () => ({ Router, routes: routes$1, Navigation });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    const app = new App({
    	target: document.getElementById("main_app"),
    	props: {
    		// name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
