var flags_serialize,
	flags_parse,
	flags_set,
	flags_equals,
	flags_clone,
	flags_extend;
(function(){
	flags_serialize = function(flags) {
		var str = 'g';
		if (flags == null) {
			return str;
		}
		if (flags.i) {
			str += 'i';
		}
		if (flags.m) {
			str += 'm';
		}
		return str;
	};

	flags_parse = function(str){
		var out =  {
			i: null,
			m: null,
			x: null,
		};
		var flag = true,
			imax = str.length,
			i = -1;
		while(++i < imax) {
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
			throw Error(`Unsupported flag ${ str[i] }`)
		}
		return out;
	};

	flags_set = function (current, on, off) {
		var flags = current || {};

		update(flags, on, off, 'i');
		update(flags, on, off, 'm');
		return flags;
	};

	flags_equals = function(a, b){
		if (a == b) {
			return true;
		}
		if (a == null || b == null) {
			return false;
		}
		return a.i === b.i && a.m === b.m;
	};

	flags_clone = function(b) {
		if (b == null) {
			return null;
		}
		return {
			i: b.i || false,
			m: b.m || false,
			x: b.x || false
		};
	};

	flags_extend = function(a, b) {
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
}());