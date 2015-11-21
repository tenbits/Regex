var InputStart,
	InputEnd,
	InputEndWithNewLine;
(function(){

	var ANCHOR_START = '\\A',
		ANCHOR_END = '\\z',
		ANCHOR_END_WITH_NEWLINE = '\\Z';

	InputStart = create(ANCHOR_START, (node, root) => {
		node.textContent = '^' + node.textContent;
	});
	InputEnd = create(ANCHOR_END, (node, root) => {
		node.textContent = node.textContent + '$';
	});
	InputEndWithNewLine = create(ANCHOR_END_WITH_NEWLINE, (node, root) => {
		node.textContent = node.textContent + '\n?$';
		root.addTransformer(normalize_lastNewLine);
	});

	function create (ANCHOR, fn) {
		return {
			transform (node, root) {
				node.textContent = remove(node.textContent, ANCHOR);
				root.flags = {
					g: false,
					m: false
				};
				fn(node, root);
			},
			canHandle (txt) {
				var i = txt.indexOf(ANCHOR);
				if (i === -1) {
					return false;
				}

				return str_isEscaped(txt, i) === false;
			}
		}
	};

	function remove(str, ANCHOR){
		var i = -1;
		while((i = str.indexOf(ANCHOR, i)) != -1) {
			if (str_isEscaped(str, i)) {
				i++;
				continue;
			}
			str = str_remove(str, i, i + ANCHOR.length);
		}
		return str;
	}

	function normalize_lastNewLine(root, match) {
		var val = match.value;
		if (val[val.length - 1] !== '\n') {
			return;
		}
		match.value = val.slice(0, -1);
	}
}());