var CharacterTypeHandler;
(function(){
	CharacterTypeHandler = {
		transform (node) {
			node.textContent = interpolate(node.textContent);
		},
		canHandle (txt) {
			return rgx_Hexadecimal.test(txt);
		}
	};

	var rgx_Hexadecimal = /(^|[^\\])\\(h)/i;
	var RANGE = '0-9a-fA-F';

	function interpolate(str) {

		return str.replace(rgx_Hexadecimal, (full, before, h, i) => {
			var isInCharClass = str_isInCharClass(str, i);
			if (isInCharClass === false) {
				return before + '[' + (h === 'H' ? '^' : '') + RANGE + ']';
			}
			if (h === 'h') {
				return before + RANGE;
			}
			return before + '&&[^' + RANGE + ']';
		});
	}
}());