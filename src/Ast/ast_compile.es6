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
				continue;
			}
			el = combineNodes(el) || el;
			if (hasAlternation === true) {
				//continue;
			}
			if (canBeJoined(el, startEl) === true) {
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

			joinNodesInLiteral(startEl, endEl);
			startEl = null;
		}

		if (hasCustom === false && node.isNative !== false && node !== root) {
			return joinSingleNodeInLiteral(node);
		}
		if (startEl != null) {
			joinNodesInLiteral(startEl, null);
		}
		return null;
	}

	function canBeJoined (node, startNode) {
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

	// [start, end)
	function joinNodesInLiteral(startEl, endEl) {
		var literal = new Node.Literal();
		dom_insertBefore(startEl, literal);

		var str = '', el = startEl;
		while(el !== endEl) {
			str += el.toString();
			if (el.type === Node.GROUP && literal.groupNum == null) {
				literal.groupNum = el.groupNum;
			}

			dom_removeChild(el);
			el = literal.nextSibling;
		}
		literal.textContent = str;
		literal.flags = startEl.flags || (startEl.firstChild && startEl.firstChild.flags);
		return literal;
	}

	function joinSingleNodeInLiteral(node) {
		var literal = new Node.Literal();
		literal.textContent = node.toString();
		literal.flags = node.flags || (node.firstChild && node.firstChild.flags);
		literal.groupNum = node.groupNum;

		dom_insertBefore(node, literal);
		dom_removeChild(node);
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