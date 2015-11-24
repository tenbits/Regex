var str_isEscaped,
	str_indexOfNewLine,
	str_remove,
	str_replaceByIndex,
	str_isInCharClass;
(function(){

	str_isEscaped = function(str, i) {
		if (i === 0) {
			return false;
		}
		var c = str.charCodeAt(--i);
		if (c === 92) {
			if (str_isEscaped(str, c))
				return false;

			return true;
		}
		return false;
	};

	str_indexOfNewLine = function(str, i) {
		var imax = str.length;
		while(++i < imax){
			var c = str.charCodeAt(i);
			if (c === 13 || c === 10) {
				// \\r \\n
				return i;
			}
		}
		return -1;
	};

	// [start, end)
	str_remove = function(str, start, end) {
		return str.substring(0, start) + str.substring(end);
	};

	str_replaceByIndex = function(str, start, end, value) {
		return str.substring(0, start) + value + str.substring(end);
	};

	str_isInCharClass = function (str, i) {
		while(--i > -1) {
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
}());