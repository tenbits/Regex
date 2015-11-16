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
	
	var str_isEscaped, str_indexOfNewLine, str_remove;
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
	
	var dom_appendChild, dom_prependChild, dom_insertBefore, dom_insertAfter, dom_removeChild;
	
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
	})();
	//# sourceMappingURL=dom.es6.map
	// end:source dom.es6
	// source flags.es6
	"use strict";
	
	var flags_serialize, flags_parse, flags_set, flags_equals, flags_clone, flags_extend;
	(function () {
		flags_serialize = function (flags) {
			var str = "g";
			if (flags == null) {
				return str;
			}
			if (flags.i) {
				str += "i";
			}
			if (flags.m) {
				str += "m";
			}
			return str;
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
	
	var visitor_firstLiteral, visitor_flattern, visitor_walk, visitor_walkByType, visitor_walkUp, visitor_getBlocks;
	
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
	
		parser_parseGroups = function (str) {
			var root = new Node.Root(),
			    imax = str.length,
			    i = -1,
			    lastI = 0,
			    current = root,
			    c;
	
			while (++i < imax) {
				c = str.charCodeAt(i);
	
				if (c === 92) {
					// \ Escape next character
					++i;
					continue;
				}
	
				if (c !== 40 && c !== 41 && c !== 124) {
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
					continue;
				}
				if (c === 41) {
					// ) Group ending
					current = current.parentNode;
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
	
	var ast_combineNatives, ast_compileNatives, ast_indexGroups, ast_createBlocks, ast_defineHandlers, ast_resolveBacktracks;
	
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
				if (node.type === Node.BLOCKS) {
					if (node.parentNode.isAtomic !== true) {
						node.isBacktracked = node.getLength() > 1;
					}
				}
				if (node.isBacktracked === true) {
					node.parentNode.isBacktracked = true;
				}
			});
		};
	
		ast_combineNatives = function (root) {
			resolveNatives(root);
			combineNatives(root);
		};
		ast_compileNatives = function (root) {
			return compileNatives(root);
		};
		ast_indexGroups = function (root) {
			var index = 0;
			visitor_walkByType(root, Node.GROUP, function (node) {
				if (node.isCaptured === false) {
					return;
				}
				node.index = ++index;
				if (node.name != null) {
	
					if (root.groups == null) root.groups = {};
	
					root.groups[node.name] = node.index;
				}
			});
		};
	
		ast_defineHandlers = function (root) {
			visitor_walk(root, function (node) {
				var Handler = Handlers.get(node);
				if (Handler == null) {
					return;
				}
				if (Handler.transform) {
					return Handler.transform(node, root);
				}
				if (Handler.create) {
					var el = Handler.create(node, root);
					return transformer_replaceNode(node, el, false);
				}
				if (Handler.process) {
					return Handler.process(node, root);
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
	
		function combineNativesOld(root) {
			if (root.isNative) {
				var literal = new Node.Literal(root.toString());
				root.empty();
				root.appendChild(literal);
				return;
			}
			visitor_walk(root, function (node) {
				if (node.isNative === false) {
					return;
				}
				if (combine_flagsAreEqual(node) === false) {
					return;
				}
				var literal = new Node.Literal(node.toString());
				return transformer_replaceNode(node, literal, false);
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
				//debugger;
				//if (el.firstChild && el.firstChild.textContent && el.firstChild.textContent.indexOf('b') > -1) {
				//	debugger;
				//}
				//if (el.textContent && el.textContent.indexOf('b') > -1) {
				//	debugger;
				//}
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
					if (cursor.type === Node.GROUP && literal.index == null) {
						literal.index = cursor.index;
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
		function compileNatives(root) {
	
			visitor_walk(root, function (node) {
				if (node.type !== Node.LITERAL) {
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
	
			root.flags = str == null ? null : flags_parse(str);
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
				if (visitor === visitByGroup) {
					return removeGroup(group);
				}
				if (visitor === visitByInline) {
					node.textContent = "?" + txt.substring(txt.indexOf(":"));
					return null;
				}
			});
		};
	
		function removeGroup(group) {
			var next = group.nextSibling;
			dom_removeChild(group);
			return next;
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
			});
		}
	
		function handle_nativeFlags(node, flags, visitor) {
			visitor(node, function (x) {
				x.flags = flags_extend(flags_clone(x.flags), flags);
			});
		}
	
		function visitByGroup(node, fn) {
			var el = node;
			while ((el = el.nextSibling) != null) {
				fn(el);
				visitor_walk(el, fn);
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
				if (str_isEscaped(str, i)) {
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
	})();
	//# sourceMappingURL=ast_flags.es6.map
	// end:source ast_flags.es6
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
			isBacktracked: false,
			isAtomic: false,
	
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
			}
		});
		//# sourceMappingURL=AstNode.es6.map
		// end:source ./AstNode.es6
		// source ./Literal.es6
		"use strict";
	
		var Literal = class_create(RegexOpts, {
	
			type: type_Literal,
	
			constructor: function constructor(text) {
				this.textContent = text;
			},
	
			toString: function toString() {
				return this.textContent;
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
			type: type_Group,
	
			name: null,
	
			constructor: function constructor(parent) {
				this.nodes = [];
			},
			append: function append(node) {
				this.nodes.push(node);
			},
	
			toString: function toString() {
				var str = "",
				    el = this.firstChild;
	
				while (el != null) {
					str += el.toString();
					el = el.nextSibling;
				}
				return "(" + str + ")";
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
			},
	
			foo: function foo() {
				return "baz";
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
	
			exec: function exec(str, i) {
				return exec_root(this, str, i);
			},
	
			groups: null
		});
		//# sourceMappingURL=Root.es6.map
		// end:source ./Root.es6
		// source ./RegexNode.es6
		"use strict";
	
		var RegexNode = class_create(Literal, {
			type: type_Regex,
	
			rgxSearch: null,
			rgxFixed: null,
	
			constructor: function constructor(text, node) {
				var flags = node.serializeFlags();
				this.rgxSearch = new RegExp(this.textContent, flags);
				this.rgxFixed = new RegExp("^" + this.textContent, flags.replace("g", ""));
				this.index = node.index;
			} });
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
	
	var exec_root, exec_children, exec_clearCursors;
	(function () {
	
		exec_root = function (root, str, i) {
			backtrack_clearCursors(root);
			var match = exec_children(root, str, i);
			if (match == null) {
				return null;
			}
			if (root.groups) {
				match.groups = {};
				for (var key in root.groups) {
					match.groups[key] = match[root.groups[key]];
				}
			}
			return match;
		};
	
		exec_children = function (node, str, i, opts_, cursor) {
			var matches = [],
			    backtracking = [],
			    opts = new Opts(opts_);
	
			var el = cursor || node.firstChild;
			while (el != null) {
				var matcher = Matchers[el.type];
				var match = el.exec ? el.exec(str, i, opts) : matcher(el, str, i, opts);
				if (match == null) {
					if (backtracking.length === 0) {
						return null;
					}
					var track = backtracking.pop();
					i = track.strI;
					el = track.el;
					matches.splice(track.matchI);
					opts = track.opts;
					continue;
				}
				if (el.isBacktracked) {
					backtracking.push(new Backtrack(i, matches.length, el, opts));
				}
				i = opts.fixed ? i + match[0].length : i + match[0].length + match.index;
				matches.push(match);
				opts.fixed = true;
				el = el.nextSibling;
			}
			return matches_join(matches);
		};
	
		exec_clearCursors = backtrack_clearCursors;
	
		var Backtrack = function Backtrack(strI, matchI, el, opts) {
			this.strI = strI;
			this.matchI = matchI;
			this.el = el;
			this.opts = new Opts(opts);
		};
	
		var Opts = function Opts(current) {
			this.fixed = false;
			if (current == null) {
				return;
			}
			this.fixed = current.fixed;
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
				if (rgx.index != null) {
					match.groupIndex = rgx.index;
				}
				return match;
			});
	
			_defineProperty(_Matchers, Node.GROUP, function (group, str, i, opts) {
				var match = exec_children(group, str, i, opts);
				if (match == null) {
					return null;
				}
				if (group.isCaptured !== false) {
					match.unshift(match[0]);
				}
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
			visitor_walkUp(node, function (x) {
				return x.cursor = null;
			});
		};
	
		function matches_joinOld(matches) {
			var str = "";
			var out = [];
	
			var i = -1,
			    imax = matches.length;
	
			while (++i < imax) {
				var match = matches[i],
				    j = 0,
				    jmax = match.length;
	
				str += match[0];
	
				while (++j < jmax) {
					var x = match[j];
					if (x != null) {
						out[j] = x;
					}
				}
			}
			out[0] = str;
			out.index = matches[0].index;
			return out;
		}
		function matches_join(matches) {
			var str = "";
			var out = [str];
	
			var i = -1,
			    imax = matches.length;
	
			while (++i < imax) {
				var match = matches[i],
				    j = 0,
				    jmax = match.length;
	
				str += match[0];
	
				if (match.groupIndex != null) {
					var groups = match.splice(1);
					var length = match.groupIndex + groups.length - 1;
					if (out.length < length) {
						out.length = length;
					}
					out.splice.apply(out, [match.groupIndex, 0].concat(_toConsumableArray(groups)));
					continue;
				}
				out = out.concat(match.slice(1));
			}
	
			out[0] = str;
			out.index = matches[0].index;
			return out;
		}
	})();
	//# sourceMappingURL=exec.es6.map
	// end:source ../src/utils/exec.es6
	// source ../src/Handlers/exports.es6
	"use strict";
	
	var Handlers;
	
	(function () {
	
		// source JsNoneCapturedGroup.es6
		"use strict";
	
		var JsNoneCapturedGroup = {
	
			transform: function transform(node) {
				node.isCaptured = false;
			},
	
			canHandle: function canHandle(txt) {
				return txt.charCodeAt(1) === 58 /*:*/;
			}
		};
		//# sourceMappingURL=JsNoneCapturedGroup.es6.map
		// end:source JsNoneCapturedGroup.es6
		// source AtomicGroup.es6
		"use strict";
	
		var AtomicGroup = {
	
			transform: function transform(node) {
				node.isAtomic = true;
				node.isNative = false;
	
				var child = node.firstChild;
				child.textContent = child.textContent.substring(2);
			},
	
			canHandle: function canHandle(txt) {
				return txt.charCodeAt(1) === 62 /*>*/;
			}
		};
		//# sourceMappingURL=AtomicGroup.es6.map
		// end:source AtomicGroup.es6
		// source NamedGroup.es6
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
		// end:source NamedGroup.es6
		// source NamedBackreference.es6
		"use strict";
	
		var NamedBackreference;
		(function () {
	
			NamedBackreference = {
				transform: function transform(node, root) {
					node.textContent = node.textContent.replace(rgx, function (full, g1, name) {
						var index = root.groups[name];
						return "\\" + index;
					});
				},
				canHandle: function canHandle(txt) {
					return rgx.test(txt);
				}
			};
	
			var rgx = /\\k('|<)(\w+)('|>)/g;
		})();
		//# sourceMappingURL=NamedBackreference.es6.map
		// end:source NamedBackreference.es6
		// source CommentGroup.es6
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
		// end:source CommentGroup.es6
		// source LookbehindGroup.es6
		"use strict";
	
		var LookbehindGroup;
		(function () {
	
			LookbehindGroup = {
	
				process: function process(node) {
					var el = node.nextSibling;
					var lookbehind = new Lookbehind(node);
	
					for (; el != null;) {
						var next = el.nextSibling;
						dom_removeChild(el);
						lookbehind.appendChild(el);
						el = next;
					}
	
					dom_insertBefore(node, lookbehind);
					dom_removeChild(node);
					dom_prependChild(lookbehind, node);
	
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
				isNative: false,
				isPositive: true,
	
				group: null,
				constructor: function constructor(node) {
					this.group = node;
					node.isNative = false;
					node.isCaptured = false;
	
					this.isPositive = node.firstChild.textContent.charCodeAt(2) === 61 /*=*/;
				},
	
				exec: function exec(str, i, opts) {
	
					var lbEl = this.firstChild;
					while (true) {
						var match = exec_children(this, str, i, opts, lbEl.nextSibling);
	
						if (match == null) {
							return null;
						}
	
						i = match.index;
						var beforeString = str.substring(0, i);
						var beforeMatch = exec_children(lbEl, beforeString, 0, opts);
						if (beforeMatch == null && this.isPositive === true || beforeMatch != null && this.isPositive === false) {
							i++;
							continue;
						}
	
						return match;
					}
				}
			});
		})();
		//# sourceMappingURL=LookbehindGroup.es6.map
		// end:source LookbehindGroup.es6
	
		var GroupHandlers = [CommentGroup, JsNoneCapturedGroup, NamedGroup, AtomicGroup, LookbehindGroup];
		var LiteralHandlers = [];
		var AfterIndexed = [NamedBackreference];
	
		Handlers = {
			get: function get(node) {
				return getGroupHandler(node) || getLiteralHandler(node, LiteralHandlers);
			},
	
			afterIndexed: function afterIndexed(root) {
				walk(root, AfterIndexed);
			}
		};
	
		function walk(root, handlers) {
			visitor_walk(root, function (node) {
				var Handler = getLiteralHandler(node, handlers);
				if (Handler == null) {
					return;
				}
				if (Handler.transform) {
					return Handler.transform(node, root);
				}
				if (Handler.create) {
					el = Handler.create(node, root);
					return transformer_replaceNode(node, el);
				}
			});
		}
	
		function getGroupHandler(node) {
			if (node.type !== Node.GROUP) {
				return null;
			}
			var child = node.firstChild;
			if (child.type !== Node.LITERAL) {
				return null;
			}
			var txt = child.textContent;
			if (txt.charCodeAt(0) !== 63 /*?*/) {
				return null;
			}
			var imax = GroupHandlers.length,
			    i = -1;
			while (++i < imax) {
				var Handler = GroupHandlers[i];
				if (Handler.canHandle(txt)) {
					return Handler;
				}
			}
			return null;
		}
	
		function getLiteralHandler(node, handlers) {
			if (node.type !== Node.LITERAL) {
				return null;
			}
			var txt = node.textContent,
			    imax = handlers.length,
			    i = -1;
			while (++i < imax) {
				var Handler = handlers[i];
				if (Handler.canHandle(txt)) {
					return Handler;
				}
			}
			return null;
		}
	})();
	//# sourceMappingURL=exports.es6.map
	// end:source ../src/Handlers/exports.es6
	// source ../src/Regex.es6
	"use strict";
	
	var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };
	
	var Regex = (function () {
		function Regex(str, flags) {
			_classCallCheck(this, Regex);
	
			this.root = Regex.parse(str, flags);
			this.lastIndex = 0;
		}
	
		_createClass(Regex, {
			exec: {
				value: function exec(input) {
					var match = this.root.exec(input, this.lastIndex);
					this.lastIndex = match == null ? 0 : match.index;
					return match;
				}
			}
		}, {
			parseGroups: {
				value: function parseGroups(str) {
					return parser_parseGroups(str);
				}
			},
			parse: {
				value: function parse(str, flags) {
					var root = parser_parseGroups(str);
	
					ast_defineFlags(root, flags);
					ast_defineHandlers(root);
					ast_indexGroups(root);
	
					Handlers.afterIndexed(root);
	
					ast_combineNatives(root);
					ast_createBlocks(root);
	
					ast_compileNatives(root);
					ast_resolveBacktracks(root);
					return root;
				}
			}
		});
	
		return Regex;
	})();
	//# sourceMappingURL=Regex.es6.map
	// end:source ../src/Regex.es6

	return Regex;
}));