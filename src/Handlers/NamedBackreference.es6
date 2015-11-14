var NamedBackreference;
(function(){

	NamedBackreference = {
		transform (node, root) {
			node.textContent = node.textContent.replace(rgx, (full, g1, name) => {
				var index = root.groups[name];
				return '\\' + index;
			})
		},
		canHandle (txt) {
			return rgx.test(txt);
		}
	};

	var rgx = /\\k('|<)(\w+)('|>)/g

}());