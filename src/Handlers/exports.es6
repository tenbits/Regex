var Handlers;

(function () {

	// import JsNoneCapturedGroup.es6
	// import AtomicGroup.es6
	// import NamedGroup.es6
	// import NamedBackreference.es6
	// import CommentGroup.es6
	// import LookbehindGroup.es6

	var GroupHandlers = [
		CommentGroup,
		JsNoneCapturedGroup,
		NamedGroup,
		AtomicGroup,
		LookbehindGroup
	];
	var LiteralHandlers = [

	];
	var AfterIndexed = [
		NamedBackreference
	];

	Handlers = {
		get (node) {
			return getGroupHandler(node) || getLiteralHandler(node, LiteralHandlers);
		},

		afterIndexed (root) {
			walk(root, AfterIndexed);
		}
	};

	function walk(root, handlers) {
		visitor_walk(root, function(node) {
			var Handler = getLiteralHandler(node, handlers);
			if (Handler == null) {
				return;
			}
			if (Handler.transform) {
				return Handler.transform(node, root);
			}
			if (Handler.create) {
				el = Handler.create(node, root);
				return transformer_replaceNode(node, el);
			}
		});
	}

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

	function getLiteralHandler(node, handlers) {
		if (node.type !== Node.LITERAL) {
			return null;
		}
		var txt = node.textContent,
			imax = handlers.length,
			i = -1;
		while ( ++i < imax ) {
			var Handler = handlers[i];
			if (Handler.canHandle(txt)) {
				return Handler;
			}
		}
		return null;
	}

}());
