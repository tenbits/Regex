var UnicodeCodePoint;
(function () {
	/* \x{200D} */

	UnicodeCodePoint = {
		transform (node) {
			node.textContent = interpolate(node.textContent);
		},
		canHandle (txt) {
			return txt.indexOf(str_START) !== -1;
		}
	};

	var str_START = '\\x{',
		str_END = '}';

	function interpolate(str_) {
		var str = str_,
			i = 0;
		while((i = str.indexOf(str_START, i)) !== -1) {
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
				val = '00' + val;
			}
			if (val.length !== 4) {
				throw Error('Not supported wide hexadecimal char: ' + val);
			}

			str = str_replaceByIndex(str, i, end + 1, '\\u' + val);
			i += val.length;
		}
		return str;
	}
}());