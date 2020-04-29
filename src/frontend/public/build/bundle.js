
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
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
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
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
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
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
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
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

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
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
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
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
            info.resolved = promise;
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.20.1' }, detail)));
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
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
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

    /* Router.svelte generated by Svelte v3.20.1 */

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

    /* src/routes/Home.svelte generated by Svelte v3.20.1 */

    const file = "src/routes/Home.svelte";

    function create_fragment$1(ctx) {
    	let div2;
    	let div1;
    	let article;
    	let header;
    	let div0;
    	let h2;
    	let t1;
    	let p0;
    	let strong;
    	let t3;
    	let span;
    	let img;
    	let img_src_value;
    	let t4;
    	let p1;
    	let t6;
    	let p2;
    	let t8;
    	let p3;
    	let t10;
    	let p4;
    	let t12;
    	let p5;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			article = element("article");
    			header = element("header");
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Planet First";
    			t1 = space();
    			p0 = element("p");
    			strong = element("strong");
    			strong.textContent = "A collective and open ecosystem of planet- and human- centric projects";
    			t3 = space();
    			span = element("span");
    			img = element("img");
    			t4 = space();
    			p1 = element("p");
    			p1.textContent = "We are the Threefold Network, and have built a new peer-to-peer internet that empowers equality, freedom and sustainability. As we launch the ThreeFold Grid and many other experiences on top, the time has come for us to make our world peer-to-peer.";
    			t6 = space();
    			p2 = element("p");
    			p2.textContent = "As of the 29th of April 2020, the ThreeFold Network will enter a rolling launch with many exciting announcements for the world. This will start with the announcement of our Grid 2.0 upgrade and the availability of the ThreeFold Token on Stellar Exchange.";
    			t8 = space();
    			p3 = element("p");
    			p3.textContent = "The time has come to start building our peer-to-peer world together, and it goes without saying that a collective and equal approach is needed. Many beautiful projects have joined the Planet First Ecosystem, and together we aim to empower a better future for humanity and our planet.";
    			t10 = space();
    			p4 = element("p");
    			p4.textContent = "If not us, who? If not now, when?";
    			t12 = space();
    			p5 = element("p");
    			p5.textContent = "Interested to learn more? Explore the first projects living on the ThreeFold Network";
    			add_location(h2, file, 56, 10, 1263);
    			add_location(strong, file, 57, 13, 1298);
    			add_location(p0, file, 57, 10, 1295);
    			attr_dev(div0, "class", "title");
    			add_location(div0, file, 55, 9, 1233);
    			add_location(header, file, 54, 8, 1215);
    			if (img.src !== (img_src_value = "images/pic01.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file, 60, 37, 1461);
    			attr_dev(span, "class", "image featured");
    			add_location(span, file, 60, 8, 1432);
    			attr_dev(p1, "class", "home_tf");
    			add_location(p1, file, 61, 8, 1514);
    			attr_dev(p2, "class", "home_tf");
    			add_location(p2, file, 62, 8, 1794);
    			attr_dev(p3, "class", "home_tf");
    			add_location(p3, file, 63, 16, 2088);
    			attr_dev(p4, "class", "home_tf");
    			add_location(p4, file, 64, 16, 2411);
    			attr_dev(p5, "class", "home_tf");
    			add_location(p5, file, 65, 8, 2476);
    			attr_dev(article, "class", "post");
    			add_location(article, file, 53, 7, 1184);
    			attr_dev(div1, "id", "main");
    			add_location(div1, file, 50, 5, 1140);
    			attr_dev(div2, "id", "wrapper");
    			add_location(div2, file, 1, 3, 22);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, article);
    			append_dev(article, header);
    			append_dev(header, div0);
    			append_dev(div0, h2);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(p0, strong);
    			append_dev(article, t3);
    			append_dev(article, span);
    			append_dev(span, img);
    			append_dev(article, t4);
    			append_dev(article, p1);
    			append_dev(article, t6);
    			append_dev(article, p2);
    			append_dev(article, t8);
    			append_dev(article, p3);
    			append_dev(article, t10);
    			append_dev(article, p4);
    			append_dev(article, t12);
    			append_dev(article, p5);
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

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var defaults = createCommonjsModule(function (module) {
    function getDefaults() {
      return {
        baseUrl: null,
        breaks: false,
        gfm: true,
        headerIds: true,
        headerPrefix: '',
        highlight: null,
        langPrefix: 'language-',
        mangle: true,
        pedantic: false,
        renderer: null,
        sanitize: false,
        sanitizer: null,
        silent: false,
        smartLists: false,
        smartypants: false,
        tokenizer: null,
        xhtml: false
      };
    }

    function changeDefaults(newDefaults) {
      module.exports.defaults = newDefaults;
    }

    module.exports = {
      defaults: getDefaults(),
      getDefaults,
      changeDefaults
    };
    });
    var defaults_1 = defaults.defaults;
    var defaults_2 = defaults.getDefaults;
    var defaults_3 = defaults.changeDefaults;

    /**
     * Helpers
     */
    const escapeTest = /[&<>"']/;
    const escapeReplace = /[&<>"']/g;
    const escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
    const escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;
    const escapeReplacements = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    const getEscapeReplacement = (ch) => escapeReplacements[ch];
    function escape(html, encode) {
      if (encode) {
        if (escapeTest.test(html)) {
          return html.replace(escapeReplace, getEscapeReplacement);
        }
      } else {
        if (escapeTestNoEncode.test(html)) {
          return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
        }
      }

      return html;
    }

    const unescapeTest = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;

    function unescape(html) {
      // explicitly match decimal, hex, and named HTML entities
      return html.replace(unescapeTest, (_, n) => {
        n = n.toLowerCase();
        if (n === 'colon') return ':';
        if (n.charAt(0) === '#') {
          return n.charAt(1) === 'x'
            ? String.fromCharCode(parseInt(n.substring(2), 16))
            : String.fromCharCode(+n.substring(1));
        }
        return '';
      });
    }

    const caret = /(^|[^\[])\^/g;
    function edit(regex, opt) {
      regex = regex.source || regex;
      opt = opt || '';
      const obj = {
        replace: (name, val) => {
          val = val.source || val;
          val = val.replace(caret, '$1');
          regex = regex.replace(name, val);
          return obj;
        },
        getRegex: () => {
          return new RegExp(regex, opt);
        }
      };
      return obj;
    }

    const nonWordAndColonTest = /[^\w:]/g;
    const originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;
    function cleanUrl(sanitize, base, href) {
      if (sanitize) {
        let prot;
        try {
          prot = decodeURIComponent(unescape(href))
            .replace(nonWordAndColonTest, '')
            .toLowerCase();
        } catch (e) {
          return null;
        }
        if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
          return null;
        }
      }
      if (base && !originIndependentUrl.test(href)) {
        href = resolveUrl(base, href);
      }
      try {
        href = encodeURI(href).replace(/%25/g, '%');
      } catch (e) {
        return null;
      }
      return href;
    }

    const baseUrls = {};
    const justDomain = /^[^:]+:\/*[^/]*$/;
    const protocol = /^([^:]+:)[\s\S]*$/;
    const domain = /^([^:]+:\/*[^/]*)[\s\S]*$/;

    function resolveUrl(base, href) {
      if (!baseUrls[' ' + base]) {
        // we can ignore everything in base after the last slash of its path component,
        // but we might need to add _that_
        // https://tools.ietf.org/html/rfc3986#section-3
        if (justDomain.test(base)) {
          baseUrls[' ' + base] = base + '/';
        } else {
          baseUrls[' ' + base] = rtrim(base, '/', true);
        }
      }
      base = baseUrls[' ' + base];
      const relativeBase = base.indexOf(':') === -1;

      if (href.substring(0, 2) === '//') {
        if (relativeBase) {
          return href;
        }
        return base.replace(protocol, '$1') + href;
      } else if (href.charAt(0) === '/') {
        if (relativeBase) {
          return href;
        }
        return base.replace(domain, '$1') + href;
      } else {
        return base + href;
      }
    }

    const noopTest = { exec: function noopTest() {} };

    function merge(obj) {
      let i = 1,
        target,
        key;

      for (; i < arguments.length; i++) {
        target = arguments[i];
        for (key in target) {
          if (Object.prototype.hasOwnProperty.call(target, key)) {
            obj[key] = target[key];
          }
        }
      }

      return obj;
    }

    function splitCells(tableRow, count) {
      // ensure that every cell-delimiting pipe has a space
      // before it to distinguish it from an escaped pipe
      const row = tableRow.replace(/\|/g, (match, offset, str) => {
          let escaped = false,
            curr = offset;
          while (--curr >= 0 && str[curr] === '\\') escaped = !escaped;
          if (escaped) {
            // odd number of slashes means | is escaped
            // so we leave it alone
            return '|';
          } else {
            // add space before unescaped |
            return ' |';
          }
        }),
        cells = row.split(/ \|/);
      let i = 0;

      if (cells.length > count) {
        cells.splice(count);
      } else {
        while (cells.length < count) cells.push('');
      }

      for (; i < cells.length; i++) {
        // leading or trailing whitespace is ignored per the gfm spec
        cells[i] = cells[i].trim().replace(/\\\|/g, '|');
      }
      return cells;
    }

    // Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
    // /c*$/ is vulnerable to REDOS.
    // invert: Remove suffix of non-c chars instead. Default falsey.
    function rtrim(str, c, invert) {
      const l = str.length;
      if (l === 0) {
        return '';
      }

      // Length of suffix matching the invert condition.
      let suffLen = 0;

      // Step left until we fail to match the invert condition.
      while (suffLen < l) {
        const currChar = str.charAt(l - suffLen - 1);
        if (currChar === c && !invert) {
          suffLen++;
        } else if (currChar !== c && invert) {
          suffLen++;
        } else {
          break;
        }
      }

      return str.substr(0, l - suffLen);
    }

    function findClosingBracket(str, b) {
      if (str.indexOf(b[1]) === -1) {
        return -1;
      }
      const l = str.length;
      let level = 0,
        i = 0;
      for (; i < l; i++) {
        if (str[i] === '\\') {
          i++;
        } else if (str[i] === b[0]) {
          level++;
        } else if (str[i] === b[1]) {
          level--;
          if (level < 0) {
            return i;
          }
        }
      }
      return -1;
    }

    function checkSanitizeDeprecation(opt) {
      if (opt && opt.sanitize && !opt.silent) {
        console.warn('marked(): sanitize and sanitizer parameters are deprecated since version 0.7.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/#/USING_ADVANCED.md#options');
      }
    }

    var helpers = {
      escape,
      unescape,
      edit,
      cleanUrl,
      resolveUrl,
      noopTest,
      merge,
      splitCells,
      rtrim,
      findClosingBracket,
      checkSanitizeDeprecation
    };

    const { defaults: defaults$1 } = defaults;
    const {
      rtrim: rtrim$1,
      splitCells: splitCells$1,
      escape: escape$1,
      findClosingBracket: findClosingBracket$1
    } = helpers;

    function outputLink(cap, link, raw) {
      const href = link.href;
      const title = link.title ? escape$1(link.title) : null;

      if (cap[0].charAt(0) !== '!') {
        return {
          type: 'link',
          raw,
          href,
          title,
          text: cap[1]
        };
      } else {
        return {
          type: 'image',
          raw,
          text: escape$1(cap[1]),
          href,
          title
        };
      }
    }

    /**
     * Tokenizer
     */
    var Tokenizer_1 = class Tokenizer {
      constructor(options) {
        this.options = options || defaults$1;
      }

      space(src) {
        const cap = this.rules.block.newline.exec(src);
        if (cap) {
          if (cap[0].length > 1) {
            return {
              type: 'space',
              raw: cap[0]
            };
          }
          return { raw: '\n' };
        }
      }

      code(src, tokens) {
        const cap = this.rules.block.code.exec(src);
        if (cap) {
          const lastToken = tokens[tokens.length - 1];
          // An indented code block cannot interrupt a paragraph.
          if (lastToken && lastToken.type === 'paragraph') {
            tokens.pop();
            lastToken.text += '\n' + cap[0].trimRight();
            lastToken.raw += '\n' + cap[0];
            return lastToken;
          } else {
            const text = cap[0].replace(/^ {4}/gm, '');
            return {
              type: 'code',
              raw: cap[0],
              codeBlockStyle: 'indented',
              text: !this.options.pedantic
                ? rtrim$1(text, '\n')
                : text
            };
          }
        }
      }

      fences(src) {
        const cap = this.rules.block.fences.exec(src);
        if (cap) {
          return {
            type: 'code',
            raw: cap[0],
            lang: cap[2] ? cap[2].trim() : cap[2],
            text: cap[3] || ''
          };
        }
      }

      heading(src) {
        const cap = this.rules.block.heading.exec(src);
        if (cap) {
          return {
            type: 'heading',
            raw: cap[0],
            depth: cap[1].length,
            text: cap[2]
          };
        }
      }

      nptable(src) {
        const cap = this.rules.block.nptable.exec(src);
        if (cap) {
          const item = {
            type: 'table',
            header: splitCells$1(cap[1].replace(/^ *| *\| *$/g, '')),
            align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
            cells: cap[3] ? cap[3].replace(/\n$/, '').split('\n') : [],
            raw: cap[0]
          };

          if (item.header.length === item.align.length) {
            let l = item.align.length;
            let i;
            for (i = 0; i < l; i++) {
              if (/^ *-+: *$/.test(item.align[i])) {
                item.align[i] = 'right';
              } else if (/^ *:-+: *$/.test(item.align[i])) {
                item.align[i] = 'center';
              } else if (/^ *:-+ *$/.test(item.align[i])) {
                item.align[i] = 'left';
              } else {
                item.align[i] = null;
              }
            }

            l = item.cells.length;
            for (i = 0; i < l; i++) {
              item.cells[i] = splitCells$1(item.cells[i], item.header.length);
            }

            return item;
          }
        }
      }

      hr(src) {
        const cap = this.rules.block.hr.exec(src);
        if (cap) {
          return {
            type: 'hr',
            raw: cap[0]
          };
        }
      }

      blockquote(src) {
        const cap = this.rules.block.blockquote.exec(src);
        if (cap) {
          const text = cap[0].replace(/^ *> ?/gm, '');

          return {
            type: 'blockquote',
            raw: cap[0],
            text
          };
        }
      }

      list(src) {
        const cap = this.rules.block.list.exec(src);
        if (cap) {
          let raw = cap[0];
          const bull = cap[2];
          const isordered = bull.length > 1;

          const list = {
            type: 'list',
            raw,
            ordered: isordered,
            start: isordered ? +bull : '',
            loose: false,
            items: []
          };

          // Get each top-level item.
          const itemMatch = cap[0].match(this.rules.block.item);

          let next = false,
            item,
            space,
            b,
            addBack,
            loose,
            istask,
            ischecked;

          const l = itemMatch.length;
          for (let i = 0; i < l; i++) {
            item = itemMatch[i];
            raw = item;

            // Remove the list item's bullet
            // so it is seen as the next token.
            space = item.length;
            item = item.replace(/^ *([*+-]|\d+\.) */, '');

            // Outdent whatever the
            // list item contains. Hacky.
            if (~item.indexOf('\n ')) {
              space -= item.length;
              item = !this.options.pedantic
                ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
                : item.replace(/^ {1,4}/gm, '');
            }

            // Determine whether the next list item belongs here.
            // Backpedal if it does not belong in this list.
            if (i !== l - 1) {
              b = this.rules.block.bullet.exec(itemMatch[i + 1])[0];
              if (bull.length > 1 ? b.length === 1
                : (b.length > 1 || (this.options.smartLists && b !== bull))) {
                addBack = itemMatch.slice(i + 1).join('\n');
                list.raw = list.raw.substring(0, list.raw.length - addBack.length);
                i = l - 1;
              }
            }

            // Determine whether item is loose or not.
            // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
            // for discount behavior.
            loose = next || /\n\n(?!\s*$)/.test(item);
            if (i !== l - 1) {
              next = item.charAt(item.length - 1) === '\n';
              if (!loose) loose = next;
            }

            if (loose) {
              list.loose = true;
            }

            // Check for task list items
            istask = /^\[[ xX]\] /.test(item);
            ischecked = undefined;
            if (istask) {
              ischecked = item[1] !== ' ';
              item = item.replace(/^\[[ xX]\] +/, '');
            }

            list.items.push({
              raw,
              task: istask,
              checked: ischecked,
              loose: loose,
              text: item
            });
          }

          return list;
        }
      }

      html(src) {
        const cap = this.rules.block.html.exec(src);
        if (cap) {
          return {
            type: this.options.sanitize
              ? 'paragraph'
              : 'html',
            raw: cap[0],
            pre: !this.options.sanitizer
              && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
            text: this.options.sanitize ? (this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape$1(cap[0])) : cap[0]
          };
        }
      }

      def(src) {
        const cap = this.rules.block.def.exec(src);
        if (cap) {
          if (cap[3]) cap[3] = cap[3].substring(1, cap[3].length - 1);
          const tag = cap[1].toLowerCase().replace(/\s+/g, ' ');
          return {
            tag,
            raw: cap[0],
            href: cap[2],
            title: cap[3]
          };
        }
      }

      table(src) {
        const cap = this.rules.block.table.exec(src);
        if (cap) {
          const item = {
            type: 'table',
            header: splitCells$1(cap[1].replace(/^ *| *\| *$/g, '')),
            align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
            cells: cap[3] ? cap[3].replace(/\n$/, '').split('\n') : []
          };

          if (item.header.length === item.align.length) {
            item.raw = cap[0];

            let l = item.align.length;
            let i;
            for (i = 0; i < l; i++) {
              if (/^ *-+: *$/.test(item.align[i])) {
                item.align[i] = 'right';
              } else if (/^ *:-+: *$/.test(item.align[i])) {
                item.align[i] = 'center';
              } else if (/^ *:-+ *$/.test(item.align[i])) {
                item.align[i] = 'left';
              } else {
                item.align[i] = null;
              }
            }

            l = item.cells.length;
            for (i = 0; i < l; i++) {
              item.cells[i] = splitCells$1(
                item.cells[i].replace(/^ *\| *| *\| *$/g, ''),
                item.header.length);
            }

            return item;
          }
        }
      }

      lheading(src) {
        const cap = this.rules.block.lheading.exec(src);
        if (cap) {
          return {
            type: 'heading',
            raw: cap[0],
            depth: cap[2].charAt(0) === '=' ? 1 : 2,
            text: cap[1]
          };
        }
      }

      paragraph(src) {
        const cap = this.rules.block.paragraph.exec(src);
        if (cap) {
          return {
            type: 'paragraph',
            raw: cap[0],
            text: cap[1].charAt(cap[1].length - 1) === '\n'
              ? cap[1].slice(0, -1)
              : cap[1]
          };
        }
      }

      text(src) {
        const cap = this.rules.block.text.exec(src);
        if (cap) {
          return {
            type: 'text',
            raw: cap[0],
            text: cap[0]
          };
        }
      }

      escape(src) {
        const cap = this.rules.inline.escape.exec(src);
        if (cap) {
          return {
            type: 'escape',
            raw: cap[0],
            text: escape$1(cap[1])
          };
        }
      }

      tag(src, inLink, inRawBlock) {
        const cap = this.rules.inline.tag.exec(src);
        if (cap) {
          if (!inLink && /^<a /i.test(cap[0])) {
            inLink = true;
          } else if (inLink && /^<\/a>/i.test(cap[0])) {
            inLink = false;
          }
          if (!inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
            inRawBlock = true;
          } else if (inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
            inRawBlock = false;
          }

          return {
            type: this.options.sanitize
              ? 'text'
              : 'html',
            raw: cap[0],
            inLink,
            inRawBlock,
            text: this.options.sanitize
              ? (this.options.sanitizer
                ? this.options.sanitizer(cap[0])
                : escape$1(cap[0]))
              : cap[0]
          };
        }
      }

      link(src) {
        const cap = this.rules.inline.link.exec(src);
        if (cap) {
          const lastParenIndex = findClosingBracket$1(cap[2], '()');
          if (lastParenIndex > -1) {
            const start = cap[0].indexOf('!') === 0 ? 5 : 4;
            const linkLen = start + cap[1].length + lastParenIndex;
            cap[2] = cap[2].substring(0, lastParenIndex);
            cap[0] = cap[0].substring(0, linkLen).trim();
            cap[3] = '';
          }
          let href = cap[2];
          let title = '';
          if (this.options.pedantic) {
            const link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);

            if (link) {
              href = link[1];
              title = link[3];
            } else {
              title = '';
            }
          } else {
            title = cap[3] ? cap[3].slice(1, -1) : '';
          }
          href = href.trim().replace(/^<([\s\S]*)>$/, '$1');
          const token = outputLink(cap, {
            href: href ? href.replace(this.rules.inline._escapes, '$1') : href,
            title: title ? title.replace(this.rules.inline._escapes, '$1') : title
          }, cap[0]);
          return token;
        }
      }

      reflink(src, links) {
        let cap;
        if ((cap = this.rules.inline.reflink.exec(src))
            || (cap = this.rules.inline.nolink.exec(src))) {
          let link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
          link = links[link.toLowerCase()];
          if (!link || !link.href) {
            const text = cap[0].charAt(0);
            return {
              type: 'text',
              raw: text,
              text
            };
          }
          const token = outputLink(cap, link, cap[0]);
          return token;
        }
      }

      strong(src) {
        const cap = this.rules.inline.strong.exec(src);
        if (cap) {
          return {
            type: 'strong',
            raw: cap[0],
            text: cap[4] || cap[3] || cap[2] || cap[1]
          };
        }
      }

      em(src) {
        const cap = this.rules.inline.em.exec(src);
        if (cap) {
          return {
            type: 'em',
            raw: cap[0],
            text: cap[6] || cap[5] || cap[4] || cap[3] || cap[2] || cap[1]
          };
        }
      }

      codespan(src) {
        const cap = this.rules.inline.code.exec(src);
        if (cap) {
          return {
            type: 'codespan',
            raw: cap[0],
            text: escape$1(cap[2].trim(), true)
          };
        }
      }

      br(src) {
        const cap = this.rules.inline.br.exec(src);
        if (cap) {
          return {
            type: 'br',
            raw: cap[0]
          };
        }
      }

      del(src) {
        const cap = this.rules.inline.del.exec(src);
        if (cap) {
          return {
            type: 'del',
            raw: cap[0],
            text: cap[1]
          };
        }
      }

      autolink(src, mangle) {
        const cap = this.rules.inline.autolink.exec(src);
        if (cap) {
          let text, href;
          if (cap[2] === '@') {
            text = escape$1(this.options.mangle ? mangle(cap[1]) : cap[1]);
            href = 'mailto:' + text;
          } else {
            text = escape$1(cap[1]);
            href = text;
          }

          return {
            type: 'link',
            raw: cap[0],
            text,
            href,
            tokens: [
              {
                type: 'text',
                raw: text,
                text
              }
            ]
          };
        }
      }

      url(src, mangle) {
        let cap;
        if (cap = this.rules.inline.url.exec(src)) {
          let text, href;
          if (cap[2] === '@') {
            text = escape$1(this.options.mangle ? mangle(cap[0]) : cap[0]);
            href = 'mailto:' + text;
          } else {
            // do extended autolink path validation
            let prevCapZero;
            do {
              prevCapZero = cap[0];
              cap[0] = this.rules.inline._backpedal.exec(cap[0])[0];
            } while (prevCapZero !== cap[0]);
            text = escape$1(cap[0]);
            if (cap[1] === 'www.') {
              href = 'http://' + text;
            } else {
              href = text;
            }
          }
          return {
            type: 'link',
            raw: cap[0],
            text,
            href,
            tokens: [
              {
                type: 'text',
                raw: text,
                text
              }
            ]
          };
        }
      }

      inlineText(src, inRawBlock, smartypants) {
        const cap = this.rules.inline.text.exec(src);
        if (cap) {
          let text;
          if (inRawBlock) {
            text = this.options.sanitize ? (this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape$1(cap[0])) : cap[0];
          } else {
            text = escape$1(this.options.smartypants ? smartypants(cap[0]) : cap[0]);
          }
          return {
            type: 'text',
            raw: cap[0],
            text
          };
        }
      }
    };

    const {
      noopTest: noopTest$1,
      edit: edit$1,
      merge: merge$1
    } = helpers;

    /**
     * Block-Level Grammar
     */
    const block = {
      newline: /^\n+/,
      code: /^( {4}[^\n]+\n*)+/,
      fences: /^ {0,3}(`{3,}(?=[^`\n]*\n)|~{3,})([^\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?:\n+|$)|$)/,
      hr: /^ {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)/,
      heading: /^ {0,3}(#{1,6}) +([^\n]*?)(?: +#+)? *(?:\n+|$)/,
      blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
      list: /^( {0,3})(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
      html: '^ {0,3}(?:' // optional indentation
        + '<(script|pre|style)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)' // (1)
        + '|comment[^\\n]*(\\n+|$)' // (2)
        + '|<\\?[\\s\\S]*?\\?>\\n*' // (3)
        + '|<![A-Z][\\s\\S]*?>\\n*' // (4)
        + '|<!\\[CDATA\\[[\\s\\S]*?\\]\\]>\\n*' // (5)
        + '|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:\\n{2,}|$)' // (6)
        + '|<(?!script|pre|style)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$)' // (7) open tag
        + '|</(?!script|pre|style)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$)' // (7) closing tag
        + ')',
      def: /^ {0,3}\[(label)\]: *\n? *<?([^\s>]+)>?(?:(?: +\n? *| *\n *)(title))? *(?:\n+|$)/,
      nptable: noopTest$1,
      table: noopTest$1,
      lheading: /^([^\n]+)\n {0,3}(=+|-+) *(?:\n+|$)/,
      // regex template, placeholders will be replaced according to different paragraph
      // interruption rules of commonmark and the original markdown spec:
      _paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html)[^\n]+)*)/,
      text: /^[^\n]+/
    };

    block._label = /(?!\s*\])(?:\\[\[\]]|[^\[\]])+/;
    block._title = /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/;
    block.def = edit$1(block.def)
      .replace('label', block._label)
      .replace('title', block._title)
      .getRegex();

    block.bullet = /(?:[*+-]|\d{1,9}\.)/;
    block.item = /^( *)(bull) ?[^\n]*(?:\n(?!\1bull ?)[^\n]*)*/;
    block.item = edit$1(block.item, 'gm')
      .replace(/bull/g, block.bullet)
      .getRegex();

    block.list = edit$1(block.list)
      .replace(/bull/g, block.bullet)
      .replace('hr', '\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))')
      .replace('def', '\\n+(?=' + block.def.source + ')')
      .getRegex();

    block._tag = 'address|article|aside|base|basefont|blockquote|body|caption'
      + '|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption'
      + '|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe'
      + '|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option'
      + '|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr'
      + '|track|ul';
    block._comment = /<!--(?!-?>)[\s\S]*?-->/;
    block.html = edit$1(block.html, 'i')
      .replace('comment', block._comment)
      .replace('tag', block._tag)
      .replace('attribute', / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/)
      .getRegex();

    block.paragraph = edit$1(block._paragraph)
      .replace('hr', block.hr)
      .replace('heading', ' {0,3}#{1,6} ')
      .replace('|lheading', '') // setex headings don't interrupt commonmark paragraphs
      .replace('blockquote', ' {0,3}>')
      .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
      .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)')
      .replace('tag', block._tag) // pars can be interrupted by type (6) html blocks
      .getRegex();

    block.blockquote = edit$1(block.blockquote)
      .replace('paragraph', block.paragraph)
      .getRegex();

    /**
     * Normal Block Grammar
     */

    block.normal = merge$1({}, block);

    /**
     * GFM Block Grammar
     */

    block.gfm = merge$1({}, block.normal, {
      nptable: '^ *([^|\\n ].*\\|.*)\\n' // Header
        + ' *([-:]+ *\\|[-| :]*)' // Align
        + '(?:\\n((?:(?!\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)', // Cells
      table: '^ *\\|(.+)\\n' // Header
        + ' *\\|?( *[-:]+[-| :]*)' // Align
        + '(?:\\n *((?:(?!\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)' // Cells
    });

    block.gfm.nptable = edit$1(block.gfm.nptable)
      .replace('hr', block.hr)
      .replace('heading', ' {0,3}#{1,6} ')
      .replace('blockquote', ' {0,3}>')
      .replace('code', ' {4}[^\\n]')
      .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
      .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)')
      .replace('tag', block._tag) // tables can be interrupted by type (6) html blocks
      .getRegex();

    block.gfm.table = edit$1(block.gfm.table)
      .replace('hr', block.hr)
      .replace('heading', ' {0,3}#{1,6} ')
      .replace('blockquote', ' {0,3}>')
      .replace('code', ' {4}[^\\n]')
      .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
      .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)')
      .replace('tag', block._tag) // tables can be interrupted by type (6) html blocks
      .getRegex();

    /**
     * Pedantic grammar (original John Gruber's loose markdown specification)
     */

    block.pedantic = merge$1({}, block.normal, {
      html: edit$1(
        '^ *(?:comment *(?:\\n|\\s*$)'
        + '|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)' // closed tag
        + '|<tag(?:"[^"]*"|\'[^\']*\'|\\s[^\'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))')
        .replace('comment', block._comment)
        .replace(/tag/g, '(?!(?:'
          + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub'
          + '|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)'
          + '\\b)\\w+(?!:|[^\\w\\s@]*@)\\b')
        .getRegex(),
      def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
      heading: /^ *(#{1,6}) *([^\n]+?) *(?:#+ *)?(?:\n+|$)/,
      fences: noopTest$1, // fences not supported
      paragraph: edit$1(block.normal._paragraph)
        .replace('hr', block.hr)
        .replace('heading', ' *#{1,6} *[^\n]')
        .replace('lheading', block.lheading)
        .replace('blockquote', ' {0,3}>')
        .replace('|fences', '')
        .replace('|list', '')
        .replace('|html', '')
        .getRegex()
    });

    /**
     * Inline-Level Grammar
     */
    const inline = {
      escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
      autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
      url: noopTest$1,
      tag: '^comment'
        + '|^</[a-zA-Z][\\w:-]*\\s*>' // self-closing tag
        + '|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>' // open tag
        + '|^<\\?[\\s\\S]*?\\?>' // processing instruction, e.g. <?php ?>
        + '|^<![a-zA-Z]+\\s[\\s\\S]*?>' // declaration, e.g. <!DOCTYPE html>
        + '|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>', // CDATA section
      link: /^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,
      reflink: /^!?\[(label)\]\[(?!\s*\])((?:\\[\[\]]?|[^\[\]\\])+)\]/,
      nolink: /^!?\[(?!\s*\])((?:\[[^\[\]]*\]|\\[\[\]]|[^\[\]])*)\](?:\[\])?/,
      strong: /^__([^\s_])__(?!_)|^\*\*([^\s*])\*\*(?!\*)|^__([^\s][\s\S]*?[^\s])__(?!_)|^\*\*([^\s][\s\S]*?[^\s])\*\*(?!\*)/,
      em: /^_([^\s_])_(?!_)|^_([^\s_<][\s\S]*?[^\s_])_(?!_|[^\spunctuation])|^_([^\s_<][\s\S]*?[^\s])_(?!_|[^\spunctuation])|^\*([^\s*<\[])\*(?!\*)|^\*([^\s<"][\s\S]*?[^\s\[\*])\*(?![\]`punctuation])|^\*([^\s*"<\[][\s\S]*[^\s])\*(?!\*)/,
      code: /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
      br: /^( {2,}|\\)\n(?!\s*$)/,
      del: noopTest$1,
      text: /^(`+|[^`])(?:[\s\S]*?(?:(?=[\\<!\[`*]|\b_|$)|[^ ](?= {2,}\n))|(?= {2,}\n))/
    };

    // list of punctuation marks from common mark spec
    // without ` and ] to workaround Rule 17 (inline code blocks/links)
    inline._punctuation = '!"#$%&\'()*+\\-./:;<=>?@\\[^_{|}~';
    inline.em = edit$1(inline.em).replace(/punctuation/g, inline._punctuation).getRegex();

    inline._escapes = /\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g;

    inline._scheme = /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/;
    inline._email = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/;
    inline.autolink = edit$1(inline.autolink)
      .replace('scheme', inline._scheme)
      .replace('email', inline._email)
      .getRegex();

    inline._attribute = /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/;

    inline.tag = edit$1(inline.tag)
      .replace('comment', block._comment)
      .replace('attribute', inline._attribute)
      .getRegex();

    inline._label = /(?:\[[^\[\]]*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
    inline._href = /<(?:\\[<>]?|[^\s<>\\])*>|[^\s\x00-\x1f]*/;
    inline._title = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;

    inline.link = edit$1(inline.link)
      .replace('label', inline._label)
      .replace('href', inline._href)
      .replace('title', inline._title)
      .getRegex();

    inline.reflink = edit$1(inline.reflink)
      .replace('label', inline._label)
      .getRegex();

    /**
     * Normal Inline Grammar
     */

    inline.normal = merge$1({}, inline);

    /**
     * Pedantic Inline Grammar
     */

    inline.pedantic = merge$1({}, inline.normal, {
      strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
      em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/,
      link: edit$1(/^!?\[(label)\]\((.*?)\)/)
        .replace('label', inline._label)
        .getRegex(),
      reflink: edit$1(/^!?\[(label)\]\s*\[([^\]]*)\]/)
        .replace('label', inline._label)
        .getRegex()
    });

    /**
     * GFM Inline Grammar
     */

    inline.gfm = merge$1({}, inline.normal, {
      escape: edit$1(inline.escape).replace('])', '~|])').getRegex(),
      _extended_email: /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,
      url: /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,
      _backpedal: /(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/,
      del: /^~+(?=\S)([\s\S]*?\S)~+/,
      text: /^(`+|[^`])(?:[\s\S]*?(?:(?=[\\<!\[`*~]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))|(?= {2,}\n|[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))/
    });

    inline.gfm.url = edit$1(inline.gfm.url, 'i')
      .replace('email', inline.gfm._extended_email)
      .getRegex();
    /**
     * GFM + Line Breaks Inline Grammar
     */

    inline.breaks = merge$1({}, inline.gfm, {
      br: edit$1(inline.br).replace('{2,}', '*').getRegex(),
      text: edit$1(inline.gfm.text)
        .replace('\\b_', '\\b_| {2,}\\n')
        .replace(/\{2,\}/g, '*')
        .getRegex()
    });

    var rules = {
      block,
      inline
    };

    const { defaults: defaults$2 } = defaults;
    const { block: block$1, inline: inline$1 } = rules;

    /**
     * smartypants text replacement
     */
    function smartypants(text) {
      return text
        // em-dashes
        .replace(/---/g, '\u2014')
        // en-dashes
        .replace(/--/g, '\u2013')
        // opening singles
        .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
        // closing singles & apostrophes
        .replace(/'/g, '\u2019')
        // opening doubles
        .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
        // closing doubles
        .replace(/"/g, '\u201d')
        // ellipses
        .replace(/\.{3}/g, '\u2026');
    }

    /**
     * mangle email addresses
     */
    function mangle(text) {
      let out = '',
        i,
        ch;

      const l = text.length;
      for (i = 0; i < l; i++) {
        ch = text.charCodeAt(i);
        if (Math.random() > 0.5) {
          ch = 'x' + ch.toString(16);
        }
        out += '&#' + ch + ';';
      }

      return out;
    }

    /**
     * Block Lexer
     */
    var Lexer_1 = class Lexer {
      constructor(options) {
        this.tokens = [];
        this.tokens.links = Object.create(null);
        this.options = options || defaults$2;
        this.options.tokenizer = this.options.tokenizer || new Tokenizer_1();
        this.tokenizer = this.options.tokenizer;
        this.tokenizer.options = this.options;

        const rules = {
          block: block$1.normal,
          inline: inline$1.normal
        };

        if (this.options.pedantic) {
          rules.block = block$1.pedantic;
          rules.inline = inline$1.pedantic;
        } else if (this.options.gfm) {
          rules.block = block$1.gfm;
          if (this.options.breaks) {
            rules.inline = inline$1.breaks;
          } else {
            rules.inline = inline$1.gfm;
          }
        }
        this.tokenizer.rules = rules;
      }

      /**
       * Expose Rules
       */
      static get rules() {
        return {
          block: block$1,
          inline: inline$1
        };
      }

      /**
       * Static Lex Method
       */
      static lex(src, options) {
        const lexer = new Lexer(options);
        return lexer.lex(src);
      }

      /**
       * Preprocessing
       */
      lex(src) {
        src = src
          .replace(/\r\n|\r/g, '\n')
          .replace(/\t/g, '    ');

        this.blockTokens(src, this.tokens, true);

        this.inline(this.tokens);

        return this.tokens;
      }

      /**
       * Lexing
       */
      blockTokens(src, tokens = [], top = true) {
        src = src.replace(/^ +$/gm, '');
        let token, i, l;

        while (src) {
          // newline
          if (token = this.tokenizer.space(src)) {
            src = src.substring(token.raw.length);
            if (token.type) {
              tokens.push(token);
            }
            continue;
          }

          // code
          if (token = this.tokenizer.code(src, tokens)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // fences
          if (token = this.tokenizer.fences(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // heading
          if (token = this.tokenizer.heading(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // table no leading pipe (gfm)
          if (token = this.tokenizer.nptable(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // hr
          if (token = this.tokenizer.hr(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // blockquote
          if (token = this.tokenizer.blockquote(src)) {
            src = src.substring(token.raw.length);
            token.tokens = this.blockTokens(token.text, [], top);
            tokens.push(token);
            continue;
          }

          // list
          if (token = this.tokenizer.list(src)) {
            src = src.substring(token.raw.length);
            l = token.items.length;
            for (i = 0; i < l; i++) {
              token.items[i].tokens = this.blockTokens(token.items[i].text, [], false);
            }
            tokens.push(token);
            continue;
          }

          // html
          if (token = this.tokenizer.html(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // def
          if (top && (token = this.tokenizer.def(src))) {
            src = src.substring(token.raw.length);
            if (!this.tokens.links[token.tag]) {
              this.tokens.links[token.tag] = {
                href: token.href,
                title: token.title
              };
            }
            continue;
          }

          // table (gfm)
          if (token = this.tokenizer.table(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // lheading
          if (token = this.tokenizer.lheading(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // top-level paragraph
          if (top && (token = this.tokenizer.paragraph(src))) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // text
          if (token = this.tokenizer.text(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          if (src) {
            const errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);
            if (this.options.silent) {
              console.error(errMsg);
              break;
            } else {
              throw new Error(errMsg);
            }
          }
        }

        return tokens;
      }

      inline(tokens) {
        let i,
          j,
          k,
          l2,
          row,
          token;

        const l = tokens.length;
        for (i = 0; i < l; i++) {
          token = tokens[i];
          switch (token.type) {
            case 'paragraph':
            case 'text':
            case 'heading': {
              token.tokens = [];
              this.inlineTokens(token.text, token.tokens);
              break;
            }
            case 'table': {
              token.tokens = {
                header: [],
                cells: []
              };

              // header
              l2 = token.header.length;
              for (j = 0; j < l2; j++) {
                token.tokens.header[j] = [];
                this.inlineTokens(token.header[j], token.tokens.header[j]);
              }

              // cells
              l2 = token.cells.length;
              for (j = 0; j < l2; j++) {
                row = token.cells[j];
                token.tokens.cells[j] = [];
                for (k = 0; k < row.length; k++) {
                  token.tokens.cells[j][k] = [];
                  this.inlineTokens(row[k], token.tokens.cells[j][k]);
                }
              }

              break;
            }
            case 'blockquote': {
              this.inline(token.tokens);
              break;
            }
            case 'list': {
              l2 = token.items.length;
              for (j = 0; j < l2; j++) {
                this.inline(token.items[j].tokens);
              }
              break;
            }
          }
        }

        return tokens;
      }

      /**
       * Lexing/Compiling
       */
      inlineTokens(src, tokens = [], inLink = false, inRawBlock = false) {
        let token;

        while (src) {
          // escape
          if (token = this.tokenizer.escape(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // tag
          if (token = this.tokenizer.tag(src, inLink, inRawBlock)) {
            src = src.substring(token.raw.length);
            inLink = token.inLink;
            inRawBlock = token.inRawBlock;
            tokens.push(token);
            continue;
          }

          // link
          if (token = this.tokenizer.link(src)) {
            src = src.substring(token.raw.length);
            if (token.type === 'link') {
              token.tokens = this.inlineTokens(token.text, [], true, inRawBlock);
            }
            tokens.push(token);
            continue;
          }

          // reflink, nolink
          if (token = this.tokenizer.reflink(src, this.tokens.links)) {
            src = src.substring(token.raw.length);
            if (token.type === 'link') {
              token.tokens = this.inlineTokens(token.text, [], true, inRawBlock);
            }
            tokens.push(token);
            continue;
          }

          // strong
          if (token = this.tokenizer.strong(src)) {
            src = src.substring(token.raw.length);
            token.tokens = this.inlineTokens(token.text, [], inLink, inRawBlock);
            tokens.push(token);
            continue;
          }

          // em
          if (token = this.tokenizer.em(src)) {
            src = src.substring(token.raw.length);
            token.tokens = this.inlineTokens(token.text, [], inLink, inRawBlock);
            tokens.push(token);
            continue;
          }

          // code
          if (token = this.tokenizer.codespan(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // br
          if (token = this.tokenizer.br(src)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // del (gfm)
          if (token = this.tokenizer.del(src)) {
            src = src.substring(token.raw.length);
            token.tokens = this.inlineTokens(token.text, [], inLink, inRawBlock);
            tokens.push(token);
            continue;
          }

          // autolink
          if (token = this.tokenizer.autolink(src, mangle)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // url (gfm)
          if (!inLink && (token = this.tokenizer.url(src, mangle))) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          // text
          if (token = this.tokenizer.inlineText(src, inRawBlock, smartypants)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            continue;
          }

          if (src) {
            const errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);
            if (this.options.silent) {
              console.error(errMsg);
              break;
            } else {
              throw new Error(errMsg);
            }
          }
        }

        return tokens;
      }
    };

    const { defaults: defaults$3 } = defaults;
    const {
      cleanUrl: cleanUrl$1,
      escape: escape$2
    } = helpers;

    /**
     * Renderer
     */
    var Renderer_1 = class Renderer {
      constructor(options) {
        this.options = options || defaults$3;
      }

      code(code, infostring, escaped) {
        const lang = (infostring || '').match(/\S*/)[0];
        if (this.options.highlight) {
          const out = this.options.highlight(code, lang);
          if (out != null && out !== code) {
            escaped = true;
            code = out;
          }
        }

        if (!lang) {
          return '<pre><code>'
            + (escaped ? code : escape$2(code, true))
            + '</code></pre>';
        }

        return '<pre><code class="'
          + this.options.langPrefix
          + escape$2(lang, true)
          + '">'
          + (escaped ? code : escape$2(code, true))
          + '</code></pre>\n';
      }

      blockquote(quote) {
        return '<blockquote>\n' + quote + '</blockquote>\n';
      }

      html(html) {
        return html;
      }

      heading(text, level, raw, slugger) {
        if (this.options.headerIds) {
          return '<h'
            + level
            + ' id="'
            + this.options.headerPrefix
            + slugger.slug(raw)
            + '">'
            + text
            + '</h'
            + level
            + '>\n';
        }
        // ignore IDs
        return '<h' + level + '>' + text + '</h' + level + '>\n';
      }

      hr() {
        return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
      }

      list(body, ordered, start) {
        const type = ordered ? 'ol' : 'ul',
          startatt = (ordered && start !== 1) ? (' start="' + start + '"') : '';
        return '<' + type + startatt + '>\n' + body + '</' + type + '>\n';
      }

      listitem(text) {
        return '<li>' + text + '</li>\n';
      }

      checkbox(checked) {
        return '<input '
          + (checked ? 'checked="" ' : '')
          + 'disabled="" type="checkbox"'
          + (this.options.xhtml ? ' /' : '')
          + '> ';
      }

      paragraph(text) {
        return '<p>' + text + '</p>\n';
      }

      table(header, body) {
        if (body) body = '<tbody>' + body + '</tbody>';

        return '<table>\n'
          + '<thead>\n'
          + header
          + '</thead>\n'
          + body
          + '</table>\n';
      }

      tablerow(content) {
        return '<tr>\n' + content + '</tr>\n';
      }

      tablecell(content, flags) {
        const type = flags.header ? 'th' : 'td';
        const tag = flags.align
          ? '<' + type + ' align="' + flags.align + '">'
          : '<' + type + '>';
        return tag + content + '</' + type + '>\n';
      }

      // span level renderer
      strong(text) {
        return '<strong>' + text + '</strong>';
      }

      em(text) {
        return '<em>' + text + '</em>';
      }

      codespan(text) {
        return '<code>' + text + '</code>';
      }

      br() {
        return this.options.xhtml ? '<br/>' : '<br>';
      }

      del(text) {
        return '<del>' + text + '</del>';
      }

      link(href, title, text) {
        href = cleanUrl$1(this.options.sanitize, this.options.baseUrl, href);
        if (href === null) {
          return text;
        }
        let out = '<a href="' + escape$2(href) + '"';
        if (title) {
          out += ' title="' + title + '"';
        }
        out += '>' + text + '</a>';
        return out;
      }

      image(href, title, text) {
        href = cleanUrl$1(this.options.sanitize, this.options.baseUrl, href);
        if (href === null) {
          return text;
        }

        let out = '<img src="' + href + '" alt="' + text + '"';
        if (title) {
          out += ' title="' + title + '"';
        }
        out += this.options.xhtml ? '/>' : '>';
        return out;
      }

      text(text) {
        return text;
      }
    };

    /**
     * TextRenderer
     * returns only the textual part of the token
     */
    var TextRenderer_1 = class TextRenderer {
      // no need for block level renderers
      strong(text) {
        return text;
      }

      em(text) {
        return text;
      }

      codespan(text) {
        return text;
      }

      del(text) {
        return text;
      }

      html(text) {
        return text;
      }

      text(text) {
        return text;
      }

      link(href, title, text) {
        return '' + text;
      }

      image(href, title, text) {
        return '' + text;
      }

      br() {
        return '';
      }
    };

    /**
     * Slugger generates header id
     */
    var Slugger_1 = class Slugger {
      constructor() {
        this.seen = {};
      }

      /**
       * Convert string to unique id
       */
      slug(value) {
        let slug = value
          .toLowerCase()
          .trim()
          // remove html tags
          .replace(/<[!\/a-z].*?>/ig, '')
          // remove unwanted chars
          .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '')
          .replace(/\s/g, '-');

        if (this.seen.hasOwnProperty(slug)) {
          const originalSlug = slug;
          do {
            this.seen[originalSlug]++;
            slug = originalSlug + '-' + this.seen[originalSlug];
          } while (this.seen.hasOwnProperty(slug));
        }
        this.seen[slug] = 0;

        return slug;
      }
    };

    const { defaults: defaults$4 } = defaults;
    const {
      unescape: unescape$1
    } = helpers;

    /**
     * Parsing & Compiling
     */
    var Parser_1 = class Parser {
      constructor(options) {
        this.options = options || defaults$4;
        this.options.renderer = this.options.renderer || new Renderer_1();
        this.renderer = this.options.renderer;
        this.renderer.options = this.options;
        this.textRenderer = new TextRenderer_1();
        this.slugger = new Slugger_1();
      }

      /**
       * Static Parse Method
       */
      static parse(tokens, options) {
        const parser = new Parser(options);
        return parser.parse(tokens);
      }

      /**
       * Parse Loop
       */
      parse(tokens, top = true) {
        let out = '',
          i,
          j,
          k,
          l2,
          l3,
          row,
          cell,
          header,
          body,
          token,
          ordered,
          start,
          loose,
          itemBody,
          item,
          checked,
          task,
          checkbox;

        const l = tokens.length;
        for (i = 0; i < l; i++) {
          token = tokens[i];
          switch (token.type) {
            case 'space': {
              continue;
            }
            case 'hr': {
              out += this.renderer.hr();
              continue;
            }
            case 'heading': {
              out += this.renderer.heading(
                this.parseInline(token.tokens),
                token.depth,
                unescape$1(this.parseInline(token.tokens, this.textRenderer)),
                this.slugger);
              continue;
            }
            case 'code': {
              out += this.renderer.code(token.text,
                token.lang,
                token.escaped);
              continue;
            }
            case 'table': {
              header = '';

              // header
              cell = '';
              l2 = token.header.length;
              for (j = 0; j < l2; j++) {
                cell += this.renderer.tablecell(
                  this.parseInline(token.tokens.header[j]),
                  { header: true, align: token.align[j] }
                );
              }
              header += this.renderer.tablerow(cell);

              body = '';
              l2 = token.cells.length;
              for (j = 0; j < l2; j++) {
                row = token.tokens.cells[j];

                cell = '';
                l3 = row.length;
                for (k = 0; k < l3; k++) {
                  cell += this.renderer.tablecell(
                    this.parseInline(row[k]),
                    { header: false, align: token.align[k] }
                  );
                }

                body += this.renderer.tablerow(cell);
              }
              out += this.renderer.table(header, body);
              continue;
            }
            case 'blockquote': {
              body = this.parse(token.tokens);
              out += this.renderer.blockquote(body);
              continue;
            }
            case 'list': {
              ordered = token.ordered;
              start = token.start;
              loose = token.loose;
              l2 = token.items.length;

              body = '';
              for (j = 0; j < l2; j++) {
                item = token.items[j];
                checked = item.checked;
                task = item.task;

                itemBody = '';
                if (item.task) {
                  checkbox = this.renderer.checkbox(checked);
                  if (loose) {
                    if (item.tokens[0].type === 'text') {
                      item.tokens[0].text = checkbox + ' ' + item.tokens[0].text;
                      if (item.tokens[0].tokens && item.tokens[0].tokens.length > 0 && item.tokens[0].tokens[0].type === 'text') {
                        item.tokens[0].tokens[0].text = checkbox + ' ' + item.tokens[0].tokens[0].text;
                      }
                    } else {
                      item.tokens.unshift({
                        type: 'text',
                        text: checkbox
                      });
                    }
                  } else {
                    itemBody += checkbox;
                  }
                }

                itemBody += this.parse(item.tokens, loose);
                body += this.renderer.listitem(itemBody, task, checked);
              }

              out += this.renderer.list(body, ordered, start);
              continue;
            }
            case 'html': {
              // TODO parse inline content if parameter markdown=1
              out += this.renderer.html(token.text);
              continue;
            }
            case 'paragraph': {
              out += this.renderer.paragraph(this.parseInline(token.tokens));
              continue;
            }
            case 'text': {
              body = token.tokens ? this.parseInline(token.tokens) : token.text;
              while (i + 1 < l && tokens[i + 1].type === 'text') {
                token = tokens[++i];
                body += '\n' + (token.tokens ? this.parseInline(token.tokens) : token.text);
              }
              out += top ? this.renderer.paragraph(body) : body;
              continue;
            }
            default: {
              const errMsg = 'Token with "' + token.type + '" type was not found.';
              if (this.options.silent) {
                console.error(errMsg);
                return;
              } else {
                throw new Error(errMsg);
              }
            }
          }
        }

        return out;
      }

      /**
       * Parse Inline Tokens
       */
      parseInline(tokens, renderer) {
        renderer = renderer || this.renderer;
        let out = '',
          i,
          token;

        const l = tokens.length;
        for (i = 0; i < l; i++) {
          token = tokens[i];
          switch (token.type) {
            case 'escape': {
              out += renderer.text(token.text);
              break;
            }
            case 'html': {
              out += renderer.html(token.text);
              break;
            }
            case 'link': {
              out += renderer.link(token.href, token.title, this.parseInline(token.tokens, renderer));
              break;
            }
            case 'image': {
              out += renderer.image(token.href, token.title, token.text);
              break;
            }
            case 'strong': {
              out += renderer.strong(this.parseInline(token.tokens, renderer));
              break;
            }
            case 'em': {
              out += renderer.em(this.parseInline(token.tokens, renderer));
              break;
            }
            case 'codespan': {
              out += renderer.codespan(token.text);
              break;
            }
            case 'br': {
              out += renderer.br();
              break;
            }
            case 'del': {
              out += renderer.del(this.parseInline(token.tokens, renderer));
              break;
            }
            case 'text': {
              out += renderer.text(token.text);
              break;
            }
            default: {
              const errMsg = 'Token with "' + token.type + '" type was not found.';
              if (this.options.silent) {
                console.error(errMsg);
                return;
              } else {
                throw new Error(errMsg);
              }
            }
          }
        }
        return out;
      }
    };

    const {
      merge: merge$2,
      checkSanitizeDeprecation: checkSanitizeDeprecation$1,
      escape: escape$3
    } = helpers;
    const {
      getDefaults,
      changeDefaults,
      defaults: defaults$5
    } = defaults;

    /**
     * Marked
     */
    function marked(src, opt, callback) {
      // throw error in case of non string input
      if (typeof src === 'undefined' || src === null) {
        throw new Error('marked(): input parameter is undefined or null');
      }
      if (typeof src !== 'string') {
        throw new Error('marked(): input parameter is of type '
          + Object.prototype.toString.call(src) + ', string expected');
      }

      if (callback || typeof opt === 'function') {
        if (!callback) {
          callback = opt;
          opt = null;
        }

        opt = merge$2({}, marked.defaults, opt || {});
        checkSanitizeDeprecation$1(opt);
        const highlight = opt.highlight;
        let tokens,
          pending,
          i = 0;

        try {
          tokens = Lexer_1.lex(src, opt);
        } catch (e) {
          return callback(e);
        }

        pending = tokens.length;

        const done = function(err) {
          if (err) {
            opt.highlight = highlight;
            return callback(err);
          }

          let out;

          try {
            out = Parser_1.parse(tokens, opt);
          } catch (e) {
            err = e;
          }

          opt.highlight = highlight;

          return err
            ? callback(err)
            : callback(null, out);
        };

        if (!highlight || highlight.length < 3) {
          return done();
        }

        delete opt.highlight;

        if (!pending) return done();

        for (; i < tokens.length; i++) {
          (function(token) {
            if (token.type !== 'code') {
              return --pending || done();
            }
            return highlight(token.text, token.lang, function(err, code) {
              if (err) return done(err);
              if (code == null || code === token.text) {
                return --pending || done();
              }
              token.text = code;
              token.escaped = true;
              --pending || done();
            });
          })(tokens[i]);
        }

        return;
      }
      try {
        opt = merge$2({}, marked.defaults, opt || {});
        checkSanitizeDeprecation$1(opt);
        return Parser_1.parse(Lexer_1.lex(src, opt), opt);
      } catch (e) {
        e.message += '\nPlease report this to https://github.com/markedjs/marked.';
        if ((opt || marked.defaults).silent) {
          return '<p>An error occurred:</p><pre>'
            + escape$3(e.message + '', true)
            + '</pre>';
        }
        throw e;
      }
    }

    /**
     * Options
     */

    marked.options =
    marked.setOptions = function(opt) {
      merge$2(marked.defaults, opt);
      changeDefaults(marked.defaults);
      return marked;
    };

    marked.getDefaults = getDefaults;

    marked.defaults = defaults$5;

    /**
     * Use Extension
     */

    marked.use = function(extension) {
      const opts = merge$2({}, extension);
      if (extension.renderer) {
        const renderer = marked.defaults.renderer || new Renderer_1();
        for (const prop in extension.renderer) {
          const prevRenderer = renderer[prop];
          renderer[prop] = (...args) => {
            let ret = extension.renderer[prop].apply(renderer, args);
            if (ret === false) {
              ret = prevRenderer.apply(renderer, args);
            }
            return ret;
          };
        }
        opts.renderer = renderer;
      }
      if (extension.tokenizer) {
        const tokenizer = marked.defaults.tokenizer || new Tokenizer_1();
        for (const prop in extension.tokenizer) {
          const prevTokenizer = tokenizer[prop];
          tokenizer[prop] = (...args) => {
            let ret = extension.tokenizer[prop].apply(tokenizer, args);
            if (ret === false) {
              ret = prevTokenizer.apply(tokenizer, args);
            }
            return ret;
          };
        }
        opts.tokenizer = tokenizer;
      }
      marked.setOptions(opts);
    };

    /**
     * Expose
     */

    marked.Parser = Parser_1;
    marked.parser = Parser_1.parse;

    marked.Renderer = Renderer_1;
    marked.TextRenderer = TextRenderer_1;

    marked.Lexer = Lexer_1;
    marked.lexer = Lexer_1.lex;

    marked.Tokenizer = Tokenizer_1;

    marked.Slugger = Slugger_1;

    marked.parse = marked;

    var marked_1 = marked;

    /* src/components/Project.svelte generated by Svelte v3.20.1 */
    const file$1 = "src/components/Project.svelte";

    // (16:4) {:else}
    function create_else_block$1(ctx) {
    	let a;
    	let img;
    	let img_src_value;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			img = element("img");
    			if (img.src !== (img_src_value = "images/pic01.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$1, 16, 65, 691);
    			attr_dev(a, "href", a_href_value = "#/projects/" + /*project*/ ctx[0].name);
    			attr_dev(a, "class", "image featured");
    			add_location(a, file$1, 16, 6, 632);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*project*/ 1 && a_href_value !== (a_href_value = "#/projects/" + /*project*/ ctx[0].name)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(16:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (14:40) 
    function create_if_block_1(ctx) {
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			iframe = element("iframe");
    			attr_dev(iframe, "width", "800");
    			attr_dev(iframe, "height", "415");
    			if (iframe.src !== (iframe_src_value = /*project*/ ctx[0].links.video)) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "frameborder", "0");
    			attr_dev(iframe, "allow", "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture");
    			iframe.allowFullscreen = true;
    			add_location(iframe, file$1, 14, 6, 433);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, iframe, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*project*/ 1 && iframe.src !== (iframe_src_value = /*project*/ ctx[0].links.video)) {
    				attr_dev(iframe, "src", iframe_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(iframe);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(14:40) ",
    		ctx
    	});

    	return block;
    }

    // (12:3) {#if project.links.image_path != ""}
    function create_if_block$1(ctx) {
    	let a;
    	let img;
    	let img_src_value;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			img = element("img");
    			if (img.src !== (img_src_value = /*project*/ ctx[0].links.image_path)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$1, 12, 65, 336);
    			attr_dev(a, "href", a_href_value = "#/projects/" + /*project*/ ctx[0].name);
    			attr_dev(a, "class", "image featured");
    			add_location(a, file$1, 12, 6, 277);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*project*/ 1 && img.src !== (img_src_value = /*project*/ ctx[0].links.image_path)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*project*/ 1 && a_href_value !== (a_href_value = "#/projects/" + /*project*/ ctx[0].name)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(12:3) {#if project.links.image_path != \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let article;
    	let header;
    	let div;
    	let h2;
    	let a0;
    	let t0_value = /*project*/ ctx[0].name + "";
    	let t0;
    	let a0_href_value;
    	let t1;
    	let t2;
    	let p;
    	let raw_value = marked_1(/*project*/ ctx[0].pages[0].content.slice(0, 300) + " ...") + "";
    	let t3;
    	let footer;
    	let ul0;
    	let li0;
    	let a1;
    	let t4;
    	let a1_href_value;
    	let t5;
    	let ul1;
    	let li1;
    	let a2;

    	function select_block_type(ctx, dirty) {
    		if (/*project*/ ctx[0].links.image_path != "") return create_if_block$1;
    		if (/*project*/ ctx[0].links.video != "") return create_if_block_1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			article = element("article");
    			header = element("header");
    			div = element("div");
    			h2 = element("h2");
    			a0 = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			if_block.c();
    			t2 = space();
    			p = element("p");
    			t3 = space();
    			footer = element("footer");
    			ul0 = element("ul");
    			li0 = element("li");
    			a1 = element("a");
    			t4 = text("Continue Reading");
    			t5 = space();
    			ul1 = element("ul");
    			li1 = element("li");
    			a2 = element("a");
    			a2.textContent = "General";
    			attr_dev(a0, "href", a0_href_value = "#/projects/" + /*project*/ ctx[0].name);
    			add_location(a0, file$1, 8, 10, 148);
    			add_location(h2, file$1, 8, 6, 144);
    			attr_dev(div, "class", "title");
    			add_location(div, file$1, 7, 4, 118);
    			add_location(header, file$1, 6, 2, 105);
    			add_location(p, file$1, 19, 2, 748);
    			attr_dev(a1, "href", a1_href_value = "#/projects/" + /*project*/ ctx[0].name);
    			attr_dev(a1, "class", "button large");
    			add_location(a1, file$1, 22, 10, 865);
    			add_location(li0, file$1, 22, 6, 861);
    			attr_dev(ul0, "class", "actions");
    			add_location(ul0, file$1, 21, 4, 834);
    			attr_dev(a2, "href", "#");
    			add_location(a2, file$1, 25, 10, 991);
    			add_location(li1, file$1, 25, 6, 987);
    			attr_dev(ul1, "class", "stats");
    			add_location(ul1, file$1, 24, 4, 962);
    			add_location(footer, file$1, 20, 2, 821);
    			attr_dev(article, "class", "project post");
    			add_location(article, file$1, 5, 0, 72);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, header);
    			append_dev(header, div);
    			append_dev(div, h2);
    			append_dev(h2, a0);
    			append_dev(a0, t0);
    			append_dev(article, t1);
    			if_block.m(article, null);
    			append_dev(article, t2);
    			append_dev(article, p);
    			p.innerHTML = raw_value;
    			append_dev(article, t3);
    			append_dev(article, footer);
    			append_dev(footer, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, a1);
    			append_dev(a1, t4);
    			append_dev(footer, t5);
    			append_dev(footer, ul1);
    			append_dev(ul1, li1);
    			append_dev(li1, a2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*project*/ 1 && t0_value !== (t0_value = /*project*/ ctx[0].name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*project*/ 1 && a0_href_value !== (a0_href_value = "#/projects/" + /*project*/ ctx[0].name)) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(article, t2);
    				}
    			}

    			if (dirty & /*project*/ 1 && raw_value !== (raw_value = marked_1(/*project*/ ctx[0].pages[0].content.slice(0, 300) + " ...") + "")) p.innerHTML = raw_value;
    			if (dirty & /*project*/ 1 && a1_href_value !== (a1_href_value = "#/projects/" + /*project*/ ctx[0].name)) {
    				attr_dev(a1, "href", a1_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			if_block.d();
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

    	$$self.$capture_state = () => ({ marked: marked_1, project });

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

    /* src/components/ProjectList.svelte generated by Svelte v3.20.1 */
    const file$2 = "src/components/ProjectList.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (9:1) {#each projects as project}
    function create_each_block(ctx) {
    	let current;

    	const project = new Project({
    			props: { project: /*project*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(project.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(project, target, anchor);
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
    			destroy_component(project, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(9:1) {#each projects as project}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
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
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(div, file$2, 7, 0, 91);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
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
    						each_blocks[i].m(div, null);
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

    /* src/components/MiniProject.svelte generated by Svelte v3.20.1 */

    const file$3 = "src/components/MiniProject.svelte";

    function create_fragment$4(ctx) {
    	let article;
    	let header;
    	let h3;
    	let a0;
    	let t0_value = /*miniProject*/ ctx[0].name + "";
    	let t0;
    	let t1;
    	let a1;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			article = element("article");
    			header = element("header");
    			h3 = element("h3");
    			a0 = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			a1 = element("a");
    			img = element("img");
    			attr_dev(a0, "href", "");
    			add_location(a0, file$3, 6, 8, 95);
    			add_location(h3, file$3, 6, 4, 91);
    			add_location(header, file$3, 5, 2, 78);
    			if (img.src !== (img_src_value = "images/pic04.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$3, 8, 27, 173);
    			attr_dev(a1, "href", "");
    			attr_dev(a1, "class", "image");
    			add_location(a1, file$3, 8, 2, 148);
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
    			append_dev(a0, t0);
    			append_dev(article, t1);
    			append_dev(article, a1);
    			append_dev(a1, img);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*miniProject*/ 1 && t0_value !== (t0_value = /*miniProject*/ ctx[0].name + "")) set_data_dev(t0, t0_value);
    		},
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

    /* src/components/MiniProjectList.svelte generated by Svelte v3.20.1 */
    const file$4 = "src/components/MiniProjectList.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (10:4) {#each miniProjects as miniProject}
    function create_each_block$1(ctx) {
    	let current;

    	const miniproject = new MiniProject({
    			props: { miniProject: /*miniProject*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(miniproject.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(miniproject, target, anchor);
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
    			destroy_component(miniproject, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(10:4) {#each miniProjects as miniProject}",
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

    			add_location(ul, file$4, 8, 2, 138);
    			attr_dev(div, "class", "miniProjectList");
    			add_location(div, file$4, 7, 0, 106);
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

    /* src/components/MiniUser.svelte generated by Svelte v3.20.1 */

    const file$5 = "src/components/MiniUser.svelte";

    function create_fragment$6(ctx) {
    	let article;
    	let header;
    	let h3;
    	let a0;
    	let t0_value = /*user*/ ctx[0].name + "";
    	let t0;
    	let a0_href_value;
    	let t1;
    	let a1;
    	let img;
    	let img_src_value;
    	let a1_href_value;

    	const block = {
    		c: function create() {
    			article = element("article");
    			header = element("header");
    			h3 = element("h3");
    			a0 = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			a1 = element("a");
    			img = element("img");
    			attr_dev(a0, "href", a0_href_value = "#/users/" + /*user*/ ctx[0].name);
    			add_location(a0, file$5, 7, 6, 89);
    			add_location(h3, file$5, 6, 4, 78);
    			add_location(header, file$5, 5, 2, 65);
    			if (img.src !== (img_src_value = "images/pic10.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$5, 11, 4, 208);
    			attr_dev(a1, "href", a1_href_value = "#/users/" + /*user*/ ctx[0].name);
    			attr_dev(a1, "class", "image");
    			add_location(a1, file$5, 10, 2, 159);
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
    			append_dev(a0, t0);
    			append_dev(article, t1);
    			append_dev(article, a1);
    			append_dev(a1, img);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*user*/ 1 && t0_value !== (t0_value = /*user*/ ctx[0].name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*user*/ 1 && a0_href_value !== (a0_href_value = "#/users/" + /*user*/ ctx[0].name)) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (dirty & /*user*/ 1 && a1_href_value !== (a1_href_value = "#/users/" + /*user*/ ctx[0].name)) {
    				attr_dev(a1, "href", a1_href_value);
    			}
    		},
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MiniUser> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("MiniUser", $$slots, []);

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

    class MiniUser extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { user: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MiniUser",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*user*/ ctx[0] === undefined && !("user" in props)) {
    			console.warn("<MiniUser> was created without expected prop 'user'");
    		}
    	}

    	get user() {
    		throw new Error("<MiniUser>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set user(value) {
    		throw new Error("<MiniUser>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/MiniUserList.svelte generated by Svelte v3.20.1 */
    const file$6 = "src/components/MiniUserList.svelte";

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

    	const miniuser = new MiniUser({
    			props: { user: /*user*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(miniuser.$$.fragment);
    			t = space();
    			add_location(li, file$6, 11, 1, 142);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(miniuser, li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const miniuser_changes = {};
    			if (dirty & /*users*/ 1) miniuser_changes.user = /*user*/ ctx[1];
    			miniuser.$set(miniuser_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(miniuser.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(miniuser.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(miniuser);
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
    			add_location(ul, file$6, 9, 0, 98);
    			add_location(section, file$6, 6, 0, 86);
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MiniUserList> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("MiniUserList", $$slots, []);

    	$$self.$set = $$props => {
    		if ("users" in $$props) $$invalidate(0, users = $$props.users);
    	};

    	$$self.$capture_state = () => ({ MiniUser, users });

    	$$self.$inject_state = $$props => {
    		if ("users" in $$props) $$invalidate(0, users = $$props.users);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [users];
    }

    class MiniUserList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { users: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MiniUserList",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get users() {
    		throw new Error("<MiniUserList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set users(value) {
    		throw new Error("<MiniUserList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/SideBar.svelte generated by Svelte v3.20.1 */
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

    	const miniuserlist = new MiniUserList({
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
    			h20.textContent = "Planet First";
    			t2 = space();
    			p0 = element("p");
    			t3 = text("Another fine responsive site template by ");
    			a1 = element("a");
    			a1.textContent = "HTML5 UP";
    			t5 = space();
    			create_component(miniprojectlist.$$.fragment);
    			t6 = space();
    			create_component(miniuserlist.$$.fragment);
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
    			if (img.src !== (img_src_value = "images/logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$7, 11, 37, 300);
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "class", "logo");
    			add_location(a0, file$7, 11, 12, 275);
    			add_location(h20, file$7, 13, 16, 378);
    			attr_dev(a1, "href", "http://html5up.net");
    			add_location(a1, file$7, 14, 60, 460);
    			add_location(p0, file$7, 14, 16, 416);
    			add_location(header, file$7, 12, 12, 353);
    			attr_dev(section0, "id", "intro");
    			add_location(section0, file$7, 10, 8, 242);
    			add_location(h21, file$7, 26, 12, 734);
    			add_location(p1, file$7, 27, 12, 761);
    			attr_dev(a2, "href", "#");
    			attr_dev(a2, "class", "button");
    			add_location(a2, file$7, 29, 20, 1021);
    			add_location(li, file$7, 29, 16, 1017);
    			attr_dev(ul, "class", "actions");
    			add_location(ul, file$7, 28, 12, 980);
    			attr_dev(section1, "class", "blurb");
    			add_location(section1, file$7, 25, 8, 698);
    			attr_dev(section2, "id", "sidebar");
    			add_location(section2, file$7, 7, 0, 191);
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
    			mount_component(miniuserlist, section2, null);
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
    			const miniuserlist_changes = {};
    			if (dirty & /*users*/ 2) miniuserlist_changes.users = /*users*/ ctx[1];
    			miniuserlist.$set(miniuserlist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(miniprojectlist.$$.fragment, local);
    			transition_in(miniuserlist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(miniprojectlist.$$.fragment, local);
    			transition_out(miniuserlist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section2);
    			destroy_component(miniprojectlist);
    			destroy_component(miniuserlist);
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
    		MiniUserList,
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

    /* src/routes/Projects.svelte generated by Svelte v3.20.1 */
    const file$8 = "src/routes/Projects.svelte";

    // (73:6) {:else}
    function create_else_block_1(ctx) {
    	let await_block_anchor;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block_1,
    		then: create_then_block_1,
    		catch: create_catch_block_1,
    		value: 9,
    		error: 10,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*res*/ ctx[0], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*res*/ 1 && promise !== (promise = /*res*/ ctx[0]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[9] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(73:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (71:6) {#if res === undefined}
    function create_if_block_1$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			add_location(p, file$8, 71, 8, 1829);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(71:6) {#if res === undefined}",
    		ctx
    	});

    	return block;
    }

    // (80:8) {:catch error}
    function create_catch_block_1(ctx) {
    	let t_value = /*error*/ ctx[10].message + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*res*/ 1 && t_value !== (t_value = /*error*/ ctx[10].message + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_1.name,
    		type: "catch",
    		source: "(80:8) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (78:8) {:then items}
    function create_then_block_1(ctx) {
    	let current;

    	const projectlist = new ProjectList({
    			props: { projects: /*projects*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(projectlist.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(projectlist, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const projectlist_changes = {};
    			if (dirty & /*projects*/ 8) projectlist_changes.projects = /*projects*/ ctx[3];
    			projectlist.$set(projectlist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(projectlist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(projectlist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(projectlist, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_1.name,
    		type: "then",
    		source: "(78:8) {:then items}",
    		ctx
    	});

    	return block;
    }

    // (74:20)             <p>Loading...</p>          {:then items}
    function create_pending_block_1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading...";
    			add_location(p, file$8, 75, 10, 1881);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_1.name,
    		type: "pending",
    		source: "(74:20)             <p>Loading...</p>          {:then items}",
    		ctx
    	});

    	return block;
    }

    // (98:6) {:else}
    function create_else_block$2(ctx) {
    	let await_block_anchor;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 9,
    		error: 10,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*res*/ ctx[0], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*res*/ 1 && promise !== (promise = /*res*/ ctx[0]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[9] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(98:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (96:4) {#if res === undefined}
    function create_if_block$2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			add_location(p, file$8, 96, 8, 2431);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(96:4) {#if res === undefined}",
    		ctx
    	});

    	return block;
    }

    // (105:8) {:catch error}
    function create_catch_block(ctx) {
    	let t_value = /*error*/ ctx[10].message + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*res*/ 1 && t_value !== (t_value = /*error*/ ctx[10].message + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(105:8) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (103:8) {:then items}
    function create_then_block(ctx) {
    	let current;

    	const sidebar = new SideBar({
    			props: {
    				miniProjects: /*miniProjects*/ ctx[1],
    				users: /*users*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(sidebar.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(sidebar, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const sidebar_changes = {};
    			if (dirty & /*miniProjects*/ 2) sidebar_changes.miniProjects = /*miniProjects*/ ctx[1];
    			if (dirty & /*users*/ 4) sidebar_changes.users = /*users*/ ctx[2];
    			sidebar.$set(sidebar_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sidebar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sidebar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sidebar, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(103:8) {:then items}",
    		ctx
    	});

    	return block;
    }

    // (99:20)             <p>Loading...</p>          {:then items}
    function create_pending_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading...";
    			add_location(p, file$8, 100, 10, 2483);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(99:20)             <p>Loading...</p>          {:then items}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let main;
    	let div1;
    	let div0;
    	let current_block_type_index;
    	let if_block0;
    	let t0;
    	let ul;
    	let li0;
    	let button0;
    	let t2;
    	let li1;
    	let button1;
    	let t4;
    	let current_block_type_index_1;
    	let if_block1;
    	let current;
    	let dispose;
    	const if_block_creators = [create_if_block_1$1, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*res*/ ctx[0] === undefined) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	const if_block_creators_1 = [create_if_block$2, create_else_block$2];
    	const if_blocks_1 = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*res*/ ctx[0] === undefined) return 0;
    		return 1;
    	}

    	current_block_type_index_1 = select_block_type_1(ctx);
    	if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			div0 = element("div");
    			if_block0.c();
    			t0 = space();
    			ul = element("ul");
    			li0 = element("li");
    			button0 = element("button");
    			button0.textContent = "Previous Page";
    			t2 = space();
    			li1 = element("li");
    			button1 = element("button");
    			button1.textContent = "Next Page";
    			t4 = space();
    			if_block1.c();
    			attr_dev(button0, "id", "btn_prev");
    			attr_dev(button0, "class", "disabled button large previous");
    			add_location(button0, file$8, 87, 10, 2129);
    			add_location(li0, file$8, 86, 8, 2114);
    			attr_dev(button1, "id", "btn_next");
    			attr_dev(button1, "class", "button large next");
    			add_location(button1, file$8, 90, 10, 2272);
    			add_location(li1, file$8, 89, 8, 2257);
    			attr_dev(ul, "class", "actions pagination");
    			add_location(ul, file$8, 85, 6, 2074);
    			attr_dev(div0, "id", "main");
    			add_location(div0, file$8, 69, 4, 1775);
    			attr_dev(div1, "id", "wrapper");
    			add_location(div1, file$8, 66, 2, 1733);
    			add_location(main, file$8, 63, 0, 1704);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			if_blocks[current_block_type_index].m(div0, null);
    			append_dev(div0, t0);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(li0, button0);
    			append_dev(ul, t2);
    			append_dev(ul, li1);
    			append_dev(li1, button1);
    			append_dev(div1, t4);
    			if_blocks_1[current_block_type_index_1].m(div1, null);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button0, "click", /*onPrevious*/ ctx[5], false, false, false),
    				listen_dev(button1, "click", /*onNext*/ ctx[4], false, false, false)
    			];
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
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(div0, t0);
    			}

    			let previous_block_index_1 = current_block_type_index_1;
    			current_block_type_index_1 = select_block_type_1(ctx);

    			if (current_block_type_index_1 === previous_block_index_1) {
    				if_blocks_1[current_block_type_index_1].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks_1[previous_block_index_1], 1, 1, () => {
    					if_blocks_1[previous_block_index_1] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks_1[current_block_type_index_1];

    				if (!if_block1) {
    					if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
    					if_block1.c();
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(div1, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_blocks[current_block_type_index].d();
    			if_blocks_1[current_block_type_index_1].d();
    			run_all(dispose);
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

    function instance$9($$self, $$props, $$invalidate) {
    	let { url = "" } = $$props;
    	let res = { projects: [], users: [] };
    	let miniProjects = [];
    	let users = [];
    	let projects = [];
    	let page = 0;

    	function onNext() {
    		page += 5;
    		$$invalidate(3, projects = res.projects.slice(page, page + 5));
    		updatePage();
    	}

    	function onPrevious() {
    		page -= 5;
    		$$invalidate(3, projects = res.projects.slice(page, page + 5));
    		updatePage();
    	}

    	onMount(async () => {
    		let response = await fetch(`http://127.0.0.1:3000/data`);
    		let text = await response.text();
    		let data = text;
    		let obj = JSON.parse(data);

    		$$invalidate(0, res = {
    			projects: obj.projects,
    			users: obj.people
    		});

    		const shuffled_projects = res.projects.sort(() => 0.5 - Math.random());
    		let selected_projects = shuffled_projects.slice(0, 5);
    		const shuffled_users = res.users.sort(() => 0.5 - Math.random());
    		let selected_users = shuffled_users.slice(0, 5);
    		$$invalidate(1, miniProjects = selected_projects);
    		$$invalidate(3, projects = res.projects.slice(0, 5));
    		$$invalidate(2, users = selected_users);
    	});

    	function updatePage() {
    		let btn_prev = document.getElementById("btn_prev");
    		let btn_next = document.getElementById("btn_next");

    		if (page > 0) {
    			btn_prev.classList.remove("disabled");
    		}

    		if (page > res.projects.length - 5) {
    			btn_next.classList.add("disabled");
    		}

    		if (page <= 0) {
    			btn_prev.classList.add("disabled");
    		}

    		if (page < res.projects.length - 5) {
    			btn_next.classList.remove("disabled");
    		}
    	}

    	const writable_props = ["url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Projects> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Projects", $$slots, []);

    	$$self.$set = $$props => {
    		if ("url" in $$props) $$invalidate(6, url = $$props.url);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		ProjectList,
    		SideBar,
    		url,
    		res,
    		miniProjects,
    		users,
    		projects,
    		page,
    		onNext,
    		onPrevious,
    		updatePage
    	});

    	$$self.$inject_state = $$props => {
    		if ("url" in $$props) $$invalidate(6, url = $$props.url);
    		if ("res" in $$props) $$invalidate(0, res = $$props.res);
    		if ("miniProjects" in $$props) $$invalidate(1, miniProjects = $$props.miniProjects);
    		if ("users" in $$props) $$invalidate(2, users = $$props.users);
    		if ("projects" in $$props) $$invalidate(3, projects = $$props.projects);
    		if ("page" in $$props) page = $$props.page;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [res, miniProjects, users, projects, onNext, onPrevious, url];
    }

    class Projects extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { url: 6 });

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

    /* src/components/User.svelte generated by Svelte v3.20.1 */

    const file$9 = "src/components/User.svelte";

    function create_fragment$a(ctx) {
    	let div1;
    	let header;
    	let div0;
    	let h2;
    	let a0;
    	let t0_value = /*user*/ ctx[0].name + "";
    	let t0;
    	let a0_href_value;
    	let t1;
    	let a1;
    	let img;
    	let img_src_value;
    	let a1_href_value;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			header = element("header");
    			div0 = element("div");
    			h2 = element("h2");
    			a0 = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			a1 = element("a");
    			img = element("img");
    			attr_dev(a0, "href", a0_href_value = "#/users/" + /*user*/ ctx[0].name);
    			add_location(a0, file$9, 7, 10, 104);
    			add_location(h2, file$9, 7, 6, 100);
    			attr_dev(div0, "class", "title");
    			add_location(div0, file$9, 6, 4, 74);
    			add_location(header, file$9, 5, 2, 61);
    			if (img.src !== (img_src_value = "images/pic01.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$9, 10, 59, 237);
    			attr_dev(a1, "href", a1_href_value = "#/users/" + /*user*/ ctx[0].name);
    			attr_dev(a1, "class", "image featured");
    			add_location(a1, file$9, 10, 6, 184);
    			attr_dev(div1, "class", "user");
    			add_location(div1, file$9, 4, 0, 40);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, header);
    			append_dev(header, div0);
    			append_dev(div0, h2);
    			append_dev(h2, a0);
    			append_dev(a0, t0);
    			append_dev(div1, t1);
    			append_dev(div1, a1);
    			append_dev(a1, img);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*user*/ 1 && t0_value !== (t0_value = /*user*/ ctx[0].name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*user*/ 1 && a0_href_value !== (a0_href_value = "#/users/" + /*user*/ ctx[0].name)) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (dirty & /*user*/ 1 && a1_href_value !== (a1_href_value = "#/users/" + /*user*/ ctx[0].name)) {
    				attr_dev(a1, "href", a1_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
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

    function instance$a($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { user: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "User",
    			options,
    			id: create_fragment$a.name
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

    /* src/components/UserList.svelte generated by Svelte v3.20.1 */
    const file$a = "src/components/UserList.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (11:2) {#each users as user}
    function create_each_block$3(ctx) {
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
    			add_location(li, file$a, 11, 1, 134);
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
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(11:2) {#each users as user}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let section;
    	let ul;
    	let current;
    	let each_value = /*users*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
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
    			add_location(ul, file$a, 9, 0, 90);
    			add_location(section, file$a, 6, 0, 78);
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
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
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
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { users: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UserList",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get users() {
    		throw new Error("<UserList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set users(value) {
    		throw new Error("<UserList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/Users.svelte generated by Svelte v3.20.1 */
    const file$b = "src/routes/Users.svelte";

    // (40:6) {:else}
    function create_else_block_1$1(ctx) {
    	let await_block_anchor;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block_1$1,
    		then: create_then_block_1$1,
    		catch: create_catch_block_1$1,
    		value: 5,
    		error: 6,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*res*/ ctx[0], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*res*/ 1 && promise !== (promise = /*res*/ ctx[0]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[5] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(40:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (38:6) {#if res === undefined}
    function create_if_block_1$2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			add_location(p, file$b, 38, 8, 1003);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(38:6) {#if res === undefined}",
    		ctx
    	});

    	return block;
    }

    // (47:8) {:catch error}
    function create_catch_block_1$1(ctx) {
    	let t_value = /*error*/ ctx[6].message + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*res*/ 1 && t_value !== (t_value = /*error*/ ctx[6].message + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_1$1.name,
    		type: "catch",
    		source: "(47:8) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (45:8) {:then items}
    function create_then_block_1$1(ctx) {
    	let current;

    	const userlist = new UserList({
    			props: { users: /*users*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(userlist.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(userlist, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const userlist_changes = {};
    			if (dirty & /*users*/ 4) userlist_changes.users = /*users*/ ctx[2];
    			userlist.$set(userlist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(userlist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(userlist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(userlist, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_1$1.name,
    		type: "then",
    		source: "(45:8) {:then items}",
    		ctx
    	});

    	return block;
    }

    // (41:20)             <p>Loading...</p>          {:then items}
    function create_pending_block_1$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading...";
    			add_location(p, file$b, 42, 10, 1055);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_1$1.name,
    		type: "pending",
    		source: "(41:20)             <p>Loading...</p>          {:then items}",
    		ctx
    	});

    	return block;
    }

    // (66:6) {:else}
    function create_else_block$3(ctx) {
    	let await_block_anchor;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block$1,
    		then: create_then_block$1,
    		catch: create_catch_block$1,
    		value: 5,
    		error: 6,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*res*/ ctx[0], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*res*/ 1 && promise !== (promise = /*res*/ ctx[0]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[5] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(66:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (64:4) {#if res === undefined}
    function create_if_block$3(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			add_location(p, file$b, 64, 8, 1529);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(64:4) {#if res === undefined}",
    		ctx
    	});

    	return block;
    }

    // (73:8) {:catch error}
    function create_catch_block$1(ctx) {
    	let t_value = /*error*/ ctx[6].message + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*res*/ 1 && t_value !== (t_value = /*error*/ ctx[6].message + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$1.name,
    		type: "catch",
    		source: "(73:8) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (71:8) {:then items}
    function create_then_block$1(ctx) {
    	let current;

    	const sidebar = new SideBar({
    			props: {
    				miniProjects: /*miniProjects*/ ctx[1],
    				users: /*users*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(sidebar.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(sidebar, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const sidebar_changes = {};
    			if (dirty & /*miniProjects*/ 2) sidebar_changes.miniProjects = /*miniProjects*/ ctx[1];
    			if (dirty & /*users*/ 4) sidebar_changes.users = /*users*/ ctx[2];
    			sidebar.$set(sidebar_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sidebar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sidebar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sidebar, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$1.name,
    		type: "then",
    		source: "(71:8) {:then items}",
    		ctx
    	});

    	return block;
    }

    // (67:20)             <p>Loading...</p>          {:then items}
    function create_pending_block$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading...";
    			add_location(p, file$b, 68, 10, 1581);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$1.name,
    		type: "pending",
    		source: "(67:20)             <p>Loading...</p>          {:then items}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let main;
    	let div1;
    	let div0;
    	let current_block_type_index;
    	let if_block0;
    	let t0;
    	let ul;
    	let li0;
    	let a0;
    	let t2;
    	let li1;
    	let a1;
    	let t4;
    	let current_block_type_index_1;
    	let if_block1;
    	let current;
    	const if_block_creators = [create_if_block_1$2, create_else_block_1$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*res*/ ctx[0] === undefined) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	const if_block_creators_1 = [create_if_block$3, create_else_block$3];
    	const if_blocks_1 = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*res*/ ctx[0] === undefined) return 0;
    		return 1;
    	}

    	current_block_type_index_1 = select_block_type_1(ctx);
    	if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			div0 = element("div");
    			if_block0.c();
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
    			if_block1.c();
    			attr_dev(a0, "href", "");
    			attr_dev(a0, "class", "disabled button large previous");
    			add_location(a0, file$b, 55, 10, 1298);
    			add_location(li0, file$b, 54, 8, 1283);
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "class", "button large next");
    			add_location(a1, file$b, 58, 10, 1403);
    			add_location(li1, file$b, 57, 8, 1388);
    			attr_dev(ul, "class", "actions pagination");
    			add_location(ul, file$b, 53, 6, 1243);
    			attr_dev(div0, "id", "main");
    			add_location(div0, file$b, 36, 4, 949);
    			attr_dev(div1, "id", "wrapper");
    			add_location(div1, file$b, 33, 2, 907);
    			add_location(main, file$b, 30, 0, 878);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			if_blocks[current_block_type_index].m(div0, null);
    			append_dev(div0, t0);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(ul, t2);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(div1, t4);
    			if_blocks_1[current_block_type_index_1].m(div1, null);
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
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(div0, t0);
    			}

    			let previous_block_index_1 = current_block_type_index_1;
    			current_block_type_index_1 = select_block_type_1(ctx);

    			if (current_block_type_index_1 === previous_block_index_1) {
    				if_blocks_1[current_block_type_index_1].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks_1[previous_block_index_1], 1, 1, () => {
    					if_blocks_1[previous_block_index_1] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks_1[current_block_type_index_1];

    				if (!if_block1) {
    					if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
    					if_block1.c();
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(div1, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_blocks[current_block_type_index].d();
    			if_blocks_1[current_block_type_index_1].d();
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
    	let { url = "" } = $$props;
    	let res = {};
    	let miniProjects = [];
    	let users = [];
    	let projects = [];

    	onMount(async () => {
    		let response = await fetch(`http://127.0.0.1:3000/data`);
    		let text = await response.text();
    		let data = text;
    		let obj = JSON.parse(data);

    		$$invalidate(0, res = {
    			projects: obj.projects,
    			users: obj.people
    		});

    		const shuffled_projects = res.projects.sort(() => 0.5 - Math.random());
    		let selected_projects = shuffled_projects.slice(0, 5);
    		const shuffled_users = res.users.sort(() => 0.5 - Math.random());
    		let selected_users = shuffled_users.slice(0, 5);
    		$$invalidate(1, miniProjects = selected_projects);
    		projects = selected_projects;
    		$$invalidate(2, users = selected_users);
    	});

    	const writable_props = ["url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Users> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Users", $$slots, []);

    	$$self.$set = $$props => {
    		if ("url" in $$props) $$invalidate(3, url = $$props.url);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		UserList,
    		SideBar,
    		url,
    		res,
    		miniProjects,
    		users,
    		projects
    	});

    	$$self.$inject_state = $$props => {
    		if ("url" in $$props) $$invalidate(3, url = $$props.url);
    		if ("res" in $$props) $$invalidate(0, res = $$props.res);
    		if ("miniProjects" in $$props) $$invalidate(1, miniProjects = $$props.miniProjects);
    		if ("users" in $$props) $$invalidate(2, users = $$props.users);
    		if ("projects" in $$props) projects = $$props.projects;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [res, miniProjects, users, url];
    }

    class Users extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { url: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Users",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get url() {
    		throw new Error("<Users>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Users>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/ProjectDetails.svelte generated by Svelte v3.20.1 */

    const file$c = "src/routes/ProjectDetails.svelte";

    function create_fragment$d(ctx) {
    	let div2;
    	let section3;
    	let section0;
    	let form;
    	let input;
    	let t0;
    	let section1;
    	let ul0;
    	let li0;
    	let a0;
    	let h30;
    	let t2;
    	let p0;
    	let t4;
    	let li1;
    	let a1;
    	let h31;
    	let t6;
    	let p1;
    	let t8;
    	let li2;
    	let a2;
    	let h32;
    	let t10;
    	let p2;
    	let t12;
    	let li3;
    	let a3;
    	let h33;
    	let t14;
    	let p3;
    	let t16;
    	let section2;
    	let ul1;
    	let li4;
    	let a4;
    	let t18;
    	let div1;
    	let article;
    	let header;
    	let div0;
    	let h2;
    	let t20;
    	let p4;
    	let strong;
    	let t22;
    	let span;
    	let img;
    	let img_src_value;
    	let t23;
    	let p5;
    	let t25;
    	let p6;
    	let t27;
    	let p7;
    	let t29;
    	let p8;
    	let t31;
    	let p9;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			section3 = element("section");
    			section0 = element("section");
    			form = element("form");
    			input = element("input");
    			t0 = space();
    			section1 = element("section");
    			ul0 = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			h30 = element("h3");
    			h30.textContent = "Lorem ipsum";
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "Feugiat tempus veroeros dolor";
    			t4 = space();
    			li1 = element("li");
    			a1 = element("a");
    			h31 = element("h3");
    			h31.textContent = "Dolor sit amet";
    			t6 = space();
    			p1 = element("p");
    			p1.textContent = "Sed vitae justo condimentum";
    			t8 = space();
    			li2 = element("li");
    			a2 = element("a");
    			h32 = element("h3");
    			h32.textContent = "Feugiat veroeros";
    			t10 = space();
    			p2 = element("p");
    			p2.textContent = "Phasellus sed ultricies mi congue";
    			t12 = space();
    			li3 = element("li");
    			a3 = element("a");
    			h33 = element("h3");
    			h33.textContent = "Etiam sed consequat";
    			t14 = space();
    			p3 = element("p");
    			p3.textContent = "Porta lectus amet ultricies";
    			t16 = space();
    			section2 = element("section");
    			ul1 = element("ul");
    			li4 = element("li");
    			a4 = element("a");
    			a4.textContent = "Log In";
    			t18 = space();
    			div1 = element("div");
    			article = element("article");
    			header = element("header");
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Planet First";
    			t20 = space();
    			p4 = element("p");
    			strong = element("strong");
    			strong.textContent = "A collective and open ecosystem of planet- and human- centric projects";
    			t22 = space();
    			span = element("span");
    			img = element("img");
    			t23 = space();
    			p5 = element("p");
    			p5.textContent = "We are the Threefold Network, and have built a new peer-to-peer internet that empowers equality, freedom and sustainability. As we launch the ThreeFold Grid and many other experiences on top, the time has come for us to make our world peer-to-peer.";
    			t25 = space();
    			p6 = element("p");
    			p6.textContent = "As of the 29th of April 2020, the ThreeFold Network will enter a rolling launch with many exciting announcements for the world. This will start with the announcement of our Grid 2.0 upgrade and the availability of the ThreeFold Token on Stellar Exchange.";
    			t27 = space();
    			p7 = element("p");
    			p7.textContent = "The time has come to start building our peer-to-peer world together, and it goes without saying that a collective and equal approach is needed. Many beautiful projects have joined the Planet First Ecosystem, and together we aim to empower a better future for humanity and our planet.";
    			t29 = space();
    			p8 = element("p");
    			p8.textContent = "If not us, who? If not now, when?";
    			t31 = space();
    			p9 = element("p");
    			p9.textContent = "Interested to learn more? Explore the first projects living on the ThreeFold Network";
    			attr_dev(input, "type", "text");
    			attr_dev(input, "name", "query");
    			attr_dev(input, "placeholder", "Search");
    			add_location(input, file$c, 9, 28, 260);
    			attr_dev(form, "class", "search");
    			attr_dev(form, "method", "get");
    			attr_dev(form, "action", "#");
    			add_location(form, file$c, 8, 24, 186);
    			add_location(section0, file$c, 7, 20, 152);
    			add_location(h30, file$c, 18, 36, 598);
    			add_location(p0, file$c, 19, 36, 655);
    			attr_dev(a0, "href", "#");
    			add_location(a0, file$c, 17, 32, 549);
    			add_location(li0, file$c, 16, 28, 512);
    			add_location(h31, file$c, 24, 36, 877);
    			add_location(p1, file$c, 25, 36, 937);
    			attr_dev(a1, "href", "#");
    			add_location(a1, file$c, 23, 32, 828);
    			add_location(li1, file$c, 22, 28, 791);
    			add_location(h32, file$c, 30, 36, 1157);
    			add_location(p2, file$c, 31, 36, 1219);
    			attr_dev(a2, "href", "#");
    			add_location(a2, file$c, 29, 32, 1108);
    			add_location(li2, file$c, 28, 28, 1071);
    			add_location(h33, file$c, 36, 36, 1445);
    			add_location(p3, file$c, 37, 36, 1510);
    			attr_dev(a3, "href", "#");
    			add_location(a3, file$c, 35, 32, 1396);
    			add_location(li3, file$c, 34, 28, 1359);
    			attr_dev(ul0, "class", "links");
    			add_location(ul0, file$c, 15, 24, 465);
    			add_location(section1, file$c, 14, 20, 431);
    			attr_dev(a4, "href", "#");
    			attr_dev(a4, "class", "button large fit");
    			add_location(a4, file$c, 46, 32, 1826);
    			add_location(li4, file$c, 46, 28, 1822);
    			attr_dev(ul1, "class", "actions stacked");
    			add_location(ul1, file$c, 45, 24, 1765);
    			add_location(section2, file$c, 44, 20, 1731);
    			attr_dev(section3, "id", "menu");
    			add_location(section3, file$c, 4, 12, 79);
    			add_location(h2, file$c, 59, 32, 2202);
    			add_location(strong, file$c, 60, 35, 2259);
    			add_location(p4, file$c, 60, 32, 2256);
    			attr_dev(div0, "class", "title");
    			add_location(div0, file$c, 58, 28, 2150);
    			add_location(header, file$c, 57, 24, 2113);
    			if (img.src !== (img_src_value = "images/pic01.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$c, 63, 53, 2473);
    			attr_dev(span, "class", "image featured");
    			add_location(span, file$c, 63, 24, 2444);
    			add_location(p5, file$c, 64, 24, 2542);
    			add_location(p6, file$c, 65, 24, 2822);
    			add_location(p7, file$c, 66, 8, 3092);
    			add_location(p8, file$c, 67, 8, 3391);
    			add_location(p9, file$c, 68, 24, 3456);
    			attr_dev(article, "class", "post");
    			add_location(article, file$c, 56, 20, 2066);
    			attr_dev(div1, "id", "main");
    			add_location(div1, file$c, 53, 12, 1999);
    			attr_dev(div2, "id", "wrapper");
    			add_location(div2, file$c, 1, 4, 21);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, section3);
    			append_dev(section3, section0);
    			append_dev(section0, form);
    			append_dev(form, input);
    			append_dev(section3, t0);
    			append_dev(section3, section1);
    			append_dev(section1, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, a0);
    			append_dev(a0, h30);
    			append_dev(a0, t2);
    			append_dev(a0, p0);
    			append_dev(ul0, t4);
    			append_dev(ul0, li1);
    			append_dev(li1, a1);
    			append_dev(a1, h31);
    			append_dev(a1, t6);
    			append_dev(a1, p1);
    			append_dev(ul0, t8);
    			append_dev(ul0, li2);
    			append_dev(li2, a2);
    			append_dev(a2, h32);
    			append_dev(a2, t10);
    			append_dev(a2, p2);
    			append_dev(ul0, t12);
    			append_dev(ul0, li3);
    			append_dev(li3, a3);
    			append_dev(a3, h33);
    			append_dev(a3, t14);
    			append_dev(a3, p3);
    			append_dev(section3, t16);
    			append_dev(section3, section2);
    			append_dev(section2, ul1);
    			append_dev(ul1, li4);
    			append_dev(li4, a4);
    			append_dev(div2, t18);
    			append_dev(div2, div1);
    			append_dev(div1, article);
    			append_dev(article, header);
    			append_dev(header, div0);
    			append_dev(div0, h2);
    			append_dev(div0, t20);
    			append_dev(div0, p4);
    			append_dev(p4, strong);
    			append_dev(article, t22);
    			append_dev(article, span);
    			append_dev(span, img);
    			append_dev(article, t23);
    			append_dev(article, p5);
    			append_dev(article, t25);
    			append_dev(article, p6);
    			append_dev(article, t27);
    			append_dev(article, p7);
    			append_dev(article, t29);
    			append_dev(article, p8);
    			append_dev(article, t31);
    			append_dev(article, p9);
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
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ProjectDetails> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ProjectDetails", $$slots, []);
    	return [];
    }

    class ProjectDetails extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProjectDetails",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/routes/UserDetails.svelte generated by Svelte v3.20.1 */

    const file$d = "src/routes/UserDetails.svelte";

    function create_fragment$e(ctx) {
    	let div2;
    	let section3;
    	let section0;
    	let form;
    	let input;
    	let t0;
    	let section1;
    	let ul0;
    	let li0;
    	let a0;
    	let h30;
    	let t2;
    	let p0;
    	let t4;
    	let li1;
    	let a1;
    	let h31;
    	let t6;
    	let p1;
    	let t8;
    	let li2;
    	let a2;
    	let h32;
    	let t10;
    	let p2;
    	let t12;
    	let li3;
    	let a3;
    	let h33;
    	let t14;
    	let p3;
    	let t16;
    	let section2;
    	let ul1;
    	let li4;
    	let a4;
    	let t18;
    	let div1;
    	let article;
    	let header;
    	let div0;
    	let h2;
    	let t20;
    	let p4;
    	let strong;
    	let t22;
    	let span;
    	let img;
    	let img_src_value;
    	let t23;
    	let p5;
    	let t25;
    	let p6;
    	let t27;
    	let p7;
    	let t29;
    	let p8;
    	let t31;
    	let p9;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			section3 = element("section");
    			section0 = element("section");
    			form = element("form");
    			input = element("input");
    			t0 = space();
    			section1 = element("section");
    			ul0 = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			h30 = element("h3");
    			h30.textContent = "Lorem ipsum";
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "Feugiat tempus veroeros dolor";
    			t4 = space();
    			li1 = element("li");
    			a1 = element("a");
    			h31 = element("h3");
    			h31.textContent = "Dolor sit amet";
    			t6 = space();
    			p1 = element("p");
    			p1.textContent = "Sed vitae justo condimentum";
    			t8 = space();
    			li2 = element("li");
    			a2 = element("a");
    			h32 = element("h3");
    			h32.textContent = "Feugiat veroeros";
    			t10 = space();
    			p2 = element("p");
    			p2.textContent = "Phasellus sed ultricies mi congue";
    			t12 = space();
    			li3 = element("li");
    			a3 = element("a");
    			h33 = element("h3");
    			h33.textContent = "Etiam sed consequat";
    			t14 = space();
    			p3 = element("p");
    			p3.textContent = "Porta lectus amet ultricies";
    			t16 = space();
    			section2 = element("section");
    			ul1 = element("ul");
    			li4 = element("li");
    			a4 = element("a");
    			a4.textContent = "Log In";
    			t18 = space();
    			div1 = element("div");
    			article = element("article");
    			header = element("header");
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Planet First";
    			t20 = space();
    			p4 = element("p");
    			strong = element("strong");
    			strong.textContent = "A collective and open ecosystem of planet- and human- centric projects";
    			t22 = space();
    			span = element("span");
    			img = element("img");
    			t23 = space();
    			p5 = element("p");
    			p5.textContent = "We are the Threefold Network, and have built a new peer-to-peer internet that empowers equality, freedom and sustainability. As we launch the ThreeFold Grid and many other experiences on top, the time has come for us to make our world peer-to-peer.";
    			t25 = space();
    			p6 = element("p");
    			p6.textContent = "As of the 29th of April 2020, the ThreeFold Network will enter a rolling launch with many exciting announcements for the world. This will start with the announcement of our Grid 2.0 upgrade and the availability of the ThreeFold Token on Stellar Exchange.";
    			t27 = space();
    			p7 = element("p");
    			p7.textContent = "The time has come to start building our peer-to-peer world together, and it goes without saying that a collective and equal approach is needed. Many beautiful projects have joined the Planet First Ecosystem, and together we aim to empower a better future for humanity and our planet.";
    			t29 = space();
    			p8 = element("p");
    			p8.textContent = "If not us, who? If not now, when?";
    			t31 = space();
    			p9 = element("p");
    			p9.textContent = "Interested to learn more? Explore the first projects living on the ThreeFold Network";
    			attr_dev(input, "type", "text");
    			attr_dev(input, "name", "query");
    			attr_dev(input, "placeholder", "Search");
    			add_location(input, file$d, 9, 28, 260);
    			attr_dev(form, "class", "search");
    			attr_dev(form, "method", "get");
    			attr_dev(form, "action", "#");
    			add_location(form, file$d, 8, 24, 186);
    			add_location(section0, file$d, 7, 20, 152);
    			add_location(h30, file$d, 18, 36, 598);
    			add_location(p0, file$d, 19, 36, 655);
    			attr_dev(a0, "href", "#");
    			add_location(a0, file$d, 17, 32, 549);
    			add_location(li0, file$d, 16, 28, 512);
    			add_location(h31, file$d, 24, 36, 877);
    			add_location(p1, file$d, 25, 36, 937);
    			attr_dev(a1, "href", "#");
    			add_location(a1, file$d, 23, 32, 828);
    			add_location(li1, file$d, 22, 28, 791);
    			add_location(h32, file$d, 30, 36, 1157);
    			add_location(p2, file$d, 31, 36, 1219);
    			attr_dev(a2, "href", "#");
    			add_location(a2, file$d, 29, 32, 1108);
    			add_location(li2, file$d, 28, 28, 1071);
    			add_location(h33, file$d, 36, 36, 1445);
    			add_location(p3, file$d, 37, 36, 1510);
    			attr_dev(a3, "href", "#");
    			add_location(a3, file$d, 35, 32, 1396);
    			add_location(li3, file$d, 34, 28, 1359);
    			attr_dev(ul0, "class", "links");
    			add_location(ul0, file$d, 15, 24, 465);
    			add_location(section1, file$d, 14, 20, 431);
    			attr_dev(a4, "href", "#");
    			attr_dev(a4, "class", "button large fit");
    			add_location(a4, file$d, 46, 32, 1826);
    			add_location(li4, file$d, 46, 28, 1822);
    			attr_dev(ul1, "class", "actions stacked");
    			add_location(ul1, file$d, 45, 24, 1765);
    			add_location(section2, file$d, 44, 20, 1731);
    			attr_dev(section3, "id", "menu");
    			add_location(section3, file$d, 4, 12, 79);
    			add_location(h2, file$d, 59, 32, 2202);
    			add_location(strong, file$d, 60, 35, 2259);
    			add_location(p4, file$d, 60, 32, 2256);
    			attr_dev(div0, "class", "title");
    			add_location(div0, file$d, 58, 28, 2150);
    			add_location(header, file$d, 57, 24, 2113);
    			if (img.src !== (img_src_value = "images/pic01.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$d, 63, 53, 2473);
    			attr_dev(span, "class", "image featured");
    			add_location(span, file$d, 63, 24, 2444);
    			add_location(p5, file$d, 64, 24, 2542);
    			add_location(p6, file$d, 65, 24, 2822);
    			add_location(p7, file$d, 66, 8, 3092);
    			add_location(p8, file$d, 67, 8, 3391);
    			add_location(p9, file$d, 68, 24, 3456);
    			attr_dev(article, "class", "post");
    			add_location(article, file$d, 56, 20, 2066);
    			attr_dev(div1, "id", "main");
    			add_location(div1, file$d, 53, 12, 1999);
    			attr_dev(div2, "id", "wrapper");
    			add_location(div2, file$d, 1, 4, 21);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, section3);
    			append_dev(section3, section0);
    			append_dev(section0, form);
    			append_dev(form, input);
    			append_dev(section3, t0);
    			append_dev(section3, section1);
    			append_dev(section1, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, a0);
    			append_dev(a0, h30);
    			append_dev(a0, t2);
    			append_dev(a0, p0);
    			append_dev(ul0, t4);
    			append_dev(ul0, li1);
    			append_dev(li1, a1);
    			append_dev(a1, h31);
    			append_dev(a1, t6);
    			append_dev(a1, p1);
    			append_dev(ul0, t8);
    			append_dev(ul0, li2);
    			append_dev(li2, a2);
    			append_dev(a2, h32);
    			append_dev(a2, t10);
    			append_dev(a2, p2);
    			append_dev(ul0, t12);
    			append_dev(ul0, li3);
    			append_dev(li3, a3);
    			append_dev(a3, h33);
    			append_dev(a3, t14);
    			append_dev(a3, p3);
    			append_dev(section3, t16);
    			append_dev(section3, section2);
    			append_dev(section2, ul1);
    			append_dev(ul1, li4);
    			append_dev(li4, a4);
    			append_dev(div2, t18);
    			append_dev(div2, div1);
    			append_dev(div1, article);
    			append_dev(article, header);
    			append_dev(header, div0);
    			append_dev(div0, h2);
    			append_dev(div0, t20);
    			append_dev(div0, p4);
    			append_dev(p4, strong);
    			append_dev(article, t22);
    			append_dev(article, span);
    			append_dev(span, img);
    			append_dev(article, t23);
    			append_dev(article, p5);
    			append_dev(article, t25);
    			append_dev(article, p6);
    			append_dev(article, t27);
    			append_dev(article, p7);
    			append_dev(article, t29);
    			append_dev(article, p8);
    			append_dev(article, t31);
    			append_dev(article, p9);
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
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<UserDetails> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("UserDetails", $$slots, []);
    	return [];
    }

    class UserDetails extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UserDetails",
    			options,
    			id: create_fragment$e.name
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
            '/projects/:name': ProjectDetails, 
            '/users/:name': UserDetails, 

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
        routes.set('/projects/:name', ProjectDetails);
        routes.set('/users/:name', UserDetails);
    }
    var routes$1 = routes;

    /* node_modules/svelte-spa-router/Router.svelte generated by Svelte v3.20.1 */

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

    /* src/components/Navigation.svelte generated by Svelte v3.20.1 */
    const file$e = "src/components/Navigation.svelte";

    function create_fragment$f(ctx) {
    	let header;
    	let nav;
    	let div5;
    	let div0;
    	let a0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let button;
    	let span0;
    	let t1;
    	let div4;
    	let div1;
    	let a1;
    	let img1;
    	let img1_src_value;
    	let t2;
    	let div3;
    	let a2;
    	let img2;
    	let img2_src_value;
    	let t3;
    	let div2;
    	let a3;
    	let img3;
    	let img3_src_value;
    	let t4;
    	let ul;
    	let li0;
    	let a4;
    	let link_action;
    	let t6;
    	let li1;
    	let a5;
    	let link_action_1;
    	let t8;
    	let li2;
    	let a6;
    	let link_action_2;
    	let t10;
    	let div6;
    	let a7;
    	let span1;
    	let t11;
    	let div7;
    	let a8;
    	let span2;
    	let dispose;

    	const block = {
    		c: function create() {
    			header = element("header");
    			nav = element("nav");
    			div5 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t0 = space();
    			button = element("button");
    			span0 = element("span");
    			t1 = space();
    			div4 = element("div");
    			div1 = element("div");
    			a1 = element("a");
    			img1 = element("img");
    			t2 = space();
    			div3 = element("div");
    			a2 = element("a");
    			img2 = element("img");
    			t3 = space();
    			div2 = element("div");
    			a3 = element("a");
    			img3 = element("img");
    			t4 = space();
    			ul = element("ul");
    			li0 = element("li");
    			a4 = element("a");
    			a4.textContent = "Home";
    			t6 = space();
    			li1 = element("li");
    			a5 = element("a");
    			a5.textContent = "Projects";
    			t8 = space();
    			li2 = element("li");
    			a6 = element("a");
    			a6.textContent = "Users";
    			t10 = space();
    			div6 = element("div");
    			a7 = element("a");
    			span1 = element("span");
    			t11 = space();
    			div7 = element("div");
    			a8 = element("a");
    			span2 = element("span");
    			if (img0.src !== (img0_src_value = "images/logo-event.png")) attr_dev(img0, "src", img0_src_value);
    			set_style(img0, "width", "55%");
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$e, 11, 10, 350);
    			attr_dev(a0, "href", "https://wiki.threefold.io/docs/token/how_to_buy/index.html");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$e, 8, 8, 234);
    			attr_dev(div0, "class", "logo-liqued");
    			add_location(div0, file$e, 7, 6, 200);
    			attr_dev(span0, "class", "navbar-toggler-icon");
    			add_location(span0, file$e, 22, 8, 730);
    			attr_dev(button, "class", "navbar-toggler navbar-toggler-right");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "data-toggle", "collapse");
    			attr_dev(button, "data-target", "#navbar2SupportedContent");
    			attr_dev(button, "aria-controls", "navbar2SupportedContent");
    			attr_dev(button, "aria-expanded", "false");
    			attr_dev(button, "aria-label", "Toggle navigation");
    			add_location(button, file$e, 14, 6, 444);
    			if (img1.src !== (img1_src_value = "images/3fold_icon.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "height", "45");
    			add_location(img1, file$e, 29, 12, 958);
    			attr_dev(a1, "href", "/");
    			add_location(a1, file$e, 28, 10, 933);
    			attr_dev(div1, "class", "icon");
    			add_location(div1, file$e, 27, 8, 904);
    			if (img2.src !== (img2_src_value = "images/logo-tf.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			add_location(img2, file$e, 35, 12, 1119);
    			attr_dev(a2, "href", "/");
    			add_location(a2, file$e, 34, 10, 1094);
    			if (img3.src !== (img3_src_value = "images/ieo-comingcoon-sign.png")) attr_dev(img3, "src", img3_src_value);
    			set_style(img3, "width", "100%");
    			attr_dev(img3, "alt", "");
    			add_location(img3, file$e, 41, 14, 1358);
    			attr_dev(a3, "href", "https://wiki.threefold.io/docs/token/how_to_buy/index.html");
    			attr_dev(a3, "target", "_blank");
    			add_location(a3, file$e, 38, 12, 1230);
    			attr_dev(div2, "class", "logo-text text-dark");
    			add_location(div2, file$e, 37, 10, 1184);
    			attr_dev(div3, "class", "logo navbar-brand");
    			add_location(div3, file$e, 33, 8, 1052);
    			attr_dev(a4, "href", "/");
    			attr_dev(a4, "class", "nav-link");
    			add_location(a4, file$e, 51, 12, 1696);
    			attr_dev(li0, "class", "nav-item mx-1");
    			add_location(li0, file$e, 50, 10, 1657);
    			attr_dev(a5, "href", "/projects");
    			attr_dev(a5, "class", "nav-link");
    			add_location(a5, file$e, 55, 12, 1809);
    			attr_dev(li1, "class", "nav-item mx-1");
    			add_location(li1, file$e, 54, 10, 1770);
    			attr_dev(a6, "href", "/users");
    			attr_dev(a6, "class", "nav-link");
    			add_location(a6, file$e, 59, 12, 1934);
    			attr_dev(li2, "class", "nav-item mx-1");
    			add_location(li2, file$e, 58, 10, 1895);
    			attr_dev(ul, "class", "navbar-nav");
    			add_location(ul, file$e, 49, 8, 1623);
    			attr_dev(div4, "class", "collapse navbar-collapse justify-content-center");
    			attr_dev(div4, "id", "navbar2SupportedContent");
    			add_location(div4, file$e, 24, 6, 789);
    			attr_dev(div5, "class", "container-fluid");
    			add_location(div5, file$e, 6, 4, 164);
    			add_location(span1, file$e, 72, 8, 2395);
    			attr_dev(a7, "id", "show-hidden-menu");
    			attr_dev(a7, "class", "nav-icon");
    			add_location(a7, file$e, 71, 6, 2344);
    			attr_dev(div6, "class", "toogle_btn");
    			add_location(div6, file$e, 70, 4, 2313);
    			add_location(span2, file$e, 77, 8, 2513);
    			attr_dev(a8, "id", "hidden-menu");
    			attr_dev(a8, "class", "nav-icon-close");
    			add_location(a8, file$e, 76, 6, 2461);
    			attr_dev(div7, "class", "toogle_btn");
    			add_location(div7, file$e, 75, 4, 2430);
    			attr_dev(nav, "class", "navbar navbar-expand-md fixed-top navbar-dark navbar-ontop");
    			add_location(nav, file$e, 5, 2, 87);
    			attr_dev(header, "id", "header");
    			add_location(header, file$e, 4, 0, 64);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, header, anchor);
    			append_dev(header, nav);
    			append_dev(nav, div5);
    			append_dev(div5, div0);
    			append_dev(div0, a0);
    			append_dev(a0, img0);
    			append_dev(div5, t0);
    			append_dev(div5, button);
    			append_dev(button, span0);
    			append_dev(div5, t1);
    			append_dev(div5, div4);
    			append_dev(div4, div1);
    			append_dev(div1, a1);
    			append_dev(a1, img1);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			append_dev(div3, a2);
    			append_dev(a2, img2);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, a3);
    			append_dev(a3, img3);
    			append_dev(div4, t4);
    			append_dev(div4, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a4);
    			append_dev(ul, t6);
    			append_dev(ul, li1);
    			append_dev(li1, a5);
    			append_dev(ul, t8);
    			append_dev(ul, li2);
    			append_dev(li2, a6);
    			append_dev(nav, t10);
    			append_dev(nav, div6);
    			append_dev(div6, a7);
    			append_dev(a7, span1);
    			append_dev(nav, t11);
    			append_dev(nav, div7);
    			append_dev(div7, a8);
    			append_dev(a8, span2);
    			if (remount) run_all(dispose);

    			dispose = [
    				action_destroyer(link_action = link$1.call(null, a4)),
    				action_destroyer(link_action_1 = link$1.call(null, a5)),
    				action_destroyer(link_action_2 = link$1.call(null, a6))
    			];
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navigation",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.20.1 */
    const file$f = "src/App.svelte";

    function create_fragment$g(ctx) {
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
    			add_location(meta0, file$f, 11, 2, 309);
    			attr_dev(meta1, "name", "viewport");
    			attr_dev(meta1, "content", "width=device-width, initial-scale=1, user-scalable=no");
    			add_location(meta1, file$f, 12, 2, 336);
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "./assets/css/main.css");
    			add_location(link, file$f, 15, 2, 435);
    			add_location(div0, file$f, 19, 2, 514);
    			add_location(div1, file$f, 22, 2, 550);
    			add_location(div2, file$f, 18, 0, 506);
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
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$g.name
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
