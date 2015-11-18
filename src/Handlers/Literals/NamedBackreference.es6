var NamedBackreference;
(function(){

	NamedBackreference = {
		transform (node, root) {
			var txt = node.textContent;
			txt = interpolate(root, txt, "\\k<", ">");
			txt = interpolate(root, txt, "\\k'", "'");
			node.textContent = txt;
		},
		canHandle (txt) {
			return rgx.test(txt);
		}
	};

	var rgx = /\\k('|<)(\w+)('|>)/g

	function interpolate(root, str_, START, END) {
		var str = str_,
			i = 0;
		while((i = str.indexOf(START, i)) !== -1) {
			if (str_isEscaped(str, i)) {
				i++;
				continue;
			}
			var end = str.indexOf(END, i + START.length);
			var name = str.substring(i + START.length, end);

			var groupNum = root.groups[name];
			if (groupNum == null) {
				throw Error('Group not found: ' + name);
			}

			str = str_replaceByIndex(str, i, end + 1, '\\' + groupNum);
			i += name.length;
		}
		return str;
	}

}());