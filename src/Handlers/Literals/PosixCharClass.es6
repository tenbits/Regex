var PosixCharClass;
(function () {
	PosixCharClass = {
		transform (node) {
			var str = node.textContent;
			str = interpolate(str, rgxDbl);
			str = interpolate(str, rgx);
			node.textContent = str;
		},
		canHandle (txt) {
			return rgx.test(txt);
		}
	};

	var rgx = /\[:(\^?\w+):\]/g,
		rgxDbl = /\[\[:(\^?\w+):\]\]/g;


	var Ranges = {
		'ascii': '\\u0000-\\u007F',
		'^ascii': '\\u0080-\\uFFFF',
		'space': '\\t\\n\\v\\f\\r\\x20',
		'digit': '0-9',
		'xdigit': '0-9a-fA-F',
		'word': '\\w_'
	};

	function interpolate(str_, rgx) {
		return str_.replace(rgx, (full, name, i) => {
			var range = Ranges[name];
			if (range == null) {
				throw new Error('Not supported POSIX range: ' + name);
			}
			return range;
		});
	}
}());