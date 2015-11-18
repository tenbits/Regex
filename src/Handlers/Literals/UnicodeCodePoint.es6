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
			var name = str.substring(i + str_START.length, end);

			str = str_replaceByIndex(str, i, end + 1, '\\u' + name);
			i += name.length;
		}
		return str;
	}
}());