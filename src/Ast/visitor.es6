var visitor_firstLiteral,
	visitor_flattern,
	visitor_walk,
	visitor_walkEx,
	visitor_walkByType,
	visitor_walkUp,
	visitor_getBlocks;

(function(){
	visitor_firstLiteral = function(node) {
		var first = node.firstChild;
		return first == null || first.type !== Node.LITERAL
			? null
			: first.textContent;
	};

	visitor_flattern = function (root) {
		var arr = [];
		walk(walk_DOWN, root, x => arr.push(x));
		return arr;
	};

	visitor_walk = function (root, fn) {
		walk(walk_DOWN, root, fn);
	};
	visitor_walkByType = function(root, type, fn) {
		walk(walk_DOWN, root, x => {
			if (x.type === type) {
				return fn(x);
			}
		});
	};
	visitor_walkUp = function(root, fn) {
		walk(walk_UP, root, fn);
	};

	visitor_walkEx = function(root, fn) {
		walkEx(root, fn);
	};

	var walk_UP = 1,
		walk_DOWN = 2;
	function walk(direction, node, fn) {
		var el = node.firstChild, next
		while(el != null) {
			if (direction === walk_DOWN) {
				next = fn(el);
				walk(direction, next || el, fn);
			}
			else {
				walk(direction, el, fn);
				next = fn(el);
			}

			el = (next || el).nextSibling;
		}
	}

	function walkEx(node, fn) {
		var el = node.firstChild, mode;
		while( el != null ) {
			mode = fn(el);
			if (mode != null) {
				if (mode.cursor) {
					el = mode.cursor;
					continue;
				}
				if (mode.deep === false) {
					el = el.nextSibling;
					continue;
				}
			}
			walkEx(el, fn);
			el = el.nextSibling;
		}
	}

}());