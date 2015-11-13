var AtomicGroup = {

	transform (node) {
		node.isAtomic = true;
		node.isNative = false;

		var child = node.firstChild;
		child.textContent = child.textContent.substring(2);
	},

	canHandle (txt) {
		return txt.charCodeAt(1) === 62 /*>*/;
	}
};