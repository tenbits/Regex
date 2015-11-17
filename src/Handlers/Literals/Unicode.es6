var UnicodeCodePoint;
(function () {
	UnicodeCodePoint = {

		transform (node) {

			node.textContent = node.textContent.replace(rgx_codePoint, (full, g1) => {
				return '\\u' + g1;
			})
		},

		canHandle (txt) {
			return rgx_codePoint.test(txt)
		}
	};

	var rgx_codePoint = /\\x\{(\w{1,4})\}/g
}());