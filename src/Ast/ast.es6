var ast_combineNatives,
	ast_compileNatives,
	ast_indexGroups,
	ast_indexShadowedGroups,
	ast_createBlocks,
	ast_resolveBacktracks;

(function() {
	ast_createBlocks = function(root){
		visitor_walkByType(root, Node.OR, node => {
			var blocks = new Node.Blocks,
				block = new Node.Block(),
				parent = node.parentNode;

			var el = parent.firstChild;
			while (el != null) {
				parent.removeChild(el);
				if (el.type === Node.OR) {
					blocks.appendChild(block);
					block = new Node.Block();
				} else {
					block.appendChild(el);
				}
				el = parent.firstChild;
			}
			blocks.appendChild(block);
			parent.appendChild(blocks);
			return blocks;
		});
	};

	ast_resolveBacktracks = function(root) {
		visitor_walkUp(root, node => {
			if (node.isBacktracked === false) {
				return;
			}
			if (node.type === Node.BLOCKS) {
				if (node.parentNode.isAtomic !== true) {
					node.isBacktracked = node.getLength() > 1;
				}
			}
			if (node.isBacktracked === true) {
				if (node.parentNode.isBacktracked !== false)
					node.parentNode.isBacktracked = true;
			}
		});
	};

	ast_combineNatives = function (root) {
		resolveNatives(root);
		debugger;
		combineNatives(root);
	};
	ast_compileNatives = function(root) {
		return compileNatives(root);
	};
	ast_indexGroups = function(root) {
		var groupNum = 0;
		visitor_walkByType(root, Node.GROUP, node => {
			if (node.isCaptured === false) {
				return;
			}
			node.groupNum = ++groupNum;
			if (node.name != null) {

				if (root.groups == null)
					root.groups = {};

				root.groups[node.name] = node.groupNum;
			}
		});
	};

	ast_indexShadowedGroups = function(root) {
		var groupNum = 0, shadowGroupNum = 0;
		root.groupNumMapping = {};
		visitor_walkByType(root, Node.GROUP, node => {
			if (node.isCaptured === false) {
				return;
			}
			node.shadowGroupNum = ++shadowGroupNum;
			if (node.isShadowGroup !== true) {
				node.groupNum = ++groupNum;
				root.groupNumMapping[node.groupNum] = shadowGroupNum;
			}


			if (node.name != null) {
				if (root.groups == null) {
					root.groups = {};
				}
				root.groups[node.name] = node.groupNum;
			}
		});
	};

	function resolveNatives(root) {

		visitor_walkUp(root, visit);
		visit(root);

		function visit(node) {
			if (node.isNative === false) {
				return;
			}
			var el = node.firstChild;
			while(el != null) {
				if (el.isNative === false) {
					node.isNative = false;
					break;
				}
				el = el.nextSibling;
			}
		}
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

		var hasBlocks, start, el;
		if (node !== root) {
			for (el = node.firstChild; el != null; el = el.nextSibling) {
				if (el.type === Node.OR) {
					hasBlocks = true;
					break;
				}
			}
		}
		for (var el = node.firstChild; el != null; el = el.nextSibling) {
			if (el.type === Node.OR) {
				continue;
			}
			combineNodes(el);
			if (hasBlocks === true) {
				continue;
			}
			if (el.isNative === false) {
				start = null;
				continue;
			}
			if (el.firstChild !== el.lastChild) {
				start = null;
				continue;
			}
			if (el.firstChild && flags_equals(el.firstChild.flags, el.flags) === false) {
				start = null;
				continue;
			}
			if (start == null) {
				start = el;
				continue;
			}
			if (flags_equals(start.flags, el.flags)) {
				continue;
			}
			if (el.previousSibling.type === Node.OR) {
				start = el;
				continue;
			}
			join(start, el);
			start = el;
		}
		if (start != null) {
			join(start, null);
		}

		// [start, end)
		function join(startEl, endEl) {
			var literal = new Node.Literal();
			dom_insertBefore(startEl, literal);

			var str = '', cursor = startEl;
			while(cursor !== endEl) {
				str += cursor.toString();
				if (cursor.type === Node.GROUP && literal.groupNum == null) {
					literal.groupNum = cursor.groupNum;
				}

				dom_removeChild(cursor);
				cursor = literal.nextSibling;
			}


			literal.textContent = str;
			literal.flags = startEl.flags;
			return literal;
		}
	}

	function combine_flagsAreEqual (node) {
		var el = node.parentNode.firstChild;
		var flags = el.flags;
		while((el = el.nextSibling) != null) {
			if (el.flags != flags) {
				return false;
			}
			flags = el.flags;
		}
		return true;
	};
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