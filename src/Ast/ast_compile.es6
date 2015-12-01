var ast_combineNatives,
	ast_compileNatives;

(function() {

	ast_combineNatives = function (root) {
		resolveNatives(root);
		combineNatives(root);
	};
	ast_compileNatives = function(root) {
		return compileNatives(root);
	};

	function resolveNatives(root) {

		visitor_walkUp(root, node => {
			if (node.isNative === false) {
				node.parentNode.isNative = false;
			}
		});
	}

	function combineNatives(root) {
		if (root.isNative) {
			var literal = new Node.Literal(root.toString());
			root.empty();
			root.appendChild(literal);
			return;
		}
		combineNodes(root, root);
	}

	function combineNodes(node, root) {
		if (node.type === Node.LITERAL || node.type === Node.OR) {
			return node;
		}
		var startEl, el, hasCustom = false, hasAlternation = false;
		if (node !== root && node.parentNode.firstChild !== node && node.parentNode.lastChild !== node) {
			for (el = node.firstChild; el != null; el = el.nextSibling) {
				if (el.type === Node.OR) {
					hasAlternation = true;
					continue;
				}
				if (el.checkNative() === false) {
					hasCustom = true;
				}
			}
		}
		if (hasAlternation && hasCustom === false) {
			for (el = node.nextSibling; el != null; el = el.nextSibling) {
				if (el.checkNative() === false) {
					hasCustom = true;
					break;
				}
			}
			if (hasCustom === false) {
				var el = node.parentNode;
				for (el = node.nextSibling; el != null; el = el.nextSibling) {
					if (el.checkNative() === false) {
						hasCustom = true;
						break;
					}
				}
			}
			if (hasCustom === false) {
				hasAlternation = false;
			}
		}

		for (el = node.firstChild; el != null; el = el.nextSibling) {
			if (el.type === Node.OR) {
				hasAlternation = true;
			}
			el = combineNodes(el) || el;
			if (el.type !== Node.OR && canBeJoined(el, startEl) === true) {
				if (startEl == null) {
					startEl = el;
				}
				continue;
			}
			hasCustom = true;

			if (startEl == null) {
				continue;
			}
			var endEl = el;
			if (endEl.previousSibling.type === Node.OR) {
				endEl = endEl.previousSibling;
			}

			toLiteral(startEl, el);
			startEl = null;
		}

		if (hasCustom === false && hasAlternation === false && node.checkNative() === true && node !== root) {
			return toLiteral(node, void 0);
		}
		if (startEl != null) {
			toLiteral(startEl, null);
		}
		return null;
	}

	function canBeJoined (node, startNode) {
		return node.checkNative();

		if (node.isNative === false) {
			return false;
		}
		if (node.firstChild !== node.lastChild) {
			return false;
		}
		if (node.firstChild != null) {
			if (node.firstChild !== node.lastChild) {
				return false;
			}
			if (flags_equals(node.firstChild.flags, node.flags) === false) {
				return false;
			}
		}
		if (startNode != null && flags_equals(startNode.flags, node.flags) === false) {
			return false;
		}
		return true;
	}


	// [start, end?)
	function toLiteral(startEl, endEl) {
		if (startEl.type === Node.LITERAL && (endEl === void 0 || startEl.nextSibling == null)) {
			return startEl;
		}
		var literal = new Node.Literal();
		dom_insertBefore(startEl, literal);

		var str = '',
			el = startEl,
			end = endEl === void 0 ? el.nextSibling : endEl;
		while(el !== end) {
			str += el.toString();
			if (el.groupNum != null && (literal.groupNum == null || literal.groupNum > el.groupNum)) {
				literal.groupNum = el.groupNum;
			}
			dom_removeChild(el);
			el = literal.nextSibling;
		}
		if (str === '?=') {
			var next = literal.nextSibling;
			dom_removeChild(literal);
			return next;
		}
		literal.textContent = str;
		literal.flags = startEl.flags || (startEl.firstChild && startEl.firstChild.flags);
		return literal;
	}

	function compileNatives(node) {
		visitor_walk(node, function(node) {
			if (node.type !== Node.LITERAL) {
				if (typeof node.compile === 'function') {
					node.compile();
				}
				return;
			}
			var rgx = new Node.RegexNode(node.textContent, node);
			return transformer_replaceNode(node, rgx, false);
		});
	}

}());