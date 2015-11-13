var Handlers;

(function () {

	// import JsNoneCapturedGroup.es6
	// import AtomicGroup.es6
	// import NamedGroup.es6

	var GroupHandlers = [
		JsNoneCapturedGroup,
		NamedGroup,
		AtomicGroup
	];

	Handlers = {
		get (node) {
			return getGroupHandler(node);
		}
	};

	function getGroupHandler(node) {
		if (node.type !== Node.GROUP) {
			return null;
		}
		var child = node.firstChild;
		if (child.type !== Node.LITERAL) {
			return null;
		}
		var txt = child.textContent;
		if (txt.charCodeAt(0) !== 63 /*?*/) {
			return null;
		}
		var imax = GroupHandlers.length,
			i = -1;
		while ( ++i < imax ) {
			var Handler = GroupHandlers[i];
			if (Handler.canHandle(txt)) {
				return Handler;
			}
		}
		return null;
	}

}());
