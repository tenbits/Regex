var str_isEscaped,
	str_indexOfNewLine,
	str_remove;
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

}());