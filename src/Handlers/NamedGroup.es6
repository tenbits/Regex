var NamedGroup;
(function(){

	NamedGroup = {

		transform (node) {

			var child = node.firstChild,
				str = child.textContent,
				match = rgx.exec(str)
				;

			child.textContent = str.replace(rgx, '');
			node.name = match[2] || match[3];
		},

		canHandle (txt) {
			return rgx.test(txt);
		}
	};

	var rgx = /^\?('(\w+)'|<(\w+)>)/;
}());
