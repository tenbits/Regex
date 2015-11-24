var AtomicGroup = {

	//transform (node) {
	//	node.isAtomic = true;
	//	node.isNative = false;
	//
	//	var child = node.firstChild;
	//	child.textContent = child.textContent.substring(2);
	//},

	transform (node) {
		node.isCaptured = false;
		var child = node.firstChild;
		child.textContent = child.textContent.substring(2);
	},

	canHandle (txt) {
		return txt.charCodeAt(1) === 62 /*>*/;
	}
};