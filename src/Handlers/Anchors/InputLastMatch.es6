var InputLastMatch = {

	transform (node, root) {
		root.flags.y = true;
		node.textContent = node.textContent.substring(2);
	},

	canHandle (txt) {
		// \G
		return txt.charCodeAt(0) === 92 &&
			txt.charCodeAt(1) === 71;
	}
};
