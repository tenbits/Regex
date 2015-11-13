var visitor_firstLiteral,
	visitor_flattern,
	visitor_walk,
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
				fn(x);
			}
		});
	};
	visitor_walkUp = function(root, fn) {
		walk(walk_UP, root, fn);
	};

	var walk_UP = 1,
		walk_DOWN = 2;
	function walk(direction, node, fn) {
		var el = node.firstChild, next
		while(el != null) {
			if (direction === walk_DOWN) {
				next = fn(el);
				if (next == null) {
					walk(direction, el, fn);
				}
			}
			else {
				walk(direction, el, fn);
				next = fn(el);
			}

			el = (next || el).nextSibling;
		}
	}

}());