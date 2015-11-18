var UnicodeCategory;
(function () {
	/* \p{L} */
	UnicodeCategory = {
		transform (node) {
			node.textContent = interpolate(node.textContent);
		},
		canHandle (txt) {
			return txt.indexOf(str_START) !== -1;
		}
	};

	var str_START = '\\p{',
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
			var range = Category[name];
			if (range == null) {
				throw new Exception('The character range is not included in this build: ' + name);
			}

			var j = charClassStart(str, i);
			if (j === -1) {
				range = '(?:' + range + ')';
			} else {
				str = str_remove(str, i, end + 1);

				i = j;
				end = charClassEnd(str, i);
				range = '(?:' + range + '|' + str.substring(i, end + 1) +')';
			}
			str = str_replaceByIndex(str, i, end + 1, range);
			i += range.length;
		}
		return str;
	}
	function charClassStart(str, i) {
		while(--i > -1) {
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
		while( ++i < imax ){
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

	// import /src/unicode/category/L-export.js
	// import /src/unicode/category/Nl-export.js
	// import /src/unicode/category/Nd-export.js
	// import /src/unicode/category/Mn-export.js
	// import /src/unicode/category/Mc-export.js
	// import /src/unicode/category/Pc-export.js
}());