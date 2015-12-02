(function(root, factory){
	"use strict";

	var isNode = (typeof window === 'undefined' || window.navigator == null);
	var global_ = isNode ? global : window;

	function construct(){
		var Regex = factory(global_);
		if (isNode) {
			module.exports = Regex;
			return;
		}
		return window.Regex = Regex;
	}

	if (typeof define === 'function' && define.amd) {
		return define(construct);
	}

	return construct();
}(this, function(global){
	"use strict";

	// source ../utils/lib/utils.embed.js
	// source /src/refs.js
	var _Array_slice = Array.prototype.slice,
		_Array_splice = Array.prototype.splice,
		_Array_indexOf = Array.prototype.indexOf,
	
		_Object_create = null, // in obj.js
		_Object_hasOwnProp = Object.hasOwnProperty,
		_Object_getOwnProp = Object.getOwnPropertyDescriptor,
		_Object_defineProperty = Object.defineProperty;
	
	// end:source /src/refs.js
	
	// source /src/coll.js
	var coll_each,
		coll_remove,
		coll_map,
		coll_indexOf,
		coll_find;
	(function(){
		coll_each = function(coll, fn, ctx){
			if (ctx == null)
				ctx = coll;
			if (coll == null)
				return coll;
	
			var imax = coll.length,
				i = 0;
			for(; i< imax; i++){
				fn.call(ctx, coll[i], i);
			}
			return ctx;
		};
		coll_indexOf = function(coll, x){
			if (coll == null)
				return -1;
			var imax = coll.length,
				i = 0;
			for(; i < imax; i++){
				if (coll[i] === x)
					return i;
			}
			return -1;
		};
		coll_remove = function(coll, x){
			var i = coll_indexOf(coll, x);
			if (i === -1)
				return false;
			coll.splice(i, 1);
			return true;
		};
		coll_map = function(coll, fn, ctx){
			var arr = new Array(coll.length);
			coll_each(coll, function(x, i){
				arr[i] = fn.call(this, x, i);
			}, ctx);
			return arr;
		};
		coll_find = function(coll, fn, ctx){
			var imax = coll.length,
				i = 0;
			for(; i < imax; i++){
				if (fn.call(ctx || coll, coll[i], i))
					return true;
			}
			return false;
		};
	}());
	
	// end:source /src/coll.js
	
	// source /src/polyfill/arr.js
	if (Array.prototype.forEach === void 0) {
		Array.prototype.forEach = function(fn, ctx){
			coll_each(this, fn, ctx);
		};
	}
	if (Array.prototype.indexOf === void 0) {
		Array.prototype.indexOf = function(x){
			return coll_indexOf(this, x);
		};
	}
	
	// end:source /src/polyfill/arr.js
	// source /src/polyfill/str.js
	if (String.prototype.trim == null){
		String.prototype.trim = function(){
			var start = -1,
				end = this.length,
				code;
			if (end === 0)
				return this;
			while(++start < end){
				code = this.charCodeAt(start);
				if (code > 32)
					break;
			}
			while(--end !== 0){
				code = this.charCodeAt(end);
				if (code > 32)
					break;
			}
			return start !== 0 && end !== length - 1
				? this.substring(start, end + 1)
				: this;
		};
	}
	
	// end:source /src/polyfill/str.js
	// source /src/polyfill/fn.js
	
	if (Function.prototype.bind == null) {
		var _Array_slice;
		Function.prototype.bind = function(){
			if (arguments.length < 2 && typeof arguments[0] === "undefined")
				return this;
			var fn = this,
				args = _Array_slice.call(arguments),
				ctx = args.shift();
			return function() {
				return fn.apply(ctx, args.concat(_Array_slice.call(arguments)));
			};
		};
	}
	
	// end:source /src/polyfill/fn.js
	
	// source /src/is.js
	var is_Function,
		is_Array,
		is_ArrayLike,
		is_String,
		is_Object,
		is_notEmptyString,
		is_rawObject,
		is_Date,
		is_NODE,
		is_DOM;
	
	(function() {
		is_Function = function(x) {
			return typeof x === 'function';
		};
		is_Object = function(x) {
			return x != null && typeof x === 'object';
		};
		is_Array = is_ArrayLike = function(arr) {
			return arr != null
				&& typeof arr === 'object'
				&& typeof arr.length === 'number'
				&& typeof arr.slice === 'function'
				;
		};
		is_String = function(x) {
			return typeof x === 'string';
		};
		is_notEmptyString = function(x) {
			return typeof x === 'string' && x !== '';
		};
		is_rawObject = function(obj) {
			if (obj == null || typeof obj !== 'object')
				return false;
	
			return obj.constructor === Object;
		};
		is_Date = function(x) {
			if (x == null || typeof x !== 'object') {
				return false;
			}
			if (x.getFullYear != null && isNaN(x) === false) {
				return true;
			}
			return false;
		};
		is_DOM = typeof window !== 'undefined' && window.navigator != null;
		is_NODE = !is_DOM;
	
	}());
	
	// end:source /src/is.js
	// source /src/obj.js
	var obj_getProperty,
		obj_setProperty,
		obj_hasProperty,
		obj_extend,
		obj_extendDefaults,
		obj_extendMany,
		obj_extendProperties,
		obj_extendPropertiesDefaults,
		obj_create,
		obj_toFastProps,
		obj_defineProperty;
	(function(){
		obj_getProperty = function(obj_, path){
			if ('.' === path) // obsolete
				return obj_;
	
			var obj = obj_,
				chain = path.split('.'),
				imax = chain.length,
				i = -1;
			while ( obj != null && ++i < imax ) {
				obj = obj[chain[i]];
			}
			return obj;
		};
		obj_setProperty = function(obj_, path, val) {
			var obj = obj_,
				chain = path.split('.'),
				imax = chain.length - 1,
				i = -1,
				key;
			while ( ++i < imax ) {
				key = chain[i];
				if (obj[key] == null)
					obj[key] = {};
	
				obj = obj[key];
			}
			obj[chain[i]] = val;
		};
		obj_hasProperty = function(obj, path) {
			var x = obj_getProperty(obj, path);
			return x !== void 0;
		};
		obj_defineProperty = function(obj, path, dscr) {
			var x = obj,
				chain = path.split('.'),
				imax = chain.length - 1,
				i = -1, key;
			while (++i < imax) {
				key = chain[i];
				if (x[key] == null)
					x[key] = {};
				x = x[key];
			}
			key = chain[imax];
			if (_Object_defineProperty) {
				if (dscr.writable	 === void 0) dscr.writable	 = true;
				if (dscr.configurable === void 0) dscr.configurable = true;
				if (dscr.enumerable   === void 0) dscr.enumerable   = true;
				_Object_defineProperty(x, key, dscr);
				return;
			}
			x[key] = dscr.value === void 0
				? dscr.value
				: (dscr.get && dscr.get());
		};
		obj_extend = function(a, b){
			if (b == null)
				return a || {};
	
			if (a == null)
				return obj_create(b);
	
			for(var key in b){
				a[key] = b[key];
			}
			return a;
		};
		obj_extendDefaults = function(a, b){
			if (b == null)
				return a || {};
			if (a == null)
				return obj_create(b);
	
			for(var key in b) {
				if (a[key] == null) {
					a[key] = b[key];
					continue;
				}
				if (key === 'toString' && a[key] === Object.prototype.toString) {
					a[key] = b[key];
				}
			}
			return a;
		}
		var extendPropertiesFactory = function(overwriteProps){
			if (_Object_getOwnProp == null)
				return overwriteProps ? obj_extend : obj_extendDefaults;
	
			return function(a, b){
				if (b == null)
					return a || {};
	
				if (a == null)
					return obj_create(b);
	
				var key, descr, ownDescr;
				for(key in b){
					descr = _Object_getOwnProp(b, key);
					if (descr == null)
						continue;
					if (overwriteProps !== true) {
						ownDescr = _Object_getOwnProp(a, key);
						if (ownDescr != null) {
							continue;
						}
					}
					if (descr.hasOwnProperty('value')) {
						a[key] = descr.value;
						continue;
					}
					_Object_defineProperty(a, key, descr);
				}
				return a;
			};
		};
	
		obj_extendProperties		 = extendPropertiesFactory(true);
		obj_extendPropertiesDefaults = extendPropertiesFactory(false );
	
		obj_extendMany = function(a){
			var imax = arguments.length,
				i = 1;
			for(; i<imax; i++) {
				a = obj_extend(a, arguments[i]);
			}
			return a;
		};
		obj_toFastProps = function(obj){
			/*jshint -W027*/
			function F() {}
			F.prototype = obj;
			new F();
			return;
			eval(obj);
		};
		_Object_create = obj_create = Object.create || function(x) {
			var Ctor = function(){};
			Ctor.prototype = x;
			return new Ctor;
		};
	}());
	
	// end:source /src/obj.js
	// source /src/arr.js
	var arr_remove,
		arr_each,
		arr_indexOf,
		arr_contains,
		arr_pushMany;
	(function(){
		arr_remove = function(array, x){
			var i = array.indexOf(x);
			if (i === -1)
				return false;
			array.splice(i, 1);
			return true;
		};
		arr_each = function(arr, fn, ctx){
			arr.forEach(fn, ctx);
		};
		arr_indexOf = function(arr, x){
			return arr.indexOf(x);
		};
		arr_contains = function(arr, x){
			return arr.indexOf(x) !== -1;
		};
		arr_pushMany = function(arr, arrSource){
			if (arrSource == null || arr == null || arr === arrSource)
				return;
	
			var il = arr.length,
				jl = arrSource.length,
				j = -1
				;
			while( ++j < jl ){
				arr[il + j] = arrSource[j];
			}
		};
	}());
	
	// end:source /src/arr.js
	// source /src/fn.js
	var fn_proxy,
		fn_apply,
		fn_doNothing,
		fn_createByPattern;
	(function(){
		fn_proxy = function(fn, ctx) {
			return function(){
				var imax = arguments.length,
					args = new Array(imax),
					i = 0;
				for(; i<imax; i++) args[i] = arguments[i];
				return fn_apply(fn, ctx, args);
			};
		};
	
		fn_apply = function(fn, ctx, args){
			var l = args.length;
			if (0 === l)
				return fn.call(ctx);
			if (1 === l)
				return fn.call(ctx, args[0]);
			if (2 === l)
				return fn.call(ctx, args[0], args[1]);
			if (3 === l)
				return fn.call(ctx, args[0], args[1], args[2]);
			if (4 === l)
				return fn.call(ctx, args[0], args[1], args[2], args[3]);
	
			return fn.apply(ctx, args);
		};
	
		fn_doNothing = function(){
			return false;
		};
	
		fn_createByPattern = function(definitions, ctx){
			var imax = definitions.length;
			return function(){
				var l = arguments.length,
					i = -1,
					def;
	
				outer: while(++i < imax){
					def = definitions[i];
					if (def.pattern.length !== l) {
						continue;
					}
					var j = -1;
					while(++j < l){
						var fn  = def.pattern[j];
						var val = arguments[j];
						if (fn(val) === false) {
							continue outer;
						}
					}
					return def.handler.apply(ctx, arguments);
				}
	
				console.error('InvalidArgumentException for a function', definitions, arguments);
				return null;
			};
		};
	
	}());
	
	// end:source /src/fn.js
	// source /src/str.js
	var str_format;
	(function(){
		str_format = function(str_){
			var str = str_,
				imax = arguments.length,
				i = 0, x;
			while ( ++i < imax ){
				x = arguments[i];
				if (is_Object(x) && x.toJSON) {
					x = x.toJSON();
				}
				str_ = str_.replace(rgxNum(i - 1), String(x));
			}
	
			return str_;
		};
	
		var rgxNum;
		(function(){
			rgxNum = function(num){
				return cache_[num] || (cache_[num] = new RegExp('\\{' + num + '\\}', 'g'));
			};
			var cache_ = {};
		}());
	}());
	
	// end:source /src/str.js
	// source /src/class.js
	/**
	 * create([...Base], Proto)
	 * Base: Function | Object
	 * Proto: Object {
	 *    constructor: ?Function
	 *    ...
	 */
	var class_create,
	
		// with property accessor functions support
		class_createEx;
	(function(){
	
		class_create   = createClassFactory(obj_extendDefaults);
		class_createEx = createClassFactory(obj_extendPropertiesDefaults);
	
		function createClassFactory(extendDefaultsFn) {
			return function(){
				var args = _Array_slice.call(arguments),
					Proto = args.pop();
				if (Proto == null)
					Proto = {};
	
				var Ctor = Proto.hasOwnProperty('constructor')
					? Proto.constructor
					: function ClassCtor () {};
	
				var i = args.length,
					BaseCtor, x;
				while ( --i > -1 ) {
					x = args[i];
					if (typeof x === 'function') {
						BaseCtor = wrapFn(x, BaseCtor);
						x = x.prototype;
					}
					extendDefaultsFn(Proto, x);
				}
				return createClass(wrapFn(BaseCtor, Ctor), Proto);
			};
		}
	
		function createClass(Ctor, Proto) {
			Proto.constructor = Ctor;
			Ctor.prototype = Proto;
			return Ctor;
		}
		function wrapFn(fnA, fnB) {
			if (fnA == null) {
				return fnB;
			}
			if (fnB == null) {
				return fnA;
			}
			return function(){
				var args = _Array_slice.call(arguments);
				var x = fnA.apply(this, args);
				if (x !== void 0)
					return x;
	
				return fnB.apply(this, args);
			};
		}
	}());
	
	// end:source /src/class.js
	// source /src/error.js
	var error_createClass,
		error_formatSource,
		error_formatCursor,
		error_cursor;
	
	(function(){
		error_createClass = function(name, Proto, stackSliceFrom){
			var Ctor = _createCtor(Proto, stackSliceFrom);
			Ctor.prototype = new Error;
	
			Proto.constructor = Error;
			Proto.name = name;
			obj_extend(Ctor.prototype, Proto);
			return Ctor;
		};
	
		error_formatSource = function(source, index, filename) {
			var cursor  = error_cursor(source, index),
				lines   = cursor[0],
				lineNum = cursor[1],
				rowNum  = cursor[2],
				str = '';
			if (filename != null) {
				str += str_format(' at {0}({1}:{2})\n', filename, lineNum, rowNum);
			}
			return str + error_formatCursor(lines, lineNum, rowNum);
		};
	
		/**
		 * @returns [ lines, lineNum, rowNum ]
		 */
		error_cursor = function(str, index){
			var lines = str.substring(0, index).split('\n'),
				line = lines.length,
				row = index + 1 - lines.slice(0, line - 1).join('\n').length;
			if (line > 1) {
				// remote trailing newline
				row -= 1;
			}
			return [str.split('\n'), line, row];
		};
	
		(function(){
			error_formatCursor = function(lines, lineNum, rowNum) {
	
				var BEFORE = 3,
					AFTER  = 2,
					i = lineNum - BEFORE,
					imax   = i + BEFORE + AFTER,
					str  = '';
	
				if (i < 0) i = 0;
				if (imax > lines.length) imax = lines.length;
	
				var lineNumberLength = String(imax).length,
					lineNumber;
	
				for(; i < imax; i++) {
					if (str)  str += '\n';
	
					lineNumber = ensureLength(i + 1, lineNumberLength);
					str += lineNumber + '|' + lines[i];
	
					if (i + 1 === lineNum) {
						str += '\n' + repeat(' ', lineNumberLength + 1);
						str += lines[i].substring(0, rowNum - 1).replace(/[^\s]/g, ' ');
						str += '^';
					}
				}
				return str;
			};
	
			function ensureLength(num, count) {
				var str = String(num);
				while(str.length < count) {
					str += ' ';
				}
				return str;
			}
			function repeat(char_, count) {
				var str = '';
				while(--count > -1) {
					str += char_;
				}
				return str;
			}
		}());
	
		function _createCtor(Proto, stackFrom){
			var Ctor = Proto.hasOwnProperty('constructor')
				? Proto.constructor
				: null;
	
			return function(){
				obj_defineProperty(this, 'stack', {
					value: _prepairStack(stackFrom || 3)
				});
				obj_defineProperty(this, 'message', {
					value: str_format.apply(this, arguments)
				});
				if (Ctor != null) {
					Ctor.apply(this, arguments);
				}
			};
		}
	
		function _prepairStack(sliceFrom) {
			var stack = new Error().stack;
			return stack == null ? null : stack
				.split('\n')
				.slice(sliceFrom)
				.join('\n');
		}
	
	}());
	
	// end:source /src/error.js
	
	// source /src/class/Dfr.js
	var class_Dfr;
	(function(){
		class_Dfr = function(){};
		class_Dfr.prototype = {
			_isAsync: true,
			_done: null,
			_fail: null,
			_always: null,
			_resolved: null,
			_rejected: null,
	
			defer: function(){
				this._rejected = null;
				this._resolved = null;
				return this;
			},
			isResolved: function(){
				return this._resolved != null;
			},
			isRejected: function(){
				return this._rejected != null;
			},
			isBusy: function(){
				return this._resolved == null && this._rejected == null;
			},
			resolve: function() {
				var done = this._done,
					always = this._always
					;
	
				this._resolved = arguments;
	
				dfr_clearListeners(this);
				arr_callOnce(done, this, arguments);
				arr_callOnce(always, this, [ this ]);
	
				return this;
			},
			reject: function() {
				var fail = this._fail,
					always = this._always
					;
	
				this._rejected = arguments;
	
				dfr_clearListeners(this);
				arr_callOnce(fail, this, arguments);
				arr_callOnce(always, this, [ this ]);
				return this;
			},
			then: function(filterSuccess, filterError){
				return this.pipe(filterSuccess, filterError);
			},
			done: function(callback) {
				if (this._rejected != null)
					return this;
				return dfr_bind(
					this,
					this._resolved,
					this._done || (this._done = []),
					callback
				);
			},
			fail: function(callback) {
				if (this._resolved != null)
					return this;
				return dfr_bind(
					this,
					this._rejected,
					this._fail || (this._fail = []),
					callback
				);
			},
			always: function(callback) {
				return dfr_bind(
					this,
					this._rejected || this._resolved,
					this._always || (this._always = []),
					callback
				);
			},
			pipe: function(mix /* ..methods */){
				var dfr;
				if (typeof mix === 'function') {
					dfr = new class_Dfr;
					var done_ = mix,
						fail_ = arguments.length > 1
							? arguments[1]
							: null;
	
					this
						.done(delegate(dfr, 'resolve', done_))
						.fail(delegate(dfr, 'reject',  fail_))
						;
					return dfr;
				}
	
				dfr = mix;
				var imax = arguments.length,
					done = imax === 1,
					fail = imax === 1,
					i = 0, x;
				while( ++i < imax ){
					x = arguments[i];
					switch(x){
						case 'done':
							done = true;
							break;
						case 'fail':
							fail = true;
							break;
						default:
							console.error('Unsupported pipe channel', arguments[i])
							break;
					}
				}
				done && this.done(delegate(dfr, 'resolve'));
				fail && this.fail(delegate(dfr, 'reject' ));
	
				function pipe(dfr, method) {
					return function(){
						dfr[method].apply(dfr, arguments);
					};
				}
				function delegate(dfr, name, fn) {
					return function(){
						if (fn != null) {
							var override = fn.apply(this, arguments);
							if (override != null) {
								if (isDeferred(override) === true) {
									override.pipe(dfr);
									return;
								}
	
								dfr[name](override)
								return;
							}
						}
						dfr[name].apply(dfr, arguments);
					};
				}
	
				return this;
			},
			pipeCallback: function(){
				var self = this;
				return function(error){
					if (error != null) {
						self.reject(error);
						return;
					}
					var args = _Array_slice.call(arguments, 1);
					fn_apply(self.resolve, self, args);
				};
			},
			resolveDelegate: function(){
				return fn_proxy(this.resolve, this);
			},
			
			rejectDelegate: function(){
				return fn_proxy(this.reject, this);
			},
			
		};
	
		class_Dfr.run = function(fn, ctx){
			var dfr = new class_Dfr();
			if (ctx == null)
				ctx = dfr;
	
			fn.call(
				ctx
				, fn_proxy(dfr.resolve, ctx)
				, fn_proxy(dfr.reject, dfr)
				, dfr
			);
			return dfr;
		};
	
		// PRIVATE
	
		function dfr_bind(dfr, arguments_, listeners, callback){
			if (callback == null)
				return dfr;
	
			if ( arguments_ != null)
				fn_apply(callback, dfr, arguments_);
			else
				listeners.push(callback);
	
			return dfr;
		}
	
		function dfr_clearListeners(dfr) {
			dfr._done = null;
			dfr._fail = null;
			dfr._always = null;
		}
	
		function arr_callOnce(arr, ctx, args) {
			if (arr == null)
				return;
	
			var imax = arr.length,
				i = -1,
				fn;
			while ( ++i < imax ) {
				fn = arr[i];
	
				if (fn)
					fn_apply(fn, ctx, args);
			}
			arr.length = 0;
		}
		function isDeferred(x){
			if (x == null || typeof x !== 'object')
				return false;
	
			if (x instanceof class_Dfr)
				return true;
	
			return typeof x.done === 'function'
				&& typeof x.fail === 'function'
				;
		}
	}());
	
	// end:source /src/class/Dfr.js
	// source /src/class/EventEmitter.js
	var class_EventEmitter;
	(function(){
	
		class_EventEmitter = function() {
			this._listeners = {};
		};
		class_EventEmitter.prototype = {
			on: function(event, fn) {
				if (fn != null){
					(this._listeners[event] || (this._listeners[event] = [])).push(fn);
				}
				return this;
			},
			once: function(event, fn){
				if (fn != null) {
					fn._once = true;
					(this._listeners[event] || (this._listeners[event] = [])).push(fn);
				}
				return this;
			},
	
			pipe: function(event){
				var that = this,
					args;
				return function(){
					args = _Array_slice.call(arguments);
					args.unshift(event);
					fn_apply(that.trigger, that, args);
				};
			},
	
			emit: event_trigger,
			trigger: event_trigger,
	
			off: function(event, fn) {
				var listeners = this._listeners[event];
				if (listeners == null)
					return this;
	
				if (arguments.length === 1) {
					listeners.length = 0;
					return this;
				}
	
				var imax = listeners.length,
					i = -1;
				while (++i < imax) {
	
					if (listeners[i] === fn) {
						listeners.splice(i, 1);
						i--;
						imax--;
					}
	
				}
				return this;
			}
		};
	
		function event_trigger() {
			var args = _Array_slice.call(arguments),
				event = args.shift(),
				fns = this._listeners[event],
				fn, imax, i = 0;
	
			if (fns == null)
				return this;
	
			for (imax = fns.length; i < imax; i++) {
				fn = fns[i];
				fn_apply(fn, this, args);
	
				if (fn._once === true){
					fns.splice(i, 1);
					i--;
					imax--;
				}
			}
			return this;
		}
	}());
	
	// end:source /src/class/EventEmitter.js
	// source /src/class/Uri.es6
	"use strict";
	
	var class_Uri;
	(function () {
	
		class_Uri = class_create({
			protocol: null,
			value: null,
			path: null,
			file: null,
			extension: null,
	
			constructor: function constructor(uri) {
				if (uri == null) {
					return this;
				}if (util_isUri(uri)) {
					return uri.combine("");
				}uri = normalize_uri(uri);
	
				this.value = uri;
	
				parse_protocol(this);
				parse_host(this);
	
				parse_search(this);
				parse_file(this);
	
				// normilize path - "/some/path"
				this.path = normalize_pathsSlashes(this.value);
	
				if (/^[\w]+:\//.test(this.path)) {
					this.path = "/" + this.path;
				}
				return this;
			},
			cdUp: function cdUp() {
				var path = this.path;
				if (path == null || path === "" || path === "/") {
					return this;
				}
	
				// win32 - is base drive
				if (/^\/?[a-zA-Z]+:\/?$/.test(path)) {
					return this;
				}
	
				this.path = path.replace(/\/?[^\/]+\/?$/i, "");
				return this;
			},
			/**
	   * '/path' - relative to host
	   * '../path', 'path','./path' - relative to current path
	   */
			combine: function combine(path) {
	
				if (util_isUri(path)) {
					path = path.toString();
				}
	
				if (!path) {
					return util_clone(this);
				}
	
				if (rgx_win32Drive.test(path)) {
					return new class_Uri(path);
				}
	
				var uri = util_clone(this);
	
				uri.value = path;
	
				parse_search(uri);
				parse_file(uri);
	
				if (!uri.value) {
					return uri;
				}
	
				path = uri.value.replace(/^\.\//i, "");
	
				if (path[0] === "/") {
					uri.path = path;
					return uri;
				}
	
				while (/^(\.\.\/?)/ig.test(path)) {
					uri.cdUp();
					path = path.substring(3);
				}
	
				uri.path = normalize_pathsSlashes(util_combinePathes(uri.path, path));
	
				return uri;
			},
			toString: function toString() {
				var protocol = this.protocol ? this.protocol + "://" : "";
				var path = util_combinePathes(this.host, this.path, this.file) + (this.search || "");
				var str = protocol + path;
	
				if (!(this.file || this.search)) {
					str += "/";
				}
				return str;
			},
			toPathAndQuery: function toPathAndQuery() {
				return util_combinePathes(this.path, this.file) + (this.search || "");
			},
			/**
	   * @return Current Uri Path{String} that is relative to @arg1 Uri
	   */
			toRelativeString: function toRelativeString(uri) {
				if (typeof uri === "string") uri = new class_Uri(uri);
	
				if (this.path.indexOf(uri.path) === 0) {
					// host folder
					var p = this.path ? this.path.replace(uri.path, "") : "";
					if (p[0] === "/") p = p.substring(1);
	
					return util_combinePathes(p, this.file) + (this.search || "");
				}
	
				// sub folder
				var current = this.path.split("/"),
				    relative = uri.path.split("/"),
				    commonpath = "",
				    i = 0,
				    length = Math.min(current.length, relative.length);
	
				for (; i < length; i++) {
					if (current[i] === relative[i]) continue;
	
					break;
				}
	
				if (i > 0) commonpath = current.splice(0, i).join("/");
	
				if (commonpath) {
					var sub = "",
					    path = uri.path,
					    forward;
					while (path) {
						if (this.path.indexOf(path) === 0) {
							forward = this.path.replace(path, "");
							break;
						}
						path = path.replace(/\/?[^\/]+\/?$/i, "");
						sub += "../";
					}
					return util_combinePathes(sub, forward, this.file);
				}
	
				return this.toString();
			},
	
			toLocalFile: function toLocalFile() {
				var path = util_combinePathes(this.host, this.path, this.file);
	
				return util_win32Path(path);
			},
			toLocalDir: function toLocalDir() {
				var path = util_combinePathes(this.host, this.path, "/");
	
				return util_win32Path(path);
			},
			toDir: function toDir() {
				var str = this.protocol ? this.protocol + "://" : "";
	
				return str + util_combinePathes(this.host, this.path, "/");
			},
			isRelative: function isRelative() {
				return !(this.protocol || this.host);
			},
			getName: function getName() {
				return this.file.replace("." + this.extension, "");
			}
		});
	
		var rgx_protocol = /^([a-zA-Z]+):\/\//,
		    rgx_extension = /\.([\w\d]+)$/i,
		    rgx_win32Drive = /(^\/?\w{1}:)(\/|$)/,
		    rgx_fileWithExt = /([^\/]+(\.[\w\d]+)?)$/i;
	
		function util_isUri(object) {
			return object && typeof object === "object" && typeof object.combine === "function";
		}
	
		function util_combinePathes() {
			var args = arguments,
			    str = "";
			for (var i = 0, x, imax = arguments.length; i < imax; i++) {
				x = arguments[i];
				if (!x) continue;
	
				if (!str) {
					str = x;
					continue;
				}
	
				if (str[str.length - 1] !== "/") str += "/";
	
				str += x[0] === "/" ? x.substring(1) : x;
			}
			return str;
		}
	
		function normalize_pathsSlashes(str) {
	
			if (str[str.length - 1] === "/") {
				return str.substring(0, str.length - 1);
			}
			return str;
		}
	
		function util_clone(source) {
			var uri = new class_Uri(),
			    key;
			for (key in source) {
				if (typeof source[key] === "string") {
					uri[key] = source[key];
				}
			}
			return uri;
		}
	
		function normalize_uri(str) {
			return str.replace(/\\/g, "/").replace(/^\.\//, "")
	
			// win32 drive path
			.replace(/^(\w+):\/([^\/])/, "/$1:/$2");
		}
	
		function util_win32Path(path) {
			if (rgx_win32Drive.test(path) && path[0] === "/") {
				return path.substring(1);
			}
			return path;
		}
	
		function parse_protocol(obj) {
			var match = rgx_protocol.exec(obj.value);
	
			if (match == null && obj.value[0] === "/") {
				obj.protocol = "file";
			}
	
			if (match == null) {
				return;
			}obj.protocol = match[1];
			obj.value = obj.value.substring(match[0].length);
		}
	
		function parse_host(obj) {
			if (obj.protocol == null) {
				return;
			}if (obj.protocol === "file") {
				var match = rgx_win32Drive.exec(obj.value);
				if (match) {
					obj.host = match[1];
					obj.value = obj.value.substring(obj.host.length);
				}
				return;
			}
	
			var pathStart = obj.value.indexOf("/", 2);
	
			obj.host = ~pathStart ? obj.value.substring(0, pathStart) : obj.value;
	
			obj.value = obj.value.replace(obj.host, "");
		}
	
		function parse_search(obj) {
			var question = obj.value.indexOf("?");
			if (question === -1) {
				return;
			}obj.search = obj.value.substring(question);
			obj.value = obj.value.substring(0, question);
		}
	
		function parse_file(obj) {
			var match = rgx_fileWithExt.exec(obj.value),
			    file = match == null ? null : match[1];
	
			if (file == null) {
				return;
			}
			obj.file = file;
			obj.value = obj.value.substring(0, obj.value.length - file.length);
			obj.value = normalize_pathsSlashes(obj.value);
	
			match = rgx_extension.exec(file);
			obj.extension = match == null ? null : match[1];
		}
	
		class_Uri.combinePathes = util_combinePathes;
		class_Uri.combine = util_combinePathes;
	})();
	/*args*/
	//# sourceMappingURL=Uri.es6.map
	// end:source /src/class/Uri.es6
	// end:source ../utils/lib/utils.embed.js

	// source ../src/utils/exports.es6
	// source str.es6
	"use strict";
	
	var str_isEscaped, str_indexOfNewLine, str_remove, str_replaceByIndex, str_isInCharClass;
	(function () {
	
		str_isEscaped = function (str, i) {
			if (i === 0) {
				return false;
			}
			var c = str.charCodeAt(--i);
			if (c === 92) {
				if (str_isEscaped(str, c)) return false;
	
				return true;
			}
			return false;
		};
	
		str_indexOfNewLine = function (str, i) {
			var imax = str.length;
			while (++i < imax) {
				var c = str.charCodeAt(i);
				if (c === 13 || c === 10) {
					// \\r \\n
					return i;
				}
			}
			return -1;
		};
	
		// [start, end)
		str_remove = function (str, start, end) {
			return str.substring(0, start) + str.substring(end);
		};
	
		str_replaceByIndex = function (str, start, end, value) {
			return str.substring(0, start) + value + str.substring(end);
		};
	
		str_isInCharClass = function (str, i) {
			while (--i > -1) {
				var c = str.charCodeAt(i);
				if (c === 93 || c === 91) {
					//[]
					if (str_isEscaped(str, i)) {
						continue;
					}
					if (c === 93) {
						//]
						return false;
					}
					// [
					return true;
				}
			}
			return false;
		};
	})();
	//# sourceMappingURL=str.es6.map
	// end:source str.es6
	// source arr.es6
	"use strict";
	
	var arr_flattern;
	(function () {
		arr_flattern = function (arr) {
			var out = [],
			    imax = arr.length,
			    i = -1;
			while (++i < imax) {
				out = out.concat(arr[i]);
			}
			return out;
		};
	})();
	//# sourceMappingURL=arr.es6.map
	// end:source arr.es6
	// source dom.es6
	"use strict";
	
	var dom_appendChild, dom_prependChild, dom_insertBefore, dom_insertAfter, dom_removeChild, dom_clone;
	
	(function () {
		dom_appendChild = function (parent, child) {
			child.parentNode = parent;
	
			if (parent.lastChild == null) {
				parent.lastChild = child;
				parent.firstChild = child;
				child.nextSibling = null;
				child.previousSibling = null;
				return;
			}
	
			var last = parent.lastChild;
	
			parent.lastChild = child;
			last.nextSibling = child;
			child.previousSibling = last;
			child.nextSibling = null;
		};
		dom_prependChild = function (node, child) {
			child.parentNode = node;
	
			var first = node.firstChild;
			if (first == null) {
				node.firstChild = child;
				node.lastChild = child;
				return;
			}
	
			node.firstChild = child;
			child.nextSibling = first;
			first.previousSibling = child;
		};
	
		dom_insertBefore = function (node, prevEl) {
	
			prevEl.previousSibling = node.previousSibling;
			prevEl.nextSibling = node;
			node.previousSibling = prevEl;
	
			if (prevEl.previousSibling != null) {
				prevEl.previousSibling.nextSibling = prevEl;
			}
	
			var parent = prevEl.parentNode = node.parentNode;
			if (parent != null) {
				if (parent.firstChild === node) {
					parent.firstChild = prevEl;
				}
			}
		};
	
		dom_insertAfter = function (node, nextEl) {
			nextEl.nextSibling = node.nextSibling;
			nextEl.previousSibling = node;
			node.nextSibling = nextEl;
			if (nextEl.nextSibling != null) {
				nextEl.nextSibling.previousSibling = nextEl;
			}
	
			var parent = nextEl.parentNode = node.parentNode;
			if (parent != null) {
				if (parent.lastChild === node) {
					parent.lastChild = nextEl;
				}
			}
		};
	
		dom_removeChild = function (el) {
			if (el.nextSibling) {
				el.nextSibling.previousSibling = el.previousSibling;
			}
			if (el.previousSibling) {
				el.previousSibling.nextSibling = el.nextSibling;
			}
			var parent = el.parentNode;
			if (parent.firstChild === el) {
				parent.firstChild = el.nextSibling;
			}
			if (parent.lastChild === el) {
				parent.lastChild = el.previousSibling;
			}
			el.parentNode = null;
			el.nextSibling = null;
			el.previousSibling = null;
		};
	
		dom_clone = function (node) {
			var Ctor = node.constructor,
			    clone = new Ctor();
	
			obj_extend(clone, node);
			clone.parentNode = null;
			clone.nextSibling = null;
			clone.previousSibling = null;
			clone.firstChild = null;
			clone.lastChild = null;
	
			for (var el = node.firstChild; el != null; el = el.nextSibling) {
				var child = dom_clone(el);
				clone.appendChild(child);
			}
			return clone;
		};
	})();
	//# sourceMappingURL=dom.es6.map
	// end:source dom.es6
	// source flags.es6
	"use strict";
	
	var flags_serialize, flags_parse, flags_set, flags_equals, flags_clone, flags_extend;
	(function () {
		flags_serialize = function (flags) {
			var str = "";
			if (flags == null) {
				return flags_serialize(flags_DEFAULT);
			}
			if (flags.g) {
				str += "g";
			}
			if (flags.i) {
				str += "i";
			}
			if (flags.m) {
				str += "m";
			}
			return str;
		};
	
		var flags_DEFAULT = {
			g: true,
			m: true,
			i: false
		};
	
		flags_parse = function (str) {
			var out = {
				i: null,
				m: null,
				x: null };
			var flag = true,
			    imax = str.length,
			    i = -1;
			while (++i < imax) {
				var c = str.charCodeAt(i);
				if (c === 63 /*?*/) {
					continue;
				}
				if (c === 45 /* - */) {
					flag = false;
					continue;
				}
				if (c === 105) {
					out.i = flag;
					continue;
				}
				if (c === 109) {
					out.m = flag;
					continue;
				}
				if (c === 120) {
					out.x = flag;
					continue;
				}
				if (c === 58) {
					//:
					return out;
				}
				throw Error("Unsupported flag " + str[i]);
			}
			return out;
		};
	
		flags_set = function (current, on, off) {
			var flags = current || {};
	
			update(flags, on, off, "i");
			update(flags, on, off, "m");
			return flags;
		};
	
		flags_equals = function (a, b) {
			if (a == b) {
				return true;
			}
			if (a == null || b == null) {
				return false;
			}
			return a.i === b.i && a.m === b.m;
		};
	
		flags_clone = function (b) {
			if (b == null) {
				return null;
			}
			return {
				i: b.i || false,
				m: b.m || false,
				x: b.x || false
			};
		};
	
		flags_extend = function (a, b) {
			if (a == null) {
				return b;
			}
			if (b == null) {
				return a;
			}
			b.i != null && (a.i = b.i);
			b.m != null && (a.m = b.m);
			return a;
		};
	
		function update(flags, on, off, key) {
			if (on.indexOf(key) !== -1) {
				flags[key] = true;
				return;
			}
			if (off.indexOf(key) !== -1) {
				flags[key] = false;
				return;
			}
		}
	})();
	//# sourceMappingURL=flags.es6.map
	// end:source flags.es6
	//# sourceMappingURL=exports.es6.map
	// end:source ../src/utils/exports.es6
	// source ../src/Ast/exports.es6
	// source visitor.es6
	"use strict";
	
	var visitor_firstLiteral, visitor_flattern, visitor_walk, visitor_walkEx, visitor_walkByType, visitor_walkUp, visitor_getBlocks;
	
	(function () {
		visitor_firstLiteral = function (node) {
			var first = node.firstChild;
			return first == null || first.type !== Node.LITERAL ? null : first.textContent;
		};
	
		visitor_flattern = function (root) {
			var arr = [];
			walk(walk_DOWN, root, function (x) {
				return arr.push(x);
			});
			return arr;
		};
	
		visitor_walk = function (root, fn) {
			walk(walk_DOWN, root, fn);
		};
		visitor_walkByType = function (root, type, fn) {
			walk(walk_DOWN, root, function (x) {
				if (x.type === type) {
					return fn(x);
				}
			});
		};
		visitor_walkUp = function (root, fn) {
			walk(walk_UP, root, fn);
		};
	
		visitor_walkEx = function (root, fn) {
			walkEx(root, fn);
		};
	
		var walk_UP = 1,
		    walk_DOWN = 2;
		function walk(direction, node, fn) {
			var el = node.firstChild,
			    next;
			while (el != null) {
				if (direction === walk_DOWN) {
					next = fn(el);
					walk(direction, next || el, fn);
				} else {
					walk(direction, el, fn);
					next = fn(el);
				}
	
				el = (next || el).nextSibling;
			}
		}
	
		function walkEx(node, fn) {
			var el = node.firstChild,
			    mode;
			while (el != null) {
				mode = fn(el);
				if (mode != null) {
					if (mode.cursor) {
						el = mode.cursor;
						continue;
					}
					if (mode.deep === false) {
						el = el.nextSibling;
						continue;
					}
				}
				walkEx(el, fn);
				el = el.nextSibling;
			}
		}
	})();
	//# sourceMappingURL=visitor.es6.map
	// end:source visitor.es6
	// source transformer.es6
	"use strict";
	
	var transformer_replaceNode;
	(function () {
		transformer_replaceNode = function (old_, new_) {
			var shouldPreserveChildren = arguments[2] === undefined ? true : arguments[2];
	
			var parent = old_.parentNode;
			parent.insertBefore(new_, old_);
			parent.removeChild(old_);
	
			if (shouldPreserveChildren === true) {
				var el = old_.firstChild;
				while (el != null) {
	
					dom_removeChild(el);
					dom_appendChild(new_, el);
					el = old_.firstChild;
				}
			}
			return new_;
		};
	})();
	//# sourceMappingURL=transformer.es6.map
	// end:source transformer.es6
	// source parser.es6
	"use strict";
	
	var parser_parseGroups;
	(function () {
	
		var state_LITERAL = 1,
		    state_GROUP_START = 2,
		    state_GROUP_END = 3,
		    state_CHAR_CLASS = 4;
	
		parser_parseGroups = function (str) {
			var root = new Node.Root(),
			    imax = str.length,
			    i = -1,
			    lastI = 0,
			    current = root,
			    state,
			    c;
	
			while (++i < imax) {
				c = str.charCodeAt(i);
	
				if (state === state_GROUP_END) {
					state = state_LITERAL;
					if (c === 63 || c === 42 || c === 43 || c === 123) {
						//?*+{
						var repetition,
						    lazy = false,
						    possessive = false;
						if (c === 123) {
							var end = str.indexOf("}", i);
							repetition = str.substring(i, end + 1);
							i = end;
						} else {
							repetition = str[i];
							if (i < imax - 1) {
								c = str.charCodeAt(i + 1);
								if (c === 63) {
									lazy = true;
									i++;
								}
								if (c === 43) {
									possessive = true;
									i++;
								}
							}
						}
						var group = current.lastChild;
						group.repetition = repetition;
						group.lazy = lazy;
						group.possessive = possessive;
	
						state = state_LITERAL;
						c = str.charCodeAt(++i);
					}
					lastI = i;
				}
	
				if (c === 92) {
					// \ Escape next character
					++i;
					continue;
				}
				if (c === 91 /* [ */) {
					// [
					state = state_CHAR_CLASS;
					continue;
				}
				if (c === 93 /* ] */) {
					state = state_LITERAL;
					continue;
				}
	
				if (state === state_CHAR_CLASS) {
					continue;
				}
	
				if (c !== 40 && c !== 41 && c !== 124) {
					state = state_LITERAL;
					// ()|
					continue;
				}
	
				if (lastI < i) {
					// read the literal
					var literal = new Node.Literal(str.substring(lastI, i));
					current.appendChild(literal);
				}
	
				lastI = i + 1;
	
				if (c === 40) {
					// ( Group starting
					var group = new Node.Group();
					current.appendChild(group);
					current = group;
					state = state_GROUP_START;
					continue;
				}
				if (c === 41) {
					// ) Group ending
					current = current.parentNode;
					state = state_GROUP_END;
					continue;
				}
				if (c === 124) {
					// |
					var or = new Node.Or();
					current.appendChild(or);
					continue;
				}
			}
	
			if (current !== root) {
				throw new Error("Group was not closed");
			}
	
			if (lastI < i) {
				// read the literal
				var literal = new Node.Literal(str.substring(lastI, i));
				current.appendChild(literal);
			}
	
			return root;
		};
	})();
	//# sourceMappingURL=parser.es6.map
	// end:source parser.es6
	// source ast.es6
	"use strict";
	
	var ast_combineNatives, ast_compileNatives, ast_indexGroups, ast_indexShadowedGroups, ast_createBlocks, ast_resolveBacktracks;
	
	(function () {
		ast_createBlocks = function (root) {
			visitor_walkByType(root, Node.OR, function (node) {
				var blocks = new Node.Blocks(),
				    block = new Node.Block(),
				    parent = node.parentNode;
	
				var el = parent.firstChild;
				while (el != null) {
					parent.removeChild(el);
					if (el.type === Node.OR) {
						blocks.appendChild(block);
						block = new Node.Block();
					} else {
						block.appendChild(el);
					}
					el = parent.firstChild;
				}
				blocks.appendChild(block);
				parent.appendChild(blocks);
				return blocks;
			});
		};
	
		ast_resolveBacktracks = function (root) {
			visitor_walkUp(root, function (node) {
				if (node.isBacktracked === false) {
					return;
				}
				if (node.type === Node.BLOCKS) {
					if (node.parentNode.isAtomic !== true) {
						node.isBacktracked = node.getLength() > 1;
					}
				}
				if (node.isBacktracked === true) {
					if (node.parentNode.isBacktracked !== false) node.parentNode.isBacktracked = true;
				}
			});
		};
	
		ast_combineNatives = function (root) {
			resolveNatives(root);
			debugger;
			combineNatives(root);
		};
		ast_compileNatives = function (root) {
			return compileNatives(root);
		};
		ast_indexGroups = function (root) {
			var groupNum = 0;
			visitor_walkByType(root, Node.GROUP, function (node) {
				if (node.isCaptured === false) {
					return;
				}
				node.groupNum = ++groupNum;
				if (node.name != null) {
	
					if (root.groups == null) root.groups = {};
	
					root.groups[node.name] = node.groupNum;
				}
			});
		};
	
		ast_indexShadowedGroups = function (root) {
			var groupNum = 0,
			    shadowGroupNum = 0;
			root.groupNumMapping = {};
			visitor_walkEx(root, function (node) {
				if (node.type !== Node.GROUP) {
					return;
				}
				//if (node.isIncluded === false) {
				//	visitor_walkByType(node, Node.GROUP, child => {
				//		if (child.isIncluded === true && child.isCaptured === true) {
				//			++groupNum;
				//		}
				//	});
				//	return { deep: false };
				//}
				if (node.isCaptured === false) {
					return;
				}
				node.shadowGroupNum = ++shadowGroupNum;
				if (node.isShadowGroup !== true) {
					node.groupNum = ++groupNum;
					root.groupNumMapping[node.groupNum] = shadowGroupNum;
				}
	
				if (node.name != null) {
					if (root.groups == null) {
						root.groups = {};
					}
					root.groups[node.name] = node.groupNum;
				}
			});
		};
	
		function resolveNatives(root) {
	
			visitor_walkUp(root, visit);
			visit(root);
	
			function visit(node) {
				if (node.isNative === false) {
					return;
				}
				var el = node.firstChild;
				while (el != null) {
					if (el.isNative === false) {
						node.isNative = false;
						break;
					}
					el = el.nextSibling;
				}
			}
		}
	
		function combineNatives(root) {
			if (root.isNative) {
				var literal = new Node.Literal(root.toString());
				root.empty();
				root.appendChild(literal);
				return;
			}
			combineNodes(root, root);
		}
		function combineNodes(node, root) {
	
			var hasBlocks, start, el;
			if (node !== root) {
				for (el = node.firstChild; el != null; el = el.nextSibling) {
					if (el.type === Node.OR) {
						hasBlocks = true;
						break;
					}
				}
			}
			for (var el = node.firstChild; el != null; el = el.nextSibling) {
				if (el.type === Node.OR) {
					continue;
				}
				combineNodes(el);
				if (hasBlocks === true) {
					continue;
				}
				if (el.isNative === false) {
					start = null;
					continue;
				}
				if (el.firstChild !== el.lastChild) {
					start = null;
					continue;
				}
				if (el.firstChild && flags_equals(el.firstChild.flags, el.flags) === false) {
					start = null;
					continue;
				}
				if (start == null) {
					start = el;
					continue;
				}
				if (flags_equals(start.flags, el.flags)) {
					continue;
				}
				if (el.previousSibling.type === Node.OR) {
					start = el;
					continue;
				}
				join(start, el);
				start = el;
			}
			if (start != null) {
				join(start, null);
			}
	
			// [start, end)
			function join(startEl, endEl) {
				var literal = new Node.Literal();
				dom_insertBefore(startEl, literal);
	
				var str = "",
				    cursor = startEl;
				while (cursor !== endEl) {
					str += cursor.toString();
					if (cursor.type === Node.GROUP && literal.groupNum == null) {
						literal.groupNum = cursor.groupNum;
					}
	
					dom_removeChild(cursor);
					cursor = literal.nextSibling;
				}
	
				literal.textContent = str;
				literal.flags = startEl.flags;
				return literal;
			}
		}
	
		function combine_flagsAreEqual(node) {
			var el = node.parentNode.firstChild;
			var flags = el.flags;
			while ((el = el.nextSibling) != null) {
				if (el.flags != flags) {
					return false;
				}
				flags = el.flags;
			}
			return true;
		};
		function compileNatives(node) {
			visitor_walk(node, function (node) {
				if (node.type !== Node.LITERAL) {
					if (typeof node.compile === "function") {
						node.compile();
					}
					return;
				}
				var rgx = new Node.RegexNode(node.textContent, node);
				return transformer_replaceNode(node, rgx, false);
			});
		}
	})();
	//# sourceMappingURL=ast.es6.map
	// end:source ast.es6
	// source ast_flags.es6
	"use strict";
	
	var ast_defineFlags;
	(function () {
		ast_defineFlags = function (root, str) {
	
			if (str != null) {
				root.flags = flags_extend(root.flags, flags_parse(str));
			}
	
			visitor_walk(root, function (node) {
				if (node.type !== Node.LITERAL) {
					return;
				}
				var txt = node.textContent,
				    flags,
				    visitor;
	
				if (rgx_FlagsGroup.test(txt)) {
					flags = flags_parse(txt);
					visitor = visitByGroup;
				}
				if (flags == null && rgx_FlagsInline.test(txt)) {
					flags = flags_parse(txt);
					visitor = visitByInline;
				}
				if (flags == null) {
					return;
				}
	
				var group = node.parentNode;
				if (flags.x === true) {
					handle_freeSpacing(group, visitor);
				}
				if (flags.i != null || flags.m != null) {
					handle_FlagsGlobal(group, visitor, flags);
				}
				if (visitor === visitByGroup) {
					return removeGroup(group);
				}
				if (visitor === visitByInline) {
					node.textContent = "?" + node.textContent.substring(node.textContent.indexOf(":"));
					return null;
				}
			});
		};
	
		function removeGroup(group) {
			var next = group.nextSibling;
			dom_removeChild(group);
			return next;
		}
	
		function handle_FlagsPartial(group, visitor, flags_) {
			var current = flags_clone(group.getFlags());
			var flags = flags_extend(current, flags_);
	
			var parent = group.parentNode;
			if (parent.type === Node.ROOT && parent.firstChild === group) {
				parent.flags = flags;
			} else {
				group.getRoot().isNative = false;
				handle_nativeFlags(group, flags, visitor);
			}
		}
	
		function handle_FlagsGlobal(group, visitor, flags_) {
			var current = flags_clone(group.getFlags());
			var flags = flags_extend(current, flags_);
			group.getRoot().flags = flags;
		}
	
		function handle_byGroup(group, flags, visitor) {
			var flags = flags_parse(txt);
			if (flags.x === true) {
				handle_freeSpacing(group, visitor);
			}
			if (flags.i != null || flags.m != null) {
	
				var current = flags_clone(group.getFlags());
				flags = flags_extend(current, flags);
	
				var parent = group.parentNode;
				if (parent.type === Node.ROOT && parent.firstChild === group) {
					parent.flags = flags;
				} else {
					group.getRoot().isNative = false;
					handle_nativeFlags(group, flags, visitor);
				}
			}
			var next = group.nextSibling;
			dom_removeChild(group);
			return next;
		}
	
		function handle_freeSpacing(node, visitor) {
			visitor(node, function (x) {
				if (x.type !== Node.LITERAL) {
					return;
				}
				x.textContent = format(x.textContent);
				if (x.textContent === "") {
					var next = x.nextSibling;
					dom_removeChild(x);
					return next;
				}
			});
		}
	
		function handle_nativeFlags(node, flags, visitor) {
			visitor(node, function (x) {
				x.flags = flags_extend(flags_clone(x.flags), flags);
			});
		}
	
		function visitByGroup(node, fn) {
			var el = node.nextSibling;
			while (el != null) {
				var next = fn(el);
				if (next != null) {
					el = next;
					continue;
				}
				visitor_walk(el, fn);
				el = el.nextSibling;
			}
		}
		function visitByInline(node, fn) {
			fn(node);
			visitor_walk(node, fn);
		}
	
		function format(str_) {
			var str = removeComments(str_);
			return str.replace(rgx_Whitespace, "");
		}
	
		function removeComments(str_) {
			var str = str_,
			    imax = str.length,
			    i = -1;
	
			while (i < imax && (i = str.indexOf("#", i)) > -1) {
				if (str_isEscaped(str, i) || isInCharClass(str, i)) {
					i++;
					continue;
				}
				var n = str_indexOfNewLine(str, i),
				    end = n === -1 ? imax : n;
	
				str = str_remove(str, i, end);
				i = end++;
			}
			return str;
		}
		var rgx_Whitespace = /[\s\n\r]+/g,
		    rgx_FlagsGroup = /^\?(\-?[imx]+){1,2}$/,
		    rgx_FlagsInline = /^\?(\-?[imx]+){1,2}:/;
	
		function isInCharClass(str, i) {
			while (--i > -1) {
				var c = str.charCodeAt(i);
				if (c === 93 || c === 91) {
					//[]
					if (str_isEscaped(str, i)) {
						continue;
					}
					if (c === 93) {
						//]
						return false;
					}
					// [
					return true;
				}
			}
			return false;
		}
	})();
	//# sourceMappingURL=ast_flags.es6.map
	// end:source ast_flags.es6
	// source ast_compile.es6
	"use strict";
	
	var ast_combineNatives, ast_compileNatives;
	
	(function () {
	
		ast_combineNatives = function (root) {
			resolveNatives(root);
			combineNatives(root);
		};
		ast_compileNatives = function (root) {
			return compileNatives(root);
		};
	
		function resolveNatives(root) {
	
			visitor_walkUp(root, function (node) {
				if (node.isNative === false) {
					node.parentNode.isNative = false;
				}
			});
		}
	
		function combineNatives(root) {
			if (root.isNative) {
				var literal = new Node.Literal(root.toString());
				root.empty();
				root.appendChild(literal);
				return;
			}
			combineNodes(root, root);
		}
	
		function combineNodes(node, root) {
			if (node.type === Node.LITERAL || node.type === Node.OR) {
				return node;
			}
			var startEl,
			    el,
			    hasCustom = false,
			    hasAlternation = false;
			if (node !== root && node.parentNode.firstChild !== node && node.parentNode.lastChild !== node) {
				for (el = node.firstChild; el != null; el = el.nextSibling) {
					if (el.type === Node.OR) {
						hasAlternation = true;
						continue;
					}
					if (el.checkNative() === false) {
						hasCustom = true;
					}
				}
			}
			if (hasAlternation && hasCustom === false) {
				for (el = node.nextSibling; el != null; el = el.nextSibling) {
					if (el.checkNative() === false) {
						hasCustom = true;
						break;
					}
				}
				if (hasCustom === false) {
					var el = node.parentNode;
					for (el = node.nextSibling; el != null; el = el.nextSibling) {
						if (el.checkNative() === false) {
							hasCustom = true;
							break;
						}
					}
				}
				if (hasCustom === false) {
					hasAlternation = false;
				}
			}
	
			for (el = node.firstChild; el != null; el = el.nextSibling) {
				if (el.type === Node.OR) {
					hasAlternation = true;
				}
				el = combineNodes(el) || el;
				if (el.type !== Node.OR && canBeJoined(el, startEl) === true) {
					if (startEl == null) {
						startEl = el;
					}
					continue;
				}
				hasCustom = true;
	
				if (startEl == null) {
					continue;
				}
				var endEl = el;
				if (endEl.previousSibling.type === Node.OR) {
					endEl = endEl.previousSibling;
				}
	
				toLiteral(startEl, el);
				startEl = null;
			}
	
			if (hasCustom === false && hasAlternation === false && node.checkNative() === true && node !== root) {
				return toLiteral(node, void 0);
			}
			if (startEl != null) {
				toLiteral(startEl, null);
			}
			return null;
		}
	
		function canBeJoined(node, startNode) {
			return node.checkNative();
	
			if (node.isNative === false) {
				return false;
			}
			if (node.firstChild !== node.lastChild) {
				return false;
			}
			if (node.firstChild != null) {
				if (node.firstChild !== node.lastChild) {
					return false;
				}
				if (flags_equals(node.firstChild.flags, node.flags) === false) {
					return false;
				}
			}
			if (startNode != null && flags_equals(startNode.flags, node.flags) === false) {
				return false;
			}
			return true;
		}
	
		// [start, end?)
		function toLiteral(startEl, endEl) {
			if (startEl.type === Node.LITERAL && (endEl === void 0 || startEl.nextSibling == null)) {
				return startEl;
			}
			var literal = new Node.Literal();
			dom_insertBefore(startEl, literal);
	
			var str = "",
			    el = startEl,
			    end = endEl === void 0 ? el.nextSibling : endEl;
			while (el !== end) {
				str += el.toString();
				if (el.groupNum != null && (literal.groupNum == null || literal.groupNum > el.groupNum)) {
					literal.groupNum = el.groupNum;
				}
				dom_removeChild(el);
				el = literal.nextSibling;
			}
			if (str === "?=") {
				var next = literal.nextSibling;
				dom_removeChild(literal);
				return next;
			}
			literal.textContent = str;
			literal.flags = startEl.flags || startEl.firstChild && startEl.firstChild.flags;
			return literal;
		}
	
		function compileNatives(node) {
			visitor_walk(node, function (node) {
				if (node.type !== Node.LITERAL) {
					if (typeof node.compile === "function") {
						node.compile();
					}
					return;
				}
				var rgx = new Node.RegexNode(node.textContent, node);
				return transformer_replaceNode(node, rgx, false);
			});
		}
	})();
	//# sourceMappingURL=ast_compile.es6.map
	// end:source ast_compile.es6
	//# sourceMappingURL=exports.es6.map
	// end:source ../src/Ast/exports.es6
	// source ../src/Nodes/exports.es6
	"use strict";
	
	var Node = {};
	(function () {
	
		var type_Group = 1,
		    type_Literal = 2,
		    type_OR = 3,
		    type_Block = 4,
		    type_Blocks = 5,
		    type_Root = 0,
		    type_Regex = 6;
	
		// source ./RegexOpts.es6
		"use strict";
	
		var RegexOpts = class_create({
			isNative: true,
			isCaptured: true,
			isIncluded: true,
			isAtomic: false,
			isBacktracked: null,
	
			flags: null,
			cursor: null,
	
			serializeFlags: function serializeFlags() {
				return flags_serialize(this.getFlags());
			},
			getFlags: function getFlags() {
				var el = this;
				while (el != null && el.flags == null) {
					el = el.parentNode;
				}
	
				return el && el.flags;
			},
			setFlags: function setFlags(on, off) {
				this.flags = el_set(this.getFlags(), on, off);
			}
		});
		//# sourceMappingURL=RegexOpts.es6.map
		// end:source ./RegexOpts.es6
		// source ./AstNode.es6
		"use strict";
	
		var AstNode = class_create(RegexOpts, {
	
			lastChild: null,
			firstChild: null,
			nextSibling: null,
			previousSibling: null,
	
			parentNode: null,
	
			textContent: null,
	
			appendChild: function appendChild(node) {
				dom_appendChild(this, node);
			},
			prependChild: function prependChild(node) {
				dom_prependChild(this, node);
			},
			removeChild: function removeChild(el) {
				dom_removeChild(el);
			},
			insertBefore: function insertBefore(node, anchor) {
				if (anchor == null) {
					this.prependChild(node);
					return;
				}
				dom_insertBefore(anchor, node);
			},
			insertAfter: function insertAfter(node, anchor) {
				if (anchor == null) {
					this.appendChild(node);
					return;
				}
				dom_insertAfter(anchor, node);
			},
	
			empty: function empty() {
				var el;
				while ((el = this.firstChild) != null) {
					dom_removeChild(el);
				}
			},
	
			getRoot: function getRoot() {
				var el = this;
				while (el != null) {
					if (el.type === type_Root) {
						return el;
					}
					el = el.parentNode;
				}
				return null;
			},
	
			getChildren: function getChildren() {
				var arr = [];
				var el = this.firstChild;
				while (el != null) {
					arr.push(el);
					el = el.nextSibling;
				}
				return arr;
			},
	
			getLength: function getLength() {
				var l = 0;
				for (var el = this.firstChild; el != null; el = el.nextSibling) {
					l++;
				}
				return l;
			},
	
			checkNative: function checkNative() {
				if (this.isNative === false) {
					return false;
				}
				for (var el = this.firstChild; el != null; el = el.nextSibling) {
					if (el.checkNative() === false) {
						return false;
					}
				}
				return true;
			},
			checkIncluded: function checkIncluded() {
				var el = this;
				while (el != null) {
					if (el.isIncluded === false) {
						return false;
					}
					el = el.parentNode;
				}
				return true;
			}
		});
		//# sourceMappingURL=AstNode.es6.map
		// end:source ./AstNode.es6
		// source ./Literal.es6
		"use strict";
	
		var Literal = class_create(AstNode, {
	
			type: type_Literal,
	
			constructor: function constructor(text) {
				this.textContent = text;
			},
	
			toString: function toString() {
				return this.textContent;
			},
	
			checkNative: function checkNative() {
				return true;
			}
		});
		//# sourceMappingURL=Literal.es6.map
		// end:source ./Literal.es6
		// source ./Or.es6
		"use strict";
	
		var Or = class_create(AstNode, {
			type: type_OR,
			toString: function toString() {
				return "|";
			}
		});
		//# sourceMappingURL=Or.es6.map
		// end:source ./Or.es6
		// source ./Group.es6
		"use strict";
	
		var Group = class_create(AstNode, {
	
			index: 0,
			groupNum: null,
	
			type: type_Group,
	
			name: null,
	
			repetition: "",
			lazy: false,
			possessive: false,
	
			pos: null,
			value: null,
	
			toString: function toString() {
				var str = "(",
				    el = this.firstChild;
	
				while (el != null) {
					str += el.toString();
					el = el.nextSibling;
				}
				str += ")";
				if (this.repetition != null) {
					str += this.repetition;
				}
				if (this.lazy === true) {
					str += "?";
				}
				if (this.possessive === true) {
					str += "+";
				}
				return str;
			}
		});
		//# sourceMappingURL=Group.es6.map
		// end:source ./Group.es6
		// source ./Block.es6
		"use strict";
	
		var Block = class_create(AstNode, {
			type: type_Block,
	
			toString: function toString() {
				var str = "",
				    el = this.firstChild;
	
				while (el != null) {
					str += el.toString();
					el = el.nextSibling;
				}
				return str;
			}
		});
		//# sourceMappingURL=Block.es6.map
		// end:source ./Block.es6
		// source ./Blocks.es6
		"use strict";
	
		var Blocks = class_create(AstNode, {
	
			type: type_Blocks,
			cursor: null,
	
			toString: function toString() {
				var parts = [],
				    el = this.firstChild;
	
				while (el != null) {
					parts.push(el.toString());
					el = el.nextSibling;
				}
				return parts.join("|");
			}
		});
		//# sourceMappingURL=Blocks.es6.map
		// end:source ./Blocks.es6
		// source ./Root.es6
		"use strict";
	
		var Root = class_create(Block, {
	
			type: type_Root,
	
			constructor: function constructor() {
				this.flags = {
					i: false,
					y: false,
					m: true,
					g: true };
			},
	
			exec: function exec(str, i) {
				var opts = new exec_Opts();
				var internal = exec_root(this, str, i, opts);
				if (internal == null) {
					return null;
				}
				var match = internal.toMatch();
				var groups = match.groups,
				    imax = groups.length + 1,
				    i = 0,
				    arr = new Array(imax),
				    x;
				while (++i < imax) {
					x = groups[i - 1];
					arr[i] = x && x.value;
				}
				arr[0] = match.value;
				arr.index = match.index;
				arr.groups = {};
				return arr;
			},
	
			match: (function (_match) {
				var _matchWrapper = function match(_x, _x2) {
					return _match.apply(this, arguments);
				};
	
				_matchWrapper.toString = function () {
					return _match.toString();
				};
	
				return _matchWrapper;
			})(function (str, i) {
				var opts = new exec_Opts();
				opts.indexed = true;
				var match = exec_root(this, str, i, opts);
				if (match == null) {
					return null;
				}
				return match.toMatch();
			}),
	
			groups: null,
			expressions: null,
			transformers: null,
			filters: null,
	
			addTransformer: function addTransformer(fn) {
				if (this.transformers == null) this.transformers = [];
				this.transformers.push(fn);
			},
			addFilter: function addFilter(fn) {
				if (this.filters == null) this.filters = [];
				this.filters.push(fn);
			}
		});
		//# sourceMappingURL=Root.es6.map
		// end:source ./Root.es6
		// source ./RegexNode.es6
		"use strict";
	
		var RegexNode;
		(function () {
			RegexNode = class_create(Literal, {
				type: type_Regex,
	
				rgxIndexer: null,
				domIndexer: null,
	
				rgxIndexerSearch: null,
				rgxIndexerSticky: null,
	
				groupNum: null,
				groupCount: null,
	
				hasInvisible: false,
				isLazy: false,
				isBacktracked: false,
	
				constructor: function constructor(text, node) {
					var flags = node.serializeFlags();
					if (flags.indexOf("g") === -1) {
						flags += "g";
					}
					this.createIndexed_(flags);
					this.groupNum = node.groupNum;
					this.isLazy = hasRepetition(text);
					this.isBacktracked = this.isLazy;
				},
				exec: function exec(str_, i, opts) {
					var str = str_;
					if (this.cursor != null) {
						if (--this.cursor.end < this.cursor.start) {
							this.cursor = null;
							return null;
						}
						str = str.substring(this.cursor.start, this.cursor.end);
					}
					var regex, match, matchIndex;
					if (opts.fixed) {
						var sub = str.substring(i);
						match = this.rgxIndexerSticky.exec(sub);
						if (match == null) {
							this.cursor = null;
							return null;
						}
						matchIndex = i;
					} else {
						this.rgxIndexerSearch.lastIndex = i;
						match = this.rgxIndexerSearch.exec(str);
						if (match == null) {
							this.cursor = null;
							return null;
						}
						matchIndex = match.index;
					}
					if (this.isBacktracked === true && this.cursor == null) {
						this.cursor = {
							start: matchIndex,
							end: matchIndex + match[0].length
						};
					}
					var value = resolveIndexedMatchValue(this, this.domIndexer, match);
					return new MatchInternal(matchIndex, value, this, match);
				},
	
				getGroups: function getGroups(match, matchIndex) {
					return resolveIndexedMatchGroups(this, match, matchIndex);
				},
	
				getMatch: function getMatch(indexedMatch) {
					var match = new Match();
					match.value = "";
					match.index = indexedMatch.index;
					match.groups = new Array(this.groupCount);
					match.groupNum = this.groupNum;
	
					if (this.groupCount === 0) {
						match.value = indexedMatch[0];
						return match;
					}
					match.groups = resolveIndexedMatchGroups(this, indexedMatch.match);
					return match;
				},
	
				createIndexed_: function createIndexed_(flags) {
					this.createIndexerDom_();
					this.wrapGroups_();
	
					ast_indexShadowedGroups(this.domIndexer);
	
					this.adjustBacktracks_();
	
					var regex = this.domIndexer.toString();
					this.rgxIndexerSearch = new RegExp(regex, flags);
					this.rgxIndexerSticky = new RegExp("^" + regex, flags.replace(/[gm]/g, ""));
				},
	
				createIndexerDom_: function createIndexerDom_() {
					this.domIndexer = parser_parseGroups(this.textContent);
					visitor_walkByType(this.domIndexer, Node.LITERAL, function (node) {
						var parent = node.parentNode;
						if (parent.firstChild !== node || parent.type !== Node.GROUP) {
							return;
						}
						var str = node.textContent;
						var c = str.charCodeAt(0);
						if (c !== 63) {
							// ?
							return;
						}
						c = str.charCodeAt(1);
						if (c === 61 || c === 33) {
							// =:
							//node.textContent = '?:' + str.substring(2);
							parent.isIncluded = false;
							parent.isCaptured = false;
							//this.hasInvisible = true;
						}
						if (c === 58) {
							// :
							parent.isCaptured = false;
						}
					});
				},
	
				wrapGroups_: function wrapGroups_() {
					visitor_walkUp(this.domIndexer, function (node) {
						if (node.type === Node.OR) {
							return;
						}
						var parent = node.parentNode;
						if (parent.firstChild === parent.lastChild) {
							return;
						}
						if (node.type === Node.GROUP) {
							if (node.repetition === "" && node.isCaptured === true) {
								return;
							}
						}
						if (node.type === Node.LITERAL) {
							var txt = node.textContent;
							if (txt === "\\b" || txt === "^" || txt === "$") {
								return;
							}
							var c = txt.charCodeAt(0);
							if (c === 63 /* ? */) {
								c = txt.charCodeAt(1);
								if (c === 58 || c === 61 || c === 33) {
									//:=!
									if (txt.length > 2) {
										var literal = new Node.Literal(txt.substring(2));
										dom_insertAfter(node, literal);
									}
									node.textContent = txt.substring(0, 2);
									return;
								}
							}
						}
	
						var group = new Node.Group();
						group.isShadowGroup = true;
	
						dom_insertBefore(node, group);
						dom_removeChild(node);
						dom_appendChild(group, node);
						return group;
					});
				},
	
				adjustBacktracks_: function adjustBacktracks_() {
					var mappings = this.domIndexer.groupNumMapping;
					visitor_walkByType(this.domIndexer, Node.LITERAL, function (node) {
						node.textContent = node.textContent.replace(rgx_groupBacktrack, function (full, c, num) {
							return c + "\\" + mappings[+num];
						});
					});
				}
			});
	
			var resolveIndexedMatchValue;
			(function () {
				resolveIndexedMatchValue = function (regexNode, domIndexer, match) {
					if (regexNode.hasInvisible === false) {
						return match[0];
					};
					return resolve(domIndexer, match);
				};
				function resolve(node, nativeMatch) {
					var str = "";
					for (var el = node.firstChild; el != null; el = el.nextSibling) {
						if (el.isIncluded === false) {
							continue;
						}
						if (isPartialIncluded(el)) {
							str += resolve(el, nativeMatch);
							continue;
						}
						if (el.shadowGroupNum == null) {
							str += resolve(el, nativeMatch);
							continue;
						}
						str += nativeMatch[el.shadowGroupNum];
					}
					return str;
				}
				function isPartialIncluded(node) {
					for (var el = node.firstChild; el != null; el = el.nextSibling) {
						if (el.isIncluded === false || isPartialIncluded(el) === true) {
							return true;
						}
					}
					return false;
				}
			})();
	
			var resolveIndexedMatchGroups;
			(function () {
				resolveIndexedMatchGroups = function (regexNode, match, matchIndex) {
					var groups = [];
					resolve(regexNode.domIndexer, match, matchIndex, groups);
					return groups;
				};
				function resolve(node, nativeMatch, pos, groups, parentGroup) {
					var group;
					if (node.groupNum != null && node.groupNum !== 0) {
						var value = nativeMatch[node.shadowGroupNum];
						group = new MatchGroup();
						group.value = value;
						group.index = pos;
						groups[node.groupNum - 1] = group;
	
						if (value != null && node.repetition !== "" && parentGroup != null) {
							group.index += parentGroup.value.length - value.length - 1;
						}
					}
	
					var nextPos = pos;
					for (var el = node.firstChild; el != null; el = el.nextSibling) {
						var next = resolve(el, nativeMatch, nextPos, groups, group || parentGroup);
						if (el.isIncluded !== false) {
							nextPos = next;
						}
					}
	
					if (node.shadowGroupNum != null && node.shadowGroupNum !== 0) {
						var value = nativeMatch[node.shadowGroupNum] || "";
						pos = pos + value.length;
					}
					return pos;
				}
			})();
	
			function hasRepetition(str) {
				var imax = str.length,
				    i = -1,
				    esc = false;
				while (++i < imax) {
					var c = str.charCodeAt(i);
					if (c === 92 && esc === false) {
						// \\
						i++;
						esc = true;
					}
					esc = false;
					if (c === 42 || c === 63 || c === 43) {
						// *?+
						return true;
					}
				}
				return false;
			}
	
			var rgx_groupBacktrack = /(^|[^\\])\\(\d+)/g;
		})();
		//# sourceMappingURL=RegexNode.es6.map
		// end:source ./RegexNode.es6
	
		Node = {
			Literal: Literal,
			Root: Root,
			Group: Group,
			Or: Or,
			Block: Block,
			Blocks: Blocks,
			RegexNode: RegexNode,
			REGEX: type_Regex,
			OR: type_OR,
			GROUP: type_Group,
			LITERAL: type_Literal,
			BLOCK: type_Block,
			BLOCKS: type_Blocks,
			ROOT: type_Root
		};
	})();
	//# sourceMappingURL=exports.es6.map
	// end:source ../src/Nodes/exports.es6
	// source ../src/utils/exec.es6
	"use strict";
	
	var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };
	
	var _defineProperty = function (obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); };
	
	var exec_root, exec_children, exec_clearCursors, exec_Opts;
	(function () {
	
		exec_root = function (root, str, i, opts_) {
			backtrack_clearCursors(root);
			debugger;
			var opts = new exec_Opts(opts_);
			opts.lastIndex = i;
			var match = exec_children(root, str, i, opts);
			if (match == null) {
				return null;
			}
			if (root.flags.y && match.index !== i) {
				return null;
			}
			if (root.filters != null) {
				var fns = root.filters,
				    imax = fns.length,
				    i = -1;
				while (++i < imax) {
					match = fns[i](str, match, root);
					if (match == null) {
						return null;
					}
				}
			}
			if (root.transformers != null) {
				var fns = root.transformers,
				    imax = fns.length,
				    i = -1;
				while (++i < imax) {
					fns[i](root, match);
				}
			}
	
			match.namedGroups = root.groups;
			return match;
		};
	
		exec_children = function (node, str, i_, opts_, start, end) {
	
			var matches = [],
			    backtracking = [],
			    opts = new Opts(opts_),
			    el = start || node.firstChild,
			    i = i_,
			    imax = str.length,
			    search = opts.fixed !== true ? new Backtrack(i_, 0, el, opts) : null;
	
			while (el != end) {
				if (i > imax) {
					return null;
				}
				var matcher = Matchers[el.type];
				var match = el.exec ? el.exec(str, i, opts) : matcher(el, str, i, opts);
				if (match == null) {
					if (backtracking.length !== 0) {
						var track = backtracking.pop();
						i = track.strI;
						el = track.el;
						matches.splice(track.matchI);
						opts = track.opts;
	
						if (el.isLazy !== true) {
							i++;
						}
						continue;
					}
	
					if (search && matches.length !== 0) {
						i = search.strI + 1;
						el = search.el;
						matches.length = 0;
						opts = search.opts;
						backtrack_clearCursors(node);
						continue;
					}
					return null;
				}
				if (el.isBacktracked) {
					backtracking.push(new Backtrack(i, matches.length, el, opts));
				}
				if (search != null && matches.length === 0) {
					search.strI = match.index;
				}
	
				i = opts.fixed ? i + match.value.length : match.index + match.value.length;
				matches.push(match);
				opts.fixed = true;
				el = el.nextSibling;
			}
			return matches_joinInternal(matches);
		};
	
		exec_clearCursors = backtrack_clearCursors;
	
		var Backtrack = function Backtrack(strI, matchI, el, opts) {
			this.strI = strI;
			this.matchI = matchI;
			this.el = el;
			this.opts = new Opts(opts);
		};
	
		var Opts = exec_Opts = function (current) {
			this.fixed = false;
			this.indexed = false;
			this.lastIndex = 0;
			if (current == null) {
				return;
			}
			this.fixed = current.fixed;
			this.indexed = current.indexed;
			this.lastIndex = current.lastIndex;
		};
	
		var Matchers = (function () {
			var _Matchers = {};
	
			_defineProperty(_Matchers, Node.REGEX, function (rgx, str, i, opts) {
				var regex, match;
				if (opts.fixed) {
					var sub = str.substring(i);
					match = rgx.rgxFixed.exec(sub);
				} else {
					rgx.rgxSearch.lastIndex = i;
					match = rgx.rgxSearch.exec(str);
				}
				if (match == null) {
					return null;
				}
				if (rgx.groupNum != null) {
					match.groupNum = rgx.groupNum;
				}
				return match;
			});
	
			_defineProperty(_Matchers, Node.GROUP, function (group, str, i, opts) {
				var match = exec_children(group, str, i, opts);
				if (match == null) {
					return null;
				}
				//if (group.isCaptured !== false && group.isIncluded !== false) {
				//	var group = new MatchGroup();
				//	group.value = match.value;
				//	group.index = match.index;
				//	match.groups.unshift(group);
				//}
				return match;
	
				//for(var el = group.parentNode; el != null ; el = el.parentNode) {
				//	if (el.type === Node.GROUP) {
				//		match.unshift(match[0]);
				//		return match;
				//	}
				//}
				//// Reposition matches
				//var groups = match.slice(0);
				//match.splice(1);
				//match.length = groups.length + group.index - 1;
				//match.splice(group.index, 0, ...groups);
				//return match;
			});
	
			_defineProperty(_Matchers, Node.BLOCKS, function (blocks, str, i, opts_) {
	
				var best,
				    bestEl,
				    match,
				    block = blocks.cursor == null ? blocks.firstChild : blocks.cursor.nextSibling;
	
				for (; block != null; block = block.nextSibling) {
					match = exec_children(block, str, i, opts_);
					if (match == null) {
						continue;
					}
					if (best == null) {
						best = match;
						bestEl = block;
						continue;
					}
					if (match.index < best.index) {
						best = match;
						bestEl = block;
					}
				}
				if (bestEl != null) {
					blocks.cursor = bestEl;
				}
				return best;
			});
	
			return _Matchers;
		})();
	
		function backtrack_clearCursors(node) {
			visitor_walk(node, function (x) {
				return x.cursor = null;
			});
			node.cursor = null;
		};
	
		function matches_join(matches) {
			var str = "";
			var out = new Match();
	
			out.value = "";
			out.index = matches[0].index;
	
			var i = -1,
			    imax = matches.length;
	
			while (++i < imax) {
				var match = matches[i],
				    groups = match.groups,
				    jmax = groups.length,
				    j = 0;
	
				out.value += match.value;
	
				if (match.groupNum != null) {
					var _out$groups;
	
					var pos = match.groupNum - 1;
					while (out.groups.length < pos) {
						out.groups[out.groups.length++] = null;
					}
					(_out$groups = out.groups).splice.apply(_out$groups, [pos, 0].concat(_toConsumableArray(groups)));
					continue;
				}
	
				out.groups = out.groups.concat(groups);
			}
			return out;
		}
	
		function matches_joinInternal(matches) {
			return new MatchInternalCollection(matches);
		}
	
		function matches_joinArray(matches) {
			var str = "";
			var out = [str];
	
			out.index = matches[0].index;
	
			var i = -1,
			    imax = matches.length;
	
			while (++i < imax) {
				var match = matches[i],
				    j = 0,
				    jmax = match.groups.length;
	
				str += match.value;
	
				var groups = match.groups,
				    jmax = groups.length,
				    j = -1,
				    arr = new Array(jmax);
				while (++j < jmax) {
					arr[j] = groups[j].value;
				}
	
				if (match.groupNum != null) {
					var pos = match.groupNum - 1,
					    length = pos + jmax - 1;
					while (out.groups.length < length) {
						out[out.length++] = null;
					}
					out.splice.apply(out, [pos, 0].concat(_toConsumableArray(arr)));
					continue;
				}
				out = out.concat(arr);
			}
			out.index = matches[0].index;
			return out;
		}
	})();
	//# sourceMappingURL=exec.es6.map
	// end:source ../src/utils/exec.es6
	// source ../src/Handlers/exports.es6
	"use strict";
	
	var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };
	
	var _defineProperty = function (obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); };
	
	var Handlers;
	(function () {
		Handlers = {
			define: function define(root) {
				walk(root, Initial);
			},
			beforeIndexed: function beforeIndexed(root) {
				walk(root, BeforeIndexed);
			},
			afterIndexed: function afterIndexed(root) {
				walk(root, AfterIndexed);
			},
			afterCombined: function afterCombined(root) {
				walk(root, AfterCombined);
			}
		};
	
		// source Groups/CommentGroup.es6
		"use strict";
	
		var CommentGroup;
		(function () {
	
			CommentGroup = {
	
				transform: function transform(node) {
					var next = node.nextSibling;
	
					dom_removeChild(node);
					return next;
				},
	
				canHandle: function canHandle(txt) {
					return txt[0] === "?" && txt[1] === "#";
				}
			};
		})();
		//# sourceMappingURL=CommentGroup.es6.map
		// end:source Groups/CommentGroup.es6
		// source Groups/NoneCapturedGroup.es6
		"use strict";
	
		var NoneCapturedGroup, NoneCapturedGroupNode;
	
		(function () {
	
			NoneCapturedGroup = {
	
				create: function create(node) {
					var literal = node.firstChild,
					    txt = literal.textContent;
	
					literal.textContent = txt.substring(2);
					var group = new NoneCapturedGroupNode();
					group.repetition = node.repetition;
					group.lazy = node.lazy;
					group.possessive = node.possessive;
	
					if (group.possessive) {
						return new PossessiveGroupNode(group);
					}
	
					return group;
				},
	
				canHandle: function canHandle(txt) {
					var c = txt.charCodeAt(1);
					return c === 58 /*:*/ || c === 62;
				}
			};
	
			NoneCapturedGroupNode = class_create(Node.Group, {
				isCaptured: false,
	
				toString: function toString() {
					var str = Node.Group.prototype.toString.call(this);
					return "(?:" + str.substring(1);
				}
			});
		})();
		//# sourceMappingURL=NoneCapturedGroup.es6.map
		// end:source Groups/NoneCapturedGroup.es6
		// source Groups/AtomicGroup.es6
		"use strict";
	
		var AtomicGroup = {
	
			//transform (node) {
			//	node.isAtomic = true;
			//	node.isNative = false;
			//
			//	var child = node.firstChild;
			//	child.textContent = child.textContent.substring(2);
			//},
	
			transform: function transform(node) {
				node.isCaptured = false;
				var child = node.firstChild;
				child.textContent = child.textContent.substring(2);
			},
	
			canHandle: function canHandle(txt) {
				return txt.charCodeAt(1) === 62 /*>*/;
			}
		};
		//# sourceMappingURL=AtomicGroup.es6.map
		// end:source Groups/AtomicGroup.es6
		// source Groups/NamedGroup.es6
		"use strict";
	
		var NamedGroup;
		(function () {
	
			NamedGroup = {
	
				transform: function transform(node) {
	
					var child = node.firstChild,
					    str = child.textContent,
					    match = rgx.exec(str);
	
					child.textContent = str.replace(rgx, "");
					node.name = match[2] || match[3];
				},
	
				canHandle: function canHandle(txt) {
					return rgx.test(txt);
				}
			};
	
			var rgx = /^\?('(\w+)'|<(\w+)>)/;
		})();
		//# sourceMappingURL=NamedGroup.es6.map
		// end:source Groups/NamedGroup.es6
		// source Groups/LookbehindGroup.es6
		"use strict";
	
		var LookbehindGroup;
		(function () {
	
			LookbehindGroup = {
	
				create: function create(node) {
					var lookbehind = new Lookbehind(node);
					if (node.firstChild === node.lastChild && node.firstChild.type === Node.LITERAL) {
						var txt = node.firstChild.textContent.replace(rgx_LBGroup, "");
						if (txt.length === 2 && txt[0] === "\\") {
							lookbehind.simpleChar = txt[1];
						}
						node.firstChild.textContent = "(" + txt + ")$";
						return lookbehind;
					}
					visitor_walkByType(node, Node.LITERAL, function (x) {
						var txt = x.textContent;
						x.textContent = "(" + txt.replace(rgx_LBGroup, "") + ")$";
					});
					return lookbehind;
				},
	
				canHandle: function canHandle(txt) {
					return rgx_LBGroup.test(txt);
				}
	
			};
	
			var rgx_LBGroup = /^\?<(!|=)/;
	
			var Lookbehind = class_create(Node.Group, {
	
				isCaptured: false,
				isIncluded: false,
				isPositive: true,
				isNative: false,
	
				simpleChar: null,
				constructor: function constructor(node) {
					node.isNative = false;
					node.isCaptured = false;
	
					this.isPositive = node.firstChild.textContent.charCodeAt(2) === 61 /*=*/;
				},
	
				exec: function exec(str, i, opts) {
					if (opts.fixed || this.nextSibling == null) {
						return this.execAnchored(str, i, opts);
					}
					return this.execSearch(str, i, opts);
				},
	
				execSearch: function execSearch(str, i_, opts_) {
					var next = this.nextSibling,
					    imax = str.length,
					    opts = new exec_Opts(opts_),
					    i = i_;
	
					opts.indexed = false;
					while (i < imax) {
						var match = exec_children(this, str, i, opts, next, next.nextSibling);
						if (match == null) {
							return null;
						}
	
						exec_clearCursors(next);
						i = match.index;
						var isMatched;
						if (this.simpleChar != null) {
							isMatched = str[i - 1] === this.simpleChar;
						} else {
							var start = i - 20;
							if (start < 0) start = 0;
							var beforeString = str.substring(start, i);
							var beforeMatch = exec_children(this, beforeString, 0, opts);
							isMatched = beforeMatch != null;
						}
	
						if (isMatched === false && this.isPositive === true || isMatched === true && this.isPositive === false) {
							i++;
							continue;
						}
	
						var result = new Match();
						result.index = i;
						result.value = "";
						return result;
					}
				},
	
				execAnchored: function execAnchored(str, i, opts) {
					var beforeString = str.substring(0, i),
					    beforeMatch = exec_children(this, beforeString, 0);
	
					if (this.isPositive === true && beforeMatch == null) {
						return null;
					} else if (this.isPositive === false && beforeMatch != null) {
						return null;
					}
					var match = new Match();
					match.index = i;
					match.value = "";
					return match;
				}
			});
		})();
		//# sourceMappingURL=LookbehindGroup.es6.map
		// end:source Groups/LookbehindGroup.es6
		// source Groups/LookaheadGroup.es6
		"use strict";
	
		var LookaheadGroup;
		(function () {
			LookaheadGroup = {
	
				transform: function transform(group) {
					group.isCaptured = false;
					group.isIncluded = false;
				},
	
				canHandle: function canHandle(txt) {
					var c = txt.charCodeAt(1);
					return c === 61 /*=*/ || c === 33 /*!*/;
				}
			};
		})();
		//# sourceMappingURL=LookaheadGroup.es6.map
		// end:source Groups/LookaheadGroup.es6
		// source Groups/OptionalGroup.es6
		"use strict";
	
		var OptionalGroup;
		(function () {
			OptionalGroup = {
				create: function create(node) {
					return new OptionalGroupNode(node);
				},
				canHandle: function canHandle(node) {
					if (node.type !== Node.GROUP) {
						return false;
					}
					var repetition = node.repetition;
					return repetition === "?" || repetition === "*";
				}
			};
	
			var OptionalGroupNode = class_create(Node.Group, {
	
				exec: function exec(str, i, opts) {
					if (opts.fixed) {
						return this.execAnchored(str, i, opts);
					}
					return this.execSearch(str, i, opts);
				},
	
				execSearch: function execSearch(str, i, opts) {
					var next = this.nextSibling;
					var selfMatch = exec_children(this, str, i, opts);
					if (next == null) {
						return selfMatch;
					}
					var nextMatch = exec_children(this, str, i, opts, next, next.nextSibling);
					exec_clearCursors(next);
	
					if (nextMatch == null) {
						return selfMatch;
					}
					if (selfMatch == null) {
						var match = new Match();
						match.index = nextMatch.index;
						match.value = "";
						return match;
					}
	
					if (selfMatch.index + selfMatch.value.length === nextMatch.index) {
						return selfMatch;
					}
					var match = new Match();
					match.index = nextMatch.index;
					match.value = "";
					return match;
				},
	
				execAnchored: function execAnchored(str, i, opts) {
					var match = exec_children(this, str, i, opts);
					if (match == null || match.index !== i) {
						match = new Match();
						match.index = i;
						match.value = "";
						return match;
					}
					return match;
				} });
		})();
		//# sourceMappingURL=OptionalGroup.es6.map
		// end:source Groups/OptionalGroup.es6
	
		// source Possessive.es6
		"use strict";
	
		var PossessiveGroup, PossessiveGroupNode, PossessiveLiteral;
	
		(function () {
	
			PossessiveGroup = {
	
				create: function create(node) {
					return new PossessiveGroupNode(node);
				},
	
				canHandle: function canHandle(node, root) {
					if (node.type !== Node.GROUP) {
						return false;
					}
					return node.possessive === true;
				}
			};
	
			PossessiveLiteral = {
				transform: function transform(node) {
					node.textContent = node.textContent.replace(rgx_possessiveCharClass, function (full, g1, g2) {
						return g1 + g2;
					});
				},
				canHandle: function canHandle(txt, root) {
					return rgx_possessiveCharClass.test(txt);
				}
			};
	
			var rgx_possessiveCharClass = /([^\\])([\*\+])\+/g;
	
			PossessiveGroupNode = class_create(Node.Group, {
				isNative: true,
				isBacktracked: false,
				compiled: false,
				isAtomic: true,
				constructor: function constructor(group) {
					this.isCaptured = group.isCaptured;
					this.repetition = group.repetition;
				},
				toString: function toString() {
					var str = Node.Group.prototype.toString.call(this);
					if (this.isCaptured === true) {
						return str;
					}
					return "(?:" + str.substring(1);
				}
			});
		})();
		//# sourceMappingURL=Possessive.es6.map
		// end:source Possessive.es6
		// source Literals/NamedBackreference.es6
		"use strict";
	
		var NamedBackreference;
		(function () {
	
			NamedBackreference = {
				transform: function transform(node, root) {
					var txt = node.textContent;
					txt = interpolate(root, txt, "\\k<", ">");
					txt = interpolate(root, txt, "\\k'", "'");
					node.textContent = txt;
				},
				canHandle: function canHandle(txt) {
					return rgx.test(txt);
				}
			};
	
			var rgx = /\\k('|<)(\w+)('|>)/g;
	
			function interpolate(root, str_, START, END) {
				var str = str_,
				    i = 0;
				while ((i = str.indexOf(START, i)) !== -1) {
					if (str_isEscaped(str, i)) {
						i++;
						continue;
					}
					var end = str.indexOf(END, i + START.length);
					var name = str.substring(i + START.length, end);
	
					var groupNum = root.groups[name];
					if (groupNum == null) {
						throw Error("Group not found: " + name);
					}
	
					str = str_replaceByIndex(str, i, end + 1, "\\" + groupNum);
					i += name.length;
				}
				return str;
			}
		})();
		//# sourceMappingURL=NamedBackreference.es6.map
		// end:source Literals/NamedBackreference.es6
		// source Literals/Subexpressions.es6
		"use strict";
	
		var Subexpressions;
		(function () {
	
			Subexpressions = {
				transform: function transform(node, root) {
					var expressions = getExpressions(root),
					    parts = split(node.textContent),
					    imax = parts.length,
					    i = -1;
	
					while (++i < imax) {
						var str = parts[i];
						if (str === "") {
							continue;
						}
						if (i % 2 === 0) {
							var literal = new Node.Literal(str);
							dom_insertBefore(node, literal);
							continue;
						}
						var group = expressions && expressions[str];
						if (group == null) {
							throw new Error("Invalid subexpression name: " + str);
						}
						group = dom_clone(group);
						group.name = null;
						dom_insertBefore(node, group);
					}
	
					dom_removeChild(node);
				},
				canHandle: function canHandle(txt) {
					return rgx.test(txt);
				}
			};
	
			var rgx = /\\g(<)(\w+)(>)/g;
	
			function split(txt_) {
				var txt = txt_,
				    DELIMITER = "%--%";
	
				txt = txt.replace(rgx, function (full, g1, name) {
					return DELIMITER + name + DELIMITER;
				});
				return txt.split(DELIMITER);
			}
			function getExpressions(root) {
				var expressions = {};
				visitor_walkByType(root, Node.GROUP, function (group) {
					if (group.name == null) {
						return;
					}
					expressions[group.name] = group;
				});
				return expressions;
			}
		})();
		//# sourceMappingURL=Subexpressions.es6.map
		// end:source Literals/Subexpressions.es6
		// source Literals/UnicodeCodePoint.es6
		"use strict";
	
		var UnicodeCodePoint;
		(function () {
			/* \x{200D} */
	
			UnicodeCodePoint = {
				transform: function transform(node) {
					node.textContent = interpolate(node.textContent);
				},
				canHandle: function canHandle(txt) {
					return txt.indexOf(str_START) !== -1;
				}
			};
	
			var str_START = "\\x{",
			    str_END = "}";
	
			function interpolate(str_) {
				var str = str_,
				    i = 0;
				while ((i = str.indexOf(str_START, i)) !== -1) {
					if (str_isEscaped(str, i)) {
						i++;
						continue;
					}
					var end = str.indexOf(str_END, i);
					var val = str.substring(i + str_START.length, end);
					if (val.length === 6) {
						continue;
					}
					if (val.length === 2) {
						val = "00" + val;
					}
					if (val.length !== 4) {
						throw Error("Not supported wide hexadecimal char: " + val);
					}
	
					str = str_replaceByIndex(str, i, end + 1, "\\u" + val);
					i += val.length;
				}
				return str;
			}
		})();
		//# sourceMappingURL=UnicodeCodePoint.es6.map
		// end:source Literals/UnicodeCodePoint.es6
		// source Literals/UnicodeCategory.es6
		"use strict";
	
		var UnicodeCategory;
		(function () {
			/* \p{L} */
			UnicodeCategory = {
				transform: function transform(node) {
					node.textContent = interpolate(node.textContent);
				},
				canHandle: function canHandle(txt) {
					return txt.indexOf(str_START) !== -1;
				}
			};
	
			var str_START = "\\p{",
			    str_END = "}";
	
			function interpolate(str_) {
				var str = str_,
				    i = 0;
				while ((i = str.indexOf(str_START, i)) !== -1) {
					if (str_isEscaped(str, i)) {
						i++;
						continue;
					}
					var end = str.indexOf(str_END, i);
					var name = str.substring(i + str_START.length, end);
					var range = Category[name];
					if (range == null) {
						throw new Exception("The character range is not included in this build: " + name);
					}
	
					var j = charClassStart(str, i);
					if (j === -1) {
						range = "(?:" + range + ")";
					} else {
						str = str_remove(str, i, end + 1);
	
						i = j;
						end = charClassEnd(str, i);
						range = "(?:" + range + "|" + str.substring(i, end + 1) + ")";
					}
					str = str_replaceByIndex(str, i, end + 1, range);
					i += range.length;
				}
				return str;
			}
			function charClassStart(str, i) {
				while (--i > -1) {
					var c = str.charCodeAt(i);
					if (c === 93 || c === 91) {
						//[]
						if (str_isEscaped(str, i)) {
							continue;
						}
						if (c === 93) {
							//]
							return -1;
						}
						// [
						return i;
					}
				}
				return -1;
			}
			function charClassEnd(str, i) {
				var imax = str.length;
				while (++i < imax) {
					var c = str.charCodeAt(i);
					if (c === 92) {
						// \
						i++;
						continue;
					}
					if (c === 93) {
						// ]
						return i;
					}
				}
				return -1;
			}
	
			var Category = {};
	
			// source ../../unicode/category/L-export.js
			Category.L = "[A-Za-zªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽͿΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԯԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠ-ࢴऄ-हऽॐक़-ॡॱ-ঀঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡૹଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-హఽౘ-ౚౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൟ-ൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏽᏸ-ᏽᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛱ-ᛸᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤞᥐ-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎↃↄⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⸯ々〆〱-〵〻〼ぁ-ゖゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿕ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚝꚠ-ꛥꜗ-ꜟꜢ-ꞈꞋ-ꞭꞰ-ꞷꟷ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꣽꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꧠ-ꧤꧦ-ꧯꧺ-ꧾꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꩾ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꬰ-ꭚꭜ-ꭥꭰ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]|�[�-��-�]|�[�-��-�]|�[�-��-�]|�[�-��-��-�]|�[�-�]|�[�-��-��-��-��-��-�]|�[�-��-��-����-��-��-��-��-��-��-��-��-��-��-��-�]|�[�-�]|�[�-�]|�[�-���-�]|[��-��-��-�][�-�]|�[�-�����-��-��-���-��-�]|�[�-��-��-��-��-��-��-�]|�[�-�]|�[�-���-�����-��-��-��-����-��-��-�����-��-��-��-��-��-��-��-��-��-��-�]|�[�-��-�������-��-���-��-��-��-��-��-��-��-���-��-��-��-��-��-��-��-��-��-��-��-��-�]|�[�-��-��-��-��-���-��-����-��-��-���-��-��-��-��-����-��-����-����-�]|�[�-�]|�[�-��-������-��-��������-�������������-��-��-��-���-��-��-��-��-�]|�[�-���-�]|�[�-�]|�[�-��-��-��-�]|�[��]|�[�-�]";
			// end:source ../../unicode/category/L-export.js
			// source ../../unicode/category/Nl-export.js
			Category.Nl = "[ᛮ-ᛰⅠ-ↂↅ-ↈ〇〡-〩〸-〺ꛦ-ꛯ]|�[�-�]|�[�-����-�]";
			// end:source ../../unicode/category/Nl-export.js
			// source ../../unicode/category/Nd-export.js
			Category.Nd = "[0-9٠-٩۰-۹߀-߉०-९০-৯੦-੯૦-૯୦-୯௦-௯౦-౯೦-೯൦-൯෦-෯๐-๙໐-໙༠-༩၀-၉႐-႙០-៩᠐-᠙᥆-᥏᧐-᧙᪀-᪉᪐-᪙᭐-᭙᮰-᮹᱀-᱉᱐-᱙꘠-꘩꣐-꣙꤀-꤉꧐-꧙꧰-꧹꩐-꩙꯰-꯹０-９]|�[�-�]|�[�-�]|�[�-��-��-��-�]|�[�-�]|�[�-��-��-��-��-�]|�[�-��-�]";
			// end:source ../../unicode/category/Nd-export.js
			// source ../../unicode/category/Mn-export.js
			Category.Mn = "[̀-ͯ҃-֑҇-ׇֽֿׁׂׅׄؐ-ًؚ-ٰٟۖ-ۜ۟-۪ۤۧۨ-ܑۭܰ-݊ަ-ް߫-߳ࠖ-࠙ࠛ-ࠣࠥ-ࠧࠩ-࡙࠭-࡛ࣣ-ंऺ़ु-ै्॑-ॗॢॣঁ়ু-ৄ্ৢৣਁਂ਼ੁੂੇੈੋ-੍ੑੰੱੵઁં઼ુ-ૅેૈ્ૢૣଁ଼ିୁ-ୄ୍ୖୢୣஂீ்ఀా-ీె-ైొ-్ౕౖౢౣಁ಼ಿೆೌ್ೢೣഁു-ൄ്ൢൣ්ි-ුූัิ-ฺ็-๎ັິ-ູົຼ່-ໍཱ༹༘༙༵༷-ཾྀ-྄྆྇ྍ-ྗྙ-ྼ࿆ိ-ူဲ-့္်ွှၘၙၞ-ၠၱ-ၴႂႅႆႍႝ፝-፟ᜒ-᜔ᜲ-᜴ᝒᝓᝲᝳ឴឵ិ-ួំ៉-៓៝᠋-᠍ᢩᤠ-ᤢᤧᤨᤲ᤹-᤻ᨘᨗᨛᩖᩘ-ᩞ᩠ᩢᩥ-ᩬᩳ-᩿᩼᪰-᪽ᬀ-ᬃ᬴ᬶ-ᬺᬼᭂ᭫-᭳ᮀᮁᮢ-ᮥᮨᮩ᮫-ᮭ᯦ᯨᯩᯭᯯ-ᯱᰬ-ᰳᰶ᰷᳐-᳔᳒-᳢᳠-᳨᳭᳴᳸᳹᷀-᷵᷼-᷿⃐-⃥⃜⃡-⃰⳯-⵿⳱ⷠ-〪ⷿ-゙゚〭꙯ꙴ-꙽ꚞꚟ꛰꛱ꠂ꠆ꠋꠥꠦ꣄꣠-꣱ꤦ-꤭ꥇ-ꥑꦀ-ꦂ꦳ꦶ-ꦹꦼꧥꨩ-ꨮꨱꨲꨵꨶꩃꩌꩼꪰꪲ-ꪴꪷꪸꪾ꪿꫁ꫬꫭ꫶ꯥꯨ꯭ﬞ︀-️︠-︯]|�[�-�������-��������-�������-���-��-��-�]|�[�-��-��-��-��-�]|�[�-��-�]|�[�-�]|�[��]|�[���-�]|�[�-��-����-��-�]|�[�-����-��-����]|�[��-��-��-����-��-��-�����-��-��-������-������-��-�]|�[�-�]|�[�-�]";
			// end:source ../../unicode/category/Mn-export.js
			// source ../../unicode/category/Mc-export.js
			Category.Mc = "[ःऻा-ीॉ-ौॎॏংঃা-ীেৈোৌৗਃਾ-ੀઃા-ીૉોૌଂଃାୀେୈୋୌୗாிுூெ-ைொ-ௌௗఁ-ఃు-ౄಂಃಾೀ-ೄೇೈೊೋೕೖംഃാ-ീെ-ൈൊ-ൌൗංඃා-ෑෘ-ෟෲෳ༾༿ཿါာေးျြၖၗၢ-ၤၧ-ၭႃႄႇ-ႌႏႚ-ႜាើ-ៅះៈᤣ-ᤦᤩ-ᤫᤰᤱᤳ-ᤸᨙᨚᩕᩗᩡᩣᩤᩭ-ᩲᬄᬵᬻᬽ-ᭁᭃ᭄ᮂᮡᮦᮧ᮪ᯧᯪ-ᯬᯮ᯲᯳ᰤ-ᰫᰴᰵ᳡ᳲᳳ〮〯ꠣꠤꠧꢀꢁꢴ-ꣃꥒ꥓ꦃꦴꦵꦺꦻꦽ-꧀ꨯꨰꨳꨴꩍꩻꩽꫫꫮꫯꫵꯣꯤꯦꯧꯩꯪ꯬]|�[���-�]|�[����-������-����-�����-������-����-����]|�[�-���-���-��-���-�����������]|�[�-�]";
			// end:source ../../unicode/category/Mc-export.js
			// source ../../unicode/category/Pc-export.js
			Category.Pc = "[_‿⁀⁔︳︴﹍-﹏＿]"
			// end:source ../../unicode/category/Pc-export.js
			;
		})();
		//# sourceMappingURL=UnicodeCategory.es6.map
		// end:source Literals/UnicodeCategory.es6
		// source Literals/PosixCharClass.es6
		"use strict";
	
		var PosixCharClass;
		(function () {
			PosixCharClass = {
				transform: function transform(node) {
					var str = node.textContent;
					str = interpolate(str, rgxDbl);
					str = interpolate(str, rgx);
					node.textContent = str;
				},
				canHandle: function canHandle(txt) {
					return rgx.test(txt);
				}
			};
	
			var rgx = /\[:(\^?\w+):\]/g,
			    rgxDbl = /\[\[:(\^?\w+):\]\]/g;
	
			var Ranges = {
				ascii: "\\u0000-\\u007F",
				"^ascii": "\\u0080-\\uFFFF",
				space: "\\t\\n\\v\\f\\r\\x20",
				digit: "0-9",
				xdigit: "0-9a-fA-F",
				word: "\\w_"
			};
	
			function interpolate(str_, rgx) {
				return str_.replace(rgx, function (full, name, i) {
					var range = Ranges[name];
					if (range == null) {
						throw new Error("Not supported POSIX range: " + name);
					}
					return range;
				});
			}
		})();
		//# sourceMappingURL=PosixCharClass.es6.map
		// end:source Literals/PosixCharClass.es6
		// source Literals/CharacterTypeHandler.es6
		"use strict";
	
		var CharacterTypeHandler;
		(function () {
			CharacterTypeHandler = {
				transform: function transform(node) {
					node.textContent = interpolate(node.textContent);
				},
				canHandle: function canHandle(txt) {
					return rgx_Hexadecimal.test(txt);
				}
			};
	
			var rgx_Hexadecimal = /(^|[^\\])\\(h)/i;
			var RANGE = "0-9a-fA-F";
	
			function interpolate(str) {
	
				return str.replace(rgx_Hexadecimal, function (full, before, h, i) {
					var isInCharClass = str_isInCharClass(str, i);
					if (isInCharClass === false) {
						return before + "[" + (h === "H" ? "^" : "") + RANGE + "]";
					}
					if (h === "h") {
						return before + RANGE;
					}
					return before + "&&[^" + RANGE + "]";
				});
			}
		})();
		//# sourceMappingURL=CharacterTypeHandler.es6.map
		// end:source Literals/CharacterTypeHandler.es6
		// source Literals/NestedCharClass.es6
		"use strict";
	
		var NestedCharClass;
		(function () {
			/* \x{200D} */
	
			NestedCharClass = {
				transform: function transform(node) {
					node.textContent = interpolate(node.textContent);
				},
				canHandle: function canHandle(txt) {
					return rgx_NestedIntercept.test(txt);
				}
			};
	
			var rgx_NestedIntercept = /\[.*&&\[/g;
	
			function interpolate(str_) {
				var str = str_,
				    imax = str.length,
				    i = -1,
				    isInCharClass = false,
				    startOuter,
				    startInner,
				    c;
				while (++i < imax) {
					c = str[i];
					if (c === "\\") {
						i++;
						continue;
					}
					if (c !== "[") {
						continue;
					}
					startOuter = i;
					while (++i < imax) {
						c = str[i];
						if (c === "\\") {
							i++;
							continue;
						}
						if (c === "]") {
							break;
						}
						if (c !== "&") {
							continue;
						}
						c = str[++i];
						if (c !== "&") {
							continue;
						}
						c = str[++i];
						if (c !== "[") {
							continue;
						}
						startInner = i;
						while (++i < imax) {
							c = str[i];
							if (c === "\\") {
								i++;
								continue;
							}
							if (c === "]") {
								i++;
								break;
							}
						}
	
						var content = str.substring(startInner + 1, i - 1);
						str = str_remove(str, startInner - 2, i);
						i = startInner - 2;
						var group;
						if (content[0] === "^") {
							group = "(?!" + content.substring(1) + ")";
						} else {
							group = "(?=" + content + ")";
						}
	
						str = str_replaceByIndex(str, startOuter - 1, startOuter - 1, group);
						i += group.length;
						imax = str.length;
						startInner = startInner + group.length - 1;
					}
	
					str = str.substring(0, startOuter - 1) + "(?:" + str.substring(startOuter - 1, i - 1) + ")" + str.substring(i - 1);
	
					i += 3;
					imax += 3;
				}
				return str;
			}
		})();
		//# sourceMappingURL=NestedCharClass.es6.map
		// end:source Literals/NestedCharClass.es6
	
		// source Anchors/Input_Start-End.es6
		"use strict";
	
		var InputStart, InputEnd, InputEndWithNewLine;
		(function () {
	
			var ANCHOR_START = "\\A",
			    ANCHOR_END = "\\z",
			    ANCHOR_END_WITH_NEWLINE = "\\Z";
	
			InputStart = create(ANCHOR_START, function (node, root) {
				node.textContent = "^" + node.textContent;
			});
			InputEnd = create(ANCHOR_END, function (node, root) {
				node.textContent = node.textContent + "$";
			});
			InputEndWithNewLine = create(ANCHOR_END_WITH_NEWLINE, function (node, root) {
				node.textContent = node.textContent + "\n?$";
				root.addTransformer(normalize_lastNewLine);
			});
	
			function create(ANCHOR, fn) {
				return {
					transform: function transform(node, root) {
						node.textContent = remove(node.textContent, ANCHOR);
						root.flags = {
							g: false,
							m: false
						};
						fn(node, root);
					},
					canHandle: function canHandle(txt) {
						var i = txt.indexOf(ANCHOR);
						if (i === -1) {
							return false;
						}
	
						return str_isEscaped(txt, i) === false;
					}
				};
			};
	
			function remove(str, ANCHOR) {
				var i = -1;
				while ((i = str.indexOf(ANCHOR, i)) != -1) {
					if (str_isEscaped(str, i)) {
						i++;
						continue;
					}
					str = str_remove(str, i, i + ANCHOR.length);
				}
				return str;
			}
	
			function normalize_lastNewLine(root, match) {
				var val = match.value;
				if (val[val.length - 1] !== "\n") {
					return;
				}
				match.value = val.slice(0, -1);
			}
		})();
		//# sourceMappingURL=Input_Start-End.es6.map
		// end:source Anchors/Input_Start-End.es6
		// source Anchors/InputLastMatch.es6
		"use strict";
	
		var InputLastMatch = {
	
			transform: function transform(node, root) {
				root.flags.y = true;
				node.textContent = node.textContent.substring(2);
			},
	
			canHandle: function canHandle(txt) {
				// \G
				return txt.charCodeAt(0) === 92 && txt.charCodeAt(1) === 71;
			}
		};
		//# sourceMappingURL=InputLastMatch.es6.map
		// end:source Anchors/InputLastMatch.es6
		// source Static/GAnchor.es6
		"use strict";
	
		var _defineProperty = function _defineProperty(obj, key, value) {
			return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
		};
	
		var GAnchorStatic;
		(function () {
			GAnchorStatic = {
				create: function create(node) {
					var txt = node.firstChild.textContent;
					dom_removeChild(node.firstChild);
					return new Groups[txt]();
				},
				canHandle: function canHandle(txt) {
					return txt === G_NEXT || txt === G_ANY;
				}
			};
	
			var G_NEXT = "?!\\G",
			    G_ANY = "?=\\G";
	
			var Groups = (function () {
				var _Groups = {};
	
				_defineProperty(_Groups, G_NEXT, class_create(Node.Group, {
					isNative: false,
					exec: function exec(str, i, opts) {
						if (opts.fixed === true && i === opts.lastIndex) {
							return null;
						}
						var match = new Match();
						match.index = i + 1;
						match.value = "";
						return match;
					}
				}));
	
				_defineProperty(_Groups, G_ANY, class_create(Node.Group, {
					isNative: false,
					exec: function exec(str, i) {
						var match = new Match();
						match.index = i;
						match.value = "";
						return match;
					}
				}));
	
				return _Groups;
			})();
		})();
		//# sourceMappingURL=GAnchor.es6.map
		// end:source Static/GAnchor.es6
		// source Static/BAnchor.es6
		"use strict";
	
		var _defineProperty = function _defineProperty(obj, key, value) {
			return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
		};
	
		var BAnchorStatic;
		(function () {
			BAnchorStatic = {
				transform: function transform(node) {
					if (node_shouldReposition(node)) {
						var next = node_attachToLiteral(node);
						if (next != null) {
							return next;
						}
						return null;
					}
					//return transformer_replaceNode(node, new Groups[B_ANY]());
				},
				canHandle: function canHandle(txt) {
					return txt === B_ANY;
				}
			};
	
			function node_shouldReposition(node) {
				if (node_isNativeAndIncluded(node.nextSibling)) {
					return false;
				}
				if (node_isNativeAndIncluded(node.previousSibling)) {
					return false;
				}
				return true;
			}
			function node_isNativeAndIncluded(node) {
				return node != null && node.checkNative() === true && node.isIncluded !== false;
			}
			function node_attachToLiteral(node) {
				var next = node.nextSibling;
				if (node_attach(node, node, "firstChild", "nextSibling", dom_insertBefore)) {
					dom_removeChild(node);
					return next;
				}
				if (node_attach(node, node, "lastChild", "previousSibling", dom_insertAfter)) {
					dom_removeChild(node);
					return next;
				}
				return null;
			}
			function node_attach(bNode, cursor, childKey, siblingKey, appenderFn) {
				if (cursor == null) {
					return false;
				}
				for (var el = cursor[siblingKey]; el != null; el = el[siblingKey]) {
					if (el.type === Node.GROUP) {
						if (el.isIncluded === false) {
							continue;
						}
						return node_attachToGroup(el, bNode, childKey, siblingKey, appenderFn);
					}
					if (el.type === Node.LITERAL) {
						dom_removeChild(bNode);
						appenderFn(el, bNode);
						return true;
					}
				}
				return false;
			}
	
			function node_attachToGroup(group, bNode, childKey, siblingKey, appenderFn) {
				if (group.checkNative() === false) {
					var cursor = group[childKey],
					    insert = true;
					for (var cursor = group[childKey]; cursor != null; cursor = cursor[siblingKey]) {
						if (insert === false) {
							if (cursor.type === Node.OR) {
								insert = true;
								continue;
							}
						}
						if (cursor.type === Node.LITERAL) {
							appenderFn(cursor, dom_clone(bNode));
							cursor = cursor[siblingKey];
							if (cursor == null) {
								break;
							}
							insert = false;
							continue;
						}
						if (cursor.type === Node.GROUP && cursor.isIncluded !== false) {
							node_attachToGroup(cursor, bNode, childKey, siblingKey, appenderFn);
							insert = false;
							continue;
						}
					}
					return true;
				}
				var wrapper = new NoneCapturedGroupNode();
				var child = group.firstChild;
				while (child != null) {
					dom_removeChild(child);
					dom_appendChild(wrapper, child);
					child = group.firstChild;
				}
				dom_appendChild(group, wrapper);
				appenderFn(wrapper, dom_clone(bNode));
				return true;
			}
	
			var B_ANY = "\\b";
			var Groups = _defineProperty({}, B_ANY, class_create(Node.Group, {
				isNative: false,
				isCaptured: false,
				exec: function exec(str, i, opts) {
					rgx.lastIndex = i;
					if (opts.fixed === false) {
						var match = rgx.exec(str);
						if (match == null) {
							return null;
						}
						var m = new Match();
						m.value = "";
						m.index = match.index;
						return m;
					}
	
					var match = rgx.exec(str);
					if (match == null || match.index !== i) {
						return null;
					}
	
					var m = new Match();
					m.index = i;
					m.value = "";
					return m;
				}
			}));
	
			var rgx = /\b/g;
		})();
		//# sourceMappingURL=BAnchor.es6.map
		// end:source Static/BAnchor.es6
		// source Static/StartEnd.es6
		"use strict";
	
		var StartEndStatic = {
			transform: function transform(node, root) {
				root.addFilter(function (input, match) {
					if (match.index === input.length) {
						return null;
					}
					return match;
				});
			},
			canHandle: function canHandle(txt) {
				return txt === "^$" || txt === "^";
			}
		};
		//# sourceMappingURL=StartEnd.es6.map
		// end:source Static/StartEnd.es6
	
		var handler_GROUP = 0,
		    handler_LITERAL = 1,
		    handler_NODE = 2;
	
		var Initial = [[handler_GROUP, CommentGroup], [handler_GROUP, NoneCapturedGroup], [handler_GROUP, NamedGroup], [handler_GROUP, AtomicGroup], [handler_GROUP, GAnchorStatic], [handler_GROUP, LookbehindGroup], [handler_GROUP, LookaheadGroup], [handler_NODE, PossessiveGroup], [handler_LITERAL, PossessiveLiteral], [handler_LITERAL, UnicodeCodePoint], [handler_LITERAL, UnicodeCategory], [handler_LITERAL, PosixCharClass], [handler_LITERAL, CharacterTypeHandler], [handler_LITERAL, InputStart], [handler_LITERAL, InputEnd], [handler_LITERAL, InputEndWithNewLine], [handler_LITERAL, InputLastMatch], [handler_LITERAL, StartEndStatic]];
	
		var BeforeIndexed = [[handler_LITERAL, Subexpressions], [handler_LITERAL, NestedCharClass], [handler_LITERAL, BAnchorStatic]];
	
		var AfterIndexed = [[handler_LITERAL, NamedBackreference]];
	
		var AfterCombined = [[handler_NODE, OptionalGroup]];
	
		function walk(root, handlers) {
			visitor_walk(root, function (node) {
				var Handler = getHandler(node, root, handlers);
				if (Handler == null) {
					return;
				}
				if (Handler.transform) {
					return Handler.transform(node, root);
				}
				if (Handler.create) {
					var el = Handler.create(node, root);
					return transformer_replaceNode(node, el);
				}
				if (Handler.process) {
					return Handler.process(node, root);
				}
			});
		}
	
		function getHandler(node, root, handlers) {
			var imax = handlers.length,
			    i = -1,
			    type,
			    Handler;
			while (++i < imax) {
				var _ref = handlers[i];
	
				var _ref2 = _slicedToArray(_ref, 2);
	
				type = _ref2[0];
				Handler = _ref2[1];
	
				var canHandle = CheckFns[type](node, root, Handler);
				if (canHandle === true) {
					return Handler;
				}
			}
		}
	
		var CheckFns = (function () {
			var _CheckFns = {};
	
			_defineProperty(_CheckFns, handler_GROUP, function (node, root, Handler) {
				if (node.type !== Node.GROUP) {
					return null;
				}
				var child = node.firstChild;
				if (child == null) {
					return;
				}
				if (child.type !== Node.LITERAL) {
					return null;
				}
				var txt = child.textContent;
				if (txt.charCodeAt(0) !== 63 /*?*/) {
					return null;
				}
				return Handler.canHandle(txt);
			});
	
			_defineProperty(_CheckFns, handler_LITERAL, function (node, root, Handler) {
				if (node.type !== Node.LITERAL) {
					return null;
				}
				return Handler.canHandle(node.textContent);
			});
	
			_defineProperty(_CheckFns, handler_NODE, function (node, root, Handler) {
				return Handler.canHandle(node, root);
			});
	
			return _CheckFns;
		})();
	})();
	//# sourceMappingURL=exports.es6.map
	// end:source ../src/Handlers/exports.es6

	// source ../src/Match.es6
	"use strict";
	
	var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };
	
	var Match, MatchGroup, MatchInternal, MatchInternalCollection;
	(function () {
	
		Match = class_create({
			value: null,
			index: null,
			groups: null,
			groupNum: null,
			constructor: function constructor() {
				this.groups = [];
			},
			toArray: function toArray() {
				var groups = this.groups.map(function (x) {
					return x.value;
				});
				var arr = [this.value].concat(_toConsumableArray(groups));
				arr.index = this.index;
				return arr;
			}
		});
	
		MatchGroup = class_create({
			value: null,
			index: null });
	
		MatchInternal = class_create({
			constructor: function constructor(matchIndex, matchValue, regexNode, nativeIndexerMatch) {
				this.index = matchIndex;
				this.value = matchValue;
				this.match = nativeIndexerMatch;
				this.regex = regexNode;
			}
		});
	
		MatchInternalCollection = class_create({
			constructor: function constructor(matches, root) {
				this.namedGroups = null;
				this.matches = matches;
				this.index = matches[0].index;
				this.value = "";
	
				var imax = matches.length,
				    i = -1;
				while (++i < imax) {
					this.value += matches[i].value;
				}
			},
			toMatch: function toMatch() {
				var match = new Match();
				match.index = this.index;
				match.value = this.value;
				match.groups = new Array(this.getGroupCount());
				var imax = this.matches.length,
				    i = -1,
				    cursor = 0;
				while (++i < imax) {
					var _match$groups2;
	
					var x = this.matches[i],
					    groups,
					    groupNum;
					if (x.regex != null) {
						groups = x.regex.getGroups(x.match, x.index);
						groupNum = x.regex.groupNum;
					} else if (x.toMatch) {
						var sub = x.toMatch();
						groups = sub.groups;
						var j = groups.length;
						while (--j > -1) {
							var x = groups[j];
							if (x != null) match.groups[j] = groups[j];
						}
						continue;
					} else {
						groups = x.groups;
						groupNum = x.groupNum;
					}
					if (groups == null || groups.length === 0) {
						continue;
					}
					if (groupNum == null) {
						var _match$groups;
	
						(_match$groups = match.groups).splice.apply(_match$groups, [cursor, groups.length].concat(_toConsumableArray(groups)));
						cursor += groups.length;
						continue;
					}
					var index = groupNum - 1;
					if (match.groups.length < index) {
						match.groups.length = index;
					}
					(_match$groups2 = match.groups).splice.apply(_match$groups2, [index, groups.length].concat(_toConsumableArray(groups)));
				}
	
				for (var key in this.namedGroups) {
					var num = this.namedGroups[key];
					var group = match.groups[num - 1];
					match.groups[key] = group && group.value;
				}
				return match;
			},
			getGroupCount: function getGroupCount() {
				var n = 0,
				    i = this.matches.length,
				    x;
				while (--i > -1) {
					x = this.matches[i];
					if (x.matches != null) {
						n += x.getGroupCount();
						continue;
					}
					if (x.regex != null) {
						n += x.regex.groupCount;
						continue;
					}
					if (x.groups != null) {
						n += x.groups.length;
					}
				}
				return n;
			}
		});
	})();
	//# sourceMappingURL=Match.es6.map
	// end:source ../src/Match.es6
	// source ../src/Regex.es6
	"use strict";
	
	var Regex = class_create({
		constructor: function constructor(str, flags) {
			this.root = Regex.parse(str, flags);
			this.lastIndex = 0;
		},
	
		exec: function exec(input, start) {
			if (start != null) {
				this.lastIndex = start;
			}
			var match = this.root.exec(input, this.lastIndex);
			this.lastIndex = match == null ? 0 : match.index;
			return match;
		},
	
		match: (function (_match) {
			var _matchWrapper = function match(_x, _x2) {
				return _match.apply(this, arguments);
			};
	
			_matchWrapper.toString = function () {
				return _match.toString();
			};
	
			return _matchWrapper;
		})(function (input, start) {
			if (start != null) {
				this.lastIndex = start;
			}
			var match = this.root.match(input, this.lastIndex);
			this.lastIndex = match == null ? 0 : match.index + match.value.length;
			return match;
		}),
	
		matches: function matches(input) {
			this.lastIndex = 0;
			return this.root.matches(input, 0);
		}
	});
	
	Regex.parseGroups = function (str) {
		return parser_parseGroups(str);
	};
	
	Regex.parse = function (str, flags) {
		var root = parser_parseGroups(str);
	
		ast_defineFlags(root, flags);
		Handlers.define(root);
		Handlers.beforeIndexed(root);
	
		ast_indexGroups(root);
		Handlers.afterIndexed(root);
	
		ast_combineNatives(root);
		Handlers.afterCombined(root);
	
		ast_createBlocks(root);
		ast_compileNatives(root);
		ast_resolveBacktracks(root);
		return root;
	};
	//# sourceMappingURL=Regex.es6.map
	// end:source ../src/Regex.es6

	return Regex;
}));