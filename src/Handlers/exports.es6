var Handlers;
(function () {
	Handlers = {
		define (root) {
			walk(root, Initial);
		},
		beforeIndexed (root) {
			walk(root, BeforeIndexed);
		},
		afterIndexed (root) {
			walk(root, AfterIndexed);
		}
	};

	// import Groups/CommentGroup.es6
	// import Groups/NoneCapturedGroup.es6
	// import Groups/AtomicGroup.es6
	// import Groups/NamedGroup.es6
	// import Groups/LookbehindGroup.es6

	// import Possessive.es6
	// import Literals/NamedBackreference.es6
	// import Literals/Subexpressions.es6
	// import Literals/UnicodeCodePoint.es6
	// import Literals/UnicodeCategory.es6

	var handler_GROUP = 0,
		handler_LITERAL = 1,
		handler_NODE = 2;

	var Initial = [
		[handler_GROUP, CommentGroup],
		[handler_GROUP, NoneCapturedGroup],
		[handler_GROUP, NamedGroup],
		[handler_GROUP, AtomicGroup],
		[handler_GROUP, LookbehindGroup],
		[handler_NODE, PossessiveGroup],
		[handler_NODE, PossessiveLiteral],
		[handler_LITERAL, UnicodeCodePoint],
		[handler_LITERAL, UnicodeCategory]
	];

	var BeforeIndexed = [
		[handler_LITERAL, Subexpressions]
	];

	var AfterIndexed = [
		[handler_LITERAL, NamedBackreference]
	];


	function walk(root, handlers) {
		visitor_walk(root, function(node) {
			var Handler = getHandler(node, root, handlers);
			if (Handler == null) {
				return;
			}
			if (Handler.transform) {
				return Handler.transform(node, root);
			}
			if (Handler.create) {
				var el = Handler.create(node, root);
				return transformer_replaceNode(node, el);
			}
			if (Handler.process) {
				return Handler.process(node, root);
			}
		});
	}

	function getHandler(node, root, handlers) {
		var imax = handlers.length,
			i = -1,
			type, Handler
		while( ++i < imax ) {
			[type, Handler] = handlers[i];

			var canHandle = CheckFns[type](node, root, Handler);
			if (canHandle === true) {
				return Handler;
			}
		}
	}

	var CheckFns = {
		[handler_GROUP] (node, root, Handler) {
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
			return Handler.canHandle(txt);
		},
		[handler_LITERAL] (node, root, Handler) {
			if (node.type !== Node.LITERAL) {
				return null;
			}
			return Handler.canHandle(node.textContent);
		},
		[handler_NODE] (node, root, Handler) {
			return Handler.canHandle(node, root);
		}
	};
}());
